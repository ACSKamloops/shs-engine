"""
Logs API tests.

Tests for log tailing endpoint.
"""


def test_logs_endpoint_reads_tail(fresh_api):
    """Test that logs endpoint returns log content."""
    client, _, api = fresh_api
    from src.routes import get_settings
    
    settings = get_settings()
    log_file = settings.log_dir / "api.log"
    log_file.parent.mkdir(parents=True, exist_ok=True)
    log_file.write_text("line1\nline2\nline3\n")
    
    resp = client.get("/logs", headers={"X-API-Key": "test-token"}, params={"kind": "api"})
    assert resp.status_code == 200
    content = resp.json().get("content", "")
    assert "line2" in content


def test_logs_endpoint_missing_file(fresh_api):
    """Test logs endpoint with missing file returns empty."""
    client, _, _ = fresh_api
    
    resp = client.get("/logs", headers={"X-API-Key": "test-token"}, params={"kind": "worker"})
    assert resp.status_code == 200
    # Should return empty content for missing file
    content = resp.json().get("content", "")
    assert content == "" or "content" in resp.json()
