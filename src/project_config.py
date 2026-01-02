from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional


@dataclass
class ProjectConfig:
    name: str
    allowed_exts: List[str] = field(default_factory=list)
    max_upload_mb: Optional[int] = None
    prefilter_keywords: List[str] = field(default_factory=list)
    prefilter_min_chars: int = 0
    llm_mode: str = "batch"  # "sync" | "batch"
    llm_enabled: bool = False
    summary_enabled: bool = True
    insights_enabled: bool = False
    batch_limit: int = 100
    max_docs_per_run: Optional[int] = None
    tenant_id: Optional[str] = None
    theme: Optional[str] = None
    # Case profile
    case_type: Optional[str] = None
    claimant: Optional[str] = None
    defendant: Optional[str] = None
    # Optional period (critical years for the case)
    period: Optional[dict] = None  # expects keys: start_year, end_year
    # Optional mission and geo defaults
    mission_focus: Optional[str] = None
    # Optional advanced requirements/constraints notes captured during onboarding
    requirements_notes: Optional[str] = None
    aoi_themes: List[str] = field(default_factory=list)
    aoi_codes: List[str] = field(default_factory=list)
    aoi_names: List[str] = field(default_factory=list)
    band_numbers: List[str] = field(default_factory=list)
    # Enabled legal themes / queues (e.g. Land_Reduction_Trespass)
    enabled_themes: List[str] = field(default_factory=list)
    # Optional project-specific normalized entities (canon + variants)
    normalized_entities: List[dict] = field(default_factory=list)

    @classmethod
    def load(cls, path: Path) -> "ProjectConfig":
        data = json.loads(path.read_text())
        return cls(**data)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.__dict__, indent=2))
