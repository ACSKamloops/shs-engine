from __future__ import annotations

import os

from fastapi import APIRouter, Depends, Header
from typing import Dict, Optional

from . import auth_context, settings, verified_claims

router = APIRouter(tags=["auth"])


@router.get("/whoami")
async def whoami(
    authorization: Optional[str] = Header(default=None),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
    auth: dict = Depends(auth_context),
) -> Dict:
    """
    Return current user/tenant information derived from auth context.
    Works for API-key local mode and JWT/OIDC mode.
    """
    tenant_id = auth.get("tenant_id")
    roles = auth.get("roles") or []

    subject = None
    email = None
    payload = verified_claims(authorization)
    if payload:
        subject = payload.get("sub") or payload.get("preferred_username") or payload.get("email")
        email = payload.get("email")

    is_auth_disabled = os.getenv("PUKAIST_AUTH_DISABLED", "false").lower() in {"1", "true", "yes", "on"}
    is_api_key_admin = bool(settings.api_token and x_api_key and x_api_key == settings.api_token)
    is_admin_role = bool(settings.role_admin and settings.role_admin in roles)
    is_admin = is_auth_disabled or is_api_key_admin or is_admin_role or ("admin" in roles)

    return {
        "tenant": tenant_id or settings.default_tenant or "local",
        "subject": subject or email or "local-user",
        "roles": roles,
        "is_admin": is_admin,
    }
