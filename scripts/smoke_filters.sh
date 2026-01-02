#!/usr/bin/env bash
set -euo pipefail

# Lightweight smoke run for filtered endpoints and search.
# Requires the API running locally. Configure via:
#   export API_BASE=http://localhost:8000
#   export API_KEY=dev-token

API_BASE="${API_BASE:-http://localhost:8000}"
API_KEY="${API_KEY:-dev-token}"

echo "API_BASE=${API_BASE}"

curl_json() {
  local path="$1"
  shift
  curl -sS "${API_BASE}${path}" -H "X-API-Key: ${API_KEY}" "$@" | jq .
}

echo "Health:"
curl_json "/health"

echo "Tasks (pending):"
curl_json "/tasks?status=pending&limit=5"

echo "Flagged tasks (intent filter demo):"
curl_json "/tasks/flagged?intent_contains=llm&limit=5"

echo "Search (theme/doc_type filters):"
curl_json "/search?q=test&theme=demo&doc_type=report&limit=5"

echo "Docs (theme/doc_type filters):"
curl_json "/docs?theme=demo&doc_type=report&limit=5"

echo "Done."
