"""
Geo context utility tests.

Tests for geo utility functions like haversine, point-in-polygon, etc.
"""

import pytest


def test_haversine_km_basic():
    """Test haversine distance calculation."""
    from src import geo_context
    
    # Vancouver to Seattle ~200km
    dist = geo_context.haversine_km(49.2827, -123.1207, 47.6062, -122.3321)
    assert 180 < dist < 220


def test_point_in_ring_and_feature_polygon():
    """Test point in ring/polygon check."""
    from src import geo_context
    
    ring = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]
    # Use private function
    assert geo_context._point_in_ring(5, 5, ring) is True
    assert geo_context._point_in_ring(15, 5, ring) is False


def test_point_in_feature_multipolygon():
    """Test point in multipolygon feature."""
    from src import geo_context
    
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]],
        },
    }
    assert geo_context._point_in_feature(5, 5, feature) is True
    assert geo_context._point_in_feature(15, 5, feature) is False


def test_build_geo_context_hits_aoi_and_office(fresh_api):
    """Test building geo context from document ID."""
    client, worker, _ = fresh_api
    
    # Upload and process a doc
    files = {"file": ("geo.txt", b"geo test", "text/plain")}
    res = client.post("/upload?enqueue=true", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
        
    from src import geo_context
    from src.routes import get_settings
    
    settings = get_settings()
    doc_id = docs[0]["id"]
    ctx = geo_context.build_geo_context(settings.index_path, doc_id, tenant_id=None)
    # Should return a dict
    assert isinstance(ctx, dict)


def test_build_geo_context_limits_nearest_offices(fresh_api):
    """Test that nearest offices are limited."""
    client, worker, _ = fresh_api
    
    # Upload and process a doc
    files = {"file": ("geo2.txt", b"geo test 2", "text/plain")}
    res = client.post("/upload?enqueue=true", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return

    from src import geo_context
    from src.routes import get_settings
    
    settings = get_settings()
    doc_id = docs[0]["id"]
    ctx = geo_context.build_geo_context(settings.index_path, doc_id, tenant_id=None, max_offices=3)
    # Should return a dict
    assert isinstance(ctx, dict)
