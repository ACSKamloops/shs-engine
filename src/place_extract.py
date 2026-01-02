"""
Stubbed place extraction + gazetteer lookup for geo suggestions.

This keeps things offline-friendly: it scans text for place names present
in a small gazetteer (file or built-in) and emits lat/lon suggestions.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
import re


BUILTIN_GAZETTEER: Dict[str, Tuple[float, float]] = {
    "vancouver": (49.2827, -123.1207),
    "victoria": (48.4284, -123.3656),
    "prince george": (53.9171, -122.7497),
    "calgary": (51.0486, -114.0708),
    "edmonton": (53.5461, -113.4938),
    "winnipeg": (49.8951, -97.1384),
    "toronto": (43.6532, -79.3832),
    "ottawa": (45.4215, -75.6972),
    "montreal": (45.5019, -73.5674),
    "halifax": (44.6488, -63.5752),
}


@dataclass
class PlaceSuggestion:
    name: str
    lat: float
    lon: float
    score: float
    source: str = "gazetteer"


def _parse_gazetteer(path: Path) -> Dict[str, Tuple[float, float]]:
    """
    Parse a simple gazetteer file. Accepts CSV or TSV with columns:
    name, lat, lon (header optional). Returns lowercased name → (lat, lon).
    """
    entries: Dict[str, Tuple[float, float]] = {}
    if not path.exists():
        return entries
    sep = "\t" if path.suffix.lower() in {".tsv", ".txt"} else ","
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(sep)]
        if len(parts) < 3:
            continue
        # Skip header row heuristically
        if parts[0].lower() in {"name", "place"}:
            continue
        try:
            lat = float(parts[1])
            lon = float(parts[2])
        except ValueError:
            continue
        entries[parts[0].lower()] = (lat, lon)
    return entries


def _lookup_table(gazetteer_path: Optional[Path]) -> Dict[str, Tuple[float, float]]:
    if gazetteer_path:
        parsed = _parse_gazetteer(gazetteer_path)
        if parsed:
            return parsed
    return BUILTIN_GAZETTEER


def extract_place_suggestions(text: str, gazetteer_path: Optional[Path] = None, limit: int = 8) -> List[PlaceSuggestion]:
    """
    Return place suggestions matched against a gazetteer.
    Matching is case-insensitive and uses word boundaries to avoid substring noise.
    """
    table = _lookup_table(gazetteer_path)
    haystack = text.lower()
    found: List[PlaceSuggestion] = []
    seen = set()
    for name, (lat, lon) in table.items():
        # Use regex with word boundaries to reduce false positives.
        pattern = rf"\b{re.escape(name)}\b"
        if not re.search(pattern, haystack):
            continue
        key = name
        if key in seen:
            continue
        seen.add(key)
        found.append(PlaceSuggestion(name=name.title(), lat=lat, lon=lon, score=1.0, source="gazetteer"))
        if len(found) >= limit:
            break
    return found
