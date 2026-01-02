"""
Placeholder for OTEL hooks. Add real exporter/config here if needed.
"""
from __future__ import annotations

import time
from typing import Callable, Any


def instrument_function(fn: Callable[..., Any]) -> Callable[..., Any]:
    """
    Wrap a function to measure duration and return a tuple (result, duration_ms).
    Replace with real OTEL spans when ready.
    """
    def wrapper(*args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        duration_ms = (time.time() - start) * 1000
        return result, duration_ms

    return wrapper
