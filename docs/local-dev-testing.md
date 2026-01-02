# Local Development & Testing — Pukaist Engine

This note captures realistic goals and workflows for local development, with an emphasis on tests that can be run without external dependencies.

## Goals for Local Dev

- Be able to:
  - Start API + worker locally against the default SQLite/filesystem layout.
  - Run the full test suite (`make test`) without needing network access or real LLM credentials.
  - Exercise key scenarios manually via the web console (`docs/web-demo.html` or `frontend/index.html`).
- Keep tests:
  - Fast enough to run frequently during development.
  - Deterministic and independent of external services by default.

## Core Commands

- Setup:
  - `python3 -m venv .venv && source .venv/bin/activate`
 - `make install`
- API:
 - `make api` (FastAPI @ `http://localhost:8000`)
- Worker:
 - In another shell: `make worker`
- Tests:
 - `make test` (runs `pytest` with `PYTHONPATH=.`)
- Demo starter:
 - `make demo` (seeds a throwaway workspace, runs a single ingest cycle, and prints next steps to start the API + console + embeds).
- Project config wizard:
 - `make project-config` (creates `projects/demo.json` via a short Q&A, capturing intents/prefilters/limits)
- Persistence toggles (for future Postgres prep; no dependency today):
 - `.env.example` includes `PUKAIST_DB_DRIVER` (default `sqlite`) and `PUKAIST_DB_URL` placeholders. Keep them unset/`sqlite` for local dev; Postgres wiring follows the design in `docs/persistence-postgres-migration.md`.
- OCR (optional):
 - Enable via `PUKAIST_OCR_ENABLED=true` (default backend: `pytesseract`; deps installed via `requirements.txt`). Default allowed extensions now include common images (jpg/jpeg/png/tif/tiff/bmp/webp) plus txt/pdf/docx.
- Optional Hunyuan backend (`PUKAIST_OCR_BACKEND=hunyuan`) requires extra GPU-heavy deps (vLLM/transformers); install separately if needed.
  - GPU/Hunyuan note: vLLM + torch + transformers are installed in `.venv` here for GPU use. To exercise Hunyuan OCR locally:
    - `source .venv/bin/activate`
    - `export PUKAIST_OCR_ENABLED=true`
    - `export PUKAIST_OCR_BACKEND=hunyuan`
    - (Option A) In-process path (heavy): `python -m scripts.ocr_smoke` (first run downloads weights).
    - (Option B) External vLLM server (recommended): start a server with GPU-safe headroom, e.g. `nohup vllm serve tencent/HunyuanOCR --host 0.0.0.0 --port 8000 --dtype bfloat16 --max-model-len 18000 --gpu-memory-utilization 0.6 --no-enable-prefix-caching --mm-processor-cache-gb 0 > 99_Working_Files/Logs/hunyuan_vllm.log 2>&1 &` (adjust `--gpu-memory-utilization` or `--max-model-len` downward if VRAM is tight). Then set `PUKAIST_HUNYUAN_OCR_BASE_URL=http://localhost:8000/v1 PUKAIST_HUNYUAN_OCR_API_KEY=EMPTY` and run `python -m scripts.ocr_smoke`. Stop the server later with `pkill -f "vllm serve tencent/HunyuanOCR"`.
  - Generate sample assets: `python scripts/make_ocr_sample.py` writes an OCR-ready PNG/PDF to `99_Working_Files/Incoming`.
- Relevancy scoring (optional, off by default):
  - Enable with `PUKAIST_RELEVANCY_ENABLED=true` and set `PUKAIST_RELEVANCY_TARGETS` (CSV of keywords/phrases). Defaults to heuristic scoring; if LLM is online, it will use `PUKAIST_RELEVANCY_MODEL` (fallback to `PUKAIST_LLM_MODEL`) for a JSON score/rationale.
  - Use `python scripts/relevancy_wizard.py --name my-project` to collect targets (optionally ask the LLM to suggest related keywords) and write `projects/my-project-relevancy.json`.
  - Relevancy results are embedded in artifacts as `{score, rationale, tags}` and shown in the UI panels.

## Test Coverage (Local-Only)

The existing test suite covers:

- **Metadata & validation**
  - `tests/test_metadata_validate.py`
    - Metadata inference (doc_type, inferred_date).
    - Validation and error summarization.
- **Worker flagged path**
  - `tests/test_e2e_flagged.py`
    - Ingest of a small invalid document.
    - Task is flagged; last_error and job status are set appropriately.
    - Now also exercises basic tenant scoping for jobs/tasks.
