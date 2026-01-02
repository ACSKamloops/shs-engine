"""
Admin Codex skills endpoint tests.

Ensures /admin/codex/skills lists repo-scoped skills from `.codex/skills`.
"""

from __future__ import annotations


def test_admin_codex_skills_lists_repo_skills(monkeypatch, fresh_api, tmp_path):
    client, _, api = fresh_api
    monkeypatch.setenv("PUKAIST_AUTH_DISABLED", "true")

    # In tests, the repo "base_dir" is settings.workspace.parent (tmp_path).
    # Create a fake skill there to ensure the endpoint returns it.
    base_dir = api.settings.workspace.parent
    skill_path = base_dir / ".codex" / "skills" / "demo-skill" / "SKILL.md"
    skill_path.parent.mkdir(parents=True, exist_ok=True)
    skill_path.write_text(
        "---\nname: demo-skill\ndescription: Demo skill for tests\n---\n\n# Demo\n",
        encoding="utf-8",
    )

    resp = client.get("/admin/codex/skills", headers={"X-API-Key": "test-token"})
    assert resp.status_code == 200, resp.text
    payload = resp.json()
    assert isinstance(payload.get("skills"), list)
    assert any(s.get("name") == "demo-skill" for s in payload["skills"])

