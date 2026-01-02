#!/usr/bin/env python3
"""
Embed OCR text files directly from Evidence_Staging directory.

This script reads actual OCR output files and creates embeddings with proper content,
storing them in a dedicated vector search structure.

Usage:
  PUKAIST_EMBEDDINGS_BASE_URL=http://localhost:8080 \
  python -m scripts.embed_ocr_files
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import List, Tuple

import requests
from tqdm import tqdm


# Configuration
OCR_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
EMBEDDINGS_DB = Path("/home/astraithious/pukaist-engine/data/ocr_embeddings.db")
EMBEDDING_URL = "http://localhost:8080/v1/embeddings"
MODEL = "tencent/KaLM-Embedding-Gemma3-12B-2511"
BATCH_SIZE = 8  # Smaller batch for FP16
MIN_CONTENT_LENGTH = 100  # Skip files with less than 100 chars


def init_db(db_path: Path) -> None:
    """Initialize embeddings database."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ocr_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                content_preview TEXT,
                char_count INTEGER,
                vector TEXT NOT NULL,
                created_at REAL DEFAULT (unixepoch())
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_filename ON ocr_embeddings(filename)")
        conn.commit()


def get_existing_files(db_path: Path) -> set:
    """Get set of already-embedded filenames."""
    if not db_path.exists():
        return set()
    with sqlite3.connect(db_path) as conn:
        rows = conn.execute("SELECT filename FROM ocr_embeddings").fetchall()
        return {r[0] for r in rows}


def get_ocr_files() -> List[Tuple[str, str]]:
    """Get list of (filename, content) tuples from OCR directory."""
    files = []
    for txt_path in sorted(OCR_DIR.glob("*.txt")):
        try:
            content = txt_path.read_text(errors="ignore")
            if len(content) >= MIN_CONTENT_LENGTH:
                # Skip test files and tiny files
                if not txt_path.name.startswith("embeddings_"):
                    files.append((txt_path.name, content))
        except Exception:
            pass
    return files


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Get embeddings from KaLM server."""
    resp = requests.post(
        EMBEDDING_URL,
        json={"model": MODEL, "input": texts, "input_type": "document"},
        timeout=120
    )
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]


def store_embeddings(db_path: Path, items: List[Tuple[str, str, List[float]]]) -> None:
    """Store embeddings in database."""
    with sqlite3.connect(db_path) as conn:
        for filename, content, vector in items:
            conn.execute(
                """INSERT OR REPLACE INTO ocr_embeddings 
                   (filename, content_preview, char_count, vector) 
                   VALUES (?, ?, ?, ?)""",
                (filename, content[:500], len(content), json.dumps(vector))
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
    
    print(f"\n🚀 Embedding {len(to_embed)} files with KaLM-12B FP16...")
    print(f"   Batch size: {BATCH_SIZE}")
    
    errors = []
    embedded = 0
    
    with tqdm(total=len(to_embed), unit="files", desc="Embedding") as pbar:
        for i in range(0, len(to_embed), BATCH_SIZE):
            batch = to_embed[i:i+BATCH_SIZE]
            filenames = [f for f, _ in batch]
            contents = [c for _, c in batch]
            
            try:
                vectors = get_embeddings(contents)
                items = [(f, c, v) for (f, c), v in zip(batch, vectors)]
                store_embeddings(EMBEDDINGS_DB, items)
                embedded += len(items)
                pbar.update(len(batch))
                pbar.set_postfix({"embedded": embedded, "errors": len(errors)})
            except Exception as e:
                errors.append(f"Batch {i}: {str(e)[:50]}")
                pbar.update(len(batch))
    
    print(f"\n✅ Completed: {embedded} embeddings generated")
    print(f"   Database: {EMBEDDINGS_DB}")
    if errors:
        print(f"⚠️  Errors ({len(errors)}):")
        for err in errors[:5]:
            print(f"   - {err}")


if __name__ == "__main__":
    main()
