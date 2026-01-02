from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    job_id: Optional[int] = None
    task_id: Optional[int] = None
    stored_as: str
    theme: Optional[str] = None
    enqueued: bool
    deduped: bool = False
    sha256: Optional[str] = None
    manifest_id: Optional[int] = None
    note: Optional[str] = None


class TaskModel(BaseModel):
    id: int
    status: str
    theme: Optional[str] = None
    job_id: Optional[int] = None
    file_path: Optional[str] = None
    attempts: Optional[int] = 0
    last_error: Optional[str] = None
    error_summary: Optional[str] = None
    leased_at: Optional[float] = None
    created_at: Optional[float] = None
    updated_at: Optional[float] = None
    intent: Optional[Dict[str, Any]] = None


class JobModel(BaseModel):
    id: int
    status: str
    last_error: Optional[str] = None
    error_summary: Optional[str] = None
    callback_url: Optional[str] = None
    callback_attempts: Optional[int] = 0
    last_callback_status: Optional[str] = None
    created_at: Optional[float] = None
    updated_at: Optional[float] = None


class SearchResultModel(BaseModel):
    id: int
    task_id: Optional[int]
    file_path: str
    stable_id: Optional[str] = None
    provenance: Optional[str] = None
    sha256: Optional[str] = None
    theme: Optional[str] = None
    title: Optional[str] = None
    doc_type: Optional[str] = None
    inferred_date: Optional[str] = None
    breach_category: Optional[str] = None
    reliability: Optional[str] = None
    key_quote: Optional[str] = None
    privileged: Optional[bool] = None
    entities_json: Optional[str] = None
    snippet: Optional[str] = None
    status: Optional[str] = None


class DocsResponse(BaseModel):
    docs: List[Dict[str, Any]]


class TasksResponse(BaseModel):
    tasks: List[TaskModel]


class JobsResponse(BaseModel):
    jobs: List[JobModel]


class SearchResponse(BaseModel):
    results: List[SearchResultModel]


class QueueStatusModel(BaseModel):
    queue: Dict[str, int]
