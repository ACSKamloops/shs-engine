#!/usr/bin/env python3
"""
Improved OCR embedding script with:
- Custom legal research prompts
- Semantic chunking for long documents
- Overlap between chunks
- Flash Attention 2 optimization

Usage:
  python -m scripts.embed_ocr_improved
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import List, Tuple
import re

import requests
from tqdm import tqdm


# Configuration
OCR_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
EMBEDDINGS_DB = Path("/home/astraithious/pukaist-engine/data/ocr_embeddings_v2.db")
EMBEDDING_URL = "http://localhost:8080/v1/embeddings"
MODEL = "tencent/KaLM-Embedding-Gemma3-12B-2511"

# Chunking settings
MAX_CHUNK_CHARS = 4000  # ~1000 tokens
OVERLAP_CHARS = 600     # 15% overlap
MIN_CONTENT_LENGTH = 100
BATCH_SIZE = 4  # Smaller batch since chunks are larger

# Domain-specific document prefix
DOCUMENT_PREFIX = ""  # Server adds this via KALM_DOCUMENT_PROMPT


def init_db(db_path: Path) -> None:
    """Initialize embeddings database with chunk support."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ocr_embeddings_v2 (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                chunk_count INTEGER NOT NULL,
                content_preview TEXT,
                char_count INTEGER,
                vector TEXT NOT NULL,
                created_at REAL DEFAULT (unixepoch()),
                UNIQUE(filename, chunk_index)
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_filename_v2 ON ocr_embeddings_v2(filename)")
        conn.commit()


def get_existing_files(db_path: Path) -> set:
    """Get set of already-embedded filenames."""
    if not db_path.exists():
        return set()
    with sqlite3.connect(db_path) as conn:
        rows = conn.execute("SELECT DISTINCT filename FROM ocr_embeddings_v2").fetchall()
        return {r[0] for r in rows}


def chunk_text(text: str, max_chars: int = MAX_CHUNK_CHARS, overlap: int = OVERLAP_CHARS) -> List[str]:
    """
    Split text into overlapping chunks, preferring sentence boundaries.
    """
    if len(text) <= max_chars:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + max_chars
        
        if end >= len(text):
            chunks.append(text[start:].strip())
            break
        
        # Try to find sentence boundary near end
        boundary_search_start = end - 200
        boundary_search_end = end + 100
        chunk_region = text[boundary_search_start:min(boundary_search_end, len(text))]
        
        # Look for sentence endings
        sentence_ends = [m.end() for m in re.finditer(r'[.!?]\s+', chunk_region)]
        
        if sentence_ends:
            # Use the last sentence boundary within our range
            best_end = boundary_search_start + sentence_ends[-1]
            chunks.append(text[start:best_end].strip())
            start = best_end - overlap
        else:
            # No sentence boundary, use word boundary
            space_pos = text.rfind(' ', start + max_chars - 100, end)
            if space_pos > start:
                chunks.append(text[start:space_pos].strip())
                start = space_pos - overlap
            else:
                chunks.append(text[start:end].strip())
                start = end - overlap
        
        start = max(start, chunks[-1] and len(text) - (len(text) - start) or start)
        if start < 0:
            start = end - overlap
    
    return [c for c in chunks if len(c) >= MIN_CONTENT_LENGTH]


def get_ocr_files() -> List[Tuple[str, str]]:
    """Get list of (filename, content) tuples from OCR directory."""
    files = []
    for txt_path in sorted(OCR_DIR.glob("*.txt")):
        try:
            content = txt_path.read_text(errors="ignore")
            if len(content) >= MIN_CONTENT_LENGTH:
                if not txt_path.name.startswith("embeddings_"):
                    files.append((txt_path.name, content))
        except Exception:
            pass
    return files


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings from KaLM server with document type."""
    resp = requests.post(
        EMBEDDING_URL,
        json={"model": MODEL, "input": texts, "input_type": "document"},
        timeout=180
    )
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]


def store_embeddings(db_path: Path, items: List[Tuple[str, int, int, str, List[float]]]) -> None:
    """Store embeddings with chunk info."""
    with sqlite3.connect(db_path) as conn:
        for filename, chunk_idx, chunk_count, content, vector in items:
            conn.execute(
                """INSERT OR REPLACE INTO ocr_embeddings_v2 
                   (filename, chunk_index, chunk_count, content_preview, char_count, vector) 
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (filename, chunk_idx, chunk_count, content[:500], len(content), json.dumps(vector))
            )
        conn.commit()


def main() -> None:
    print("🔍 Scanning OCR files...")
    all_files = get_ocr_files()
    print(f"   Found {len(all_files)} valid OCR files")
    
    init_db(EMBEDDINGS_DB)
    existing = get_existing_files(EMBEDDINGS_DB)
    print(f"   Already embedded: {len(existing)}")
    
    # Filter to only new files
    to_embed = [(f, c) for f, c in all_files if f not in existing]
    print(f"   To embed: {len(to_embed)}")
    
    if not to_embed:
        print("✅ All files already embedded!")
        return
    
    # Count total chunks
    all_chunks = []
    for filename, content in to_embed:
        chunks = chunk_text(content)
        for i, chunk in enumerate(chunks):
            all_chunks.append((filename, i, len(chunks), chunk))
    
    print(f"\n📊 Chunking summary:")
    print(f"   Total files: {len(to_embed)}")
    print(f"   Total chunks: {len(all_chunks)}")
    print(f"   Avg chunks/file: {len(all_chunks)/len(to_embed):.1f}")
    
    print(f"\n🚀 Embedding {len(all_chunks)} chunks with KaLM-12B (legal prompts + FA2)...")
    
    errors = []
    embedded = 0
    
    with tqdm(total=len(all_chunks), unit="chunks", desc="Embedding") as pbar:
        for i in range(0, len(all_chunks), BATCH_SIZE):
            batch = all_chunks[i:i+BATCH_SIZE]
            contents = [c[3] for c in batch]
            
            try:
                vectors = get_embeddings(contents)
                items = [(fn, idx, cnt, txt, vec) for (fn, idx, cnt, txt), vec in zip(batch, vectors)]
                store_embeddings(EMBEDDINGS_DB, items)
                embedded += len(items)
                pbar.update(len(batch))
                pbar.set_postfix({"embedded": embedded, "errors": len(errors)})
            except Exception as e:
                errors.append(f"Batch {i}: {str(e)[:50]}")
                pbar.update(len(batch))
    
    print(f"\n✅ Completed: {embedded} chunk embeddings generated")
    print(f"   Database: {EMBEDDINGS_DB}")
    if errors:
        print(f"⚠️  Errors ({len(errors)}):")
        for err in errors[:5]:
            print(f"   - {err}")


if __name__ == "__main__":
    main()
