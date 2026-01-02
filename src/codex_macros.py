from __future__ import annotations

import json
import os
import shlex
from pathlib import Path
from typing import Any


DEFAULT_MACROS: list[dict[str, Any]] = [
    {
        "id": "codex_exec_env_runner",
        "name": "Codex exec (env runner)",
        "description": "Run one Codex exec batch using the env runner script.",
        "group": "Codex",
        "template": "bash 99_Working_Files/Utilities/codex_exec_runner.sh {theme}",
        "fields": [
            {"key": "theme", "label": "Theme", "type": "string", "required": True},
        ],
    },
    {
        "id": "codex_get_task",
        "name": "get-task (fetch batch)",
        "description": "Fetch a new batch for a theme.",
        "group": "Codex",
        "template": "python3 99_Working_Files/refinement_workflow.py get-task --theme {theme}",
        "fields": [{"key": "theme", "label": "Theme", "type": "string", "required": True}],
    },
    {
        "id": "manager_approve_all",
        "name": "manager-approve (all)",
        "description": "Approve all ManagerReview tasks for a theme.",
        "group": "Manager",
        "template": "python3 99_Working_Files/refinement_workflow.py manager-approve --theme {theme} --all",
        "fields": [{"key": "theme", "label": "Theme", "type": "string", "required": True}],
    },
    {
        "id": "manager_approve_ids",
        "name": "manager-approve (ids)",
        "description": "Approve specific task IDs (comma-separated).",
        "group": "Manager",
        "template": "python3 99_Working_Files/refinement_workflow.py manager-approve --theme {theme} --ids {ids}",
        "fields": [
            {"key": "theme", "label": "Theme", "type": "string", "required": True},
            {"key": "ids", "label": "Task IDs", "type": "string", "required": True},
        ],
    },
    {
        "id": "manager_reject_all",
        "name": "manager-reject (all)",
        "description": "Reject all ManagerReview tasks for a theme.",
        "group": "Manager",
        "template": "python3 99_Working_Files/refinement_workflow.py manager-reject --theme {theme} --all --reason {reason}",
        "fields": [
            {"key": "theme", "label": "Theme", "type": "string", "required": True},
            {"key": "reason", "label": "Reason", "type": "string", "required": True, "default": "Needs review"},
        ],
    },
    {
        "id": "renew_lock_ids",
        "name": "renew-lock (ids)",
        "description": "Renew locks for specific IDs.",
        "group": "Locks",
        "template": "python3 99_Working_Files/refinement_workflow.py renew-lock --theme {theme} --ids {ids}",
        "fields": [
            {"key": "theme", "label": "Theme", "type": "string", "required": True},
            {"key": "ids", "label": "Task IDs", "type": "string", "required": True},
        ],
    },
    {
        "id": "reset_queue_theme",
        "name": "reset-queue (theme)",
        "description": "Reset a thematic queue shard.",
        "group": "Queues",
        "template": "python3 99_Working_Files/refinement_workflow.py reset-queue --theme {theme}",
        "fields": [{"key": "theme", "label": "Theme", "type": "string", "required": True}],
    },
    {
        "id": "reap_stale_theme",
        "name": "reap-stale (theme)",
        "description": "Reap stale locks for a theme.",
        "group": "Locks",
        "template": (
            "python3 99_Working_Files/Scripts/Queue_Management/reap_stale_locks.py "
            "--theme {theme} --mins {mins}"
        ),
        "fields": [
            {"key": "theme", "label": "Theme", "type": "string", "required": True},
            {"key": "mins", "label": "Minutes stale", "type": "number", "required": False, "default": 120},
        ],
    },
    {
        "id": "add_theme",
        "name": "add-theme",
        "description": "Create queue shards for a new theme.",
        "group": "Queues",
        "template": "python3 99_Working_Files/Scripts/Queue_Management/codex_pipeline_kit/add_theme.py {theme}",
        "fields": [{"key": "theme", "label": "Theme name", "type": "string", "required": True}],
    },
    {
        "id": "audit_format_duplicates",
        "name": "Audit format duplicates",
        "description": "Scan refined evidence for duplicate format blocks.",
        "group": "Audits",
        "template": "python3 99_Working_Files/Utilities/audit_format_duplicates.py",
        "fields": [],
    },
    {
        "id": "audit_pending_duplication",
        "name": "Audit pending duplication",
        "description": "Detect duplicate Pending tasks across shards.",
        "group": "Audits",
        "template": "python3 99_Working_Files/Utilities/audit_pending_duplication.py",
        "fields": [],
    },
    {
        "id": "audit_task_overlap",
        "name": "Audit task overlap",
        "description": "Check overlap between queues and refined outputs.",
        "group": "Audits",
        "template": "python3 99_Working_Files/Utilities/audit_task_overlap.py",
        "fields": [],
    },
    {
        "id": "fix_format_duplicates",
        "name": "Fix format duplicates",
        "description": "Auto-fix refined evidence format duplicates (writes backups).",
        "group": "Audits",
        "template": "python3 99_Working_Files/Utilities/fix_format_duplicates.py",
        "fields": [],
    },
    {
        "id": "sync_refined_to_queues",
        "name": "Sync refined to queues",
        "description": "Synchronize refined evidence statuses back to queue shards.",
        "group": "Audits",
        "template": "python3 99_Working_Files/Utilities/sync_refined_to_queues.py",
        "fields": [],
    },
]


def _load_override_file() -> list[dict[str, Any]] | None:
    override_path = os.getenv("PUKAIST_CODEX_MACROS_FILE")
    if not override_path:
        return None
    path = Path(override_path)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    if isinstance(data, list):
        return [d for d in data if isinstance(d, dict) and d.get("id") and d.get("template")]
    return None


def list_macros() -> list[dict[str, Any]]:
    overrides = _load_override_file()
    return overrides or DEFAULT_MACROS


def build_macro_command(macro_id: str, args: dict[str, Any]) -> str:
    macros = {m["id"]: m for m in list_macros()}
    macro = macros.get(macro_id)
    if not macro:
        raise KeyError(f"Unknown macro {macro_id}")
    quoted: dict[str, str] = {}
    for field in macro.get("fields") or []:
        key = str(field.get("key") or "")
        if not key:
            continue
        if key in args and args[key] not in (None, ""):
            quoted[key] = shlex.quote(str(args[key]))
        else:
            default = field.get("default")
            if default not in (None, ""):
                quoted[key] = shlex.quote(str(default))
    # Ensure required fields are present
    for field in macro.get("fields") or []:
        if field.get("required") and str(field.get("key")) not in quoted:
            raise ValueError(f"Missing required field {field.get('key')}")
    template = str(macro.get("template") or "")
    return template.format(**quoted)
