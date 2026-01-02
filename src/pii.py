from __future__ import annotations

import re

# Simple PII patterns for redaction before LLM calls.
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")


def redact(text: str) -> str:
    """Redact common PII (emails, phone numbers) from text."""
    redacted = EMAIL_RE.sub("[EMAIL_REDACTED]", text)
    redacted = PHONE_RE.sub("[PHONE_REDACTED]", redacted)
    return redacted
