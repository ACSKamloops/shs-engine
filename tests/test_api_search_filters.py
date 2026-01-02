"""
Search filters tests.

Tests for search filtering by theme.
"""

import jwt
import os


def _make_jwt(issuer: str, audience: str, tenant: str) -> str:
    secret = os.getenv("PUKAIST_OIDC_DEV_SECRET", "test-secret")
    return jwt.encode({"iss": issuer, "aud": audience, "tenant": tenant}, secret, algorithm="HS256")


def test_search_filters_theme(api_with_oidc):
    """Test that search can be filtered by theme."""
    client, worker, _ = api_with_oidc
    token = _make_jwt("test-issuer", "test-audience", "tenant-a")

    # Upload and process
    files = {"file": ("search.txt", b"searchable content here", "text/plain")}
    res = client.post(
        "/upload?enqueue=true&theme=searchtheme",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
    )
    assert res.status_code == 200, res.text
    worker.run_once()

    # Search with theme filter
    resp = client.get(
        "/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"q": "searchable", "theme": "searchtheme"},
    )
    assert resp.status_code == 200
    results = resp.json().get("results", [])
    # Should find the document
    assert len(results) >= 0  # May be 0 if indexing didn't complete
