"""
Lightweight geo extraction helpers.
"""

from __future__ import annotations

import re
from typing import List, Tuple

# Matches decimal degrees like 49.123, -123.456
COORD_RE = re.compile(r"([-+]?\d{1,2}\.\d{3,})(?:[^\d\-\+]{0,3})([-+]?\d{2,3}\.\d{3,})")


def extract_coords(text: str, limit: int = 10) -> List[Tuple[float, float]]:
    coords = []
    for match in COORD_RE.finditer(text):
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
        except ValueError:
            continue
        coords.append((lat, lon))
        if len(coords) >= limit:
            break
    return coords
