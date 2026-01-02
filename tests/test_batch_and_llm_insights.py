from __future__ import annotations

import importlib
import json
from pathlib import Path

import pytest


@pytest.fixture()
def isolated_env_batch(tmp_path, monkeypatch):
  monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
  monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
  monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
  monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
  monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
  monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
  monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
  monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
  # Ensure LLM is offline for this test; we'll just exercise the batch helper.
  monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "true")
  from src import config, queue_db, search_index, job_store, worker, batch_llm  # type: ignore

  importlib.reload(config)
  importlib.reload(queue_db)
  importlib.reload(search_index)
  importlib.reload(job_store)
  importlib.reload(worker)
  importlib.reload(batch_llm)
  return worker, batch_llm


def test_batch_prepare_and_ingest(isolated_env_batch):
  worker, batch_llm = isolated_env_batch
  incoming = worker.settings.incoming_dir
  incoming.mkdir(parents=True, exist_ok=True)

  # Create a doc that will be processed and indexed without a summary.
  file_path = incoming / "batch-doc.txt"
  file_path.write_text("This document will be summarized later via batch.")

  job_id = worker.job_store.create_job(worker.settings.queue_db)
  worker.queue_db.enqueue(worker.settings.queue_db, file_path, theme="batch", job_id=job_id)

  # Run worker once to stage and index the doc (summary will be None in batch mode).
  worked = worker.run_once()
  assert worked

  # Prepare JSONL for docs without summaries.
  jsonl_path = batch_llm.prepare_batch_jsonl(limit=10)
  assert jsonl_path is not None
  assert jsonl_path.is_file()

  # Read the JSONL to find the doc_id and craft a fake result file.
  records = []
  with jsonl_path.open("r", encoding="utf-8") as fh:
    for line in fh:
      line = line.strip()
      if not line:
        continue
      records.append(json.loads(line))
  assert records

  # Extract doc_id from custom_id "doc-<id>"
  doc_ids = []
  for rec in records:
    custom_id = rec.get("custom_id", "")
    if custom_id.startswith("doc-"):
      try:
        doc_ids.append(int(custom_id.split("doc-")[1]))
      except ValueError:
        continue
  assert doc_ids

  # Create a fake results JSONL mapping doc_id -> summary.
  results_path = jsonl_path.parent / "results.jsonl"
  with results_path.open("w", encoding="utf-8") as fh:
    for doc_id in doc_ids:
      fh.write(json.dumps({"doc_id": doc_id, "summary": "Batch summary."}))
      fh.write("\n")

  updated_count = batch_llm.ingest_summaries(results_path)
  assert updated_count == len(doc_ids)


@pytest.fixture()
def isolated_env_llm_insights(tmp_path, monkeypatch):
  monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
  monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
  monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
  monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
  monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
  monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
  monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
  monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
  monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "false")
  monkeypatch.setenv("PUKAIST_LLM_INSIGHTS_ENABLED", "true")
  from src import config, queue_db, search_index, job_store, worker, llm_client  # type: ignore

  importlib.reload(config)
  importlib.reload(queue_db)
  importlib.reload(search_index)
  importlib.reload(job_store)
  importlib.reload(llm_client)
  importlib.reload(worker)
  return worker, llm_client


def test_llm_insights_toggle_offline(monkeypatch, isolated_env_llm_insights):
  worker, llm_client = isolated_env_llm_insights
  incoming = worker.settings.incoming_dir
  incoming.mkdir(parents=True, exist_ok=True)

  file_path = incoming / "llm-insights.txt"
  file_path.write_text("Content for LLM insights test.")

  # Force offline mode: extract_insights should not be called.
  monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "true")
  from src import config  # type: ignore

  importlib.reload(config)
  importlib.reload(worker)

  calls = {"count": 0}

  def fake_extract_insights(_self, _content):
    calls["count"] += 1
    return {"topics": ["t1"], "entities": [], "risks": []}

  monkeypatch.setattr(llm_client.LLMClient, "extract_insights", fake_extract_insights)

  job_id = worker.job_store.create_job(worker.settings.queue_db)
  task_id = worker.queue_db.enqueue(worker.settings.queue_db, file_path, theme="llm", job_id=job_id)
  assert task_id

  worked = worker.run_once()
  assert worked
  # With offline mode forced, extract_insights should not be invoked.
  assert calls["count"] == 0

