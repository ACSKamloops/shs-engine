from __future__ import annotations

import time
import logging
from pathlib import Path
from tempfile import NamedTemporaryFile

import requests
import hashlib
import hmac
import time as _time
import json
import os
import shlex
import subprocess
import threading
import queue as _queue
from typing import Any
import shutil

from .config import Settings
from . import queue_db
from . import search_index
from . import job_store
from . import codex_autorun
from .metadata import infer_metadata
from .validate import validate_record, summarize_errors
from .geo import extract_coords
from .metrics import metrics
from .llm_adapter import get_llm_adapter
from .pii import redact
from .insights import derive_insights
from .prefilter import should_use_llm
from .embeddings import EmbeddingsClient
from .search_index_hybrid import store_embedding
from .place_extract import extract_place_suggestions
from .relevancy import RelevancyScorer
from . import geo_context
from .text_extraction import process_task as _process_task_impl
from .upload_triggers import (
    reap_upload_macro_procs as _reap_upload_macro_procs,
    maybe_trigger_upload_macros as _maybe_trigger_upload_macros,
)


WEBHOOK_HTTP_TIMEOUT = float(os.getenv("PUKAIST_WEBHOOK_HTTP_TIMEOUT_SEC", "5.0"))

settings = Settings.load()
queue_db.init(settings.queue_db)
search_index.init(settings.index_path)
job_store.init(settings.queue_db)
logger = logging.getLogger("pukaist.worker")
llm = get_llm_adapter(
    settings.llm_provider,
    settings.llm_model,
    settings.llm_offline,
    settings.llm_input_max_chars,
    settings.llm_max_tokens,
    settings.llm_temperature,
    settings.llm_forensic_temperature,
)
relevancy_scorer = RelevancyScorer(settings)

# ---------------------------------------------------------------------------
# Upload trigger handling has been moved to src/upload_triggers.py
# Functions imported: _reap_upload_macro_procs, _maybe_trigger_upload_macros
# ---------------------------------------------------------------------------


def _process_task(file_path: Path) -> tuple[Path, str, str, str | None]:
    """
    Extracts text and writes a staged .txt file (truncated to char limit).
    Returns (staged_path, text, source, note).
    """
    return _process_task_impl(file_path, settings)


def _should_move_processed() -> bool:
    return os.getenv("PUKAIST_MOVE_PROCESSED", "false").lower() in {"1", "true", "yes", "on"}


def _resolve_processed_dir(file_path: Path) -> Path:
    env_dir = os.getenv("PUKAIST_PROCESSED_DIR")
    if env_dir:
        target = Path(env_dir)
        if not target.is_absolute():
            return settings.workspace / target
        return target
    return file_path.parent / "Processed"


def _unique_processed_path(target_dir: Path, file_path: Path) -> Path:
    base = f"{file_path.stem}_processed"
    candidate = target_dir / f"{base}{file_path.suffix}"
    if not candidate.exists():
        return candidate
    idx = 1
    while True:
        candidate = target_dir / f"{base}_{idx}{file_path.suffix}"
        if not candidate.exists():
            return candidate
        idx += 1


def _maybe_move_processed_file(
    task_id: int,
    file_path: Path,
    doc_id: int,
    tenant_id: str | None,
) -> Path:
    if not _should_move_processed():
        return file_path
    if not file_path.exists():
        return file_path
    if file_path.name.endswith(f"_processed{file_path.suffix}") or file_path.parent.name.lower() == "processed":
        return file_path
    target_dir = _resolve_processed_dir(file_path)
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = _unique_processed_path(target_dir, file_path)
    try:
        moved = Path(shutil.move(str(file_path), str(target_path)))
    except Exception:
        logger.exception("failed to move processed file for task %s: %s", task_id, file_path)
        return file_path
    try:
        queue_db.update_task_path(settings.queue_db, task_id, moved, tenant_id=tenant_id)
    except Exception:
        logger.exception("failed to update task path for %s", task_id)
    try:
        search_index.update_doc_path(settings.index_path, doc_id, moved, tenant_id=tenant_id)
    except Exception:
        logger.exception("failed to update doc path for %s", doc_id)
    logger.info("moved processed file %s -> %s", file_path.name, moved)
    return moved


# Text extraction logic has been moved to src/text_extraction.py
# The _extract_text function is imported at the top of this file


