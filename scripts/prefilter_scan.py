"""
Prefilter scanner for staged/text files.

Uses the same prefilter logic as the worker to decide whether a document
would be sent to the LLM. Intended for local analysis to understand
potential LLM cost before processing large batches.

Usage:
  PYTHONPATH=. python scripts/prefilter_scan.py --staging 99_Working_Files/Evidence_Staging
"""

from __future__ import annotations

import argparse
from pathlib import Path

from src.config import Settings
from src.prefilter import should_use_llm
from src import search_index  # type: ignore


def scan(staging_dir: Path) -> dict:
    settings = Settings.load()
    search_index.init(settings.index_path)
    staging_dir = staging_dir or settings.staging_dir
    staging_dir.mkdir(parents=True, exist_ok=True)

    summary = {"llm": 0, "skipped": 0, "files": []}

    for path in staging_dir.glob("*.txt"):
        text = path.read_text(errors="ignore")
        decision = should_use_llm(text, {"file_path": str(path)}, settings)
        summary["files"].append({"file": str(path), "use_llm": decision})
        if decision:
            summary["llm"] += 1
        else:
            summary["skipped"] += 1
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Prefilter scan for staged text files.")
    parser.add_argument("--staging", type=str, default=None, help="Path to staging dir (defaults to configured staging dir).")
    args = parser.parse_args()
    staging_dir = Path(args.staging) if args.staging else None
    result = scan(staging_dir or Settings.load().staging_dir)
    print(f"LLM candidates: {result['llm']}, skipped: {result['skipped']}")
    for item in result["files"]:
        print(f"{'[LLM]' if item['use_llm'] else '[SKIP]'} {item['file']}")


if __name__ == "__main__":
    main()

