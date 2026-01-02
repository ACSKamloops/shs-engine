from __future__ import annotations

from typing import Dict, Optional, Iterable

from .config import Settings


def _keywords_list(raw: Optional[Iterable[str]]) -> list[str]:
    if not raw:
        return []
    return [str(x).strip() for x in raw if str(x).strip()]


def should_use_llm(content: str, metadata: Dict, settings: Settings, overrides: Optional[dict] = None) -> bool:
    """
    Lightweight prefilter to decide whether to call LLMs.
    - Enforces a minimum character threshold if set.
    - If keywords are provided, requires at least one keyword to be present (case-insensitive).
    """
    text = content or ""
    min_chars = settings.prefilter_min_chars
    if overrides and isinstance(overrides.get("prefilter_min_chars"), (int, float)):
        min_chars = int(overrides["prefilter_min_chars"])
    keywords = _keywords_list(settings.prefilter_keywords)
    if overrides and overrides.get("prefilter_keywords"):
        keywords = _keywords_list(overrides.get("prefilter_keywords"))

    if min_chars and len(text) < min_chars:
        return False
    if keywords:
        lower_text = text.lower()
        if not any(kw.lower() in lower_text for kw in keywords):
            return False
    return True
