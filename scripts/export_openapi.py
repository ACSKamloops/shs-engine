from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.api import app


def main() -> None:
    schema = app.openapi()
    # augment descriptions for webhook fields (brief)
    components = schema.get("components", {})
    headers = components.setdefault("headers", {})
    headers["X-Pukaist-Token"] = {"description": "Shared secret for callbacks (if configured)", "schema": {"type": "string"}}
    headers["X-Pukaist-Signature"] = {"description": "HMAC SHA256 over JSON body when token is set", "schema": {"type": "string"}}

    out = Path("openapi.json")
    out.write_text(json.dumps(schema, indent=2))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
