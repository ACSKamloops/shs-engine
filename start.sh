#!/bin/sh
set -e

echo "Starting Pukaist Engine..."

# Start background worker
python -m src.worker &

# Start API server (PID 1)
exec uvicorn src.api:app --host 0.0.0.0 --port 8000

