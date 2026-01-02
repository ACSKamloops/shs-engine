#!/bin/bash
# =============================================================================
# Start vLLM with Optimized Settings for OCR (64GB+ RAM System)
# =============================================================================
# Updated 2023-12-23: System upgraded to 111GB RAM
# GPU: RTX 5090 32GB -> Using 90% = ~29GB for vLLM
# Max context: 32768 tokens for large documents
# =============================================================================

set -e

MODEL="tencent/HunyuanOCR"
PORT=8001
LOG_DIR="/home/astraithious/pukaist-engine/logs"
LOG_FILE="$LOG_DIR/vllm_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$LOG_DIR"

echo "Starting vLLM with optimized settings (64GB+ RAM system)..."
echo "GPU Memory Utilization: 0.90 (~29GB of 32GB)"
echo "Max Context Length: 32768 tokens"
echo "Log: $LOG_FILE"

# Kill any existing vLLM process
pkill -f "vllm serve" 2>/dev/null || true
sleep 3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VLLM="$PROJECT_DIR/.venv/bin/vllm"

"$VLLM" serve "$MODEL" \
    --port "$PORT" \
    --gpu-memory-utilization 0.90 \
    --max-model-len 32768 \
    --mm-processor-cache-gb 2 \
    --trust-remote-code \
    >> "$LOG_FILE" 2>&1 &

VLLM_PID=$!
echo "vLLM started with PID $VLLM_PID"
echo "$VLLM_PID" > /tmp/vllm.pid

# Wait for health check
echo "Waiting for vLLM to initialize (this may take 2-3 minutes)..."
for i in {1..60}; do
    if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
        echo "vLLM is ready!"
        exit 0
    fi
    sleep 5
done

echo "ERROR: vLLM failed to start within 5 minutes"
exit 1
