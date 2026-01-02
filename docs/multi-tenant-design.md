# Multi-Tenant Design — Pukaist Engine

This note sketches how to evolve the Pukaist Engine from a single-tenant, local-first setup into a multi-tenant service while keeping the existing behavior intact for local development.

## Goals
- Allow multiple tenants (projects/customers) to share a deployment safely.
- Ensure tenant data isolation at the storage/query level.
- Keep the local/dev story simple (single-tenant defaults still work with no extra config).
- Avoid coupling tenant logic into frontends; keep it enforced at the API and data layers.

## Concepts
- **Tenant**: a logical owner of uploads/jobs/docs (e.g., a project, customer, or environment).
- **Tenant ID**: an opaque string identifier used internally to scope data (e.g., `tenant-123`, `acme`, `project-x`).
- **Subject/User**: the end user making API calls (represented by an API key or JWT `sub` claim).

## Configuration (proposed)
- New envs (placeholders already present in `.env.example` once wired):
  - `PUKAIST_DEFAULT_TENANT` — tenant ID to use when running with a single API token (dev/local); for example `local`.
  - `PUKAIST_TENANT_CLAIM` — JWT claim name to read the tenant ID from, for multi-tenant OIDC setups (e.g., `tenant`, `tid`, or `org`).
- Behavior:
  - If `PUKAIST_TENANT_CLAIM` is set and OIDC/JWKS auth is configured:
    - The API extracts `tenant_id` from the given claim in the verified JWT.
  - Otherwise, if `PUKAIST_DEFAULT_TENANT` is set:
    - The API assigns that tenant ID to all created jobs/tasks/docs.
  - For fully local use, both can be left unset, and the system behaves as a single-tenant engine with no tenant scoping.

## Data Model Changes (planned)

These changes are **not yet applied** to the live schema, but will guide future migrations.

### Queue / Jobs
- `jobs` table:
  - Add `tenant_id TEXT` column.
- `tasks` table:
  - Add `tenant_id TEXT` column.

### Search Index
- `docs` table:
  - Add `tenant_id TEXT` column.
- `geo_points` table:
  - Add `tenant_id TEXT` column.

### AOI Store
- AOI storage (currently under `Evidence_Index` path) should include `tenant_id` in its stored metadata so that AOIs can be tenant-scoped.

## Scoping Rules (planned)

Once tenant IDs exist in the schema:
- For any authenticated request:
  - Determine `tenant_id` from JWT claim or default (as per config).
  - All writes (jobs/tasks/docs/geo_points/AOIs) store this `tenant_id`.
  - All reads (list/search/docs/geojson/aoi/jobs/tasks/metrics) are filtered by `tenant_id`.
- Admin tools (e.g., queue admin scripts) may accept an optional tenant filter, or operate on all tenants when run in a trusted ops context.

## Auth Mapping (planned)

- API key mode (dev/local):
  - Single `PUKAIST_API_TOKEN` implies single-tenant usage; `tenant_id` is either `NULL` (legacy) or `PUKAIST_DEFAULT_TENANT` when configured.
- OIDC/JWT mode:
  - The JWT is validated via issuer/audience (and optionally JWKS).
  - `tenant_id` is derived from:
    - `PUKAIST_TENANT_CLAIM` if present.
    - Otherwise, a future mapping (e.g., static map or lookup) defined outside this core engine.

## Migration Strategy (when implemented)

- Add new columns as nullable:
  - `tenant_id` fields default to `NULL` for existing rows.
  - New writes start populating `tenant_id` once the config/auth wiring is in place.
- Gradually enforce scoping:
  - Initially, read queries may ignore `tenant_id` to preserve current behavior.
  - Once deployments are ready, queries can be tightened to require `tenant_id` in multi-tenant environments (gated behind config flags).

## Local-First Considerations

- For your current local dev goals:
  - You can ignore tenant settings entirely; everything behaves as it does today.
  - When you want to simulate multi-tenant behavior locally, you can:
    - Set different `PUKAIST_DEFAULT_TENANT` values and run separate stacks, or
    - Use JWTs with different tenant claims once the wiring is added.

This document is the first checkbox under “11) Multi-Tenant & Auth Hardening” in `MASTER_PLAN.md` (“Design a multi-tenant data model”). Future steps will implement the schema changes and API scoping rules described here.

