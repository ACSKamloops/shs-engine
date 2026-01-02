#!/usr/bin/env python3
"""
Smart OCR Pipeline - Uses optimal extraction method based on PDF analysis.

For DIGITAL PDFs: Direct text extraction with PyMuPDF (fast!)
For SCANNED/HANDWRITTEN: VLM OCR with parallel requests (vLLM batching)

Usage:
  python -m scripts.smart_ocr_pipeline
  python -m scripts.smart_ocr_pipeline --digital-only   # Only extract digital
  python -m scripts.smart_ocr_pipeline --ocr-only       # Only VLM OCR
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import tempfile
import base64
from pathlib import Path
from dataclasses import dataclass
from typing import Literal
import aiohttp
from tqdm import tqdm

# Try PyMuPDF
try:
    import fitz
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

# Configuration
PDF_DIR = Path("/home/astraithious/pukaist-engine/Pukaist")
OUTPUT_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
ANALYSIS_FILE = Path("/home/astraithious/pukaist-engine/data/pdf_analysis.json")
OCR_URL = "http://localhost:8001/v1/chat/completions"
MODEL = "tencent/HunyuanOCR"

# Parallel settings for VLM OCR
MAX_CONCURRENT_REQUESTS = 4  # vLLM batches automatically

# Verbatim prompt for OCR
VERBATIM_PROMPT = (
    "Transcribe ONLY the exact text visible in this document image. "
    "Preserve original spelling, punctuation, line breaks, and casing exactly as written - including any errors. "
    "Do NOT correct, summarize, describe, or paraphrase. "
    "Do NOT start with phrases like 'The handwritten text is' or 'The document contains'. "
    "Mark unclear words as [illegible]. Output only the transcription, nothing else."
)


def extract_digital_pdf(pdf_path: Path) -> str:
    """Extract text from a digital PDF using PyMuPDF (fast!)."""
    if not HAS_FITZ:
        raise RuntimeError("PyMuPDF (fitz) not installed")
    
    doc = fitz.open(pdf_path)
    pages_text = []
    
    for page in doc:
        text = page.get_text()
        if text.strip():
            pages_text.append(text)
    
    doc.close()
    return "\n\n".join(pages_text)


def pdf_to_images(pdf_path: Path, output_dir: Path) -> list[Path]:
    """Convert PDF pages to PNG images for OCR."""
    output_prefix = output_dir / pdf_path.stem
    cmd = ["pdftoppm", "-png", "-r", "150", str(pdf_path), str(output_prefix)]
    subprocess.run(cmd, check=True, capture_output=True)
    return sorted(output_dir.glob(f"{pdf_path.stem}*.png"))


def make_data_url(image_path: Path) -> str:
    """Convert image to base64 data URL."""
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


async def ocr_image_async(
    session: aiohttp.ClientSession, 
    image_path: Path, 
    semaphore: asyncio.Semaphore
) -> str:
    """OCR a single image with async request."""
    import re
    
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
            text = data["choices"][0]["message"]["content"]
            
            # Post-processing: clean repetitions
            text = re.sub(r'(.)\1{15,}', r'\1\1\1', text)
            return text


async def ocr_pdf_vlm(pdf_path: Path, session: aiohttp.ClientSession, semaphore: asyncio.Semaphore) -> str:
    """OCR a PDF using VLM with parallel page requests."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        images = pdf_to_images(pdf_path, tmpdir)
        
        if not images:
            return ""
        
        # OCR all pages in parallel - vLLM batches automatically
        tasks = [ocr_image_async(session, img, semaphore) for img in images]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        pages_text = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                pages_text.append(f"[Page {i+1} OCR failed]")
            else:
                pages_text.append(result)
        
        return "\n\n".join(pages_text)


def save_text(pdf_name: str, text: str, output_dir: Path) -> Path:
    """Save extracted text to file."""
    txt_name = pdf_name.replace(".pdf", ".txt")
    txt_path = output_dir / txt_name
    txt_path.write_text(text)
    return txt_path


