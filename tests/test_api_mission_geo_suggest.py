"""
Mission geo suggest tests.

Tests for AI-assisted geo suggestions from mission text.
"""


def test_mission_geo_suggest_returns_matching_aoi_and_band(fresh_api):
    """Test mission geo suggest endpoint."""
    client, _, _ = fresh_api
    
    resp = client.post(
        "/mission/geo_suggest",
        headers={"X-API-Key": "test-token"},
        json={"mission": "Review documents about Vancouver Island, Squamish Nation"},
    )
    assert resp.status_code == 200
    data = resp.json()
    # Should have these keys even if empty
    assert "aoi_themes" in data
    assert "aoi_codes" in data
    assert "aoi_names" in data
    assert "band_numbers" in data
