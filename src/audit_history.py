from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any, Iterable

DEFAULT_MAX_LINES = int(os.getenv("PUKAIST_AUDIT_HISTORY_MAX_LINES", "20000"))


def history_path(log_dir: Path) -> Path:
    return log_dir / "audit_history.jsonl"


def append_event(log_dir: Path, event: dict[str, Any], max_lines: int | None = None) -> None:
    """
    Append a structured audit event to disk.

    Event schema is flexible but should include at least:
      - ts: unix timestamp (float)
      - action: short action string
      - tenant_id / actor / roles (when available)
    """
    path = history_path(log_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    if "ts" not in event:
        event = {**event, "ts": time.time()}
    try:
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(event, ensure_ascii=False) + "\n")
    except Exception:
        return
    _trim(path, max_lines or DEFAULT_MAX_LINES)


def read_events(log_dir: Path, limit: int = 200, offset: int = 0) -> list[dict[str, Any]]:
    path = history_path(log_dir)
    if not path.exists():
        return []
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except Exception:
        return []
    lines.reverse()
    slice_lines = lines[offset : offset + limit]
    out: list[dict[str, Any]] = []
    for ln in slice_lines:
        try:
            out.append(json.loads(ln))
        except Exception:
            continue
    return out


def _trim(path: Path, max_lines: int) -> None:
    if max_lines <= 0:
        return
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        if len(lines) <= max_lines:
            return
        tail = lines[-max_lines:]
        path.write_text("\n".join(tail) + "\n", encoding="utf-8")
    except Exception:
        return

