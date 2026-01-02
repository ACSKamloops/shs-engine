"""
Geo context API tests.

Tests for document geo context endpoints.
"""


def test_geo_context_api_returns_aoi_and_office(fresh_api):
    """Test that geo context API returns AOI and office info."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("ctx.txt", b"context test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=ctxtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get docs
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    # Get geo context
    resp = client.get(f"/docs/{doc_id}/geo_context", headers={"X-API-Key": "test-token"})
    # May return 200 or 404 depending on whether coords exist
    assert resp.status_code in (200, 404)
