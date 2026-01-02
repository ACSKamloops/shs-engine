"""
Auto-run active window helper tests.
"""

from __future__ import annotations

import time

from src import codex_autorun


def test_within_active_window_basic_and_wrap():
    now_10 = time.struct_time((2025, 1, 1, 10, 0, 0, 0, 0, -1))
    now_23 = time.struct_time((2025, 1, 1, 23, 0, 0, 0, 0, -1))
    now_2 = time.struct_time((2025, 1, 2, 2, 0, 0, 0, 0, -1))

    assert codex_autorun._within_active_window(9, 17, now_10)
    assert not codex_autorun._within_active_window(11, 17, now_10)

    assert codex_autorun._within_active_window(22, 6, now_23)
    assert codex_autorun._within_active_window(22, 6, now_2)
    assert not codex_autorun._within_active_window(22, 6, now_10)

    assert codex_autorun._within_active_window(0, 0, now_10)

