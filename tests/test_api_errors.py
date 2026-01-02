"""
API error handling tests.

Tests for structured error responses from the API endpoints.
"""

import io


def test_upload_extension_not_allowed(fresh_api):
    """Test that uploading disallowed extensions returns structured error."""
    client, _, _ = fresh_api
    resp = client.post(
        "/upload",
        params={"theme": "test"},
        files={"file": ("bad.exe", b"hi", "application/octet-stream")},
        headers={"X-API-Key": "test-token"},
    )
    assert resp.status_code == 415
    detail = resp.json().get("detail", {})
    assert detail.get("message") == "Extension not allowed"
    assert "allowed_exts" in detail


def test_upload_intent_invalid_json(fresh_api):
    """Test that invalid intent JSON returns structured error."""
    client, _, _ = fresh_api
    resp = client.post(
        "/upload",
        params={"intent": "not-json"},
        files={"file": ("foo.txt", b"hi", "text/plain")},
        headers={"X-API-Key": "test-token"},
    )
    assert resp.status_code == 400
    detail = resp.json().get("detail", {})
    assert detail.get("message") == "intent must be valid JSON"


def test_kmz_import_not_enabled_returns_structured_detail(fresh_api):
    """Test that KMZ import when disabled returns structured error."""
    client, _, _ = fresh_api
    resp = client.post(
        "/aoi/import_kmz",
        files={"file": ("demo.kmz", io.BytesIO(b"dummy kmz content"))},
        headers={"X-API-Key": "test-token"},
    )
    assert resp.status_code == 400
    detail = resp.json().get("detail", {})
    assert "KMZ/GeoJSON import not enabled" in detail.get("message", "")


def test_upload_invalid_callback_url(fresh_api):
    """Test that invalid callback URL returns structured error."""
    client, _, _ = fresh_api
    resp = client.post(
        "/upload",
        params={"callback_url": "ftp://example.com"},
        files={"file": ("foo.txt", b"hi", "text/plain")},
        headers={"X-API-Key": "test-token"},
    )
    assert resp.status_code == 400
    detail = resp.json().get("detail", {})
    assert "callback_url must start with http:// or https://" in detail.get("message", "")
