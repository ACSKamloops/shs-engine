from __future__ import annotations

import json
import os
import subprocess
import threading
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from .config import Settings
from .exec_history import append_run, new_run_id


def config_path(log_dir: Path) -> Path:
    return log_dir / "codex_autorun_config.json"


@dataclass
class AutoRunConfig:
    enabled: bool = False
    interval_sec: int = 300
    max_concurrent_runs: int = 1
    themes: list[str] = field(default_factory=list)  # empty = auto-detect
    pending_threshold: int = 1
    require_no_inprogress: bool = True
    cooldown_sec: int = 60
    reap_stale_before_run: bool = True
    stale_mins: int = 120
    codex_env: dict[str, str] = field(default_factory=dict)  # e.g. PUKAIST_CODEX_* overrides
    active_start_hour: int = 0  # local time, inclusive
    active_end_hour: int = 24  # local time, exclusive; start==end => always on
    on_upload_enabled: bool = False
    on_upload_delay_sec: int = 0
    on_upload_macros: dict[str, list[dict[str, Any]]] = field(default_factory=dict)


def load_config(log_dir: Path) -> AutoRunConfig:
    path = config_path(log_dir)
    if not path.exists():
        return AutoRunConfig(enabled=os.getenv("PUKAIST_CODEX_AUTORUN_ENABLED", "false").lower() in {"1", "true", "yes", "on"})
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return AutoRunConfig()
    cfg = AutoRunConfig()
    for k, v in (data or {}).items():
        if hasattr(cfg, k):
            setattr(cfg, k, v)
    # normalize types
    cfg.interval_sec = int(cfg.interval_sec or 300)
    cfg.max_concurrent_runs = int(cfg.max_concurrent_runs or 1)
    cfg.pending_threshold = int(cfg.pending_threshold or 1)
    cfg.cooldown_sec = int(cfg.cooldown_sec or 0)
    cfg.stale_mins = int(cfg.stale_mins or 120)
    cfg.active_start_hour = int(cfg.active_start_hour or 0)
    cfg.active_end_hour = int(cfg.active_end_hour or 24)
    cfg.on_upload_delay_sec = int(cfg.on_upload_delay_sec or 0)
    if not isinstance(cfg.themes, list):
        cfg.themes = []
    if not isinstance(cfg.codex_env, dict):
        cfg.codex_env = {}
    if not isinstance(cfg.on_upload_macros, dict):
        cfg.on_upload_macros = {}
    cfg.active_start_hour = max(0, min(cfg.active_start_hour, 23))
    cfg.active_end_hour = max(0, min(cfg.active_end_hour, 24))
    return cfg


def save_config(log_dir: Path, cfg: AutoRunConfig) -> AutoRunConfig:
    log_dir.mkdir(parents=True, exist_ok=True)
    config_path(log_dir).write_text(json.dumps(asdict(cfg), ensure_ascii=False, indent=2), encoding="utf-8")
    return cfg


def _read_queue_counts(queues_dir: Path, theme: str) -> dict[str, int]:
    qpath = queues_dir / f"Queue_{theme}.tsv"
    if not qpath.exists():
        return {}
    try:
        import csv

        with qpath.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            counts: dict[str, int] = {}
            for row in reader:
                status = (row.get("Status") or "Unknown").strip() or "Unknown"
                counts[status] = counts.get(status, 0) + 1
            return counts
    except Exception:
        return {}


def _list_themes(queues_dir: Path) -> list[str]:
    themes: list[str] = []
    if not queues_dir.exists():
        return themes
    for p in queues_dir.glob("Queue_*.tsv"):
        if p.is_file():
            themes.append(p.stem.replace("Queue_", ""))
    themes.sort()
    return themes


def _within_active_window(start_hour: int, end_hour: int, now_struct: time.struct_time | None = None) -> bool:
    start = int(start_hour)
    end = int(end_hour)
    if start == end:
        return True
    now = now_struct or time.localtime()
    h = int(now.tm_hour)
    if start < end:
        return start <= h < end
    return h >= start or h < end


class AutoRunState:
    def __init__(self) -> None:
        self.running: dict[str, subprocess.Popen] = {}
        self.last_run_ts: dict[str, float] = {}
        self.last_decisions: dict[str, Any] = {}
        self.lock = threading.Lock()


