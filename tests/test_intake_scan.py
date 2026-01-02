from __future__ import annotations

import importlib
from pathlib import Path

import pytest


@pytest.fixture()
def isolated_env_intake(tmp_path, monkeypatch):
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    monkeypatch.setenv("PUKAIST_DEFAULT_TENANT", "tenant-intake")
    from src import config, queue_db, job_store  # type: ignore
    import scripts.intake_scan as intake_scan  # type: ignore

    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(job_store)
    importlib.reload(intake_scan)
    return intake_scan, queue_db, job_store


def test_intake_scan_enqueues_new_files(isolated_env_intake, tmp_path: Path) -> None:
    intake_scan, queue_db, job_store = isolated_env_intake

    incoming = tmp_path / "incoming"
    incoming.mkdir(parents=True, exist_ok=True)

    f1 = incoming / "a.txt"
    f2 = incoming / "b.txt"
    f1.write_text("file one")
    f2.write_text("file two")

    # First scan should enqueue both files.
    count = intake_scan.scan_and_enqueue(theme="drop-test", dry_run=False)
    assert count == 2

    # Second scan should enqueue nothing (files already present).
    count = intake_scan.scan_and_enqueue(theme="drop-test", dry_run=False)
    assert count == 0

