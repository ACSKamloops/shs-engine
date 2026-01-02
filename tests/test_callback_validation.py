from __future__ import annotations

import pytest
from fastapi import HTTPException

from src.callbacks import validate_callback_url
from src.config import Settings


def _settings_for_test(tmp_path, monkeypatch, **env):
    monkeypatch.setenv("PUKAIST_WORKSPACE", str(tmp_path / "workspace"))
    monkeypatch.setenv("PUKAIST_INCOMING_DIR", str(tmp_path / "incoming"))
    monkeypatch.setenv("PUKAIST_STAGING_DIR", str(tmp_path / "staging"))
    monkeypatch.setenv("PUKAIST_INDEX_PATH", str(tmp_path / "index.db"))
    monkeypatch.setenv("PUKAIST_QUEUE_DB", str(tmp_path / "queue.db"))
    monkeypatch.setenv("PUKAIST_LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("PUKAIST_REFINED_DIR", str(tmp_path / "refined"))
    monkeypatch.setenv("PUKAIST_PROJECTS_DIR", str(tmp_path / "projects"))
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    return Settings.load()


def test_callback_url_blocks_private_ip_by_default(tmp_path, monkeypatch):
    settings = _settings_for_test(
        tmp_path,
        monkeypatch,
        PUKAIST_CALLBACK_ALLOWLIST="",
        PUKAIST_CALLBACK_ALLOW_PRIVATE="false",
        PUKAIST_CALLBACK_ALLOW_ALL="false",
    )
    with pytest.raises(HTTPException):
        validate_callback_url("http://127.0.0.1:8000/callback", settings)


def test_callback_url_allows_public_ip(tmp_path, monkeypatch):
    settings = _settings_for_test(
        tmp_path,
        monkeypatch,
        PUKAIST_CALLBACK_ALLOWLIST="",
        PUKAIST_CALLBACK_ALLOW_PRIVATE="false",
        PUKAIST_CALLBACK_ALLOW_ALL="false",
    )
    validate_callback_url("http://1.1.1.1:8000/callback", settings)


def test_callback_url_allowlist_allows_localhost(tmp_path, monkeypatch):
    settings = _settings_for_test(
        tmp_path,
        monkeypatch,
        PUKAIST_CALLBACK_ALLOWLIST="localhost",
        PUKAIST_CALLBACK_ALLOW_PRIVATE="false",
        PUKAIST_CALLBACK_ALLOW_ALL="false",
    )
    validate_callback_url("http://localhost:9000/callback", settings)
