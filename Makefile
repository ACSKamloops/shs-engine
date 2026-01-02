.PHONY: api worker install demo dev check lint test test-cov frontend bootstrap embeddings-server embeddings-smoke

install:
	pip install -r requirements.txt

bootstrap:
	bash scripts/bootstrap_local.sh

PYTHON ?= python3

# =============================================================================
# Quick Start (Developer Experience)
# =============================================================================

dev:
	@echo "Starting full development environment..."
	./scripts/dev.sh

check: lint test
	@echo "All checks passed!"

lint:
	PYTHONPATH=. $(PYTHON) -m ruff check src/ tests/
	PYTHONPATH=. $(PYTHON) -m ruff format --check src/ tests/

test:
	PYTHONPATH=. $(PYTHON) -m pytest

test-cov:
	PYTHONPATH=. $(PYTHON) -m pytest tests/ --cov=src --cov-report=html --cov-report=term-missing
	@echo "Coverage report: htmlcov/index.html"

frontend:
	cd frontend && npm run dev

# =============================================================================
# Individual Services
# =============================================================================

api:
	PYTHONPATH=. uvicorn src.api:app --reload --port 8000

worker:
	PYTHONPATH=. $(PYTHON) -m src.worker

# =============================================================================
# Utilities
# =============================================================================

openapi:
	PYTHONPATH=. $(PYTHON) scripts/export_openapi.py

webhook-receiver:
	uvicorn scripts.webhook_receiver:app --port 8010 --reload

queue-export-flagged:
	PYTHONPATH=. $(PYTHON) scripts/queue_admin.py export-flagged --out flagged.tsv --limit 200

queue-rerun-flagged:
	PYTHONPATH=. $(PYTHON) scripts/queue_admin.py rerun-flagged --limit 100

queue-import:
	PYTHONPATH=. $(PYTHON) scripts/queue_admin.py import-tasks --tsv tasks.tsv

intake-scan:
	PYTHONPATH=. $(PYTHON) scripts/intake_scan.py --theme drop

prefilter-scan:
	PYTHONPATH=. $(PYTHON) scripts/prefilter_scan.py

project-config:
	PYTHONPATH=. $(PYTHON) scripts/project_config_wizard.py --name demo

demo:
	bash scripts/demo_starter.sh

docs-serve:
	python -m http.server 8002

embeddings-server:
	MODEL_ID=tencent/KaLM-Embedding-Gemma3-12B-2511 uvicorn scripts.kalm_embedding_server:app --host 0.0.0.0 --port 8080

embeddings-smoke:
	PUKAIST_EMBEDDINGS_BASE_URL=http://localhost:8080 \
	PUKAIST_EMBEDDINGS_MODEL=tencent/KaLM-Embedding-Gemma3-12B-2511 \
	PYTHONPATH=. python scripts/embeddings_smoke.py
