from __future__ import annotations

"""
Backfill embeddings for existing docs using the configured EmbeddingsClient.

This walks the docs table, finds rows without embeddings, and writes vectors
into the `embeddings` table via `search_index_hybrid.store_embedding`.

Usage:
  PUKAIST_EMBEDDINGS_ENABLED=true \
  PUKAIST_EMBEDDINGS_BASE_URL=http://localhost:8080 \
  PUKAIST_EMBEDDINGS_MODEL=tencent/KaLM-Embedding-Gemma3-12B-2511 \
  python -m scripts.backfill_embeddings
"""

import sqlite3
from pathlib import Path
from typing import List

from src.config import Settings
from src.embeddings import EmbeddingsClient
from src.search_index_hybrid import init as init_embeddings, store_embedding


def _get_docs_missing_embeddings(db_path: Path) -> List[int]:
    init_embeddings(db_path)
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        # left join to find docs without an embeddings row
        rows = conn.execute(
            """
            SELECT d.id
            FROM docs d
            LEFT JOIN embeddings e ON e.doc_id = d.id
            WHERE e.doc_id IS NULL
            ORDER BY d.created_at ASC
            """
        ).fetchall()
        return [r["id"] for r in rows]


def _get_doc_texts(db_path: Path, doc_ids: List[int]) -> List[str]:
    if not doc_ids:
        return []
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            f"SELECT id, file_path FROM docs WHERE id IN ({','.join('?' for _ in doc_ids)})",
            tuple(doc_ids),
        ).fetchall()
    # For now, re-use staged text files; in a more advanced version
    # we could add a docs_fts content join or a specific content table.
    texts: List[str] = []
    settings = Settings.load()
    for row in rows:
        doc_id = row["id"]
        path = Path(row["file_path"])
        try:
            txt_path = settings.staging_dir / f"{doc_id}.txt"
            if txt_path.exists():
                texts.append(txt_path.read_text(errors="ignore"))
            else:
                texts.append(path.read_text(errors="ignore"))
        except Exception:
            texts.append("")
    return texts


def main() -> None:
    try:
        from tqdm import tqdm
    except ImportError:
        print("Installing tqdm for progress bar...")
        import subprocess
        subprocess.check_call(["pip", "install", "tqdm"])
        from tqdm import tqdm
    
    settings = Settings.load()
    if not settings.embeddings_enabled or not settings.embeddings_model:
        print("❌ Embeddings are not enabled; set PUKAIST_EMBEDDINGS_ENABLED and PUKAIST_EMBEDDINGS_MODEL.")
        return
    missing = _get_docs_missing_embeddings(settings.index_path)
    if not missing:
        print("✅ No docs missing embeddings.")
        return
    client = EmbeddingsClient(
        provider=settings.embeddings_provider or settings.llm_provider,
        model=settings.embeddings_model,
    )
    
    batch_size = 16
    total_batches = (len(missing) + batch_size - 1) // batch_size
    errors = []
    embedded_count = 0
    
    print(f"\n🚀 Starting embeddings for {len(missing)} docs ({total_batches} batches)")
    print(f"   Model: {settings.embeddings_model}")
    print(f"   Batch size: {batch_size}\n")
    
    with tqdm(total=len(missing), unit="docs", desc="Embedding", 
              bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]") as pbar:
        for i in range(0, len(missing), batch_size):
            batch_ids = missing[i : i + batch_size]
            try:
                texts = _get_doc_texts(settings.index_path, batch_ids)
                vecs = client.embed(texts)
                if not vecs:
                    errors.append(f"Batch {batch_ids[0]}-{batch_ids[-1]}: Empty response")
                    pbar.set_postfix({"errors": len(errors)})
                    continue
                for doc_id, vec in zip(batch_ids, vecs):
                    store_embedding(settings.index_path, doc_id=doc_id, tenant_id=None, vector=vec)
                    embedded_count += 1
                pbar.update(len(batch_ids))
                pbar.set_postfix({"embedded": embedded_count, "errors": len(errors)})
            except Exception as e:
                errors.append(f"Batch {batch_ids[0]}-{batch_ids[-1]}: {str(e)[:50]}")
                pbar.set_postfix({"errors": len(errors)})
                pbar.update(len(batch_ids))
    
    print(f"\n✅ Completed: {embedded_count} embeddings generated")
    if errors:
        print(f"⚠️  Errors ({len(errors)}):")
        for err in errors[:10]:  # Show first 10 errors
            print(f"   - {err}")
        if len(errors) > 10:
            print(f"   ... and {len(errors) - 10} more")


if __name__ == "__main__":
    main()

