"""
Simple job tracking store sharing the same SQLite DB as the queue.
Tracks status per job and last_error when flagged.
"""

from __future__ import annotations

import sqlite3
import os
import time
from pathlib import Path
from typing import Iterable, Optional


SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT 'pending',
    last_error TEXT,
    callback_url TEXT,
    callback_attempts INTEGER NOT NULL DEFAULT 0,
    last_callback_status TEXT,
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch()),
    updated_at REAL NOT NULL DEFAULT (unixepoch())
);
"""


DB_TIMEOUT = float(os.getenv("PUKAIST_DB_TIMEOUT_SEC", "5.0"))


def connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, timeout=DB_TIMEOUT)
    conn.row_factory = sqlite3.Row
    return conn


def init(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)
        _ensure_columns(conn)
        conn.commit()


def _ensure_columns(conn: sqlite3.Connection) -> None:
    cols = {row["name"] for row in conn.execute("PRAGMA table_info(jobs)")}
    if "callback_url" not in cols:
        conn.execute("ALTER TABLE jobs ADD COLUMN callback_url TEXT")
    if "callback_attempts" not in cols:
        conn.execute("ALTER TABLE jobs ADD COLUMN callback_attempts INTEGER NOT NULL DEFAULT 0")
    if "last_callback_status" not in cols:
        conn.execute("ALTER TABLE jobs ADD COLUMN last_callback_status TEXT")
    if "tenant_id" not in cols:
        conn.execute("ALTER TABLE jobs ADD COLUMN tenant_id TEXT")


def create_job(db_path: Path, callback_url: str | None = None, tenant_id: str | None = None) -> int:
    with connect(db_path) as conn:
        cur = conn.execute(
            "INSERT INTO jobs (status, created_at, updated_at, callback_url, tenant_id) VALUES (?, ?, ?, ?, ?)",
            ("pending", time.time(), time.time(), callback_url, tenant_id),
        )
        conn.commit()
        return int(cur.lastrowid)


def set_status(db_path: Path, job_id: int, status: str, last_error: Optional[str] = None, tenant_id: Optional[str] = None) -> None:
    now = time.time()
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE jobs SET status=?, last_error=?, updated_at=? WHERE id=? AND ((tenant_id IS NULL AND ? IS NULL) OR tenant_id=?)",
            (status, last_error, now, job_id, tenant_id, tenant_id),
        )
        conn.commit()


def get_job(db_path: Path, job_id: int, tenant_id: Optional[str] = None) -> Optional[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute("SELECT * FROM jobs WHERE id=? AND tenant_id=?", (job_id, tenant_id)).fetchone()
        return conn.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()


def list_jobs(db_path: Path, limit: int = 50, tenant_id: Optional[str] = None) -> Iterable[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute(
                "SELECT * FROM jobs WHERE tenant_id=? ORDER BY created_at DESC LIMIT ?",
                (tenant_id, limit),
            ).fetchall()
        return conn.execute(
            "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()


def record_callback_status(db_path: Path, job_id: int, status_text: str) -> None:
    now = time.time()
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE jobs SET callback_attempts = callback_attempts + 1, last_callback_status=?, updated_at=? WHERE id=?",
            (status_text, now, job_id),
        )
        conn.commit()
