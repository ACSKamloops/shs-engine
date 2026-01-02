# Roles & Authorization — Pukaist Engine (Phase 2)

This note sketches how to refine role-based access using JWT claims while keeping the core of Pukaist Engine simple and local-first.

## Goals

- Continue to rely on an external IdP for authentication (tokens, user identity).
- Use JWT claims to drive coarse-grained roles inside the engine:
  - Example roles:
    - `admin` — full access for a tenant.
    - `ingest` — can upload and trigger processing.
    - `viewer` — read-only access to search, docs, and map data.
- Keep the default local/dev experience unchanged (single API token, no roles).

## Configuration

New envs (design):

- `PUKAIST_ROLES_CLAIM` — name of the JWT claim that carries roles (e.g., `roles`, `permissions`).
- `PUKAIST_ROLE_ADMIN` — value that indicates admin rights (e.g., `admin`).
- `PUKAIST_ROLE_INGEST` — value for ingest/upload permission (e.g., `ingest`).
- `PUKAIST_ROLE_VIEWER` — value for read-only viewers (e.g., `viewer`).

Behavior:

- If `PUKAIST_ROLES_CLAIM` is unset:
  - The engine behaves as it does today: any valid JWT for a tenant can access all tenant data.
- If `PUKAIST_ROLES_CLAIM` is set:
  - The engine reads the claim from the verified JWT payload and checks the presence of role values.

## Role Semantics (Proposed)

For authenticated (JWT) requests:

- `admin`:
  - Can call all endpoints for a tenant:
    - `/upload`, `/tasks/flagged`, `/jobs`, `/jobs/{id}/summary`, `/jobs/{id}/tasks`, `/search`, `/docs`, `/geojson`, `/aoi`, `/status`, `/metrics`, `/index/rebuild`.
  - May also call future admin-only endpoints (e.g., queue reset, re-run commands).

- `ingest`:
  - Can upload and monitor jobs for a tenant:
    - `/upload`, `/jobs`, `/jobs/{id}/summary`, `/jobs/{id}/tasks`, `/status`.
  - Read-only on search/docs/map:
    - `/search`, `/docs`, `/geojson`, `/aoi`.
  - Cannot perform destructive admin operations (once such endpoints exist).

- `viewer`:
  - Read-only access:
    - `/search`, `/docs`, `/geojson`, `/aoi`.
    - `/jobs`, `/jobs/{id}/summary`, `/jobs/{id}/tasks` for visibility.
  - No access to `/upload` or any queue-managing/admin endpoints.

Local/dev (API token) mode:

- Roles are not enforced; the dev token has full access to simplify local workflows.

## Implementation Sketch (Future)

1. **Extend verify_token**
   - After validating JWT (issuer/audience and optional JWT signature/JWKS):
     - Extract `roles` from `PUKAIST_ROLES_CLAIM` (support string or array of strings).
     - Attach roles to the request context (e.g., by returning `(tenant_id, roles)` or storing in a request-local structure).

2. **Per-endpoint decorators**
   - Implement small helpers (e.g., `require_role("ingest")`, `require_role("admin")`) that:
     - Read roles from the context.
     - Reject requests with `403 Forbidden` when role requirements are not met.
   - Apply these helpers selectively:
     - `/upload` → requires `ingest` or `admin`.
     - Future admin endpoints → require `admin`.
     - Read-only endpoints → require any valid JWT (with a tenant) or a `viewer`-type role, depending on how strict you want to be.

3. **Testing Strategy**
   - Use unsigned JWTs (as in `test_api_multi_tenant.py`) with different role combinations in the `roles` claim.
   - Assert that:
     - `viewer` tokens cannot call `/upload`.
     - `ingest` tokens can upload but cannot access admin-only endpoints.
     - `admin` tokens can access all tenant endpoints.

## Local-First Guarantees

- If no OIDC/JWT is configured, or roles claim envs are unset:
  - The engine behaves as today with a single dev token and full access.
- Role logic is only activated in environments where:
  - OIDC is configured, and
  - `PUKAIST_ROLES_CLAIM` is set.

This design fulfills the Phase 2 security/roles goal in `MASTER_PLAN.md` at a conceptual level and provides a clear path to an incremental implementation that respects the existing local-first model.