def run_once() -> bool:
    _reap_upload_macro_procs(settings)
    tenant_filter = settings.worker_tenant_id or settings.default_tenant
    row = queue_db.lease_one(
        settings.queue_db,
        tenant_id=tenant_filter,
        allow_unscoped=settings.worker_allow_unscoped,
    )
    if not row:
        return False
    task_id = row["id"]
    file_path = Path(row["file_path"])
    job_id = row["job_id"]
    tenant_id = row["tenant_id"]
    intent = None
    if row["intent_json"]:
        try:
            intent = json.loads(row["intent_json"])
        except Exception:
            intent = None
    # Task-level overrides
    effective_llm_mode = (intent or {}).get("llm_mode") or settings.llm_mode
    summary_enabled = settings.summary_enabled if intent is None or "summary_enabled" not in intent else bool(intent["summary_enabled"])
    metadata = None
    start = time.time()
    try:
        if job_id:
            job_store.set_status(settings.queue_db, job_id, "processing", tenant_id=tenant_id)
        staged_path, text, ocr_source, ocr_note = _process_task(file_path)
        try:
            file_bytes = file_path.read_bytes()
        except Exception:
            file_bytes = None
        metadata = infer_metadata(file_path, row["theme"], text, content_bytes=file_bytes)
        if ocr_source:
            metadata["source"] = ocr_source
        if ocr_note:
            metadata["note"] = ocr_note
        # Project-specific temporal context (soft gate)
        if settings.project_config and getattr(settings.project_config, "period", None):
            period_cfg = settings.project_config.period or {}
            start_year = period_cfg.get("start_year")
            end_year = period_cfg.get("end_year")
            year = None
            inferred_date = metadata.get("inferred_date")
            if isinstance(inferred_date, str) and len(inferred_date) >= 4 and inferred_date[:4].isdigit():
                year = int(inferred_date[:4])
            within_period = True
            if start_year and str(start_year).isdigit() and year is not None and year < int(start_year):
                within_period = False
            if end_year and str(end_year).isdigit() and year is not None and year > int(end_year):
                within_period = False
            metadata["period"] = {
                "year": year,
                "within_project_period": within_period,
                "project_start_year": start_year,
                "project_end_year": end_year,
            }
        errors = validate_record(text, metadata)
        if errors:
            raise ValueError(f"validation failed: {summarize_errors(errors)}")
        summary = None
        if summary_enabled and effective_llm_mode == "sync" and should_use_llm(text, metadata, settings, overrides=intent or {}):
            llm_input = redact(text)
            summary = llm.summarize(llm_input)
        forensic = None
        if settings.llm_forensic_enabled and not settings.llm_offline and effective_llm_mode == "sync":
            try:
                llm_input_for_forensic = redact(text)
                forensic = llm.analyze_forensic(llm_input_for_forensic, metadata=metadata)
            except Exception:
                logger.exception("forensic extraction failed; continuing without it")
        record_type = metadata.get("doc_type")
        breach_category = None
        reliability = None
        key_quote = None
        privileged = None
        entities_json = None
        if isinstance(forensic, dict):
            record_type = forensic.get("record_type") or record_type
            breach_category = forensic.get("breach_category")
            reliability = forensic.get("reliability")
            key_quote = forensic.get("key_quote")
            if "privileged" in forensic:
                privileged = bool(forensic.get("privileged"))
            if isinstance(forensic.get("entities"), dict):
                try:
                    entities_json = json.dumps(forensic.get("entities"))
                except Exception:
                    entities_json = None
        doc_id = search_index.add_document(
            settings.index_path,
            task_id=task_id,
            file_path=file_path,
            stable_id=metadata.get("stable_id"),
            provenance=metadata.get("provenance"),
            sha256=metadata.get("sha256"),
            theme=row["theme"],
            title=metadata["title"],
            summary=summary,
            doc_type=record_type,
            inferred_date=metadata.get("inferred_date"),
            breach_category=breach_category,
            reliability=reliability,
            key_quote=key_quote,
            privileged=privileged,
            entities_json=entities_json,
            content=text,
            tenant_id=tenant_id,
        )
        if settings.embeddings_enabled and settings.embeddings_model:
            try:
                emb_client = EmbeddingsClient(
                    provider=settings.embeddings_provider or settings.llm_provider,
                    model=settings.embeddings_model,
                )
                vecs = emb_client.embed([text[: settings.llm_input_max_chars]], input_type="document")
                if vecs:
                    store_embedding(settings.index_path, doc_id, tenant_id, vecs[0])
            except Exception:
                pass
        coords = extract_coords(text)
        place_suggestions = []
        if settings.place_suggest_enabled:
            place_suggestions = extract_place_suggestions(text, settings.place_gazetteer)
            for ps in place_suggestions:
                search_index.add_suggestion(
                    settings.index_path,
                    doc_id=doc_id,
                    task_id=task_id,
                    label=ps.name,
                    lat=ps.lat,
                    lon=ps.lon,
                    score=ps.score,
                    source=ps.source,
                    tenant_id=tenant_id,
                )
        insights = derive_insights(text, metadata, coords)
        if settings.llm_insights_enabled and not settings.llm_offline and settings.llm_mode == "sync":
            llm_input_for_insights = redact(text)
            llm_structured = llm.extract_insights(llm_input_for_insights)
            if isinstance(llm_structured, dict):
                insights["llm"] = llm_structured
        relevancy = None
        try:
            rel_res = relevancy_scorer.score(text, row["theme"])
            relevancy = rel_res.to_dict() if rel_res else None
        except Exception:
            logger.exception("relevancy scoring failed; continuing without score")
        search_index.add_geo_points(
            settings.index_path,
            doc_id=doc_id,
            task_id=task_id,
            theme=row["theme"],
            title=metadata["title"],
            coords=coords,
            tenant_id=tenant_id,
        )
        geo_tags = None
        try:
            ctx = geo_context.build_geo_context(settings.index_path, doc_id, tenant_id=tenant_id)
            scope = None
            # If a project config is loaded, use its mission/geo settings
            # to scope which AOIs and offices contribute to tags.
            if settings.project_config:
                pc = settings.project_config
                scope = {
                    "aoi_themes": pc.aoi_themes or [],
                    "aoi_codes": pc.aoi_codes or [],
                    "aoi_names": pc.aoi_names or [],
                    "band_numbers": pc.band_numbers or [],
                }
            geo_tags = geo_context.derive_geo_tags_from_context(ctx, scope=scope)
        except Exception:
            logger.exception("geo tag derivation failed; continuing without geo tags")
        _emit_outputs(
            task_id,
            file_path,
            row["theme"],
            text,
            metadata,
            summary,
            insights,
            relevancy,
            geo_tags,
            forensic,
        )
        moved_path = _maybe_move_processed_file(task_id, file_path, doc_id, tenant_id)
        if moved_path != file_path:
            file_path = moved_path
        queue_db.complete(settings.queue_db, task_id, tenant_id=tenant_id)
        if job_id:
            job_store.set_status(settings.queue_db, job_id, "done", tenant_id=tenant_id)
            _send_callback(job_id, task_id, row["theme"], file_path, "done", None, metadata, tenant_id=tenant_id)
        try:
            if row.get("theme"):
                _maybe_trigger_upload_macros(str(row["theme"]), tenant_id, settings)
        except Exception:
            pass
        logger.info("completed task %s (%s)", task_id, file_path.name)
        metrics.inc("tasks_completed")
        metrics.observe("task_duration_sec", time.time() - start)
    except Exception as exc:  # noqa: BLE001
        queue_db.flag(settings.queue_db, task_id, str(exc), tenant_id=tenant_id)
        if job_id:
            job_store.set_status(settings.queue_db, job_id, "flagged", last_error=str(exc), tenant_id=tenant_id)
            _send_callback(job_id, task_id, row["theme"], file_path, "flagged", str(exc), metadata, tenant_id=tenant_id)
        logger.error("flagged task %s (%s): %s", task_id, file_path.name, exc)
        metrics.inc("tasks_flagged")
    return True


