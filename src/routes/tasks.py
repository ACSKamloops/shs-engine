"""
Task routes for Pukaist Engine API.

Handles task queue listing, flagging, and completion.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Query

from ..config import Settings
from .. import queue_db
from .. import search_index
from ..models import TasksResponse
from . import settings, verify_token

router = APIRouter(tags=["tasks"])


@router.get("/tasks", response_model=TasksResponse)
def list_tasks(
    limit: int = 100,
    status: str | None = Query(default=None, description="Optional status filter"),
    theme: str | None = Query(default=None, description="Optional theme substring filter"),
    intent_contains: str | None = Query(default=None, description="Optional intent substring filter"),
    tenant_id: str | None = Depends(verify_token),
):
    rows = queue_db.list_tasks(settings.queue_db, limit=limit, tenant_id=tenant_id, status=status, theme=theme, intent_contains=intent_contains)
    tasks = []
    for row in rows:
        d = dict(row)
        if d.get("last_error"):
            d["error_summary"] = d["last_error"]
        if d.get("intent_json"):
            try:
                d["intent"] = json.loads(d["intent_json"])
            except Exception:
                d["intent"] = None
        tasks.append(d)
    return {"tasks": tasks}


@router.get("/tasks/flagged", response_model=TasksResponse)
def list_flagged_tasks(
    limit: int = 50,
    theme: str | None = Query(default=None, description="Optional theme substring filter"),
    intent_contains: str | None = Query(default=None, description="Optional intent substring filter"),
    tenant_id: str | None = Depends(verify_token),
):
    rows = queue_db.list_flagged(settings.queue_db, limit=limit, tenant_id=tenant_id, theme=theme, intent_contains=intent_contains)
    tasks = []
    for row in rows:
        d = dict(row)
        if d.get("last_error"):
            d["error_summary"] = d["last_error"]
        if d.get("intent_json"):
            try:
                d["intent"] = json.loads(d["intent_json"])
            except Exception:
                d["intent"] = None
        tasks.append(d)
    return {"tasks": tasks}


@router.post("/tasks/{task_id}/flag")
def flag_task(task_id: int, reason: str, tenant_id: str | None = Depends(verify_token)):
    task = queue_db.get_task(settings.queue_db, task_id, tenant_id=tenant_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    queue_db.flag(settings.queue_db, task_id, reason, tenant_id=tenant_id)
    return {"status": "flagged", "task_id": task_id, "reason": reason}


@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, tenant_id: str | None = Depends(verify_token)):
    task = queue_db.get_task(settings.queue_db, task_id, tenant_id=tenant_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    queue_db.complete(settings.queue_db, task_id, tenant_id=tenant_id)
    return {"status": "done", "task_id": task_id}


@router.get("/tasks/{task_id}")
def get_task_detail(task_id: int, tenant_id: str | None = Depends(verify_token)):
    task = queue_db.get_task(settings.queue_db, task_id, tenant_id=tenant_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(task)


@router.get("/tasks/{task_id}/doc")
def get_doc_for_task(task_id: int, tenant_id: str | None = Depends(verify_token)):
    task = queue_db.get_task(settings.queue_db, task_id, tenant_id=tenant_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    row = search_index.get_doc_by_task(settings.index_path, task_id, tenant_id=tenant_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found for task")
    return dict(row)
