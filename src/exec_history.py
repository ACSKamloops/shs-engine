from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Any

DEFAULT_MAX_LINES = int(os.getenv("PUKAIST_CLI_HISTORY_MAX_LINES", "10000"))


def history_path(log_dir: Path) -> Path:
    return log_dir / "cli_exec_history.jsonl"


def new_run_id() -> str:
    return uuid.uuid4().hex


def append_run(log_dir: Path, event: dict[str, Any], max_lines: int | None = None) -> None:
    path = history_path(log_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(event, ensure_ascii=False) + "\n")
    except Exception:
        return
    _trim(path, max_lines or DEFAULT_MAX_LINES)


def read_runs(log_dir: Path, limit: int = 200, offset: int = 0) -> list[dict[str, Any]]:
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

