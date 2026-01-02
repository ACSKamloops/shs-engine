"""
List available project configs under the projects/ directory.

Usage:
  PYTHONPATH=. python scripts/list_projects.py
"""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    projects_dir = root / "projects"
    if not projects_dir.exists():
        print("No projects directory found.")
        return
    for path in sorted(projects_dir.glob("*.json")):
        print(path.relative_to(root))


if __name__ == "__main__":
    main()

