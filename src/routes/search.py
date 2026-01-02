"""
Search routes for Pukaist Engine API.

Handles full-text search, hybrid/semantic search, and ask endpoint.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query

from ..config import Settings
from .. import search_index
from .. import search_index_hybrid
from .. import geo_context
from ..models import SearchResponse
from . import settings, logger, verify_token, get_llm_client

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search(
    q: str,
    limit: int = 20,
    theme: str | None = Query(default=None, description="Optional theme substring filter"),
    doc_type: str | None = Query(default=None, description="Optional doc_type substring filter"),
    semantic: bool = Query(default=False, description="If true and embeddings are enabled, use semantic (hybrid) search."),
    aoi_theme: str | None = Query(default=None, description="Optional AOI theme filter (e.g., ALC_Confirmed, Modern_Treaty)"),
    aoi_code: str | None = Query(default=None, description="Optional AOI code filter (ALCODE, TAG_ID, or SOI_ID)"),
    aoi_name: str | None = Query(default=None, description="Optional AOI name substring filter"),
    near_band_nbr: str | None = Query(default=None, description="Optional nearest First Nation office band number filter"),
    geometry: str | None = Query(default=None, description="GeoJSON or WKT polygon for spatial filtering (draw-to-filter)"),
    tenant_id: str | None = Depends(verify_token),
):
    if semantic and settings.embeddings_enabled:
        try:
            from ..search_index_hybrid import hybrid_search
        except Exception:
            rows = search_index.search(settings.index_path, q, limit=limit, tenant_id=tenant_id, theme=theme, doc_type=doc_type, queue_db_path=settings.queue_db)
        else:
            rows = hybrid_search(settings.index_path, q, limit=limit, tenant_id=tenant_id)
    else:
        rows = search_index.search(settings.index_path, q, limit=limit, tenant_id=tenant_id, theme=theme, doc_type=doc_type, queue_db_path=settings.queue_db)
    docs = [dict(r) for r in rows]

    # Apply geometry (spatial) filter if provided
    if geometry:
        from .. import geo_filter
        parsed_geom = geo_filter.parse_geometry(geometry)
        if parsed_geom:
            def get_coords_for_doc(doc_id: int) -> list[tuple[float, float]]:
                coord_rows = search_index.get_geo_for_doc(settings.index_path, doc_id, tenant_id=tenant_id)
                return [(r["lat"], r["lon"]) for r in coord_rows]

            docs = geo_filter.filter_docs_by_geometry(docs, parsed_geom, get_coords_for_doc)

    # Apply AOI/POI filters
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
    return {"results": docs}


@router.get("/search/hybrid", response_model=SearchResponse)
def search_hybrid(q: str, limit: int = 20, tenant_id: str | None = Depends(verify_token)):
    rows = search_index_hybrid.hybrid_search(settings.index_path, q, limit=limit, tenant_id=tenant_id)
    return {"results": [dict(r) for r in rows]}


@router.post("/ask")
def ask_archive(payload: dict, tenant_id: str | None = Depends(verify_token)) -> dict:
    """
    Lightweight Q&A helper over the local archive.

    Request body:
      { "q": "question text", "semantic": true|false, "limit": 8 }

    Response:
      {
        "answer": "<short markdown answer or heuristic summary>",
        "results": [ <search result rows> ]
      }
    """
    q = str(payload.get("q") or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="q is required")
    semantic = bool(payload.get("semantic") or False)
    try:
        limit = int(payload.get("limit") or 8)
    except Exception:
        limit = 8
    if limit <= 0:
        limit = 8
    limit = min(limit, 20)

    # Reuse the existing search plumbing.
    if semantic and settings.embeddings_enabled:
        try:
            rows = search_index_hybrid.hybrid_search(settings.index_path, q, limit=limit, tenant_id=tenant_id)
        except Exception:
            rows = search_index.search(
                settings.index_path,
                q,
                limit=limit,
                tenant_id=tenant_id,
                queue_db_path=settings.queue_db,
            )
    else:
        rows = search_index.search(
            settings.index_path,
            q,
            limit=limit,
            tenant_id=tenant_id,
            queue_db_path=settings.queue_db,
        )
    docs = [dict(r) for r in rows]

    if not docs:
        return {"answer": "No matching documents found for that question.", "results": []}

    # Heuristic answer composed from summaries/snippets.
    bullets: list[str] = []
    for row in docs:
        doc_id = row.get("id")
        cite = row.get("stable_id") or (f"#{doc_id}" if doc_id is not None else "?")
        title = row.get("title") or row.get("file_path") or "Untitled"
        summary = row.get("summary") or row.get("snippet") or ""
        if summary:
            snippet = summary.strip().replace("\n", " ")
            if len(snippet) > 260:
                snippet = snippet[:260] + "…"
        else:
            snippet = ""
        bullets.append(f"- [{cite}] {title}: {snippet}".rstrip())

    heuristic_answer = "\n".join(
        [
            f"Question: {q}",
            "",
            "Top matches from the local archive:",
            *bullets,
            "",
            "This answer is assembled locally from titles and summaries; enable a remote LLM if you want full natural-language explanations.",
        ]
    )

    llm_client = get_llm_client()
    if not llm_client:
        return {"answer": heuristic_answer, "results": docs}

    # Try to condense the heuristic answer with the generic summarizer.
    try:
        llm_answer = llm_client.summarize(heuristic_answer)
    except Exception:
        llm_answer = None

    return {"answer": llm_answer or heuristic_answer, "results": docs}
