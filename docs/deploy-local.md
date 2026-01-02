# Deploying Pukaist Engine (Local/Docker Compose)

This stack is local-first (SQLite + filesystem). The compose file runs two services: `api` and `worker` against shared volumes.

## Prereqs
- Docker + docker-compose
- Review `.env` (or copy `.env.local` → `.env`) and adjust as needed (tokens, CORS, optional LLM/auth).  
  `.env.example` is for Codex exec settings only.

## Run
- `docker-compose up --build`
- API: http://localhost:8000 (endpoints: /health, /health/ready, /upload, /tasks, /jobs, /search, /docs, /geojson, /aoi, /metrics)
- Worker runs alongside API, sharing `99_Working_Files` and `01_Internal_Reports` via volumes.

## Volumes & Data
- `./99_Working_Files` is mounted for incoming/staging/index/queue/logs.
- `./01_Internal_Reports` is mounted for markdown notebooks and artifacts.
- These mounts make the stack stateful locally (queue.db, logs, staged JSON, refined markdown).

## Configuration
Key envs (see `.env` / `.env.local`):
- `PUKAIST_API_TOKEN` (dev token)
- `PUKAIST_CORS_ORIGINS` (for embedded clients)
- `PUKAIST_LLM_OFFLINE` (default true), `PUKAIST_LLM_PROVIDER`, `PUKAIST_LLM_MODEL`, `PUKAIST_LLM_BASE_URL`, `PUKAIST_LLM_API_KEY`, `PUKAIST_LLM_INPUT_MAX_CHARS`, `PUKAIST_LLM_MAX_TOKENS`, `PUKAIST_LLM_TEMPERATURE`
- `PUKAIST_OIDC_ISSUER`, `PUKAIST_OIDC_AUDIENCE`, `PUKAIST_OIDC_JWKS_URL`, `PUKAIST_AUDIT_LOG` (optional auth/audit)
- `PUKAIST_DEFAULT_TENANT`, `PUKAIST_TENANT_CLAIM` (optional tenant scoping; see `docs/multi-tenant-design.md`)
- `PUKAIST_DB_TIMEOUT_SEC`, `PUKAIST_LLM_HTTP_TIMEOUT_SEC`, `PUKAIST_WEBHOOK_HTTP_TIMEOUT_SEC`, `PUKAIST_JWKS_HTTP_TIMEOUT_SEC`, `PUKAIST_BATCH_HTTP_TIMEOUT_SEC` (optional DB/HTTP timeout tuning; see `docs/scaling-and-ops.md`)

## Notes
- LLM stays offline unless configured; PDFs/docx are extracted locally.
- Logs are written to `99_Working_Files/Logs/` inside the mounted volume.
- Admin tasks: `make queue-export-flagged`, `make queue-rerun-flagged`, `make queue-import` (or run the python scripts inside the container with PYTHONPATH=.).
