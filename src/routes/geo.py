"""
Geo routes for Pukaist Engine API.

Handles GeoJSON, AOI, POI, and KMZ import.
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse

from ..config import Settings
from .. import search_index
from .. import aoi_store
from .. import poi_store
from ..kmz_importer import import_kmz, KMZImportError
from . import settings, logger, verify_token

router = APIRouter(tags=["geo"])

_GEO_LAYER_FILES = {
    "bc_territories": "bc_territories.geojson",
    "bc_languages": "bc_languages.geojson",
    "bc_treaties": "bc_treaties.geojson",
    "bc_interior_watersheds": "bc_interior_watersheds.geojson",
    "bc_first_nations_locations": "bc_first_nations_locations.geojson",
}
_GEO_LAYER_ROOT = Path(__file__).resolve().parents[2] / "Geo" / "bc_interior"


@router.get("/geojson")
def geojson(
    limit: int = 100,
    label: str | None = Query(default=None, description="Optional user_relevance filter: relevant"),
    tenant_id: str | None = Depends(verify_token),
):
    if label:
        norm = label.strip().lower()
        if norm not in {"relevant"}:
            raise HTTPException(status_code=400, detail="label must be 'relevant' when provided")
        label_val = norm
    else:
        label_val = None
    return search_index.geojson(settings.index_path, limit=limit, tenant_id=tenant_id, label=label_val)


@router.get("/geo/layers/{layer_name}")
def geo_layer(
    layer_name: str,
    tenant_id: str | None = Depends(verify_token),
):
    layer_file = _GEO_LAYER_FILES.get(layer_name)
    if not layer_file:
        raise HTTPException(status_code=404, detail=f"Unknown geo layer: {layer_name}")
    path = _GEO_LAYER_ROOT / layer_file
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Geo layer not found. Run the geo download/filter scripts to build it locally.",
                "layer": layer_name,
                "path": str(path),
                "hint": "See Geo/README.md for the download/build steps.",
            },
        )
    return FileResponse(path, media_type="application/geo+json")


@router.post("/aoi")
def add_aoi(
    name: str = Query(..., description="AOI name"),
    theme: str | None = Query(default=None, description="Optional theme"),
    coords: str = Query(..., description="Polygon coordinates as JSON list of [lon,lat]"),
    tenant_id: str | None = Depends(verify_token),
):
    try:
        points = json.loads(coords)
        if not isinstance(points, list):
            raise ValueError("coords must be a list")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"invalid coords: {exc}")
    feature = aoi_store.add_aoi(settings.index_path.parent, name=name, theme=theme, coords=points, tenant_id=tenant_id)
    return feature


@router.get("/aoi")
def list_aoi(tenant_id: str | None = Depends(verify_token)):
    return aoi_store.geojson(settings.index_path.parent, tenant_id=tenant_id)


@router.get("/poi")
def list_poi(
    theme: str | None = Query(default=None, description="Optional theme filter (e.g. First_Nation_Office)"),
    tenant_id: str | None = Depends(verify_token),
):
    return poi_store.geojson(settings.index_path.parent, tenant_id=tenant_id, theme=theme)


@router.post("/aoi/import_kmz")
async def import_kmz_file(
    theme: str | None = Query(default=None, description="Optional theme to tag AOIs"),
    doc_id: int | None = Query(default=None, description="Optional doc_id to attach point placemarks as geo points"),
    file: UploadFile = File(...),
    tenant_id: str | None = Depends(verify_token),
):
    if not settings.kmz_enabled:
        raise HTTPException(
            status_code=400,
            detail={"message": "KMZ/GeoJSON import not enabled; set PUKAIST_KMZ_ENABLED=true"},
        )
    if not file.filename.lower().endswith((".kmz", ".kml", ".geojson", ".json")):
        raise HTTPException(
            status_code=415,
            detail={"message": "Only KMZ/KML/GeoJSON files are supported"},
        )
    tmp_path = settings.workspace / f"upload-{file.filename}"
    tmp_path.write_bytes(await file.read())
    try:
        result = import_kmz(settings.index_path, tmp_path, doc_id=doc_id, theme=theme, tenant_id=tenant_id)
    except KMZImportError as exc:
        logger.error(
            "KMZ import failed file=%s tenant=%s doc_id=%s theme=%s error=%s",
            file.filename,
            tenant_id,
            doc_id,
            theme,
            exc,
        )
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass
    logger.info(
        "KMZ import ok file=%s tenant=%s doc_id=%s theme=%s points=%s aois=%s",
        file.filename,
        tenant_id,
        doc_id,
        theme,
        result.get("points_added"),
        result.get("aois_added"),
    )
    return {"status": "ok", **result}
