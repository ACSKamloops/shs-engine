from __future__ import annotations

from typing import Optional

from .llm_client import LLMClient


class LLMAdapter:
    def __init__(
        self,
        provider: str,
        model: str,
        offline: bool = True,
        input_max_chars: int = 16000,
        max_tokens: int = 512,
        temperature: float = 0.2,
        forensic_temperature: float | None = None,
    ) -> None:
        self.provider = provider
        self.model = model
        self.offline = offline
        self.forensic_temperature = forensic_temperature
        self.client = LLMClient(
            provider,
            model,
            input_max_chars=input_max_chars,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    def summarize(self, content: str) -> Optional[str]:
        if self.offline:
            return None
        return self.client.summarize(content)

    def extract_insights(self, content: str) -> Optional[dict]:
        if self.offline:
            return None
        return self.client.extract_insights(content)

    def analyze_forensic(self, content: str, metadata: Optional[dict] = None) -> Optional[dict]:
        if self.offline:
            return None
        return self.client.analyze_forensic(content, metadata=metadata, temperature=self.forensic_temperature)


def get_llm_adapter(
    provider: str,
    model: str,
    offline: bool,
    input_max_chars: int,
    max_tokens: int,
    temperature: float,
    forensic_temperature: float | None = None,
) -> LLMAdapter:
    return LLMAdapter(
        provider=provider,
        model=model,
        offline=offline,
        input_max_chars=input_max_chars,
        max_tokens=max_tokens,
        temperature=temperature,
        forensic_temperature=forensic_temperature,
    )
