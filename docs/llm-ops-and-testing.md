# LLM Ops & Testing — Pukaist Engine

This note describes how to operate and validate the LLM layer (GPT‑5 / GPT‑5‑nano family) for the Pukaist Engine in a local‑first, cost‑aware way.

## Goals
- Keep ingestion and indexing fully functional without any LLM configured.
- When enabled, support both per‑document (sync) and batch summarization using OpenAI‑compatible chat completions.
- Make GPT‑5‑nano a first‑class option for large runs by leaning on the Batch API, while keeping auditing and validation local.

## Configuration Overview
- Core envs (see `.env.example`):
  - `PUKAIST_LLM_OFFLINE` — `true` to disable remote calls and use heuristic summaries; `false` to call a provider.
  - `PUKAIST_LLM_PROVIDER` — typically `openai`.
  - `PUKAIST_LLM_MODEL` — e.g. `gpt-5`, `gpt-5-nano`.
  - `PUKAIST_LLM_BASE_URL` — e.g. `https://api.openai.com`.
  - `PUKAIST_LLM_API_KEY` — API key (never commit this).
  - `PUKAIST_LLM_MODE` — `sync` for per-doc calls, `batch` to skip worker LLM calls and use the batch helper.
- Limits/tuning (per model):
  - `PUKAIST_LLM_INPUT_MAX_CHARS` — maximum characters sent to the model (trimmed after PII redaction).
  - `PUKAIST_LLM_MAX_TOKENS` — `max_tokens` for summaries.
  - `PUKAIST_LLM_TEMPERATURE` — temperature; keep low (0.1–0.2) for factual summaries.
  - `PUKAIST_LLM_INSIGHTS_ENABLED` — when `true`, enables an additional structured extraction call to enrich `insights` with topics/entities/risks.
  - `PUKAIST_PREFILTER_KEYWORDS` — comma-separated keywords; if set, LLM calls are skipped unless at least one keyword appears in the text (case-insensitive).
  - `PUKAIST_PREFILTER_MIN_CHARS` — minimum content length required before LLM calls; shorter docs are skipped to save cost.
  - `PUKAIST_OCR_ENABLED` — enable OCR for image files (PNG/JPG/TIFF) when extraction is needed.
  - `PUKAIST_OCR_BACKEND` — `pytesseract` (default lightweight OCR) or `hunyuan` to use the HunyuanOCR VLM backend when installed.
  - Hunyuan OCR needs a C compiler (e.g., `build-essential`) for vLLM/Triton compilation.
  - `PUKAIST_HUNYUAN_OCR_MODEL`, `PUKAIST_HUNYUAN_OCR_MAX_TOKENS` — advanced OCR tuning; override the Hunyuan model name and generation length when using the `hunyuan` backend. Default max tokens is now **16384** (matching official examples). The API path uses `repetition_penalty=1.05` to prevent degenerate loops on handwritten text.
  - **Auto-Context Mode** — Enabled by default. Uses a two-pass workflow: (1) Scout entities, (2) Transcribe with context. Scientifically tested to improve accuracy from 70% to 84%. Disable with `PUKAIST_OCR_AUTO_CONTEXT=false`.
  - PDF pages are converted at **400 DPI** and preprocessed with **CLAHE contrast enhancement** before OCR for improved accuracy on handwritten and historical documents.
  - `PUKAIST_OCR_CONTEXT` — Optional manual context to further improve proper noun accuracy. Example: `"Archive of Dr. Franz Boas at Columbia University."`. Supplements the automatic context extraction.
  - `PUKAIST_EMBEDDINGS_ENABLED`, `PUKAIST_EMBEDDINGS_PROVIDER`, `PUKAIST_EMBEDDINGS_MODEL`, `PUKAIST_EMBEDDINGS_DIM` — toggles/config for embeddings/hybrid search; keep disabled by default unless you add a provider. When enabled with the KaLM helper, set:
    - `PUKAIST_EMBEDDINGS_ENABLED=true`
    - `PUKAIST_EMBEDDINGS_BASE_URL=http://localhost:8080`
    - `PUKAIST_EMBEDDINGS_MODEL=tencent/KaLM-Embedding-Gemma3-12B-2511`
    - Install local deps: `pip install -r requirements-embeddings.txt` (or `pip install '.[embeddings]'`)
    - Smoke test: `python scripts/embeddings_smoke.py`
    - Prompting: the local KaLM server honors `input_type` (`query`/`document`) and optional overrides via `KALM_QUERY_PROMPT`, `KALM_DOCUMENT_PROMPT`, or `KALM_EMBEDDING_PROMPT`.
  - `PUKAIST_ROLES_CLAIM`, `PUKAIST_ROLE_ADMIN`, `PUKAIST_ROLE_INGEST`, `PUKAIST_ROLE_VIEWER` — enable role-aware behavior (e.g., restrict uploads/ops to ingest/admin) in JWT/OIDC deployments; no effect in API-key-only dev mode.