async def main_async(args) -> None:
    # Load analysis results
    if not ANALYSIS_FILE.exists():
        print("❌ Run analyze_pdfs.py first!")
        return
    
    with open(ANALYSIS_FILE) as f:
        analysis = json.load(f)
    
    pdfs = analysis["pdfs"]
    
    # Filter based on args
    if args.digital_only:
        pdfs = [p for p in pdfs if p["extraction_method"] == "DIRECT"]
        print(f"📝 Processing {len(pdfs)} DIGITAL PDFs (direct extraction)")
    elif args.ocr_only:
        pdfs = [p for p in pdfs if p["extraction_method"] in ("VLM_OCR", "HYBRID")]
        print(f"🔍 Processing {len(pdfs)} SCANNED/HANDWRITTEN PDFs (VLM OCR)")
    else:
        print(f"📊 Processing {len(pdfs)} total PDFs")
    
    # Separate by method
    digital_pdfs = [p for p in pdfs if p["extraction_method"] == "DIRECT"]
    ocr_pdfs = [p for p in pdfs if p["extraction_method"] in ("VLM_OCR", "HYBRID")]
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success_digital = 0
    success_ocr = 0
    errors = []
    
    # Phase 1: Digital extraction (fast!)
    if digital_pdfs and not args.ocr_only:
        print(f"\n⚡ Phase 1: Digital text extraction ({len(digital_pdfs)} files)")
        
        for pdf_info in tqdm(digital_pdfs, desc="Extracting", unit="PDFs"):
            pdf_path = PDF_DIR / pdf_info["filename"]
            if not pdf_path.exists():
                errors.append((pdf_info["filename"], "not found"))
                continue
            
            try:
                text = extract_digital_pdf(pdf_path)
                save_text(pdf_info["filename"], text, OUTPUT_DIR)
                success_digital += 1
            except Exception as e:
                errors.append((pdf_info["filename"], str(e)[:50]))
        
        print(f"   ✅ Extracted: {success_digital}")
    
    # Phase 2: VLM OCR (parallel)
    if ocr_pdfs and not args.digital_only:
        print(f"\n🔍 Phase 2: VLM OCR ({len(ocr_pdfs)} files)")
        
        # Check OCR server
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:8001/health") as resp:
                    if resp.status != 200:
                        raise Exception("Server not healthy")
        except Exception:
            print("❌ Hunyuan OCR server not running on port 8001")
            print("   Start with: vllm serve tencent/HunyuanOCR --port 8001")
            return
        
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        
        async with aiohttp.ClientSession() as session:
            for pdf_info in tqdm(ocr_pdfs, desc="OCR", unit="PDFs"):
                pdf_path = PDF_DIR / pdf_info["filename"]
                if not pdf_path.exists():
                    errors.append((pdf_info["filename"], "not found"))
                    continue
                
                try:
                    text = await ocr_pdf_vlm(pdf_path, session, semaphore)
                    save_text(pdf_info["filename"], text, OUTPUT_DIR)
                    success_ocr += 1
                except Exception as e:
                    errors.append((pdf_info["filename"], str(e)[:50]))
        
        print(f"   ✅ OCR'd: {success_ocr}")
    
    # Summary
    print(f"\n📊 Summary:")
    print(f"   Digital extracted: {success_digital}")
    print(f"   VLM OCR'd: {success_ocr}")
    print(f"   Errors: {len(errors)}")
    
    if errors:
        print(f"\n⚠️  Errors:")
        for f, e in errors[:5]:
            print(f"   {f[:40]}: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Smart OCR Pipeline")
    parser.add_argument("--digital-only", action="store_true", help="Only extract digital PDFs")
    parser.add_argument("--ocr-only", action="store_true", help="Only VLM OCR scanned PDFs")
    args = parser.parse_args()
    
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
