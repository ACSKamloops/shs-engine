"""
Spatial filtering utilities for Pukaist Engine.

Provides geometry parsing and point-in-polygon filtering for spatial search.
Uses the existing _point_in_ring implementation from geo_context.py to avoid
adding new dependencies.
"""

from __future__ import annotations

import json
import re
from typing import Any, List, Optional, Tuple

# GeoJSON geometry types we support
SUPPORTED_GEOMETRY_TYPES = {"Polygon", "MultiPolygon"}


def _point_in_ring(lat: float, lon: float, ring: List[List[float]]) -> bool:
    """
    Ray-casting point-in-polygon for a single ring.
    ring is a list of [lon, lat] pairs (GeoJSON order).
    """
    inside = False
    n = len(ring)
    if n < 3:
        return False
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        # Check if the horizontal ray intersects the edge
        if ((y1 > lat) != (y2 > lat)) and lon < (x2 - x1) * (lat - y1) / (y2 - y1 + 1e-12) + x1:
            inside = not inside
    return inside


def _point_in_polygon(lat: float, lon: float, polygon_coords: List[List[List[float]]]) -> bool:
    """Check if point is inside a polygon (with holes support)."""
    if not polygon_coords:
        return False
    # Check outer ring
    outer_ring = polygon_coords[0]
    if not _point_in_ring(lat, lon, outer_ring):
        return False
    # Check holes (if any) - point must NOT be in any hole
    for hole in polygon_coords[1:]:
        if _point_in_ring(lat, lon, hole):
            return False
    return True


def _point_in_multipolygon(lat: float, lon: float, multipolygon_coords: List[List[List[List[float]]]]) -> bool:
    """Check if point is inside any polygon of a MultiPolygon."""
    for polygon_coords in multipolygon_coords:
        if _point_in_polygon(lat, lon, polygon_coords):
            return True
    return False


def parse_geometry(geom_str: str) -> Optional[dict]:
    """
    Parse a geometry string (GeoJSON or simple WKT) into a normalized dict.

    Returns a dict with keys: type, coordinates
    Returns None if parsing fails.
    """
    if not geom_str or not isinstance(geom_str, str):
        return None

    geom_str = geom_str.strip()

    # Try JSON first (GeoJSON)
    if geom_str.startswith("{"):
        try:
            parsed = json.loads(geom_str)
            if isinstance(parsed, dict) and parsed.get("type") in SUPPORTED_GEOMETRY_TYPES:
                return {
                    "type": parsed["type"],
                    "coordinates": parsed.get("coordinates", []),
                }
        except json.JSONDecodeError:
            pass

    # Try simple WKT POLYGON
    # Example: POLYGON((-123.0 49.0, -122.0 49.0, -122.0 50.0, -123.0 50.0, -123.0 49.0))
    wkt_polygon_match = re.match(
        r"POLYGON\s*\(\s*\(\s*(.*?)\s*\)\s*\)",
        geom_str,
        re.IGNORECASE,
    )
    if wkt_polygon_match:
        coords_str = wkt_polygon_match.group(1)
        coords: List[List[float]] = []
        for pair in coords_str.split(","):
            pair = pair.strip()
            parts = pair.split()
            if len(parts) >= 2:
                try:
                    lon = float(parts[0])
                    lat = float(parts[1])
                    coords.append([lon, lat])
                except ValueError:
                    continue
        if len(coords) >= 3:
            return {"type": "Polygon", "coordinates": [coords]}

    return None


def point_in_geometry(lat: float, lon: float, geometry: dict) -> bool:
    """
    Check if a point (lat, lon) is inside the given geometry.

    geometry should be a dict with 'type' and 'coordinates' keys.
    """
    if not geometry or not isinstance(geometry, dict):
        return False

    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")

    if not coords:
        return False

    if geom_type == "Polygon":
        return _point_in_polygon(lat, lon, coords)
    elif geom_type == "MultiPolygon":
        return _point_in_multipolygon(lat, lon, coords)

    return False


def filter_docs_by_geometry(
    docs: List[dict],
    geometry: dict,
    get_coords_fn: Any,
) -> List[dict]:
    """
    Filter a list of documents to only those with at least one point inside the geometry.

    Args:
        docs: List of document dicts (must have 'id' key)
        geometry: Parsed geometry dict from parse_geometry()
        get_coords_fn: Function(doc_id) -> list of (lat, lon) tuples

    Returns:
        Filtered list of docs that have at least one point inside the geometry
    """
    if not geometry:
        return docs

    filtered = []
    for doc in docs:
        doc_id = doc.get("id")
        if doc_id is None:
            continue

        coords = get_coords_fn(doc_id)
        for lat, lon in coords:
            if point_in_geometry(lat, lon, geometry):
                filtered.append(doc)
                break  # Only need one match per doc

    return filtered
