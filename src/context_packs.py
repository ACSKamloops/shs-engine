from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any


def packs_path(log_dir: Path) -> Path:
    return log_dir / "codex_context_packs.json"


def list_packs(log_dir: Path, tenant_id: str | None = None) -> list[dict[str, Any]]:
    path = packs_path(log_dir)
    if not path.exists():
        return []
    try:
        packs = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        packs = []
    if not isinstance(packs, list):
        packs = []
    out: list[dict[str, Any]] = []
    for p in packs:
        if not isinstance(p, dict) or not p.get("id"):
            continue
        if tenant_id and p.get("tenant_id") not in (tenant_id, None, ""):
            continue
        out.append(p)
    out.sort(key=lambda d: d.get("updated_at") or d.get("created_at") or 0, reverse=True)
    return out


def get_pack(log_dir: Path, pack_id: str, tenant_id: str | None = None) -> dict[str, Any] | None:
    for p in list_packs(log_dir, tenant_id=tenant_id):
        if p.get("id") == pack_id:
            return p
    return None


def save_pack(
    log_dir: Path,
    payload: dict[str, Any],
    tenant_id: str | None = None,
) -> dict[str, Any]:
    packs = list_packs(log_dir, tenant_id=None)
    now = time.time()
    pack_id = str(payload.get("id") or "").strip() or uuid.uuid4().hex
    existing = next((p for p in packs if p.get("id") == pack_id), None)
    pack = {
        "id": pack_id,
        "name": str(payload.get("name") or "").strip(),
        "themes": payload.get("themes") or [],
        "content": str(payload.get("content") or ""),
        "created_at": (existing or {}).get("created_at") or now,
        "updated_at": now,
        "tenant_id": tenant_id if tenant_id is not None else (existing or {}).get("tenant_id"),
        "default": bool(payload.get("default")) if "default" in payload else (existing or {}).get("default", False),
    }
    # Normalize themes
    if isinstance(pack["themes"], str):
        pack["themes"] = [t.strip() for t in pack["themes"].split(",") if t.strip()]
    if not isinstance(pack["themes"], list):
        pack["themes"] = []
    pack["themes"] = [str(t) for t in pack["themes"] if str(t).strip()]

    if existing:
        idx = packs.index(existing)
        packs[idx] = pack
    else:
        packs.append(pack)
    packs_path(log_dir).write_text(json.dumps(packs, ensure_ascii=False, indent=2), encoding="utf-8")
    return pack


def delete_pack(log_dir: Path, pack_id: str, tenant_id: str | None = None) -> bool:
    packs = list_packs(log_dir, tenant_id=None)
    kept: list[dict[str, Any]] = []
    removed = False
    for p in packs:
        if p.get("id") == pack_id and (tenant_id is None or p.get("tenant_id") in (tenant_id, None, "")):
            removed = True
            continue
        kept.append(p)
    if not removed:
        return False
    packs_path(log_dir).write_text(json.dumps(kept, ensure_ascii=False, indent=2), encoding="utf-8")
    return True


def packs_for_theme(
    log_dir: Path,
    theme: str | None,
    pack_ids: list[str] | None = None,
    tenant_id: str | None = None,
) -> list[dict[str, Any]]:
    theme_val = (theme or "").strip()
    packs = list_packs(log_dir, tenant_id=tenant_id)
    by_id = {p.get("id"): p for p in packs if p.get("id")}
    selected: list[dict[str, Any]] = []
    if pack_ids:
        for pid in pack_ids:
            p = by_id.get(pid)
            if p:
                selected.append(p)
    # Auto-include default packs for theme
    if theme_val:
        for p in packs:
            if p.get("default") and theme_val in (p.get("themes") or []):
                if p not in selected:
                    selected.append(p)
    return selected

