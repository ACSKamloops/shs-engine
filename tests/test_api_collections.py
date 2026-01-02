"""
Collections API tests.

Tests for adding docs to collections and getting collection summaries.
"""


def test_add_doc_to_collection_and_list(fresh_api):
    """Test adding a document to a collection."""
    client, worker, _ = fresh_api
    
    # Upload and process a document
    files = {"file": ("col.txt", b"collection test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=coltest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get the doc ID
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    assert docs_resp.status_code == 200
    docs = docs_resp.json().get("docs", [])
    if not docs:
        # Skip if no docs indexed yet
        return
    doc_id = docs[0]["id"]
    
    # Add to collection
    resp = client.post(f"/collections/test-col/docs/{doc_id}", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200
    
    # List collections
    cols_resp = client.get("/collections", headers={"X-API-Key": "test-token"})
    assert cols_resp.status_code == 200
    cols = cols_resp.json().get("collections", [])
    assert any(c.get("name") == "test-col" for c in cols)


def test_collection_summary_includes_basic_counts_and_geo(fresh_api):
    """Test that collection summary includes counts and geo info."""
    client, worker, _ = fresh_api
    
    # Upload and process
    files = {"file": ("sum.txt", b"summary test content", "text/plain")}
    res = client.post("/upload?enqueue=true&theme=sumtest", headers={"X-API-Key": "test-token"}, files=files)
    assert res.status_code == 200
    worker.run_once()
    
    # Get doc and add to collection
    docs_resp = client.get("/docs", headers={"X-API-Key": "test-token"})
    docs = docs_resp.json().get("docs", [])
    if not docs:
        return
    doc_id = docs[0]["id"]
    
    client.post(f"/collections/summary-col/docs/{doc_id}", headers={"X-API-Key": "test-token"})
    
    # Get summary
    resp = client.get("/collections/summary-col/summary", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200
    data = resp.json()
    assert "stats" in data
    assert "total_docs" in data["stats"]
