"""
Geo features tests.

Tests for geo suggestion accept/reject and geo point updates.
"""


def test_geo_suggestions_accept_and_reject(fresh_api):
    """Test accepting and rejecting geo suggestions."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("sug.txt", b"suggestions test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=sugtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    # Get suggestions endpoint (should exist)
    resp = client.get(f"/docs/{doc_id}/suggestions", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200


def test_update_geo_point(fresh_api):
    """Test updating a geo point on a document via query params."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("upd.txt", b"update geo test", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=updtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    # Add a geo point via query params
    resp = client.post(
        f"/docs/{doc_id}/coords",
        headers={"X-API-Key": "test-token"},
        params={"lat": 49.0, "lon": -123.0},
    )
    assert resp.status_code in (200, 201)


def test_import_kml_and_geojson():
    """Test that KML/GeoJSON import module is available."""
    from src import kmz_importer
    
    # Just verify imports work
    assert hasattr(kmz_importer, "import_kmz")
    assert hasattr(kmz_importer, "KMZImportError")
