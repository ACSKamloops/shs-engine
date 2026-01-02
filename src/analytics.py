from __future__ import annotations

import time
from pathlib import Path
from typing import Any

from . import exec_history
from . import metrics_history


def _hour_bucket(ts: float) -> str:
    return time.strftime("%Y-%m-%d %H:00", time.localtime(ts))


def compute_metrics_kpis(log_dir: Path) -> dict[str, Any]:
    history = metrics_history.read_history(log_dir, limit=500)
    if not history:
        return {
            "tasks_per_hour": 0.0,
            "api_requests_per_hour": 0.0,
        }
    # history is newest-first
    now = time.time()
    last_hour = [h for h in history if isinstance(h.get("ts"), (int, float)) and now - float(h["ts"]) <= 3600]
    if len(last_hour) < 2:
        last_hour = history[:2]
    last_hour_sorted = sorted(last_hour, key=lambda h: h.get("ts") or 0)
    first = last_hour_sorted[0]
    last = last_hour_sorted[-1]
    dt = max(float(last.get("ts") or now) - float(first.get("ts") or now), 1.0)
    first_c = first.get("counters") or {}
    last_c = last.get("counters") or {}
    tasks_delta = (last_c.get("tasks_completed") or 0) - (first_c.get("tasks_completed") or 0)
    req_delta = (last_c.get("api_requests_total") or 0) - (first_c.get("api_requests_total") or 0)
    return {
        "tasks_per_hour": float(tasks_delta) / (dt / 3600.0),
        "api_requests_per_hour": float(req_delta) / (dt / 3600.0),
    }


def compute_codex_kpis(log_dir: Path) -> dict[str, Any]:
    runs = exec_history.read_runs(log_dir, limit=1000)
    now = time.time()
    recent = [r for r in runs if isinstance(r.get("ts_end"), (int, float)) and now - float(r["ts_end"]) <= 24 * 3600]
    codex_runs = [
        r
        for r in recent
        if r.get("codex_chat")
        or ("codex exec" in str(r.get("command") or ""))
        or ("codex_exec_runner.sh" in str(r.get("command") or ""))
    ]
    if not codex_runs:
        return {"codex_runs_24h": 0, "codex_success_rate": 0.0, "codex_avg_duration_ms": 0.0}
    total = len(codex_runs)
    success = len([r for r in codex_runs if (r.get("exit_code") in (0, "0", None))])
    durations = [float(r.get("duration_ms") or 0) for r in codex_runs if r.get("duration_ms")]
    avg_dur = sum(durations) / len(durations) if durations else 0.0
    return {
        "codex_runs_24h": total,
        "codex_success_rate": success / max(total, 1),
        "codex_avg_duration_ms": avg_dur,
    }


def compute_summary(log_dir: Path, queues_dir: Path, themes: list[str]) -> dict[str, Any]:
    metrics_kpis = compute_metrics_kpis(log_dir)
    codex_kpis = compute_codex_kpis(log_dir)
    backlog = {}
    try:
        import csv

        for theme in themes:
            qpath = queues_dir / f"Queue_{theme}.tsv"
            if not qpath.exists():
                continue
            counts: dict[str, int] = {}
            with qpath.open("r", encoding="utf-8", newline="") as f:
                reader = csv.DictReader(f, delimiter="\t")
                for row in reader:
                    status = (row.get("Status") or "Unknown").strip() or "Unknown"
                    counts[status] = counts.get(status, 0) + 1
            backlog[theme] = counts
    except Exception:
        backlog = {}
    return {"metrics": metrics_kpis, "codex": codex_kpis, "backlog": backlog}