- **Multi-tenant storage & search**
  - `tests/test_multi_tenant.py`
    - Jobs/tasks are tagged with the default tenant.
    - Search is correctly scoped by `tenant_id` (docs are visible only to the right tenant).
- **Batch helpers & LLM insights toggles**
  - `tests/test_batch_and_llm_insights.py`
    - `batch_llm.prepare_batch_jsonl` / `ingest_summaries` paths.
    - Ensures `LLMClient.extract_insights` is not called when offline is forced, even if insights are enabled.
- **API-level multi-tenant isolation**
  - `tests/test_api_multi_tenant.py`
    - Uses unsigned JWTs with tenant claims against `/upload` and `/search`.
    - Verifies that tenant-specific searches do not leak data across tenants.
- **Logs API**
  - `tests/test_logs_api.py` tails `api.log`/`worker.log` via `/logs`.
- **Frontend (mocked Playwright + Storybook)**
  - `npm run test:e2e:serve -- tests/pipeline.spec.ts tests/map.spec.ts tests/artifact.spec.ts tests/logs.spec.ts tests/jobs.spec.ts`
  - `npm run build-storybook`
  - CI workflow `.github/workflows/frontend-ui.yml` mirrors this and uploads Playwright artifacts; set `CHROMATIC_PROJECT_TOKEN` in repo secrets to enable visual baselines via `npm run chromatic`.

All of these tests run locally with:
- `PUKAIST_LLM_OFFLINE=true` by default.
- No external network calls or real LLM keys required.

## Manual Scenarios (Recommended)

1. **Offline ingest → search → map**
   - Start API and worker locally.
   - Use `docs/web-demo.html`, `docs/map-embed.html`, or `frontend/index.html` to:
     - Upload a few `.txt` or `.pdf` documents.
     - Check job status and flagged tasks.
     - Run searches and view the GeoJSON map.
   - Inspect:
     - `99_Working_Files/Incoming` for raw uploads.
     - `99_Working_Files/Evidence_Staging` for JSON artifacts.
     - `01_Internal_Reports/Refined_<theme>.md` for notebooks.

1b. **Drop-folder intake**
   - Instead of using the upload endpoint, copy or save files directly into the configured incoming directory (default `99_Working_Files/Incoming`).
   - Run `make intake-scan` (or `PYTHONPATH=. python scripts/intake_scan.py --theme YOUR_THEME`) to enqueue any new files and create jobs/tasks.
   - Start or restart the worker to process the newly enqueued tasks.

1c. **Prefilter scan (LLM cost awareness)**
   - After staging text is created (e.g., after running the worker in batch mode without summaries), run `make prefilter-scan` (or `PYTHONPATH=. python scripts/prefilter_scan.py`) to see how many staged docs would be sent to the LLM based on `PUKAIST_PREFILTER_KEYWORDS` and `PUKAIST_PREFILTER_MIN_CHARS`.
   - Adjust those envs to reduce LLM calls for irrelevant or too-short documents.

1d. **Project intent & limits**
   - Run `make project-config` and answer the prompts to generate `projects/<name>.json` capturing:
     - Allowed extensions / size caps.
     - Prefilter keywords / min chars.
     - LLM mode (sync/batch), batch limits, and whether to enable LLM summaries/insights.
     - Optional tenant/theme and per-run doc caps.
   - Use this config to guide your intake and processing runs (copy values into your env or use as reference).
   - Set `PUKAIST_PROJECT_CONFIG=projects/<name>.json` to apply the project config at runtime (overrides allowed_exts, max_upload_mb, prefilters, LLM mode/insights, default theme, max_docs_per_run, and tenant if provided).

2. **Batch summarization (offline-friendly)**
   - With API + worker running, ingest a set of docs with `PUKAIST_LLM_MODE=batch`.
   - Run:
     - `python -m src.batch_llm prepare --limit 10`
     - Inspect the generated JSONL under `workspace_skeleton/batches/`.
   - Craft a small fake results JSONL and run:
     - `python -m src.batch_llm ingest path/to/results.jsonl`
   - Confirm that summaries appear in search results and notebooks.

3. **Multi-tenant simulation**
   - Start API with OIDC envs set and different JWT tokens in a tool like `curl` or Postman.
   - Upload different docs under different tenant claims.
   - Confirm via `/search`, `/jobs`, and `/geojson` that tenants see only their own data.

These scenarios, combined with `make test`, provide realistic and repeatable goals for local development without requiring external infrastructure or live LLM calls.
