"""
Job routes for Pukaist Engine API.

Handles job listing, status, summaries, and task linkage.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..config import Settings
from .. import queue_db
from .. import job_store
from ..models import JobsResponse, JobModel, TasksResponse, QueueStatusModel
from . import settings, verify_token

router = APIRouter(tags=["jobs"])


@router.get("/jobs", response_model=JobsResponse)
def list_jobs(limit: int = 50, tenant_id: str | None = Depends(verify_token)):
    rows = job_store.list_jobs(settings.queue_db, limit=limit, tenant_id=tenant_id)
    return {"jobs": [dict(r) for r in rows]}


@router.get("/jobs/{job_id}", response_model=JobModel)
def get_job(job_id: int, tenant_id: str | None = Depends(verify_token)):
    job = job_store.get_job(settings.queue_db, job_id, tenant_id=tenant_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    last_err = queue_db.last_error_for_job(settings.queue_db, job_id)
    job_dict = dict(job)
    if last_err and not job_dict.get("last_error"):
        job_dict["last_error"] = last_err
    return job_dict


@router.get("/jobs/{job_id}/tasks", response_model=TasksResponse)
def get_job_tasks(job_id: int, tenant_id: str | None = Depends(verify_token)):
    tasks = queue_db.tasks_for_job(settings.queue_db, job_id, tenant_id=tenant_id)
    items = []
    for t in tasks:
        d = dict(t)
        if d.get("last_error"):
            d["error_summary"] = d["last_error"]
        items.append(d)
    return {"tasks": items}


@router.get("/jobs/{job_id}/summary")
def job_summary(job_id: int, tenant_id: str | None = Depends(verify_token)):
    job = job_store.get_job(settings.queue_db, job_id, tenant_id=tenant_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    counts = queue_db.task_counts_for_job(settings.queue_db, job_id, tenant_id=tenant_id)
    return {"job": dict(job), "task_counts": counts}


@router.get("/status", response_model=QueueStatusModel)
def queue_status(tenant_id: str | None = Depends(verify_token)):
    counts = queue_db.task_counts(settings.queue_db, tenant_id=tenant_id)
    return {"queue": counts}
