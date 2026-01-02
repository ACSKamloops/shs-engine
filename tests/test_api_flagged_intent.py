"""
Flagged tasks intent tests.

Tests for intent metadata in flagged tasks.
"""

import jwt
import os


def _make_jwt(issuer: str, audience: str, tenant: str) -> str:
    secret = os.getenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    return jwt.encode({"iss": issuer, "aud": audience, "tenant": tenant}, secret, algorithm="HS256")


def test_flagged_tasks_include_intent(api_with_oidc):
    """Test that flagged tasks include intent metadata."""
    client, _, api = api_with_oidc
    from src import queue_db
    
    token = _make_jwt("test-issuer", "test-audience", "tenant-a")

    # Upload with intent
    intent = '{"llm_mode": "offline"}'
    files = {"file": ("flag.txt", b"flag content", "text/plain")}
    res = client.post(
        f"/upload?enqueue=true&theme=flagtest&intent={intent}",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
    )
    assert res.status_code == 200, res.text
    task_id = res.json().get("task_id")
    
    # Flag the task
    from src.routes import get_settings
    settings = get_settings()
    queue_db.flag(settings.queue_db, task_id, "test flag reason", tenant_id="tenant-a")

    # Check flagged tasks include intent
    resp = client.get("/tasks/flagged", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    tasks = resp.json().get("tasks", [])
    assert any(t.get("intent", {}).get("llm_mode") == "offline" for t in tasks)
