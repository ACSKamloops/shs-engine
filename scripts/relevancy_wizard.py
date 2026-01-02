#!/usr/bin/env python
"""
Interactive helper to capture relevancy targets and optional AI-suggested keywords.

Usage:
  source .venv/bin/activate
  PYTHONPATH=. python scripts/relevancy_wizard.py --name coastal-monitoring

It writes projects/<name>-relevancy.json with targets and notes.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from src.config import Settings
from src.llm_adapter import get_llm_adapter


def ai_suggest(base_targets: list[str], settings: Settings) -> list[str]:
    if settings.llm_offline:
        print("LLM is offline; skipping AI suggestions.")
        return []
    llm = get_llm_adapter(
        settings.llm_provider,
        settings.relevancy_model or settings.llm_model,
        settings.llm_offline,
        settings.llm_input_max_chars,
        settings.llm_max_tokens,
        settings.llm_temperature,
    )
    prompt = (
        "You are assisting with onboarding relevancy filters. Given seed topics, suggest up to 10 related keywords/phrases "
        "that help find evidence and text snippets. Respond as a JSON array of strings only."
    )
    user = "Seed targets: " + ", ".join(base_targets)
    try:
        resp = llm.chat(prompt, user, max_tokens=150, temperature=0.3)
        if isinstance(resp, list):
            return [str(x) for x in resp]
        if isinstance(resp, dict) and "suggestions" in resp:
            vals = resp.get("suggestions") or []
            return [str(x) for x in vals]
        if isinstance(resp, str):
            try:
                parsed = json.loads(resp)
                if isinstance(parsed, list):
                    return [str(x) for x in parsed]
            except Exception:
                return []
    except Exception as exc:
        print(f"AI suggestion failed: {exc}")
    return []


def main() -> None:
    parser = argparse.ArgumentParser(description="Relevancy onboarding wizard.")
    parser.add_argument("--name", required=True, help="Name for the output file (projects/<name>-relevancy.json)")
    args = parser.parse_args()

    settings = Settings.load()
    seeds_raw = input("Enter comma-separated seed targets (e.g., levee breach, flood, pier damage): ").strip()
    seeds = [s.strip() for s in seeds_raw.split(",") if s.strip()]
    suggestions: list[str] = []
    use_ai = input("Ask AI to suggest related keywords? [y/N]: ").strip().lower() == "y"
    if use_ai and seeds:
        suggestions = ai_suggest(seeds, settings)
        if suggestions:
            print("AI-suggested keywords:")
            for s in suggestions:
                print(f"- {s}")

    merged = seeds + [s for s in suggestions if s not in seeds]
    out = {
        "name": args.name,
        "targets": merged,
        "notes": "Use PUKAIST_RELEVANCY_TARGETS to apply; optional AI suggestions included." if merged else "",
    }
    path = Path("projects") / f"{args.name}-relevancy.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, indent=2))
    print(f"Wrote {path}")
    if merged:
        print("Set env: PUKAIST_RELEVANCY_ENABLED=true")
        print("PUKAIST_RELEVANCY_TARGETS=" + ",".join(merged))


if __name__ == "__main__":
    main()
