from __future__ import annotations

from collections import Counter
from typing import Any, Dict, List, Tuple


def derive_insights(text: str, metadata: Dict[str, Any], coords: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Lightweight, heuristic "insights" record.

    This is intentionally simple and local-only; LLM-based enrichment
    can be layered on later without changing the shape.
    """
    theme = metadata.get("theme")
    doc_type = metadata.get("doc_type")

    tokens = [t for t in text.split() if len(t) > 3]
    counts = Counter(tokens)
    common_tokens = [w for w, _ in counts.most_common(10)]

    insights: Dict[str, Any] = {
        "theme": theme,
        "doc_type": doc_type,
        "has_geo": bool(coords),
        "coord_count": len(coords),
        "top_terms": common_tokens,
    }
    if coords:
        sample = coords[:5]
        insights["sample_coords"] = [{"lat": lat, "lon": lon} for lat, lon in sample]
    return insights

