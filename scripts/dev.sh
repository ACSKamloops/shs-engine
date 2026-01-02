#!/bin/bash
# Pukaist Engine - Development Server Script
# Starts API, worker, and frontend in parallel with colored output.
#
# Usage:
#   ./scripts/dev.sh          # Start all services
#   ./scripts/dev.sh api      # Start only API
#   ./scripts/dev.sh worker   # Start only worker
#   ./scripts/dev.sh frontend # Start only frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root (parent of scripts/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check for virtual environment
if [ ! -d ".venv" ]; then
    echo -e "${RED}Error: .venv not found. Run 'python -m venv .venv && pip install -e .' first.${NC}"
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Load environment from .env if exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}Loaded .env${NC}"
fi

# Default to relaxed auth for local development
export PUKAIST_AUTH_DISABLED="${PUKAIST_AUTH_DISABLED:-true}"

start_api() {
    echo -e "${BLUE}[API]${NC} Starting on http://localhost:8000 ..."
    uvicorn src.api:app --reload --host 0.0.0.0 --port 8000 2>&1 | sed "s/^/$(echo -e ${BLUE}[API]${NC}) /" &
    API_PID=$!
}

start_worker() {
    echo -e "${YELLOW}[WORKER]${NC} Starting background worker ..."
    python -m src.worker 2>&1 | sed "s/^/$(echo -e ${YELLOW}[WORKER]${NC}) /" &
    WORKER_PID=$!
}

start_frontend() {
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        echo -e "${GREEN}[FRONTEND]${NC} Starting on http://localhost:5173 ..."
        (cd frontend && npm run dev 2>&1 | sed "s/^/$(echo -e ${GREEN}[FRONTEND]${NC}) /") &
        FRONTEND_PID=$!
    else
        echo -e "${RED}[FRONTEND]${NC} Not found (skipping)"
    fi
}

# Trap Ctrl+C to kill all background processes
cleanup() {
    echo -e "\n${RED}Shutting down...${NC}"
    [ -n "$API_PID" ] && kill $API_PID 2>/dev/null
    [ -n "$WORKER_PID" ] && kill $WORKER_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Parse arguments
case "${1:-all}" in
    api)
        start_api
        ;;
    worker)
        start_worker
        ;;
    frontend)
        start_frontend
        ;;
    all|*)
        echo -e "${GREEN}Starting Pukaist Engine development environment...${NC}"
        echo ""
        start_api
        sleep 1
        start_worker
        start_frontend
        echo ""
        echo -e "${GREEN}All services started. Press Ctrl+C to stop.${NC}"
        echo -e "  API:      http://localhost:8000"
        echo -e "  Frontend: http://localhost:5173"
        echo ""
        ;;
esac

# Wait for all background processes
wait
