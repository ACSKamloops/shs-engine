from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional


def _collections_path(index_dir: Path) -> Path:
    index_dir.mkdir(parents=True, exist_ok=True)
    return index_dir / "collections.json"


def load_collections(index_dir: Path) -> List[Dict[str, Any]]:
    path = _collections_path(index_dir)
    if not path.exists():
        return []
    return json.loads(path.read_text() or "[]")


def save_collections(index_dir: Path, collections: List[Dict[str, Any]]) -> None:
    path = _collections_path(index_dir)
    path.write_text(json.dumps(collections, indent=2))


def list_collections(index_dir: Path, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
    cols = load_collections(index_dir)
    if tenant_id:
        cols = [c for c in cols if c.get("tenant_id") == tenant_id]
    return cols


def add_to_collection(index_dir: Path, name: str, doc_id: int, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    cols = load_collections(index_dir)
    normalized = name.strip()
    target: Dict[str, Any] | None = None
    for c in cols:
        if c.get("name") == normalized and c.get("tenant_id") == tenant_id:
            target = c
            break
    if not target:
        target = {"name": normalized, "tenant_id": tenant_id, "doc_ids": []}
        cols.append(target)
    doc_ids = target.get("doc_ids") or []
    if doc_id not in doc_ids:
        doc_ids.append(doc_id)
        target["doc_ids"] = doc_ids
    save_collections(index_dir, cols)
    return target


def remove_from_collection(index_dir: Path, name: str, doc_id: int, tenant_id: Optional[str] = None) -> bool:
    """Remove a document from a collection. Returns True if successful."""
    cols = load_collections(index_dir)
    normalized = name.strip()
    for c in cols:
        if c.get("name") == normalized and c.get("tenant_id") == tenant_id:
            doc_ids = c.get("doc_ids") or []
            if doc_id in doc_ids:
                doc_ids.remove(doc_id)
                c["doc_ids"] = doc_ids
                save_collections(index_dir, cols)
                return True
    return False


def delete_collection(index_dir: Path, name: str, tenant_id: Optional[str] = None) -> bool:
    """Delete an entire collection. Returns True if successful."""
    cols = load_collections(index_dir)
    normalized = name.strip()
    new_cols = [c for c in cols if not (c.get("name") == normalized and c.get("tenant_id") == tenant_id)]
    if len(new_cols) == len(cols):
        return False
    save_collections(index_dir, new_cols)
    return True


def create_collection(index_dir: Path, name: str, doc_ids: List[int] | None = None, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """Create a new collection with optional initial doc_ids."""
    cols = load_collections(index_dir)
    normalized = name.strip()
    # Check if exists
    for c in cols:
        if c.get("name") == normalized and c.get("tenant_id") == tenant_id:
            # Already exists, add doc_ids if provided
            if doc_ids:
                existing = c.get("doc_ids") or []
                for did in doc_ids:
                    if did not in existing:
                        existing.append(did)
                c["doc_ids"] = existing
            save_collections(index_dir, cols)
            return c
    # Create new
    new_col = {"name": normalized, "tenant_id": tenant_id, "doc_ids": doc_ids or []}
    cols.append(new_col)
    save_collections(index_dir, cols)
    return new_col
