from __future__ import annotations

from pathlib import Path

from src import queue_db


def test_lease_one_respects_tenant_filter(tmp_path):
    db_path = tmp_path / "queue.db"
    queue_db.init(db_path)

    unscoped_id = queue_db.enqueue(db_path, Path("unscoped.txt"), "demo", tenant_id=None)
    tenant_task_id = queue_db.enqueue(db_path, Path("tenant.txt"), "demo", tenant_id="tenant-a")

    with queue_db.connect(db_path) as conn:
        conn.execute("UPDATE tasks SET created_at=? WHERE id=?", (1, unscoped_id))
        conn.execute("UPDATE tasks SET created_at=? WHERE id=?", (2, tenant_task_id))
        conn.commit()

    row = queue_db.lease_one(db_path, tenant_id="tenant-a", allow_unscoped=False)
    assert row is not None
    assert row["id"] == tenant_task_id
    assert row["tenant_id"] == "tenant-a"


def test_lease_one_allows_unscoped_when_enabled(tmp_path):
    db_path = tmp_path / "queue.db"
    queue_db.init(db_path)

    unscoped_id = queue_db.enqueue(db_path, Path("unscoped.txt"), "demo", tenant_id=None)
    tenant_task_id = queue_db.enqueue(db_path, Path("tenant.txt"), "demo", tenant_id="tenant-a")

    with queue_db.connect(db_path) as conn:
        conn.execute("UPDATE tasks SET created_at=? WHERE id=?", (1, unscoped_id))
        conn.execute("UPDATE tasks SET created_at=? WHERE id=?", (2, tenant_task_id))
        conn.commit()

    row = queue_db.lease_one(db_path, tenant_id="tenant-a", allow_unscoped=True)
    assert row is not None
    assert row["id"] == unscoped_id
    assert row["tenant_id"] is None
