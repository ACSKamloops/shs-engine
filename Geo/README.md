Geo Layers - Indigenous/Treaty Data (Local Cache)
=================================================

This folder is intentionally light in Git. Large GeoJSON/shapefile caches are
not tracked in the repo. Use the steps below to download data locally when you
need GIS layers or AOI imports.

For detailed background, licensing, and provenance notes, see `Geo Data.md`.

Quick start (download + build locally)
--------------------------------------

1) Create local folders:
   - `mkdir -p Geo/raw Geo/aoi Geo/downloads Geo/bc_interior`

2) Optional convenience downloads (BC Data Catalogue + Native Land):
   - `python scripts/download_geo_data.py`
   - Native Land requires an API key (see script header).

3) Authoritative datasets (manual downloads):
   - Aboriginal Lands of Canada (NRCan, shapefile ZIP):
     https://ftp.maps.canada.ca/pub/nrcan_rncan/vector/geobase_al_ta/
     (look for `AL_TA_CA_SHP_DCM_eng.zip`)
   - Modern Treaties (ISC, shapefile ZIP):
     https://data.sac-isc.gc.ca/geomatics/rest/directories/arcgisoutput/DonneesOuvertes_OpenData/Traite_moderne_Modern_Treaty/Traite_moderne_Modern_Treaty_SHP.zip
   - First Nations Geographic Location (ISC, shapefile ZIP):
     https://data.sac-isc.gc.ca/geomatics/rest/directories/arcgisoutput/Donnees_Ouvertes-Open_Data/Premiere_Nation_First_Nation/Premiere_Nation_First_Nation_SHP.zip
   - BC SOI Regions (DataBC WFS, GeoJSON):
     https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_LEGAL_ADMIN_BOUNDARIES.QSOI_BC_REGIONS_POLYGON&outputFormat=json

4) Convert shapefiles to GeoJSON (requires GDAL/ogr2ogr):
   - `ogr2ogr -f GeoJSON Geo/aboriginal_lands_confirmed.geojson Geo/raw/AL_TA_CA_2_179_CONFIRMED_eng.shp`
   - `ogr2ogr -f GeoJSON Geo/aboriginal_lands_modified.geojson Geo/raw/AL_TA_CA_2_179_MODIFIED_eng.shp`
   - `ogr2ogr -f GeoJSON Geo/modern_treaties.geojson Geo/raw/Traite_moderne_Modern_Treaty_SHP.shp`
   - `ogr2ogr -f GeoJSON Geo/first_nations_locations.geojson Geo/raw/Premiere_Nation_First_Nation.shp`
   - `curl -L "<WFS URL above>" -o Geo/soi_bc_regions.geojson`

5) Build AOI cache files:
   - `python scripts/build_geo_aoi_cache.py`
   - Import into the AOI store: `python scripts/import_geo_aoi.py`

6) Build frontend-friendly BC interior layers (optional, for map overlays):
   - `python scripts/filter_bc_interior.py`

Expected local files (not stored in Git)
----------------------------------------

- `Geo/aboriginal_lands_confirmed.geojson`
- `Geo/aboriginal_lands_modified.geojson`
- `Geo/modern_treaties.geojson`
- `Geo/first_nations_locations.geojson`
- `Geo/soi_bc_regions.geojson`
- `Geo/aoi/*.geojson`
- `Geo/raw/*` (source shapefiles)
- `Geo/downloads/*` (optional convenience layers)
- `Geo/bc_interior/*` (optional filtered layers)
