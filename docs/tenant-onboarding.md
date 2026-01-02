# Tenant Onboarding & Auth Flows — Pukaist Engine

This guide explains how to onboard tenants (projects/customers), issue credentials, and reason about roles when running Pukaist Engine beyond local single-tenant mode.

## Modes of Operation

1. **Local single-tenant (default)**
   - Use `PUKAIST_API_TOKEN` for a single shared API key (e.g., `dev-token`).
   - Leave `PUKAIST_DEFAULT_TENANT` and `PUKAIST_TENANT_CLAIM` unset.
   - All jobs/tasks/docs live in a single logical tenant; `tenant_id` remains `NULL` in the database.

2. **Single-tenant with explicit tenant_id**
   - Set `PUKAIST_DEFAULT_TENANT=my-tenant`.
   - Keep using `PUKAIST_API_TOKEN` for a shared token, or layer OIDC on top.
   - New jobs/tasks/docs/geo/AOIs will be tagged with `tenant_id = "my-tenant"`.
   - Queries that accept `tenant_id` will see only data for this tenant; this is useful when you want clearer separation in the DB even for a single tenant.

3. **Multi-tenant with OIDC/JWT**
   - Configure OIDC/JWKS auth:
     - `PUKAIST_OIDC_ISSUER`
     - `PUKAIST_OIDC_AUDIENCE`
     - `PUKAIST_OIDC_JWKS_URL`
   - Choose a tenant claim (e.g., `tenant`, `org`, or `tid`) and set:
     - `PUKAIST_TENANT_CLAIM=tenant`
   - Ensure your IdP includes this claim in access tokens and that it is a non-empty string.
   - For each API call:
     - The API validates the JWT against issuer/audience (and JWKS if configured).
     - `tenant_id` is derived from the configured claim and applied to writes and reads (jobs/tasks/docs/geo/AOIs).

## Credentials & Roles (Conceptual)

Pukaist Engine treats the backend as the source of truth for business rules. Roles are enforced upstream (IdP/issuer) and conveyed via JWT claims; the engine focuses on tenant scoping and basic auth.

Recommended patterns:

- **Subjects / Users**
  - Use the JWT `sub` claim as the stable user identifier.
  - For auditing, you can extend the engine later to log `sub` alongside job/task events, but this is not required for multi-tenancy to function.

- **Roles**
  - Define roles in your IdP (e.g., `admin`, `reader`) and expose them via a claim such as `roles` or `permissions`.
  - For now, treat all holders of a valid token for a given tenant as having equivalent access to that tenant’s data.
  - If you need stricter role semantics inside the engine (e.g., read-only vs ingest), you can:
    - Add a configuration mapping between role names and allowed endpoints.
    - Inspect the roles claim in `verify_token` and reject/allow actions accordingly.
  - This keeps the engine flexible while allowing role logic to be added incrementally.

## Tenant Onboarding Flow (Example)

1. **Create tenant in your system of record**
   - Decide on a unique `tenant_id` string (e.g., `pukaist-demo`, `acme`, or `tenant-123`).

2. **Configure IdP / JWT**
   - Ensure access tokens issued for that tenant include:
     - `aud` matching `PUKAIST_OIDC_AUDIENCE`.
     - `iss` matching `PUKAIST_OIDC_ISSUER`.
     - Tenant claim (e.g., `"tenant": "acme"`).
   - Optionally include:
     - `sub` (user ID).
     - `roles` (e.g., `["admin"]` or `["reader"]`).

3. **Configure Pukaist Engine**
   - Set the OIDC envs and `PUKAIST_TENANT_CLAIM` in `.env` or your deployment environment.
   - Do **not** set `PUKAIST_DEFAULT_TENANT` for multi-tenant deployments; this avoids ambiguous scoping.

4. **Issue credentials**
   - Users obtain JWT access tokens from your IdP.
   - Clients call the Pukaist API with `Authorization: Bearer <token>`.

5. **Validation**
   - Verify that:
     - Uploads using different tenant tokens do not see each other’s jobs/tasks/docs/geo/AOIs.
     - Search/results and `/status` reflect only the calling tenant’s data.

## Admin & Ops Considerations

- **Admin access**
  - For operational tooling (e.g., queue admin scripts), you can:
    - Run them with direct DB access (bypassing the API), or
    - Use a special “admin” token that carries a separate tenant claim and is allowed to see multiple tenants (future work).
  - This design intentionally keeps admin behavior outside the core engine logic for now.

- **Backfills & migrations**
  - When you introduce tenants into an existing deployment:
    - Old rows may have `tenant_id = NULL`.
    - You can backfill tenant IDs for existing data based on your own mapping rules or keep `NULL` as “legacy single-tenant” and treat it specially at the API layer.

This doc completes the “Document tenant onboarding, API key/JWT issuance, and role model” item under section 11 of `MASTER_PLAN.md`. Implementation of stricter role enforcement (admin vs read-only) can be added later as your needs solidify.

