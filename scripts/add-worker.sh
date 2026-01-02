#!/bin/bash
# add-worker.sh - Add an additional worker to the processing pool
set -e

WORKER_NUM="${1:-2}"
PROJECT_ROOT="/home/astraithious/pukaist-engine"
LOG_DIR="/tmp/pukaist"
VLLM_HOST="${VLLM_HOST:-127.0.0.1}"
VLLM_PORT="${VLLM_PORT:-8001}"
PROCESSED_DIR="${PROCESSED_DIR:-/mnt/c/Users/Astraithious/Documents/Pukaist/Processed}"

UNIT_NAME="pukaist-worker-${WORKER_NUM}"

echo "Starting additional worker: ${UNIT_NAME}"

# Check if vLLM is healthy first
if [ "$(curl -s -o /dev/null -w "%{http_code}" "http://${VLLM_HOST}:${VLLM_PORT}/v1/models" 2>/dev/null)" != "200" ]; then
  echo "ERROR: vLLM is not ready on ${VLLM_HOST}:${VLLM_PORT}" >&2
  exit 1
fi

systemd-run --user --unit="${UNIT_NAME}" \
  --property=Restart=on-failure --property=RestartSec=10 \
  --property=WorkingDirectory="$PROJECT_ROOT" \
  --property=StandardOutput=append:${LOG_DIR}/worker-${WORKER_NUM}.log \
  --property=StandardError=append:${LOG_DIR}/worker-${WORKER_NUM}.log \
  --setenv=PUKAIST_LLM_OFFLINE=true \
  --setenv=PUKAIST_HUNYUAN_OCR_BASE_URL=http://${VLLM_HOST}:${VLLM_PORT}/v1 \
  --setenv=PUKAIST_OCR_BACKEND=hunyuan \
  --setenv=PUKAIST_PROCESSED_DIR="${PROCESSED_DIR}" \
  --setenv=PUKAIST_MOVE_PROCESSED=true \
  --setenv=PUKAIST_EMBEDDINGS_ENABLED=false \
  --setenv=PUKAIST_HUNYUAN_OCR_API_KEY=EMPTY \
  --setenv=PUKAIST_OCR_ENABLED=true \
  /bin/bash -lc "source .venv/bin/activate && python -m src.worker"

echo "✓ ${UNIT_NAME} started (logs: ${LOG_DIR}/worker-${WORKER_NUM}.log)"
echo ""
echo "To stop this worker: systemctl --user stop ${UNIT_NAME}"
