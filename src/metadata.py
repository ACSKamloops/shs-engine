"""
Lightweight metadata inference helpers.
"""

from __future__ import annotations

import hashlib
import re
from datetime import datetime
from pathlib import Path
from typing import Optional


DATE_RE = re.compile(r"(20\d{2})[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])")
DATE_IN_TEXT_RE = re.compile(r"(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])")

DOC_TYPE_KEYWORDS = {
    "transcript": "transcript",
    "map": "map",
    "report": "report",
    "decision": "decision",
    "ruling": "decision",
    "filing": "filing",
    "application": "application",
    "summary": "summary",
}


def infer_metadata(file_path: Path, theme: Optional[str], content: str, content_bytes: Optional[bytes] = None) -> dict:
    title = file_path.stem or "Untitled"
    size_bytes = file_path.stat().st_size if file_path.exists() else 0
    raw_bytes = content_bytes if content_bytes is not None else content.encode("utf-8", errors="ignore")
    sha1 = hashlib.sha1(raw_bytes).hexdigest()
    sha256 = hashlib.sha256(raw_bytes).hexdigest()
    extension = file_path.suffix.lstrip(".").lower()
    date_match = DATE_RE.search(file_path.name)
    inferred_date = None
    if date_match:
        y, m, d = date_match.groups()
        try:
            inferred_date = datetime(int(y), int(m), int(d)).date().isoformat()
        except ValueError:
            inferred_date = None
    if not inferred_date:
        text_date = DATE_IN_TEXT_RE.search(content)
        if text_date:
            y, m, d = text_date.groups()
            try:
                inferred_date = datetime(int(y), int(m), int(d)).date().isoformat()
            except ValueError:
                inferred_date = None

    doc_type = None
    lower_name = file_path.name.lower()
    for needle, dtype in DOC_TYPE_KEYWORDS.items():
        if needle in lower_name:
            doc_type = dtype
            break

    return {
        "title": title,
        "theme": theme,
        "size_bytes": size_bytes,
        "doc_id": sha1,
        "stable_id": sha1,
        "sha256": sha256,
        "provenance": str(file_path),
        "inferred_date": inferred_date,
        "extension": extension,
        "doc_type": doc_type,
    }
