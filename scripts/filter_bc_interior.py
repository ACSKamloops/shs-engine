#!/usr/bin/env python3
"""
Filter geo data to BC Interior and process for frontend import.

BC Interior bounding box (approx):
  - West: -125° (Coast Mountains)
  - East: -115° (Alberta border)
  - South: 49° (US border)
  - North: 55° (Northern BC)

Run: python3 scripts/filter_bc_interior.py
"""
import json
from pathlib import Path

GEO_DIR = Path(__file__).parent.parent / "Geo"
DOWNLOADS = GEO_DIR / "downloads"
OUTPUT = GEO_DIR / "bc_interior"
OUTPUT.mkdir(parents=True, exist_ok=True)

# BC Interior bounding box
BC_INTERIOR_BBOX = (-125.0, 49.0, -115.0, 55.0)

def point_in_bbox(lon: float, lat: float, bbox: tuple) -> bool:
    minx, miny, maxx, maxy = bbox
    return minx <= lon <= maxx and miny <= lat <= maxy

def get_centroid(geometry: dict) -> tuple:
    """Get approximate centroid of a geometry"""
    gtype = geometry.get("type", "")
    coords = geometry.get("coordinates", [])
    
    if gtype == "Point":
        return tuple(coords[:2])
    elif gtype == "MultiPoint":
        if coords:
            return tuple(coords[0][:2])
    elif gtype == "Polygon":
        if coords and coords[0]:
            # Average of first ring
            ring = coords[0]
            avg_lon = sum(c[0] for c in ring) / len(ring)
            avg_lat = sum(c[1] for c in ring) / len(ring)
            return (avg_lon, avg_lat)
    elif gtype == "MultiPolygon":
        if coords and coords[0] and coords[0][0]:
            ring = coords[0][0]
            avg_lon = sum(c[0] for c in ring) / len(ring)
            avg_lat = sum(c[1] for c in ring) / len(ring)
            return (avg_lon, avg_lat)
    return (0, 0)

def filter_geojson(input_path: Path, bbox: tuple) -> dict:
    """Filter GeoJSON features to bounding box"""
    with open(input_path) as f:
        data = json.load(f)
    
    features = data.get("features", [])
    filtered = []
    
    for feat in features:
        geom = feat.get("geometry")
        if not geom:
            continue
        lon, lat = get_centroid(geom)
        if point_in_bbox(lon, lat, bbox):
            filtered.append(feat)
    
    return {"type": "FeatureCollection", "features": filtered}

def main():
    print("Filtering datasets to BC Interior...")
    print(f"Bounding box: {BC_INTERIOR_BBOX}")
    print()
    
    files = [
        ("native_land_territories.geojson", "bc_territories.geojson"),
        ("native_land_languages.geojson", "bc_languages.geojson"),
        ("native_land_treaties.geojson", "bc_treaties.geojson"),
        ("first_nations_community_locations.geojson", "bc_first_nations_locations.geojson"),
    ]
    
    for src, dst in files:
        src_path = DOWNLOADS / src
        dst_path = OUTPUT / dst
        
        if not src_path.exists():
            print(f"  ⚠️  {src}: not found, skipping")
            continue
        
        result = filter_geojson(src_path, BC_INTERIOR_BBOX)
        count = len(result["features"])
        
        with open(dst_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"  ✓ {src} → {dst} ({count} features)")
    
    # Watersheds - special handling (filter to Thompson/Nicola/Okanagan)
    ws_src = DOWNLOADS / "bc_major_watersheds.geojson"
    if ws_src.exists():
        with open(ws_src) as f:
            ws_data = json.load(f)
        
        interior_watersheds = ["THOMPSON", "OKANAGAN", "COLUMBIA", "FRASER"]
        filtered_ws = []
        for feat in ws_data.get("features", []):
            name = feat.get("properties", {}).get("MAJOR_WATERSHED_SYSTEM", "")
            if any(iw in name.upper() for iw in interior_watersheds):
                filtered_ws.append(feat)
        
        ws_out = {"type": "FeatureCollection", "features": filtered_ws}
        ws_path = OUTPUT / "bc_interior_watersheds.geojson"
        with open(ws_path, 'w') as f:
            json.dump(ws_out, f, indent=2)
        print(f"  ✓ bc_major_watersheds.geojson → bc_interior_watersheds.geojson ({len(filtered_ws)} watersheds)")
    
    print()
    print(f"✅ Filtered files saved to: {OUTPUT}")
    print()
    
    # Summary
    print("Summary of BC Interior data:")
    for f in OUTPUT.glob("*.geojson"):
        with open(f) as fp:
            data = json.load(fp)
        count = len(data.get("features", []))
        size = f.stat().st_size / 1024
        print(f"  - {f.name}: {count} features ({size:.1f} KB)")

if __name__ == "__main__":
    main()
