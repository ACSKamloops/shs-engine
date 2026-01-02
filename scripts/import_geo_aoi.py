from __future__ import annotations

"""
Import AOI layers from local GeoJSON caches under Geo/aoi into the Pukaist AOI store.

This is a local-only helper: it reads FeatureCollections from `Geo/aoi/*.geojson`,
normalizes them into simple Polygon AOIs (outer ring only), and appends them to
`aoi.json` under the current index directory.
"""

import json
import os
from pathlib import Path
from typing import Iterable, List, Dict, Any, Tuple

from src.config import Settings
from src import aoi_store


def _iter_geojson_features(path: Path) -> Iterable[Dict[str, Any]]:
    data = json.loads(path.read_text())
    if data.get("type") != "FeatureCollection":
        return []
    return data.get("features", []) or []


def _load_alcode_jur1_map(geo_root: Path) -> Dict[str, str]:
    """
    Build a lookup from ALCODE -> JUR1 using the raw Aboriginal Lands GeoJSON files,
    if present. This lets us scope imports by jurisdiction (e.g., BC-only).
    """
    mapping: Dict[str, str] = {}
    for fname in ("aboriginal_lands_confirmed.geojson", "aboriginal_lands_modified.geojson"):
        src = geo_root / fname
        if not src.exists():
            continue
        try:
            data = json.loads(src.read_text())
        except Exception:
            continue
        if data.get("type") != "FeatureCollection":
            continue
        for feat in data.get("features", []):
            props = feat.get("properties") or {}
            alcode = props.get("ALCODE")
            jur1 = props.get("JUR1")
            if isinstance(alcode, str) and isinstance(jur1, str) and alcode and jur1:
                mapping[alcode] = jur1
    return mapping


def _load_treaty_type_map(geo_root: Path) -> Dict[str, str]:
    """
    Build a lookup from TAG_ID -> SBTP_ENAME using the raw Modern Treaties GeoJSON.
    This lets us attach treaty type/category to AOIs for tooltips and filtering.
    """
    mapping: Dict[str, str] = {}
    src = geo_root / "modern_treaties.geojson"
    if not src.exists():
        return mapping
    try:
        data = json.loads(src.read_text())
    except Exception:
        return mapping
    if data.get("type") != "FeatureCollection":
        return mapping
    for feat in data.get("features", []):
        props = feat.get("properties") or {}
        tag_id = props.get("TAG_ID")
        sbtp = props.get("SBTP_ENAME")
        if isinstance(tag_id, str) and isinstance(sbtp, str) and tag_id and sbtp:
            mapping[tag_id] = sbtp
    return mapping


def _outer_rings(feature: Dict[str, Any]) -> List[List[List[float]]]:
    geom = feature.get("geometry") or {}
    gtype = geom.get("type")
    coords = geom.get("coordinates") or []
    rings: List[List[List[float]]] = []
    if gtype == "Polygon" and coords:
        # Use first ring as AOI outline.
        first = coords[0] or []
        if first:
            rings.append(first)
    elif gtype == "MultiPolygon" and coords:
        # Each polygon's first ring becomes its own AOI.
        for poly in coords:
            if poly and isinstance(poly, list) and poly[0]:
                first = poly[0]
                if first:
                    rings.append(first)
    return rings


def main() -> None:
    settings = Settings.load()
    index_dir = settings.index_path.parent
    geo_root = Path("Geo")
    geo_aoi_root = geo_root / "aoi"
    if not geo_aoi_root.exists():
        print("No Geo/aoi directory found; nothing to import.")
        return

    existing = aoi_store.load_aois(index_dir)
    seen: set[Tuple[str, str | None]] = set()
    for f in existing:
        props = f.get("properties") or {}
        seen.add((str(props.get("name") or ""), props.get("theme")))

    # Build a jurisdiction lookup for Aboriginal Lands to support BC-first imports.
    alcode_jur1 = _load_alcode_jur1_map(geo_root)
    treaty_type_map = _load_treaty_type_map(geo_root)
    bc_only_flag = os.getenv("PUKAIST_AOI_BC_ONLY", "true").lower()
    BC_ONLY = bc_only_flag in ("1", "true", "yes", "on")

    imported = 0
    files = sorted(p for p in geo_aoi_root.glob("*.geojson") if p.is_file())
    for path in files:
        theme_from_file = path.stem.replace("aoi_", "")
        print(f"Importing AOIs from {path} (theme={theme_from_file})")
        for feat in _iter_geojson_features(path):
            props = feat.get("properties") or {}
            raw_name = props.get("name") or props.get("NAME") or theme_from_file
            name = str(raw_name)
            theme = str(props.get("theme") or theme_from_file)
            rings = _outer_rings(feat)
            if not rings:
                continue
            for ring in rings:
                key = (name, theme)
                # Avoid duplicating AOIs on repeated runs.
                if key in seen:
                    continue
                extra = {}
                # Pass through selected metadata fields when present.
                for field in ("alcode", "altype", "tag_id", "soi_id", "source_file"):
                    if field in props:
                        extra[field] = props[field]
                # For Aboriginal Lands, optionally scope to BC by JUR1 (via ALCODE).
                alcode = props.get("alcode")
                if alcode and alcode_jur1:
                    jur1 = alcode_jur1.get(str(alcode))
                    if jur1:
                        extra["jur1"] = jur1
                        if BC_ONLY and jur1 != "BC":
                            continue
                tag_id = props.get("tag_id")
                if tag_id and treaty_type_map:
                    sb_type = treaty_type_map.get(str(tag_id))
                    if sb_type:
                        extra["sb_type"] = sb_type
                
                # Construct feature dict manually
                feat_props = {"name": name, "theme": theme, "tenant_id": None}
                feat_props.update(extra)
                
                new_feature = {
                    "type": "Feature",
                    "geometry": {"type": "Polygon", "coordinates": [ring]},
                    "properties": feat_props,
                }
                existing.append(new_feature)
                seen.add(key)
                imported += 1
    
    if imported > 0:
        aoi_store.save_aois(index_dir, existing)
    print(f"Imported {imported} AOI features into {index_dir/'aoi.json'}")


if __name__ == "__main__":
    main()
