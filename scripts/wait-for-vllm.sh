#!/bin/bash
# wait-for-vllm.sh - Health check script for vLLM server
# Use as ExecStartPre in systemd units or call directly before starting workers
set -e

VLLM_HOST="${VLLM_HOST:-127.0.0.1}"
VLLM_PORT="${VLLM_PORT:-8001}"
MAX_WAIT="${MAX_WAIT:-120}"  # 2 minutes default timeout
INTERVAL=2
ELAPSED=0

echo "Waiting for vLLM to be ready on ${VLLM_HOST}:${VLLM_PORT}..."

until [ "$(curl -s -o /dev/null -w "%{http_code}" "http://${VLLM_HOST}:${VLLM_PORT}/v1/models" 2>/dev/null)" = "200" ]; do
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "ERROR: vLLM failed to become ready within ${MAX_WAIT}s" >&2
    exit 1
  fi
  echo "  ...waiting (${ELAPSED}s / ${MAX_WAIT}s)"
done

echo "✓ vLLM ready after ${ELAPSED}s"
