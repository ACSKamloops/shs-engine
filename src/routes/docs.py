"""
Document routes for Pukaist Engine API.

Handles document CRUD, artifacts, labels, reviews, geo points, and suggestions.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from .. import search_index
from .. import queue_db
from .. import geo_context
from ..models import DocsResponse
from . import settings, logger, verify_token

router = APIRouter(tags=["docs"])


@router.get("/docs", response_model=DocsResponse)
def list_docs(
    limit: int = 50,
    theme: str | None = Query(default=None, description="Optional theme substring filter"),
    doc_type: str | None = Query(default=None, description="Optional doc_type substring filter"),
    label: str | None = Query(default=None, description="Optional user_relevance filter: relevant|not_relevant"),
    review_status: str | None = Query(default=None, description="Optional review_status filter: reviewed|needs_follow_up"),
    aoi_theme: str | None = Query(default=None, description="Optional AOI theme filter (e.g., ALC_Confirmed, Modern_Treaty)"),
    aoi_code: str | None = Query(default=None, description="Optional AOI code filter (ALCODE, TAG_ID, or SOI_ID)"),
    aoi_name: str | None = Query(default=None, description="Optional AOI name substring filter"),
    near_band_nbr: str | None = Query(default=None, description="Optional nearest First Nation office band number filter"),
    tenant_id: str | None = Depends(verify_token),
):
    if label:
        norm = label.strip().lower()
        if norm not in {"relevant", "not_relevant"}:
            raise HTTPException(status_code=400, detail="label must be one of: relevant, not_relevant")
        label_val = norm
    else:
        label_val = None
    if review_status:
        norm_review = review_status.strip().lower()
        if norm_review not in {"reviewed", "needs_follow_up"}:
            raise HTTPException(status_code=400, detail="review_status must be one of: reviewed, needs_follow_up")
        review_val = norm_review
    else:
        review_val = None
    rows = search_index.list_docs(
        settings.index_path,
        limit=limit,
        tenant_id=tenant_id,
        theme=theme,
        doc_type=doc_type,
        label=label_val,
        review_status=review_val,
    )
    docs = [dict(r) for r in rows]
    if any([aoi_theme, aoi_code, aoi_name, near_band_nbr]):
        filtered: list[dict[str, object]] = []
        for d in docs:
            doc_id = d.get("id")
            if not isinstance(doc_id, int):
                continue
            if geo_context.doc_matches_geo_filters(
                settings.index_path,
                doc_id,
                tenant_id=tenant_id,
                aoi_theme=aoi_theme,
                aoi_code=aoi_code,
                aoi_name=aoi_name,
                near_band_nbr=near_band_nbr,
            ):
                filtered.append(d)
        docs = filtered
    return {"docs": docs}


@router.get("/docs/{doc_id}")
def get_doc_detail(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    return row


@router.post("/docs/{doc_id}/label")
def set_doc_label(
    doc_id: int,
    label: str = Query(..., description="relevant | not_relevant | clear"),
    tenant_id: str | None = Depends(verify_token),
):
    """Set or clear a user-defined relevance label for a document."""
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")

    norm = (label or "").strip().lower()
    if norm not in {"relevant", "not_relevant", "clear"}:
        raise HTTPException(status_code=400, detail="label must be one of: relevant, not_relevant, clear")
    value = None if norm == "clear" else norm
    search_index.set_user_relevance(settings.index_path, doc_id, value)
    return {"doc_id": doc_id, "user_relevance": value}


@router.post("/docs/{doc_id}/review")
def set_doc_review_status(
    doc_id: int,
    status: str = Query(..., description="reviewed | needs_follow_up | clear"),
    tenant_id: str | None = Depends(verify_token),
):
    """Set or clear a user-defined review status for a document."""
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")

    norm = (status or "").strip().lower()
    if norm not in {"reviewed", "needs_follow_up", "clear"}:
        raise HTTPException(status_code=400, detail="status must be one of: reviewed, needs_follow_up, clear")
    value = None if norm == "clear" else norm
    search_index.set_review_status(settings.index_path, doc_id, value)
    return {"doc_id": doc_id, "review_status": value}


@router.get("/docs/{doc_id}/artifact")
def get_doc_artifact(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    task_id = row.get("task_id")
    if task_id is None:
        raise HTTPException(status_code=404, detail="Artifact not found")
    artifact_path = settings.staging_dir / f"{task_id}.json"
    if not artifact_path.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    try:
        payload = json.loads(artifact_path.read_text())
        task_row = queue_db.get_task(settings.queue_db, task_id, tenant_id=tenant_id)
        if task_row:
            task_row = dict(task_row)
            if task_row.get("intent_json"):
                try:
                    payload["intent"] = json.loads(task_row["intent_json"])
                except Exception:
                    payload["intent"] = None
        return payload
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read artifact")


@router.get("/docs/{doc_id}/file")
def get_doc_file(
    doc_id: int,
    token: str | None = Query(default=None, description="Optional token for image/pdf embedding"),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    authorization: str | None = Header(default=None),
):
    from fastapi.responses import FileResponse
    
    if os.getenv("PUKAIST_AUTH_DISABLED", "false").lower() in {"1", "true", "yes", "on"}:
        tenant_id = settings.default_tenant
    elif token:
        if not settings.api_token or token != settings.api_token:
            raise HTTPException(status_code=401, detail="Invalid API token")
        tenant_id = settings.default_tenant
    else:
        tenant_id = verify_token(x_api_key, authorization)
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    path = Path(row["file_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="Source file not found")
    headers = {"Content-Disposition": f'inline; filename="{path.name}"'}
    return FileResponse(path, filename=path.name, headers=headers)


@router.post("/docs/{doc_id}/coords")
def add_doc_coords(doc_id: int, lat: float, lon: float, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)  # Convert sqlite3.Row to dict
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    coords = [(lat, lon)]
    search_index.add_geo_points(
        settings.index_path,
        doc_id=doc_id,
        task_id=row.get("task_id"),
        theme=row.get("theme"),
        title=row.get("title") or Path(row.get("file_path")).name,
        coords=coords,
        tenant_id=tenant_id,
    )
    logger.info("Added manual coord doc_id=%s lat=%s lon=%s tenant=%s", doc_id, lat, lon, tenant_id)
    return {"status": "ok", "doc_id": doc_id, "lat": lat, "lon": lon}


@router.get("/docs/{doc_id}/geo")
def get_doc_geo(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    coords = search_index.get_geo_for_doc(settings.index_path, doc_id, tenant_id=tenant_id)
    return {"doc_id": doc_id, "coords": [{"id": r["id"], "lat": r["lat"], "lon": r["lon"]} for r in coords]}


@router.get("/docs/{doc_id}/geo_context")
def get_doc_geo_context(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    ctx = geo_context.build_geo_context(settings.index_path, doc_id, tenant_id=tenant_id)
    return ctx


@router.get("/docs/{doc_id}/suggestions")
def list_doc_suggestions(doc_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    suggestions = search_index.list_suggestions(settings.index_path, doc_id, tenant_id=tenant_id)
    return {"suggestions": [dict(s) for s in suggestions]}


@router.post("/docs/{doc_id}/suggestions/{suggestion_id}/accept")
def accept_doc_suggestion(doc_id: int, suggestion_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        search_index.accept_suggestion(settings.index_path, suggestion_id, row, tenant_id=tenant_id)
    except ValueError as exc:
        logger.warning(
            "Accept suggestion failed doc_id=%s suggestion_id=%s tenant=%s error=%s",
            doc_id,
            suggestion_id,
            tenant_id,
            exc,
        )
        raise HTTPException(status_code=400, detail=str(exc))
    logger.info("Accepted suggestion doc_id=%s suggestion_id=%s tenant=%s", doc_id, suggestion_id, tenant_id)
    return {"status": "accepted", "suggestion_id": suggestion_id, "doc_id": doc_id}


@router.post("/docs/{doc_id}/suggestions/{suggestion_id}/reject")
def reject_doc_suggestion(doc_id: int, suggestion_id: int, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    search_index.reject_suggestion(settings.index_path, suggestion_id, tenant_id=tenant_id)
    logger.info("Rejected suggestion doc_id=%s suggestion_id=%s tenant=%s", doc_id, suggestion_id, tenant_id)
    return {"status": "rejected", "suggestion_id": suggestion_id, "doc_id": doc_id}


@router.patch("/docs/{doc_id}/coords/{coord_id}")
def update_doc_coord(doc_id: int, coord_id: int, lat: float, lon: float, tenant_id: str | None = Depends(verify_token)):
    row = search_index.get_doc(settings.index_path, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    row = dict(row)
    if tenant_id and row.get("tenant_id") not in (tenant_id, None):
        raise HTTPException(status_code=404, detail="Document not found")
    search_index.update_geo_point(settings.index_path, coord_id, doc_id, lat, lon, tenant_id=tenant_id)
    logger.info("Updated coord coord_id=%s doc_id=%s lat=%s lon=%s tenant=%s", coord_id, doc_id, lat, lon, tenant_id)
    return {"status": "updated", "coord_id": coord_id, "doc_id": doc_id, "lat": lat, "lon": lon}
