# Geo-Aware Intelligence Plan — Pukaist Engine

This plan builds on `docs/geo-layers-plan.md` and focuses on how **evidence, OCR, relevancy, and Indigenous/treaty layers** come together into an actual intelligence workflow.

Status legend:
- `[ ]` not started
- `[-]` in progress / partial
- `[x]` implemented & validated locally

---

## 1. Goals

- [x] Make it easy to see, for any document:
  - Where its points lie (doc geo),
  - Which Indigenous/treaty AOIs it intersects or is near,
  - Which First Nation offices are nearby.
- [x] Use AOIs/POIs to refine relevancy:
  - Boost or tag docs that intersect specified treaties, reserves, or SOI regions.
  - Allow users to define missions that include spatial focus (e.g., “coastal reserves in BC”).
- [x] Provide filters in the console:
  - “Show docs in this AOI / treaty / SOI region.”
  - “Show docs near this band office.”
- [x] Keep the implementation local-first (no external GIS calls) and grounded in our existing index/files.

---

## 2. Architecture Hooks We Already Have

- [x] Doc geo points (`geo_points` table, `/docs/{id}/geo`).
- [x] Global geo points (`/geojson`).
- [x] AOIs from external layers (reserves, land claims, modern treaties, BC SOI) stored in `aoi.json` and surfaced via `/aoi`.
- [x] First Nation offices as POIs in `poi.json`, surfaced via `/poi`.
- [x] Mission focus text + relevancy scoring (heuristic / optional LLM) per doc.
- [x] Map UI with:
  - Doc points, suggestions, AOIs, and offices.
  - Layer toggles and overview card.

These are the hooks we will use rather than inventing parallel paths.

---

## 3. Phase 1 — Doc-Level Geo Context (per-document view)

### 3.1 Attach AOI and POI context to the pipeline inspector

- [x] Backend:
  - Add a helper that, given a doc_id:
    - Loads its geo points from `geo_points`.
    - Checks which AOI polygons contain at least one point.
    - Finds the nearest POIs (First Nation offices) within a configurable radius.
  - Expose this via a new endpoint, e.g.:
    - `GET /docs/{id}/geo_context` → `{ aois: [...], offices: [...] }`.
