from __future__ import annotations

"""
KMZ/KML importer to ingest geospatial overlays as AOIs and/or doc-linked shapes.

For now, we support KML placemarks with Point or Polygon geometries:
- Points are attached to docs (via add_geo_points) if a doc_id is provided.
- Polygons are stored as AOIs with an optional theme and name (the placemark name).

This module intentionally avoids heavy dependencies; it uses fastkml if available,
otherwise raises a clear error when invoked.
"""

import zipfile
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional, List, Tuple, Any, Dict

from . import aoi_store, search_index


class KMZImportError(Exception):
    pass


def _read_kml_from_kmz(path: Path) -> str:
    with zipfile.ZipFile(path, "r") as zf:
        for name in zf.namelist():
            if name.lower().endswith(".kml"):
                with zf.open(name) as fh:
                    return fh.read().decode("utf-8")
    raise KMZImportError("No KML file found inside KMZ")


def _parse_kml_simple(kml_text: str) -> List[Dict[str, Any]]:
    """
    Lightweight KML parser (Placemark Point/Polygon) without heavy deps.
    """
    try:
        root = ET.fromstring(kml_text)
    except Exception as exc:  # noqa: BLE001
        raise KMZImportError(f"Failed to parse KML: {exc}")
    ns = {"k": root.tag.split("}")[0].strip("{")} if "}" in root.tag else {}
    placemarks = []
    for pm in root.findall(".//k:Placemark", ns):
        name_el = pm.find("k:name", ns)
        name = name_el.text.strip() if name_el is not None and name_el.text else "KML import"
        # Point
        coord_el = pm.find(".//k:Point/k:coordinates", ns)
        if coord_el is not None and coord_el.text:
            parts = coord_el.text.strip().split()
            if parts:
                lon, lat, *_ = parts[0].split(",")
                placemarks.append({"type": "Point", "name": name, "coords": [(float(lat), float(lon))]})
                continue
        # Polygon (outer ring)
        poly_el = pm.find(".//k:Polygon//k:coordinates", ns)
        if poly_el is not None and poly_el.text:
            coord_text = poly_el.text.strip()
            coords = []
            for token in coord_text.split():
                lon, lat, *_ = token.split(",")
                coords.append([float(lon), float(lat)])
            if coords:
                placemarks.append({"type": "Polygon", "name": name, "coords": coords})
    return placemarks


def import_kmz(
    db_path: Path,
    kmz_path: Path,
    *,
    doc_id: Optional[int] = None,
    theme: Optional[str] = None,
    tenant_id: Optional[str] = None,
) -> dict:
    """
    Import KMZ/KML or GeoJSON:
    - Points -> doc geo_points (if doc_id) or AOI points.
    - Polygons -> AOIs.
    """
    if not kmz_path.exists():
        raise KMZImportError("File not found")
    suffix = kmz_path.suffix.lower()
    if suffix == ".kmz":
        kml_text = _read_kml_from_kmz(kmz_path)
    elif suffix == ".kml":
        kml_text = kmz_path.read_text()
    elif suffix in {".geojson", ".json"}:
        return import_geojson(db_path, kmz_path, doc_id=doc_id, theme=theme, tenant_id=tenant_id)
    else:
        raise KMZImportError("Unsupported file type; use KMZ, KML, or GeoJSON")
    if not kml_text.strip():
        raise KMZImportError("Empty KML content")
    placemarks = _parse_kml_simple(kml_text)
    points_added = 0
    aois_added = 0
    for pm in placemarks:
        name = pm.get("name") or "KMZ import"
        if pm.get("type") == "Point":
            for lat, lon in pm.get("coords", []):
                if doc_id:
                    search_index.add_geo_points(
                        db_path,
                        doc_id=doc_id,
                        task_id=None,
                        theme=theme,
                        title=name,
                        coords=[(lat, lon)],
                        tenant_id=tenant_id,
                    )
                    points_added += 1
                else:
                    aoi_store.add_aoi(db_path.parent, name=name, theme=theme, coords=[[lon, lat]], tenant_id=tenant_id)
                    aois_added += 1
        elif pm.get("type") == "Polygon":
            coords = pm.get("coords", [])
            if coords:
                aoi_store.add_aoi(db_path.parent, name=name, theme=theme, coords=coords, tenant_id=tenant_id)
                aois_added += 1
    return {"points_added": points_added, "aois_added": aois_added}


def import_geojson(
    db_path: Path,
    path: Path,
    *,
    doc_id: Optional[int] = None,
    theme: Optional[str] = None,
    tenant_id: Optional[str] = None,
) -> dict:
    data = json.loads(path.read_text())
    features: List[dict[str, Any]] = []
    if data.get("type") == "FeatureCollection":
        features = data.get("features", [])
    elif data.get("type") == "Feature":
        features = [data]
    points_added = 0
    aois_added = 0
    for feat in features:
        geom = feat.get("geometry") or {}
        props = feat.get("properties") or {}
        name = props.get("name") or "GeoJSON import"
        gtype = geom.get("type")
        coords = geom.get("coordinates")
        if not gtype or coords is None:
            continue
        if gtype == "Point":
            lon, lat = coords[0], coords[1]
            if doc_id:
                search_index.add_geo_points(
                    db_path,
                    doc_id=doc_id,
                    task_id=None,
                    theme=theme,
                    title=name,
                    coords=[(lat, lon)],
                    tenant_id=tenant_id,
                )
                points_added += 1
            else:
                aoi_store.add_aoi(db_path.parent, name=name, theme=theme, coords=[[lon, lat]], tenant_id=tenant_id)
                aois_added += 1
        elif gtype in {"Polygon", "MultiPolygon"}:
            if gtype == "Polygon":
                rings = coords[0] if coords else []
                coords_list = [[float(x), float(y)] for x, y, *rest in rings]
                aoi_store.add_aoi(db_path.parent, name=name, theme=theme, coords=coords_list, tenant_id=tenant_id)
                aois_added += 1
            else:
                for poly in coords:
                    rings = poly[0] if poly else []
                    coords_list = [[float(x), float(y)] for x, y, *rest in rings]
                    aoi_store.add_aoi(db_path.parent, name=name, theme=theme, coords=coords_list, tenant_id=tenant_id)
                    aois_added += 1
    return {"points_added": points_added, "aois_added": aois_added}
