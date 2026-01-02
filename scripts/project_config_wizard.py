"""
Project config wizard (intent capture).

Creates a JSON project config capturing ingestion and LLM preferences, including
prefilters and cost posture, based on simple Q&A. Designed for local use and
can be edited manually after generation.

Usage:
  PYTHONPATH=. python scripts/project_config_wizard.py --name demo
"""

from __future__ import annotations

import argparse
from pathlib import Path

from src.project_config import ProjectConfig


def ask(prompt: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default else ""
    return input(f"{prompt}{suffix}: ").strip() or (default or "")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a project config (intent capture).")
    parser.add_argument("--name", required=True, help="Project name (used for config filename).")
    parser.add_argument("--out", default="projects", help="Directory to store project configs.")
    args = parser.parse_args()

    name = args.name
    out_dir = Path(args.out)
    out_path = out_dir / f"{name}.json"

    allowed_exts = ask("Allowed extensions (comma-separated, e.g. txt,pdf,docx)", "txt,pdf,docx")
    max_upload_mb = ask("Max upload MB (blank for default)", "")
    prefilter_keywords = ask("Prefilter keywords (comma-separated; optional)", "")
    prefilter_min_chars = ask("Prefilter min chars (0 = no minimum)", "0")
    llm_enabled = ask("Enable LLM? (true/false)", "false").lower() == "true"
    llm_mode = ask("LLM mode (sync/batch)", "batch")
    summary_enabled = ask("Generate summaries? (true/false)", "true").lower() == "true"
    insights_enabled = ask("LLM insights (topics/entities/risks)? (true/false)", "false").lower() == "true"
    batch_limit = ask("Batch prepare limit (default 100)", "100")
    max_docs_per_run = ask("Max docs per run (blank = no cap)", "")
    tenant_id = ask("Tenant ID (optional)", "")
    theme = ask("Default theme/tag (optional)", "")
    mission_focus = ask("Mission focus (optional, e.g. water rights, coastal reserves)", "")
    aoi_themes = ask("Default AOI themes (comma-separated; e.g. ALC_Confirmed,Modern_Treaty,BC_SOI)", "")
    aoi_codes = ask("Default AOI codes (comma-separated ALCODE/TAG_ID/SOI_ID; optional)", "")
    aoi_names = ask("Default AOI names (comma-separated; optional)", "")
    band_numbers = ask("Default First Nation band numbers (comma-separated; optional)", "")

    cfg = ProjectConfig(
        name=name,
        allowed_exts=[ext.strip() for ext in allowed_exts.split(",") if ext.strip()],
        max_upload_mb=int(max_upload_mb) if max_upload_mb else None,
        prefilter_keywords=[kw.strip() for kw in prefilter_keywords.split(",") if kw.strip()],
        prefilter_min_chars=int(prefilter_min_chars or "0"),
        llm_mode=llm_mode or "batch",
        llm_enabled=llm_enabled,
        summary_enabled=summary_enabled,
        insights_enabled=insights_enabled,
        batch_limit=int(batch_limit or "100"),
        max_docs_per_run=int(max_docs_per_run) if max_docs_per_run else None,
        tenant_id=tenant_id or None,
        theme=theme or None,
        mission_focus=mission_focus or None,
        aoi_themes=[t.strip() for t in aoi_themes.split(",") if t.strip()],
        aoi_codes=[c.strip() for c in aoi_codes.split(",") if c.strip()],
        aoi_names=[n.strip() for n in aoi_names.split(",") if n.strip()],
        band_numbers=[b.strip() for b in band_numbers.split(",") if b.strip()],
    )
    cfg.save(out_path)
    print(f"Project config written to {out_path}")


if __name__ == "__main__":
    main()
