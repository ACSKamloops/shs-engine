from __future__ import annotations

import threading
from collections import Counter
from typing import Dict


class Metrics:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.counters: Counter = Counter()
        self.timings: Counter = Counter()

    def inc(self, name: str, value: int = 1) -> None:
        with self._lock:
            self.counters[name] += value

    def observe(self, name: str, value: float) -> None:
        bucket = f"{name}_total_ms"
        with self._lock:
            self.timings[bucket] += int(value * 1000)
            self.counters[f"{name}_count"] += 1

    def snapshot(self) -> Dict[str, int]:
        with self._lock:
            data = dict(self.counters)
            data.update(self.timings)
            return data


metrics = Metrics()
