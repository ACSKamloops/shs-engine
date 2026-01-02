from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI(title="Pukaist Webhook Receiver (local test)")


def verify_signature(body: bytes, token: Optional[str], signature: Optional[str]) -> bool:
    if not token:
        return True  # no token configured; accept all
    if not signature or not signature.startswith("sha256="):
        return False
    try:
        sent = signature.replace("sha256=", "")
        digest = hmac.new(token.encode(), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(sent, digest)
    except Exception:
        return False


@app.post("/webhook")
async def webhook(
    request: Request,
    x_pukaist_token: str | None = Header(default=None),
    x_pukaist_signature: str | None = Header(default=None),
):
    token = os.getenv("PUKAIST_WEBHOOK_TOKEN") or os.getenv("WEBHOOK_VERIFY_TOKEN")
    body = await request.body()
    if not verify_signature(body, token, x_pukaist_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = json.loads(body.decode() or "{}")
    # Echo back what was received for debugging
    return {"ok": True, "received": payload, "token_present": bool(token), "sig_verified": bool(token)}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
