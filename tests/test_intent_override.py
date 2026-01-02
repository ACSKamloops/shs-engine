from __future__ import annotations

import importlib
import json
from pathlib import Path

from src import queue_db  # type: ignore


def test_intent_llm_mode_offline_skips_summary(tmp_path, monkeypatch):
    # Configure isolated workspace
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "reports"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    # Keep LLM offline; worker should still skip because llm_mode=offline override
    monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "true")

    from src import config, search_index, job_store, worker  # type: ignore

    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(search_index)
    importlib.reload(job_store)
    importlib.reload(worker)

    settings = config.Settings.load()
    queue_db.init(settings.queue_db)
    search_index.init(settings.index_path)
    job_store.init(settings.queue_db)

    # Seed an upload with intent forcing llm_mode=offline
    incoming_file = settings.incoming_dir / "sample.txt"
    incoming_file.parent.mkdir(parents=True, exist_ok=True)
    incoming_file.write_text("foo bar baz content for intent test")
    intent = {"llm_mode": "offline"}
    task_id = queue_db.enqueue(
        settings.queue_db,
        incoming_file,
        theme="demo",
        job_id=None,
        tenant_id=None,
        intent_json=json.dumps(intent),
    )

    # Process one task; summary should be skipped because llm_mode=offline
    processed = worker.run_once()
    assert processed is True

    artifact_path = settings.staging_dir / f"{task_id}.json"
    assert artifact_path.exists(), "artifact should exist"
    artifact = json.loads(artifact_path.read_text())
    assert artifact.get("summary") is None, "summary should be absent when llm_mode=offline intent is set"
