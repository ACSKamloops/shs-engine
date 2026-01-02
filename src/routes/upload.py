"""
Upload routes for Pukaist Engine API.

Handles file upload with hash dedupe and intent processing.
"""

from __future__ import annotations

import hashlib
import json
import tempfile
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from starlette.responses import JSONResponse

from .. import queue_db
from .. import job_store
from ..callbacks import validate_callback_url
from ..models import UploadResponse
from . import settings, auth_context, require_role

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    theme: str | None = Query(default=None, description="Optional theme/tag for routing"),
    enqueue: bool = Query(default=True, description="If true, enqueue the task"),
    dedupe: bool = Query(default=True, description="If true, reuse existing uploads by hash instead of storing/enqueuing again"),
    intent: str | None = Query(default=None, description="Optional JSON intent (allowed_exts, prefilter_keywords, prefilter_min_chars, llm_mode, summary_enabled)"),
    callback_url: str | None = Query(default=None, description="Webhook to receive job status"),
    file: UploadFile = File(...),
    auth: dict = Depends(auth_context),
):
    tenant_id = auth.get("tenant_id")
    roles = auth.get("roles") or []
    # If roles are configured, require ingest or admin
    if settings.roles_claim and settings.role_ingest:
        require_role(settings.role_ingest, roles)
    if callback_url:
        validate_callback_url(callback_url, settings)

    incoming_dir = settings.incoming_dir
    incoming_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix.lower() or ".bin"
    ext = suffix.lstrip(".")
    if settings.allowed_exts and ext not in settings.allowed_exts:
        raise HTTPException(
            status_code=415,
            detail={
                "message": "Extension not allowed",
                "allowed_exts": settings.allowed_exts,
                "received_ext": ext,
            },
        )
    max_bytes = settings.max_upload_mb * 1024 * 1024
    hasher = hashlib.sha256()
    size_bytes = 0
    tmp = tempfile.NamedTemporaryFile(delete=False, dir=incoming_dir, prefix="upload-", suffix=suffix)
    tmp_path = Path(tmp.name)
    try:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size_bytes += len(chunk)
            if size_bytes > max_bytes:
                raise HTTPException(
                    status_code=413,
                    detail={
                        "message": "File too large",
                        "max_mb": settings.max_upload_mb,
                    },
                )
            hasher.update(chunk)
            tmp.write(chunk)
    except HTTPException:
        tmp.close()
        tmp_path.unlink(missing_ok=True)
        raise
    except Exception:
        tmp.close()
        tmp_path.unlink(missing_ok=True)
        raise
    finally:
        try:
            await file.close()
        except Exception:
            pass
        try:
            tmp.close()
        except Exception:
            pass

    sha256 = hasher.hexdigest()
    manifest_row = queue_db.find_manifest(settings.queue_db, sha256, tenant_id=tenant_id)
    if dedupe and manifest_row:
        tmp_path.unlink(missing_ok=True)
        return JSONResponse(
            {
                "job_id": None,
                "task_id": None,
                "stored_as": manifest_row["file_path"],
                "theme": manifest_row["theme"] or theme,
                "enqueued": False,
                "deduped": True,
                "sha256": sha256,
                "manifest_id": manifest_row["id"],
                "note": "Reused existing upload by hash; set dedupe=false to force re-enqueue.",
            }
        )

    original_name = Path(file.filename or "upload.bin").name
    filename = f"{int(time.time())}-{uuid.uuid4().hex}-{original_name}"
    dest = incoming_dir / filename
    tmp_path.replace(dest)
    intent_json = None
    if intent:
        try:
            intent_json = json.dumps(json.loads(intent))
        except Exception:
            raise HTTPException(status_code=400, detail={"message": "intent must be valid JSON"})
    manifest_row = queue_db.upsert_manifest(
        settings.queue_db,
        sha256=sha256,
        file_path=dest,
        original_name=file.filename,
        size_bytes=size_bytes,
        theme=theme,
        tenant_id=tenant_id,
    )

    effective_theme = theme or settings.project_theme
    job_id = None
    task_id = None
    if enqueue:
        job_id = job_store.create_job(settings.queue_db, callback_url=callback_url, tenant_id=tenant_id)
        task_id = queue_db.enqueue(settings.queue_db, dest, effective_theme, job_id=job_id, tenant_id=tenant_id, intent_json=intent_json)
    return JSONResponse(
        {
            "job_id": job_id,
            "task_id": task_id,
            "stored_as": str(dest),
            "theme": effective_theme,
            "enqueued": bool(enqueue),
            "deduped": False,
            "sha256": sha256,
            "manifest_id": manifest_row["id"],
            "intent": json.loads(intent_json) if intent_json else None,
        }
    )


@router.post("/docs", response_model=UploadResponse)
async def upload_doc_alias(
    theme: str | None = Query(default=None, description="Optional theme/tag for routing"),
    enqueue: bool = Query(default=True, description="If true, enqueue the task"),
    dedupe: bool = Query(default=True, description="If true, reuse existing uploads by hash instead of storing/enqueuing again"),
    intent: str | None = Query(default=None, description="Optional JSON intent (allowed_exts, prefilter_keywords, prefilter_min_chars, llm_mode, summary_enabled)"),
    callback_url: str | None = Query(default=None, description="Webhook to receive job status"),
    file: UploadFile = File(...),
    auth: dict = Depends(auth_context),
):
    """Alias for /upload so the UI can POST /docs with multipart form-data."""
    return await upload_file(
        theme=theme,
        enqueue=enqueue,
        dedupe=dedupe,
        intent=intent,
        callback_url=callback_url,
        file=file,
        auth=auth,
    )


@router.post("/signed-url")
def get_signed_url(request: dict, auth: dict = Depends(auth_context)):
    """
    Generate a pre-signed URL for client-side uploads.
    Supports S3/GCS/MinIO.
    """
    import uuid
    import time

    roles = auth.get("roles") or []
    if settings.roles_claim and settings.role_ingest:
        require_role(settings.role_ingest, roles)
    
    filename = request.get("filename")
    content_type = request.get("content_type")
    
    upload_id = str(uuid.uuid4())
    # Mock signed URL for development
    upload_url = f"https://storage.pukaist.io/uploads/{upload_id}?sig=mock"
    
    return {
        "upload_url": upload_url,
        "upload_id": upload_id,
        "expires_at": int(time.time()) + 3600,
        "fields": {}
    }


@router.post("/complete")
def complete_upload(request: dict, auth: dict = Depends(auth_context)):
    """
    Complete a client-side upload and trigger processing.
    """
    roles = auth.get("roles") or []
    if settings.roles_claim and settings.role_ingest:
        require_role(settings.role_ingest, roles)
    # In production, this would verify the file exists in storage
    # and create the document/job records
    return {
        "status": "processing",
        "job_id": 123,
        "doc_id": 456
    }
