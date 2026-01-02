from __future__ import annotations

import importlib
from pathlib import Path

import pytest


@pytest.fixture()
def isolated_env_tenant(tmp_path, monkeypatch):
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    # Single default tenant for this isolated environment
    monkeypatch.setenv("PUKAIST_DEFAULT_TENANT", "tenant-a")
    from src import config, queue_db, search_index, job_store, worker  # type: ignore

    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(search_index)
    importlib.reload(job_store)
    importlib.reload(worker)
    return worker


def test_jobs_and_tasks_tagged_with_tenant(isolated_env_tenant):
    worker = isolated_env_tenant
    incoming = worker.settings.incoming_dir
    incoming.mkdir(parents=True, exist_ok=True)

    file_path = incoming / "note.txt"
    file_path.write_text("Some sufficiently long content to pass validation.")

    # Create a job and task; tenant_id should be the default tenant.
    job_id = worker.job_store.create_job(worker.settings.queue_db, tenant_id=worker.settings.default_tenant)
    task_id = worker.queue_db.enqueue(
        worker.settings.queue_db,
        file_path,
        theme="demo",
        job_id=job_id,
        tenant_id=worker.settings.default_tenant,
    )

    job = worker.job_store.get_job(worker.settings.queue_db, job_id, tenant_id=worker.settings.default_tenant)
    assert job is not None
    assert job["tenant_id"] == worker.settings.default_tenant

    tasks = list(worker.queue_db.list_tasks(worker.settings.queue_db, limit=10, tenant_id=worker.settings.default_tenant))
    assert any(t["id"] == task_id for t in tasks)
    for t in tasks:
        assert t["tenant_id"] == worker.settings.default_tenant


def test_search_scoped_by_tenant(isolated_env_tenant):
    worker = isolated_env_tenant
    incoming = worker.settings.incoming_dir
    incoming.mkdir(parents=True, exist_ok=True)

    file_path = incoming / "report.txt"
    file_path.write_text("This domain-specific report mentions coordinates 49.0 -123.0.")

    job_id = worker.job_store.create_job(worker.settings.queue_db, tenant_id=worker.settings.default_tenant)
    worker.queue_db.enqueue(
        worker.settings.queue_db,
        file_path,
        theme="demo",
        job_id=job_id,
        tenant_id=worker.settings.default_tenant,
    )

    # Process the task to index the document.
    worked = worker.run_once()
    assert worked

    # Search for a term with the correct tenant: should find the doc.
    rows_tenant_a = worker.search_index.search(
        worker.settings.index_path,
        "report",
        limit=10,
        tenant_id=worker.settings.default_tenant,
    )
    assert any("report.txt" in r["file_path"] for r in rows_tenant_a)

    # Search with a different tenant: should see no results.
    rows_other_tenant = worker.search_index.search(
        worker.settings.index_path,
        "report",
        limit=10,
        tenant_id="tenant-b",
    )
    assert rows_other_tenant == []

