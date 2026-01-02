"""
Admin audit history endpoint tests.
"""

from __future__ import annotations


def test_admin_audit_events_returns_entries(monkeypatch, fresh_api):
    client, _, api = fresh_api
    monkeypatch.setenv("PUKAIST_AUTH_DISABLED", "true")

    from src import audit_history

    audit_history.append_event(api.settings.log_dir, {"action": "unit_test", "foo": "bar"})

    resp = client.get("/admin/audit/events", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "events" in data
    assert any(e.get("action") == "unit_test" for e in data["events"])

