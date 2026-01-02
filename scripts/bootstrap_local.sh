#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="${VENV_PATH:-$ROOT/.venv}"
PYTHON="${PYTHON:-python3}"

echo "Bootstrap: Pukaist Engine (local dev)"
echo "Repo: $ROOT"

if [ ! -d "$VENV" ]; then
  echo "Creating venv: $VENV"
  "$PYTHON" -m venv "$VENV"
fi

source "$VENV/bin/activate"
python -m pip install --upgrade pip

if [ -f "$ROOT/requirements.txt" ]; then
  echo "Installing Python dependencies..."
  pip install -r "$ROOT/requirements.txt"
fi

if [ -f "$ROOT/frontend/package.json" ]; then
  if command -v npm >/dev/null 2>&1; then
    echo "Installing frontend dependencies..."
    (cd "$ROOT/frontend" && npm install)
  else
    echo "npm not found; skipping frontend install."
  fi
fi

missing=()
command -v tesseract >/dev/null 2>&1 || missing+=("tesseract")
command -v pdftoppm >/dev/null 2>&1 || missing+=("poppler-utils")
command -v ogr2ogr >/dev/null 2>&1 || missing+=("gdal")

if [ ${#missing[@]} -gt 0 ]; then
  echo ""
  echo "System dependencies missing: ${missing[*]}"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    echo "Install via Homebrew:"
    echo "  brew install tesseract poppler gdal"
  elif [ -f /etc/debian_version ]; then
    echo "Install via apt:"
    echo "  sudo apt-get update && sudo apt-get install -y tesseract-ocr poppler-utils gdal-bin"
  else
    echo "Install tesseract, poppler-utils (pdftoppm), and gdal/ogr2ogr via your OS package manager."
  fi
fi

if [ "${SKIP_GEO:-0}" != "1" ]; then
  echo ""
  echo "Downloading Geo datasets (BC Data + Native Land optional)..."
  python "$ROOT/scripts/download_geo_data.py" || true
  echo "Filtering to BC interior layers..."
  python "$ROOT/scripts/filter_bc_interior.py" || true
  echo "For authoritative AOI datasets, see Geo/README.md."
else
  echo "Skipping Geo downloads (SKIP_GEO=1)."
fi

echo ""
echo "Optional: Hunyuan OCR (GPU/large deps)"
echo "  pip install -r requirements-hunyuan.txt"
echo "  Set PUKAIST_OCR_BACKEND=hunyuan and related env vars."
echo ""
echo "Optional: Embeddings server (GPU/large deps)"
echo "  pip install -r requirements-embeddings.txt"
echo "  Run: MODEL_ID=tencent/KaLM-Embedding-Gemma3-12B-2511 uvicorn scripts.kalm_embedding_server:app --port 8080"

echo ""
echo "Done. Next steps:"
echo "  1) source .venv/bin/activate"
echo "  2) make dev"
