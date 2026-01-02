"""
Minimal CLI client for the local-first API.
Use for quick integration tests or scripting.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

import requests


def make_client(base_url: str, api_key: str):
    headers = {"X-API-Key": api_key}

    def _get(path: str, params: Dict[str, Any] | None = None):
        resp = requests.get(f"{base_url}{path}", headers=headers, params=params)
        resp.raise_for_status()
        return resp.json()

    def _post(path: str, files=None, params=None):
        resp = requests.post(f"{base_url}{path}", headers=headers, files=files, params=params)
        resp.raise_for_status()
        return resp.json()

    return _get, _post


def main() -> None:
    parser = argparse.ArgumentParser(description="Pukaist Engine API client")
    parser.add_argument("--base-url", default="http://localhost:8000", help="API base URL")
    parser.add_argument("--api-key", default="dev-token", help="API key header value")

    sub = parser.add_subparsers(dest="cmd", required=True)

    up = sub.add_parser("upload", help="Upload a file")
    up.add_argument("path", type=Path)
    up.add_argument("--theme", default=None)

    sub.add_parser("tasks", help="List tasks")
    sub.add_parser("jobs", help="List jobs")

    js = sub.add_parser("job", help="Get a job")
    js.add_argument("job_id", type=int)

    jt = sub.add_parser("job-tasks", help="List tasks for a job")
    jt.add_argument("job_id", type=int)

    se = sub.add_parser("search", help="Search index")
    se.add_argument("query")
    se.add_argument("--limit", type=int, default=20)

    sub.add_parser("docs", help="List indexed docs")
    sub.add_parser("status", help="Queue summary")
    sub.add_parser("geojson", help="Get GeoJSON features")

    args = parser.parse_args()
    get, post = make_client(args.base_url.rstrip("/"), args.api_key)

    try:
        if args.cmd == "upload":
            with args.path.open("rb") as fh:
                res = post("/upload", files={"file": fh}, params={"theme": args.theme})
        elif args.cmd == "tasks":
            res = get("/tasks")
        elif args.cmd == "jobs":
            res = get("/jobs")
        elif args.cmd == "job":
            res = get(f"/jobs/{args.job_id}")
        elif args.cmd == "job-tasks":
            res = get(f"/jobs/{args.job_id}/tasks")
        elif args.cmd == "search":
            res = get("/search", params={"q": args.query, "limit": args.limit})
        elif args.cmd == "docs":
            res = get("/docs")
        elif args.cmd == "status":
            res = get("/status")
        elif args.cmd == "geojson":
            res = get("/geojson")
        else:
            parser.error("Unknown command")
            return
        print(json.dumps(res, indent=2))
    except requests.HTTPError as exc:
        sys.stderr.write(f"HTTP error: {exc} :: {getattr(exc.response, 'text', '')}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
