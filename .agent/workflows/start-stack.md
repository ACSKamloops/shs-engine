---
description: Start the Pukaist Engine stack with Hunyuan OCR on WSL
---

# Start Stack Workflow

This workflow starts the complete Pukaist Engine processing stack with Hunyuan OCR using vLLM on WSL.

## Prerequisites

- WSL2 with NVIDIA GPU passthrough configured
- `.wslconfig` with adequate memory (recommended: 48GB RAM, 32GB swap)
- vLLM installed with Hunyuan OCR dependencies
- cuda-compat-12-9 installed (see HuggingFace model card)

## Quick Start

// turbo
1. Run the startup script:
```bash
./scripts/start-stack.sh
```

This handles everything: stops old services, resets stuck tasks, starts vLLM with health check, then API/worker/frontend.

## Manual Steps (if needed)

### Stop existing services
```bash
./scripts/stop-stack.sh
```

### Check vLLM health
```bash
curl http://127.0.0.1:8001/v1/models
```

### Add workers for more throughput
// turbo
```bash
./scripts/add-worker.sh 2
./scripts/add-worker.sh 3
```

> [!NOTE]
> With 48GB RAM / 32GB swap WSL config, **3 workers is the practical limit**.
> Each worker holds PDF pages in memory during OCR processing.

### Monitor processing
// turbo
```bash
./.venv/bin/python scripts/queue_progress.py --watch 2
```

### Watch GPU usage
// turbo
```bash
nvidia-smi -l 2
```

### Tail all logs
// turbo
```bash
tail -f /tmp/pukaist/*.log
```

## Configuration

Override defaults via environment variables before running `start-stack.sh`:

| Variable | Default | Description |
|----------|---------|-------------|
| `GPU_MEMORY_UTILIZATION` | 0.85 | VRAM usage (0.7-0.9 for 5090) |
| `MAX_NUM_BATCHED_TOKENS` | 4096 | Batch size for throughput |
| `MAX_MODEL_LEN` | 18000 | Max output tokens |
| `PROCESSED_DIR` | `/mnt/c/.../Pukaist/Processed` | Where to move processed files |

## Troubleshooting

### Worker hits "Connection refused"
- vLLM wasn't ready. The `start-stack.sh` script handles this with health checks.
- If running manually, use `scripts/wait-for-vllm.sh` first.

### OOM errors
- Reduce `GPU_MEMORY_UTILIZATION` to 0.75
- Reduce `MAX_NUM_BATCHED_TOKENS` to 2048
- Remove extra workers

### Stuck "processing" tasks
- Run the reset script in start-stack.sh or:
```bash
./.venv/bin/python - <<'PY'
from src.config import Settings
import sqlite3
settings = Settings.load()
conn = sqlite3.connect(settings.queue_db)
conn.execute("UPDATE tasks SET status='pending' WHERE status IN ('processing','leased')")
conn.commit()
PY
```

### WSL-specific notes
- vLLM auto-disables `pin_memory` in WSL (unavoidable)
- NVM path must be injected for frontend systemd unit
- Port forwarding may break after hibernation

---

## OCR-Only Workflow (Manual)

For simpler runs without the full stack, use this workflow:

### Step 1: Start vLLM manually (in a separate terminal)
// turbo
```bash
cd /home/astraithious/pukaist-engine
source .venv/bin/activate
vllm serve tencent/HunyuanOCR --port 8001 --gpu-memory-utilization 0.85
```

### Step 2: Analyze PDFs (if not done)
// turbo
```bash
python -m scripts.analyze_pdfs
```

### Step 3: Run OCR pipeline
// turbo
```bash
python -m scripts.smart_ocr_parallel --ocr-only
```

### Step 4: Quality check
// turbo
```bash
python -m scripts.ocr_qa_test --sample 10
```

> [!NOTE]
> For complete from-scratch setup, see **agents.md Section 9: Smart OCR Pipeline Setup**.

