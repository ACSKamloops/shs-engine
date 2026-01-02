# Agent Playbook — Pukaist Engine

Purpose: keep contributors aligned while we build a **local-first, modular ingestion engine** that can later plug into a website. Use this alongside `MASTER_PLAN.md` for roadmap checkboxes.

## Working Context
- Local dev only: prefer filesystem + SQLite; design cloud swaps via config, not code changes.
- Do not delete or overwrite source uploads; stage outputs alongside provenance.
- Keep changes incremental and observable (logs + task/job status). Avoid broad “cleanup” without a backup.
- When using LLMs, enforce schema validation and fallbacks; never ship unchecked output.
- Maintain the action log: append each meaningful change to `ACTION_LOG.md` (newest first) for auditability.
- Keep the “Current Sprint (Local realism)” section in `MASTER_PLAN.md` in sync with reality; no placeholders except the explicit manual LLM test areas.
- Surface diagnostics in-UI: use the Logs panel (backs `/logs`) for quick tail of `api.log`/`worker.log`, and add Storybook stories for new UI pieces (map controls, pipeline panels, upload/search) to keep visuals testable without hardcoding data.
- CI/visuals: set `CHROMATIC_PROJECT_TOKEN` in GitHub secrets to enable Chromatic uploads in `.github/workflows/frontend-ui.yml` (Playwright artifacts are uploaded automatically).

## Canonical Paths (local)
- `99_Working_Files/Incoming` — raw uploads.
- `99_Working_Files/Evidence_Staging` — extracted text/metadata.
- `99_Working_Files/Logs` and `queue.db` — operational data.
- `01_Internal_Reports/Refined_*` — markdown notebooks per theme.
- `Evidence_Index` — search/geo database (SQLite FTS + GeoJSON export).

## Workflow Rules
- Start with the roadmap: update checkboxes in `MASTER_PLAN.md` as you land features; avoid leaving dangling “placeholder” items except where LLM tests must stay manual/limited.
- Document config defaults in `.env.example`; never hardcode secrets or absolute paths.
- After each change: lint/test what you touched, sanity-run a local ingest → search path, and capture issues in the plan.
- For every material change, append an entry to `ACTION_LOG.md` (newest-first) describing what changed and how to validate it.
- Flagging: if a task cannot be validated, mark it flagged with a reason (do not drop it).
- Web integration: keep REST/SDK contracts single-sourced (OpenAPI → clients); ensure CORS/rate limits fit embedded use.

## Change Checklist (per contribution)
- [ ] Update relevant checkboxes in `MASTER_PLAN.md` to reflect what was actually delivered.
- [ ] Append a concise entry to `ACTION_LOG.md` (newest first) capturing what changed and how to validate it.
- [ ] Keep `.env.example`, `docs/deploy-local.md`, and `docs/llm-ops-and-testing.md` in sync with any config/LLM changes.
- [ ] For web/UI changes, verify `docs/web-demo.html` and `docs/embed-widget.html` still work against the local API.
- [ ] Re-run the console hybrid search and geo flows after UI changes (search/doc detail/map) to ensure no broken handlers.

## LLM & Validation
- Default to offline mode; require explicit opt-in for remote providers.
- Prompts and schemas live in-repo; version them. Validate LLM output before writing to disk or indexes.
- Keep token limits config-driven via env (`PUKAIST_LLM_INPUT_MAX_CHARS`, `PUKAIST_LLM_MAX_TOKENS`, `PUKAIST_LLM_TEMPERATURE`) so models like OpenAI series 5 / `gpt-5-nano` can be tuned without code changes.
- Redact or truncate sensitive data before sending to any external model.
- Prefer batch APIs (where available, e.g. GPT-5 nano Batch) for large-scale summarization to reduce cost; wire them in via separate scheduler/ingestor components rather than coupling batches directly into the main worker loop.
- When testing GPT-5 series locally, prefer the cheaper `gpt-5-nano` via batch/offline stubs; keep token/timeout limits tuned via env, not hard-coded.

## Web UI & Embeds
- Treat `docs/web-demo.html` as a reference-only console for local dev; production UIs should consume the REST API and SDK the same way but can live in separate repos/apps.
- When extending the demo, avoid embedding business logic in the frontend; keep it a thin client over the documented API.
- For a dedicated frontend app (see `docs/frontend-app-design.md`), keep auth/config surfaces explicit and avoid duplicating validation or business rules that already exist in the API.

