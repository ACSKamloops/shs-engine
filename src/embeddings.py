from __future__ import annotations

import os
from typing import List, Optional
from urllib.parse import urlparse

import requests


class EmbeddingsClient:
    def __init__(self, provider: str, model: str, api_key: Optional[str] = None, base_url: Optional[str] = None, timeout: float = 120.0) -> None:
        self.provider = provider
        self.model = model
        self.api_key = api_key or os.getenv("PUKAIST_EMBEDDINGS_API_KEY") or os.getenv("LLM_API_KEY")
        self.base_url = base_url or os.getenv("PUKAIST_EMBEDDINGS_BASE_URL") or os.getenv("PUKAIST_LLM_BASE_URL")
        self.timeout = timeout

    def _allow_extended_fields(self) -> bool:
        if os.getenv("PUKAIST_EMBEDDINGS_ALLOW_PROMPT", "false").lower() == "true":
            return True
        if not self.base_url:
            return False
        host = urlparse(self.base_url).hostname
        return host in {"localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"}

    def embed(
        self,
        texts: List[str],
        input_type: Optional[str] = None,
        prompt: Optional[str] = None,
    ) -> Optional[List[List[float]]]:
        if not self.base_url:
            return None
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            payload = {
                "model": self.model,
                "input": texts,
            }
            if self._allow_extended_fields():
                if input_type:
                    payload["input_type"] = input_type
                if prompt is not None:
                    payload["prompt"] = prompt
            resp = requests.post(
                f"{self.base_url}/v1/embeddings",
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            embeddings = [item["embedding"] for item in data.get("data", []) if "embedding" in item]
            return embeddings
        except Exception:
            return None
