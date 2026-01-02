from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any, Optional


def _aoi_path(index_dir: Path) -> Path:
    index_dir.mkdir(parents=True, exist_ok=True)
    return index_dir / "aoi.json"


def load_aois(index_dir: Path) -> List[Dict[str, Any]]:
    path = _aoi_path(index_dir)
    if not path.exists():
        return []
    return json.loads(path.read_text() or "[]")


def save_aois(index_dir: Path, features: List[Dict[str, Any]]) -> None:
    path = _aoi_path(index_dir)
    path.write_text(json.dumps(features, indent=2))



def add_aoi(
    index_dir: Path,
    name: str,
    theme: str | None,
    coords: List[List[float]],
    tenant_id: Optional[str] = None,
    extra_properties: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    return add_aois(
        index_dir,
        [
            {
                "name": name,
                "theme": theme,
                "coords": coords,
                "tenant_id": tenant_id,
                "extra_properties": extra_properties,
            }
        ],
    )[0]


def add_aois(
    index_dir: Path,
    items: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    features = load_aois(index_dir)
    new_features = []

    for item in items:
        props: Dict[str, Any] = {
            "name": item["name"],
            "theme": item["theme"],
            "tenant_id": item.get("tenant_id"),
        }
        if item.get("extra_properties"):
            # Do not allow overrides of core fields.
            for k, v in item["extra_properties"].items():
                if k not in props:
                    props[k] = v
        
        feature = {
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [item["coords"]]},
            "properties": props,
        }
        features.append(feature)
        new_features.append(feature)

    if new_features:
        save_aois(index_dir, features)
    
    return new_features


def geojson(index_dir: Path, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    features = load_aois(index_dir)
    if tenant_id:
        features = [f for f in features if f.get("properties", {}).get("tenant_id") == tenant_id]
    return {"type": "FeatureCollection", "features": features}
