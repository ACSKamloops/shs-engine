# Pukaist Engine UI (React + Vite)

Local-first demo with frame/dimming, map overlays, and review shortcuts. Storybook includes mocked and live API modes; Playwright smoke covers core clicks.

## Scripts

- `npm run dev` – Vite dev server
- `npm run build` – typecheck + production build
- `npm run lint`
- `npm run storybook` / `npm run build-storybook`
- `npm run test:unit` – vitest (single-thread; OCR util tests)
- `npm run test:smoke` – Playwright smoke (uses `PLAYWRIGHT_BASE_URL` or `http://localhost:4173`)
- `npm run test:smoke:preview` – starts `npm run preview` on port 4173, runs smoke, shuts down

## API expectations

The app calls:

- `GET /docs?limit=20&q=...` → `{ docs: Doc[] }` or `{ results: Doc[] }`
- `GET /docs/:id` → `Doc`
- `GET /docs/:id/artifact` → `Artifact`
- `GET /docs/:id/file?token=...` → downloads source
- `GET /geo/layers/:name` → local GeoJSON cache (see `Geo/README.md`)

Doc fields used: `id`, `title`, `summary`, `theme`, `doc_type`, `created_at` (unix seconds), `lat`/`lng`, `status` (`reviewed|follow_up|not_started`), `relevant`.

Artifact fields used: `content_preview`, `summary`, `metadata.pages`, `metadata.confidence`, `metadata.source`, `insights` (object).

## Storybook

- Interactive story (`AppInteractive`) mocks `/docs` and `/docs/:id/artifact` by default.
- To point at a real API: set `VITE_STORYBOOK_API_BASE` (mocking is skipped).
- Frame/dimming variant and docs page live under `Demo/`.
- Custom-layer stories (GeoJSON + KML/KMZ conversion + copy/toast demo) live under `Demo/App Custom Layer` for visual checks.
- Optional Chromatic snapshots: `npm run build-storybook && CHROMATIC_PROJECT_TOKEN=... npx chromatic --only-changed --storybook-build-dir=storybook-static` (skipped if token is unset).
- CI runs Chromatic only on push when a token exists, using the prebuilt Storybook to keep PR runs light.
- Local visual check (no publish): `npm run build-storybook && npx chromatic --only-changed --storybook-build-dir=storybook-static --dry-run` to generate snapshots locally without uploading.
- Optional OpenAI scratchpad: set `VITE_OPENAI_API_KEY` (and optional `VITE_OPENAI_BASE`) to enable the GPT-5-nano helper in the Filters panel; it uses `callOpenAIChat` with model name `gpt-5-nano` by default.
- Dev proxy: Vite proxies `/api` to `http://localhost:8000` so you can avoid CORS in local dev; set `API` field to `/api` (default) or point to your backend directly if you prefer.
- Uploads: `POST /docs` with multipart; defaults to field `file` (override via `VITE_UPLOAD_FIELD`). UI sends `X-API-Key`.
Note: map overlays for BC layers require you to build `Geo/bc_interior/*.geojson` locally via
`python scripts/download_geo_data.py` + `python scripts/filter_bc_interior.py`.

## Shortcuts & frame behavior

- Review navigation: `j`/`→` next, `k`/`←` previous (when not focused in a form).
- Frame applies theme/period filters; optional dimming mutes out-of-frame docs (map + list).
- Confidence/pages badges toggle in Filters; legend pills show meaning of chips.
- Guided tour: opens on first load (per version) and can be reopened via “Guided tour” in Filters; anchored to filters/documents/workspace/inspector/wizard with highlights and scroll-to.
- Map custom layer import: GeoJSON supported (persists name/data); KML inline conversion; KMZ unzips first KML entry. Clear/reset available in Map controls.

## Smoke testing locally

1. `npm run preview -- --host --port 4173` (or use `npm run test:smoke:preview`)
2. In another shell: `npm run test:smoke` (set `PLAYWRIGHT_BASE_URL` if not `http://localhost:4173`).

CI: GitHub Actions (`.github/workflows/frontend-ui.yml`) runs `npm run test:smoke:preview` before the mocked E2E suite.
Optional: If `PLAYWRIGHT_BASE_URL` is set in CI, it will also run `npm run test:smoke:live` against that URL.
