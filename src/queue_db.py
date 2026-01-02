"""
Lightweight SQLite queue for local-first task processing.
Provides enqueue, lease, complete, and flag operations.
"""

from __future__ import annotations

import sqlite3
import time
from pathlib import Path
from typing import Iterable, Optional, Tuple

import os


SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    theme TEXT,
    intent_json TEXT,
    job_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    leased_at REAL,
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch()),
    updated_at REAL NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE TABLE IF NOT EXISTS file_manifest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sha256 TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT,
    size_bytes INTEGER,
    theme TEXT,
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch()),
    updated_at REAL NOT NULL DEFAULT (unixepoch()),
    UNIQUE(sha256, tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_manifest_sha ON file_manifest(sha256);
"""


DB_TIMEOUT = float(os.getenv("PUKAIST_DB_TIMEOUT_SEC", "5.0"))


def connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES, timeout=DB_TIMEOUT)
    conn.row_factory = sqlite3.Row
    return conn


def init(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)
        _ensure_columns(conn)
        conn.commit()


def _ensure_columns(conn: sqlite3.Connection) -> None:
    cols = {row["name"] for row in conn.execute("PRAGMA table_info(tasks)")}
    if "job_id" not in cols:
        conn.execute("ALTER TABLE tasks ADD COLUMN job_id INTEGER")
    if "tenant_id" not in cols:
        conn.execute("ALTER TABLE tasks ADD COLUMN tenant_id TEXT")
    if "intent_json" not in cols:
        conn.execute("ALTER TABLE tasks ADD COLUMN intent_json TEXT")
    # Ensure manifest table exists for dedupe/reuse
    manifest_cols = {row["name"] for row in conn.execute("PRAGMA table_info(file_manifest)")}
    if not manifest_cols:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS file_manifest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sha256 TEXT NOT NULL,
                file_path TEXT NOT NULL,
                original_name TEXT,
                size_bytes INTEGER,
                theme TEXT,
                tenant_id TEXT,
                created_at REAL NOT NULL DEFAULT (unixepoch()),
                updated_at REAL NOT NULL DEFAULT (unixepoch()),
                UNIQUE(sha256, tenant_id)
            );
            CREATE INDEX IF NOT EXISTS idx_manifest_sha ON file_manifest(sha256);
            """
        )
    elif "updated_at" not in manifest_cols:
        conn.execute("ALTER TABLE file_manifest ADD COLUMN updated_at REAL NOT NULL DEFAULT (unixepoch())")
    # Ensure unique index exists (older DBs might be missing it)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_manifest_sha ON file_manifest(sha256)")


def enqueue(
    db_path: Path,
    file_path: Path,
    theme: Optional[str],
    job_id: Optional[int] = None,
    tenant_id: Optional[str] = None,
    intent_json: Optional[str] = None,
) -> int:
    with connect(db_path) as conn:
        cur = conn.execute(
            "INSERT INTO tasks (file_path, theme, job_id, tenant_id, intent_json) VALUES (?, ?, ?, ?, ?)",
            (str(file_path), theme, job_id, tenant_id, intent_json),
        )
        conn.commit()
        return int(cur.lastrowid)


