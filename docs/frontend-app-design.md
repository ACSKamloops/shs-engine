# Frontend App Design — Pukaist Engine (Phase 2)

This note sketches a dedicated, branded web UI that uses the existing API/SDK for uploads, search, map/AOI management, and flagged-task review. It extends the minimal demos in `docs/` into a standalone app.

## Goals

- Provide a cohesive UI for:
  - Uploading and tracking jobs/tasks.
  - Searching and inspecting documents, summaries, and insights.
  - Viewing map overlays (points + AOIs).
  - Reviewing and resolving flagged tasks.
- Use only the documented REST API and TS SDK (`sdk/ts/pukaist-client.ts`, `sdk/ts/embed-widget.ts`).
- Keep the frontend separable: it can live in a separate repo/app, but this design assumes a `frontend/` folder in this project for convenience.

## High-Level Structure

- `frontend/`
  - `index.html` — root HTML shell.
  - `src/`
    - `api.ts` — thin wrapper over `PukaistClient` with app-specific helpers.
    - `views/`
      - `UploadView.ts` — upload + job tracking.
      - `SearchView.ts` — search + document detail.
      - `MapView.ts` — map + AOIs using `/geojson` and `/aoi`.
      - `OpsView.ts` — flagged tasks, queue status, job summaries.
    - `App.ts` — simple client-side router and layout.
  - `styles/`
    - `app.css` — shared styling, including light/dark theme toggles.

Framework choice:
- Keep the design framework-agnostic (plain TS + DOM or any SPA framework).
- For simplicity and minimal dependencies, a small TS + DOM app (no heavy framework) is sufficient; bundling can be handled via a simple build tool if needed.

## Key Views

### Upload & Jobs

- Components:
  - File picker.
  - Theme selector.
  - Upload button.
  - Job list with:
    - Status indicators (pending, processing, done, flagged).
    - Links to job summary and tasks.
- API usage:
  - `client.upload(file, theme)` → UploadResponse.
  - `client.jobs()` / `client.jobSummary(jobId)` / `client.jobTasks(jobId)`.

### Search & Document Detail

- Components:
  - Search box with filters (theme, date range, doc_type) mapped to server-side filters; prefer server filters to avoid large payloads.
  - Results table with title, doc_type, inferred_date, snippet, and badges (status/theme/type) rendered client-side from API fields only.
  - Detail panel showing:
    - Full summary.
    - Insights (including any LLM-enriched fields).
    - Intent (from `/docs/{id}/artifact`) to expose llm_mode/prefilter without hard-coding defaults.
    - Links to map view (if geo present).
- API usage:
  - `client.search(query, opts)` (`theme`/`doc_type` filters) and `client.docs(opts)` with the same filters.
  - `/search/hybrid` accepts the same filters when embeddings are enabled.
  - `/docs/{id}/artifact` for intent/metadata/insights; keep UI read-only for these fields.

### Map & AOIs

- Components:
  - Map canvas (Leaflet or similar).
  - Layer controls for:
    - Points (from `/geojson`).
    - AOIs (from `/aoi`).
  - AOI management panel:
    - List AOIs.
    - Simple create/delete interactions (using `/aoi` POST/GET and a future DELETE).
- API usage:
  - `client.geojson()` and `/aoi`.

### Operations (Flagged & Queue)

- Components:
  - Flagged tasks list with reasons and quick links to source documents.
  - Queue status summary.
  - Controls to:
    - Trigger batch reruns via existing queue admin scripts (documented only).
    - Navigate to underlying artifacts for deeper debugging.
- API usage:
  - `/tasks/flagged`, `/status`, `/jobs`, `/jobs/{id}/summary`, `/jobs/{id}/tasks`.

## Auth Handling

- Respect the existing auth model:
  - API token via `X-API-Key` for dev.
  - Bearer tokens for OIDC/JWT-based deployments.
  - Optional role-aware UI (admin/ingest/viewer) when `PUKAIST_ROLES_CLAIM` is configured; hide upload/ops for viewer.
- Provide a simple configuration panel in the frontend to set:
  - API base URL.
  - Auth mode (API key vs Bearer).
  - Stored in localStorage for convenience in dev.

## Local-First Integration

- During development:
  - Serve the frontend with a static server (e.g., `npm run dev` or `python -m http.server` from `frontend/`).
  - Call the local API (`http://localhost:8000`) with CORS configured via `PUKAIST_CORS_ORIGINS`.
- In production:
  - Host the frontend behind the same domain as the API if possible, or configure CORS appropriately.

This design fulfills the "Frontend" planning item in Section 15 of `MASTER_PLAN.md` at a conceptual level and provides a clear structure for implementing a dedicated UI in a subsequent step.
