"""
Simple validators for processed records.
"""

from __future__ import annotations

from typing import Dict, List


def validate_record(content: str, metadata: Dict) -> List[str]:
    errors: List[str] = []
    if not content or not content.strip():
        errors.append("empty content")
    if len(content.strip()) < 10:
        errors.append("content too short to index")
    if not metadata.get("doc_id"):
        errors.append("missing doc_id")
    if metadata.get("extension") in {"", None}:
        errors.append("missing extension")
    return errors


def summarize_errors(errors: List[str]) -> str:
    if not errors:
        return ""
    return "; ".join(errors)
