# Indigenous & Treaty Geo Layers — Working Plan

This is a living document that tracks how we ingest, normalise, and expose Indigenous land and treaty datasets inside the Pukaist Engine. It complements `PLAN_GEO.md` by focusing on **authoritative external layers** (NRCan, ISC, DataBC) and how they become usable map layers / AOIs.

Status legend:
- `[ ]` not started
- `[-]` in progress / partial
- `[x]` implemented & validated locally

---

## 1. Goals

- [x] Maintain a **local cache** of authoritative Indigenous/treaty geospatial datasets (no runtime scraping).
- [x] Normalise those datasets into AOI-ready GeoJSON with clear naming and themes.
- [x] Store AOIs with enough metadata (codes, types, jurisdiction) for meaningful tooltips and filtering.
- [x] Expose these layers in the map UI with **human-readable labels** and per-layer toggles (not just a generic “AOI” switch).
- [x] Provide a BC-first view by default, with the ability to expand to all-Canada as needed.
- [-] Keep Storybook/Playwright tests that assert the presence and behaviour of each layer toggle.

---

## 2. Data Inventory (local cache under `Geo/`)

Authoritative datasets we keep as local caches (not stored in Git; download per `Geo/README.md`):

### 2.1 Aboriginal Lands of Canada (NRCan)

Files:
- `Geo/aboriginal_lands_confirmed.geojson`
- `Geo/aboriginal_lands_modified.geojson`

Key facts:
- Features: 3305 (confirmed), 56 (modified).
- `ALTYPE`:
  - “Indian Reserve” (vast majority).
  - “Land Claim”.
  - “Indian Land” (rare).
- Jurisdictions: national — `JUR1` contains `BC`, `AB`, `MB`, `NB`, `NL`, `NS`, `NT`, `NU`, `ON`, `PE`, etc.
- Core fields:
  - `ALCODE` — parcel code.
  - `ALTYPE` — type.
  - `NAME1..NAME5` — up to 5 names.
  - `JUR1..JUR4` — jurisdiction codes.
  - `PROVIDER` — “Federal”.
  - `DATASETNAM` — “CA”.

Normalised AOI subsets:
- `Geo/aoi/aoi_ALC_Confirmed.geojson` (theme: `ALC_Confirmed`)
- `Geo/aoi/aoi_ALC_Modified.geojson` (theme: `ALC_Modified`)

Current mapping:
- `properties.name` := `NAME1` or `NAME2` or `ALCODE`.
- Additional props: `alcode`, `altype`, `source_file`.

### 2.2 Modern Treaties (ISC)

File:
- `Geo/modern_treaties.geojson`

Key facts:
- Features: 28 (national).
- Fields:
  - `TAG_ID` — treaty ID (e.g. `BC30`, `BC52`, `GP0005a`).
  - `ENAME` — English treaty name.
  - `FNAME` — French treaty name.
  - `SBTP_ENAME` — treaty type (“Comprehensive Land Claim with Self-Government Agreement”, etc.).

Normalised AOI subset:
- `Geo/aoi/aoi_Modern_Treaty.geojson` (theme: `Modern_Treaty`)

Mapping:
- `properties.name` := `ENAME` or `FNAME` or `TAG_ID`.
- Additional props: `tag_id`, `source_file`.

### 2.3 First Nations Locations (ISC)

File:
- `Geo/first_nations_locations.geojson`

Key facts:
- Features: 636 (national).
- Fields:
  - `BAND_NBR` — numeric band number.
  - `BAND_NAME` — band name.
- Geometry: `Point` (band offices / communities).

Normalised subset (for future point layer):
- `Geo/aoi/aoi_First_Nation_Office.geojson` (theme: `First_Nation_Office`)
  - `properties.name` := `BAND_NAME`
  - `properties.code` := `BAND_NBR`

### 2.4 BC SOI Regions (DataBC)

File:
- `Geo/soi_bc_regions.geojson`

Key facts:
- Features: 59 (BC only).
- Fields:
  - `SOI_ID` — Statement of Intent ID.
  - `NAME` — human-readable name.
  - `FEATURE_AREA_SQM`, `FEATURE_LENGTH_M` — geometry metrics.

Normalised AOI subset:
- `Geo/aoi/aoi_BC_SOI.geojson` (theme: `BC_SOI`)
  - `properties.name` := `NAME` or `SOI_ID`
  - `properties.soi_id` := `SOI_ID`

---

## 3. Backend Plan (AOI & Layers)

### 3.1 AOI storage model

- [x] AOIs are stored in `99_Working_Files/Evidence_Index/aoi.json` as a FeatureCollection.
- [x] Current AOI properties: `name`, `theme`, `tenant_id`.
- [x] Extend AOI properties to retain more metadata:
  - Aboriginal Lands: `alcode`, `altype`, `jur1`.
  - Treaties: `tag_id`, `sb_type` (from `SBTP_ENAME`).
  - SOI: `soi_id`.
  - Offices: `band_nbr`, `band_name` (via the POI store).

### 3.2 Import pipeline (`scripts/import_geo_aoi.py`)

Current behaviour:
- [x] Reads `Geo/aoi/*.geojson` FeatureCollections.
- [x] Extracts `name` + `theme` from properties/file name.
- [x] Handles `Polygon` and `MultiPolygon` geometries properly:
  - Each polygon’s outer ring becomes an AOI polygon (`geometry.type = Polygon`).
- [x] Deduplicates by `(name, theme)` to allow idempotent imports.
- [x] `scripts/build_geo_aoi_cache.py` generates `Geo/aoi/*.geojson` from the raw GeoJSON sources.

