#!/usr/bin/env bash
set -euo pipefail

# Pukaist demo starter
# Seeds a throwaway workspace, runs a single ingest cycle via local_walkthrough,
# and prints next steps to start the API, console, and embeds.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="${PUKAIST_DEMO_DIR:-/tmp/pukaist_demo}"

echo "=== Pukaist demo starter ==="
echo "Demo workspace: ${WORKDIR}"

export PUKAIST_DEMO_DIR="${WORKDIR}"

PUKAIST_WALKTHROUGH_DIR="${WORKDIR}" "${ROOT}/scripts/local_walkthrough.sh"

cat <<EOF

Next steps:

- Start the API against this workspace in a new shell:
    PUKAIST_WORKSPACE=${WORKDIR} make api

- (Optional) Run the long-lived worker in another shell:
    PUKAIST_WORKSPACE=${WORKDIR} make worker

- Frontend console (React app):
    cd frontend
    npm install
    npm run dev
  Then open http://localhost:5173 and click "Apply demo preset".

- Minimal web demo (upload/search/map via /geojson):
    From the repo root:
      python -m http.server 8002
    Then open:
      http://localhost:8002/docs/web-demo.html

- Embeddable widgets:
    Upload/status/search widget: docs/embed-widget.html
    Map/search widget (this sprint): docs/map-embed.html

- Visual regression (Chromatic):
    cd frontend
    npm run build-storybook
    CHROMATIC_PROJECT_TOKEN=\$CHROMATIC_PROJECT_TOKEN npm run chromatic
  (Set CHROMATIC_PROJECT_TOKEN in your env or GitHub repo secrets.)

EOF

