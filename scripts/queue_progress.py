from __future__ import annotations

import argparse
import shutil
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src import queue_db  # noqa: E402
from src.config import Settings  # noqa: E402


def _summarize_counts(db_path: Path) -> dict:
    counts = queue_db.task_counts(db_path)
    done = counts.get("done", 0) + counts.get("completed", 0)
    flagged = counts.get("flagged", 0)
    processing = counts.get("processing", 0) + counts.get("leased", 0)
    pending = counts.get("pending", 0)
    other = sum(
        value
        for key, value in counts.items()
        if key not in {"done", "completed", "flagged", "processing", "leased", "pending"}
    )
    total = done + flagged + processing + pending + other
    completed = done + flagged
    return {
        "done": done,
        "flagged": flagged,
        "processing": processing,
        "pending": pending,
        "other": other,
        "total": total,
        "completed": completed,
    }


def _progress_bar(done: int, total: int, width: int) -> str:
    if total <= 0:
        return "[" + "-" * width + "]"
    ratio = min(max(done / total, 0.0), 1.0)
    filled = int(width * ratio)
    return "[" + "#" * filled + "-" * (width - filled) + "]"


def _format_line(summary: dict, bar_width: int) -> str:
    total = summary["total"]
    completed = summary["completed"]
    pct = 0.0 if total == 0 else (completed / total) * 100.0
    bar = _progress_bar(completed, total, bar_width)
    return (
        f"{bar} {pct:6.2f}% "
        f"done={summary['done']} flagged={summary['flagged']} "
        f"processing={summary['processing']} pending={summary['pending']} "
        f"total={summary['total']}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Show OCR queue progress.")
    parser.add_argument("--db", type=Path, default=None, help="Path to queue.db (defaults to Settings.queue_db)")
    parser.add_argument("--watch", type=float, default=0.0, help="Refresh interval in seconds (0 = print once)")
    parser.add_argument("--width", type=int, default=40, help="Progress bar width in characters")
    args = parser.parse_args()

    settings = Settings.load()
    db_path = args.db or settings.queue_db

    if args.watch <= 0:
        summary = _summarize_counts(db_path)
        print(_format_line(summary, args.width))
        return

    last_len = 0
    try:
        while True:
            summary = _summarize_counts(db_path)
            width = args.width
            term_cols = shutil.get_terminal_size((80, 20)).columns
            # Keep the bar on one line, even in narrow terminals.
            if term_cols < width + 40:
                width = max(10, term_cols - 40)
            line = _format_line(summary, width)
            pad = " " * max(0, last_len - len(line))
            sys.stdout.write("\r" + line + pad)
            sys.stdout.flush()
            last_len = len(line)
            time.sleep(args.watch)
    except KeyboardInterrupt:
        sys.stdout.write("\n")


if __name__ == "__main__":
    main()
