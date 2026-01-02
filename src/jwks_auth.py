from __future__ import annotations

import base64
import json
import time
from typing import Optional, Dict, Any

import os
import requests
import jwt
from fastapi import HTTPException


JWKS_HTTP_TIMEOUT = float(os.getenv("PUKAIST_JWKS_HTTP_TIMEOUT_SEC", "5.0"))


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _get_kid_header(token: str) -> Optional[str]:
    parts = token.split(".")
    if len(parts) != 3:
        return None
    header = json.loads(_base64url_decode(parts[0]).decode("utf-8"))
    return header.get("kid")


def verify_jwt_via_jwks(token: str, issuer: str, audience: str, jwks_url: str) -> Dict[str, Any]:
    kid = _get_kid_header(token)
    if not kid:
        raise HTTPException(status_code=401, detail="Missing kid")

    resp = requests.get(jwks_url, timeout=JWKS_HTTP_TIMEOUT)
    resp.raise_for_status()
    jwks = resp.json().get("keys", [])
    key = next((k for k in jwks if k.get("kid") == kid), None)
    if not key:
        raise HTTPException(status_code=401, detail="Key not found in JWKS")

    try:
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[key.get("alg", "RS256")],
            audience=audience,
            issuer=issuer,
        )
        exp = payload.get("exp")
        if exp and time.time() > exp:
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
