"""
Minimal FTS-backed search index for local use.
Stores content + metadata; no deletes yet (append-only for dev).
"""

from __future__ import annotations

import sqlite3
import os
import time
from pathlib import Path
from typing import Iterable, List, Optional, Dict

from .config import Settings


SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    file_path TEXT NOT NULL,
    stable_id TEXT,
    provenance TEXT,
    sha256 TEXT,
    theme TEXT,
    title TEXT,
    summary TEXT,
    doc_type TEXT,
    inferred_date TEXT,
    breach_category TEXT,
    reliability TEXT,
    key_quote TEXT,
    privileged INTEGER,
    entities_json TEXT,
    user_relevance TEXT,
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch())
);
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
    content,
    theme,
    file_path,
    content_rowid='id'
);
CREATE TABLE IF NOT EXISTS geo_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id INTEGER,
    task_id INTEGER,
    lat REAL,
    lon REAL,
    theme TEXT,
    title TEXT,
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS geo_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id INTEGER,
    task_id INTEGER,
    label TEXT,
    lat REAL,
    lon REAL,
    score REAL,
    source TEXT,
    status TEXT DEFAULT 'pending',
    tenant_id TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_geo_suggestions_doc ON geo_suggestions(doc_id);
CREATE INDEX IF NOT EXISTS idx_geo_suggestions_status ON geo_suggestions(status);
"""


DB_TIMEOUT = float(os.getenv("PUKAIST_DB_TIMEOUT_SEC", "5.0"))


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=DB_TIMEOUT)
    conn.row_factory = sqlite3.Row
    return conn


def init(db_path: Path) -> None:
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)
        _ensure_columns(conn)
        conn.commit()


def _ensure_columns(conn: sqlite3.Connection) -> None:
    cols = {row["name"] for row in conn.execute("PRAGMA table_info(docs)")}
    if "title" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN title TEXT")
    if "stable_id" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN stable_id TEXT")
    if "provenance" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN provenance TEXT")
    if "sha256" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN sha256 TEXT")
    if "summary" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN summary TEXT")
    if "doc_type" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN doc_type TEXT")
    if "inferred_date" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN inferred_date TEXT")
    if "breach_category" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN breach_category TEXT")
    if "reliability" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN reliability TEXT")
    if "key_quote" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN key_quote TEXT")
    if "privileged" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN privileged INTEGER")
    if "entities_json" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN entities_json TEXT")
    if "user_relevance" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN user_relevance TEXT")
    if "review_status" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN review_status TEXT")
    if "tenant_id" not in cols:
        conn.execute("ALTER TABLE docs ADD COLUMN tenant_id TEXT")
    cols_geo = {row["name"] for row in conn.execute("PRAGMA table_info(geo_points)")}
    if "tenant_id" not in cols_geo:
        conn.execute("ALTER TABLE geo_points ADD COLUMN tenant_id TEXT")
    # geo_points table handled in main schema
    cols_sug = {row["name"] for row in conn.execute("PRAGMA table_info(geo_suggestions)")}
    if not cols_sug:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS geo_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id INTEGER,
                task_id INTEGER,
                label TEXT,
                lat REAL,
                lon REAL,
                score REAL,
                source TEXT,
                status TEXT DEFAULT 'pending',
                tenant_id TEXT,
                created_at REAL NOT NULL DEFAULT (unixepoch())
            );
            CREATE INDEX IF NOT EXISTS idx_geo_suggestions_doc ON geo_suggestions(doc_id);
            CREATE INDEX IF NOT EXISTS idx_geo_suggestions_status ON geo_suggestions(status);
            """
        )
    else:
        if "tenant_id" not in cols_sug:
            conn.execute("ALTER TABLE geo_suggestions ADD COLUMN tenant_id TEXT")
        if "status" not in cols_sug:
            conn.execute("ALTER TABLE geo_suggestions ADD COLUMN status TEXT DEFAULT 'pending'")