- For GPT‑5‑nano specifically:
  - It offers a large context and high max output, but summarization rarely needs the full limits; tune `PUKAIST_LLM_INPUT_MAX_CHARS` and `PUKAIST_LLM_MAX_TOKENS` to comfortable, cost‑effective values rather than pushing the absolute maxima.
  - Example starting point (adjust based on the latest docs and your use case):
    - `PUKAIST_LLM_MODEL=gpt-5-nano`
    - `PUKAIST_LLM_INPUT_MAX_CHARS=200000`  (ample room for long reports, still well under the 400k context in practice)
    - `PUKAIST_LLM_MAX_TOKENS=2048`        (enough for rich summaries without excessive cost)
    - `PUKAIST_LLM_TEMPERATURE=0.1`        (low drift, factual tone)

## Mode 1 — Sync Summaries (Per Document)
- Set `PUKAIST_LLM_OFFLINE=false` and `PUKAIST_LLM_MODE=sync`.
- Behavior:
  - Worker extracts text, validates metadata, redacts PII, then calls chat completions once per task using `LLMClient`.
  - Summary is written into the search index and theme notebook as part of the normal worker run.
- When to use:
  - Local development and small batches where latency and per‑request pricing are acceptable.
  - Quick experiments with prompts or different GPT‑5‑series models.

## Mode 2 — Batch Summaries (GPT‑5‑nano Friendly)
- Set `PUKAIST_LLM_OFFLINE=false` and `PUKAIST_LLM_MODE=batch`.
- Behavior:
  - Worker never calls the LLM; it indexes documents with `summary` set to `NULL`.
  - Docs needing summaries are discoverable via `search_index.list_pending_summaries`.
- Batch workflow:
  1. **Prepare JSONL for Batch API**
     - Run: `python -m src.batch_llm prepare --limit 1000`
     - Output: `workspace_skeleton/batches/chat_batch_<timestamp>.jsonl`
       - Each line is a JSON object:
         - `custom_id`: `"doc-<id>"`
         - `method`: `"POST"`
         - `url`: `"/v1/chat/completions"`
         - `body`: standard chat payload with `model`, `messages`, `temperature`, `max_tokens`.
  2. **Submit to provider Batch API**
     - Use your infra or a small wrapper script to:
       - Upload the JSONL to the provider’s Batch endpoint (e.g. OpenAI `/v1/batch` for GPT‑5‑nano).
       - Wait for completion and download the raw batch output.
  3. **Transform & Validate**
     - Convert the provider’s batch result into a JSONL mapping of the form:
       - `{"doc_id": 123, "summary": "..."}` per line.
     - During this step you can:
       - Enforce length and content checks on the summary.
       - Drop/flag any outputs that look malformed or unsafe.
  4. **Ingest Summaries**
     - Run: `python -m src.batch_llm ingest path/to/validated_summaries.jsonl`
     - This will:
       - Update `docs.summary` in the search index for each `doc_id`.
       - Append a “Batch LLM summary” section into the appropriate `Refined_<theme>.md` notebook.

## LLM Testing Strategy
- Core principles:
  - Do not depend on live external LLM calls in automated tests or CI.
  - Keep automated tests focused on:
    - Text extraction, metadata inference, validation, PII redaction, queue/worker plumbing, and index behavior.
    - The offline heuristic summary path (no network).
  - Treat live LLM behavior as an integration concern, exercised via explicit scripts and manual runs.
- Recommended layers:
  1. **Unit Tests (no network)**
     - Validate:
       - That `LLMClient` builds the expected JSON payload given settings (via dependency injection of a fake HTTP client, if desired).
       - That `batch_llm.prepare_batch_jsonl` produces the expected JSONL records for synthetic docs.
       - That `batch_llm.ingest_summaries` updates summaries and notebooks correctly when given a controlled JSONL file.
     - These tests operate entirely on in‑memory or temporary SQLite DBs and local files.
  2. **Local Integration Checks (optional)**
     - With a real API key in a developer machine (never in CI):
       - Run a small set of example documents through:
         - Sync mode (`PUKAIST_LLM_MODE=sync`).
         - Batch mode (`prepare` → manual Batch submission → `ingest`).
       - Manually review generated summaries and notebooks.
  3. **Monitoring in Real Use**
     - Use logs and metrics (e.g. counts of docs with/without summaries, task durations) to watch for:
       - Sudden increases in flagged tasks or missing summaries.
       - Unexpectedly long summarization times or batch sizes.

## Operational Notes
- Always keep `PUKAIST_LLM_OFFLINE=true` in shared dev environments unless you explicitly need to exercise a remote provider.
- When switching between GPT‑5 and GPT‑5‑nano:
  - Update `PUKAIST_LLM_MODEL` and the limit envs; the rest of the pipeline does not change.
- For large ingestion waves:
  - Prefer `PUKAIST_LLM_MODE=batch` with GPT‑5‑nano and the Batch API to take advantage of lower batch pricing.
  - Keep the JSONL inputs/outputs under version control or archived for audit and reproducibility (but never commit secrets).
