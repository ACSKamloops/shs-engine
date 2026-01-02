from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import time

from . import auth_context, require_role, settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

class WebhookCreate(BaseModel):
    url: str
    events: List[str]
    description: Optional[str] = None

class Webhook(WebhookCreate):
    id: str
    active: bool
    created_at: int
    secret: str

# In-memory store for demo purposes (would be DB in production)
webhooks_db = {}

@router.get("", response_model=List[Webhook])
async def list_webhooks(auth: dict = Depends(auth_context)):
    require_role(settings.role_admin or "", auth.get("roles") or [])
    tenant_id = auth.get("tenant_id")
    return [w for w in webhooks_db.values() if w.get("tenant_id") == tenant_id]

@router.post("", response_model=Webhook)
async def create_webhook(webhook: WebhookCreate, auth: dict = Depends(auth_context)):
    require_role(settings.role_admin or "", auth.get("roles") or [])
    import uuid
    import secrets
    
    webhook_id = str(uuid.uuid4())
    new_webhook = Webhook(
        id=webhook_id,
        url=webhook.url,
        events=webhook.events,
        description=webhook.description,
        active=True,
        created_at=int(time.time()),
        secret=f"whsec_{secrets.token_hex(24)}"
    )
    webhooks_db[webhook_id] = {**new_webhook.model_dump(), "tenant_id": auth.get("tenant_id")}
    return new_webhook

@router.delete("/{webhook_id}")
async def delete_webhook(webhook_id: str, auth: dict = Depends(auth_context)):
    require_role(settings.role_admin or "", auth.get("roles") or [])
    entry = webhooks_db.get(webhook_id)
    if not entry or entry.get("tenant_id") != auth.get("tenant_id"):
        raise HTTPException(status_code=404, detail="Webhook not found")
    del webhooks_db[webhook_id]
    return {"status": "deleted"}

@router.post("/{webhook_id}/test")
async def test_webhook(webhook_id: str, auth: dict = Depends(auth_context)):
    require_role(settings.role_admin or "", auth.get("roles") or [])
    entry = webhooks_db.get(webhook_id)
    if not entry or entry.get("tenant_id") != auth.get("tenant_id"):
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    # Mock delivery
    return {
        "status": "success",
        "timestamp": int(time.time()),
        "payload": {"event": "test.ping", "data": {}}
    }
