"""
Admin Codex queue seeding tests.

Ensures /admin/codex/queues/seed-file can create tasks from a local file.
"""

from __future__ import annotations


def test_admin_codex_seed_file_creates_queue_tasks(monkeypatch, fresh_api):
    client, _, api = fresh_api
    monkeypatch.setenv("PUKAIST_AUTH_DISABLED", "true")

    base_dir = api.settings.workspace.parent
    src = base_dir / "sample_seed.txt"
    src.write_text("line\n" * 500, encoding="utf-8")

    resp = client.post(
        "/admin/codex/queues/seed-file",
        headers={"X-API-Key": "test-token"},
        json={"theme": "Demo_Seed", "source_path": "sample_seed.txt", "chunk_size": 200, "overlap": 0},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data.get("status") == "ok"
    assert data.get("created", 0) > 0
    assert data.get("overlap") == 0

    queue_path = base_dir / "99_Working_Files" / "Queues" / "Queue_Demo_Seed.tsv"
    assert queue_path.exists()
    text = queue_path.read_text(encoding="utf-8", errors="ignore")
    # Header + at least one row
    assert "TaskID\tTheme\tDocumentID\tSourcePath\tOffset\tLength\tStatus\tLockedAt\tLockedBy" in text
    assert "\tPending\t" in text
