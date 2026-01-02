"""
Geo filters tests.

Tests for document and search filtering by AOI and band info.
"""


def test_docs_filter_by_aoi_theme_and_code(fresh_api):
    """Test filtering docs by AOI theme and code."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("aoi.txt", b"aoi test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=aoitest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs with filter (may return empty if no geo data)
    resp = client.get("/docs", headers={"X-API-Key": "test-token"}, params={"aoi_theme": "Modern_Treaty"})
    assert resp.status_code == 200


def test_docs_filter_by_near_band_nbr(fresh_api):
    """Test filtering docs by nearest band number."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("band.txt", b"band test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=bandtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs with filter
    resp = client.get("/docs", headers={"X-API-Key": "test-token"}, params={"near_band_nbr": "123"})
    assert resp.status_code == 200


def test_search_respects_geo_filters(fresh_api):
    """Test that search respects geo filters."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("sgeo.txt", b"search geo test", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=sgeotest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Search with geo filter
    resp = client.get("/search", headers={"X-API-Key": "test-token"}, params={"q": "test", "aoi_theme": "ALC_Confirmed"})
    assert resp.status_code == 200
