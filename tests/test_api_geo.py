"""
Geo API tests.

Tests for geo suggestions, coords update, and KMZ import.
"""


def test_geo_suggestions_api(fresh_api):
    """Test geo suggestions endpoint."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("geo.txt", b"geo test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=geotest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    # Get suggestions
    resp = client.get(f"/docs/{doc_id}/suggestions", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200


def test_patch_coords_api(fresh_api):
    """Test adding geo coordinates via query params."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("coords.txt", b"coords test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=coordtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    # Add coords via query params (not JSON body)
    resp = client.post(
        f"/docs/{doc_id}/coords",
        headers={"X-API-Key": "test-token"},
        params={"lat": 49.2827, "lon": -123.1207},
    )
    assert resp.status_code in (200, 201)


def test_kmz_import_api_geojson(fresh_api):
    """Test KMZ/GeoJSON import when disabled."""
    client, _, _ = fresh_api
    import io
    
    # Try import (should fail since KMZ not enabled by default)
    resp = client.post(
        "/aoi/import_kmz",
        files={"file": ("demo.geojson", io.BytesIO(b'{}'))},
        headers={"X-API-Key": "test-token"},
    )
    # Expect 400 since KMZ is not enabled
    assert resp.status_code == 400
    assert "not enabled" in resp.json().get("detail", {}).get("message", "")


def test_kmz_import_api_disabled(fresh_api):
    """Test that KMZ import returns structured error when disabled."""
    client, _, _ = fresh_api
    import io
    
    resp = client.post(
        "/aoi/import_kmz",
        files={"file": ("demo.kmz", io.BytesIO(b"dummy"))},
        headers={"X-API-Key": "test-token"},
    )
    assert resp.status_code == 400
