"""
Intake scanner for Pukaist Engine.

This script scans the configured incoming directory for files and enqueues
any that are not already present in the queue. It is intended for local
development workflows where you drop files into the intake folder and then
run this script to create jobs/tasks.

Usage (from repo root, with venv active):
  PYTHONPATH=. python scripts/intake_scan.py --theme demo

You can also use the Makefile target:
  make intake-scan
"""

from __future__ import annotations

import argparse
from pathlib import Path

from src.config import Settings
from src import queue_db, job_store  # type: ignore


def scan_and_enqueue(theme: str | None = None, dry_run: bool = False) -> int:
    settings = Settings.load()
    incoming_dir = settings.incoming_dir
    incoming_dir.mkdir(parents=True, exist_ok=True)

    queue_db.init(settings.queue_db)
    job_store.init(settings.queue_db)

    # Collect existing file paths from tasks to avoid duplicates.
    existing: set[str] = set()
    with queue_db.connect(settings.queue_db) as conn:
        rows = conn.execute("SELECT file_path FROM tasks").fetchall()
        existing.update(str(r["file_path"]) for r in rows)

    paths: list[Path] = []
    for path in incoming_dir.iterdir():
        if not path.is_file():
            continue
        if path.suffix.lstrip(".").lower() not in settings.allowed_exts:
            continue
        paths.append(path)

    count = 0
    for path in paths:
        if str(path) in existing:
            continue
        if dry_run:
            print(f"[DRY RUN] Would enqueue {path}")
            count += 1
            continue
        job_id = job_store.create_job(settings.queue_db, callback_url=None)
        queue_db.enqueue(settings.queue_db, path, theme, job_id=job_id, tenant_id=settings.default_tenant)
        print(f"Enqueued {path} as job {job_id}")
        count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan intake folder and enqueue new files.")
    parser.add_argument("--theme", type=str, default=None, help="Optional theme/tag to assign to enqueued tasks.")
    parser.add_argument("--dry-run", action="store_true", help="List files that would be enqueued without modifying the queue.")
    args = parser.parse_args()
    count = scan_and_enqueue(theme=args.theme, dry_run=args.dry_run)
    if args.dry_run:
        print(f"{count} files would be enqueued.")
    else:
        print(f"{count} files enqueued.")


if __name__ == "__main__":
    main()

