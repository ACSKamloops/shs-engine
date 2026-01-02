# Persistence Migration — SQLite to Postgres (Design)

This note outlines a migration path from the current local-first SQLite setup to a Postgres-backed deployment for queue/jobs/docs, while preserving SQLite as the default for local development.

## Goals

- Keep the current local-first behavior: SQLite + filesystem remain the default for dev and small deployments.
- Allow production/staging deployments to use Postgres for:
  - Queue and jobs (`queue_db`, `job_store`).
  - Potentially the search/docs tables (if you want to centralize metadata).
- Avoid a hard dependency on Postgres in code paths used by local dev.

## Configuration

Introduce (in a future step) env variables:

- `PUKAIST_DB_URL` — optional SQLAlchemy-style URL for Postgres (e.g., `postgresql://user:pass@host:5432/pukaist`).
- `PUKAIST_DB_DRIVER` — e.g., `sqlite` (default) or `postgres`.

Behavior:

- If `PUKAIST_DB_DRIVER` is unset or set to `sqlite`:
  - Continue to use SQLite via the existing `queue_db`/`job_store`/`search_index` code paths.
- If `PUKAIST_DB_DRIVER=postgres` and `PUKAIST_DB_URL` is set:
  - Use a new Postgres-backed implementation of `queue_db` and `job_store`.
  - Optionally, use Postgres for `docs`/`geo_points` while keeping FTS/geo export logic compatible.

Current status (local dev):
- `.env.example` already exposes `PUKAIST_DB_DRIVER` (default `sqlite`) and `PUKAIST_DB_URL` placeholders; no Postgres dependency is pulled for local dev.
- Code still uses SQLite-only paths; Postgres wiring would be introduced once the repository abstraction is in place.

## Migration Approach (Queue/Jobs First)

1. **Abstract DB access**
   - Introduce a thin repository layer (e.g., `db/queue_store.py`, `db/job_store.py`) that wraps the existing SQLite calls.
   - Ensure all API and worker code uses this abstraction (not raw `queue_db` or `job_store`) for queue and job operations.

2. **Postgres implementation**
   - Implement Postgres-backed versions of the queue and job repositories:
     - Preserve schema semantics (status, attempts, leased_at, job/task linkage, tenant_id).
     - Use parameterized queries and connection pooling (via a standard library such as `psycopg` or an ORM like SQLAlchemy).

3. **Dual-write / shadow testing (optional)**
   - In a controlled environment, write queue/job data to both SQLite and Postgres while reading from SQLite.
   - Verify that both backends stay in sync and behave identically under expected workloads.

4. **Cutover**
   - When confident, switch `PUKAIST_DB_DRIVER` to `postgres` in non-dev environments.
   - Keep SQLite paths available for dev/local usage.

## Docs & Index Considerations

- Current design stores:
  - `docs` and `geo_points` in SQLite via `search_index.py`.
  - Text content in staged `.txt` files.
- For Postgres:
  - You may choose to keep `docs` and `geo_points` in SQLite for now (FTS/geo export only).
  - Or mirror them into Postgres as simple tables for:
    - Centralized metadata reporting.
    - Integration with other internal analytics tools.
- FTS:
  - Full-text search may continue to rely on SQLite FTS.
  - Alternatively, a later phase could adopt Postgres FTS or an external search service; this is outside the scope of this initial migration design.

## Local-First Guarantees

- Local dev remains:
  - `PUKAIST_DB_DRIVER=sqlite` (default).
  - SQLite paths under `99_Working_Files` with no additional dependencies.
- Postgres is introduced only when `PUKAIST_DB_DRIVER` and `PUKAIST_DB_URL` are explicitly configured.

This design satisfies the Phase 2 persistence goal in `MASTER_PLAN.md` by outlining how to introduce Postgres while preserving the current local-first behavior. Actual implementation of the Postgres-backed repositories and configuration toggles can proceed incrementally once this design is accepted.
