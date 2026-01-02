"""
Shared pytest fixtures for Pukaist Engine tests.

This conftest provides fixtures that properly initialize the API for testing
with modular routes.
"""

from __future__ import annotations

import importlib
import os

import pytest


try:
    import asyncio

    import uvloop

    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
except Exception:
    # uvloop is optional (e.g., Windows); tests still run on default asyncio loop.
    pass


@pytest.fixture(scope="function")
def fresh_api(tmp_path, monkeypatch):
    """
    Create a fresh API instance with isolated temp directories.
    
    This fixture sets all necessary env vars BEFORE importing any src modules,
    ensuring the Settings are loaded with test values.
    """
    # Set all environment variables first
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt,pdf,docx")
    monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "true")
    monkeypatch.setenv("PUKAIST_API_TOKEN", "test-token")
    monkeypatch.setenv("PUKAIST_MAX_UPLOAD_MB", "50")
    
    # Create required directories
    (tmp_path / "incoming").mkdir(exist_ok=True)
    (tmp_path / "staging").mkdir(exist_ok=True)
    (tmp_path / "logs").mkdir(exist_ok=True)
    (tmp_path / "workspace").mkdir(exist_ok=True)
    (tmp_path / "projects").mkdir(exist_ok=True)
    
    # Reset the routes settings cache
    from src import routes
    if hasattr(routes, '_settings_cache'):
        routes._settings_cache = None
    if hasattr(routes, '_llm_client'):
        routes._llm_client = None
    
    # Reload all modules in correct order
    from src import config, queue_db, search_index, job_store
    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(search_index)
    importlib.reload(job_store)
    
    # Reload routes
    importlib.reload(routes)
    from src.routes import docs, search, tasks, jobs, geo, admin, upload
    importlib.reload(docs)
    importlib.reload(search)
    importlib.reload(tasks)
    importlib.reload(jobs)
    importlib.reload(geo)
    importlib.reload(admin)
    importlib.reload(upload)
    
    # Reload worker and api
    from src import worker, api
    importlib.reload(worker)
    importlib.reload(api)
    
    from fastapi.testclient import TestClient

    client = TestClient(api.app)
    try:
        yield client, worker, api
    finally:
        try:
            client.close()
        except Exception:
            pass


@pytest.fixture(scope="function") 
def api_client(fresh_api):
    """Get just the test client."""
    client, _, _ = fresh_api
    return client


@pytest.fixture(scope="function")
def api_with_oidc(tmp_path, monkeypatch):
    """
    Create API with OIDC auth configured for JWT testing.
    """
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    monkeypatch.setenv("PUKAIST_ALLOWED_EXTS", "txt")
    monkeypatch.setenv("PUKAIST_LLM_OFFLINE", "true")
    monkeypatch.setenv("PUKAIST_OIDC_ISSUER", "test-issuer")
    monkeypatch.setenv("PUKAIST_OIDC_AUDIENCE", "test-audience")
    monkeypatch.setenv("PUKAIST_TENANT_CLAIM", "tenant")
    monkeypatch.setenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    monkeypatch.setenv("PUKAIST_API_TOKEN", "")  # Disable API token auth
    
    (tmp_path / "incoming").mkdir(exist_ok=True)
    (tmp_path / "staging").mkdir(exist_ok=True)
    (tmp_path / "logs").mkdir(exist_ok=True)
    (tmp_path / "workspace").mkdir(exist_ok=True)
    
    from src import routes
    if hasattr(routes, '_settings_cache'):
        routes._settings_cache = None
    
    from src import config, queue_db, search_index, job_store
    importlib.reload(config)
    importlib.reload(queue_db)
    importlib.reload(search_index)
    importlib.reload(job_store)
    
    importlib.reload(routes)
    from src.routes import docs, search, tasks, jobs, geo, admin, upload
    importlib.reload(docs)
    importlib.reload(search)
    importlib.reload(tasks)
    importlib.reload(jobs)
    importlib.reload(geo)
    importlib.reload(admin)
    importlib.reload(upload)
    
    from src import worker, api
    importlib.reload(worker)
    importlib.reload(api)
    
    from fastapi.testclient import TestClient

    client = TestClient(api.app)
    try:
        yield client, worker, api
    finally:
        try:
            client.close()
        except Exception:
            pass
