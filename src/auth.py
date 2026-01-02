from __future__ import annotations

import base64
import json
from typing import Optional

import jwt
from fastapi import HTTPException


def _decode_jwt(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("invalid token")
    payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
    payload = json.loads(base64.urlsafe_b64decode(payload_b64))
    return payload


def verify_bearer(authorization: Optional[str], settings) -> dict:
    if not settings.oidc_issuer or not settings.oidc_audience:
        raise HTTPException(status_code=401, detail="OIDC not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    if not settings.oidc_dev_secret:
        raise HTTPException(status_code=401, detail="Missing OIDC verification secret; set PUKAIST_OIDC_JWKS_URL or PUKAIST_OIDC_DEV_SECRET.")
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(
            token,
            settings.oidc_dev_secret,
            algorithms=["HS256", "HS384", "HS512"],
            audience=settings.oidc_audience,
            issuer=settings.oidc_issuer,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
    return payload