- [x] Frontend:
  - In the Pipeline inspector (right column in Workspace):
    - Add a “Geo context” block:
      - List intersecting AOIs as:
        - “Reserve / settlement: NAME (ALCODE, JUR1)”
        - “Modern treaty: NAME (TAG_ID, type)”
        - “SOI region: NAME (SOI_ID)”
      - List nearby band offices as:
        - “Office: BAND_NAME (#BAND_NBR), distance approx XX km”.

### 3.2 Implementation strategy for point-in-polygon and nearest-office

- [x] Implement a lightweight geometry helper (no heavy GIS stack):
  - For point-in-polygon:
    - Prefer a small, well-known algorithm (ray casting or winding number) implemented directly against our AOI polygons.
    - Limit to WGS84 lat/lon with appropriate safeguards (we only need local accuracy, not millimeter precision).
  - For nearest-office:
    - Use Haversine or similar great-circle approximation to rank office points by distance from each doc point.
    - Cap the search radius and number of offices returned for clarity.

---

## 4. Phase 2 — Geo-Aware Relevancy & Missions

### 4.1 Geo-aware relevancy tags

- [x] Backend:
  - Extend the relevancy scorer or a post-processing step to:
    - Attach simple geo tags based on AOI/POI context, e.g.:
      - `in_reserve: true/false`, `in_treaty: [TAG_IDs]`, `in_soi: [SOI_IDs]`, `nearest_offices: [band_nbrs]`.
    - Persist these tags in the artifact or index metadata.
- [x] Frontend:
  - Show geo tags in the Pipeline inspector alongside existing relevancy rationale.
  - Allow filtering in Search & Docs by:
    - “Docs in a reserve / treaty / SOI.”
    - “Docs near a specific band office.”

### 4.2 Mission focus with spatial hints

- [x] Extend the mission focus bar in Workspace to optionally include:
  - Spatial hints like:
    - “Focus on BC coastal reserves,”
    - “Within modern treaties in northern BC,”
    - “Near offices of X Nation.”
- [ ] Backend:
  - Interpret these hints as:
    - AOI filters (themes + optional name/code matching).
    - POI filters (band name/number).
  - Use them to:
    - Restrict geo-aware relevancy tagging to relevant AOIs/POIs.
    - Suggest which AOIs/POIs might be of interest for the current mission.

---

## 5. Phase 3 — Geo Filters in the Console

### 5.1 AOI / POI filters in Search & Docs

- [x] Backend:
  - Add optional query parameters to `/search` and `/docs`:
    - `aoi_theme`, `aoi_name`, `aoi_code` (ALCODE/TAG_ID/SOI_ID).
    - `near_band_nbr` (First Nation office proximity).
  - Implement these by:
    - Using precomputed geo tags (from Phase 2), or
    - On-the-fly lookups using the geometry helper, with caching.
- [x] Frontend:
  - Extend Search & Docs filter row to include:
    - AOI selector (by name or code) and a POI selector (band name/number).
  - Clearly indicate when geo filters are active.

---

## 6. Phase 4 — Testing & Validation

- [x] Unit tests:
  - Point-in-polygon helper against a few known AOIs and sample points.
  - Nearest-office helper with small synthetic datasets.
- [x] API tests:
  - `/docs/{id}/geo_context` returns expected AOIs/POIs for a seeded doc.
  - `/search` and `/docs` accept geo filters and return scoped results.
- [x] Playwright:
  - Geo context block appears with expected labels for a sample doc in a seeded environment.
  - Geo filters in the console actually narrow the doc list, and the map reflects the filtered set.

---

## 7. Notes

- Keep everything **local-first**:
  - Use the cached `Geo/` data and our own AOI/POI stores.
  - Avoid external geocoding services; any inference uses our local geometry only.
- Accuracy vs complexity:
  - We favour simple, readable geometry helpers over heavy GIS libraries, but we should test them on realistic AOI shapes from BC.
- We will update this plan as each phase is implemented and validated locally.

---

## 8. Future Enhancements (next passes)

These are geo-aware enhancements that align with the current workspace but are not implemented yet:

- [ ] Mission → geo automation (backend)
  - Parse saved mission profiles into AOI/POI filters server-side so batch jobs and non-UI clients can share the same spatial focus rules.
- [x] Project-scoped geo tags (backend)
  - Use per-project AOI themes/codes/names and band numbers (when configured) to scope which AOIs and offices contribute to `geo_tags`, while leaving raw `geo_context` untouched.
- [x] Smarter mission suggestions (frontend)
  - Use existing AOI/POI inventories to suggest likely focus areas (e.g. coastal SOI regions, specific treaty IDs) as chips that can be applied in one click.
- [x] Geo context → interactive filters
  - Make reserves/treaties/SOI regions and nearby band offices in the Geo context panel clickable so they pre-fill AOI/band filters and visually highlight the corresponding polygons on the map.
- [x] Mission → geo suggestion API and wizard hook
  - Add a `/mission/geo_suggest` endpoint that scans cached AOIs/POIs for mission-term matches and returns suggested AOI themes/codes/names and band numbers, and wire it into the Workspace project wizard so users can auto-fill geo defaults from mission text instead of hand-picking ALCODE/TAG_ID/SOI_ID.
- [ ] Collections + geo dashboard
  - Add a dedicated collections view that summarises, per collection, counts by review status, geo tags (in_reserve / in_treaty / in_soi), and most common AOIs.
- [ ] Per-project geo defaults
  - Allow project configs to declare default AOI themes (e.g. BC-only reserves + SOI) and offices of interest so new sessions start with the right layers and filters active.
