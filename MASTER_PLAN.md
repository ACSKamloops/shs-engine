# Pukaist Engine — Master Plan (Local-First)

This plan keeps the Pukaist Engine scoped for **local development first**, with clear steps to make it **modular**, **web-integrable**, and **ready to scale** once we move off localhost. Checkboxes track delivery; update them as work lands.

## Goals & Non-Negotiables
- [x] Project workspace and planning docs created for local dev.
- [x] Clean, modular architecture that works offline first but can swap in cloud services (env-driven for LLM/auth; SQLite/filesystem).
- [x] Website-friendly integration (REST + SDK/webhooks) for uploads and results.
- [x] File → text → structured insights pipeline with user-defined “useful info”.
- [x] Geospatial hints surfaced (coords/places → AOI overlays/GeoJSON).
- [x] Pluggable LLMs (OpenAI-compatible or local) with guardrails and fallbacks (offline-safe default; env-driven).
- [x] Observability, reproducibility, and auditability built in from day one (metrics, action log, readiness, logging).
- [x] Realistic local dev workflows and tests that can be run without external dependencies (see `docs/local-dev-testing.md`).

## Architecture Blueprint (proposed)
- **Gateway/API**: FastAPI (or similar) with token auth (dev), request caps, CORS, rate limits; endpoints for upload, job status, search, GeoJSON, webhooks.
- **Storage layout (local)**:
  - `99_Working_Files/Incoming` (raw uploads), `Evidence_Staging` (text/metadata), `Evidence_Index` (FTS/geo DB), `01_Internal_Reports` (refined markdown), `Logs`, `queue.db`.
- **Queue + Jobs**: Lightweight SQLite-backed queue with leasing, retries, flags, and job/task linkage so web UI can poll status.
- **Workers**: Stateless processors that:
  - Extract text/metadata (title/date/provenance/doc type/theme/user hints).
  - Run rule-based validators; call LLM for classification/summarization when enabled.
  - Emit structured JSON + Markdown and push to search/geo index.
  - Flag/skip on validation failure; never drop tasks silently.
- **LLM connectors**: Adapter layer for OpenAI-compatible HTTP + local models; strict prompts + schema validation + redaction.
- **Search & Geo**: SQLite FTS for text; place/coordinate extraction (regex + gazetteer) to GeoJSON; AOI overlays by theme/job.
- **Integration surfaces**: REST/CLI + TypeScript SDK + optional webhook callbacks; signed upload URLs if/when storage goes remote.
- **Security & governance**: Token auth (dev), request size/extension allowlist, content hashing, audit logs, PII guardrails, redactable outputs.

## Roadmap (checkboxes are deliverables)

## Current Sprint (Local realism)
- [x] Stabilize the web console event wiring (hybrid search handler inside script; JS-only, no TS types leaking into the browser bundle).
- [x] Add upload dedupe/hash manifest persisted alongside staging entries so re-uploads reuse prior work and costs stay bounded.
- [x] Make the console role-aware: hide upload/ops actions when only viewer roles are present and surface `/whoami` tenant/role info inline.
- [x] Add a reproducible local test flow (script + doc) that walks intake-scan → worker (prefilter on) → hybrid search/map with a sample project config.
- [x] Surface project-intent settings (allowed_exts, prefilter, LLM mode) in the console UI so intake choices are not hard-coded and can be toggled per run; pass intent to the backend per upload.

## Next Sprint (Web polish & filters)
- [x] Add search/doc result badges (status/source) driven by API fields, keeping logic server-side and formatting client-side only.
- [x] Expose server-side search filters (theme/doc_type/tenant) to reduce payloads for large datasets; update SDK/console accordingly.
- [x] Add a slim API test for task filters (status/theme/intent) combined with multi-tenant headers to guard the new query params.
- [x] Add API test for search filters (theme/doc_type) under tenant scoping.
- [x] Add API test for docs filters/status to ensure status is present when filtering by theme/doc_type.
- [x] Add a smoke script that runs: intake-scan → worker → filtered `/tasks`/`/tasks/flagged` → search → doc detail, to validate non-hard-coded surfaces in one go.
- [x] Polish console layout (badge colors, spacing, mobile tweaks) while keeping it a thin client over the API/SDK.

### 1) Foundation & Repo
- [x] Create workspace directory and planning docs.
- [x] Initialize git repo, license, and minimal README.
- [x] Define env config (`.env.example`) with safe defaults for local-only use.
- [x] Standardize paths (`99_Working_Files/*`, `01_Internal_Reports/*`, `logs/`).
- [x] Base logging/metrics helpers (structured logs, req IDs, metrics endpoint, readiness).

### 2) Upload & Staging
- [x] REST upload with size/extension allowlist and theme/tag hints.
- [x] Hash manifest persisted per upload to support dedupe/reuse and reproducibility.
- [x] Optional `enqueue=true` parameter to immediately create queue tasks.
- [x] Local storage layout + cleanup policies; checksum manifest for reproducibility.
- [x] Text extraction pipeline (PDF/docx/txt) with per-source adapters and error reports, including docx and optional OCR for images when enabled.

### 3) Queue & Job Tracking
- [x] SQLite queue with lease/ack/retry/flag, visibility timeout, per-task reasons.
- [x] Job records linking uploads → tasks; status endpoints for UI polling.
- [x] Admin CLI to import/export queue, view flagged items, and rerun failures.

### 4) Processing & Validation
- [x] Metadata inference (title/date/provenance/doc type/theme/user fields).
- [x] Rule-based validators (required fields, max lengths, allowed themes).
- [x] LLM adapter + prompts (summaries) with offline fallback (online env-driven).
- [x] Markdown/JSON emitters with schema validation; store per-theme notebooks.

