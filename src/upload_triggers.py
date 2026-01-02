"""
Upload trigger handling for Pukaist Engine worker.

Manages background macro execution triggered by file uploads, including
command allowlisting, process spawning, and async trigger queue processing.
"""

from __future__ import annotations

import logging
import os
import queue as _queue
import shlex
import subprocess
import threading
import time
from pathlib import Path
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from .config import Settings
    from .codex_autorun import AutoRunConfig

logger = logging.getLogger("pukaist.upload_triggers")

# ---------------------------------------------------------------------------
# Command allowlist configuration
# ---------------------------------------------------------------------------

DEFAULT_ALLOWED_PREFIXES = [
    "python3 99_Working_Files/refinement_workflow.py",
    "python 99_Working_Files/refinement_workflow.py",
    "bash 99_Working_Files/Utilities/codex_exec_runner.sh",
    "codex exec",
    "python3 99_Working_Files/Scripts/Queue_Management/reap_stale_locks.py",
    "python3 99_Working_Files/Scripts/Queue_Management/codex_pipeline_kit/add_theme.py",
    "python3 99_Working_Files/Scripts/Queue_Management/codex_pipeline_kit/heartbeat_renew_lock.py",
    "python3 99_Working_Files/manage_communication_log_v2.py",
    "python3 99_Working_Files/smart_queue_builder.py",
    "python3 99_Working_Files/system_consolidator.py",
    "python3 99_Working_Files/gatekeeper_automation.py",
    "python3 99_Working_Files/audit_evidence_quality.py",
    "python3 99_Working_Files/Utilities/audit_format_duplicates.py",
    "python3 99_Working_Files/Utilities/audit_pending_duplication.py",
    "python3 99_Working_Files/Utilities/audit_task_overlap.py",
    "python3 99_Working_Files/Utilities/fix_format_duplicates.py",
    "python3 99_Working_Files/Utilities/sync_refined_to_queues.py",
]

_allowed_prefixes_env = os.getenv("PUKAIST_CLI_ALLOWED_PREFIXES")
ALLOWED_PREFIXES = [
    p.strip()
    for p in (_allowed_prefixes_env.split(",") if _allowed_prefixes_env else DEFAULT_ALLOWED_PREFIXES)
    if p.strip()
]


def command_allowed(command: str) -> bool:
    """Check if a command is in the allowlist."""
    try:
        cmd_tokens = shlex.split(command)
    except Exception:
        return False
    for prefix in ALLOWED_PREFIXES:
        try:
            prefix_tokens = shlex.split(prefix)
        except Exception:
            continue
        if cmd_tokens[: len(prefix_tokens)] == prefix_tokens:
            return True
    return False


# ---------------------------------------------------------------------------
# Macro process tracking
# ---------------------------------------------------------------------------

_UPLOAD_TRIGGER_QUEUE: _queue.Queue[tuple[str, str | None, "Settings"]] = _queue.Queue(maxsize=5000)
_UPLOAD_TRIGGER_THREAD_STARTED = False
_UPLOAD_TRIGGER_THREAD_LOCK = threading.Lock()

_UPLOAD_MACRO_PROCS: list[dict[str, Any]] = []
_UPLOAD_MACRO_LOCK = threading.Lock()


