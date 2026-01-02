from __future__ import annotations

import argparse
import csv
from pathlib import Path

from src.config import Settings
from src import queue_db


def export_flagged(db_path: Path, out_path: Path, limit: int) -> int:
    rows = queue_db.list_flagged(db_path, limit=limit)
    with out_path.open("w", newline="") as fh:
        writer = csv.writer(fh, delimiter="\t")
        writer.writerow(["id", "file_path", "theme", "status", "last_error", "updated_at"])
        for r in rows:
            writer.writerow([r["id"], r["file_path"], r["theme"], r["status"], r["last_error"], r["updated_at"]])
    return len(rows)


def rerun_flagged(db_path: Path, limit: int) -> int:
    rows = queue_db.list_flagged(db_path, limit=limit)
    count = 0
    for r in rows:
        queue_db.reset_to_pending(db_path, r["id"])
        count += 1
    return count


def import_tasks(db_path: Path, tsv_path: Path) -> int:
    return queue_db.import_tasks_from_tsv(db_path, tsv_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Queue admin utilities")
    parser.add_argument("--db", default=None, help="Path to queue DB (defaults to env-configured)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    exp = sub.add_parser("export-flagged", help="Export flagged tasks to TSV")
    exp.add_argument("--out", required=True, help="Output TSV path")
    exp.add_argument("--limit", type=int, default=200, help="Max rows")

    rerun = sub.add_parser("rerun-flagged", help="Reset flagged tasks back to pending")
    rerun.add_argument("--limit", type=int, default=100, help="Max flagged tasks to reset")

    imp = sub.add_parser("import-tasks", help="Import tasks from TSV (file_path<TAB>theme)")
    imp.add_argument("--tsv", required=True, help="Path to TSV file")

    args = parser.parse_args()
    settings = Settings.load()
    db_path = Path(args.db) if args.db else settings.queue_db

    if args.cmd == "export-flagged":
        count = export_flagged(db_path, Path(args.out), args.limit)
        print(f"exported {count} flagged tasks to {args.out}")
    elif args.cmd == "rerun-flagged":
        count = rerun_flagged(db_path, args.limit)
        print(f"reset {count} flagged tasks to pending")
    elif args.cmd == "import-tasks":
        count = import_tasks(db_path, Path(args.tsv))
        print(f"imported {count} tasks from {args.tsv}")


if __name__ == "__main__":
    main()
