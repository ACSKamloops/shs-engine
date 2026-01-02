from __future__ import annotations

import json
import time
import uuid
from pathlib import Path
from typing import Any


def chats_dir(log_dir: Path) -> Path:
    path = log_dir / "codex_chats"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _chat_path(log_dir: Path, chat_id: str) -> Path:
    return chats_dir(log_dir) / f"{chat_id}.json"


def list_chats(log_dir: Path, tenant_id: str | None = None) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for p in sorted(chats_dir(log_dir).glob("*.json")):
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
        if tenant_id and data.get("tenant_id") not in (tenant_id, None, ""):
            continue
        messages = data.get("messages") or []
        items.append(
            {
                "id": data.get("id") or p.stem,
                "title": data.get("title") or "",
                "theme": data.get("theme") or "",
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
                "message_count": len(messages) if isinstance(messages, list) else 0,
                "context_pack_ids": data.get("context_pack_ids") or [],
            }
        )
    items.sort(key=lambda d: d.get("updated_at") or d.get("created_at") or 0, reverse=True)
    return items


def load_chat(log_dir: Path, chat_id: str, tenant_id: str | None = None) -> dict[str, Any] | None:
    path = _chat_path(log_dir, chat_id)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    if tenant_id and data.get("tenant_id") not in (tenant_id, None, ""):
        return None
    return data


def create_chat(
    log_dir: Path,
    theme: str | None = None,
    title: str | None = None,
    context_pack_ids: list[str] | None = None,
    tenant_id: str | None = None,
) -> dict[str, Any]:
    now = time.time()
    chat_id = uuid.uuid4().hex
    chat: dict[str, Any] = {
        "id": chat_id,
        "title": title or "",
        "theme": theme or "",
        "context_pack_ids": context_pack_ids or [],
        "created_at": now,
        "updated_at": now,
        "messages": [],
        "tenant_id": tenant_id,
    }
    save_chat(log_dir, chat)
    return chat


def save_chat(log_dir: Path, chat: dict[str, Any]) -> None:
    chat_id = str(chat.get("id") or "").strip()
    if not chat_id:
        return
    chat["updated_at"] = chat.get("updated_at") or time.time()
    path = _chat_path(log_dir, chat_id)
    path.write_text(json.dumps(chat, ensure_ascii=False, indent=2), encoding="utf-8")


def update_chat(
    log_dir: Path,
    chat_id: str,
    patch: dict[str, Any],
    tenant_id: str | None = None,
) -> dict[str, Any] | None:
    chat = load_chat(log_dir, chat_id, tenant_id=tenant_id)
    if not chat:
        return None
    for k in ("title", "theme", "context_pack_ids"):
        if k in patch:
            chat[k] = patch[k]
    chat["updated_at"] = time.time()
    save_chat(log_dir, chat)
    return chat


def append_message(
    log_dir: Path,
    chat_id: str,
    role: str,
    content: str,
    tenant_id: str | None = None,
) -> dict[str, Any] | None:
    chat = load_chat(log_dir, chat_id, tenant_id=tenant_id)
    if not chat:
        return None
    messages = chat.get("messages")
    if not isinstance(messages, list):
        messages = []
        chat["messages"] = messages
    messages.append({"role": role, "content": content, "ts": time.time()})
    chat["updated_at"] = time.time()
    save_chat(log_dir, chat)
    return chat


def delete_chat(log_dir: Path, chat_id: str, tenant_id: str | None = None) -> bool:
    chat = load_chat(log_dir, chat_id, tenant_id=tenant_id)
    if not chat:
        return False
    path = _chat_path(log_dir, chat_id)
    try:
        path.unlink()
        return True
    except Exception:
        return False

