#!/usr/bin/env python3
"""
Download BC Interior Geo Datasets
Run: python scripts/download_geo_data.py

SIGNUP REQUIRED:
- Native Land Digital API: https://native-land.ca/api/docs/ (free account)
"""
import os
import json
import urllib.request
from pathlib import Path

GEO_DIR = Path(__file__).parent.parent / "Geo" / "downloads"
GEO_DIR.mkdir(parents=True, exist_ok=True)

# BC Data Catalogue - direct WFS GeoJSON endpoints
BC_DATA_CATALOGUE = {
    "first_nations_community_locations": 
        "https://openmaps.gov.bc.ca/geo/pub/WHSE_HUMAN_CULTURAL_ECONOMIC.FN_COMMUNITY_LOCATIONS_SP/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_HUMAN_CULTURAL_ECONOMIC.FN_COMMUNITY_LOCATIONS_SP&outputFormat=json",
    "bc_major_watersheds":
        "https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS&outputFormat=json",
}

# Native Land Digital (requires API key)
NATIVE_LAND_BASE = "https://native-land.ca/api/index.php"

def download_bc_datasets():
    """Download from BC Data Catalogue (no auth required)"""
    print("Downloading BC Data Catalogue datasets...")
    for name, url in BC_DATA_CATALOGUE.items():
        out_file = GEO_DIR / f"{name}.geojson"
        if out_file.exists():
            print(f"  - {name}: already exists, skipping")
            continue
        print(f"  - Downloading {name}...")
        try:
            urllib.request.urlretrieve(url, out_file)
            print(f"    Saved: {out_file}")
        except Exception as e:
            print(f"    ERROR: {e}")

def download_native_land(api_key: str = None):
    """Download from Native Land Digital API (requires key)"""
    if not api_key:
        api_key = os.environ.get("NATIVE_LAND_API_KEY")
    if not api_key:
        print("\n⚠️  Native Land Digital requires an API key.")
        print("   Sign up at: https://native-land.ca/api/docs/")
        print("   Then set NATIVE_LAND_API_KEY env var or pass as argument.")
        return
    
    print("\nDownloading Native Land Digital datasets...")
    for category in ["territories", "languages", "treaties"]:
        out_file = GEO_DIR / f"native_land_{category}.geojson"
        if out_file.exists():
            print(f"  - {category}: already exists, skipping")
            continue
        url = f"{NATIVE_LAND_BASE}?maps={category}&key={api_key}"
        print(f"  - Downloading {category}...")
        try:
            with urllib.request.urlopen(url) as resp:
                data = json.loads(resp.read())
                with open(out_file, 'w') as f:
                    json.dump(data, f)
            print(f"    Saved: {out_file}")
        except Exception as e:
            print(f"    ERROR: {e}")

def filter_bc_interior(geojson_path: Path, output_path: Path, bbox=(-125, 49, -118, 54)):
    """Filter GeoJSON to BC interior bounding box"""
    minx, miny, maxx, maxy = bbox
    with open(geojson_path) as f:
        data = json.load(f)
    
    filtered = []
    for feat in data.get("features", []):
        geom = feat.get("geometry", {})
        coords = geom.get("coordinates", [])
        # Simple centroid check for points/polygons
        if geom.get("type") == "Point":
            x, y = coords
            if minx <= x <= maxx and miny <= y <= maxy:
                filtered.append(feat)
        elif geom.get("type") in ("Polygon", "MultiPolygon"):
            # Check first coordinate
            try:
                first = coords[0][0] if geom["type"] == "Polygon" else coords[0][0][0]
                x, y = first[:2]
                if minx <= x <= maxx and miny <= y <= maxy:
                    filtered.append(feat)
            except:
                pass
    
    out_data = {"type": "FeatureCollection", "features": filtered}
    with open(output_path, 'w') as f:
        json.dump(out_data, f, indent=2)
    print(f"Filtered {len(filtered)} features to {output_path}")

if __name__ == "__main__":
    import sys
    api_key = sys.argv[1] if len(sys.argv) > 1 else None
    
    download_bc_datasets()
    download_native_land(api_key)
    
    print("\n✅ Done! Files saved to:", GEO_DIR)
    print("\nNext steps:")
    print("  1. Run: python scripts/import_geo_aoi.py downloads/native_land_territories.geojson")
    print("  2. Filter to BC interior: use --bbox flag")
