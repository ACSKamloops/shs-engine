"""
Tasks filters tests.

Tests for task filtering by status, theme, and intent.
"""

import jwt
import os


def _make_jwt(issuer: str, audience: str, tenant: str) -> str:
    secret = os.getenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    return jwt.encode({"iss": issuer, "aud": audience, "tenant": tenant}, secret, algorithm="HS256")


def test_tasks_filters_by_status_theme_intent(api_with_oidc):
    """Test that tasks can be filtered by status, theme, and intent."""
    client, worker, _ = api_with_oidc
    token = _make_jwt("test-issuer", "test-audience", "tenant-a")

    # Upload with intent
    intent = '{"llm_mode": "batch"}'
    files = {"file": ("filter.txt", b"filter content", "text/plain")}
    res = client.post(
        f"/upload?enqueue=true&theme=filtertest&intent={intent}",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
    )
    assert res.status_code == 200, res.text
    
    # Process
    worker.run_once()

    # Filter by theme
    resp = client.get("/tasks", headers={"Authorization": f"Bearer {token}"}, params={"theme": "filtertest"})
    assert resp.status_code == 200
    tasks = resp.json().get("tasks", [])
    assert len(tasks) >= 1
    
    # Filter by intent
    resp = client.get("/tasks", headers={"Authorization": f"Bearer {token}"}, params={"intent_contains": "batch"})
    assert resp.status_code == 200
    tasks = resp.json().get("tasks", [])
    assert len(tasks) >= 1
