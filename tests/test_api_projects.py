"""
Projects API tests.

Tests for project config CRUD endpoints.
"""


def test_create_and_list_projects(fresh_api):
    """Test creating and listing projects."""
    client, _, _ = fresh_api
    
    # Create a project with only valid ProjectConfig fields
    resp = client.post(
        "/projects",
        headers={"X-API-Key": "test-token"},
        json={"name": "test-project", "llm_enabled": False, "theme": "test"},
    )
    assert resp.status_code == 200
    
    # List projects
    resp = client.get("/projects", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200
    projects = resp.json().get("projects", [])
    assert any(p.get("name") == "test-project" for p in projects)
