# Geo & Map Plan — Pukaist Engine

Goals:
- Suggest and manage multiple places/coords per document.
- Allow editing/dragging map points and attaching new points to docs.
- Support KMZ/KML uploads (as AOIs and/or doc-linked geometries).
- Deliver a map UI that feels closer to ArcGIS: layers, toggles, edit tools.

Milestones:
1) Backend foundations
   - [x] Add `geo_suggestions` table: (id, doc_id, task_id, label, lat, lon, score, source, accepted, created_at).
   - [x] API: list suggestions per doc (`GET /docs/{id}/suggestions`).
   - [x] API: accept/reject suggestion (moves to `geo_points` on accept, marks accepted).
   - [x] API: update existing point (`PATCH /docs/{doc_id}/coords/{coord_id}`) for drag edits.
   - [x] Tests: API-level coverage for suggestions list/accept/reject and coord PATCH.
   - [x] Logging: ensure errors on accept/reject/patch are logged with doc/task ids.
2) Map UI
   - [x] Integrate a real map (Leaflet/MapLibre) in the console.
   - [x] Show confirmed points (geo_points) vs suggested points (geo_suggestions) with distinct styling.
   - [x] Add “accept/reject” UI for suggestions and drag-to-update for confirmed points.
   - [x] Add “add point” on map to POST `/docs/{id}/coords`.
   - [x] Layer toggles (docs, AOIs, suggestions, KMZ layers).
   - [x] AOI theme filter and curl helper for KMZ import in UI.
   - [x] E2E: Playwright tests with mocked API covering map add/drag, suggestions accept/reject, AOI toggle/filter, KMZ upload control.
3) KMZ/KML import
   - [x] Allow KMZ/KML uploads (configurable allowlist).
   - [x] Parse KMZ/KML → GeoJSON; import as AOIs and/or doc-linked shapes (new table if needed).
   - [x] API: `/aoi/import_kmz` (or extend `/aoi` to accept a file upload).
   - [x] Accept GeoJSON too (points to docs, polygons to AOIs).
   - [x] Tests: API tests for KMZ/KML/GeoJSON import (happy + failure cases).
   - [x] Logging: KMZ import success/failure logged with filename/doc_id/tenant.
4) Place extraction (optional/stub)
   - [x] Worker: extract place strings (gazetteer stub) → write `geo_suggestions`.
   - [x] Config: enable/disable geocoding provider; default to offline/no-op.
5) Docs & tests
   - [x] Add tests for suggestions API, coord PATCH, and KMZ parsing.
   - [x] Update docs (README, llm-ops-and-testing) and sample CTA to mention map edits/KMZ.