def add_document(
    db_path: Path,
    *,
    task_id: Optional[int],
    file_path: Path,
    stable_id: Optional[str],
    provenance: Optional[str],
    sha256: Optional[str],
    theme: Optional[str],
    title: str,
    summary: Optional[str],
    doc_type: Optional[str],
    inferred_date: Optional[str],
    breach_category: Optional[str] = None,
    reliability: Optional[str] = None,
    key_quote: Optional[str] = None,
    privileged: Optional[bool] = None,
    entities_json: Optional[str] = None,
    content: str,
    tenant_id: Optional[str] = None,
) -> int:
    with connect(db_path) as conn:
        cur = conn.execute(
            """
            INSERT INTO docs (
                task_id,
                file_path,
                stable_id,
                provenance,
                sha256,
                theme,
                title,
                summary,
                doc_type,
                inferred_date,
                breach_category,
                reliability,
                key_quote,
                privileged,
                entities_json,
                tenant_id,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task_id,
                str(file_path),
                stable_id,
                provenance,
                sha256,
                theme,
                title,
                summary,
                doc_type,
                inferred_date,
                breach_category,
                reliability,
                key_quote,
                1 if privileged else 0 if privileged is False else None,
                entities_json,
                tenant_id,
                time.time(),
            ),
        )
        rowid = cur.lastrowid
        conn.execute(
            "INSERT INTO docs_fts(rowid, content, theme, file_path) VALUES (?, ?, ?, ?)",
            (rowid, content, theme or "", str(file_path)),
        )
        conn.commit()
        return int(rowid)


def _fetch_statuses(queue_db_path: Optional[Path], task_ids: List[int]) -> Dict[int, str]:
    if not queue_db_path or not task_ids:
        return {}
    try:
        import sqlite3 as _sqlite

        with _sqlite.connect(queue_db_path) as conn:
            rows = conn.execute(
                f"SELECT id, status FROM tasks WHERE id IN ({','.join(['?']*len(task_ids))})",
                tuple(task_ids),
            ).fetchall()
            return {r[0]: r[1] for r in rows}
    except Exception:
        return {}


def search(
    db_path: Path,
    query: str,
    limit: int = 20,
    tenant_id: Optional[str] = None,
    theme: Optional[str] = None,
    doc_type: Optional[str] = None,
    queue_db_path: Optional[Path] = None,
) -> List[Dict]:
    where = ["docs_fts MATCH ?"]
    params: list = [query]
    if tenant_id:
        where.append("d.tenant_id = ?")
        params.append(tenant_id)
    if theme:
        where.append("d.theme LIKE ?")
        params.append(f"%{theme}%")
    if doc_type:
        where.append("d.doc_type LIKE ?")
        params.append(f"%{doc_type}%")
    where_clause = " AND ".join(where)
    sql = f"""
        SELECT d.id,
               d.task_id,
               d.file_path,
               d.stable_id,
               d.provenance,
               d.sha256,
               d.theme,
               d.title,
               d.summary,
               d.doc_type,
               d.inferred_date,
               d.breach_category,
               d.reliability,
               d.key_quote,
               d.privileged,
               d.entities_json,
               d.user_relevance,
               snippet(docs_fts, 0, '[', ']', '…', 10) AS snippet
        FROM docs_fts
        JOIN docs d ON d.id = docs_fts.rowid
        WHERE {where_clause}
        ORDER BY rank
        LIMIT ?
    """
    params.append(limit)
    with connect(db_path) as conn:
        rows = conn.execute(sql, tuple(params)).fetchall()
    task_ids = [r["task_id"] for r in rows if r["task_id"] is not None]
    status_map = _fetch_statuses(queue_db_path, task_ids)
    results: List[Dict] = []
    for r in rows:
        d = dict(r)
        if d.get("task_id") in status_map:
            d["status"] = status_map[d["task_id"]]
        results.append(d)
    return results


def list_docs(
    db_path: Path,
    limit: int = 50,
    tenant_id: Optional[str] = None,
    theme: Optional[str] = None,
    doc_type: Optional[str] = None,
    label: Optional[str] = None,
    review_status: Optional[str] = None,
) -> Iterable[Dict]:
    where = []
    params: list = []
    if tenant_id:
        where.append("tenant_id = ?")
        params.append(tenant_id)
    if theme:
        where.append("theme LIKE ?")
        params.append(f"%{theme}%")
    if doc_type:
        where.append("doc_type LIKE ?")
        params.append(f"%{doc_type}%")
    if label:
        where.append("user_relevance = ?")
        params.append(label)
    if review_status:
        where.append("review_status = ?")
        params.append(review_status)
    where_clause = ("WHERE " + " AND ".join(where)) if where else ""
    sql = f"""
        SELECT d.id,
               d.task_id,
               d.file_path,
               d.stable_id,
               d.provenance,
               d.sha256,
               d.theme,
               d.title,
               d.summary,
               d.doc_type,
               d.inferred_date,
               d.breach_category,
               d.reliability,
               d.key_quote,
               d.privileged,
               d.entities_json,
               d.user_relevance,
               d.review_status,
               d.created_at
        FROM docs d
        {where_clause}
        ORDER BY d.created_at DESC
        LIMIT ?
    """
    params.append(limit)
    with connect(db_path) as conn:
        rows = conn.execute(sql, tuple(params)).fetchall()
    task_ids = [r["task_id"] for r in rows if r["task_id"] is not None]
    status_map = _fetch_statuses(Settings.load().queue_db, task_ids)
    results: List[Dict] = []
    for r in rows:
        d = dict(r)
        if d.get("task_id") in status_map:
            d["status"] = status_map[d["task_id"]]
        results.append(d)
    return results


def list_pending_summaries(db_path: Path, limit: int = 100) -> List[sqlite3.Row]:
    """
    Return docs that do not yet have a summary; used to drive batch LLM jobs.
    """
    with connect(db_path) as conn:
        return conn.execute(
            "SELECT id, task_id, file_path, theme, title FROM docs WHERE summary IS NULL ORDER BY created_at ASC LIMIT ?",
            (limit,),
        ).fetchall()


def update_summary(db_path: Path, doc_id: int, summary: str) -> None:
    """
    Update the summary for a given document.
    """
    with connect(db_path) as conn:
        conn.execute("UPDATE docs SET summary = ? WHERE id = ?", (summary, doc_id))
        conn.commit()


def get_doc(db_path: Path, doc_id: int) -> Optional[sqlite3.Row]:
    """
    Fetch a single document row, or None if not found.
    """
    with connect(db_path) as conn:
        row = conn.execute(
            """
            SELECT id, task_id, file_path, stable_id, provenance, sha256, theme, title, summary, doc_type,
                   inferred_date, breach_category, reliability, key_quote, privileged, entities_json,
                   user_relevance, review_status, tenant_id, created_at
            FROM docs WHERE id = ?
            """,
            (doc_id,),
        ).fetchone()
    return row


def delete_doc(db_path: Path, doc_id: int, tenant_id: Optional[str] = None) -> bool:
    """
    Delete a document and all associated data (FTS, geo_points, geo_suggestions).
    Returns True if document was deleted, False if not found.
    """
    with connect(db_path) as conn:
        # Check exists and tenant matches
        if tenant_id:
            row = conn.execute(
                "SELECT id FROM docs WHERE id = ? AND tenant_id = ?", (doc_id, tenant_id)
            ).fetchone()
        else:
            row = conn.execute("SELECT id FROM docs WHERE id = ?", (doc_id,)).fetchone()
        
        if not row:
            return False
        
        # Delete from FTS
        conn.execute("DELETE FROM docs_fts WHERE rowid = ?", (doc_id,))
        # Delete geo points
        conn.execute("DELETE FROM geo_points WHERE doc_id = ?", (doc_id,))
        # Delete geo suggestions
        conn.execute("DELETE FROM geo_suggestions WHERE doc_id = ?", (doc_id,))
        # Delete main doc
        conn.execute("DELETE FROM docs WHERE id = ?", (doc_id,))
        conn.commit()
        return True


def update_doc(
    db_path: Path,
    doc_id: int,
    tenant_id: Optional[str] = None,
    title: Optional[str] = None,
    theme: Optional[str] = None,
    summary: Optional[str] = None,
    doc_type: Optional[str] = None,
    inferred_date: Optional[str] = None,
    breach_category: Optional[str] = None,
    reliability: Optional[str] = None,
    key_quote: Optional[str] = None,
    privileged: Optional[bool] = None,
) -> bool:
    """
    Update document metadata fields. Only non-None values are updated.
    Returns True if document was updated, False if not found.
    """
    with connect(db_path) as conn:
        # Check exists and tenant matches
        if tenant_id:
            row = conn.execute(
                "SELECT id FROM docs WHERE id = ? AND tenant_id = ?", (doc_id, tenant_id)
            ).fetchone()
        else:
            row = conn.execute("SELECT id FROM docs WHERE id = ?", (doc_id,)).fetchone()

        if not row:
            return False

        # Build dynamic update
        updates = []
        params = []
        if title is not None:
            updates.append("title = ?")
            params.append(title)
        if theme is not None:
            updates.append("theme = ?")
            params.append(theme)
        if summary is not None:
            updates.append("summary = ?")
            params.append(summary)
        if doc_type is not None:
            updates.append("doc_type = ?")
            params.append(doc_type)
        if inferred_date is not None:
            updates.append("inferred_date = ?")
            params.append(inferred_date)
        if breach_category is not None:
            updates.append("breach_category = ?")
            params.append(breach_category)
        if reliability is not None:
            updates.append("reliability = ?")
            params.append(reliability)
        if key_quote is not None:
            updates.append("key_quote = ?")
            params.append(key_quote)
        if privileged is not None:
            updates.append("privileged = ?")
            params.append(1 if privileged else 0)

        if not updates:
            return True  # Nothing to update

        params.append(doc_id)
        sql = f"UPDATE docs SET {', '.join(updates)} WHERE id = ?"
        conn.execute(sql, tuple(params))
        conn.commit()
        return True


def update_doc_path(
    db_path: Path,
    doc_id: int,
    file_path: Path,
    tenant_id: Optional[str] = None,
) -> bool:
    """
    Update file_path for a document and its FTS mirror.
    Returns True if updated, False if doc not found.
    """
    with connect(db_path) as conn:
        if tenant_id:
            row = conn.execute(
                "SELECT id FROM docs WHERE id = ? AND tenant_id = ?",
                (doc_id, tenant_id),
            ).fetchone()
        else:
            row = conn.execute("SELECT id FROM docs WHERE id = ?", (doc_id,)).fetchone()
        if not row:
            return False
        conn.execute("UPDATE docs SET file_path = ? WHERE id = ?", (str(file_path), doc_id))
        conn.execute("UPDATE docs_fts SET file_path = ? WHERE rowid = ?", (str(file_path), doc_id))
        conn.commit()
        return True


def get_doc_by_task(db_path: Path, task_id: int, tenant_id: Optional[str] = None) -> Optional[sqlite3.Row]:
    """
    Fetch the doc row associated with a given task_id.
    """
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute(
                """
                SELECT id, task_id, file_path, stable_id, provenance, sha256, theme, title, summary, doc_type,
                       inferred_date, breach_category, reliability, key_quote, privileged, entities_json,
                       user_relevance, review_status, tenant_id, created_at
                FROM docs WHERE task_id = ? AND tenant_id = ?
                """,
                (task_id, tenant_id),
            ).fetchone()
        return conn.execute(
            """
            SELECT id, task_id, file_path, stable_id, provenance, sha256, theme, title, summary, doc_type,
                   inferred_date, breach_category, reliability, key_quote, privileged, entities_json,
                   user_relevance, review_status, tenant_id, created_at
            FROM docs WHERE task_id = ?
            """,
            (task_id,),
        ).fetchone()


def set_user_relevance(db_path: Path, doc_id: int, label: Optional[str]) -> None:
    """
    Persist a user-defined relevance label for a document.
    """
    with connect(db_path) as conn:
        conn.execute("UPDATE docs SET user_relevance = ? WHERE id = ?", (label, doc_id))
        conn.commit()


def set_review_status(db_path: Path, doc_id: int, status: Optional[str]) -> None:
    """
    Persist a user-defined review status for a document.

    Status should be one of: reviewed, needs_follow_up, or None for clear.
    """
    with connect(db_path) as conn:
        conn.execute("UPDATE docs SET review_status = ? WHERE id = ?", (status, doc_id))
        conn.commit()


def get_geo_for_doc(db_path: Path, doc_id: int, tenant_id: Optional[str] = None) -> list[tuple[float, float]]:
    """
    Return list of point rows for a given doc_id (includes coord id).
    """
    with connect(db_path) as conn:
        if tenant_id:
            rows = conn.execute(
                "SELECT id, lat, lon FROM geo_points WHERE doc_id=? AND tenant_id = ?",
                (doc_id, tenant_id),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, lat, lon FROM geo_points WHERE doc_id=?",
                (doc_id,),
            ).fetchall()
    return rows


def rebuild_from_staging(db_path: Path, staging_dir: Path) -> int:
    """
    Rebuilds the index from staged .txt files. Intended for local recovery/testing.
    """
    staging_dir.mkdir(parents=True, exist_ok=True)
    with connect(db_path) as conn:
        conn.executescript("DELETE FROM docs; DELETE FROM docs_fts;")
        conn.commit()

    count = 0
    for path in staging_dir.rglob("*.txt"):
        text = path.read_text(errors="ignore")
        add_document(
            db_path,
            task_id=None,
            file_path=path,
            stable_id=None,
            provenance=None,
            sha256=None,
            theme=None,
            title=path.stem,
            summary=None,
            doc_type=None,
            inferred_date=None,
            breach_category=None,
            reliability=None,
            key_quote=None,
            privileged=None,
            entities_json=None,
            content=text,
        )
        count += 1
    return count


def add_geo_points(
    db_path: Path,
    *,
    doc_id: int,
    task_id: Optional[int],
    theme: Optional[str],
    title: str,
    coords: list[tuple[float, float]],
    tenant_id: Optional[str] = None,
) -> None:
    if not coords:
        return
    with connect(db_path) as conn:
        conn.executemany(
            "INSERT INTO geo_points (doc_id, task_id, lat, lon, theme, title, tenant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [(doc_id, task_id, lat, lon, theme, title, tenant_id, time.time()) for lat, lon in coords],
        )
        conn.commit()


def geojson(db_path: Path, limit: int = 100, tenant_id: Optional[str] = None, label: Optional[str] = None) -> dict:
    with connect(db_path) as conn:
        base_sql = """
            SELECT g.lat, g.lon, g.theme, g.title, g.task_id, g.doc_id, d.user_relevance
            FROM geo_points g
            LEFT JOIN docs d ON d.id = g.doc_id
        """
        where_parts = []
        params: list = []
        if tenant_id:
            where_parts.append("g.tenant_id = ?")
            params.append(tenant_id)
        if label:
            where_parts.append("d.user_relevance = ?")
            params.append(label)
        where_clause = " WHERE " + " AND ".join(where_parts) if where_parts else ""
        sql = f"{base_sql}{where_clause} ORDER BY g.created_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(sql, tuple(params)).fetchall()
    features = []
    for r in rows:
        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [r["lon"], r["lat"]]},
                "properties": {
                    "theme": r["theme"],
                    "title": r["title"],
                    "task_id": r["task_id"],
                    "doc_id": r["doc_id"],
                    "user_relevance": r["user_relevance"],
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


# Geo suggestions helpers
def add_suggestion(
    db_path: Path,
    *,
    doc_id: int,
    task_id: Optional[int],
    label: str,
    lat: float,
    lon: float,
    score: Optional[float],
    source: Optional[str],
    tenant_id: Optional[str],
) -> int:
    with connect(db_path) as conn:
        cur = conn.execute(
            "INSERT INTO geo_suggestions (doc_id, task_id, label, lat, lon, score, source, status, tenant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
            (doc_id, task_id, label, lat, lon, score, source, tenant_id, time.time()),
        )
        conn.commit()
        return int(cur.lastrowid)


def list_suggestions(db_path: Path, doc_id: int, tenant_id: Optional[str] = None) -> List[sqlite3.Row]:
    with connect(db_path) as conn:
        if tenant_id:
            return conn.execute(
                "SELECT * FROM geo_suggestions WHERE doc_id=? AND tenant_id=? ORDER BY created_at DESC",
                (doc_id, tenant_id),
            ).fetchall()
        return conn.execute(
            "SELECT * FROM geo_suggestions WHERE doc_id=? ORDER BY created_at DESC",
            (doc_id,),
        ).fetchall()


def _update_suggestion_status(db_path: Path, suggestion_id: int, status: str, tenant_id: Optional[str]) -> None:
    with connect(db_path) as conn:
        if tenant_id:
            conn.execute(
                "UPDATE geo_suggestions SET status=? WHERE id=? AND tenant_id=?",
                (status, suggestion_id, tenant_id),
            )
        else:
            conn.execute("UPDATE geo_suggestions SET status=? WHERE id=?", (status, suggestion_id))
        conn.commit()


def accept_suggestion(db_path: Path, suggestion_id: int, doc_row: sqlite3.Row, tenant_id: Optional[str]) -> None:
    with connect(db_path) as conn:
        if tenant_id:
            sug = conn.execute(
                "SELECT * FROM geo_suggestions WHERE id=? AND tenant_id=?",
                (suggestion_id, tenant_id),
            ).fetchone()
        else:
            sug = conn.execute("SELECT * FROM geo_suggestions WHERE id=?", (suggestion_id,)).fetchone()
        if not sug:
            raise ValueError("Suggestion not found")
        if sug["doc_id"] != doc_row["id"]:
            raise ValueError("Suggestion does not belong to this document")
        # Add to geo_points
        add_geo_points(
            db_path,
            doc_id=doc_row["id"],
            task_id=doc_row["task_id"],
            theme=doc_row["theme"],
            title=doc_row["title"] or Path(doc_row["file_path"]).name,
            coords=[(sug["lat"], sug["lon"])],
            tenant_id=sug["tenant_id"],
        )
        _update_suggestion_status(db_path, suggestion_id, "accepted", tenant_id)


def reject_suggestion(db_path: Path, suggestion_id: int, tenant_id: Optional[str]) -> None:
    _update_suggestion_status(db_path, suggestion_id, "rejected", tenant_id)


def update_geo_point(db_path: Path, coord_id: int, doc_id: int, lat: float, lon: float, tenant_id: Optional[str]) -> None:
    with connect(db_path) as conn:
        if tenant_id:
            conn.execute(
                "UPDATE geo_points SET lat=?, lon=? WHERE id=? AND doc_id=? AND tenant_id=?",
                (lat, lon, coord_id, doc_id, tenant_id),
            )
        else:
            conn.execute(
                "UPDATE geo_points SET lat=?, lon=? WHERE id=? AND doc_id=?",
                (lat, lon, coord_id, doc_id),
            )
        conn.commit()
