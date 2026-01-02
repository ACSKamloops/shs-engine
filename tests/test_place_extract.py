from __future__ import annotations

from pathlib import Path

from src.place_extract import extract_place_suggestions


def test_extract_place_suggestions_with_custom_gazetteer(tmp_path: Path):
    gazetteer = tmp_path / "places.tsv"
    gazetteer.write_text("name\tlat\tlon\nVancouver\t49.2827\t-123.1207\nCalgary\t51.0486\t-114.0708\n")
    text = "Our route will pass through Vancouver before heading to Calgary."
    suggestions = extract_place_suggestions(text, gazetteer)
    labels = {s.name for s in suggestions}
    assert "Vancouver" in labels
    assert "Calgary" in labels
    coords = {(s.name, round(s.lat, 4), round(s.lon, 4)) for s in suggestions}
    assert ("Vancouver", 49.2827, -123.1207) in coords
    assert ("Calgary", 51.0486, -114.0708) in coords


def test_extract_place_suggestions_uses_builtin_when_no_file(tmp_path: Path):
    text = "The team met in Ottawa and later presented findings in Toronto."
    suggestions = extract_place_suggestions(text, None)
    labels = {s.name for s in suggestions}
    assert "Ottawa" in labels
    assert "Toronto" in labels
