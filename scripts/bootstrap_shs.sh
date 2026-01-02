#!/bin/bash
# bootstrap_shs.sh - One-command setup for SHS Engine
# Run this script to set up the entire development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            SHS Engine Bootstrap Script                       ║"
echo "║     Secwépemc Hunting Society Cultural Archive               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_ROOT"

# ============================================================================
# Step 1: Python Environment
# ============================================================================
echo "Step 1: Setting up Python environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "  ✓ Created virtual environment"
else
    echo "  ✓ Virtual environment exists"
fi

source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "  ✓ Installed Python dependencies"

# ============================================================================
# Step 2: Frontend Dependencies
# ============================================================================
echo ""
echo "Step 2: Setting up frontend..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
        echo "  ✓ Installed Node.js dependencies"
    else
        echo "  ✓ Node.js dependencies exist"
    fi
    cd ..
fi

# ============================================================================
# Step 3: Create Required Directories
# ============================================================================
echo ""
echo "Step 3: Creating directories..."
mkdir -p SHS_Materials
mkdir -p data
mkdir -p logs
mkdir -p quality_checks
echo "  ✓ Created SHS_Materials/"
echo "  ✓ Created data/"
echo "  ✓ Created logs/"
echo "  ✓ Created quality_checks/"

# ============================================================================
# Step 4: Initialize Git (if not already)
# ============================================================================
echo ""
echo "Step 4: Checking Git..."
if [ ! -d ".git" ]; then
    git init
    echo "  ✓ Initialized Git repository"
else
    echo "  ✓ Git repository exists"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Add your materials to SHS_Materials/"
echo ""
echo "  2. Start the development server:"
echo "     ./scripts/start-stack.sh"
echo ""
echo "  3. Or run OCR processing:"
echo "     python -m scripts.analyze_pdfs"
echo "     vllm serve tencent/HunyuanOCR --port 8001"
echo "     python -m scripts.smart_ocr_parallel --ocr-only"
echo ""
echo "  4. Access the frontend at http://localhost:5173"
echo ""

