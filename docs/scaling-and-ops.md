# Scaling & Production Ops — Pukaist Engine

This note describes how to think about running Pukaist Engine beyond local, single-node development: topology, scaling, and operational runbooks.

## Recommended Topology (First Production Step)

For an initial production-like deployment:

- **API service**
  - One FastAPI/uvicorn instance fronted by your preferred HTTP reverse proxy or load balancer (e.g., Nginx, Envoy).
  - Responsible for auth, uploads, status/search, webhooks, and metrics.
- **Worker processes**
  - One or more stateless workers running `python -m src.worker`, sharing the same queue DB and filesystem or shared storage.
  - Horizontal scale: add more worker processes or containers as ingestion volume increases.
- **Storage**
  - **Queue/metadata DB**:
    - For small deployments, SQLite with WAL mode (as in the current design) is acceptable.
    - For higher concurrency or multi-node deployments, plan to migrate queue and jobs to a managed relational DB (e.g., Postgres) and adapt `queue_db`/`job_store` accordingly.
  - **File storage**:
    - Local filesystem mounts for raw uploads and staging (`99_Working_Files`) are fine for single-node and simple Docker setups.
    - For multi-node, use shared/network storage or object storage with a consistent path mapping.
- **Observability**
  - Logs from API and worker should be shipped to your central logging system.
  - Metrics endpoint (`/metrics`) should be scraped by a monitoring system or logged for later analysis.

## Scaling Considerations

- **API**
  - The API is stateless; it can be horizontally scaled behind a load balancer as long as:
    - All instances share the same DB and storage.
    - Auth and CORS settings are consistent across instances.
- **Workers**
  - Multiple workers are safe because `lease_one` uses a DB-level update + select pattern to lease tasks.
  - The visibility timeout ensures that tasks are re-queued if a worker dies mid-processing.
  - Ensure workers and API use the same queue DB and index paths.
- **LLM Usage**
  - For high-volume summarization, prefer the Batch API (via GPT-5-nano) rather than per-document sync calls.
  - Control LLM usage and cost via:
    - `PUKAIST_LLM_MODE` (sync vs batch),
    - `PUKAIST_LLM_INPUT_MAX_CHARS`,
    - `PUKAIST_LLM_MAX_TOKENS`,
    - `PUKAIST_LLM_TEMPERATURE`.

## Backup & Restore

- **What to back up**
  - Queue/metadata DB (`99_Working_Files/queue.db` or external DB).
  - Search index (`99_Working_Files/Evidence_Index/index.db`) and associated AOI store.
  - Uploaded files and staging (`99_Working_Files/Incoming`, `99_Working_Files/Evidence_Staging`).
  - Refined reports (`01_Internal_Reports`).
  - Configuration (`.env` or equivalent deployment environment).
- **Backup strategy**
  - Snapshot the DB(s) regularly (e.g., volume snapshots or DB-native backups).
  - Mirror the filesystem directories above to durable storage.
  - Keep configuration backups separate from data.
- **Restore strategy**
  - Restore DB and filesystem snapshots to a new environment.
  - Redeploy API and worker with the same configuration.
  - Use `/index/rebuild` if needed to reconstruct the index from staged `.txt` files.

## Key Rotation

- **API tokens**
  - Rotate `PUKAIST_API_TOKEN` in coordination with clients that use `X-API-Key`.
  - Prefer short-lived usage of API keys and move toward OIDC/JWT for multi-tenant deployments.
- **JWT / OIDC**
  - Rely on your IdP for key rotation; the engine uses `PUKAIST_OIDC_ISSUER`, `PUKAIST_OIDC_AUDIENCE`, and `PUKAIST_OIDC_JWKS_URL` to validate tokens against the current JWKS.
  - Ensure JWKS caching behavior (if added later) respects key rotation timelines.
- **LLM & Webhook tokens**
  - Rotate LLM API keys (`PUKAIST_LLM_API_KEY`) and webhook tokens (`PUKAIST_WEBHOOK_TOKEN`) regularly.
  - When rotating, overlap old and new tokens for a brief period if you have external dependencies (e.g., existing webhook senders).

## Incident Response (High Level)

- **Data issues (corruption/inconsistency)**
  - Stop workers to prevent further writes.
  - Use backups to restore DBs and/or filesystem as needed.
  - Use `queue_admin` scripts to inspect and potentially rerun flagged tasks.
- **Performance/capacity issues**
  - Scale out workers first to reduce queue backlogs.
  - If DB contention appears (especially on SQLite), consider:
    - Increasing DB resources/IO.
    - Migrating queue and job tracking to a managed relational DB.
- **Security incidents**
  - Immediately rotate API tokens, JWT secrets/keys (via your IdP), LLM API keys, and webhook tokens.
  - Review logs under `99_Working_Files/Logs` and any central logging for anomalous access.
  - If tenant boundaries are a concern, confirm that tenant scoping is correctly configured (`PUKAIST_TENANT_CLAIM` in multi-tenant deployments).

This document contributes to the “Scaling & Production Ops” workstream in `MASTER_PLAN.md` by describing an initial topology and providing runbooks for backup/restore, key rotation, and incident handling. Further code-level tuning (DB/HTTP pooling and timeouts) can be added as the next incremental step.

