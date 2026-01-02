#!/usr/bin/env bash
set -euo pipefail

# Local, offline-friendly walkthrough:
# - seeds a throwaway workspace under /tmp (or PUKAIST_WALKTHROUGH_DIR)
# - copies a sample text into Incoming
# - runs intake-scan to enqueue
# - runs the worker once
# - runs a quick search against the index
#
# Does not start the API server; run `make api` separately if desired.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="${PUKAIST_WALKTHROUGH_DIR:-/tmp/pukaist_walkthrough}"
mkdir -p "$WORKDIR"/{incoming,staging,logs,reports}

export PUKAIST_WORKSPACE="$WORKDIR"
export PUKAIST_INCOMING_DIR="$WORKDIR/incoming"
export PUKAIST_STAGING_DIR="$WORKDIR/staging"
export PUKAIST_INDEX_PATH="$WORKDIR/index.db"
export PUKAIST_QUEUE_DB="$WORKDIR/queue.db"
export PUKAIST_LOG_DIR="$WORKDIR/logs"
export PUKAIST_REFINED_DIR="$WORKDIR/reports"
export PUKAIST_ALLOWED_EXTS="txt"
export PUKAIST_LLM_OFFLINE="true"
export PUKAIST_EMBEDDINGS_ENABLED="false"
export PUKAIST_OCR_ENABLED="false"

echo "Workspace: $WORKDIR"
echo "Seeding sample file..."
cp "$ROOT/tests/foo.txt" "$PUKAIST_INCOMING_DIR"/sample.txt

echo "Enqueuing via intake-scan..."
python3 -m scripts.intake_scan

echo "Running worker once..."
python3 - <<'PY'
from src import worker
worked = worker.run_once()
print("Worker processed:", worked)
PY

echo "Searching index for 'foo'..."
python3 - <<'PY'
from src import search_index, config
from pathlib import Path
settings = config.Settings.load()
search_index.init(settings.index_path)
rows = search_index.search(settings.index_path, "foo", limit=5, tenant_id=None)
for r in rows:
    print(dict(r))
PY

echo "Done. Start the API with: PUKAIST_WORKSPACE=$WORKDIR make api"
