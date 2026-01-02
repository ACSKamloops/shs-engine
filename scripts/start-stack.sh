#!/bin/bash
# start-stack.sh - Start the complete Pukaist Engine stack with Hunyuan OCR
# This script handles proper orchestration order and health checks
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="/tmp/pukaist"

# Configuration (can be overridden via environment)
VLLM_HOST="${VLLM_HOST:-127.0.0.1}"
VLLM_PORT="${VLLM_PORT:-8001}"
API_PORT="${API_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
GPU_MEMORY_UTILIZATION="${GPU_MEMORY_UTILIZATION:-0.85}"
MAX_NUM_BATCHED_TOKENS="${MAX_NUM_BATCHED_TOKENS:-4096}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-18000}"
PROCESSED_DIR="${PROCESSED_DIR:-/mnt/c/Users/Astraithious/Documents/Pukaist/Processed}"

# NVM path for frontend (adjust if different)
NVM_NODE_PATH="${NVM_NODE_PATH:-/home/astraithious/.nvm/versions/node/v24.12.0/bin}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Pukaist Engine Stack Startup Script                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Configuration:"
echo "  Project Root:    $PROJECT_ROOT"
echo "  Log Directory:   $LOG_DIR"
echo "  GPU Memory:      ${GPU_MEMORY_UTILIZATION} (${MAX_NUM_BATCHED_TOKENS} batched tokens)"
echo "  Processed Dir:   $PROCESSED_DIR"
echo ""

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# ============================================================================
# Step 1: Stop any existing services
# ============================================================================
echo "Step 1: Stopping existing services..."
systemctl --user stop pukaist-worker pukaist-worker-2 pukaist-worker-3 pukaist-api pukaist-frontend pukaist-hunyuan 2>/dev/null || true
systemctl --user reset-failed 2>/dev/null || true
echo "  ✓ Existing services stopped"

# ============================================================================
# Step 2: Reset stuck tasks in queue
# ============================================================================
echo ""
echo "Step 2: Resetting stuck tasks..."
cd "$PROJECT_ROOT"
./.venv/bin/python - <<'PY'
from pathlib import Path
import sqlite3, sys
root = Path('/home/astraithious/pukaist-engine')
if str(root) not in sys.path: sys.path.insert(0, str(root))
try:
    from src.config import Settings
    settings = Settings.load()
    conn = sqlite3.connect(settings.queue_db)
    cursor = conn.execute("UPDATE tasks SET status='pending', last_error=NULL, updated_at=strftime('%s','now') WHERE status IN ('processing','leased')")
    conn.commit()
    print(f"  ✓ Reset {cursor.rowcount} stuck tasks")
except Exception as e:
    print(f"  ⚠ Could not reset tasks: {e}")
PY

# ============================================================================
# Step 3: Start Hunyuan vLLM (GPU)
# ============================================================================
echo ""
echo "Step 3: Starting Hunyuan vLLM server..."
systemd-run --user --unit=pukaist-hunyuan \
  --property=Restart=on-failure --property=RestartSec=5 \
  --property=WorkingDirectory="$PROJECT_ROOT" \
  --property=StandardOutput=append:${LOG_DIR}/hunyuan_vllm.log \
  --property=StandardError=append:${LOG_DIR}/hunyuan_vllm.log \
  /bin/bash -lc "source .venv/bin/activate && vllm serve tencent/HunyuanOCR \
    --host ${VLLM_HOST} --port ${VLLM_PORT} \
    --dtype bfloat16 \
    --max-model-len ${MAX_MODEL_LEN} \
    --gpu-memory-utilization ${GPU_MEMORY_UTILIZATION} \
    --max-num-batched-tokens ${MAX_NUM_BATCHED_TOKENS} \
    --no-enable-prefix-caching \
    --mm-processor-cache-gb 0"
echo "  ✓ vLLM unit started (logs: ${LOG_DIR}/hunyuan_vllm.log)"

# ============================================================================
# Step 4: Wait for vLLM to be ready
# ============================================================================
echo ""
echo "Step 4: Waiting for vLLM health check..."
"$SCRIPT_DIR/wait-for-vllm.sh"

# ============================================================================
# Step 5: Start API server
# ============================================================================
echo ""
echo "Step 5: Starting API server..."
systemd-run --user --unit=pukaist-api \
  --property=Restart=on-failure --property=RestartSec=2 \
  --property=WorkingDirectory="$PROJECT_ROOT" \
  --property=StandardOutput=append:${LOG_DIR}/api.log \
  --property=StandardError=append:${LOG_DIR}/api.log \
  /bin/bash -lc "source .venv/bin/activate && uvicorn src.api:app --host 127.0.0.1 --port ${API_PORT}"
echo "  ✓ API server started (logs: ${LOG_DIR}/api.log)"

# ============================================================================
# Step 6: Start Worker
# ============================================================================
echo ""
echo "Step 6: Starting worker..."
systemd-run --user --unit=pukaist-worker \
  --property=Restart=on-failure --property=RestartSec=10 \
  --property=WorkingDirectory="$PROJECT_ROOT" \
  --property=StandardOutput=append:${LOG_DIR}/worker.log \
  --property=StandardError=append:${LOG_DIR}/worker.log \
  --setenv=PUKAIST_LLM_OFFLINE=true \
  --setenv=PUKAIST_HUNYUAN_OCR_BASE_URL=http://${VLLM_HOST}:${VLLM_PORT}/v1 \
  --setenv=PUKAIST_OCR_BACKEND=hunyuan \
  --setenv=PUKAIST_PROCESSED_DIR="${PROCESSED_DIR}" \
  --setenv=PUKAIST_MOVE_PROCESSED=true \
  --setenv=PUKAIST_EMBEDDINGS_ENABLED=false \
  --setenv=PUKAIST_HUNYUAN_OCR_API_KEY=EMPTY \
  --setenv=PUKAIST_OCR_ENABLED=true \
  /bin/bash -lc "source .venv/bin/activate && python -m src.worker"
echo "  ✓ Worker started (logs: ${LOG_DIR}/worker.log)"

# ============================================================================
# Step 7: Start Frontend
# ============================================================================
echo ""
echo "Step 7: Starting frontend..."
systemd-run --user --unit=pukaist-frontend \
  --property=Restart=on-failure --property=RestartSec=2 \
  --property=WorkingDirectory="${PROJECT_ROOT}/frontend" \
  --property=StandardOutput=append:${LOG_DIR}/frontend.log \
  --property=StandardError=append:${LOG_DIR}/frontend.log \
  --setenv=PATH="${NVM_NODE_PATH}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
  /bin/bash -lc "npm run dev -- --host 0.0.0.0 --port ${FRONTEND_PORT}"
echo "  ✓ Frontend started (logs: ${LOG_DIR}/frontend.log)"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Stack Started Successfully                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Services:"
echo "  • Hunyuan vLLM:  http://${VLLM_HOST}:${VLLM_PORT}/v1"
echo "  • API Server:    http://127.0.0.1:${API_PORT}"
echo "  • Frontend:      http://localhost:${FRONTEND_PORT}"
echo ""
echo "Monitoring:"
echo "  • GPU:           nvidia-smi -l 2"
echo "  • Queue:         ./.venv/bin/python scripts/queue_progress.py --watch 2"
echo "  • Logs:          tail -f ${LOG_DIR}/*.log"
echo ""
echo "To add more workers:"
echo "  scripts/add-worker.sh [worker-number]"
echo ""
echo "To stop all services:"
echo "  scripts/stop-stack.sh"
