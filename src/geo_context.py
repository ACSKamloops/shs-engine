from __future__ import annotations

"""
Helpers for computing per-document geo context:
- Which AOIs (reserves/treaties/SOI) a doc's points fall into.
- Which First Nation offices (POIs) are nearest to those points.

This module is intentionally lightweight and uses only in-repo data structures
and simple geometry helpers (ray casting for point-in-polygon and Haversine
for distances).
"""

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from . import search_index, aoi_store, poi_store


@dataclass
class GeoPoint:
    lat: float
    lon: float


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Approximate great-circle distance between two WGS84 points in kilometers.
    """
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def _point_in_ring(lat: float, lon: float, ring: List[List[float]]) -> bool:
    """
    Ray-casting point-in-polygon for a single ring.
    ring is a list of [lon, lat] pairs.
    """
    inside = False
    n = len(ring)
    if n < 3:
        return False
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        # Check if the horizontal ray intersects the edge.
        if ((y1 > lat) != (y2 > lat)) and lon < (x2 - x1) * (lat - y1) / (y2 - y1 + 1e-12) + x1:
            inside = not inside
    return inside


def _point_in_feature(lat: float, lon: float, feature: Dict[str, Any]) -> bool:
    geom = feature.get("geometry") or {}
    gtype = geom.get("type")
    coords = geom.get("coordinates")
    if not gtype or coords is None:
        return False
    if gtype == "Polygon":
        ring = coords[0] if coords else []
        if not isinstance(ring, list):
            return False
        return _point_in_ring(lat, lon, ring)
    if gtype == "MultiPolygon":
        for poly in coords:
            if not poly or not isinstance(poly, list):
                continue
            ring = poly[0]
            if isinstance(ring, list) and _point_in_ring(lat, lon, ring):
                return True
    return False


def build_geo_context(index_path: Path, doc_id: int, tenant_id: Optional[str] = None, max_offices: int = 3) -> Dict[str, Any]:
    """
    Compute geo context for a single document:
    - points: all geo_points for the doc.
    - aois: AOI features that contain at least one doc point.
    - offices: nearest First Nation offices to any doc point (up to max_offices).
    """
    # Collect doc points
    coords_rows = search_index.get_geo_for_doc(index_path, doc_id, tenant_id=tenant_id)
    points: List[GeoPoint] = [GeoPoint(lat=r["lat"], lon=r["lon"]) for r in coords_rows]

    # AOIs (reserves/treaties/SOI) from aoi.json
    index_dir = index_path.parent
    aoi_fc = aoi_store.geojson(index_dir, tenant_id=tenant_id)
    aoi_features = aoi_fc.get("features") or []

    # POIs (First Nation offices) from poi.json
    poi_fc = poi_store.geojson(index_dir, tenant_id=tenant_id, theme="First_Nation_Office")
    poi_features = poi_fc.get("features") or []

    # For AOIs, track which ones contain at least one doc point.
    aoi_hits: Dict[int, Dict[str, Any]] = {}
    for f in aoi_features:
        props = f.get("properties") or {}
        theme = props.get("theme")
        if theme not in {"ALC_Confirmed", "ALC_Modified", "Modern_Treaty", "BC_SOI"}:
            continue
        # For each point, check membership; bail early on first hit.
        for p in points:
            if _point_in_feature(p.lat, p.lon, f):
                # Use id() of the feature object as a simple key; we also include canonical props.
                key = id(f)
                if key not in aoi_hits:
                    aoi_hits[key] = {
                        "name": props.get("name"),
                        "theme": theme,
                        "alcode": props.get("alcode"),
                        "altype": props.get("altype"),
                        "tag_id": props.get("tag_id"),
                        "sb_type": props.get("sb_type"),
                        "soi_id": props.get("soi_id"),
                        "jur1": props.get("jur1"),
                    }
                break

    # For offices, compute min distance to any doc point.
    office_distances: List[Tuple[float, Dict[str, Any]]] = []
    for f in poi_features:
        geom = f.get("geometry") or {}
        if geom.get("type") != "Point":
            continue
        coords = geom.get("coordinates") or []
        if not isinstance(coords, (list, tuple)) or len(coords) < 2:
            continue
        lon, lat = float(coords[0]), float(coords[1])
        if not points:
            continue
        dists = [haversine_km(p.lat, p.lon, lat, lon) for p in points]
        min_dist = min(dists) if dists else None
        if min_dist is None:
            continue
        props = f.get("properties") or {}
        office_distances.append(
            (
                min_dist,
                {
                    "name": props.get("name") or props.get("band_name"),
                    "band_name": props.get("band_name"),
                    "band_nbr": props.get("band_nbr"),
                    "lat": lat,
                    "lon": lon,
                    "distance_km": min_dist,
                },
            )
        )
    office_distances.sort(key=lambda t: t[0])
    top_offices = [item for _, item in office_distances[: max_offices or 3]]

    return {
        "doc_id": doc_id,
        "points": [{"lat": p.lat, "lon": p.lon} for p in points],
        "aois": list(aoi_hits.values()),
        "offices": top_offices,
    }


def derive_geo_tags_from_context(ctx: Dict[str, Any], scope: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Derive simple geo tags from a geo_context payload.

    Tags are intentionally coarse and stable for indexing/metadata use:
    - in_reserve: True if any reserve/settlement AOI (non-Land Claim ALC_*).
    - in_treaty: list of TAG_IDs for intersecting Modern Treaties.
    - in_soi: list of SOI_IDs for intersecting BC SOI regions.
    - nearest_offices: list of band_nbr values for nearest offices (if any).
    """
    aois = ctx.get("aois") or []
    offices = ctx.get("offices") or []

    # Optional mission / project scope: restrict which AOIs and offices
    # contribute to tags. This lets a project focus on particular
    # treaties, reserves, SOI regions, or band offices without losing
    # raw geo_context detail.
    themes_scope: set[str] = set()
    codes_scope: set[str] = set()
    names_scope: list[str] = []
    bands_scope: set[str] = set()

    if scope:
        for t in scope.get("aoi_themes") or []:
            if isinstance(t, str) and t.strip():
                themes_scope.add(t.strip())
        for c in scope.get("aoi_codes") or []:
            if isinstance(c, str) and c.strip():
                codes_scope.add(c.strip().lower())
        for n in scope.get("aoi_names") or []:
            if isinstance(n, str) and n.strip():
                names_scope.append(n.strip().lower())
        for b in scope.get("band_numbers") or []:
            if isinstance(b, (str, int)) and str(b).strip():
                bands_scope.add(str(b).strip())

    def _aoi_in_scope(a: Dict[str, Any]) -> bool:
        if not (themes_scope or codes_scope or names_scope):
            return True
        theme = (a.get("theme") or "").strip()
        if themes_scope and theme not in themes_scope:
            return False
        if codes_scope:
            for key in ("alcode", "tag_id", "soi_id"):
                val = a.get(key)
                if val is not None and str(val).lower() in codes_scope:
                    break
            else:
                return False
        if names_scope:
            nm = str(a.get("name") or "").lower()
            if not any(term in nm for term in names_scope):
                return False
        return True

    in_reserve = False
    treaty_ids: set[str] = set()
    soi_ids: set[str] = set()

    for a in aois:
        if not _aoi_in_scope(a):
            continue
        theme = (a.get("theme") or "").strip()
        altype = (a.get("altype") or "").strip().lower()
        if theme in {"ALC_Confirmed", "ALC_Modified"} and altype != "land claim":
            in_reserve = True
        if theme == "Modern_Treaty":
            tag_id = a.get("tag_id")
            if tag_id is not None:
                treaty_ids.add(str(tag_id))
        if theme == "BC_SOI":
            soi_id = a.get("soi_id")
            if soi_id is not None:
                soi_ids.add(str(soi_id))

    nearest_offices: list[str] = []
    for o in offices:
        band_nbr = o.get("band_nbr")
        if band_nbr is None:
            continue
        band_str = str(band_nbr)
        if bands_scope and band_str not in bands_scope:
            continue
        nearest_offices.append(band_str)

    return {
        "in_reserve": in_reserve,
        "in_treaty": sorted(treaty_ids),
        "in_soi": sorted(soi_ids),
        "nearest_offices": nearest_offices,
    }


