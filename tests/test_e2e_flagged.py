from __future__ import annotations

import importlib
from pathlib import Path

import pytest


@pytest.fixture()
def isolated_env(tmp_path, monkeypatch):
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    monkeypatch.setenv("PUKAIST_DEFAULT_TENANT", "tenant-e2e")
    from src import config, queue_db, search_index, job_store, worker  # type: ignore

    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(search_index)
    importlib.reload(job_store)
    importlib.reload(worker)
    return worker


def test_flagged_task_has_error_summary(isolated_env):
    worker = isolated_env
    incoming = worker.settings.incoming_dir
    incoming.mkdir(parents=True, exist_ok=True)

    file_path = incoming / "note.txt"
    file_path.write_text("no")  # too short to pass validation, no doc_type inferred

    job_id = worker.job_store.create_job(worker.settings.queue_db, tenant_id=worker.settings.default_tenant)
    task_id = worker.queue_db.enqueue(
        worker.settings.queue_db,
        file_path,
        theme="demo",
        job_id=job_id,
        tenant_id=worker.settings.default_tenant,
    )

    worked = worker.run_once()
    assert worked

    tasks = worker.queue_db.list_tasks(worker.settings.queue_db, limit=5, tenant_id=worker.settings.default_tenant)
    flagged = [t for t in tasks if t["id"] == task_id]
    assert flagged and flagged[0]["status"] == "flagged"
    assert "validation failed" in (flagged[0]["last_error"] or "")

    job = worker.job_store.get_job(worker.settings.queue_db, job_id, tenant_id=worker.settings.default_tenant)
    assert job and job["status"] == "flagged"