def _read_tail(path: Path, max_bytes: int = 4000) -> str:
    """Read the tail of a log file."""
    try:
        if not path.exists():
            return ""
        size = path.stat().st_size
        with path.open("rb") as fh:
            if size > max_bytes:
                fh.seek(size - max_bytes)
            data = fh.read()
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def reap_upload_macro_procs(settings: "Settings") -> None:
    """
    Clean up finished macro processes and record their execution history.
    
    Should be called periodically from the worker main loop.
    """
    from . import exec_history
    from . import audit_history

    finished: list[dict[str, Any]] = []
    with _UPLOAD_MACRO_LOCK:
        alive: list[dict[str, Any]] = []
        for item in _UPLOAD_MACRO_PROCS:
            proc = item.get("proc")
            if proc and hasattr(proc, "poll") and proc.poll() is not None:
                finished.append(item)
            else:
                alive.append(item)
        _UPLOAD_MACRO_PROCS[:] = alive

    for item in finished:
        try:
            ts_end = time.time()
            ts_start = float(item.get("ts_start") or ts_end)
            duration_ms = int(max(ts_end - ts_start, 0.0) * 1000)
            proc = item.get("proc")
            exit_code = getattr(proc, "returncode", None)
            cmd = str(item.get("command") or "")
            log_path = item.get("log_path")
            output_tail = _read_tail(log_path) if isinstance(log_path, Path) else ""
            exec_history.append_run(
                settings.log_dir,
                {
                    "run_id": item.get("run_id") or exec_history.new_run_id(),
                    "ts_start": ts_start,
                    "ts_end": ts_end,
                    "duration_ms": duration_ms,
                    "command": cmd,
                    "exit_code": exit_code,
                    "autorun": True,
                    "trigger": "upload",
                    "theme": item.get("theme"),
                    "macro_id": item.get("macro_id"),
                    "output_len": len(output_tail),
                    "output_tail": output_tail[-4000:],
                },
            )
            audit_history.append_event(
                settings.log_dir,
                {
                    "action": "upload_macro_end",
                    "run_id": item.get("run_id"),
                    "macro_id": item.get("macro_id"),
                    "theme": item.get("theme"),
                    "tenant_id": item.get("tenant_id"),
                    "exit_code": exit_code,
                    "duration_ms": duration_ms,
                    "log_path": str(log_path) if isinstance(log_path, Path) else None,
                },
            )
        except Exception:
            continue


def _spawn_upload_macro(
    *,
    settings: "Settings",
    cfg: "AutoRunConfig",
    theme: str,
    tenant_id: str | None,
    macro_id: str,
    args: dict[str, Any],
    env_override: dict[str, str],
) -> None:
    """Spawn a background macro process for upload triggers."""
    from . import codex_macros
    from . import exec_history
    from . import audit_history

    if "theme" not in args:
        args["theme"] = theme
    try:
        cmd = codex_macros.build_macro_command(macro_id, args)
    except Exception as exc:
        logger.error("upload macro build failed (%s): %s", macro_id, exc)
        return
    if not command_allowed(cmd):
        logger.warning("upload macro command not allowlisted: %s", cmd)
        return
    try:
        argv = shlex.split(cmd)
    except Exception:
        logger.warning("upload macro command failed to parse: %s", cmd)
        return
    if not argv:
        return

    merged_env = os.environ.copy()
    try:
        merged_env.update({k: str(v) for k, v in (cfg.codex_env or {}).items() if isinstance(k, str)})
    except Exception:
        pass
    merged_env.update(env_override)
    merged_env.setdefault("PUKAIST_AGENT", "AutoTrigger")

    ts = time.strftime("%Y%m%d_%H%M%S")
    log_path = settings.log_dir / f"macro_upload_{macro_id}_{theme}_{ts}.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    run_id = exec_history.new_run_id()
    ts_start = time.time()
    try:
        fh = log_path.open("wb")
        proc = subprocess.Popen(
            argv,
            cwd=str(settings.workspace.parent),
            env=merged_env,
            stdout=fh,
            stderr=subprocess.STDOUT,
        )
        try:
            fh.close()
        except Exception:
            pass
        audit_history.append_event(
            settings.log_dir,
            {
                "action": "upload_macro_spawn",
                "run_id": run_id,
                "macro_id": macro_id,
                "theme": theme,
                "tenant_id": tenant_id,
                "command": cmd,
                "log_path": str(log_path),
            },
        )
        with _UPLOAD_MACRO_LOCK:
            _UPLOAD_MACRO_PROCS.append(
                {
                    "proc": proc,
                    "run_id": run_id,
                    "ts_start": ts_start,
                    "command": cmd,
                    "theme": theme,
                    "macro_id": macro_id,
                    "tenant_id": tenant_id,
                    "log_path": log_path,
                }
            )
    except Exception as exc:
        logger.exception("failed to spawn upload macro %s: %s", macro_id, exc)