def lease_one(
    db_path: Path,
    visibility_timeout_sec: int = 300,
    tenant_id: Optional[str] = None,
    allow_unscoped: bool = True,
) -> Optional[sqlite3.Row]:
    now = time.time()
    where_clauses = ["status = 'pending'"]
    params: list = []
    if tenant_id is not None:
        if allow_unscoped:
            where_clauses.append("(tenant_id = ? OR tenant_id IS NULL)")
        else:
            where_clauses.append("tenant_id = ?")
        params.append(tenant_id)
    where_sql = " AND ".join(where_clauses)
    with connect(db_path) as conn:
        conn.execute(
            f"""
            UPDATE tasks
            SET status = 'leased',
                leased_at = ?,
                attempts = attempts + 1,
                updated_at = ?
            WHERE id = (
                SELECT id FROM tasks
                WHERE {where_sql}
                ORDER BY created_at
                LIMIT 1
            )
            """,
            (now, now, *params),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM tasks WHERE status='leased' AND leased_at = ?", (now,)).fetchone()
        if row:
            return row
        # Try to recycle expired leases.
        lease_where = "status='leased' AND leased_at < ?"
        lease_params: list = [now - visibility_timeout_sec]
        if tenant_id is not None:
            if allow_unscoped:
                lease_where += " AND (tenant_id = ? OR tenant_id IS NULL)"
            else:
                lease_where += " AND tenant_id = ?"
            lease_params.append(tenant_id)
        expired = conn.execute(
            f"""
            SELECT id FROM tasks
            WHERE {lease_where}
            ORDER BY leased_at
            LIMIT 1
            """,
            tuple(lease_params),
        ).fetchone()
        if not expired:
            return None
        conn.execute(
            "UPDATE tasks SET status='pending', updated_at=? WHERE id=?",
            (now, expired["id"]),
        )
        conn.commit()
        return lease_one(
            db_path,
            visibility_timeout_sec=visibility_timeout_sec,
            tenant_id=tenant_id,
            allow_unscoped=allow_unscoped,
        )


def complete(db_path: Path, task_id: int, tenant_id: Optional[str] = None) -> None:
    now = time.time()
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE tasks SET status='done', updated_at=? WHERE id=? AND ((tenant_id IS NULL AND ? IS NULL) OR tenant_id=?)",
            (now, task_id, tenant_id, tenant_id),
        )
        conn.commit()


def flag(db_path: Path, task_id: int, error: str, tenant_id: Optional[str] = None) -> None:
    now = time.time()
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE tasks SET status='flagged', last_error=?, updated_at=? WHERE id=? AND ((tenant_id IS NULL AND ? IS NULL) OR tenant_id=?)",
            (error, now, task_id, tenant_id, tenant_id),
        )
        conn.commit()


def list_tasks(
    db_path: Path,
    limit: int = 50,
    tenant_id: Optional[str] = None,
    status: Optional[str] = None,
    theme: Optional[str] = None,
    intent_contains: Optional[str] = None,
) -> Iterable[sqlite3.Row]:
    where = []
    params: list = []
    if tenant_id:
        where.append("tenant_id = ?")
        params.append(tenant_id)
    if status:
        where.append("status = ?")
        params.append(status)
    if theme:
        where.append("theme LIKE ?")
        params.append(f"%{theme}%")
    if intent_contains:
        where.append("intent_json LIKE ?")
        params.append(f"%{intent_contains}%")
    where_clause = ("WHERE " + " AND ".join(where)) if where else ""
    sql = f"SELECT * FROM tasks {where_clause} ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    with connect(db_path) as conn:
        return conn.execute(sql, tuple(params)).fetchall()


