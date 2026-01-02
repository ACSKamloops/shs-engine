from __future__ import annotations

"""
Hybrid search stub using embeddings when enabled.
For now, this is a placeholder that defers to FTS unless an embeddings backend is wired in.
"""

from typing import List, Optional, Tuple
from pathlib import Path
import sqlite3
import json
import math

from .config import Settings
from .search_index import search as fts_search


EMBEDDINGS_SCHEMA = """
CREATE TABLE IF NOT EXISTS embeddings (
    doc_id INTEGER PRIMARY KEY,
    tenant_id TEXT,
    vector TEXT
);
"""


def _connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init(db_path: Path) -> None:
    with _connect(db_path) as conn:
        conn.executescript(EMBEDDINGS_SCHEMA)
        conn.commit()


def store_embedding(db_path: Path, doc_id: int, tenant_id: Optional[str], vector: List[float]) -> None:
    init(db_path)
    with _connect(db_path) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO embeddings (doc_id, tenant_id, vector) VALUES (?, ?, ?)",
            (doc_id, tenant_id, json.dumps(vector)),
        )
        conn.commit()


def _cosine(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return -1.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return -1.0
    return dot / (na * nb)


def hybrid_search(db_path: Path, query: str, limit: int = 20, tenant_id: Optional[str] = None) -> List[sqlite3.Row]:
    settings = Settings.load()
    # Fallback to FTS if embeddings are disabled.
    if not settings.embeddings_enabled:
        return fts_search(db_path, query, limit=limit, tenant_id=tenant_id)

    # Run FTS first to get candidate doc_ids.
    candidates = fts_search(db_path, query, limit=limit * 3, tenant_id=tenant_id)
    if not candidates:
        return []

    # Embed the query using the embeddings client (if configured).
    try:
        from .embeddings import EmbeddingsClient
    except Exception:
        return candidates[:limit]

    client = EmbeddingsClient(
        provider=settings.embeddings_provider or settings.llm_provider,
        model=settings.embeddings_model or settings.llm_model,
    )
    query_vecs = client.embed([query], input_type="query")
    if not query_vecs:
        return candidates[:limit]
    qvec = query_vecs[0]

    # Load embeddings for candidate docs and compute cosine similarity.
    init(db_path)
    scored: List[Tuple[float, sqlite3.Row]] = []
    with _connect(db_path) as conn:
        for row in candidates:
            emb_row = conn.execute(
                "SELECT vector FROM embeddings WHERE doc_id=? AND ((tenant_id IS NULL AND ? IS NULL) OR tenant_id=?)",
                (row["id"], tenant_id, tenant_id),
            ).fetchone()
            if not emb_row or not emb_row["vector"]:
                continue
            try:
                vec = json.loads(emb_row["vector"])
            except Exception:
                continue
            score = _cosine(qvec, vec)
            if score >= 0:
                scored.append((score, row))

    if not scored:
        return candidates[:limit]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored[:limit]]
