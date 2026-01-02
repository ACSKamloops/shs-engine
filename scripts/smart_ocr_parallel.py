#!/usr/bin/env python3
"""
Smart OCR Pipeline with Parallel Processing.

Uses multi-signal classification to route documents optimally:
- DIRECT: PyMuPDF text extraction (fast)
- VLM_OCR/HYBRID: Hunyuan VLM with parallel async requests (vLLM batching)

vLLM continuous batching: sends 4 concurrent requests, vLLM batches automatically.

Usage:
  python -m scripts.smart_ocr_parallel
  python -m scripts.smart_ocr_parallel --digital-only
  python -m scripts.smart_ocr_parallel --ocr-only
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import tempfile
import base64
import re
from pathlib import Path
import aiohttp
from tqdm import tqdm
from tqdm.asyncio import tqdm as atqdm

# Try PyMuPDF for DIRECT extraction
try:
    import fitz
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

# Configuration
PDF_DIR = Path("/home/astraithious/shs-engine/SHS_Materials")
OUTPUT_DIR = Path("/home/astraithious/shs-engine/data/processed")
ANALYSIS_FILE = Path("/home/astraithious/shs-engine/data/pdf_analysis.json")
OCR_URL = "http://localhost:8001/v1/chat/completions"
MODEL = "tencent/HunyuanOCR"

# Parallel settings - vLLM will batch these automatically
MAX_CONCURRENT_PAGES = 4  # Number of concurrent page OCR requests

# Verbatim prompt (legal research quality) - STRENGTHENED to prevent AI preambles
VERBATIM_PROMPT = (
    "OUTPUT ONLY THE RAW TEXT. DO NOT ANALYZE OR DESCRIBE.\n\n"
    "Rules:\n"
    "1. Transcribe ONLY the exact visible text, character by character\n"
    "2. Preserve ALL original spelling, punctuation, line breaks, errors\n"
    "3. DO NOT add any of your own words or analysis\n"
    "4. DO NOT start with 'The text shows', 'This appears to be', 'I can see', etc.\n"
    "5. DO NOT describe the document format, layout, or handwriting style\n"
    "6. If text is unclear, write [illegible]\n"
    "7. Start your response directly with the first word of the document\n\n"
    "BEGIN TRANSCRIPTION:"
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


def clean_repetitions(text: str) -> str:
    """Post-processing cleanup of repetition artifacts."""
    return re.sub(r'(.)\1{15,}', r'\1\1\1', text)


async def ocr_image_async(
    session: aiohttp.ClientSession, 
    image_path: Path, 
    semaphore: asyncio.Semaphore
) -> str:
    """OCR a single image with async request."""
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
            return clean_repetitions(text)


async def ocr_pdf_parallel(pdf_path: Path, session: aiohttp.ClientSession, semaphore: asyncio.Semaphore) -> str:
    """OCR a PDF using VLM with PARALLEL page requests (vLLM batching)."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        images = pdf_to_images(pdf_path, tmpdir)
        
        if not images:
            return ""
        
        # OCR all pages in PARALLEL - vLLM batches automatically
        tasks = [ocr_image_async(session, img, semaphore) for img in images]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
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
    
    # Phase 2: VLM OCR (PARALLEL!)
    if ocr_pdfs and not args.digital_only:
        # Check for existing outputs to skip
        existing = {f.stem for f in OUTPUT_DIR.glob("*.txt")}
        to_process = [p for p in ocr_pdfs if p["filename"].replace(".pdf", "") not in existing]
        skipped = len(ocr_pdfs) - len(to_process)
        
        print(f"\n🚀 Phase 2: VLM OCR with Parallel Batching")
        print(f"   Total: {len(ocr_pdfs)} | Skipped (existing): {skipped} | To process: {len(to_process)}")
        print(f"   Concurrent requests: {MAX_CONCURRENT_PAGES}")
        print(f"   Settings: temperature=0.0, repetition_penalty=1.0 (verbatim)")
        
        if not to_process:
            print("   ✅ All files already processed!")
            return
        
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
        
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_PAGES)
        
        async with aiohttp.ClientSession() as session:
            for pdf_info in tqdm(to_process, desc="OCR", unit="PDFs"):
                pdf_path = PDF_DIR / pdf_info["filename"]
                if not pdf_path.exists():
                    errors.append((pdf_info["filename"], "not found"))
                    continue
                
                try:
                    text = await ocr_pdf_parallel(pdf_path, session, semaphore)
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
    parser = argparse.ArgumentParser(description="Smart OCR Pipeline with Parallel Processing")
    parser.add_argument("--digital-only", action="store_true", help="Only extract digital PDFs")
    parser.add_argument("--ocr-only", action="store_true", help="Only VLM OCR scanned PDFs")
    args = parser.parse_args()
    
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