def tasks_for_job(db_path: Path, job_id: int, tenant_id: Optional[str] = None) -> Iterable[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute(
                "SELECT * FROM tasks WHERE job_id=? AND tenant_id=? ORDER BY created_at DESC",
                (job_id, tenant_id),
            ).fetchall()
        return conn.execute(
            "SELECT * FROM tasks WHERE job_id=? ORDER BY created_at DESC",
            (job_id,),
        ).fetchall()


def task_counts(db_path: Path, tenant_id: Optional[str] = None) -> dict:
    with connect(db_path) as conn:
        if tenant_id:
            rows = conn.execute(
                "SELECT status, COUNT(*) as count FROM tasks WHERE tenant_id = ? GROUP BY status",
                (tenant_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT status, COUNT(*) as count FROM tasks GROUP BY status",
            ).fetchall()
    return {r["status"]: r["count"] for r in rows}


def task_counts_for_job(db_path: Path, job_id: int, tenant_id: Optional[str] = None) -> dict:
    with connect(db_path) as conn:
        if tenant_id:
            rows = conn.execute(
                "SELECT status, COUNT(*) as count FROM tasks WHERE job_id=? AND tenant_id=? GROUP BY status",
                (job_id, tenant_id),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT status, COUNT(*) as count FROM tasks WHERE job_id=? GROUP BY status",
                (job_id,),
            ).fetchall()
    return {r["status"]: r["count"] for r in rows}


def list_flagged(
    db_path: Path,
    limit: int = 50,
    tenant_id: Optional[str] = None,
    theme: Optional[str] = None,
    intent_contains: Optional[str] = None,
) -> Iterable[sqlite3.Row]:
    where = ["status='flagged'"]
    params: list = []
    if tenant_id:
        where.append("tenant_id = ?")
        params.append(tenant_id)
    if theme:
        where.append("theme LIKE ?")
        params.append(f"%{theme}%")
    if intent_contains:
        where.append("intent_json LIKE ?")
        params.append(f"%{intent_contains}%")
    where_clause = "WHERE " + " AND ".join(where)
    sql = f"SELECT * FROM tasks {where_clause} ORDER BY updated_at DESC LIMIT ?"
    params.append(limit)
    with connect(db_path) as conn:
        return conn.execute(sql, tuple(params)).fetchall()


def get_task(db_path: Path, task_id: int, tenant_id: Optional[str] = None) -> Optional[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute("SELECT * FROM tasks WHERE id=? AND tenant_id=?", (task_id, tenant_id)).fetchone()
        return conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()


# Manifest helpers (hash-based dedupe/reuse)
def find_manifest(db_path: Path, sha256: str, tenant_id: Optional[str] = None) -> Optional[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            row = conn.execute(
                "SELECT * FROM file_manifest WHERE sha256=? AND tenant_id=?",
                (sha256, tenant_id),
            ).fetchone()
            if row:
                return row
        return conn.execute(
            "SELECT * FROM file_manifest WHERE sha256=? AND tenant_id IS NULL",
            (sha256,),
        ).fetchone()


def upsert_manifest(
    db_path: Path,
    sha256: str,
    file_path: Path,
    original_name: Optional[str],
    size_bytes: Optional[int],
    theme: Optional[str],
    tenant_id: Optional[str] = None,
) -> sqlite3.Row:
    now = time.time()
    tenant_key = tenant_id
    with connect(db_path) as conn:
        conn.execute(
            """
            INSERT INTO file_manifest (sha256, file_path, original_name, size_bytes, theme, tenant_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sha256, tenant_id) DO UPDATE SET
                file_path=excluded.file_path,
                original_name=COALESCE(excluded.original_name, file_manifest.original_name),
                size_bytes=excluded.size_bytes,
                theme=COALESCE(excluded.theme, file_manifest.theme),
                updated_at=excluded.updated_at
            """,
            (sha256, str(file_path), original_name, size_bytes, theme, tenant_key, now, now),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM file_manifest WHERE sha256=? AND (tenant_id = ? OR (tenant_id IS NULL AND ? IS NULL))",
            (sha256, tenant_key, tenant_key),
        ).fetchone()
        assert row is not None
        return row


def last_error_for_job(db_path: Path, job_id: int, tenant_id: Optional[str] = None) -> str | None:
    with connect(db_path) as conn:
        if tenant_id:
            row = conn.execute(
                "SELECT last_error FROM tasks WHERE job_id=? AND tenant_id=? AND last_error IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
                (job_id, tenant_id),
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT last_error FROM tasks WHERE job_id=? AND last_error IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
                (job_id,),
            ).fetchone()
    return row["last_error"] if row else None


def reset_to_pending(db_path: Path, task_id: int) -> None:
    now = time.time()
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE tasks SET status='pending', last_error=NULL, updated_at=? WHERE id=?",
            (now, task_id),
        )
        conn.commit()


def update_task_path(db_path: Path, task_id: int, file_path: Path, tenant_id: Optional[str] = None) -> None:
    now = time.time()
    with connect(db_path) as conn:
        if tenant_id:
            conn.execute(
                "UPDATE tasks SET file_path=?, updated_at=? WHERE id=? AND tenant_id=?",
                (str(file_path), now, task_id, tenant_id),
            )
        else:
            conn.execute(
                "UPDATE tasks SET file_path=?, updated_at=? WHERE id=?",
                (str(file_path), now, task_id),
            )
        conn.commit()


def import_tasks_from_tsv(db_path: Path, tsv_path: Path) -> int:
    count = 0
    with tsv_path.open() as fh, connect(db_path) as conn:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) < 1:
                continue
            file_path = parts[0]
            theme = parts[1] if len(parts) > 1 else None
            job_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None
            conn.execute("INSERT INTO tasks (file_path, theme, job_id) VALUES (?, ?, ?)", (file_path, theme, job_id))
            count += 1
        conn.commit()
    return count