def doc_matches_geo_filters(
    index_path: Path,
    doc_id: int,
    tenant_id: Optional[str] = None,
    aoi_theme: Optional[str] = None,
    aoi_code: Optional[str] = None,
    aoi_name: Optional[str] = None,
    near_band_nbr: Optional[str] = None,
) -> bool:
    """
    Return True if the document matches the requested AOI/POI filters.

    All provided filters are combined with logical AND. If no filter values are
    provided, this always returns True.
    """
    if not any([aoi_theme, aoi_code, aoi_name, near_band_nbr]):
        return True

    ctx = build_geo_context(index_path, doc_id, tenant_id=tenant_id)
    aois = ctx.get("aois") or []
    offices = ctx.get("offices") or []

    # AOI theme filter
    if aoi_theme:
        if not any((a.get("theme") or "") == aoi_theme for a in aois):
            return False

    # AOI code filter (matches reserve/treaty/SOI codes).
    if aoi_code:
        want = aoi_code.strip().lower()
        if want:
            def aoi_has_code(a: Dict[str, Any]) -> bool:
                for key in ("alcode", "tag_id", "soi_id"):
                    val = a.get(key)
                    if val is not None and str(val).lower() == want:
                        return True
                return False

            if not any(aoi_has_code(a) for a in aois):
                return False

    # AOI name substring filter.
    if aoi_name:
        needle = aoi_name.strip().lower()
        if needle:
            if not any(needle in str(a.get("name") or "").lower() for a in aois):
                return False

    # Near band office filter.
    if near_band_nbr:
        want_band = near_band_nbr.strip()
        if want_band:
            if not any(str(o.get("band_nbr")) == want_band for o in offices):
                return False

    return True
