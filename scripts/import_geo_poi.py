from __future__ import annotations

"""
Import point-based geo layers (e.g., First Nation offices) from Geo/* into a local POI store.

This is a local-only helper: it reads GeoJSON with Point geometries and writes
them into `poi.json` under the current index directory. It complements
`import_geo_aoi.py` (which handles polygon AOIs).
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple

from src.config import Settings
from src import poi_store


def main() -> None:
    settings = Settings.load()
    index_dir = settings.index_path.parent
    geo_root = Path("Geo")

    src = geo_root / "first_nations_locations.geojson"
    if not src.exists():
        print("No First Nations locations GeoJSON found at", src)
        return

    data = json.loads(src.read_text())
    if data.get("type") != "FeatureCollection":
        print("Unexpected type in", src, "– expected FeatureCollection.")
        return

    existing = poi_store.load_poi(index_dir)
    seen: set[Tuple[int, str | None]] = set()
    for f in existing:
        props = f.get("properties") or {}
        code = props.get("band_nbr")
        name = props.get("name")
        if isinstance(code, int):
            seen.add((code, str(name) if name is not None else None))

    imported = 0
    for feat in data.get("features", []):
        geom = feat.get("geometry") or {}
        props = feat.get("properties") or {}
        if geom.get("type") != "Point":
            continue
        coords = geom.get("coordinates") or []
        if not isinstance(coords, (list, tuple)) or len(coords) < 2:
            continue
        lon, lat = float(coords[0]), float(coords[1])
        band_name = props.get("BAND_NAME")
        band_nbr = props.get("BAND_NBR")
        if not band_name or band_nbr is None:
            continue
        try:
            band_code_int = int(band_nbr)
        except Exception:
            # Keep non-int codes as None; still ingest by name.
            band_code_int = -1
        key = (band_code_int, str(band_name))
        if key in seen:
            continue
        extra: Dict[str, Any] = {"band_nbr": band_code_int if band_code_int != -1 else band_nbr, "band_name": band_name, "source_file": src.name}
        poi_store.add_poi(index_dir, name=str(band_name), lat=lat, lon=lon, theme="First_Nation_Office", tenant_id=None, extra_properties=extra)
        seen.add(key)
        imported += 1
    print(f"Imported {imported} POI features into {index_dir/'poi.json'} from {src}")


if __name__ == "__main__":
    main()