## Multi-Tenant & Auth (future)
- If/when tenant identifiers are added, ensure every DB table that stores user data is keyed by tenant and that queries are scoped accordingly (see `docs/multi-tenant-design.md`).
- Do not assume a single global API token or audience once multi-tenant deployments are considered; keep issuer/audience/tenant mapping explicit in config and docs and prefer deriving tenant IDs from JWT claims when OIDC is enabled (see `docs/tenant-onboarding.md` for onboarding and role considerations).
 - When introducing role-based authorization, keep checks coarse-grained (endpoint-level) and driven by JWT claims as per `docs/roles-and-authz.md`; do not replicate complex policy engines inside this service.

## Persistence & External DBs (future)
- When introducing Postgres or other external DBs, follow the design in `docs/persistence-postgres-migration.md` and keep SQLite as the default for local/dev.
- Prefer a repository abstraction over direct SQL in API/worker code so swapping DB backends does not change higher-level logic.

## Storage Backends (future)
- For multi-node or cloud deployments, consider shared filesystems or object storage as described in `docs/storage-shared-object.md`.
- Keep the logical layout (`Incoming`, `Evidence_Staging`, `Evidence_Index`) stable even if the underlying storage is swapped via configuration.

## Intake, Prefiltering, and Cost Control
- Use per-project configs (`scripts/project_config_wizard.py`, `projects/<name>.json`) to capture allowed extensions, prefilters, LLM mode/limits, and tenant/theme before processing.
- Run prefilter scans (`make prefilter-scan`) to estimate how many staged docs will hit the LLM under current keywords/min-length settings.
- For drop-folder workflows, use `make intake-scan` to enqueue new files from the incoming directory; keep worker prefilter checks enabled to avoid unnecessary LLM calls.

## Local Dev Quick Start

**Activate venv:**
```bash
cd /home/astra/work/pukaist-engine
source .venv/bin/activate
```

**Start API (dev auth disabled):**
```bash
PUKAIST_AUTH_DISABLED=true PYTHONPATH=. uvicorn src.api:app --reload --port 8000
```

**Start Worker (background, with OCR):**
```bash
PUKAIST_AUTH_DISABLED=true PUKAIST_OCR_ENABLED=true PUKAIST_OCR_BACKEND=pytesseract PYTHONPATH=. nohup python3 -m src.worker > /tmp/pukaist_worker.log 2>&1 &
```

**Optional env vars:**
- `PUKAIST_OCR_BACKEND=hunyuan` — GPU-based OCR for low-quality scans (escalation)
- `PUKAIST_LLM_OFFLINE=false` + LLM key/model envs — enables summaries/insights

**Verify services:**
```bash
curl -s http://localhost:8000/docs | head -5
tail -f /tmp/pukaist_worker.log
```

**Frontend assumptions:**
- API base: `/api` (proxied to `http://localhost:8000`)
- Auth header: `X-API-Key: dev-token`
- Upload field: `file` (override with `VITE_UPLOAD_FIELD`)

**Key endpoints:**
- `POST /api/docs` — multipart file upload
- `GET /api/docs` — list documents
- `GET /api/docs/:id` — get single document
- `GET /api/docs/:id/artifact` — get artifact
- `GET /api/docs/:id/file` — get original file

**Working directories (must be writable):**
- `99_Working_Files/Incoming` — raw uploads
- `99_Working_Files/Evidence_Staging` — artifacts land here

## Handoff Notes
- Master roadmap: `MASTER_PLAN.md` (checkboxes by workstream).
- Planning artifacts live in this directory; code/infra can be added next to it as we build out. LLM‑specific ops and testing guidelines live in `docs/llm-ops-and-testing.md`.
- Keep commit messages/notes explicit (what changed, why, how to validate).
- Append meaningful entries to `ACTION_LOG.md` (newest first) to audit changes and decisions.
 - For local development and real testing scenarios, follow `docs/local-dev-testing.md` and ensure new tests remain offline-friendly by default.
- For Phase 2 work (section 15 in `MASTER_PLAN.md`), keep changes incremental and validated against the existing local-first constraints before introducing external DBs or more complex frontends.
