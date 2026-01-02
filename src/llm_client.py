from __future__ import annotations

import json
import os
from typing import Optional, Dict, Any

import requests


LLM_HTTP_TIMEOUT = float(os.getenv("PUKAIST_LLM_HTTP_TIMEOUT_SEC", "8.0"))


class LLMClient:
    def __init__(
        self,
        provider: str,
        model: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        input_max_chars: int = 16000,
        max_tokens: int = 512,
        temperature: float = 0.2,
    ) -> None:
        self.provider = provider
        self.model = model
        self.api_key = api_key or os.getenv("PUKAIST_LLM_API_KEY") or os.getenv("LLM_API_KEY")
        self.base_url = base_url or os.getenv("PUKAIST_LLM_BASE_URL") or os.getenv("LLM_BASE_URL")
        self.input_max_chars = input_max_chars
        self.max_tokens = max_tokens
        self.temperature = temperature

    def summarize(self, content: str) -> Optional[str]:
        # If no API key or base URL, fall back to heuristic summary.
        if not self.api_key or not self.base_url:
            snippet = content.strip().replace("\n", " ")
            return snippet[:400] + ("…" if len(snippet) > 400 else "")
        try:
            # Trim input to keep within model limits; configurable via env.
            user_content = content[: self.input_max_chars]
            resp = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "Summarize the document in 3 sentences, factual and concise."},
                        {"role": "user", "content": user_content},
                    ],
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                },
                timeout=LLM_HTTP_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception:
            snippet = content.strip().replace("\n", " ")
            return snippet[:400] + ("…" if len(snippet) > 400 else "")

    def analyze_forensic(self, content: str, metadata: Optional[dict] = None, temperature: Optional[float] = None) -> Optional[Dict[str, Any]]:
        """
        Forensic extraction inspired by the Lexiscout "Clerk Standard".

        Returns a dict with keys (best-effort):
          record_type, breach_category, reliability, key_quote, privileged, entities{people,locations,organizations}
        """
        if not self.api_key or not self.base_url:
            return None
        user_content = content[: self.input_max_chars]
        # Keep prompt concise to avoid overwhelming users; outputs are structured-only.
        system_prompt = (
            "ROLE: Forensic clerk. Extract strictly factual metadata as JSON. "
            "Forbidden words in summaries/opinions: suggests, implies, likely, appears, seems, probably. "
            "Normalize entities to consistent names when possible (people, locations, organizations). "
            "Classify breach_category from: Land_Reduction_Trespass, Governance_Sovereignty, Fiduciary_Duty_Negligence, "
            "Water_Rights_Fishing, Coercion_Duress, None. "
            "Reliability: Verified, Unverified, Reconstructed. "
            "privileged: true/false. "
            "key_quote: verbatim supporting quote if present."
        )
        try:
            resp = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": (
                                f"FILE: {metadata.get('provenance') if metadata else ''}\n"
                                f"DATE: {metadata.get('inferred_date') if metadata else ''}\n\n"
                                "Extract JSON with keys: "
                                "record_type, breach_category, reliability, privileged (boolean), key_quote, "
                                "entities (object with people, locations, organizations arrays).\n"
                                "Document:\n"
                                f"{user_content}"
                            ),
                        },
                    ],
                    "temperature": temperature if temperature is not None else self.temperature,
                    "max_tokens": self.max_tokens,
                    "response_format": {"type": "json_object"},
                },
                timeout=LLM_HTTP_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
            raw = data["choices"][0]["message"]["content"].strip()
            # Handle leading ```json fences if any.
            if raw.startswith("```"):
                raw = raw.strip("`")
                raw = raw.replace("json", "", 1).strip()
            return json.loads(raw)
        except Exception:
            return None

    def extract_insights(self, content: str) -> Optional[Dict[str, Any]]:
        """
        Optional structured extraction helper.

        Asks the model for a JSON object with keys:
        - topics: array of short strings
        - entities: array of short strings
        - risks: array of short strings

        Returns a dict on success or None on failure; callers should treat this
        as an enrichment on top of heuristic insights.
        """
        if not self.api_key or not self.base_url:
            return None
        try:
            user_content = content[: self.input_max_chars]
            resp = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You extract structured insights from documents. "
                                "Respond with a single JSON object with keys: "
                                "topics (array of short strings), "
                                "entities (array of short strings), "
                                "risks (array of short strings). "
                                "Do not include any commentary outside the JSON."
                            ),
                        },
                        {"role": "user", "content": user_content},
                    ],
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                },
                timeout=LLM_HTTP_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
            raw = data["choices"][0]["message"]["content"].strip()
            # Attempt to parse the returned JSON.
            return json.loads(raw)
        except Exception:
            return None
