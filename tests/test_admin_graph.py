"""
Admin knowledge graph endpoint tests.

Ensures /admin/graph returns a valid graph and supports basic filters.
"""

from __future__ import annotations

import json


def test_admin_graph_basic_and_filters(monkeypatch, fresh_api, tmp_path):
    client, _, api = fresh_api
    monkeypatch.setenv("PUKAIST_AUTH_DISABLED", "true")

    # Insert two docs directly into the index to make graph deterministic.
    from src import search_index

    search_index.add_document(
        api.settings.index_path,
        task_id=None,
        file_path=tmp_path / "incoming" / "alpha.txt",
        stable_id="DOC-000001",
        provenance=None,
        sha256=None,
        theme="alpha",
        title="Alpha Doc",
        summary=None,
        doc_type=None,
        inferred_date=None,
        entities_json=json.dumps({"person": ["Alice"]}),
        content="alpha content mentioning Alice",
        tenant_id=None,
    )

    search_index.add_document(
        api.settings.index_path,
        task_id=None,
        file_path=tmp_path / "incoming" / "beta.txt",
        stable_id="DOC-000002",
        provenance=None,
        sha256=None,
        theme="beta",
        title="Beta Doc",
        summary=None,
        doc_type=None,
        inferred_date=None,
        entities_json=None,
        content="beta content",
        tenant_id=None,
    )

    resp = client.get("/admin/graph", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200, resp.text
    graph = resp.json()
    assert "nodes" in graph and "edges" in graph
    assert any(n.get("type") == "doc" for n in graph["nodes"])
    assert any(n.get("type") == "theme" for n in graph["nodes"])
    assert any(n.get("type") == "entity" for n in graph["nodes"])

    # Theme filter should exclude beta docs.
    resp_alpha = client.get(
        "/admin/graph",
        params={"theme": "alpha"},
        headers={"X-API-Key": "test-token"},
    )
    assert resp_alpha.status_code == 200, resp_alpha.text
    graph_alpha = resp_alpha.json()
    labels = [n.get("label") for n in graph_alpha["nodes"] if n.get("type") == "doc"]
    assert "DOC-000001" in labels
    assert "DOC-000002" not in labels

    # include_entities=false should remove entity nodes.
    resp_no_ent = client.get(
        "/admin/graph",
        params={"include_entities": "false"},
        headers={"X-API-Key": "test-token"},
    )
    assert resp_no_ent.status_code == 200, resp_no_ent.text
    graph_no_ent = resp_no_ent.json()
    assert not any(n.get("type") == "entity" for n in graph_no_ent["nodes"])

