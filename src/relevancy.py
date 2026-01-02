from __future__ import annotations

"""
Optional relevancy scoring helper.

Scoring paths:
- Heuristic (default/offline): keyword overlap against configured targets.
- LLM (optional): uses the existing OpenAI-compatible client via llm_adapter to
  return a JSON blob {score, rationale, tags}.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any

from .llm_adapter import get_llm_adapter
from .config import Settings, THEME_KEYWORDS


@dataclass
class RelevancyResult:
    score: int
    rationale: str
    tags: List[str]
    theme_hits: Optional[Dict[str, List[str]]] = None

    def to_dict(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {"score": self.score, "rationale": self.rationale, "tags": self.tags}
        if self.theme_hits:
            data["theme_hits"] = self.theme_hits
        return data


class RelevancyScorer:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.targets = [t.lower() for t in settings.relevancy_targets or []]
        self.enabled = settings.relevancy_enabled
        self.llm_model = settings.relevancy_model or settings.llm_model
        self.use_llm = self.enabled and not settings.llm_offline and bool(self.llm_model)
        self.llm = None
        if self.use_llm:
            self.llm = get_llm_adapter(
                settings.llm_provider,
                self.llm_model,
                settings.llm_offline,
                settings.llm_input_max_chars,
                settings.llm_max_tokens,
                settings.llm_temperature,
            )

    def _heuristic(self, text: str) -> RelevancyResult:
        if not self.targets:
            return RelevancyResult(score=50, rationale="No targets configured; neutral score.", tags=[], theme_hits=None)
        lowered = text.lower()
        hits = []
        for t in self.targets:
            if t in lowered:
                hits.append(t)
        coverage = len(hits) / max(len(self.targets), 1)
        score = min(100, max(10, int(30 + coverage * 70)))
        rationale = f"Matched {len(hits)}/{len(self.targets)} target terms."
        theme_hits: Dict[str, List[str]] = {}
        pc = getattr(self.settings, "project_config", None)
        enabled_themes = getattr(pc, "enabled_themes", None) if pc else None
        theme_ids = enabled_themes or list(THEME_KEYWORDS.keys())
        for theme_id in theme_ids:
            terms = THEME_KEYWORDS.get(theme_id, [])
            matched = [term for term in terms if term.lower() in hits]
            if matched:
                theme_hits[theme_id] = matched
        return RelevancyResult(score=score, rationale=rationale, tags=hits, theme_hits=theme_hits or None)

    def _llm_score(self, text: str, theme: Optional[str]) -> Optional[RelevancyResult]:
        if not self.llm:
            return None
        # Keep prompt short to control cost.
        prompt = (
            "You are a relevancy grader. Given OCR text and desired targets/themes, "
            "return JSON with fields: score (0-100), rationale (one sentence), tags (array of key terms). "
            "Be concise."
        )
        targets_desc = ", ".join(self.targets) if self.targets else "unspecified"
        user = (
            f"Targets/themes: {targets_desc}. Theme: {theme or 'none provided'}.\n"
            f"Text:\n{text[: self.settings.llm_input_max_chars]}"
        )
        try:
            resp = self.llm.chat(prompt, user, max_tokens=256, temperature=0.1)
            if isinstance(resp, dict):
                score = int(resp.get("score", 50))
                rationale = str(resp.get("rationale", ""))
                tags = resp.get("tags") or []
                if not isinstance(tags, list):
                    tags = [str(tags)]
                return RelevancyResult(score=score, rationale=rationale, tags=[str(t) for t in tags])
            # If resp is string, fall back to heuristic.
        except Exception:
            return None
        return None

    def score(self, text: str, theme: Optional[str]) -> Optional[RelevancyResult]:
        if not self.enabled:
            return None
        if self.use_llm:
            llm_res = self._llm_score(text, theme)
            if llm_res:
                return llm_res
        return self._heuristic(text)
