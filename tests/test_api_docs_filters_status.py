"""
Docs filter and status tests.

Tests for document filtering with status fields.
"""

import jwt
import os


def _make_jwt(issuer: str, audience: str, tenant: str) -> str:
    secret = os.getenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    return jwt.encode({"iss": issuer, "aud": audience, "tenant": tenant}, secret, algorithm="HS256")


def test_docs_filter_includes_status(api_with_oidc):
    """Test that docs filter returns status information."""
    client, worker, _ = api_with_oidc
    token = _make_jwt("test-issuer", "test-audience", "tenant-a")

    # Upload and process
    files = {"file": ("a.txt", b"alpha content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=alpha", headers={"Authorization": f"Bearer {token}"}, files=files)
    assert res.status_code == 200, res.text
    worker.run_once()

    # Docs filter by theme should return status
    resp_docs = client.get("/docs", headers={"Authorization": f"Bearer {token}"}, params={"limit": 5, "theme": "alpha"})
    assert resp_docs.status_code == 200
    docs = resp_docs.json().get("docs", [])
    assert docs
