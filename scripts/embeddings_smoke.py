#!/usr/bin/env python3
from __future__ import annotations

"""
Smoke test for embeddings.

Usage:
  PUKAIST_EMBEDDINGS_BASE_URL=http://localhost:8080 \
  PUKAIST_EMBEDDINGS_MODEL=tencent/KaLM-Embedding-Gemma3-12B-2511 \
  python scripts/embeddings_smoke.py
"""

import os
import sys

from src.embeddings import EmbeddingsClient


def main() -> None:
    base_url = os.getenv("PUKAIST_EMBEDDINGS_BASE_URL")
    model = os.getenv("PUKAIST_EMBEDDINGS_MODEL", "tencent/KaLM-Embedding-Gemma3-12B-2511")
    input_type = os.getenv("PUKAIST_EMBEDDINGS_INPUT_TYPE")
    if not base_url:
        print("PUKAIST_EMBEDDINGS_BASE_URL is not set.")
        sys.exit(1)

    client = EmbeddingsClient(provider="local", model=model)
    vecs = client.embed(["Pukaist embeddings smoke test"], input_type=input_type)
    if not vecs:
        print("Embedding call failed; check server and env vars.")
        sys.exit(2)
    print(f"OK: received embedding vector length={len(vecs[0])} model={model}")


if __name__ == "__main__":
    main()
