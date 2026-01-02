# SHS Engine - Secwépemc Hunting Society Cultural Archive

A modern, AI-enhanced platform for managing cultural materials, camp documentation, and community resources for the Secwépemc Hunting Society.

## 🌲 Overview

SHS Engine is built on a proven document processing pipeline (adapted from Pukaist Engine) designed for:

- **Cultural Material Processing** - OCR and digitization of photos, documents, and media from cultural camps
- **Searchable Archive** - AI-powered search across all indexed materials
- **Content Management** - Blog posts, event updates, and program information
- **Automated Updates** - AI-assisted content generation and website updates

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- NVIDIA GPU with 24GB+ VRAM (for OCR processing)
- CUDA 12.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ACSKamloops/shs-engine.git
cd shs-engine

# 2. Run the bootstrap script (sets up everything)
./scripts/bootstrap_shs.sh
```

### Manual Setup

```bash
# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

## 📂 Project Structure

```
shs-engine/
├── SHS_Materials/           # Source PDFs, photos, and documents
├── data/                    # Processed data and analysis
├── frontend/                # React + Vite web application
├── src/                     # Python backend (FastAPI)
├── scripts/                 # Utility scripts and pipelines
│   ├── analyze_pdfs.py      # PDF classification
│   ├── smart_ocr_parallel.py # OCR processing
│   ├── ocr_qa_test.py       # Quality assurance
│   └── start-stack.sh       # Start all services
├── .github/workflows/       # CI/CD and deployment
└── docs/                    # Documentation
```

## 🔧 Core Features

### Document Processing Pipeline

```bash
# 1. Analyze documents (classify by type)
python -m scripts.analyze_pdfs

# 2. Start OCR server
vllm serve tencent/HunyuanOCR --port 8001 --gpu-memory-utilization 0.85

# 3. Process scanned/handwritten documents
python -m scripts.smart_ocr_parallel --ocr-only

# 4. Quality check
python -m scripts.ocr_qa_test --sample 10
```

### Development Server

```bash
# Start the full stack
./scripts/start-stack.sh

# Or manually:
# Terminal 1: Backend API
source .venv/bin/activate
uvicorn src.api:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🌐 Deployment to Hostinger

### Option A: Hostinger Horizons (AI-Designed Landing)

1. Log into Hostinger hPanel
2. Website → Add website → Hostinger Horizons
3. Describe your site in natural language

### Option B: Node.js Deployment (Full Control)

```bash
# Push to GitHub, automatic deployment via workflow
git push origin main
```

The GitHub Actions workflow handles:
- Building the frontend
- Deploying to Hostinger via FTP

### Required GitHub Secrets

Set these in your repository Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `FTP_HOST` | Hostinger FTP hostname |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |

## 📋 Configuration

### Environment Variables

Create a `.env` file:

```bash
# API Settings
PUKAIST_API_HOST=127.0.0.1
PUKAIST_API_PORT=8000

# OCR Settings
PUKAIST_OCR_BACKEND=hunyuan
PUKAIST_HUNYUAN_OCR_BASE_URL=http://127.0.0.1:8001/v1

# Embeddings (optional)
PUKAIST_EMBEDDINGS_ENABLED=false
```

### GPU Settings (RTX 3090 / 24GB)

For systems with 24GB VRAM, use these settings:

```bash
vllm serve tencent/HunyuanOCR \
  --port 8001 \
  --gpu-memory-utilization 0.80 \
  --max-model-len 12000 \
  --max-num-batched-tokens 2048
```

## 🧪 Testing

```bash
# Backend tests
pytest tests/ -v

# Frontend tests
cd frontend && npm test

# E2E tests
cd frontend && npx playwright test
```

## 📖 Documentation

- [OCR Quality Assurance Protocol](docs/ocr_quality_assurance_protocol.md)
- [Agent Instructions](agents.md) - Section 9 covers full OCR pipeline setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

[License details TBD]

---

*Dedicated to strengthening Secwépemc cultural practices through technology.*
