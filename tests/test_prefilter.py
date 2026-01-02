from __future__ import annotations

import importlib
from pathlib import Path

import pytest


@pytest.fixture()
def isolated_env_prefilter(tmp_path, monkeypatch):
    monkeypatch.setenv("PUKAIST_PREFILTER_MIN_CHARS", "10")
    monkeypatch.setenv("PUKAIST_PREFILTER_KEYWORDS", "alpha,beta")
    from src import config, prefilter  # type: ignore

    importlib.reload(config)
    importlib.reload(prefilter)
    return prefilter, config.Settings.load()


def test_prefilter_respects_min_chars(isolated_env_prefilter):
    prefilter, settings = isolated_env_prefilter
    short_text = "short"
    assert prefilter.should_use_llm(short_text, {}, settings) is False


def test_prefilter_keyword_match(isolated_env_prefilter):
    prefilter, settings = isolated_env_prefilter
    text = "This contains Alpha keyword."
    assert prefilter.should_use_llm(text, {}, settings) is True


def test_prefilter_keyword_miss(isolated_env_prefilter):
    prefilter, settings = isolated_env_prefilter
    text = "This contains nothing interesting."
    assert prefilter.should_use_llm(text, {}, settings) is False