Planned refinements:
- [x] Add a BC-only flag (env `PUKAIST_AOI_BC_ONLY`, default true) to filter Aboriginal Lands where `JUR1 == 'BC'` for default imports; keep full-Canada as an opt-in by setting it to `false`.
- [x] Pass through additional properties (codes/types) into AOIs once AOI storage schema is extended (now passing `alcode`, `altype`, `jur1`, `tag_id`, `sb_type`, `soi_id`, `source_file`).

### 3.3 Separate handling for point layers

- [x] First Nations offices should **not** be forced into polygon AOIs.
- [x] Design a dedicated point-layer path, e.g.:
  - `poi.json` alongside `aoi.json`, or
  - Extended `aoi.json` with `geometry.type === "Point"` but consumed separately in the frontend.
- [x] Import from `Geo/first_nations_locations.geojson` into this point store with:
  - `band_nbr`, `band_name`, optional `jurisdiction`.

---

## 4. Frontend Plan (Map UI & Layer Toggles)

### 4.1 Layer taxonomy in the UI

We want **explicit, domain-true** toggles instead of a generic AOI switch.

Planned layer groups:

- Reserves & settlements (NRCan)
  - Data: Aboriginal Lands where `ALTYPE == "Indian Reserve"`.
  - Themes: `ALC_Confirmed`, `ALC_Modified`.
- Land claim polygons (NRCan)
  - Data: Aboriginal Lands where `ALTYPE == "Land Claim"`.
- Modern treaties (ISC)
  - Data: `Modern_Treaty` AOIs from `TAG_ID/ENAME`.
- BC SOI territories (DataBC)
  - Data: `BC_SOI` AOIs.
- First Nation offices (ISC)
  - Data: point layer from `first_nations_locations.geojson`.

UI work:
- [x] `MapControls` already maps AOI themes to human labels:
  - `ALC_Confirmed` → “Reserves / settlements (confirmed)”
  - `ALC_Modified` → “Reserves / settlements (modified)”
  - `Modern_Treaty` → “Modern treaties”
  - `BC_SOI` → “BC Statement of Intent (SOI) regions”
  - `First_Nation_Office` → “First Nation offices (points)”
- [-] Split the single “Boundaries / AOIs” checkbox into per-layer switches when zoomed in enough, or add a small “Layers” panel listing each theme with its label and counts (now partially implemented via per-layer checkboxes for reserves, land claims, modern treaties, and SOI regions in the “Layers overview” card).

### 4.2 Tooltips and detail when clicking layers

Planned tooltip content:

- For a reserve polygon:
  - `NAME1` (or `name`), `ALCODE`, `ALTYPE`, `JUR1`.
- For a treaty polygon:
  - `ENAME` (treaty name), `TAG_ID`, `SBTP_ENAME` (type).
- For a SOI polygon:
  - `NAME`, `SOI_ID`.
- For a band office point:
  - `BAND_NAME`, `BAND_NBR`.

Implementation:
- [x] Extend AOI/point properties (3.2, 3.3) and add a simple tooltip view in the Leaflet map that reads those fields (Aboriginal Lands show `name`, `ALCODE`, `ALTYPE`, `JUR1`; Treaties show `name`, `TAG_ID`, `SBTP_ENAME` via `sb_type`; SOI shows `name`, `SOI_ID`; POIs show `BAND_NAME`, `BAND_NBR`).

---

## 5. Testing & Validation Plan

### 5.1 Storybook / unit tests

- [x] `MapControls` story uses realistic AOI themes (e.g. `ALC_Confirmed`, `BC_SOI`).
- [x] Add separate stories:
  - Reserves only (ALC_*).
  - Modern treaties only.
  - SOI only.
  - Offices + reserves (once offices are wired).

### 5.2 Playwright tests

Existing:
- `frontend/tests/map.spec.ts`:
  - Mocks `/docs`, `/docs/1/artifact`, `/docs/1/geo`, `/docs/1/suggestions`, `/aoi`.
  - Confirms the map controls render, suggestions can be accepted, and KMZ controls appear.

Planned additions:
- [x] Extend map test to:
  - Mock `/aoi` with multiple themes (`ALC_Confirmed`, `Modern_Treaty`, `BC_SOI`) and assert that each layer label appears in the UI (now covered in `map.spec.ts`).
  - Toggle at least one AOI sublayer (BC SOI) and verify the Leaflet path count decreases, confirming the layer toggle affects map geometry.
- [-] Add a separate test (or extend the map test) for the point layer endpoint (offices) once we can reliably assert marker presence or tooltips for POIs (partially done by mocking `/poi` and asserting \"First Nation offices: 1\" in the Layers overview; tooltip/marker-level checks remain to be added).

---

## 6. Next Steps (to be updated as we go)

1. **AOI metadata extension**  
   - Extend `aoi_store` and `scripts/import_geo_aoi` to carry through codes/types into AOI properties, then update tooltips to read them.

2. **BC vs Canada scope**  
   - Introduce BC-only / all-Canada import modes, with a default that focuses on BC for this project.

3. **Point layer design for band offices**  
   - Add a dedicated point store and endpoints; expose as a toggleable layer.

4. **Map UI layer panel**  
   - [-] Replace or augment the generic AOI toggle with a simple layer list (checkbox per theme) and a compact “Layers overview” (docs points, suggestions, global docs, reserves, treaties, SOI, offices) so users can see what is on the map at a glance.

5. **Test coverage**  
   - Flesh out Storybook and Playwright tests to assert the presence and behaviour of each named layer.

We will update this document as each of these items is implemented and validated locally.
