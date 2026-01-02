from __future__ import annotations

"""
Load demo evidence into a running Pukaist Engine instance.

Usage:
  API_BASE=http://localhost:8000 \
  API_KEY=dev-token \
  python -m scripts.load_demo

What it does:
  - Reads docs/demo/demo_manifest.json
  - Uploads each demo file via /upload?enqueue=true&dedupe=true&theme=…
  - Polls /search for the unique DEMO_* token to find the doc_id once the worker finishes
  - Applies relevance/review labels and optional coordinates for map pins

Prereqs:
  - API running (make api)
  - Worker running (make worker) to process the queue
"""

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, Optional

import requests


DEMO_DIR = Path(__file__).resolve().parent.parent / "docs" / "demo"
MANIFEST_PATH = DEMO_DIR / "demo_manifest.json"
DEFAULT_API_BASE = os.getenv("API_BASE", "http://localhost:8000")
DEFAULT_API_KEY = os.getenv("API_KEY") or os.getenv("PUKAIST_API_TOKEN") or "dev-token"


def upload_entry(api_base: str, api_key: str, entry: Dict[str, Any]) -> None:
    path = DEMO_DIR / entry["filename"]
    if not path.exists():
        raise FileNotFoundError(f"Missing demo file: {path}")
    files = {"file": (path.name, path.read_bytes())}
    params = {
        "enqueue": "true",
        "dedupe": "true",
        "theme": entry.get("theme") or "",
    }
    headers = {"X-API-Key": api_key}
    r = requests.post(f"{api_base}/upload", params=params, files=files, headers=headers, timeout=30)
    r.raise_for_status()
    data = r.json()
    stored_as = data.get("stored_as")
    print(f"[upload] {entry['id']} -> {stored_as}")


def find_doc_id(api_base: str, api_key: str, token: str, attempts: int = 20, delay: float = 2.0) -> Optional[int]:
    headers = {"X-API-Key": api_key}
    for i in range(attempts):
        r = requests.get(f"{api_base}/search", params={"q": token, "limit": 5}, headers=headers, timeout=15)
        r.raise_for_status()
        results = r.json().get("results") or []
        if results:
            doc_id = results[0].get("id")
            if isinstance(doc_id, int):
                print(f"[search] Found doc_id={doc_id} for token {token} (attempt {i+1}/{attempts})")
                return doc_id
        time.sleep(delay)
    return None


def label_doc(api_base: str, api_key: str, doc_id: int, label: str) -> None:
    headers = {"X-API-Key": api_key}
    r = requests.post(f"{api_base}/docs/{doc_id}/label", params={"label": label}, headers=headers, timeout=10)
    r.raise_for_status()
    print(f"[label] doc_id={doc_id} -> {label}")


def review_doc(api_base: str, api_key: str, doc_id: int, status: str) -> None:
    headers = {"X-API-Key": api_key}
    r = requests.post(f"{api_base}/docs/{doc_id}/review", params={"status": status}, headers=headers, timeout=10)
    r.raise_for_status()
    print(f"[review] doc_id={doc_id} -> {status}")


def add_coord(api_base: str, api_key: str, doc_id: int, lat: float, lon: float) -> None:
    headers = {"X-API-Key": api_key}
    r = requests.post(f"{api_base}/docs/{doc_id}/coords", params={"lat": lat, "lon": lon}, headers=headers, timeout=10)
    r.raise_for_status()
    print(f"[coord] doc_id={doc_id} -> {lat:.4f}, {lon:.4f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Load demo evidence into the running API.")
    parser.add_argument("--api-base", default=DEFAULT_API_BASE, help="API base URL (default: %(default)s)")
    parser.add_argument("--api-key", default=DEFAULT_API_KEY, help="API key (default: env API_KEY/PUKAIST_API_TOKEN or dev-token)")
    parser.add_argument("--no-labels", action="store_true", help="Skip applying relevance/review labels")
    parser.add_argument("--no-coords", action="store_true", help="Skip adding coordinates")
    args = parser.parse_args()

    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Demo manifest not found at {MANIFEST_PATH}")

    manifest = json.loads(MANIFEST_PATH.read_text())
    print(f"Loaded demo manifest with {len(manifest)} entries from {MANIFEST_PATH}")

    for entry in manifest:
        token = entry["id"]
        upload_entry(args.api_base, args.api_key, entry)
        doc_id = find_doc_id(args.api_base, args.api_key, token)
        if not doc_id:
            print(f"[warn] Could not find doc for token {token} yet; it may still be processing.")
            continue
        if not args.no_labels and entry.get("label"):
            label_doc(args.api_base, args.api_key, doc_id, entry["label"])
        if not args.no_labels and entry.get("review_status"):
            review_doc(args.api_base, args.api_key, doc_id, entry["review_status"])
        if not args.no_coords:
            coords = entry.get("coords") or {}
            lat = coords.get("lat")
            lon = coords.get("lon")
            if lat is not None and lon is not None:
                add_coord(args.api_base, args.api_key, doc_id, lat, lon)

    print("Done. Run `make worker` if the queue is not processed yet, then open the workspace to see the demo docs.")


if __name__ == "__main__":
    main()
