#!/bin/bash
# Ubuntu Setup Script for HunyuanOCR Batch Processing
# Run this on a fresh Ubuntu 22.04+ system with NVIDIA GPU

set -e

echo "========================================="
echo "Pukaist Engine - OCR Setup for Ubuntu"
echo "========================================="

# Check for root
if [ "$EUID" -eq 0 ]; then
    echo "Please run as a regular user, not root"
    exit 1
fi

# Check for NVIDIA GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo "❌ NVIDIA driver not found. Please install nvidia-driver-535 first:"
    echo "   sudo apt-get install -y nvidia-driver-535"
    echo "   Then reboot and run this script again."
    exit 1
fi

echo "✅ NVIDIA GPU detected:"
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader

# Install system dependencies
echo ""
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    poppler-utils \
    libgl1-mesa-glx \
    build-essential \
    git

# Create virtual environment if not exists
if [ ! -d ".venv" ]; then
    echo ""
    echo "🐍 Creating Python virtual environment..."
    python3.11 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Upgrade pip
echo ""
echo "📦 Installing Python dependencies..."
pip install --upgrade pip wheel setuptools

# Install requirements
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

# Install vLLM and OCR dependencies
echo ""
echo "🤖 Installing vLLM and OCR dependencies..."
pip install vllm>=0.6.0 openai pdf2image Pillow opencv-python transformers

# Pre-download the model
echo ""
echo "📥 Pre-downloading HunyuanOCR model (this may take a while)..."
python3 -c "
from transformers import AutoProcessor
print('Downloading processor...')
AutoProcessor.from_pretrained('tencent/HunyuanOCR', trust_remote_code=True)
print('✅ Model downloaded successfully')
"

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p quality_checks
mkdir -p Pukaist/OCR_Output

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Create environment file
echo ""
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# HunyuanOCR Configuration
PUKAIST_HUNYUAN_OCR_BASE_URL="http://127.0.0.1:8001/v1"
PUKAIST_HUNYUAN_OCR_MODEL="tencent/HunyuanOCR"
PUKAIST_OCR_AUTO_CONTEXT="true"

# vLLM Server
VLLM_PORT=8001
GPU_MEMORY_UTILIZATION=0.85
EOF

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Copy your PDF files to: Pukaist/"
echo ""
echo "2. Start the vLLM server:"
echo "   ./scripts/start-stack.sh"
echo ""
echo "3. Run batch OCR (in another terminal):"
echo "   ./scripts/batch-ocr.sh small"
echo ""
echo "4. For background processing:"
echo "   nohup ./scripts/batch-ocr.sh all > logs/batch.log 2>&1 &"
echo ""
echo "See docs/ocr-ubuntu-deployment.md for full documentation."
