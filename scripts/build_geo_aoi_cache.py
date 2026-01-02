#!/usr/bin/env python3
"""
Build AOI FeatureCollections from local GeoJSON sources under Geo/.

This creates files in Geo/aoi/ that can be imported into the AOI store via:
  python scripts/import_geo_aoi.py
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


def _load_feature_collection(path: Path) -> Optional[Dict[str, Any]]:
    if not path.exists():
        print(f"⚠️  Missing source file: {path}")
        return None
    try:
        data = json.loads(path.read_text())
    except Exception as exc:
        print(f"⚠️  Failed to read {path}: {exc}")
        return None
    if data.get("type") != "FeatureCollection":
        print(f"⚠️  Unexpected GeoJSON type in {path}: {data.get('type')}")
        return None
    return data


def _first_value(props: Dict[str, Any], keys: Iterable[str]) -> Optional[Any]:
    for key in keys:
        val = props.get(key)
        if val is None:
            continue
        if isinstance(val, str) and not val.strip():
            continue
        return val
    return None


def _normalize_name(props: Dict[str, Any], fallback: str, keys: List[str]) -> str:
    name = _first_value(props, keys)
    if isinstance(name, str):
        return name.strip()
    if name is not None:
        return str(name)
    return fallback


def _build_aoi_features(
    src_path: Path,
    theme: str,
    name_keys: List[str],
    extra_fields: Dict[str, List[str]],
) -> List[Dict[str, Any]]:
    data = _load_feature_collection(src_path)
    if not data:
        return []

    features: List[Dict[str, Any]] = []
    for feat in data.get("features", []):
        geom = feat.get("geometry")
        if not geom:
            continue
        props = feat.get("properties") or {}
        fallback = _first_value(props, ["ALCODE", "TAG_ID", "SOI_ID"]) or theme
        name = _normalize_name(props, str(fallback), name_keys)

        out_props: Dict[str, Any] = {"name": name, "theme": theme, "source_file": src_path.name}
        for out_key, src_keys in extra_fields.items():
            value = _first_value(props, src_keys)
            if value is not None:
                out_props[out_key] = value

        features.append({"type": "Feature", "geometry": geom, "properties": out_props})
    return features


def _write_feature_collection(path: Path, features: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"type": "FeatureCollection", "features": features}
    path.write_text(json.dumps(payload, indent=2))
    print(f"✓ Wrote {path} ({len(features)} features)")


def main() -> None:
    geo_root = Path("Geo")
    aoi_root = geo_root / "aoi"

    datasets = [
        {
            "src": geo_root / "aboriginal_lands_confirmed.geojson",
            "out": aoi_root / "aoi_ALC_Confirmed.geojson",
            "theme": "ALC_Confirmed",
            "name_keys": ["NAME_EN", "NAME_FR", "NAME", "NAME1", "NAME2", "NAME3", "NAME4", "NAME5"],
            "extra": {"alcode": ["ALCODE"], "altype": ["ALTYPE", "LAND_TYPE"]},
        },
        {
            "src": geo_root / "aboriginal_lands_modified.geojson",
            "out": aoi_root / "aoi_ALC_Modified.geojson",
            "theme": "ALC_Modified",
            "name_keys": ["NAME_EN", "NAME_FR", "NAME", "NAME1", "NAME2", "NAME3", "NAME4", "NAME5"],
            "extra": {"alcode": ["ALCODE"], "altype": ["ALTYPE", "LAND_TYPE"]},
        },
        {
            "src": geo_root / "modern_treaties.geojson",
            "out": aoi_root / "aoi_Modern_Treaty.geojson",
            "theme": "Modern_Treaty",
            "name_keys": ["ENAME", "FNAME", "NAME", "TAG_ID"],
            "extra": {"tag_id": ["TAG_ID"]},
        },
        {
            "src": geo_root / "soi_bc_regions.geojson",
            "out": aoi_root / "aoi_BC_SOI.geojson",
            "theme": "BC_SOI",
            "name_keys": ["NAME", "SOI_ID"],
            "extra": {"soi_id": ["SOI_ID"]},
        },
    ]

    for dataset in datasets:
        features = _build_aoi_features(
            dataset["src"],
            dataset["theme"],
            dataset["name_keys"],
            dataset["extra"],
        )
        if features:
            _write_feature_collection(dataset["out"], features)

    print("✅ AOI cache build complete.")
    print("Next step: python scripts/import_geo_aoi.py")


if __name__ == "__main__":
    main()
