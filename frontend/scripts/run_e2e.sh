#!/usr/bin/env bash
set -euo pipefail

# Runs Playwright E2E against a local preview server.
# Usage: ./scripts/run_e2e.sh

PORT=${PORT:-4173}
BASE_URL=${PLAYWRIGHT_BASE_URL:-http://localhost:${PORT}}

echo "Building frontend..."
npm run build >/tmp/pukaist_preview_build.log 2>&1

echo "Starting preview server on ${BASE_URL}..."
npm run preview -- --host --port "${PORT}" >/tmp/pukaist_preview.log 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT

echo "Waiting for server..."
for i in {1..20}; do
  if curl -sf "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Running Playwright tests..."
PLAYWRIGHT_BASE_URL="${BASE_URL}" npx playwright test "$@"

echo "Done. Logs: /tmp/pukaist_preview.log"
