"""
Pukaist Engine API — Modular FastAPI Application

This file has been refactored to use modular route definitions.
All endpoint handlers have been moved to the routes/ package:
- routes/docs.py: Document CRUD, artifacts, labels, reviews, geo points
- routes/search.py: Full-text and hybrid search, ask endpoint
- routes/tasks.py: Task queue listing, flagging, completion
- routes/jobs.py: Job listing, summaries, task linkage
- routes/geo.py: GeoJSON, AOI, POI, KMZ import
- routes/admin.py: Projects, collections, metrics, logs, index rebuild
- routes/upload.py: File upload with hash dedupe
"""

from __future__ import annotations

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

from .config import Settings
from . import queue_db
from . import search_index
from . import job_store
from .metrics import metrics
from . import metrics_history

# Import routers
from .routes import verify_token, auth_context
from .routes.docs import router as docs_router
from .routes.search import router as search_router
from .routes.tasks import router as tasks_router
from .routes.jobs import router as jobs_router
from .routes.geo import router as geo_router
from .routes.admin import router as admin_router
from .routes.upload import router as upload_router
from .routes.webhooks import router as webhooks_router
from .routes.auth import router as auth_router
from .routes.ocr_viewer import router as ocr_viewer_router

# Initialize settings and databases
settings = Settings.load()
queue_db.init(settings.queue_db)
search_index.init(settings.index_path)
job_store.init(settings.queue_db)

# Configure logging
logger = logging.getLogger("pukaist.api")
if not logger.handlers:
    settings.log_dir.mkdir(parents=True, exist_ok=True)
    log_file = settings.log_dir / "api.log"
    handler = logging.FileHandler(log_file)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Create FastAPI app
app = FastAPI(
    title="Pukaist Engine (Local-First)",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
        return response
    finally:
        duration = (time.time() - start) * 1000
        path = request.url.path
        method = request.method
        key = f"{method}_{path}"
        metrics.inc("api_requests_total")
        metrics.inc(f"api_requests_total::{key}")
        metrics.observe("api_request_duration_sec", duration / 1000.0)
        metrics.observe(f"api_request_duration_sec::{key}", duration / 1000.0)
        try:
            metrics_history.maybe_append_snapshot(settings.log_dir, metrics.snapshot())
        except Exception:
            pass
        logger.info("%s %s -> %.1f ms", method, path, duration)


@app.middleware("http")
async def audit_requests(request: Request, call_next):
    response = await call_next(request)
    if settings.audit_log:
        logger.info(
            "AUDIT %s %s %s",
            request.method,
            request.url.path,
            response.status_code,
        )
    return response


# ─────────────────────────────────────────────────────────────────────────────
# Core endpoints (kept in main module)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
def ready() -> dict[str, str]:
    from fastapi import HTTPException
    try:
        settings.queue_db.touch(exist_ok=True)
        queue_db.init(settings.queue_db)
    except Exception:
        raise HTTPException(status_code=503, detail="queue db not reachable")
    return {"status": "ready"}


@app.get("/favicon.ico")
def favicon() -> JSONResponse:
    return JSONResponse(status_code=204, content=None)


# ─────────────────────────────────────────────────────────────────────────────
# Register routers
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(upload_router)
app.include_router(docs_router)
app.include_router(search_router)
app.include_router(tasks_router)
app.include_router(jobs_router)
app.include_router(geo_router)
app.include_router(admin_router)
app.include_router(webhooks_router)
app.include_router(auth_router)
app.include_router(ocr_viewer_router)


# ─────────────────────────────────────────────────────────────────────────────
# Static file serving (optional frontend)
# ─────────────────────────────────────────────────────────────────────────────

dist_dir = settings.workspace.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")