def _run_reap_stale(working_dir: Path, theme: str, mins: int, env: dict[str, str]) -> None:
    cmd = [
        "python3",
        "99_Working_Files/Scripts/Queue_Management/reap_stale_locks.py",
        "--theme",
        theme,
        "--mins",
        str(mins),
    ]
    try:
        subprocess.run(cmd, cwd=str(working_dir), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        return


def _spawn_codex_run(working_dir: Path, theme: str, env: dict[str, str], log_dir: Path) -> subprocess.Popen:
    ts = time.strftime("%Y%m%d_%H%M%S")
    out_path = log_dir / f"codex_autorun_{theme}_{ts}.log"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["bash", "99_Working_Files/Utilities/codex_exec_runner.sh", theme]
    fh = out_path.open("wb")
    ts_start = time.time()
    proc = subprocess.Popen(cmd, cwd=str(working_dir), env=env, stdout=fh, stderr=subprocess.STDOUT)
    try:
        fh.close()
    except Exception:
        pass
    setattr(proc, "_pukaist_log_path", out_path)
    setattr(proc, "_pukaist_command", " ".join(cmd))
    setattr(proc, "_pukaist_ts_start", ts_start)
    try:
        setattr(proc, "_pukaist_env_keys", [k for k in env.keys() if str(k).startswith("PUKAIST_CODEX_")])
    except Exception:
        setattr(proc, "_pukaist_env_keys", [])
    return proc


def _finalize_proc(proc: subprocess.Popen, log_dir: Path, theme: str) -> None:
    try:
        log_path: Path | None = getattr(proc, "_pukaist_log_path", None)
        cmd_str: str | None = getattr(proc, "_pukaist_command", None)
        ts_start = getattr(proc, "_pukaist_ts_start", None)
        env_keys = getattr(proc, "_pukaist_env_keys", [])
        output_tail = ""
        if log_path and log_path.exists():
            try:
                output_tail = log_path.read_text(encoding="utf-8", errors="ignore")[-4000:]
            except Exception:
                output_tail = ""
        ts_end = time.time()
        duration_ms = int((ts_end - float(ts_start)) * 1000) if ts_start else None
        append_run(
            log_dir,
            {
                "run_id": new_run_id(),
                "ts_start": ts_start,
                "ts_end": ts_end,
                "duration_ms": duration_ms,
                "command": cmd_str or "",
                "exit_code": proc.returncode,
                "env_keys": env_keys if isinstance(env_keys, list) else [],
                "output_len": len(output_tail),
                "output_tail": output_tail,
                "autorun": True,
                "theme": theme,
            },
        )
    except Exception:
        return


def start_autorun_thread(settings: Settings, state: AutoRunState | None = None) -> AutoRunState:
    """
    Start a daemon thread that watches thematic TSV queues and runs Codex batches.
    """
    st = state or AutoRunState()

    def loop() -> None:
        while True:
            cfg = load_config(settings.log_dir)
            with st.lock:
                # Clean up finished procs
                for t, p in list(st.running.items()):
                    if p.poll() is not None:
                        _finalize_proc(p, settings.log_dir, t)
                        st.running.pop(t, None)
                running_count = len(st.running)

            if cfg.enabled and _within_active_window(cfg.active_start_hour, cfg.active_end_hour):
                themes = cfg.themes or _list_themes(Path(os.getenv("PUKAIST_QUEUES_DIR") or (settings.workspace.parent / "99_Working_Files" / "Queues")))
                queues_dir = Path(os.getenv("PUKAIST_QUEUES_DIR") or (settings.workspace.parent / "99_Working_Files" / "Queues"))
                for theme in themes:
                    with st.lock:
                        if running_count >= cfg.max_concurrent_runs:
                            break
                        if theme in st.running:
                            continue
                        last_ts = st.last_run_ts.get(theme, 0)
                        if cfg.cooldown_sec and time.time() - last_ts < cfg.cooldown_sec:
                            continue
                    counts = _read_queue_counts(queues_dir, theme)
                    pending = counts.get("Pending", 0)
                    inprogress = counts.get("InProgress", 0)
                    decision = {
                        "pending": pending,
                        "inprogress": inprogress,
                        "counts": counts,
                    }
                    with st.lock:
                        st.last_decisions[theme] = decision
                    if pending < cfg.pending_threshold:
                        continue
                    if cfg.require_no_inprogress and inprogress > 0:
                        continue

                    # Build env and optionally reap stale locks.
                    merged_env = os.environ.copy()
                    merged_env.update({k: str(v) for k, v in cfg.codex_env.items() if isinstance(k, str)})
                    merged_env.setdefault("PUKAIST_AGENT", "AutoCodex")
                    if cfg.reap_stale_before_run:
                        _run_reap_stale(settings.workspace.parent, theme, cfg.stale_mins, merged_env)

                    proc = _spawn_codex_run(settings.workspace.parent, theme, merged_env, settings.log_dir)
                    with st.lock:
                        st.running[theme] = proc
                        st.last_run_ts[theme] = time.time()
                        running_count = len(st.running)

            time.sleep(max(cfg.interval_sec, 5))

    th = threading.Thread(target=loop, name="codex_autorun", daemon=True)
    th.start()
    return st


if __name__ == "__main__":
    s = Settings.load()
    print("Starting Codex autorun thread (Ctrl+C to stop)…")
    start_autorun_thread(s)
    while True:
        time.sleep(3600)
