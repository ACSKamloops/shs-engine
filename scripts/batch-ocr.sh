#!/bin/bash
# =============================================================================
# Unattended OCR Batch Processing Script (v2 - Size-Prioritized)
# =============================================================================
# Processes PDFs by size (smallest first) for faster initial throughput.
# Large documents (>50MB or >50 pages) are deferred to a second pass.
# =============================================================================

set -e

# Configuration
SOURCE_DIR="/home/astraithious/pukaist-engine/Pukaist"
OUTPUT_DIR="/home/astraithious/pukaist-engine/Pukaist/OCR_Output"
LOG_DIR="/home/astraithious/pukaist-engine/logs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Size thresholds (in bytes)
SMALL_THRESHOLD=$((20 * 1024 * 1024))   # 20MB - quick processing
MEDIUM_THRESHOLD=$((50 * 1024 * 1024))  # 50MB - moderate
LARGE_THRESHOLD=$((100 * 1024 * 1024))  # 100MB+ - defer or skip

# Timeout per size category (seconds)
TIMEOUT_SMALL=300    # 5 min for small docs
TIMEOUT_MEDIUM=600   # 10 min for medium
TIMEOUT_LARGE=1800   # 30 min for large

# Processing mode: "small", "medium", "large", or "all"
PROCESS_MODE="${1:-small}"

# Resource limits
export PUKAIST_HUNYUAN_OCR_BASE_URL="http://127.0.0.1:8001/v1"
export PUKAIST_HUNYUAN_OCR_MODEL="tencent/HunyuanOCR"
export PUKAIST_HUNYUAN_OCR_MAX_TOKENS=16384

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/batch_ocr_${PROCESS_MODE}_$TIMESTAMP.log"
PROGRESS_FILE="$OUTPUT_DIR/.progress"
ERRORS_FILE="$OUTPUT_DIR/.errors"
DEFERRED_FILE="$OUTPUT_DIR/.deferred_large"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Initialize
touch "$PROGRESS_FILE"
touch "$ERRORS_FILE"
touch "$DEFERRED_FILE"

log "=== OCR Batch Processing Started (Mode: $PROCESS_MODE) ==="
log "Source: $SOURCE_DIR"
log "Output: $OUTPUT_DIR"
log "Log: $LOG_FILE"

# Build file list sorted by size
TEMP_FILELIST=$(mktemp)
find "$SOURCE_DIR" -maxdepth 1 -name "*.pdf" -type f -printf '%s %p\n' | sort -n > "$TEMP_FILELIST"

TOTAL_FILES=$(wc -l < "$TEMP_FILELIST")
log "Total PDFs found: $TOTAL_FILES"

# Count by size category
SMALL_COUNT=$(awk -v t="$SMALL_THRESHOLD" '$1 < t' "$TEMP_FILELIST" | wc -l)
MEDIUM_COUNT=$(awk -v s="$SMALL_THRESHOLD" -v t="$MEDIUM_THRESHOLD" '$1 >= s && $1 < t' "$TEMP_FILELIST" | wc -l)
LARGE_COUNT=$(awk -v t="$MEDIUM_THRESHOLD" '$1 >= t' "$TEMP_FILELIST" | wc -l)

log "Size breakdown: Small(<20MB)=$SMALL_COUNT, Medium(20-50MB)=$MEDIUM_COUNT, Large(>50MB)=$LARGE_COUNT"

PROCESSED=0
SKIPPED=0
ERRORS=0
DEFERRED=0

cd "$PROJECT_DIR"

# Filter files based on processing mode
get_files_to_process() {
    case "$PROCESS_MODE" in
        small)
            awk -v t="$SMALL_THRESHOLD" '$1 < t {print $2}' "$TEMP_FILELIST"
            ;;
        medium)
            awk -v s="$SMALL_THRESHOLD" -v t="$MEDIUM_THRESHOLD" '$1 >= s && $1 < t {print $2}' "$TEMP_FILELIST"
            ;;
        large)
            awk -v t="$MEDIUM_THRESHOLD" '$1 >= t {print $2}' "$TEMP_FILELIST"
            ;;
        all)
            awk '{print $2}' "$TEMP_FILELIST"
            ;;
    esac
}