def main() -> None:
    settings.log_dir.mkdir(parents=True, exist_ok=True)
    log_file = settings.log_dir / "worker.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[logging.StreamHandler(), logging.FileHandler(log_file)],
    )
    logger.info("worker starting loop")
    if os.getenv("PUKAIST_CODEX_AUTORUN_DAEMON", "false").lower() in {"1", "true", "yes", "on"}:
        try:
            from .codex_autorun import start_autorun_thread

            start_autorun_thread(settings)
            logger.info("codex autorun daemon enabled")
        except Exception:
            logger.exception("failed to start codex autorun daemon")
    processed = 0
    while True:
        worked = run_once()
        if worked:
            processed += 1
            if settings.max_docs_per_run and processed >= settings.max_docs_per_run:
                logger.info("processed max_docs_per_run=%s, exiting", settings.max_docs_per_run)
                break
        else:
            time.sleep(settings.worker_interval)


def _send_callback(
    job_id: int,
    task_id: int,
    theme: str | None,
    file_path: Path,
    status: str,
    error: str | None,
    metadata: dict | None,
    error_summary: str | None = None,
    tenant_id: str | None = None,
) -> None:
    job = job_store.get_job(settings.queue_db, job_id, tenant_id=tenant_id)
    if not job or not job["callback_url"]:
        return
    timestamp = str(int(_time.time()))
    payload = {
        "job_id": job_id,
        "task_id": task_id,
        "status": status,
        "theme": theme,
        "file_path": str(file_path),
        "error": error,
        "error_summary": error_summary or error,
        "timestamp": timestamp,
        "doc_type": (metadata or {}).get("doc_type"),
        "inferred_date": (metadata or {}).get("inferred_date"),
        "title": (metadata or {}).get("title"),
        "doc_id": (metadata or {}).get("doc_id"),
    }
    headers = {}
    if settings.webhook_token:
        headers["X-Pukaist-Token"] = settings.webhook_token
        body = json.dumps(payload, separators=(",", ":"))
        signature = hmac.new(settings.webhook_token.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()
        headers["X-Pukaist-Signature"] = f"sha256={signature}"
        headers["Content-Type"] = "application/json"
    try:
        resp = requests.post(job["callback_url"], json=payload, headers=headers, timeout=WEBHOOK_HTTP_TIMEOUT)
        job_store.record_callback_status(
            settings.queue_db,
            job_id,
            f"{resp.status_code}",
        )
    except Exception as exc:  # noqa: BLE001
        job_store.record_callback_status(
            settings.queue_db,
            job_id,
            f"failed: {exc}",
        )


def _emit_outputs(
    task_id: int,
    file_path: Path,
    theme: str | None,
    content: str,
    metadata: dict,
    summary: str | None,
    insights: dict | None,
    relevancy: dict | None,
    geo_tags: dict | None,
    forensic: dict | None,
) -> None:
    # Write JSON artifact to staging
    staging_json = settings.staging_dir / f"{task_id}.json"
    staging_json.write_text(
        json.dumps(
            {
                "task_id": task_id,
                "file_path": str(file_path),
                "theme": theme,
                "metadata": metadata,
                "summary": summary,
                "insights": insights,
                "relevancy": relevancy,
                "geo_tags": geo_tags,
                "forensic": forensic,
                "content_preview": content[:1000],
            },
            indent=2,
        )
    )
    # Append markdown to theme notebook
    theme_slug = theme or "general"
    refined_dir = settings.refined_dir
    refined_dir.mkdir(parents=True, exist_ok=True)
    md_path = refined_dir / f"Refined_{theme_slug}.md"
    with md_path.open("a") as fh:
        fh.write(f"\n\n## Task {task_id} — {metadata.get('title', file_path.name)}\n")
        fh.write(f"- Source: {file_path.name}\n")
        fh.write(f"- Theme: {theme_slug}\n")
        if metadata.get("doc_type"):
            fh.write(f"- Doc type: {metadata['doc_type']}\n")
        if metadata.get("inferred_date"):
            fh.write(f"- Date: {metadata['inferred_date']}\n")
        if forensic:
            if forensic.get("record_type"):
                fh.write(f"- Record type (AI): {forensic.get('record_type')}\n")
            if forensic.get("breach_category"):
                fh.write(f"- Theme/breach (AI): {forensic.get('breach_category')}\n")
            if forensic.get("reliability"):
                fh.write(f"- Reliability (AI): {forensic.get('reliability')}\n")
            if forensic.get("privileged") is not None:
                fh.write(f"- Privileged (AI): {forensic.get('privileged')}\n")
            if forensic.get("key_quote"):
                fh.write(f"- Key quote: {forensic.get('key_quote')}\n")
        if summary:
            fh.write(f"\n**Summary:** {summary}\n")
        else:
            fh.write("\n**Summary:** (not generated)\n")
        if relevancy:
            fh.write(f"\n**Relevancy:** {relevancy.get('score', '?')}/100 — {relevancy.get('rationale','')}\n")
            tags = relevancy.get("tags") or []
            if tags:
                fh.write(f"- Tags: {', '.join(tags)}\n")
        if insights:
            fh.write("\n**Insights (heuristic):**\n")
            if insights.get("top_terms"):
                fh.write(f"- Top terms: {', '.join(insights['top_terms'])}\n")
            if insights.get("has_geo"):
                fh.write(f"- Coordinates: {insights.get('coord_count', 0)} found\n")
        fh.write(f"\nPreview:\n\n```\n{content[:500]}\n```\n")


if __name__ == "__main__":
    main()
