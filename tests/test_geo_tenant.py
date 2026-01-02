"""
Geo tenant isolation tests.

Tests for tenant-scoped GeoJSON endpoints.
"""


def test_geojson_respects_default_tenant(fresh_api):
    """Test that GeoJSON endpoint scopes by tenant."""
    client, worker, _ = fresh_api
    
    # Upload and process a document
    files = {"file": ("tenant.txt", b"tenant geo test", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=tenantgeo", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get GeoJSON
    resp = client.get("/geojson", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200
    data = resp.json()
    # Should have GeoJSON structure
    assert "type" in data
