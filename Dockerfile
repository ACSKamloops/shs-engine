# -----------------------------------------------------------------------------
# Stage 1: Build Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Build for production
RUN npm run build


# -----------------------------------------------------------------------------
# Stage 2: Final Image (Python + Built Frontend)
# -----------------------------------------------------------------------------
FROM python:3.11-slim-bookworm

# Install system dependencies (OCR, geospatial, build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    gdal-bin \
    libgdal-dev \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set env for Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Point to data volume for persistence
    QUEUE_DB_PATH=/data/pukaist.db \
    INCOMING_DIR=/data/uploads \
    WORKSPACE_DIR=/data/workspace \
    INDEX_PATH=/data/index_v1

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY src ./src
COPY scripts ./scripts

# Copy built frontend from Stage 1 into the static files location needed by api.py
# Assuming api.py looks for ../frontend/dist from its location in src/
# We'll replicate the structure: /app/src/api.py -> /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory
RUN mkdir -p /data/uploads /data/workspace /data/index_v1
VOLUME /data

# Expose API port
EXPOSE 8000

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]
