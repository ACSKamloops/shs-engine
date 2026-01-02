from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any, Optional


def _poi_path(index_dir: Path) -> Path:
  index_dir.mkdir(parents=True, exist_ok=True)
  return index_dir / "poi.json"


def load_poi(index_dir: Path) -> List[Dict[str, Any]]:
  path = _poi_path(index_dir)
  if not path.exists():
      return []
  return json.loads(path.read_text() or "[]")


def save_poi(index_dir: Path, features: List[Dict[str, Any]]) -> None:
  path = _poi_path(index_dir)
  path.write_text(json.dumps(features, indent=2))


def add_poi(
    index_dir: Path,
    name: str,
    lat: float,
    lon: float,
    theme: str | None = None,
    tenant_id: Optional[str] = None,
    extra_properties: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
  features = load_poi(index_dir)
  props: Dict[str, Any] = {"name": name, "theme": theme, "tenant_id": tenant_id}
  if extra_properties:
      for k, v in extra_properties.items():
          if k not in props:
              props[k] = v
  feature = {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [lon, lat]},
      "properties": props,
  }
  features.append(feature)
  save_poi(index_dir, features)
  return feature


def geojson(index_dir: Path, tenant_id: Optional[str] = None, theme: Optional[str] = None) -> Dict[str, Any]:
  features = load_poi(index_dir)
  if tenant_id:
      features = [f for f in features if f.get("properties", {}).get("tenant_id") == tenant_id]
  if theme:
      features = [f for f in features if f.get("properties", {}).get("theme") == theme]
  return {"type": "FeatureCollection", "features": features}

