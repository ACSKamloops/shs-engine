"""
Routes package for Pukaist Engine API.

This package contains modular route definitions split by domain:
- docs: Document CRUD, artifacts, labels, reviews, geo points, suggestions
- search: Full-text and hybrid search, ask endpoint
- tasks: Task queue listing, flagging, completion
- jobs: Job listing, summaries, task linkage
- geo: GeoJSON, AOI, POI, KMZ import
- admin: Projects, collections, metrics, logs, index rebuild

Each router is registered in the main api.py module.
"""

from __future__ import annotations

import logging
import os

from fastapi import Depends, Header, HTTPException

from ..config import Settings
from ..auth import verify_bearer
from ..jwks_auth import verify_jwt_via_jwks
from ..llm_client import LLMClient

# Use a function to get settings to support test module reloading
_settings_cache: Settings | None = None


def get_settings() -> Settings:
    """Get settings instance, supporting test module reloading."""
    global _settings_cache
    if _settings_cache is None:
        _settings_cache = Settings.load()
    return _settings_cache


def reset_settings() -> None:
    """Reset settings cache (used by tests)."""
    global _settings_cache
    _settings_cache = None


# For backward compatibility with existing route modules
@property
def settings() -> Settings:
    return get_settings()


# Create a settings proxy object for backward compat
class _SettingsProxy:
    """Proxy that delegates to get_settings() for lazy loading."""
    
    def __getattr__(self, name):
        return getattr(get_settings(), name)


settings = _SettingsProxy()

# Shared logger
logger = logging.getLogger("pukaist.api")

# Shared LLM client (lazy init)
_llm_client: LLMClient | None = None


def get_llm_client() -> LLMClient | None:
    """
    Lazy-initialize an LLMClient for optional API helpers.

    This respects the local-first defaults:
    - If llm_offline is True, return None so callers can use heuristic fallbacks.
    - Otherwise, reuse a shared client configured from Settings.
    """
    global _llm_client
    s = get_settings()
    if s.llm_offline:
        return None
    if _llm_client is None:
        _llm_client = LLMClient(
            provider=s.llm_provider,
            model=s.llm_model,
            api_key=s.llm_api_key,
            base_url=s.llm_base_url,
            input_max_chars=s.llm_input_max_chars,
            max_tokens=s.llm_max_tokens,
            temperature=s.llm_temperature,
        )
    return _llm_client


def _verify_bearer_claims(authorization: str | None, s: Settings) -> dict | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    if not s.oidc_issuer or not s.oidc_audience:
        return None
    token = authorization.replace("Bearer ", "").strip()
    if s.oidc_jwks_url:
        return verify_jwt_via_jwks(token, s.oidc_issuer, s.oidc_audience, s.oidc_jwks_url)
    return verify_bearer(authorization, s)


def _tenant_from_payload(payload: dict | None, s: Settings) -> str | None:
    if payload and s.tenant_claim:
        claim_value = payload.get(s.tenant_claim)
        if isinstance(claim_value, str) and claim_value:
            return claim_value
    return s.default_tenant


def _roles_from_payload(payload: dict | None, roles_claim: str | None) -> list[str]:
    if not payload or not roles_claim:
        return []
    roles = payload.get(roles_claim)
    if isinstance(roles, str):
        return [roles]
    if isinstance(roles, list):
        return [r for r in roles if isinstance(r, str)]
    return []


def resolve_tenant(authorization: str | None) -> str | None:
    """
    Determine the tenant_id for this request based on verified JWT claims or default.
    Returns a string tenant_id or None if not set/configured.
    """
    s = get_settings()
    try:
        payload = _verify_bearer_claims(authorization, s)
    except HTTPException:
        return s.default_tenant
    return _tenant_from_payload(payload, s)


def extract_roles(authorization: str | None) -> list[str]:
    s = get_settings()
    try:
        payload = _verify_bearer_claims(authorization, s)
    except HTTPException:
        return []
    return _roles_from_payload(payload, s.roles_claim)


def verified_claims(authorization: str | None) -> dict | None:
    s = get_settings()
    try:
        return _verify_bearer_claims(authorization, s)
    except HTTPException:
        return None


def resolve_auth(x_api_key: str | None, authorization: str | None) -> dict:
    """
    Resolve tenant_id and roles from either API key or verified JWT.
    """
    s = get_settings()
    if os.getenv("PUKAIST_AUTH_DISABLED", "false").lower() in {"1", "true", "yes", "on"}:
        return {"tenant_id": s.default_tenant, "roles": []}
    payload = None
    if s.oidc_issuer and s.oidc_audience and authorization and authorization.startswith("Bearer "):
        payload = _verify_bearer_claims(authorization, s)
        return {
            "tenant_id": _tenant_from_payload(payload, s),
            "roles": _roles_from_payload(payload, s.roles_claim),
        }
    if s.api_token and x_api_key != s.api_token:
        raise HTTPException(status_code=401, detail="Invalid API token")
    roles: list[str] = []
    if s.api_token and x_api_key == s.api_token and s.role_admin and not s.roles_claim:
        roles = [s.role_admin]
    return {"tenant_id": s.default_tenant, "roles": roles}


def require_role(required: str, roles: list[str]) -> None:
    # In local-dev or fully offline mode, allow admin/ingest routes without role checks.
    if os.getenv("PUKAIST_AUTH_DISABLED", "false").lower() in {"1", "true", "yes", "on"}:
        return
    if not required:
        return
    if required not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")


def verify_token(x_api_key: str = Header(None), authorization: str | None = Header(default=None)) -> str | None:
    """
    Verify API token or JWT and return tenant_id.
    """
    return resolve_auth(x_api_key, authorization)["tenant_id"]


def auth_context(x_api_key: str = Header(None), authorization: str | None = Header(default=None)) -> dict:
    """
    Return auth context with tenant_id and roles.
    """
    return resolve_auth(x_api_key, authorization)