def _run_upload_macros_for_theme(theme: str, tenant_id: str | None, settings: "Settings") -> None:
    """Run all configured upload macros for a given theme."""
    from . import codex_autorun

    try:
        cfg = codex_autorun.load_config(settings.log_dir)
    except Exception:
        return
    if not getattr(cfg, "on_upload_enabled", False):
        return
    macros_map = getattr(cfg, "on_upload_macros", {}) or {}
    specs: list[object] = []
    if isinstance(macros_map, dict):
        for key in ("*", "all"):
            v = macros_map.get(key)
            if isinstance(v, list):
                specs.extend(v)
        v_theme = macros_map.get(theme) or macros_map.get(theme.lower())
        if isinstance(v_theme, list):
            specs.extend(v_theme)
    if not specs:
        return

    delay = int(getattr(cfg, "on_upload_delay_sec", 0) or 0)
    if delay > 0:
        try:
            time.sleep(delay)
        except Exception:
            pass

    for spec in specs:
        macro_id = None
        args: dict[str, Any] = {}
        env_override: dict[str, str] = {}
        if isinstance(spec, str):
            macro_id = spec
        elif isinstance(spec, dict):
            macro_id = str(spec.get("id") or spec.get("macro_id") or "").strip() or None
            if isinstance(spec.get("args"), dict):
                args = {k: v for k, v in spec["args"].items()}
            if isinstance(spec.get("env"), dict):
                env_override = {
                    k: str(v)
                    for k, v in spec["env"].items()
                    if isinstance(k, str) and isinstance(v, (str, int, float, bool))
                }
        if not macro_id:
            continue
        _spawn_upload_macro(
            settings=settings,
            cfg=cfg,
            theme=theme,
            tenant_id=tenant_id,
            macro_id=macro_id,
            args=args,
            env_override=env_override,
        )


def _upload_trigger_loop() -> None:
    """Background thread loop processing upload triggers."""
    while True:
        theme, tenant_id, settings = _UPLOAD_TRIGGER_QUEUE.get()
        try:
            _run_upload_macros_for_theme(theme, tenant_id, settings)
        except Exception:
            pass
        finally:
            _UPLOAD_TRIGGER_QUEUE.task_done()


def _ensure_upload_trigger_thread() -> None:
    """Ensure the background trigger processing thread is running."""
    global _UPLOAD_TRIGGER_THREAD_STARTED
    if _UPLOAD_TRIGGER_THREAD_STARTED:
        return
    with _UPLOAD_TRIGGER_THREAD_LOCK:
        if _UPLOAD_TRIGGER_THREAD_STARTED:
            return
        t = threading.Thread(target=_upload_trigger_loop, name="pukaist-upload-macro-trigger", daemon=True)
        t.start()
        _UPLOAD_TRIGGER_THREAD_STARTED = True


def maybe_trigger_upload_macros(theme: str, tenant_id: str | None, settings: "Settings") -> None:
    """
    Queue an upload trigger for processing if upload macros are enabled.
    
    This is the main entry point called from the worker after successful task completion.
    """
    from . import codex_autorun

    try:
        cfg = codex_autorun.load_config(settings.log_dir)
    except Exception:
        return
    if not getattr(cfg, "on_upload_enabled", False):
        return
    _ensure_upload_trigger_thread()
    try:
        _UPLOAD_TRIGGER_QUEUE.put_nowait((theme, tenant_id, settings))
    except Exception:
        logger.warning("upload macro trigger queue full; dropping trigger theme=%s", theme)
