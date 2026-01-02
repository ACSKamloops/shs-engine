# HunyuanOCR Batch Processing - Ubuntu Deployment Guide

This guide covers deploying and running the batch OCR processing system on a fresh Ubuntu Linux server.

## Prerequisites

### Hardware Requirements
- **GPU**: NVIDIA GPU with at least 8GB VRAM (24GB+ recommended for large documents)
- **RAM**: 32GB+ system RAM (100GB recommended for large batches)
- **Storage**: 50GB+ for model cache and documents

### Software Requirements
- Ubuntu 22.04 LTS or newer
- NVIDIA Driver 535+ with CUDA 12.1+
- Python 3.11+

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ACSKamloops/pukaist-engine.git
cd pukaist-engine

# Run the setup script
./scripts/setup-ubuntu.sh

# Start batch processing
./scripts/batch-ocr.sh small
```

## Detailed Setup

### 1. Install NVIDIA Drivers & CUDA

```bash
# Add NVIDIA repository
sudo apt-get update
sudo apt-get install -y nvidia-driver-535

# Install CUDA toolkit
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get install -y cuda-toolkit-12-1

# Verify installation
nvidia-smi
```

### 2. Install Python & Dependencies

```bash
# Install Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev

# Create virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install vLLM (GPU-accelerated inference)
pip install vllm>=0.6.0
```

### 3. Configure Environment

Create a `.env` file or export these variables:

```bash
# OCR Configuration
export PUKAIST_HUNYUAN_OCR_BASE_URL="http://127.0.0.1:8001/v1"
export PUKAIST_HUNYUAN_OCR_MODEL="tencent/HunyuanOCR"
export PUKAIST_OCR_AUTO_CONTEXT="true"  # Enable entity detection (recommended)

# vLLM Server Configuration
export VLLM_PORT=8001
export GPU_MEMORY_UTILIZATION=0.85  # Adjust based on your GPU
```

### 4. Download Model (First Run)

The model (~2GB) will be downloaded automatically on first run. To pre-download:

```bash
source .venv/bin/activate
python3 -c "from transformers import AutoProcessor; AutoProcessor.from_pretrained('tencent/HunyuanOCR')"
```

## Running Batch OCR

### Start the vLLM Server

```bash
# Option 1: Using the start script
./scripts/start-stack.sh

# Option 2: Manual start
source .venv/bin/activate
vllm serve tencent/HunyuanOCR \
    --port 8001 \
    --trust-remote-code \
    --no-enable-prefix-caching \
    --mm-processor-cache-gb 0 \
    --gpu-memory-utilization 0.85
```

### Run Batch Processing

```bash
# Process documents by size category
./scripts/batch-ocr.sh small    # <20MB files, ~5 min timeout each
./scripts/batch-ocr.sh medium   # 20-50MB files, ~10 min timeout
./scripts/batch-ocr.sh large    # >50MB files, ~30 min timeout
./scripts/batch-ocr.sh all      # All files, sized-based timeouts

# Run in background (recommended for long batches)
nohup ./scripts/batch-ocr.sh small > logs/batch-small.log 2>&1 &
```

### Monitor Progress

```bash
# Watch the log file
tail -f logs/batch-small.log

# Check GPU utilization
watch -n 1 nvidia-smi

# Count completed documents
ls -1 Pukaist/OCR_Output/*.txt | wc -l
```

## Directory Structure

```
pukaist-engine/
├── Pukaist/                   # Source documents
│   ├── *.pdf                  # Original PDF files
│   └── OCR_Output/            # Generated OCR text files
├── scripts/
│   ├── batch-ocr.sh           # Main batch processing script
│   ├── quality-spot-check.py  # Quality review tool
│   ├── start-stack.sh         # Start vLLM server
│   └── stop-stack.sh          # Stop vLLM server
├── src/
│   └── hunyuan_ocr.py         # OCR processing module
└── logs/                      # Processing logs
```

## Quality Review

After processing, run quality spot-checks:

```bash
# Check a specific document
./.venv/bin/python scripts/quality-spot-check.py D1074_APS_205_230195 --page 1

# Generate random sample for review
./.venv/bin/python scripts/quality-spot-check.py --random 20 --list
```

## Troubleshooting

### GPU Out of Memory
```bash
# Reduce GPU memory utilization
export GPU_MEMORY_UTILIZATION=0.7
./scripts/start-stack.sh
```

### Slow Processing
- Process small documents first: `./scripts/batch-ocr.sh small`
- Ensure no other GPU processes: `nvidia-smi`
- Check thermal throttling: GPU temp should stay below 80°C

### Model Download Issues
```bash
# Set Hugging Face cache directory
export HF_HOME=/path/to/large/storage/.cache/huggingface
```

### vLLM Server Won't Start
```bash
# Check CUDA availability
python3 -c "import torch; print(torch.cuda.is_available())"

# Check for port conflicts
lsof -i :8001
```

## Performance Tuning

### For Large Documents (100+ pages)

Edit `scripts/batch-ocr.sh`:
```bash
LARGE_TIMEOUT=3600  # 1 hour for very large docs
```

### For Multiple GPUs

```bash
vllm serve tencent/HunyuanOCR \
    --port 8001 \
    --tensor-parallel-size 2 \  # Use 2 GPUs
    --trust-remote-code
```

## Architecture Overview

The OCR system uses a two-pass "Auto-Context" workflow:

1. **Scout Pass**: Extracts entities (names, places, dates) from the document
2. **Transcribe Pass**: Uses entity hints to improve proper noun accuracy

This workflow provides ~14 percentage point accuracy improvement over single-pass OCR.

### Known Entities (Pacific Northwest Historical Documents)

The system includes a dictionary of 50+ known entities for improved recognition:
- Places: Coeur d'Alene, Lillooet, Kamloops, Okanagan, etc.
- People: Franz Boas, James Teit, Tetlenitsa, etc.
- Tribes: Nlaka'pamux, Secwepemc, Syilx, etc.

## Support

For issues with this deployment, check:
1. `logs/` directory for error messages
2. GPU status with `nvidia-smi`
3. vLLM server logs
