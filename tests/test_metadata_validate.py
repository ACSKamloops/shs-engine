from __future__ import annotations

from pathlib import Path

from src.metadata import infer_metadata
from src.validate import validate_record, summarize_errors


def test_infer_metadata_extracts_doc_type_and_date(tmp_path: Path) -> None:
    sample = tmp_path / "transcript_2024-01-01.txt"
    sample.write_text("Hearing transcript with coordinates 49.123 -123.456.")
    md = infer_metadata(sample, theme="regulatory", content=sample.read_text())
    assert md["doc_type"] == "transcript"
    assert md["inferred_date"] == "2024-01-01"
    assert md["extension"] == "txt"
    assert md["doc_id"]


def test_validate_and_summarize_errors() -> None:
    errors = validate_record("", {"extension": "txt"})
    summary = summarize_errors(errors)
    assert "empty content" in summary
    assert summary
