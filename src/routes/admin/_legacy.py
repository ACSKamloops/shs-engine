"""
Admin routes for Pukaist Engine API.

Handles projects, collections, metrics, logs, index rebuild, and LLM helpers.
"""

from __future__ import annotations

import asyncio
import csv
import json
import os
import re
import shlex
import subprocess
import time
from dataclasses import asdict
import io
import zipfile
from pathlib import Path
from typing import Any, Optional, Callable

from fastapi import APIRouter, Depends, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from starlette.responses import StreamingResponse

from ...config import Settings
from ...project_config import ProjectConfig
from ... import search_index
from ... import aoi_store
from ... import poi_store
from ... import collection_store
from ... import exec_history
from ... import metrics_history
from ... import codex_macros
from ... import chat_store
from ... import context_packs
from ... import codex_autorun
from ...metrics import metrics
from ... import analytics
from ... import knowledge_graph
from ... import audit_history
from .. import settings, logger, verify_token, auth_context, get_llm_client, require_role, resolve_auth

router = APIRouter(tags=["admin"])


# ─────────────────────────────────────────────────────────────────────────────
# Codex CLI / Refinement Pipeline Integration (safe admin-only surface)
# ─────────────────────────────────────────────────────────────────────────────

CLI_ENABLED = os.getenv("PUKAIST_CLI_ENABLED", "false").lower() in {"1", "true", "yes", "on"}

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

_RUNNING_PROCS: dict[str, asyncio.subprocess.Process] = {}


def _command_allowed(command: str) -> bool:
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


def _argv_or_400(command: str) -> list[str]:
    try:
        argv = shlex.split(command)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid command")
    if not argv:
        raise HTTPException(status_code=400, detail="invalid command")
    return argv


def _audit_event(auth: dict, action: str, **fields: Any) -> None:
    """
    Best-effort structured audit logging.
    """
    try:
        event: dict[str, Any] = {
            "action": action,
            "tenant_id": auth.get("tenant_id"),
            "roles": auth.get("roles") or [],
            **fields,
        }
        audit_history.append_event(settings.log_dir, event)
    except Exception:
        return


