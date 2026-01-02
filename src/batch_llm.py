"""
Batch LLM helper for Pukaist Engine.

This module prepares JSONL requests for an OpenAI-compatible Batch API
and ingests summaries back into the local index once they are available.

Design:
- "Prepare" mode finds docs with no summary (`summary IS NULL`), reads their
  staged text, redacts PII, and writes one JSON object per line in JSONL:
    {"custom_id": "doc-<id>", "method": "POST", "url": "/v1/chat/completions", "body": {...}}
  The body matches the chat completions payload used by the synchronous path.
- "Ingest" mode expects a JSONL file where each line has:
    {"doc_id": <int>, "summary": "<text>"}
  i.e., a sanitized mapping from document IDs to summaries (for example,
  transformed from the provider's batch output). It updates the search index
  and appends a short note to the theme notebook.

This keeps external batch processing explicit and auditable: raw provider
outputs can be stored separately and reviewed before being converted into the
simple `{doc_id, summary}` form that this ingestor consumes.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Optional

from .config import Settings
from . import search_index
from .pii import redact


def _workspace_batches_dir(settings: Settings) -> Path:
    batches_dir = settings.workspace / "batches"
    batches_dir.mkdir(parents=True, exist_ok=True)
    return batches_dir


def prepare_batch_jsonl(limit: int = 100) -> Optional[Path]:
    """
    Generate a JSONL file with chat completion requests for docs lacking summaries.

    Returns the path to the JSONL file, or None if there was nothing to do.
    """
    settings = Settings.load()
    search_index.init(settings.index_path)
    rows = search_index.list_pending_summaries(settings.index_path, limit=limit)
    if not rows:
        return None

    batches_dir = _workspace_batches_dir(settings)
    ts = int(time.time())
    out_path = batches_dir / f"chat_batch_{ts}.jsonl"

    with out_path.open("w", encoding="utf-8") as fh:
        for row in rows:
            doc_id = row["id"]
            file_path = Path(row["file_path"])
            try:
                text = file_path.read_text(errors="ignore")
            except FileNotFoundError:
                # Skip docs whose staged text is missing.
                continue
            redacted = redact(text)
            body = {
                "model": settings.llm_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "Summarize the document in 3 sentences, factual and concise.",
                    },
                    {"role": "user", "content": redacted[: settings.llm_input_max_chars]},
                ],
                "temperature": settings.llm_temperature,
                "max_tokens": settings.llm_max_tokens,
            }
            record = {
                "custom_id": f"doc-{doc_id}",
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": body,
            }
            fh.write(json.dumps(record, separators=(",", ":")))
            fh.write("\n")

    return out_path


def ingest_summaries(jsonl_path: Path) -> int:
    """
    Ingest summaries from a JSONL file of the form:
      {"doc_id": 123, "summary": "..."}

    Returns the number of documents updated.
    """
    settings = Settings.load()
    search_index.init(settings.index_path)
    updated = 0

    with jsonl_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            doc_id = obj.get("doc_id")
            summary = obj.get("summary")
            if not isinstance(doc_id, int) or not isinstance(summary, str):
                continue
            summary = summary.strip()
            if not summary:
                continue
            search_index.update_summary(settings.index_path, doc_id, summary)
            _append_summary_to_notebook(settings, doc_id, summary)
            updated += 1

    return updated


def _append_summary_to_notebook(settings: Settings, doc_id: int, summary: str) -> None:
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        return
    theme = row["theme"] or "general"
    title = row["title"] or Path(row["file_path"]).name
    md_path = settings.refined_dir / f"Refined_{theme}.md"
    settings.refined_dir.mkdir(parents=True, exist_ok=True)
    with md_path.open("a", encoding="utf-8") as fh:
        fh.write(f"\n\n### Updated summary for doc {doc_id} — {title}\n")
        fh.write(f"\n**Batch LLM summary:** {summary}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pukaist batch LLM helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    prep = subparsers.add_parser("prepare", help="prepare JSONL for docs without summaries")
    prep.add_argument("--limit", type=int, default=100, help="max docs to include")

    ingest = subparsers.add_parser("ingest", help="ingest summaries from a JSONL mapping")
    ingest.add_argument("file", type=str, help="path to JSONL file with {doc_id, summary} lines")

    args = parser.parse_args()

    if args.command == "prepare":
        out = prepare_batch_jsonl(limit=args.limit)
        if out is None:
            print("No docs with pending summaries found.")
        else:
            print(f"Wrote batch JSONL to {out}")
    elif args.command == "ingest":
        path = Path(args.file)
        count = ingest_summaries(path)
        print(f"Ingested summaries for {count} documents.")


if __name__ == "__main__":
    main()

