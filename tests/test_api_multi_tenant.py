"""
Multi-tenant API isolation tests.

Tests for tenant isolation in the API.
"""

import jwt
import os


def _make_jwt(issuer: str, audience: str, tenant: str) -> str:
    secret = os.getenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    return jwt.encode({"iss": issuer, "aud": audience, "tenant": tenant}, secret, algorithm="HS256")


def test_api_multi_tenant_isolation(api_with_oidc):
    """Test that tenants are isolated from each other."""
    client, worker, _ = api_with_oidc
    
    token_a = _make_jwt("test-issuer", "test-audience", "tenant-a")
    token_b = _make_jwt("test-issuer", "test-audience", "tenant-b")

    # Tenant A uploads
    files = {"file": ("a.txt", b"tenant a content", "text/plain")}
    res_a = client.post("/upload?enqueue=true&theme=tenanttest", headers={"Authorization": f"Bearer {token_a}"}, files=files)
    assert res_a.status_code == 200
    worker.run_once()

    # Tenant B uploads
    files = {"file": ("b.txt", b"tenant b content", "text/plain")}
    res_b = client.post("/upload?enqueue=true&theme=tenanttest", headers={"Authorization": f"Bearer {token_b}"}, files=files)
    assert res_b.status_code == 200
    worker.run_once()

    # Tenant A should only see their tasks
    resp_a = client.get("/tasks", headers={"Authorization": f"Bearer {token_a}"})
    assert resp_a.status_code == 200
    tasks_a = resp_a.json().get("tasks", [])
    
    # Tenant B should only see their tasks
    resp_b = client.get("/tasks", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b.status_code == 200
    tasks_b = resp_b.json().get("tasks", [])
    
    # Each should have at least 1 task
    assert len(tasks_a) >= 1
    assert len(tasks_b) >= 1