async def _run_shell(
    command: str,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    run_id: str | None = None,
) -> dict[str, Any]:
    argv = _argv_or_400(command)
    started = time.time()
    rid = run_id or exec_history.new_run_id()
    merged_env = os.environ.copy()
    if env:
        for k, v in env.items():
            if isinstance(k, str) and isinstance(v, str):
                merged_env[k] = v
    proc = await asyncio.create_subprocess_exec(
        *argv,
        cwd=str(cwd or settings.workspace.parent),
        env=merged_env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    out_bytes, _ = await proc.communicate()
    ended = time.time()
    out = out_bytes.decode("utf-8", errors="ignore")
    result = {
        "command": command,
        "exit_code": proc.returncode,
        "output": out,
        "run_id": rid,
        "duration_ms": int((ended - started) * 1000),
    }
    try:
        exec_history.append_run(
            settings.log_dir,
            {
                "run_id": rid,
                "ts_start": started,
                "ts_end": ended,
                "duration_ms": result["duration_ms"],
                "command": command,
                "exit_code": proc.returncode,
                "env_keys": sorted(env.keys()) if env else [],
                "output_len": len(out),
                "output_tail": out[-4000:],
            },
        )
    except Exception:
        pass
    return result


def _sse(event: str, data: Any) -> bytes:
    try:
        payload = json.dumps(data, ensure_ascii=False)
    except Exception:
        payload = json.dumps({"data": str(data)})
    return f"event: {event}\ndata: {payload}\n\n".encode("utf-8")


def _parse_skill_frontmatter(text: str) -> dict[str, str]:
    """
    Best-effort parser for SKILL.md YAML frontmatter.
    Expects:
      ---
      name: foo
      description: bar
      ---
    """
    if not text.startswith("---"):
        return {}
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    meta: dict[str, str] = {}
    for ln in lines[1:]:
        if ln.strip() == "---":
            break
        if ":" not in ln:
            continue
        k, v = ln.split(":", 1)
        key = k.strip()
        if not key:
            continue
        meta[key] = v.strip()
    return meta


async def _stream_shell(
    argv: list[str],
    command: str,
    request: Request,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    run_id: str | None = None,
):
    started = time.time()
    rid = run_id or exec_history.new_run_id()
    merged_env = os.environ.copy()
    if env:
        for k, v in env.items():
            if isinstance(k, str) and isinstance(v, str):
                merged_env[k] = v
    proc = await asyncio.create_subprocess_exec(
        *argv,
        cwd=str(cwd or settings.workspace.parent),
        env=merged_env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    _RUNNING_PROCS[rid] = proc
    output_tail = ""
    yield _sse("start", {"run_id": rid, "command": command, "ts_start": started})
    try:
        assert proc.stdout is not None
        while True:
            if await request.is_disconnected():
                try:
                    proc.terminate()
                except Exception:
                    pass
                break
            line = await proc.stdout.readline()
            if not line:
                break
            text_line = line.decode("utf-8", errors="ignore").rstrip("\n")
            if text_line:
                yield _sse("line", {"run_id": rid, "line": text_line})
                output_tail = (output_tail + text_line + "\n")[-8000:]
        await proc.wait()
        ended = time.time()
        duration_ms = int((ended - started) * 1000)
        try:
            exec_history.append_run(
                settings.log_dir,
                {
                    "run_id": rid,
                    "ts_start": started,
                    "ts_end": ended,
                    "duration_ms": duration_ms,
                    "command": command,
                    "exit_code": proc.returncode,
                    "env_keys": sorted(env.keys()) if env else [],
                    "output_len": len(output_tail),
                    "output_tail": output_tail[-4000:],
                    "disconnected": await request.is_disconnected(),
                },
            )
        except Exception:
            pass
        yield _sse(
            "end",
            {
                "run_id": rid,
                "exit_code": proc.returncode,
                "duration_ms": duration_ms,
            },
        )
    except Exception as exc:
        try:
            yield _sse("error", {"run_id": rid, "error": str(exc)})
        except Exception:
            pass
    finally:
        _RUNNING_PROCS.pop(rid, None)


def _build_codex_args(merged_env: dict[str, str], schema_path: str | None = None) -> list[str]:
    profile = merged_env.get("PUKAIST_CODEX_PROFILE") or os.getenv("PUKAIST_CODEX_PROFILE") or "pukaist_exec"
    model = merged_env.get("PUKAIST_CODEX_MODEL") or os.getenv("PUKAIST_CODEX_MODEL") or ""
    extra_flags = merged_env.get("PUKAIST_CODEX_EXEC_FLAGS") or os.getenv("PUKAIST_CODEX_EXEC_FLAGS") or ""
    args: list[str] = ["codex", "exec", "--profile", profile]
    if model:
        args += ["--model", model]
    if extra_flags:
        try:
            args += shlex.split(extra_flags)
        except Exception:
            pass
    if schema_path:
        args += ["--output-schema", schema_path]
    return args


async def _stream_codex_exec_command(
    prompt: str,
    request: Request,
    merged_env: dict[str, str],
    run_id: str | None = None,
    schema_path: str | None = None,
    output_last_message_path: str | None = None,
    json_events: bool = False,
    command_args: list[str] | None = None,
    on_line: Callable[[str], None] | None = None,
):
    started = time.time()
    rid = run_id or exec_history.new_run_id()
    args = _build_codex_args(merged_env, schema_path=schema_path)
    if output_last_message_path:
        try:
            Path(output_last_message_path).parent.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass
        args += ["--output-last-message", output_last_message_path]
    if json_events:
        args += ["--json"]
    if command_args:
        args += command_args
    cmd_str = shlex.join(args)
    if not _command_allowed(cmd_str):
        yield _sse("error", {"run_id": rid, "error": "command_not_allowed"})
        return
    proc = await asyncio.create_subprocess_exec(
        *args,
        cwd=str(settings.workspace.parent),
        env=merged_env,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    _RUNNING_PROCS[rid] = proc
    output_tail = ""
    yield _sse("start", {"run_id": rid, "command": cmd_str, "ts_start": started})
    try:
        if proc.stdin:
            proc.stdin.write(prompt.encode("utf-8"))
            await proc.stdin.drain()
            proc.stdin.close()
        assert proc.stdout is not None
        while True:
            if await request.is_disconnected():
                try:
                    proc.terminate()
                except Exception:
                    pass
                break
            line = await proc.stdout.readline()
            if not line:
                break
            text_line = line.decode("utf-8", errors="ignore").rstrip("\n")
            if text_line:
                try:
                    if on_line:
                        on_line(text_line)
                except Exception:
                    pass
                if json_events:
                    parsed = None
                    try:
                        parsed = json.loads(text_line)
                    except Exception:
                        parsed = None
                    if parsed is not None:
                        yield _sse("json", {"run_id": rid, "event": parsed})
                    else:
                        yield _sse("line", {"run_id": rid, "line": text_line})
                else:
                    yield _sse("line", {"run_id": rid, "line": text_line})
                output_tail = (output_tail + text_line + "\n")[-8000:]
        await proc.wait()
        ended = time.time()
        duration_ms = int((ended - started) * 1000)
        try:
            exec_history.append_run(
                settings.log_dir,
                {
                    "run_id": rid,
                    "ts_start": started,
                    "ts_end": ended,
                    "duration_ms": duration_ms,
                    "command": cmd_str,
                    "exit_code": proc.returncode,
                    "env_keys": [k for k in merged_env.keys() if k.startswith("PUKAIST_CODEX_")],
                    "output_len": len(output_tail),
                    "output_tail": output_tail[-4000:],
                    "codex_chat": True,
                    "codex_json_events": bool(json_events),
                    "output_last_message_path": output_last_message_path or None,
                },
            )
        except Exception:
            pass
        yield _sse(
            "end",
            {"run_id": rid, "exit_code": proc.returncode, "duration_ms": duration_ms},
        )
    except Exception as exc:
        yield _sse("error", {"run_id": rid, "error": str(exc)})
    finally:
        _RUNNING_PROCS.pop(rid, None)


async def _stream_codex_exec(
    prompt: str,
    request: Request,
    merged_env: dict[str, str],
    run_id: str | None = None,
    schema_path: str | None = None,
    output_last_message_path: str | None = None,
    json_events: bool = False,
    on_line: Callable[[str], None] | None = None,
):
    async for chunk in _stream_codex_exec_command(
        prompt,
        request=request,
        merged_env=merged_env,
        run_id=run_id,
        schema_path=schema_path,
        output_last_message_path=output_last_message_path,
        json_events=json_events,
        command_args=None,
        on_line=on_line,
    ):
        yield chunk


def _parse_batch_output(output: str) -> dict[str, Optional[str]]:
    batch_id = None
    content_file = None
    task_count = None
    for line in output.splitlines():
        if line.startswith("BATCH_ID:"):
            batch_id = line.split(":", 1)[1].strip()
        if line.startswith("CONTENT_FILE:"):
            content_file = line.split(":", 1)[1].strip()
        if line.startswith("TASK_COUNT:"):
            task_count = line.split(":", 1)[1].strip()
    return {"batch_id": batch_id, "content_file": content_file, "task_count": task_count}


@router.get("/admin/codex/presets")
def codex_presets(
    theme: str | None = None,
    auth: dict = Depends(auth_context),
) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    theme_val = theme or "<THEME>"
    presets = [
        {
            "name": "Codex exec (env runner)",
            "command": f"bash 99_Working_Files/Utilities/codex_exec_runner.sh {theme_val}",
        },
    ]
    return {"theme": theme_val, "presets": presets}


@router.get("/admin/codex/macros")
def codex_macros_list(auth: dict = Depends(auth_context)) -> dict:
    """
    Return allowlisted workflow macros for UI buttons.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    return {"macros": codex_macros.list_macros()}


# ─────────────────────────────────────────────────────────────────────────────
# Codex Auto-Run Scheduler (worker-side daemon driven by disk config)
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/admin/codex/autorun/config")
def codex_autorun_get_config(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    cfg = codex_autorun.load_config(settings.log_dir)
    return {"config": asdict(cfg)}


@router.patch("/admin/codex/autorun/config")
def codex_autorun_patch_config(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    cfg = codex_autorun.load_config(settings.log_dir)
    for k, v in payload.items():
        if hasattr(cfg, k):
            setattr(cfg, k, v)
    cfg = codex_autorun.save_config(settings.log_dir, cfg)
    _audit_event(auth, "autorun_config_patch", patch=payload)
    return {"config": asdict(cfg)}


def _autorun_status_for_theme(theme: str, cfg: dict) -> dict:
    qpath = _QUEUES_DIR / f"Queue_{theme}.tsv"
    counts = _read_tsv(qpath)
    status_counts: dict[str, int] = {}
    inprogress_autocodex = 0
    now = time.time()
    for row in counts:
        status = row.get("Status", "Unknown")
        status_counts[status] = status_counts.get(status, 0) + 1
        if status == "InProgress" and (row.get("LockedBy") or "").lower() == "autocodex":
            locked_at = row.get("LockedAt") or ""
            try:
                ts = time.mktime(time.strptime(locked_at[:19], "%Y-%m-%dT%H:%M:%S"))
            except Exception:
                ts = None
            if ts and now - ts < float(cfg.get("stale_mins", 120)) * 60:
                inprogress_autocodex += 1
    pending = status_counts.get("Pending", 0)
    inprogress = status_counts.get("InProgress", 0)
    return {
        "theme": theme,
        "counts": status_counts,
        "pending": pending,
        "inprogress": inprogress,
        "inprogress_autocodex": inprogress_autocodex,
        "eligible": pending >= int(cfg.get("pending_threshold", 1))
        and (not cfg.get("require_no_inprogress", True) or inprogress == 0),
    }


@router.get("/admin/codex/autorun/status")
def codex_autorun_status(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    cfg_obj = codex_autorun.load_config(settings.log_dir)
    cfg = asdict(cfg_obj)
    themes = cfg.get("themes") or _list_queue_files()
    theme_names: list[str] = []
    if isinstance(themes, list) and themes and isinstance(themes[0], str):
        theme_names = themes
    else:
        theme_names = [p.stem.replace("Queue_", "") for p in _list_queue_files()]
    per_theme = [_autorun_status_for_theme(t, cfg) for t in theme_names]
    last_runs = [r for r in exec_history.read_runs(settings.log_dir, limit=200) if r.get("autorun")]
    return {"config": cfg, "themes": per_theme, "recent_autoruns": last_runs[:20]}


# ─────────────────────────────────────────────────────────────────────────────
# Prompt / Playbook Management (versioned)
# ─────────────────────────────────────────────────────────────────────────────

_PROMPT_TARGETS: dict[str, Path] = {
    "codex_exec_prompt_template": Path("99_Working_Files/Utilities/codex_exec_prompt_template.md"),
    "codex_exec_analysis_schema": Path("99_Working_Files/Utilities/codex_exec_analysis_schema.json"),
}

_PROMPT_VERSIONS_DIR = settings.workspace.parent / "99_Working_Files" / "Utilities" / "Prompt_Versions"
_PROMPT_VERSIONS_DIR.mkdir(parents=True, exist_ok=True)


def _prompt_abs(path: Path) -> Path:
    if path.is_absolute():
        return path
    return settings.workspace.parent / path


def _save_prompt_version(name: str, content: str) -> str:
    ts = time.strftime("%Y%m%d_%H%M%S")
    target = _PROMPT_TARGETS[name]
    suffix = target.suffix or ".txt"
    ver_path = _PROMPT_VERSIONS_DIR / f"{name}_{ts}{suffix}"
    ver_path.write_text(content, encoding="utf-8")
    return ver_path.name


@router.get("/admin/codex/prompts")
def codex_prompts_list(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    items = []
    for name, rel in _PROMPT_TARGETS.items():
        abs_path = _prompt_abs(rel)
        items.append({"name": name, "path": str(rel), "exists": abs_path.exists()})
    return {"prompts": items, "versions_dir": str(_PROMPT_VERSIONS_DIR)}


@router.get("/admin/codex/prompts/{name}")
def codex_prompts_get(name: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if name not in _PROMPT_TARGETS:
        raise HTTPException(status_code=404, detail="prompt not found")
    path = _prompt_abs(_PROMPT_TARGETS[name])
    if not path.exists():
        raise HTTPException(status_code=404, detail="prompt file missing")
    return {"name": name, "path": str(path), "content": path.read_text(encoding="utf-8", errors="ignore")}


@router.post("/admin/codex/prompts/{name}")
def codex_prompts_save(name: str, payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if name not in _PROMPT_TARGETS:
        raise HTTPException(status_code=404, detail="prompt not found")
    content = payload.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="content required")
    content_str = str(content)
    path = _prompt_abs(_PROMPT_TARGETS[name])
    prev = path.read_text(encoding="utf-8", errors="ignore") if path.exists() else ""
    ver = _save_prompt_version(name, prev)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content_str, encoding="utf-8")
    _audit_event(auth, "prompt_save", name=name, version_saved=ver)
    return {"status": "ok", "name": name, "version_saved": ver, "path": str(path)}


@router.get("/admin/codex/prompts/{name}/versions")
def codex_prompts_versions(name: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if name not in _PROMPT_TARGETS:
        raise HTTPException(status_code=404, detail="prompt not found")
    files = sorted(_PROMPT_VERSIONS_DIR.glob(f"{name}_*{_PROMPT_TARGETS[name].suffix}"), reverse=True)
    return {"name": name, "versions": [{"file": f.name, "mtime": f.stat().st_mtime} for f in files[:50]]}


@router.post("/admin/codex/prompts/{name}/restore")
def codex_prompts_restore(name: str, payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if name not in _PROMPT_TARGETS:
        raise HTTPException(status_code=404, detail="prompt not found")
    ver_file = str(payload.get("file") or "").strip()
    if not ver_file:
        raise HTTPException(status_code=400, detail="file required")
    ver_path = (_PROMPT_VERSIONS_DIR / ver_file).resolve()
    if not ver_path.exists() or ver_path.parent != _PROMPT_VERSIONS_DIR.resolve():
        raise HTTPException(status_code=404, detail="version not found")
    content = ver_path.read_text(encoding="utf-8", errors="ignore")
    path = _prompt_abs(_PROMPT_TARGETS[name])
    prev = path.read_text(encoding="utf-8", errors="ignore") if path.exists() else ""
    saved = _save_prompt_version(name, prev)
    path.write_text(content, encoding="utf-8")
    _audit_event(auth, "prompt_restore", name=name, restored_from=ver_file, backup_version=saved)
    return {"status": "ok", "name": name, "restored_from": ver_file, "backup_version": saved}


def _macro_command_or_400(macro_id: str, args: dict[str, Any]) -> str:
    try:
        cmd = codex_macros.build_macro_command(macro_id, args)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not _command_allowed(cmd):
        raise HTTPException(status_code=403, detail="Macro command not allowed by server policy")
    return cmd


@router.post("/admin/codex/run-macro")
async def codex_run_macro(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    """
    Run a macro by id with args, using safe allowlisted CLI execution.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    macro_id = str(payload.get("id") or "").strip()
    args = payload.get("args") or {}
    if not macro_id:
        raise HTTPException(status_code=400, detail="id required")
    if args and not isinstance(args, dict):
        raise HTTPException(status_code=400, detail="args must be an object")
    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    cmd = _macro_command_or_400(macro_id, args)
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    _audit_event(auth, "macro_run", id=macro_id, args=args)
    return await _run_shell(cmd, env=safe_env)


@router.post("/admin/codex/run-macro/stream")
async def codex_run_macro_stream(
    payload: dict, request: Request, auth: dict = Depends(auth_context)
) -> StreamingResponse:
    """
    Stream a macro run as SSE.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    macro_id = str(payload.get("id") or "").strip()
    args = payload.get("args") or {}
    if not macro_id:
        raise HTTPException(status_code=400, detail="id required")
    if args and not isinstance(args, dict):
        raise HTTPException(status_code=400, detail="args must be an object")
    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    cmd = _macro_command_or_400(macro_id, args)
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    _audit_event(auth, "macro_run_stream", id=macro_id, args=args)
    run_id = exec_history.new_run_id()
    argv = _argv_or_400(cmd)
    gen = _stream_shell(argv, cmd, request=request, env=safe_env, run_id=run_id)
    return StreamingResponse(gen, media_type="text/event-stream")


@router.post("/admin/codex/chat/stream")
async def codex_chat_stream(
    payload: dict, request: Request, auth: dict = Depends(auth_context)
) -> StreamingResponse:
    """
    Stream a Codex exec run for an arbitrary prompt (chat-style).

    Payload:
      - prompt: required text
      - schema_path: optional output schema
      - env: optional PUKAIST_CODEX_* overrides
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    prompt = str(payload.get("prompt") or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="prompt required")
    schema_path = payload.get("schema_path")
    if schema_path is not None:
        schema_path = str(schema_path).strip() or None
    json_events = bool(payload.get("json_events") or payload.get("json"))
    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    merged_env = os.environ.copy()
    merged_env.update(safe_env)
    _audit_event(auth, "codex_chat_stream", prompt_len=len(prompt), schema_path=schema_path, json_events=json_events)
    run_id = exec_history.new_run_id()
    last_message_path = str(settings.log_dir / f"codex_last_message_{run_id}.txt")
    gen = _stream_codex_exec(
        prompt,
        request=request,
        merged_env=merged_env,
        run_id=run_id,
        schema_path=schema_path,
        output_last_message_path=last_message_path,
        json_events=json_events,
    )
    return StreamingResponse(gen, media_type="text/event-stream")


# ─────────────────────────────────────────────────────────────────────────────
# Codex Chat Threads + Context Packs (server-side memory)
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/admin/codex/chats")
def codex_chat_list(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    chats = chat_store.list_chats(settings.log_dir, tenant_id=tenant_id)
    return {"chats": chats}


@router.post("/admin/codex/chats")
def codex_chat_create(payload: dict | None = None, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    payload = payload or {}
    theme = str(payload.get("theme") or "").strip() or None
    title = str(payload.get("title") or "").strip() or None
    pack_ids = payload.get("context_pack_ids") or []
    if pack_ids and not isinstance(pack_ids, list):
        raise HTTPException(status_code=400, detail="context_pack_ids must be a list")
    tenant_id = auth.get("tenant_id")
    chat = chat_store.create_chat(
        settings.log_dir, theme=theme, title=title, context_pack_ids=[str(p) for p in pack_ids], tenant_id=tenant_id
    )
    _audit_event(auth, "codex_chat_create", chat_id=chat.get("id"), theme=theme, title=title)
    return {"chat": chat}


@router.get("/admin/codex/chats/{chat_id}")
def codex_chat_get(chat_id: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    chat = chat_store.load_chat(settings.log_dir, chat_id, tenant_id=tenant_id)
    if not chat:
        raise HTTPException(status_code=404, detail="chat not found")
    return {"chat": chat}


@router.patch("/admin/codex/chats/{chat_id}")
def codex_chat_patch(chat_id: str, payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    chat = chat_store.update_chat(settings.log_dir, chat_id, payload, tenant_id=tenant_id)
    if not chat:
        raise HTTPException(status_code=404, detail="chat not found")
    _audit_event(auth, "codex_chat_patch", chat_id=chat_id, patch_keys=list(payload.keys()))
    return {"chat": chat}


@router.delete("/admin/codex/chats/{chat_id}")
def codex_chat_delete(chat_id: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    ok = chat_store.delete_chat(settings.log_dir, chat_id, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="chat not found")
    _audit_event(auth, "codex_chat_delete", chat_id=chat_id)
    return {"status": "ok"}


def _build_thread_prompt(
    messages: list[dict[str, Any]],
    user_message: str,
    theme: str | None,
    packs: list[dict[str, Any]],
    max_messages: int = 20,
) -> str:
    theme_line = f"Theme: {theme}\n\n" if theme else ""
    pack_text = ""
    for p in packs:
        name = p.get("name") or p.get("id") or "Context"
        content = str(p.get("content") or "").strip()
        if not content:
            continue
        pack_text += f"## Context Pack: {name}\n{content}\n\n"
    convo_msgs = messages[-max_messages:] if messages else []
    convo = "\n\n".join(
        f"{'User' if m.get('role') == 'user' else 'Assistant'}: {m.get('content')}"
        for m in convo_msgs
        if m.get("content")
    )
    if convo:
        convo += "\n\n"
    return f"{theme_line}{pack_text}{convo}User: {user_message}\nAssistant:"


@router.post("/admin/codex/chats/{chat_id}/stream")
async def codex_chat_thread_stream(
    chat_id: str, payload: dict, request: Request, auth: dict = Depends(auth_context)
) -> StreamingResponse:
    """
    Stream Codex chat for a stored thread. Appends user + assistant messages to disk.
    Payload:
      - message: required user text
      - theme: optional override
      - context_pack_ids: optional override list
      - schema_path: optional output schema
      - env: optional PUKAIST_CODEX_* overrides
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    tenant_id = auth.get("tenant_id")
    chat = chat_store.load_chat(settings.log_dir, chat_id, tenant_id=tenant_id)
    if not chat:
        raise HTTPException(status_code=404, detail="chat not found")

    user_message = str(payload.get("message") or "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="message required")
    theme = str(payload.get("theme") or chat.get("theme") or "").strip() or None
    pack_ids = payload.get("context_pack_ids")
    if pack_ids is None:
        pack_ids = chat.get("context_pack_ids") or []
    if pack_ids and not isinstance(pack_ids, list):
        raise HTTPException(status_code=400, detail="context_pack_ids must be a list")

    schema_path = payload.get("schema_path")
    if schema_path is not None:
        schema_path = str(schema_path).strip() or None
    json_events = bool(payload.get("json_events") or payload.get("json"))

    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    merged_env = os.environ.copy()
    merged_env.update(safe_env)

    # Persist user message before running, but build prompt from prior context.
    messages_before = chat.get("messages") or []
    packs = context_packs.packs_for_theme(settings.log_dir, theme, pack_ids=pack_ids, tenant_id=tenant_id)
    prompt = _build_thread_prompt(messages_before, user_message, theme, packs)

    chat_store.update_chat(settings.log_dir, chat_id, {"theme": theme, "context_pack_ids": pack_ids}, tenant_id=tenant_id)
    chat_store.append_message(settings.log_dir, chat_id, "user", user_message, tenant_id=tenant_id)
    _audit_event(
        auth,
        "codex_chat_thread_message",
        chat_id=chat_id,
        theme=theme,
        message_len=len(user_message),
        json_events=json_events,
    )

    assistant_lines: list[str] = []

    def on_line(line: str) -> None:
        assistant_lines.append(line)

    run_id = exec_history.new_run_id()
    last_message_path = str(settings.log_dir / f"codex_last_message_{run_id}.txt")
    gen = _stream_codex_exec(
        prompt,
        request=request,
        merged_env=merged_env,
        run_id=run_id,
        schema_path=schema_path,
        output_last_message_path=last_message_path,
        json_events=json_events,
        on_line=on_line,
    )

    async def wrapped():
        try:
            async for chunk in gen:
                yield chunk
        finally:
            assistant_text = ""
            try:
                p = Path(last_message_path)
                if p.exists():
                    assistant_text = p.read_text(encoding="utf-8", errors="ignore").strip()
            except Exception:
                assistant_text = ""
            if not assistant_text and assistant_lines:
                assistant_text = "\n".join(assistant_lines).strip()
            if assistant_text:
                chat_store.append_message(settings.log_dir, chat_id, "assistant", assistant_text, tenant_id=tenant_id)

    return StreamingResponse(wrapped(), media_type="text/event-stream")


@router.get("/admin/codex/system")
def codex_system(auth: dict = Depends(auth_context)) -> dict:
    """
    Surface Codex CLI version and feature flags for UI capability discovery.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])

    def run(argv: list[str], timeout_sec: float = 5.0) -> dict[str, Any]:
        try:
            res = subprocess.run(
                argv,
                cwd=str(settings.workspace.parent),
                capture_output=True,
                text=True,
                timeout=timeout_sec,
            )
            return {
                "ok": res.returncode == 0,
                "exit_code": res.returncode,
                "stdout": (res.stdout or "").strip(),
                "stderr": (res.stderr or "").strip(),
            }
        except FileNotFoundError:
            return {"ok": False, "exit_code": 127, "stdout": "", "stderr": "codex_not_found"}
        except Exception as exc:
            return {"ok": False, "exit_code": None, "stdout": "", "stderr": str(exc)}

    version = run(["codex", "--version"])
    features = run(["codex", "features", "list"])
    return {
        "codex": {
            "version": version,
            "features": features,
        },
        "defaults": {
            "PUKAIST_CODEX_PROFILE": os.getenv("PUKAIST_CODEX_PROFILE") or "",
            "PUKAIST_CODEX_MODEL": os.getenv("PUKAIST_CODEX_MODEL") or "",
            "PUKAIST_CODEX_EXEC_FLAGS": os.getenv("PUKAIST_CODEX_EXEC_FLAGS") or "",
        },
    }


@router.get("/admin/codex/skills")
def codex_skills(auth: dict = Depends(auth_context)) -> dict:
    """
    List repo-scoped Codex skills (from `.codex/skills/*/SKILL.md`).
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    base_dir = settings.workspace.parent
    skills_dir = (base_dir / ".codex" / "skills").resolve()
    skills: list[dict[str, str]] = []

    if skills_dir.exists() and skills_dir.is_dir():
        for p in sorted(skills_dir.glob("*/SKILL.md")):
            try:
                resolved = p.resolve()
            except Exception:
                continue
            if skills_dir not in resolved.parents:
                continue
            try:
                text = resolved.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                text = ""
            meta = _parse_skill_frontmatter(text)
            slug = resolved.parent.name
            name = meta.get("name") or slug
            desc = meta.get("description") or ""
            try:
                rel_path = str(resolved.relative_to(base_dir))
            except Exception:
                rel_path = str(resolved)
            skills.append(
                {
                    "id": slug,
                    "name": name,
                    "description": desc,
                    "path": rel_path,
                }
            )

    return {"skills": skills}


@router.post("/admin/codex/resume/stream")
async def codex_resume_stream(
    payload: dict,
    request: Request,
    auth: dict = Depends(auth_context),
) -> StreamingResponse:
    """
    Stream a `codex exec resume` run (session-based continuation).

    Payload:
      - message/prompt: required text (sent to session)
      - session_id: optional UUID
      - last: optional bool (use most recent recorded session)
      - env: optional PUKAIST_CODEX_* overrides
      - schema_path: optional JSON Schema file for final output
      - json_events: optional bool (stream JSONL events)
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    prompt = str(payload.get("message") or payload.get("prompt") or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="message required")
    session_id = str(payload.get("session_id") or "").strip() or None
    use_last = bool(payload.get("last"))
    if use_last and session_id:
        raise HTTPException(status_code=400, detail="Provide either session_id or last=true, not both")
    schema_path = payload.get("schema_path")
    if schema_path is not None:
        schema_path = str(schema_path).strip() or None
    json_events = bool(payload.get("json_events") or payload.get("json"))

    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    merged_env = os.environ.copy()
    merged_env.update(safe_env)

    cmd_args = ["resume"]
    if use_last:
        cmd_args.append("--last")
    if session_id:
        cmd_args.append(session_id)
    cmd_args.append("-")

    run_id = exec_history.new_run_id()
    last_message_path = str(settings.log_dir / f"codex_last_message_{run_id}.txt")
    _audit_event(auth, "codex_resume_stream", session_id=session_id, last=use_last, json_events=json_events)
    gen = _stream_codex_exec_command(
        prompt,
        request=request,
        merged_env=merged_env,
        run_id=run_id,
        schema_path=schema_path,
        output_last_message_path=last_message_path,
        json_events=json_events,
        command_args=cmd_args,
    )
    return StreamingResponse(gen, media_type="text/event-stream")


@router.post("/admin/codex/review/stream")
async def codex_review_stream(
    payload: dict | None,
    request: Request,
    auth: dict = Depends(auth_context),
) -> StreamingResponse:
    """
    Stream a `codex exec review` run.

    Payload:
      - prompt: optional custom review instructions (default provided)
      - uncommitted: bool
      - base: optional base branch name
      - commit: optional commit SHA
      - title: optional title to show in output
      - env: optional PUKAIST_CODEX_* overrides
      - json_events: optional bool (stream JSONL events)
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    payload = payload or {}
    prompt = str(payload.get("prompt") or "").strip() or "Review changes and suggest improvements."
    uncommitted = bool(payload.get("uncommitted"))
    base = str(payload.get("base") or "").strip() or None
    commit = str(payload.get("commit") or "").strip() or None
    title = str(payload.get("title") or "").strip() or None
    json_events = bool(payload.get("json_events") or payload.get("json"))

    modes = sum([1 if uncommitted else 0, 1 if base else 0, 1 if commit else 0])
    if modes > 1:
        raise HTTPException(status_code=400, detail="Choose only one of uncommitted/base/commit")

    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    merged_env = os.environ.copy()
    merged_env.update(safe_env)

    cmd_args: list[str] = ["review"]
    if uncommitted:
        cmd_args.append("--uncommitted")
    if base:
        cmd_args += ["--base", base]
    if commit:
        cmd_args += ["--commit", commit]
    if title:
        cmd_args += ["--title", title]
    cmd_args.append("-")

    run_id = exec_history.new_run_id()
    last_message_path = str(settings.log_dir / f"codex_last_message_{run_id}.txt")
    _audit_event(auth, "codex_review_stream", uncommitted=uncommitted, base=base, commit=commit, json_events=json_events)
    gen = _stream_codex_exec_command(
        prompt,
        request=request,
        merged_env=merged_env,
        run_id=run_id,
        schema_path=None,
        output_last_message_path=last_message_path,
        json_events=json_events,
        command_args=cmd_args,
    )
    return StreamingResponse(gen, media_type="text/event-stream")


@router.get("/admin/codex/context-packs")
def codex_context_packs_list(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    return {"packs": context_packs.list_packs(settings.log_dir, tenant_id=tenant_id)}


@router.post("/admin/codex/context-packs")
def codex_context_packs_save(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    if not str(payload.get("name") or "").strip():
        raise HTTPException(status_code=400, detail="name required")
    pack = context_packs.save_pack(settings.log_dir, payload, tenant_id=tenant_id)
    return {"pack": pack}


@router.delete("/admin/codex/context-packs/{pack_id}")
def codex_context_packs_delete(pack_id: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    ok = context_packs.delete_pack(settings.log_dir, pack_id, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="pack not found")
    return {"status": "ok"}


@router.post("/admin/codex/get-task")
async def codex_get_task(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    theme = str(payload.get("theme") or "").strip()
    if not theme:
        raise HTTPException(status_code=400, detail="theme required")
    cmd = f"python3 99_Working_Files/refinement_workflow.py get-task --theme {shlex.quote(theme)}"
    res = await _run_shell(cmd)
    parsed = _parse_batch_output(res.get("output") or "")
    return {"run": res, "parsed": parsed}


@router.post("/admin/codex/reset-queue")
async def codex_reset_queue(payload: dict | None = None, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    payload = payload or {}
    theme = str(payload.get("theme") or "").strip()
    if theme:
        cmd = f"python3 99_Working_Files/refinement_workflow.py reset-queue --theme {shlex.quote(theme)}"
    else:
        cmd = "python3 99_Working_Files/refinement_workflow.py reset-queue"
    return await _run_shell(cmd)


@router.post("/admin/codex/reap-stale")
async def codex_reap_stale(payload: dict | None = None, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    payload = payload or {}
    theme = str(payload.get("theme") or "").strip()
    mins = str(payload.get("mins") or payload.get("minutes") or "120").strip()
    if theme:
        cmd = (
            "python3 99_Working_Files/Scripts/Queue_Management/reap_stale_locks.py "
            f"--theme {shlex.quote(theme)} --mins {shlex.quote(mins)}"
        )
    else:
        cmd = f"python3 99_Working_Files/Scripts/Queue_Management/reap_stale_locks.py --mins {shlex.quote(mins)}"
    return await _run_shell(cmd)


@router.post("/admin/cli/run")
async def cli_run(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    command = str(payload.get("command") or "").strip()
    if not command:
        raise HTTPException(status_code=400, detail="command required")
    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    if not _command_allowed(command):
        raise HTTPException(status_code=403, detail="Command not allowed by server policy")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    _audit_event(auth, "cli_run", command=command)
    return await _run_shell(command, env=safe_env)


@router.post("/admin/cli/stream")
async def cli_stream(payload: dict, request: Request, auth: dict = Depends(auth_context)) -> StreamingResponse:
    """
    Stream allowlisted CLI output as SSE events.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not CLI_ENABLED:
        raise HTTPException(status_code=403, detail="CLI panel disabled; set PUKAIST_CLI_ENABLED=true")
    command = str(payload.get("command") or "").strip()
    if not command:
        raise HTTPException(status_code=400, detail="command required")
    env_override = payload.get("env") or {}
    if env_override and not isinstance(env_override, dict):
        raise HTTPException(status_code=400, detail="env must be an object of string pairs")
    if not _command_allowed(command):
        raise HTTPException(status_code=403, detail="Command not allowed by server policy")
    safe_env: dict[str, str] = {}
    for k, v in env_override.items():
        if isinstance(k, str) and isinstance(v, str):
            safe_env[k] = v
    _audit_event(auth, "cli_stream", command=command)
    run_id = exec_history.new_run_id()
    argv = _argv_or_400(command)
    gen = _stream_shell(argv, command, request=request, env=safe_env, run_id=run_id)
    return StreamingResponse(gen, media_type="text/event-stream")


@router.post("/admin/cli/cancel")
async def cli_cancel(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    """
    Best-effort cancellation of an in-flight streamed CLI run.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    run_id = str(payload.get("run_id") or "").strip()
    if not run_id:
        raise HTTPException(status_code=400, detail="run_id required")
    proc = _RUNNING_PROCS.get(run_id)
    if not proc:
        return {"status": "not_found", "run_id": run_id}
    try:
        proc.terminate()
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
    return {"status": "terminating", "run_id": run_id}


@router.get("/admin/cli/history")
def cli_history(
    limit: int = 200,
    offset: int = 0,
    auth: dict = Depends(auth_context),
) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    runs = exec_history.read_runs(settings.log_dir, limit=limit, offset=offset)
    return {"runs": runs, "path": str(exec_history.history_path(settings.log_dir))}


@router.websocket("/admin/cli/ws")
async def cli_websocket(websocket: WebSocket):
    """
    Bidirectional CLI session over WebSocket.

    Client protocol (JSON messages):
      - start: {"type":"start","command":"...","env":{...}}
      - input: {"type":"input","data":"...", "run_id": "...?"}
      - eof: {"type":"eof"}
      - cancel: {"type":"cancel","run_id":"...?"}
      - ping: {"type":"ping"}
    Server emits:
      - ready, start, line, end, error, pong
    """
    await websocket.accept()
    # Auth / role check
    x_api_key = websocket.headers.get("x-api-key") or websocket.query_params.get("api_key")
    authorization = websocket.headers.get("authorization") or websocket.query_params.get("authorization")
    try:
        auth = resolve_auth(x_api_key, authorization)
        require_role(settings.role_admin or "", auth.get("roles") or [])
    except HTTPException:
        await websocket.close(code=1008)
        return

    async def send(obj: dict[str, Any]) -> None:
        await websocket.send_text(json.dumps(obj, ensure_ascii=False))

    await send({"type": "ready"})

    proc: asyncio.subprocess.Process | None = None
    run_id: str | None = None
    started: float | None = None
    command_meta: str | None = None
    env_keys_meta: list[str] = []
    output_tail = ""
    reader_task: asyncio.Task | None = None

    async def pump() -> None:
        nonlocal proc, run_id, started, output_tail, command_meta, env_keys_meta
        if not proc or not proc.stdout or not run_id:
            return
        try:
            while True:
                line = await proc.stdout.readline()
                if not line:
                    break
                text_line = line.decode("utf-8", errors="ignore").rstrip("\n")
                await send({"type": "line", "run_id": run_id, "line": text_line})
                output_tail = (output_tail + text_line + "\n")[-8000:]
            await proc.wait()
        except Exception as exc:
            await send({"type": "error", "run_id": run_id, "error": str(exc)})
        finally:
            ended = time.time()
            exit_code = proc.returncode if proc else None
            duration_ms = int((ended - (started or ended)) * 1000)
            if run_id:
                try:
                    exec_history.append_run(
                        settings.log_dir,
                        {
                            "run_id": run_id,
                            "ts_start": started,
                            "ts_end": ended,
                            "duration_ms": duration_ms,
                            "command": command_meta,
                            "exit_code": exit_code,
                            "env_keys": env_keys_meta,
                            "output_len": len(output_tail),
                            "output_tail": output_tail[-4000:],
                            "websocket": True,
                        },
                    )
                except Exception:
                    pass
            await send(
                {
                    "type": "end",
                    "run_id": run_id,
                    "exit_code": exit_code,
                    "duration_ms": duration_ms,
                }
            )
            if run_id:
                _RUNNING_PROCS.pop(run_id, None)

    try:
        while True:
            msg_text = await websocket.receive_text()
            try:
                msg = json.loads(msg_text)
            except Exception:
                await send({"type": "error", "error": "invalid_json"})
                continue
            mtype = str(msg.get("type") or "").lower()

            if mtype == "ping":
                await send({"type": "pong"})
                continue

            if mtype == "start":
                if proc and proc.returncode is None:
                    await send({"type": "error", "error": "process_already_running"})
                    continue
                command = str(msg.get("command") or "").strip()
                if not command:
                    await send({"type": "error", "error": "command_required"})
                    continue
                if not CLI_ENABLED:
                    await send({"type": "error", "error": "cli_disabled"})
                    continue
                env_override = msg.get("env") or {}
                if env_override and not isinstance(env_override, dict):
                    await send({"type": "error", "error": "env_must_be_object"})
                    continue
                if not _command_allowed(command):
                    await send({"type": "error", "error": "command_not_allowed"})
                    continue
                safe_env: dict[str, str] = {}
                for k, v in env_override.items():
                    if isinstance(k, str) and isinstance(v, str):
                        safe_env[k] = v
                merged_env = os.environ.copy()
                merged_env.update(safe_env)
                run_id = exec_history.new_run_id()
                started = time.time()
                try:
                    argv = _argv_or_400(command)
                except HTTPException:
                    await send({"type": "error", "error": "invalid_command"})
                    continue
                proc = await asyncio.create_subprocess_exec(
                    *argv,
                    cwd=str(settings.workspace.parent),
                    env=merged_env,
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT,
                )
                command_meta = command
                env_keys_meta = sorted(safe_env.keys())
                _RUNNING_PROCS[run_id] = proc
                await send({"type": "start", "run_id": run_id, "command": command, "ts_start": started})
                reader_task = asyncio.create_task(pump())
                continue

            if mtype == "input":
                if not proc or not proc.stdin or proc.returncode is not None:
                    await send({"type": "error", "error": "no_active_process"})
                    continue
                data = msg.get("data")
                if data is None:
                    continue
                text_data = str(data)
                if not text_data.endswith("\n"):
                    text_data += "\n"
                try:
                    proc.stdin.write(text_data.encode("utf-8"))
                    await proc.stdin.drain()
                except Exception as exc:
                    await send({"type": "error", "error": str(exc)})
                continue

            if mtype == "eof":
                if proc and proc.stdin:
                    try:
                        proc.stdin.close()
                    except Exception:
                        pass
                continue

            if mtype == "cancel":
                target = str(msg.get("run_id") or run_id or "").strip()
                if not target:
                    continue
                target_proc = _RUNNING_PROCS.get(target)
                if target_proc and target_proc.returncode is None:
                    try:
                        target_proc.terminate()
                    except Exception:
                        try:
                            target_proc.kill()
                        except Exception:
                            pass
                await send({"type": "cancelled", "run_id": target})
                continue

            await send({"type": "error", "error": "unknown_type"})

    except WebSocketDisconnect:
        pass
    finally:
        if reader_task and not reader_task.done():
            reader_task.cancel()
        if proc and proc.returncode is None:
            try:
                proc.terminate()
            except Exception:
                pass
        if run_id:
            _RUNNING_PROCS.pop(run_id, None)


# ─────────────────────────────────────────────────────────────────────────────
# Codex queue / dossier file surfaces (read-only unless via CLI)
# ─────────────────────────────────────────────────────────────────────────────

_BASE_DIR = settings.workspace.parent
_WORKING_FILES_DIR = Path(os.getenv("PUKAIST_WORKING_FILES_DIR") or (_BASE_DIR / "99_Working_Files"))
_QUEUES_DIR = Path(os.getenv("PUKAIST_QUEUES_DIR") or (_WORKING_FILES_DIR / "Queues"))
_COMMS_LOG_PATH = Path(
    os.getenv("PUKAIST_COMMS_LOG_FILE") or (_WORKING_FILES_DIR / "Agent_Communication_Log.md")
)
_FLAGGED_TASKS_PATH = Path(
    os.getenv("PUKAIST_FLAGGED_TASKS_FILE") or (_WORKING_FILES_DIR / "Flagged_Tasks.tsv")
)
_REFINED_EVIDENCE_DIR = Path(
    os.getenv("PUKAIST_REFINED_EVIDENCE_DIR") or (_BASE_DIR / "01_Internal_Reports" / "Refined_Evidence")
)
_CONTRADICTIONS_PATH = Path(
    os.getenv("PUKAIST_CONTRADICTIONS_FILE") or (_QUEUES_DIR / "Contradictions_Register.tsv")
)
_CODEX_LOG_DIR = Path(os.getenv("PUKAIST_CODEX_LOG_DIR") or settings.log_dir)
_FILES_TO_OCR_PATH = Path(os.getenv("PUKAIST_FILES_TO_OCR_FILE") or (_WORKING_FILES_DIR / "Files_To_OCR.txt"))
_VISION_REQUIRED_DIR = Path(
    os.getenv("PUKAIST_VISION_REQUIRED_DIR") or (_WORKING_FILES_DIR / "Incoming_OCR" / "Vision_Required")
)

for p in [_WORKING_FILES_DIR, _QUEUES_DIR, _REFINED_EVIDENCE_DIR]:
    p.mkdir(parents=True, exist_ok=True)


def _read_tsv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    try:
        import csv

        with path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            return list(reader)
    except Exception:
        return []


def _append_tsv_row(path: Path, fieldnames: list[str], row: dict[str, str]) -> None:
    import csv

    exists = path.exists() and path.stat().st_size > 0
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        if not exists:
            writer.writeheader()
        writer.writerow(row)


def _append_tsv_rows(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    import csv

    if not rows:
        return
    exists = path.exists() and path.stat().st_size > 0
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        if not exists:
            writer.writeheader()
        for row in rows:
            writer.writerow(row)


def _list_queue_files() -> list[Path]:
    if not _QUEUES_DIR.exists():
        return []
    return sorted(
        [p for p in _QUEUES_DIR.iterdir() if p.is_file() and p.name.startswith("Queue_") and p.suffix == ".tsv"]
    )


def _theme_from_queue(path: Path, rows: list[dict[str, str]]) -> str:
    if rows and "Theme" in rows[0] and rows[0].get("Theme"):
        return rows[0]["Theme"]
    return path.stem.replace("Queue_", "")


@router.post("/admin/codex/queues/seed-file")
def codex_seed_queue_from_file(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    """
    Create queue tasks by slicing a local file into byte ranges and appending to a theme queue TSV.

    This is a lightweight helper to build a "worklist" you can then process via get-task + Codex exec.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])

    theme = str(payload.get("theme") or "").strip()
    if not theme:
        raise HTTPException(status_code=400, detail="theme required")
    if not re.match(r"^[A-Za-z0-9_]+$", theme):
        raise HTTPException(status_code=400, detail="invalid theme (use letters/numbers/underscore only)")

    source_path_raw = str(payload.get("source_path") or payload.get("path") or "").strip()
    if not source_path_raw:
        raise HTTPException(status_code=400, detail="source_path required")

    base_dir = settings.workspace.parent.resolve()
    src_path = Path(source_path_raw)
    if not src_path.is_absolute():
        src_path = (base_dir / src_path).resolve()
    else:
        src_path = src_path.resolve()
    if base_dir not in src_path.parents:
        raise HTTPException(status_code=400, detail="source_path must be under repo root")
    if not src_path.exists() or not src_path.is_file():
        raise HTTPException(status_code=404, detail="source file not found")

    document_id = str(payload.get("document_id") or payload.get("doc_id") or src_path.name).strip() or src_path.name

    chunk_size_raw = payload.get("chunk_size")
    overlap_raw = payload.get("overlap")
    try:
        chunk_size = 12000 if chunk_size_raw in (None, "") else int(chunk_size_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="chunk_size must be an integer")
    try:
        overlap = 200 if overlap_raw in (None, "") else int(overlap_raw)
    except Exception:
        raise HTTPException(status_code=400, detail="overlap must be an integer")
    max_tasks_raw = payload.get("max_tasks")
    max_tasks: int | None = None
    if max_tasks_raw not in (None, "", 0):
        try:
            max_tasks = int(max_tasks_raw)
        except Exception:
            raise HTTPException(status_code=400, detail="max_tasks must be an integer")

    safe_chunk = max(256, min(chunk_size, 500_000))
    safe_overlap = max(0, min(overlap, safe_chunk - 1))
    safe_max_tasks = None if max_tasks is None else max(1, min(max_tasks, 50_000))

    queues_dir = Path(os.getenv("PUKAIST_QUEUES_DIR") or (base_dir / "99_Working_Files" / "Queues"))
    queues_dir.mkdir(parents=True, exist_ok=True)
    queue_path = queues_dir / f"Queue_{theme}.tsv"
    existing = _read_tsv(queue_path)
    max_id = 0
    for r in existing:
        tid = str(r.get("TaskID") or "").strip()
        if tid.isdigit():
            max_id = max(max_id, int(tid))
    next_id = max_id + 1

    try:
        data = src_path.read_bytes()
    except Exception:
        raise HTTPException(status_code=400, detail="failed to read source file")

    size = len(data)
    if size == 0:
        raise HTTPException(status_code=400, detail="source file is empty")

    fieldnames = [
        "TaskID",
        "Theme",
        "DocumentID",
        "SourcePath",
        "Offset",
        "Length",
        "Status",
        "LockedAt",
        "LockedBy",
    ]

    rows: list[dict[str, str]] = []
    offset = 0
    while offset < size:
        end = min(offset + safe_chunk, size)
        if end < size:
            # Try to end on a newline boundary (small lookahead) to keep chunks readable.
            lookahead = data[end : min(end + 2048, size)]
            nl = lookahead.find(b"\n")
            if nl != -1 and nl > 0:
                end = min(end + nl + 1, size)
        length = end - offset
        if length <= 0:
            break

        rows.append(
            {
                "TaskID": str(next_id),
                "Theme": theme,
                "DocumentID": document_id,
                "SourcePath": str(src_path),
                "Offset": str(offset),
                "Length": str(length),
                "Status": "Pending",
                "LockedAt": "",
                "LockedBy": "",
            }
        )
        next_id += 1
        if safe_max_tasks is not None and len(rows) >= safe_max_tasks:
            break
        if end >= size:
            break
        next_offset = end - safe_overlap if safe_overlap else end
        if next_offset <= offset:
            next_offset = end
        offset = next_offset

    _append_tsv_rows(queue_path, fieldnames, rows)
    return {
        "status": "ok",
        "theme": theme,
        "queue_file": str(queue_path),
        "document_id": document_id,
        "source_path": str(src_path),
        "chunk_size": safe_chunk,
        "overlap": safe_overlap,
        "created": len(rows),
        "task_id_first": rows[0]["TaskID"] if rows else None,
        "task_id_last": rows[-1]["TaskID"] if rows else None,
    }


def _parse_comms_table(path: Path) -> list[dict[str, str]]:
    text = ""
    if path.exists():
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            text = ""
    if not text:
        return []
    lines = text.splitlines()
    entries: list[dict[str, str]] = []
    in_table = False
    for line in lines:
        if line.startswith("| ID |"):
            in_table = True
            continue
        if not in_table:
            continue
        if not line.startswith("|") or ":---" in line:
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if len(parts) < 6:
            continue
        entries.append(
            {
                "ID": parts[0],
                "Timestamp": parts[1],
                "Agent": parts[2],
                "Status": parts[3],
                "Message": parts[4],
                "NextSteps": parts[5],
            }
        )
    entries.reverse()
    return entries


@router.get("/admin/codex/queues")
def codex_queues(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    queues = []
    for qpath in _list_queue_files():
        rows = _read_tsv(qpath)
        counts: dict[str, int] = {}
        for r in rows:
            status = r.get("Status", "Unknown")
            counts[status] = counts.get(status, 0) + 1
        theme = _theme_from_queue(qpath, rows)
        queues.append({"theme": theme, "file": qpath.name, "total": len(rows), "counts": counts})
    return {"queues": queues}


@router.get("/admin/codex/queue/{theme}")
def codex_queue_detail(
    theme: str,
    status: str | None = None,
    search: str | None = None,
    limit: int = 500,
    offset: int = 0,
    auth: dict = Depends(auth_context),
) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not re.match(r"^[A-Za-z0-9_]+$", theme):
        raise HTTPException(status_code=400, detail="invalid theme")
    qpath = _QUEUES_DIR / f"Queue_{theme}.tsv"
    rows = _read_tsv(qpath)

    def matches(row: dict[str, str]) -> bool:
        if status and row.get("Status", "").lower() != status.lower():
            return False
        if search:
            hay = json.dumps(row).lower()
            if search.lower() not in hay:
                return False
        return True

    filtered = [r for r in rows if matches(r)]
    slice_rows = filtered[offset : offset + limit]
    return {"theme": theme, "total": len(filtered), "tasks": slice_rows, "offset": offset}


@router.get("/admin/codex/flagged")
def codex_flagged(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    return {"tasks": _read_tsv(_FLAGGED_TASKS_PATH)}


@router.get("/admin/cli/status")
def cli_status(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    return {
        "enabled": CLI_ENABLED,
        "allowed_prefixes": ALLOWED_PREFIXES,
    }


@router.get("/admin/codex/exec/events")
def codex_exec_events(auth: dict = Depends(auth_context)) -> dict:
    """
    List recent Codex exec JSONL event logs written by codex_exec_runner.sh.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    logs: list[dict[str, object]] = []
    if _CODEX_LOG_DIR.exists():
        for p in sorted(_CODEX_LOG_DIR.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
            if not p.is_file():
                continue
            if not p.name.startswith("codex_exec_events_") or p.suffix != ".jsonl":
                continue
            stat = p.stat()
            logs.append(
                {
                    "name": p.name,
                    "path": str(p),
                    "size_bytes": stat.st_size,
                    "mtime": stat.st_mtime,
                }
            )
    return {"logs": logs[:50], "log_dir": str(_CODEX_LOG_DIR)}


@router.get("/admin/codex/exec/event")
def codex_exec_event(name: str, limit: int = 500, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    target = (_CODEX_LOG_DIR / name).resolve()
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="event log not found")
    if _CODEX_LOG_DIR.resolve() not in target.parents:
        raise HTTPException(status_code=400, detail="invalid log path")
    try:
        lines = target.read_text(encoding="utf-8", errors="ignore").splitlines()
        tail = "\n".join(lines[:limit])
    except Exception:
        tail = ""
    return {"name": name, "path": str(target), "limit": limit, "content": tail}


@router.get("/admin/codex/contradictions")
def codex_contradictions(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    return {"rows": _read_tsv(_CONTRADICTIONS_PATH)}


@router.post("/admin/codex/contradictions")
def codex_add_contradiction(payload: dict, auth: dict = Depends(auth_context)) -> dict:
    """
    Append a new contradiction row to Contradictions_Register.tsv.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    required = [
        "DocID",
        "Theme",
        "Statement_A",
        "Page_A",
        "Statement_B",
        "Page_B",
        "Notes",
        "Status",
        "LoggedBy",
    ]
    for k in required:
        if not str(payload.get(k) or "").strip():
            raise HTTPException(status_code=400, detail=f"Missing field {k}")
    row = {k: str(payload.get(k) or "").strip() for k in required}
    row["DateLogged"] = str(payload.get("DateLogged") or "")
    fieldnames = required + ["DateLogged"]
    _append_tsv_row(_CONTRADICTIONS_PATH, fieldnames, row)
    return {"status": "ok"}


@router.get("/admin/graph")
def admin_graph(
    theme: str | None = None,
    limit_docs: int = 2000,
    include_entities: bool = True,
    max_entities_per_type_per_doc: int = 5,
    include_contradictions: bool = True,
    max_contradictions: int = 500,
    auth: dict = Depends(auth_context),
) -> dict:
    """
    Return a lightweight knowledge graph across themes, docs, entities, and contradictions.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")

    safe_limit_docs = max(1, min(int(limit_docs or 0), 10000))
    safe_max_entities = max(0, min(int(max_entities_per_type_per_doc or 0), 50))
    safe_max_contradictions = max(0, min(int(max_contradictions or 0), 2000))
    theme_filter = (theme or "").strip() or None

    return knowledge_graph.build_graph(
        settings.index_path,
        _QUEUES_DIR,
        _CONTRADICTIONS_PATH,
        tenant_id=tenant_id,
        limit_docs=safe_limit_docs,
        theme_filter=theme_filter,
        include_entities=bool(include_entities),
        max_entities_per_type_per_doc=safe_max_entities,
        include_contradictions=bool(include_contradictions),
        max_contradictions=safe_max_contradictions,
    )


@router.get("/admin/codex/ocr/status")
def codex_ocr_status(auth: dict = Depends(auth_context)) -> dict:
    """
    Lightweight OCR backlog status for legacy kit compatibility.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    files_to_ocr = 0
    if _FILES_TO_OCR_PATH.exists():
        try:
            files_to_ocr = len([ln for ln in _FILES_TO_OCR_PATH.read_text().splitlines() if ln.strip()])
        except Exception:
            files_to_ocr = 0
    vision_required = 0
    if _VISION_REQUIRED_DIR.exists():
        try:
            vision_required = len([p for p in _VISION_REQUIRED_DIR.iterdir() if p.is_file()])
        except Exception:
            vision_required = 0
    return {
        "files_to_ocr_count": files_to_ocr,
        "vision_required_count": vision_required,
        "files_to_ocr_path": str(_FILES_TO_OCR_PATH),
        "vision_required_dir": str(_VISION_REQUIRED_DIR),
    }


@router.get("/admin/codex/comms")
def codex_comms(limit: int = 50, agent: str | None = None, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    entries = _parse_comms_table(_COMMS_LOG_PATH)
    if agent:
        entries = [e for e in entries if e.get("Agent") == agent]
    return {"entries": entries[:limit]}


@router.get("/admin/codex/refined/files")
def codex_refined_files(auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    files: list[dict[str, str]] = []
    if _REFINED_EVIDENCE_DIR.exists():
        for p in sorted(_REFINED_EVIDENCE_DIR.iterdir()):
            if p.is_file() and p.suffix.lower() == ".md" and ".bak" not in p.name.lower():
                files.append({"name": p.name, "path": str(p)})
    return {"files": files}


@router.get("/admin/codex/refined/text")
def codex_refined_text(name: str, auth: dict = Depends(auth_context)) -> dict:
    require_role(settings.role_admin or "", auth.get("roles") or [])
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    fpath = (_REFINED_EVIDENCE_DIR / name).resolve()
    if not fpath.exists() or not fpath.is_file():
        raise HTTPException(status_code=404, detail="refined file not found")
    if _REFINED_EVIDENCE_DIR.resolve() not in fpath.parents:
        raise HTTPException(status_code=400, detail="invalid refined file path")
    return {"name": name, "text": fpath.read_text(encoding="utf-8", errors="ignore")}


@router.get("/projects")
def list_projects(_: None = Depends(verify_token)):
    projects = []
    for path in sorted(settings.projects_dir.glob("*.json")):
        try:
            rel_path = str(path.relative_to(settings.workspace.parent))
        except ValueError:
            rel_path = str(path)
        projects.append({"name": path.stem, "path": rel_path})
    return {"projects": projects}


@router.get("/projects/{name}")
def get_project(name: str, _: None = Depends(verify_token)):
    candidate = settings.projects_dir / f"{name}.json"
    if not candidate.exists():
        raise HTTPException(status_code=404, detail="Project config not found")
    try:
        cfg = ProjectConfig.load(candidate)
        return cfg.__dict__
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load project: {exc}")


@router.post("/projects")
def create_or_update_project(payload: dict, _: None = Depends(verify_token)):
    """Create or update a project config on disk."""
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Project name is required")
    try:
        cfg = ProjectConfig(**payload)
    except TypeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid project config: {exc}")
    path = settings.projects_dir / f"{name}.json"
    try:
        cfg.save(path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save project: {exc}")
    try:
        rel_path = str(path.relative_to(settings.workspace.parent))
    except ValueError:
        rel_path = str(path)
    return {"status": "ok", "name": name, "path": rel_path}


@router.post("/mission/geo_suggest")
def mission_geo_suggest(payload: dict, auth: dict = Depends(auth_context)):
    """
    Suggest AOI themes/codes/names and First Nation band numbers from mission text.
    """
    mission = str(payload.get("mission") or "").strip()
    if not mission:
        raise HTTPException(status_code=400, detail="mission is required")

    raw_terms = [part.strip() for part in re.split(r"[,;\n]", mission) if part.strip()]
    terms = [t.lower() for t in raw_terms if len(t) > 2]
    if not terms:
        return {"aoi_themes": [], "aoi_codes": [], "aoi_names": [], "band_numbers": []}

    tenant_id = auth.get("tenant_id")
    index_dir = settings.index_path.parent

    aoi_fc = aoi_store.geojson(index_dir, tenant_id=tenant_id)
    aoi_themes: set[str] = set()
    aoi_codes: set[str] = set()
    aoi_names: list[str] = []

    for f in aoi_fc.get("features") or []:
        props = f.get("properties") or {}
        name = str(props.get("name") or "").strip()
        if not name:
            continue
        lower_name = name.lower()
        if not any(t in lower_name for t in terms):
            continue
        theme = str(props.get("theme") or "").strip()
        if theme:
            aoi_themes.add(theme)
        for key in ("alcode", "tag_id", "soi_id"):
            code = props.get(key)
            if code is not None:
                code_s = str(code).strip()
                if code_s:
                    aoi_codes.add(code_s)
        if name not in aoi_names:
            aoi_names.append(name)

    poi_fc = poi_store.geojson(index_dir, tenant_id=tenant_id, theme="First_Nation_Office")
    band_numbers: set[str] = set()
    for f in poi_fc.get("features") or []:
        props = f.get("properties") or {}
        band_name = str(props.get("band_name") or props.get("name") or "").strip()
        if not band_name:
            continue
        lower_name = band_name.lower()
        if not any(t in lower_name for t in terms):
            continue
        band_nbr = props.get("band_nbr")
        if band_nbr is None:
            continue
        band_s = str(band_nbr).strip()
        if band_s:
            band_numbers.add(band_s)

    return {
        "aoi_themes": sorted(aoi_themes),
        "aoi_codes": sorted(aoi_codes),
        "aoi_names": aoi_names[:8],
        "band_numbers": sorted(band_numbers),
    }


@router.get("/collections")
def list_collections(tenant_id: str | None = Depends(verify_token)):
    index_dir = settings.index_path.parent
    cols = collection_store.list_collections(index_dir, tenant_id=tenant_id)
    return {"collections": cols}


@router.delete("/docs/{doc_id}")
def delete_document(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    """Delete a document and all associated data (geo points, suggestions, FTS)."""
    deleted = search_index.delete_doc(settings.index_path, doc_id, tenant_id=tenant_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "ok", "doc_id": doc_id}


@router.patch("/docs/{doc_id}")
def update_document(doc_id: int, payload: dict, tenant_id: str | None = Depends(verify_token)):
    """Update document metadata fields (title, theme, summary, etc.)."""
    updated = search_index.update_doc(
        settings.index_path,
        doc_id,
        tenant_id=tenant_id,
        title=payload.get("title"),
        theme=payload.get("theme"),
        summary=payload.get("summary"),
        doc_type=payload.get("doc_type"),
        inferred_date=payload.get("inferred_date"),
        breach_category=payload.get("breach_category"),
        reliability=payload.get("reliability"),
        key_quote=payload.get("key_quote"),
        privileged=payload.get("privileged"),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    # Return updated doc
    doc = search_index.get_doc(settings.index_path, doc_id)
    return {"status": "ok", "doc": dict(doc) if doc else None}


@router.post("/collections/{name}/docs/{doc_id}")
def add_doc_to_collection(name: str, doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    index_dir = settings.index_path.parent
    col = collection_store.add_to_collection(index_dir, name, doc_id, tenant_id=tenant_id)
    return {"status": "ok", "collection": col}


@router.delete("/collections/{name}/docs/{doc_id}")
def remove_doc_from_collection(name: str, doc_id: int, tenant_id: str | None = Depends(verify_token)):
    """Remove a document from a collection (does not delete the document itself)."""
    index_dir = settings.index_path.parent
    ok = collection_store.remove_from_collection(index_dir, name, doc_id, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Collection or document not found")
    return {"status": "ok", "collection_name": name, "doc_id": doc_id}


@router.delete("/collections/{name}")
def delete_collection(name: str, tenant_id: str | None = Depends(verify_token)):
    """Delete an entire collection (does not delete the documents in it)."""
    index_dir = settings.index_path.parent
    ok = collection_store.delete_collection(index_dir, name, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"status": "ok", "collection_name": name}


@router.get("/collections/{name}/summary")
def get_collection_summary(name: str, tenant_id: str | None = Depends(verify_token)):
    """Return high-level stats for a single collection."""
    normalized = (name or "").strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Collection name is required")

    index_dir = settings.index_path.parent
    cols = collection_store.list_collections(index_dir, tenant_id=tenant_id)
    col = next((c for c in cols if c.get("name") == normalized), None)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    doc_ids = col.get("doc_ids") or []
    stats = {
        "total_docs": 0,
        "reviewed": 0,
        "needs_follow_up": 0,
        "relevant": 0,
        "not_relevant": 0,
        "in_reserve": 0,
        "in_treaty": 0,
        "in_soi": 0,
    }

    for doc_id in doc_ids:
        row = search_index.get_doc(settings.index_path, doc_id)
        if not row:
            continue
        row_dict = dict(row)
        if tenant_id and row_dict.get("tenant_id") not in (tenant_id, None):
            continue
        stats["total_docs"] += 1
        review = (row_dict.get("review_status") or "").strip() or None
        if review == "reviewed":
            stats["reviewed"] += 1
        elif review == "needs_follow_up":
            stats["needs_follow_up"] += 1
        label = (row_dict.get("user_relevance") or "").strip() or None
        if label == "relevant":
            stats["relevant"] += 1
        elif label == "not_relevant":
            stats["not_relevant"] += 1

        # Inspect geo tags from artifact JSON
        geo_tags = None
        task_id = row_dict.get("task_id")
        if task_id is not None:
            artifact_path = settings.staging_dir / f"{task_id}.json"
            if artifact_path.exists():
                try:
                    payload = json.loads(artifact_path.read_text())
                    maybe_tags = payload.get("geo_tags")
                    if isinstance(maybe_tags, dict):
                        geo_tags = maybe_tags
                except Exception:
                    geo_tags = None
        if geo_tags:
            if geo_tags.get("in_reserve"):
                stats["in_reserve"] += 1
            if geo_tags.get("in_treaty"):
                try:
                    if isinstance(geo_tags.get("in_treaty"), list) and geo_tags["in_treaty"]:
                        stats["in_treaty"] += 1
                except Exception:
                    pass
            if geo_tags.get("in_soi"):
                try:
                    if isinstance(geo_tags.get("in_soi"), list) and geo_tags["in_soi"]:
                        stats["in_soi"] += 1
                except Exception:
                    pass

    return {
        "name": col.get("name"),
        "tenant_id": col.get("tenant_id"),
        "doc_ids": doc_ids,
        "stats": stats,
    }


@router.post("/collections/{name}/export")
def export_collection(
    name: str,
    payload: dict | None = None,
    tenant_id: str | None = Depends(verify_token),
):
    """
    Export a collection as a formatted Markdown or PDF report.

    Payload options:
    - format: "markdown" (default) or "pdf"
    - include_summaries: bool (default: True)
    - include_key_quotes: bool (default: True)
    - include_metadata: bool (default: True)
    - include_geo_context: bool (default: True) - treaty/reserve/band info
    - group_by: "theme" | "breach" | "date" | null - group documents
    """
    from fastapi.responses import Response

    payload = payload or {}
    fmt = str(payload.get("format") or "markdown").lower()
    include_summaries = payload.get("include_summaries", True)
    include_key_quotes = payload.get("include_key_quotes", True)
    include_metadata = payload.get("include_metadata", True)

    normalized = (name or "").strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Collection name is required")

    index_dir = settings.index_path.parent
    cols = collection_store.list_collections(index_dir, tenant_id=tenant_id)
    col = next((c for c in cols if c.get("name") == normalized), None)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    doc_ids = col.get("doc_ids") or []
    if not doc_ids:
        raise HTTPException(status_code=400, detail="Collection has no documents")

    # Build Markdown content
    lines: list[str] = []
    lines.append(f"# Collection: {normalized}")
    lines.append("")
    lines.append(f"**Generated:** {time.strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Documents:** {len(doc_ids)}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Document index
    lines.append("## Document Index")
    lines.append("")
    lines.append("| # | Title | Theme | Type | Date |")
    lines.append("|---|-------|-------|------|------|")

    docs_data: list[dict] = []
    for idx, doc_id in enumerate(doc_ids, 1):
        row = search_index.get_doc(settings.index_path, doc_id)
        if not row:
            continue
        row_dict = dict(row)
        if tenant_id and row_dict.get("tenant_id") not in (tenant_id, None):
            continue
        docs_data.append(row_dict)
        title = row_dict.get("title") or "Untitled"
        theme = row_dict.get("theme") or "-"
        doc_type = row_dict.get("doc_type") or "-"
        date = row_dict.get("inferred_date") or "-"
        lines.append(f"| {idx} | {title[:40]} | {theme} | {doc_type} | {date} |")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Document details
    lines.append("## Document Details")
    lines.append("")

    # New options
    include_geo_context = payload.get("include_geo_context", True)
    group_by = payload.get("group_by")  # None, "theme", "breach", "date"

    # Optionally group documents
    if group_by == "theme":
        docs_data.sort(key=lambda d: d.get("theme") or "zzz")
    elif group_by == "breach":
        docs_data.sort(key=lambda d: d.get("breach_category") or "zzz")
    elif group_by == "date":
        docs_data.sort(key=lambda d: d.get("inferred_date") or "0000")

    current_group = None
    for idx, doc in enumerate(docs_data, 1):
        # Group headers
        if group_by:
            group_val = doc.get(group_by) or "Unclassified"
            if group_val != current_group:
                current_group = group_val
                lines.append(f"### Group: {current_group}")
                lines.append("")

        # Document header with evidence ID
        doc_id = doc.get("id") or idx
        stable_id = doc.get("stable_id") or f"EVD-{doc_id}"
        title = doc.get("title") or "Untitled"
        lines.append(f"#### [{stable_id}] {title}")
        lines.append("")

        if include_metadata:
            # Core metadata
            lines.append(f"- **Theme:** {doc.get('theme') or 'N/A'}")
            lines.append(f"- **Type:** {doc.get('doc_type') or 'N/A'}")
            lines.append(f"- **Date:** {doc.get('inferred_date') or 'N/A'}")
            # Domain-specific fields
            if doc.get("reliability"):
                lines.append(f"- **Reliability:** {doc.get('reliability')}")
            if doc.get("breach_category"):
                lines.append(f"- **Breach Category:** {doc.get('breach_category')}")
            if doc.get("privileged"):
                lines.append("- **⚠️ Privileged Document**")
            lines.append("")

        # Geo context (domain-specific)
        if include_geo_context:
            task_id = doc.get("task_id")
            geo_info = []
            if task_id:
                artifact_path = settings.staging_dir / f"{task_id}.json"
                if artifact_path.exists():
                    try:
                        artifact = json.loads(artifact_path.read_text())
                        geo_tags = artifact.get("geo_tags") or {}
                        if geo_tags.get("in_treaty"):
                            treaties = geo_tags.get("in_treaty")
                            if isinstance(treaties, list):
                                geo_info.append(f"Treaty: {', '.join(treaties)}")
                            else:
                                geo_info.append("In Treaty Area")
                        if geo_tags.get("in_reserve"):
                            geo_info.append("In Reserve")
                        if geo_tags.get("in_soi"):
                            sois = geo_tags.get("in_soi")
                            if isinstance(sois, list):
                                geo_info.append(f"SOI: {', '.join(sois[:2])}")
                        if geo_tags.get("nearest_offices"):
                            bands = geo_tags.get("nearest_offices")
                            if isinstance(bands, list) and bands:
                                geo_info.append(f"Near Band: {bands[0]}")
                    except Exception:
                        pass
            if geo_info:
                lines.append(f"**Geo Context:** {' | '.join(geo_info)}")
                lines.append("")

        if include_summaries and doc.get("summary"):
            lines.append("**Summary:**")
            lines.append(f"> {doc.get('summary')}")
            lines.append("")

        if include_key_quotes and doc.get("key_quote"):
            lines.append("**Key Quote:**")
            lines.append(f'> "{doc.get("key_quote")}"')
            lines.append("")

        lines.append("---")
        lines.append("")

    markdown_content = "\n".join(lines)

    # Return as Markdown or attempt PDF
    if fmt == "pdf":
        try:
            from weasyprint import HTML
            html_content = f"""
            <html><head><style>
            body {{ font-family: -apple-system, system-ui, sans-serif; padding: 2rem; line-height: 1.6; }}
            h1 {{ color: #1e293b; border-bottom: 2px solid #8b5cf6; padding-bottom: 0.5rem; }}
            h2 {{ color: #334155; margin-top: 2rem; }}
            h3 {{ color: #475569; }}
            table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; }}
            th, td {{ border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }}
            th {{ background: #f1f5f9; }}
            blockquote {{ border-left: 4px solid #8b5cf6; padding-left: 1rem; margin: 1rem 0; color: #475569; }}
            </style></head>
            <body>{"".join(f"<p>{line}</p>" if line and not line.startswith(("#", "|", "-", ">", "*")) else f"<br/>" for line in lines)}</body>
            </html>
            """
            # Simple markdown-to-HTML conversion for PDF
            import re as regex_module
            html_body = markdown_content
            html_body = regex_module.sub(r'^# (.+)$', r'<h1>\1</h1>', html_body, flags=regex_module.MULTILINE)
            html_body = regex_module.sub(r'^## (.+)$', r'<h2>\1</h2>', html_body, flags=regex_module.MULTILINE)
            html_body = regex_module.sub(r'^### (.+)$', r'<h3>\1</h3>', html_body, flags=regex_module.MULTILINE)
            html_body = regex_module.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html_body)
            html_body = regex_module.sub(r'^> (.+)$', r'<blockquote>\1</blockquote>', html_body, flags=regex_module.MULTILINE)
            html_body = html_body.replace('\n\n', '</p><p>').replace('\n', '<br/>')
            full_html = f"""
            <html><head><style>
            body {{ font-family: -apple-system, system-ui, sans-serif; padding: 2rem; line-height: 1.6; max-width: 800px; margin: 0 auto; }}
            h1 {{ color: #1e293b; border-bottom: 2px solid #8b5cf6; padding-bottom: 0.5rem; }}
            h2 {{ color: #334155; margin-top: 2rem; }}
            h3 {{ color: #475569; }}
            blockquote {{ border-left: 4px solid #8b5cf6; padding-left: 1rem; margin: 1rem 0; color: #475569; font-style: italic; }}
            hr {{ border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }}
            </style></head>
            <body><p>{html_body}</p></body>
            </html>
            """
            pdf_bytes = HTML(string=full_html).write_pdf()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{normalized}_report.pdf"'},
            )
        except ImportError:
            # weasyprint not installed, fall back to markdown
            pass
        except Exception as exc:
            logger.warning("PDF generation failed: %s; falling back to Markdown", exc)

    # Return Markdown
    return Response(
        content=markdown_content.encode("utf-8"),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{normalized}_report.md"'},
    )


@router.post("/collections/{name}/export/template/{template_type}")
def export_collection_template(
    name: str,
    template_type: str,
    payload: dict | None = None,
    tenant_id: str | None = Depends(verify_token),
):
    """
    Export a collection using a pre-built template format.
    
    Template types:
    - breach_summary: Groups docs by breach category with evidence summaries
    - treaty_evidence: Focuses on treaty-related geo context and dates
    - timeline_brief: Chronological narrative format
    """
    from fastapi.responses import Response

    payload = payload or {}
    normalized = (name or "").strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Collection name is required")

    index_dir = settings.index_path.parent
    cols = collection_store.list_collections(index_dir, tenant_id=tenant_id)
    col = next((c for c in cols if c.get("name") == normalized), None)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    doc_ids = col.get("doc_ids") or []
    if not doc_ids:
        raise HTTPException(status_code=400, detail="Collection has no documents")

    # Fetch all documents
    docs_data: list[dict] = []
    for doc_id in doc_ids:
        row = search_index.get_doc(settings.index_path, doc_id)
        if not row:
            continue
        row_dict = dict(row)
        if tenant_id and row_dict.get("tenant_id") not in (tenant_id, None):
            continue
        docs_data.append(row_dict)

    lines: list[str] = []

    if template_type == "breach_summary":
        # Group by breach category
        lines.append(f"# Breach Summary: {normalized}")
        lines.append("")
        lines.append(f"**Documents:** {len(docs_data)} | **Generated:** {time.strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append("---")
        lines.append("")

        by_breach: dict[str, list[dict]] = {}
        for doc in docs_data:
            bc = doc.get("breach_category") or "Unclassified"
            by_breach.setdefault(bc, []).append(doc)

        for breach_cat, docs_in_cat in sorted(by_breach.items()):
            lines.append(f"## {breach_cat} ({len(docs_in_cat)} docs)")
            lines.append("")
            for doc in docs_in_cat:
                stable_id = doc.get("stable_id") or f"EVD-{doc.get('id')}"
                lines.append(f"- **[{stable_id}]** {doc.get('title') or 'Untitled'}")
                if doc.get("key_quote"):
                    lines.append(f'  > "{doc.get("key_quote")[:150]}..."')
            lines.append("")

    elif template_type == "treaty_evidence":
        # Focus on treaty/geo context
        lines.append(f"# Treaty Evidence Summary: {normalized}")
        lines.append("")
        lines.append(f"**Documents:** {len(docs_data)} | **Generated:** {time.strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append("---")
        lines.append("")

        for idx, doc in enumerate(docs_data, 1):
            stable_id = doc.get("stable_id") or f"EVD-{doc.get('id')}"
            lines.append(f"### {idx}. [{stable_id}] {doc.get('title') or 'Untitled'}")
            lines.append("")
            lines.append(f"- **Date:** {doc.get('inferred_date') or 'Unknown'}")
            lines.append(f"- **Reliability:** {doc.get('reliability') or 'N/A'}")
            
            # Get geo context
            task_id = doc.get("task_id")
            if task_id:
                artifact_path = settings.staging_dir / f"{task_id}.json"
                if artifact_path.exists():
                    try:
                        artifact = json.loads(artifact_path.read_text())
                        geo_tags = artifact.get("geo_tags") or {}
                        if geo_tags.get("in_treaty"):
                            lines.append(f"- **Treaty:** {geo_tags.get('in_treaty')}")
                        if geo_tags.get("in_reserve"):
                            lines.append("- **Location:** In Reserve")
                        if geo_tags.get("nearest_offices"):
                            lines.append(f"- **Nearest Band:** {geo_tags.get('nearest_offices')}")
                    except Exception:
                        pass
            
            if doc.get("summary"):
                lines.append("")
                lines.append(f"> {doc.get('summary')}")
            lines.append("")
            lines.append("---")
            lines.append("")

    elif template_type == "timeline_brief":
        # Chronological narrative
        lines.append(f"# Timeline Brief: {normalized}")
        lines.append("")
        lines.append(f"**Documents:** {len(docs_data)} | **Generated:** {time.strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append("---")
        lines.append("")

        # Sort by date
        sorted_docs = sorted(docs_data, key=lambda d: d.get("inferred_date") or "0000")
        
        current_year = None
        for doc in sorted_docs:
            date_str = doc.get("inferred_date") or "Unknown"
            year = date_str[:4] if len(date_str) >= 4 else "Unknown"
            
            if year != current_year:
                current_year = year
                lines.append(f"## {year}")
                lines.append("")
            
            stable_id = doc.get("stable_id") or f"EVD-{doc.get('id')}"
            lines.append(f"**{date_str}** — [{stable_id}] {doc.get('title') or 'Untitled'}")
            if doc.get("summary"):
                lines.append(f"> {doc.get('summary')[:200]}...")
            lines.append("")

    else:
        raise HTTPException(status_code=400, detail=f"Unknown template: {template_type}")

    markdown_content = "\n".join(lines)
    return Response(
        content=markdown_content.encode("utf-8"),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{normalized}_{template_type}.md"'},
    )


@router.post("/llm/bundle_draft")
def llm_bundle_draft(payload: dict, tenant_id: str | None = Depends(verify_token)) -> dict:
    """Draft a short argument-style summary for a bundle of documents."""
    title = str(payload.get("title") or "").strip()
    raw_ids = payload.get("doc_ids") or []
    if not isinstance(raw_ids, list):
        raise HTTPException(status_code=400, detail="doc_ids must be a list of integers")
    try:
        doc_ids = [int(x) for x in raw_ids]
    except Exception:
        raise HTTPException(status_code=400, detail="doc_ids must be a list of integers")
    if not doc_ids:
        raise HTTPException(status_code=400, detail="doc_ids cannot be empty")

    evidence_lines: list[str] = []
    for doc_id in doc_ids:
        row = search_index.get_doc(settings.index_path, doc_id)
        if not row:
            continue
        row_dict = dict(row)
        if tenant_id and row_dict.get("tenant_id") not in (tenant_id, None):
            continue
        cite = row_dict.get("stable_id") or f"#{doc_id}"
        label = row_dict.get("title") or Path(row_dict.get("file_path") or f"doc-{doc_id}").name
        theme = row_dict.get("breach_category") or row_dict.get("theme") or ""
        summary = row_dict.get("summary") or row_dict.get("snippet") or ""
        key_quote = None
        try:
            task_id = row_dict.get("task_id")
            if task_id is not None:
                artifact_path = settings.staging_dir / f"{task_id}.json"
                if artifact_path.exists():
                    payload_json = json.loads(artifact_path.read_text())
                    key_quote = payload_json.get("forensic", {}).get("key_quote")
        except Exception:
            key_quote = None
        parts = [f"[{cite}] {label}"]
        if theme:
            parts.append(f"Theme: {theme}.")
        if summary:
            parts.append(f"Summary: {summary}")
        if key_quote:
            parts.append(f'Key quote: "{key_quote}"')
        evidence_lines.append(" ".join(parts))

    if not evidence_lines:
        raise HTTPException(status_code=404, detail="No accessible documents found for this bundle")

    header = f"Draft outline for {title or 'bundle'}"
    heuristic = "\n".join(["Evidence items:"] + [f"- {line}" for line in evidence_lines])

    llm_client = get_llm_client()
    if not llm_client:
        draft = "\n\n".join([header, heuristic, "", "(Refine with LLM when enabled.)"])
        return {"draft": draft}

    try:
        context = f"{header}\n\n{heuristic}"
        llm_draft = llm_client.summarize(context)
    except Exception:
        llm_draft = None

    draft = llm_draft or "\n\n".join([header, heuristic, "", "(LLM unavailable; heuristic outline only.)"])
    return {"draft": draft}


@router.get("/metrics")
def get_metrics(tenant_id: str | None = Depends(verify_token)):
    return {"counters": metrics.snapshot()}


@router.get("/metrics/history")
def get_metrics_history(
    limit: int = 200,
    offset: int = 0,
    tenant_id: str | None = Depends(verify_token),
) -> dict:
    # Metrics are global; tenant_id is accepted for consistency.
    history = metrics_history.read_history(settings.log_dir, limit=limit, offset=offset)
    return {"history": history, "path": str(metrics_history.history_path(settings.log_dir))}


@router.get("/admin/analytics/summary")
def analytics_summary(auth: dict = Depends(auth_context)) -> dict:
    """
    Derived KPIs for dashboards: throughput, Codex success, backlog by theme.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    themes = [p.stem.replace("Queue_", "") for p in _list_queue_files()]
    summary = analytics.compute_summary(settings.log_dir, _QUEUES_DIR, themes)
    return {"summary": summary}


@router.get("/admin/stats/charts")
def stats_charts(
    tenant_id: str | None = Depends(verify_token),
    start_year: int | None = Query(default=None, description="Filter timeline to start from this year"),
    end_year: int | None = Query(default=None, description="Filter timeline to end at this year"),
) -> dict:
    """
    Return aggregated data formatted for frontend chart components.

    Response includes:
    - docs_by_theme: [{name, count}] for pie chart
    - docs_by_type: [{name, count}] for pie chart
    - breach_categories: [{name, count}] for pie chart (domain-specific)
    - reliability_ratings: {A, B, C, D, unrated} for donut (domain-specific)
    - timeline: [{year, count}] for bar chart
    - processing_status: {pending, done, flagged} for donut chart
    - geo_coverage: {in_treaty, in_reserve, with_coords} (domain-specific)
    - forensic_stats: {with_key_quote, with_entities} (domain-specific)
    """
    # Get all documents
    docs = search_index.list_docs(settings.index_path, limit=10000, tenant_id=tenant_id)

    # Aggregate by theme
    theme_counts: dict[str, int] = {}
    for doc in docs:
        theme = doc.get("theme") or "untagged"
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    docs_by_theme = [{"name": k, "count": v} for k, v in sorted(theme_counts.items(), key=lambda x: -x[1])]

    # Aggregate by doc_type
    type_counts: dict[str, int] = {}
    for doc in docs:
        doc_type = doc.get("doc_type") or "unknown"
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
    docs_by_type = [{"name": k, "count": v} for k, v in sorted(type_counts.items(), key=lambda x: -x[1])]

    # Aggregate by breach_category (domain-specific)
    breach_counts: dict[str, int] = {}
    for doc in docs:
        bc = doc.get("breach_category") or "unclassified"
        breach_counts[bc] = breach_counts.get(bc, 0) + 1
    breach_categories = [{"name": k, "count": v} for k, v in sorted(breach_counts.items(), key=lambda x: -x[1])]

    # Aggregate by reliability rating (domain-specific)
    reliability_ratings: dict[str, int] = {"A": 0, "B": 0, "C": 0, "D": 0, "unrated": 0}
    for doc in docs:
        rel = (doc.get("reliability") or "").upper()
        if rel in ("A", "B", "C", "D"):
            reliability_ratings[rel] += 1
        else:
            reliability_ratings["unrated"] += 1

    # Timeline by year (from inferred_date)
    year_counts: dict[int, int] = {}
    for doc in docs:
        date_str = doc.get("inferred_date")
        if date_str and isinstance(date_str, str) and len(date_str) >= 4:
            try:
                year = int(date_str[:4])
                if 1800 <= year <= 2100:  # Sanity check
                    # Apply year range filter
                    if start_year and year < start_year:
                        continue
                    if end_year and year > end_year:
                        continue
                    year_counts[year] = year_counts.get(year, 0) + 1
            except ValueError:
                pass
    timeline = [{"year": k, "count": v} for k, v in sorted(year_counts.items())]

    # Processing status from queue_db
    from ... import queue_db
    status_counts = queue_db.task_counts(settings.queue_db, tenant_id=tenant_id)
    processing_status = {
        "pending": status_counts.get("pending", 0),
        "done": status_counts.get("done", 0) + status_counts.get("completed", 0),
        "flagged": status_counts.get("flagged", 0),
        "processing": status_counts.get("processing", 0),
    }

    # Geo coverage (domain-specific) - count docs with coordinates
    with_coords = 0
    in_treaty = 0
    in_reserve = 0
    for doc in docs:
        doc_id = doc.get("id")
        if doc_id:
            coords = search_index.get_geo_for_doc(settings.index_path, doc_id, tenant_id=tenant_id)
            if coords:
                with_coords += 1
        # Check geo_tags if available in staging artifact
        task_id = doc.get("task_id")
        if task_id:
            artifact_path = settings.staging_dir / f"{task_id}.json"
            if artifact_path.exists():
                try:
                    artifact = json.loads(artifact_path.read_text())
                    geo_tags = artifact.get("geo_tags") or {}
                    if geo_tags.get("in_treaty"):
                        in_treaty += 1
                    if geo_tags.get("in_reserve"):
                        in_reserve += 1
                except Exception:
                    pass

    geo_coverage = {
        "with_coords": with_coords,
        "in_treaty": in_treaty,
        "in_reserve": in_reserve,
        "total": len(docs),
    }

    # Forensic extraction stats (domain-specific)
    with_key_quote = sum(1 for d in docs if d.get("key_quote"))
    with_entities = sum(1 for d in docs if d.get("entities_json"))
    with_summary = sum(1 for d in docs if d.get("summary"))
    forensic_stats = {
        "with_key_quote": with_key_quote,
        "with_entities": with_entities,
        "with_summary": with_summary,
        "total": len(docs),
    }

    return {
        "docs_by_theme": docs_by_theme[:15],  # Top 15 themes
        "docs_by_type": docs_by_type[:10],    # Top 10 types
        "breach_categories": breach_categories[:10],  # Top 10 breach types
        "reliability_ratings": reliability_ratings,
        "timeline": timeline,
        "processing_status": processing_status,
        "geo_coverage": geo_coverage,
        "forensic_stats": forensic_stats,
        "total_docs": len(docs),
    }


@router.websocket("/ws/stats")
async def ws_stats_stream(websocket: WebSocket):
    """
    WebSocket for real-time dashboard stats updates.
    
    Client connects and receives periodic stats updates (every 3 seconds).
    Send {"type": "stop"} to end the stream.
    """
    await websocket.accept()
    
    # Auth check
    x_api_key = websocket.headers.get("x-api-key") or websocket.query_params.get("api_key")
    tenant_id = None
    if x_api_key == settings.api_token:
        tenant_id = settings.default_tenant
    elif not x_api_key:
        await websocket.close(code=4001, reason="api_key required")
        return
    
    try:
        from ... import queue_db
        
        last_counts = None
        while True:
            # Get quick stats (processing status only for real-time)
            status_counts = queue_db.task_counts(settings.queue_db, tenant_id=tenant_id)
            current_counts = {
                "pending": status_counts.get("pending", 0),
                "done": status_counts.get("done", 0) + status_counts.get("completed", 0),
                "flagged": status_counts.get("flagged", 0),
                "processing": status_counts.get("processing", 0),
            }
            
            # Get total docs count
            docs = search_index.list_docs(settings.index_path, limit=10000, tenant_id=tenant_id)
            total_docs = len(docs)
            
            # Only send if changed
            if current_counts != last_counts:
                await websocket.send_json({
                    "type": "update",
                    "processing_status": current_counts,
                    "total_docs": total_docs,
                    "ts": time.time(),
                })
                last_counts = current_counts
            
            # Check for stop message (non-blocking)
            try:
                msg = await asyncio.wait_for(websocket.receive_json(), timeout=3.0)
                if msg.get("type") == "stop":
                    break
            except asyncio.TimeoutError:
                pass
                
    except WebSocketDisconnect:
        pass
    except Exception:
        pass


@router.get("/admin/audit/events")
def admin_audit_events(
    limit: int = 200,
    offset: int = 0,
    action: str | None = None,
    tenant: str | None = None,
    auth: dict = Depends(auth_context),
) -> dict:
    """
    List structured audit events (JSONL) for multi-user oversight.
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    events = audit_history.read_events(settings.log_dir, limit=limit, offset=offset)
    if action:
        action_lc = action.lower()
        events = [e for e in events if str(e.get("action") or "").lower() == action_lc]
    if tenant:
        events = [e for e in events if str(e.get("tenant_id") or "") == tenant]
    return {"events": events, "path": str(audit_history.history_path(settings.log_dir))}


@router.post("/admin/export/bundle")
def export_bundle(payload: dict | None = None, auth: dict = Depends(auth_context)):
    """
    Create a zip bundle of the current case workspace (queues, refined evidence, chats, packs, metrics, logs).
    """
    require_role(settings.role_admin or "", auth.get("roles") or [])
    payload = payload or {}
    name = str(payload.get("name") or "pukaist_bundle").strip().replace(" ", "_")
    include_logs = bool(payload.get("include_logs", True))
    include_metrics = bool(payload.get("include_metrics", True))
    include_chats = bool(payload.get("include_chats", True))
    include_refined = bool(payload.get("include_refined", True))
    include_queues = bool(payload.get("include_queues", True))
    include_exec_events = bool(payload.get("include_exec_events", True))

    _audit_event(
        auth,
        "export_bundle",
        name=name,
        include_logs=include_logs,
        include_metrics=include_metrics,
        include_chats=include_chats,
        include_refined=include_refined,
        include_queues=include_queues,
        include_exec_events=include_exec_events,
    )

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        base = settings.workspace.parent

        def add_path(path: Path, arc_prefix: str = ""):
            if not path.exists():
                return
            if path.is_dir():
                for p in path.rglob("*"):
                    if p.is_file():
                        rel = p.relative_to(base) if base in p.parents else p.name
                        zf.write(p, arcname=str(Path(arc_prefix) / rel))
            else:
                rel = path.relative_to(base) if base in path.parents else path.name
                zf.write(path, arcname=str(Path(arc_prefix) / rel))

        if include_queues:
            add_path(_QUEUES_DIR)
            add_path(_CONTRADICTIONS_PATH)
            add_path(_FLAGGED_TASKS_PATH)
        if include_refined:
            add_path(_REFINED_EVIDENCE_DIR)
        if include_chats:
            add_path(chat_store.chats_dir(settings.log_dir))
            add_path(context_packs.packs_path(settings.log_dir))
        if include_metrics:
            add_path(metrics_history.history_path(settings.log_dir))
            add_path(exec_history.history_path(settings.log_dir))
        if include_exec_events:
            add_path(_CODEX_LOG_DIR)
        if include_logs:
            add_path(settings.log_dir)
            add_path(settings.workspace.parent / "99_Working_Files" / "Logs")

    buf.seek(0)
    headers = {
        "Content-Disposition": f'attachment; filename="{name}.zip"',
    }
    return StreamingResponse(buf, media_type="application/zip", headers=headers)


@router.post("/index/rebuild")
def rebuild_index(tenant_id: str | None = Depends(verify_token)):
    count = search_index.rebuild_from_staging(settings.index_path, settings.staging_dir)
    return {"status": "rebuilt", "count": count}


def _tail_file(path: Path, limit: int = 200) -> str:
    if not path.exists():
        return ""
    try:
        with path.open("r") as fh:
            lines = fh.readlines()[-limit:]
            return "".join(lines)
    except Exception:
        return ""


def _resolve_log_path(kind: str) -> Path | None:
    tmp_dir = Path("/tmp/pukaist")
    candidates = {
        "api": [tmp_dir / "api.log", settings.log_dir / "api.log"],
        "worker": [tmp_dir / "worker.log", settings.log_dir / "worker.log"],
        "hunyuan": [tmp_dir / "hunyuan_vllm.log", settings.log_dir / "hunyuan_vllm.log"],
    }.get(kind)
    if not candidates:
        return None
    for path in candidates:
        if path.exists():
            return path
    return candidates[0]


@router.get("/logs")
def get_logs(kind: str = "api", limit: int = 200, _: None = Depends(verify_token)) -> dict:
    target = _resolve_log_path(kind.lower())
    if not target:
        raise HTTPException(status_code=400, detail="unknown log kind")
    content = _tail_file(target, limit=limit)
    return {"log": kind, "path": str(target), "limit": limit, "content": content}


def _parse_gpu_csv(line: str) -> dict | None:
    try:
        row = next(csv.reader([line]))
    except Exception:
        return None
    if len(row) < 8:
        return None
    def _as_int(val: str) -> int | None:
        try:
            return int(float(val.strip()))
        except Exception:
            return None
    def _as_float(val: str) -> float | None:
        try:
            return float(val.strip())
        except Exception:
            return None
    return {
        "name": row[0].strip(),
        "uuid": row[1].strip(),
        "utilization": _as_int(row[2]),
        "memory_used": _as_int(row[3]),
        "memory_total": _as_int(row[4]),
        "temperature": _as_int(row[5]),
        "power_draw": _as_float(row[6]),
        "power_limit": _as_float(row[7]),
    }


@router.get("/admin/system/gpu")
def gpu_status(_: None = Depends(verify_token)) -> dict:
    """
    Lightweight GPU stats via nvidia-smi for admin dashboards.
    """
    cmd = [
        "nvidia-smi",
        "--query-gpu=name,uuid,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw,power.limit",
        "--format=csv,noheader,nounits",
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=2.0, check=True)
    except FileNotFoundError:
        return {"available": False, "error": "nvidia-smi not found", "ts": time.time()}
    except Exception as exc:
        return {"available": False, "error": str(exc), "ts": time.time()}
    gpus = []
    for line in proc.stdout.splitlines():
        parsed = _parse_gpu_csv(line.strip())
        if parsed:
            gpus.append(parsed)
    return {"available": bool(gpus), "gpus": gpus, "ts": time.time()}


@router.get("/admin/ocr/filesystem-status")
def ocr_filesystem_status(_: None = Depends(verify_token)) -> dict:
    """
    Return OCR progress based on actual filesystem contents.
    Reads from Pukaist/ (source PDFs) and checks multiple output directories.
    """
    import os
    # Use explicit path or fallback to project root
    base_dir = Path(os.getenv("PUKAIST_DATA_DIR", "/home/astraithious/pukaist-engine"))
    pukaist_dir = base_dir / "Pukaist"
    
    # Check both output directories - OCR_Output and Evidence_Staging
    ocr_output_dir = pukaist_dir / "OCR_Output"
    evidence_staging_dir = base_dir / "99_Working_Files" / "Evidence_Staging"
    
    # Count source PDFs
    total_pdfs = 0
    pdf_sizes: dict[str, int] = {"small": 0, "medium": 0, "large": 0}
    if pukaist_dir.exists():
        for pdf in pukaist_dir.glob("*.pdf"):
            total_pdfs += 1
            size_mb = pdf.stat().st_size / (1024 * 1024)
            if size_mb < 20:
                pdf_sizes["small"] += 1
            elif size_mb < 50:
                pdf_sizes["medium"] += 1
            else:
                pdf_sizes["large"] += 1
    
    # Count completed OCR files from both directories
    completed = 0
    skipped = 0
    last_completed_file = None
    last_completed_time = 0
    
    def scan_txt_dir(txt_dir: Path):
        nonlocal completed, skipped, last_completed_file, last_completed_time
        if not txt_dir.exists():
            return
        for txt in txt_dir.glob("*.txt"):
            try:
                size = txt.stat().st_size
                mtime = txt.stat().st_mtime
                content_start = txt.read_text(errors="ignore")[:50] if size > 0 else ""
                
                if "[SKIPPED:" in content_start:
                    skipped += 1
                elif size > 50:  # Valid OCR output
                    completed += 1
                    if mtime > last_completed_time:
                        last_completed_time = mtime
                        last_completed_file = txt.name
            except Exception:
                pass
    
    scan_txt_dir(ocr_output_dir)
    scan_txt_dir(evidence_staging_dir)
    
    pending = max(0, total_pdfs - completed - skipped)
    progress_pct = (completed / total_pdfs * 100) if total_pdfs > 0 else 0
    
    return {
        "total_pdfs": total_pdfs,
        "completed": completed,
        "skipped": skipped,
        "pending": pending,
        "progress_pct": round(progress_pct, 1),
        "pdf_sizes": pdf_sizes,
        "last_completed_file": last_completed_file,
        "last_completed_time": last_completed_time,
        "pukaist_dir": str(pukaist_dir),
        "ts": time.time(),
    }

@router.get("/embeddings/status")
def embeddings_status(_: None = Depends(verify_token)) -> dict:
    """Lightweight status helper for semantic search/embeddings."""
    return {
        "enabled": settings.embeddings_enabled,
        "provider": settings.embeddings_provider or settings.llm_provider,
        "model": settings.embeddings_model,
    }