### 5) Search, Geo, and Insights
- [x] FTS index (SQLite) for content/metadata; evidence detail + snippets.
- [x] Geo extraction (coords regex, gazetteer lookup) → GeoJSON features.
- [x] AOI overlays per theme/job; endpoint to fetch map layers.
- [x] Rebuild/resync commands to keep index aligned with staging.

### 6) Web Integration & SDK
- [x] Public-facing REST contract documented (OpenAPI) for website integration.
- [x] Lightweight TS/JS SDK (upload, status poll, search, GeoJSON fetch, webhooks).
- [x] Webhook callbacks with signed secrets; retry/backoff strategy.
- [x] CORS/rate-limit defaults suitable for embedded widgets.

### 7) Security, Compliance, Ops
 - [x] Auth modes: dev token now; optional OIDC/JWKS guard via env; audit logging toggle.
 - [x] Redaction/PII guardrails before storage and before LLM calls (basic email/phone redaction before LLM).
- [x] Tests: unit for adapters/validators, e2e happy-path ingest → search.
- [x] Tooling: `make`/`tox` or `uv` tasks, Docker for local stack, seed data for demos.
- [x] Monitoring hooks (structured logs, metrics, readiness; OTEL stub in place).

### 8) LLM Config & Testing
- [x] Make LLM input/output limits (chars, `max_tokens`, temperature) config-driven via env so models like OpenAI series 5 / `gpt-5` / `gpt-5-nano` can be tuned without code changes.
- [x] Define and document a lightweight LLM testing strategy (mock client or manual scripts) that avoids real external calls in CI by default.

### 9) LLM Batch & Cost Optimisation
- [x] Add a config switch to choose per-document (synchronous chat completions) vs batch summarization mode for LLM calls.
- [x] Extend the data model so docs with `summary` missing are treated as `summary_pending` and can be listed for batch processing.
- [x] Implement a batch scheduler script/service that collects `summary_pending` docs and writes JSONL requests for `v1/chat/completions` (e.g. with `gpt-5-nano`) that can be consumed by the provider's Batch API.
- [x] Implement a batch result ingestor that maps batch outputs (after local validation) back to `doc_id`, updates `summary` safely, and appends to theme notebooks.
- [x] Document an operational runbook for when to use batches (and expected cost savings) vs per-doc calls, including how to tune `PUKAIST_LLM_INPUT_MAX_CHARS` / `PUKAIST_LLM_MAX_TOKENS` for GPT-5 nano.

### 10) Web Console & Embeds
- [x] Minimal static web demo (upload/search/docs/map) using REST API and configurable auth (`docs/web-demo.html`).
- [x] Add an embeddable JS/TS widget example (e.g., drop-in uploader/search panel) that can be integrated into existing sites using the SDK.
- [x] Improve UX for operational tasks (job/flagged views, AOI editing) and apply production-ready styling/theming.
- [x] Add Codex Hub in the admin console (version/features discovery, session resume, repo review, JSON events).

### 11) Multi-Tenant & Auth Hardening
- [x] Design a multi-tenant data model (tenant identifiers on jobs/tasks/docs) and isolation rules.
- [x] Extend auth to support per-tenant JWT claims (subject/tenant) and map them to stored data and API behavior.
- [x] Document tenant onboarding, API key/JWT issuance, and role model (admin vs read-only) for future environments.

### 12) Scaling & Production Ops
- [x] Document a recommended production topology (API + N workers, external DB/storage, logging/metrics stack).
- [x] Add configuration for DB and HTTP connection pooling/timeouts and outline how to scale workers safely.
- [x] Provide runbooks for backup/restore, key rotation, and incident response in a multi-instance deployment.

### 13) Domain-Specific Intelligence
- [x] Work with domain experts to define concrete “useful info” schemas and prompts (beyond generic summaries) and encode them as structured outputs.
- [x] Add classification/extraction prompts to the pipeline and persist extracted insights alongside summaries for search/filtering.
- [x] Provide example notebooks and search flows that showcase domain-specific analyses and map overlays.

### 14) Hardening & Tests
- [x] Add unit tests for core validation/metadata and worker flagged paths.
- [x] Add basic multi-tenant scoping tests for queue/jobs/index.
- [x] Add API-level tests for multi-tenant isolation and webhook callbacks.
- [x] Add tests for batch helpers and LLM insights toggles (offline vs online).

### 15) Phase 2 — Productization & Scale (Next Pass)
- [x] Frontend: design and implement a dedicated, branded web UI (separate app) that uses the existing API/SDK for uploads, search, map/AOI management, and flagged-task review.
- [x] Persistence: design a migration path from local SQLite to an external relational DB (e.g. Postgres) for queue/jobs/docs while keeping the current SQLite mode for local/dev.
- [x] Storage: document options for using a shared or object storage backend for uploads/staging, still honoring the local filesystem layout for dev.
- [x] Security: refine role-based access (e.g. admin vs read-only) based on JWT claims and expose minimal role-aware behavior in the API.
- [x] Intake cost control: add per-project intent/config (allowed_exts, prefilters, LLM mode/limits), drop-folder intake, and prefilter tools to minimize unnecessary LLM calls.

## Delivery Principles (local-first)
- Keep everything runnable offline (SQLite + local filesystem). Make cloud swaps configurable, not hard-coded.
- Prefer small, idempotent steps; never delete source uploads automatically.
- Validate before/after LLM; fail closed with clear reasons; surface flags to the UI.
- Log every transition (enqueue, lease, complete, flag) with request/task IDs.
- Keep prompts/versioning in-source to make results reproducible.
- Design SDK/REST once; avoid duplicating business rules across clients.