get_timeout_for_size() {
    local size=$1
    if [ "$size" -lt "$SMALL_THRESHOLD" ]; then
        echo $TIMEOUT_SMALL
    elif [ "$size" -lt "$MEDIUM_THRESHOLD" ]; then
        echo $TIMEOUT_MEDIUM
    else
        echo $TIMEOUT_LARGE
    fi
}

FILES_TO_PROCESS=$(get_files_to_process | wc -l)
log "Files to process in '$PROCESS_MODE' mode: $FILES_TO_PROCESS"

# Process each PDF
CURRENT=0
while IFS= read -r PDF_FILE; do
    [ -z "$PDF_FILE" ] && continue
    
    CURRENT=$((CURRENT + 1))
    BASENAME=$(basename "$PDF_FILE" .pdf)
    OUTPUT_FILE="$OUTPUT_DIR/${BASENAME}.txt"
    FILE_SIZE=$(stat -c%s "$PDF_FILE" 2>/dev/null || echo 0)
    FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
    
    # Skip if already processed
    if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
        log "SKIP [$CURRENT/$FILES_TO_PROCESS]: $BASENAME (already done)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    # Get appropriate timeout
    CURRENT_TIMEOUT=$(get_timeout_for_size "$FILE_SIZE")
    
    log "Processing [$CURRENT/$FILES_TO_PROCESS]: $BASENAME (${FILE_SIZE_MB}MB, timeout=${CURRENT_TIMEOUT}s)"
    
    # Run OCR with dynamic timeout
    TEMP_ERR=$(mktemp)
    if timeout "$CURRENT_TIMEOUT" ./.venv/bin/python 2>"$TEMP_ERR" <<EOF > "$OUTPUT_FILE"
import sys
import os
sys.path.insert(0, '.')

os.environ["PUKAIST_HUNYUAN_OCR_BASE_URL"] = "http://127.0.0.1:8001/v1"

from pathlib import Path
from pdf2image import convert_from_path
from src.hunyuan_ocr import extract_text_with_hunyuan
import tempfile

pdf_path = Path("$PDF_FILE")

with tempfile.TemporaryDirectory() as tmpdir:
    images = convert_from_path(str(pdf_path), dpi=400)
    all_text = []
    for i, img in enumerate(images):
        img_path = Path(tmpdir) / f"page_{i}.png"
        img.save(str(img_path), "PNG")
        text = extract_text_with_hunyuan(img_path)
        all_text.append(f"--- Page {i+1} ---")
        all_text.append(text)
    print("\n".join(all_text))
EOF
    then
        if [ -s "$OUTPUT_FILE" ]; then
            SIZE=$(wc -c < "$OUTPUT_FILE")
            log "  SUCCESS: $SIZE bytes"
            echo "$BASENAME" >> "$PROGRESS_FILE"
            PROCESSED=$((PROCESSED + 1))
        else
            log "  WARNING: Empty output"
            ERRORS=$((ERRORS + 1))
            echo "$BASENAME: Empty output" >> "$ERRORS_FILE"
        fi
    else
        log "  ERROR: OCR failed or timed out"
        ERRORS=$((ERRORS + 1))
        echo "$BASENAME: Failed (timeout=${CURRENT_TIMEOUT}s, size=${FILE_SIZE_MB}MB)" >> "$ERRORS_FILE"
        rm -f "$OUTPUT_FILE"
    fi
    
    rm -f "$TEMP_ERR"
    
    # Brief cooldown (5s for small, 10s for others)
    if [ "$FILE_SIZE" -lt "$SMALL_THRESHOLD" ]; then
        sleep 5
    else
        sleep 10
    fi
    
done < <(get_files_to_process)

rm -f "$TEMP_FILELIST"

log "=== Batch Processing Complete (Mode: $PROCESS_MODE) ==="
log "Processed: $PROCESSED"
log "Skipped: $SKIPPED"
log "Errors: $ERRORS"
log "Output: $OUTPUT_DIR"

# Suggest next step
case "$PROCESS_MODE" in
    small)
        log ""
        log ">>> Next: Run './scripts/batch-ocr.sh medium' for 20-50MB files"
        ;;
    medium)
        log ""
        log ">>> Next: Run './scripts/batch-ocr.sh large' for 50MB+ files"
        ;;
esac
