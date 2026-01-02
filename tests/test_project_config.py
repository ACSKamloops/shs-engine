from __future__ import annotations

from pathlib import Path

from src.project_config import ProjectConfig


def test_project_config_roundtrip(tmp_path: Path) -> None:
    cfg = ProjectConfig(
        name="demo",
        allowed_exts=["txt", "pdf"],
        max_upload_mb=10,
        prefilter_keywords=["alpha"],
        prefilter_min_chars=100,
        llm_mode="batch",
        llm_enabled=False,
        summary_enabled=True,
        insights_enabled=False,
        batch_limit=50,
        max_docs_per_run=5,
        tenant_id="tenant-x",
        theme="demo-theme",
        mission_focus="Water rights near coastal reserves",
        aoi_themes=["ALC_Confirmed", "Modern_Treaty"],
        aoi_codes=["AL123", "TAG_X"],
        aoi_names=["Sample Reserve"],
        band_numbers=["10", "20"],
    )
    out = tmp_path / "demo.json"
    cfg.save(out)
    loaded = ProjectConfig.load(out)
    assert loaded.name == cfg.name
    assert loaded.allowed_exts == cfg.allowed_exts
    assert loaded.prefilter_keywords == ["alpha"]
    assert loaded.prefilter_min_chars == 100
    assert loaded.llm_mode == "batch"
    assert loaded.max_docs_per_run == 5
    # New mission/geo defaults should round-trip
    assert loaded.mission_focus == cfg.mission_focus
    assert loaded.aoi_themes == ["ALC_Confirmed", "Modern_Treaty"]
    assert loaded.aoi_codes == ["AL123", "TAG_X"]
    assert loaded.aoi_names == ["Sample Reserve"]
    assert loaded.band_numbers == ["10", "20"]
