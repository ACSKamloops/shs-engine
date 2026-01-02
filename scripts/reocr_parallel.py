#!/usr/bin/env python3
"""
Re-OCR files using vLLM's continuous batching with parallel requests.

This script leverages vLLM's native async batching by sending multiple
concurrent requests. vLLM automatically batches them for optimal throughput.

Settings based on research:
- temperature=0.0 (greedy decoding for verbatim)
- repetition_penalty=1.0 (no penalty for exact transcription)
- Parallel requests = 4 (vLLM batches automatically)

Usage:
  python -m scripts.reocr_parallel
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
import tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import aiohttp
import base64
from tqdm.asyncio import tqdm

# Configuration
STAGING_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
PDF_SOURCE_DIR = Path("/home/astraithious/pukaist-engine/Pukaist")
BUGS_FILE = STAGING_DIR / "REPETITION_BUGS.json"
OCR_URL = "http://localhost:8001/v1/chat/completions"
MODEL = "tencent/HunyuanOCR"

# Parallel settings - vLLM will batch these automatically
MAX_CONCURRENT_REQUESTS = 4  # Number of concurrent page OCR requests
MAX_CONCURRENT_FILES = 2     # Number of files to process in parallel

# Verbatim prompt
VERBATIM_PROMPT = (
    "Transcribe ONLY the exact text visible in this document image. "
    "Preserve original spelling, punctuation, line breaks, and casing exactly as written - including any errors. "
    "Do NOT correct, summarize, describe, or paraphrase. "
    "Do NOT start with phrases like 'The handwritten text is' or 'The document contains'. "
    "Mark unclear words as [illegible]. Output only the transcription, nothing else."
)


def find_source_pdf(txt_filename: str) -> Path | None:
    """Find the source PDF for a given OCR txt file."""
    base = txt_filename.replace(".txt", "")
    pdf_path = PDF_SOURCE_DIR / f"{base}.pdf"
    if pdf_path.exists():
        return pdf_path
    
    # Try doc ID prefix match
    doc_id = base.split("_")[0] if "_" in base else base
    for pdf in PDF_SOURCE_DIR.glob(f"{doc_id}_*.pdf"):
        return pdf
    
    return None


def pdf_to_images(pdf_path: Path, output_dir: Path) -> list[Path]:
    """Convert PDF pages to PNG images."""
    output_prefix = output_dir / pdf_path.stem
    cmd = ["pdftoppm", "-png", "-r", "150", str(pdf_path), str(output_prefix)]  # 150 DPI for speed
    subprocess.run(cmd, check=True, capture_output=True)
    return sorted(output_dir.glob(f"{pdf_path.stem}*.png"))


def make_data_url(image_path: Path) -> str:
    """Convert image to base64 data URL."""
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


async def ocr_image_async(session: aiohttp.ClientSession, image_path: Path, semaphore: asyncio.Semaphore) -> str:
    """Run OCR on a single image with async request."""
    async with semaphore:
        data_url = make_data_url(image_path)
        
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": ""},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": VERBATIM_PROMPT},
                    ],
                },
            ],
            "temperature": 0.0,
            "extra_body": {
                "top_k": 1,
                "repetition_penalty": 1.0,
                "max_tokens": 8192,
            },
        }
        
        async with session.post(OCR_URL, json=payload, timeout=aiohttp.ClientTimeout(total=300)) as resp:
            resp.raise_for_status()
            data = await resp.json()
            return data["choices"][0]["message"]["content"]


def clean_repetitions(text: str) -> str:
    """Post-processing cleanup of repetition artifacts."""
    import re
    text = re.sub(r'(.)\1{15,}', r'\1\1\1', text)
    return text


async def process_file(bug: dict, session: aiohttp.ClientSession, semaphore: asyncio.Semaphore, tmpdir: Path) -> tuple[str, bool, str]:
    """Process a single file with parallel page OCR."""
    txt_filename = bug["filename"]
    txt_path = STAGING_DIR / txt_filename
    
    pdf_path = find_source_pdf(txt_filename)
    if not pdf_path:
        return txt_filename, False, "no PDF"
    
    try:
        # Convert PDF to images
        file_tmpdir = tmpdir / txt_filename.replace(".txt", "")
        file_tmpdir.mkdir(exist_ok=True)
        images = pdf_to_images(pdf_path, file_tmpdir)
        
        if not images:
            return txt_filename, False, "no images"
        
        # OCR all pages in parallel - vLLM batches automatically
        tasks = [ocr_image_async(session, img, semaphore) for img in images]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        all_text = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                all_text.append(f"[Page {i+1} OCR failed: {str(result)[:50]}]")
            else:
                all_text.append(clean_repetitions(result))
        
        combined = "\n\n".join(all_text)
        
        # Backup and save
        backup_path = txt_path.with_suffix(".txt.bak3")
        if txt_path.exists():
            txt_path.rename(backup_path)
        
        txt_path.write_text(combined)
        return txt_filename, True, f"{len(images)} pages"
        
    except Exception as e:
        return txt_filename, False, str(e)[:50]


async def main_async() -> None:
    if not BUGS_FILE.exists():
        print(f"❌ Bugs file not found: {BUGS_FILE}")
        return
    
    with open(BUGS_FILE) as f:
        bugs = json.load(f)
    
    print(f"🚀 Parallel Re-OCR with vLLM Continuous Batching")
    print(f"   Files: {len(bugs)}")
    print(f"   Concurrent requests: {MAX_CONCURRENT_REQUESTS}")
    print(f"   Settings: temperature=0.0, repetition_penalty=1.0")
    
    # Check server
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8001/health") as resp:
                if resp.status != 200:
                    raise Exception("Server not healthy")
    except Exception:
        print("❌ Hunyuan OCR server not running on port 8001")
        return
    
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    
    success = 0
    failed = []
    skipped = []
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        
        async with aiohttp.ClientSession() as session:
            # Process files with progress bar
            tasks = [process_file(bug, session, semaphore, tmpdir) for bug in bugs]
            
            for coro in tqdm.as_completed(tasks, total=len(bugs), desc="Re-OCR"):
                filename, ok, msg = await coro
                if ok:
                    success += 1
                elif msg == "no PDF":
                    skipped.append(filename)
                else:
                    failed.append((filename, msg))
    
    print(f"\n✅ Completed:")
    print(f"   Success: {success}")
    print(f"   Skipped (no PDF): {len(skipped)}")
    print(f"   Failed: {len(failed)}")
    
    if failed:
        print("\n⚠️  Failed files:")
        for f, err in failed[:5]:
            print(f"   {f[:40]}: {err}")


def main() -> None:
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
