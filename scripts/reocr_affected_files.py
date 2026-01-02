#!/usr/bin/env python3
"""
Re-OCR files that had repetition bugs using Hunyuan OCR with optimal settings.

Reads REPETITION_BUGS.json, finds the source PDFs, converts them to images,
and re-runs OCR with improved verbatim settings:
- temperature=0.0 (greedy decoding)
- repetition_penalty=1.0 (no penalty for verbatim)
- Strong verbatim prompting

Usage:
  python -m scripts.reocr_affected_files
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from tqdm import tqdm
import requests
import base64

# Configuration
STAGING_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
PDF_SOURCE_DIR = Path("/home/astraithious/pukaist-engine/Pukaist")
BUGS_FILE = STAGING_DIR / "REPETITION_BUGS.json"
OCR_URL = "http://localhost:8001/v1/chat/completions"
MODEL = "tencent/HunyuanOCR"

# Strict verbatim prompt
VERBATIM_PROMPT = (
    "Transcribe ONLY the exact text visible in this document image. "
    "Preserve original spelling, punctuation, line breaks, and casing exactly as written - including any errors. "
    "Do NOT correct, summarize, describe, or paraphrase. "
    "Do NOT start with phrases like 'The handwritten text is' or 'The document contains'. "
    "Mark unclear words as [illegible]. Output only the transcription, nothing else."
)


def find_source_pdf(txt_filename: str) -> Path | None:
    """Find the source PDF for a given OCR txt file."""
    # txt filename is like "D1000_APS_045_121304.txt" 
    # pdf filename is like "D1000_APS_045_121304.pdf"
    base = txt_filename.replace(".txt", "")
    
    # Direct match
    pdf_path = PDF_SOURCE_DIR / f"{base}.pdf"
    if pdf_path.exists():
        return pdf_path
    
    # Remove suffixes like "_processed" or "_Transcript_ND"
    base_clean = base.replace("_processed", "").replace("_Transcript_ND", "")
    pdf_path = PDF_SOURCE_DIR / f"{base_clean}.pdf"
    if pdf_path.exists():
        return pdf_path
    
    # Search by document ID prefix (D1000_, D1008_)
    doc_id = base.split("_")[0] if "_" in base else base
    for pdf in PDF_SOURCE_DIR.glob(f"{doc_id}_*.pdf"):
        return pdf
    
    return None



def pdf_to_images(pdf_path: Path, output_dir: Path) -> list[Path]:
    """Convert PDF pages to PNG images."""
    output_prefix = output_dir / pdf_path.stem
    cmd = ["pdftoppm", "-png", str(pdf_path), str(output_prefix)]
    subprocess.run(cmd, check=True, capture_output=True)
    return sorted(output_dir.glob(f"{pdf_path.stem}*.png"))


def make_data_url(image_path: Path) -> str:
    """Convert image to base64 data URL."""
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def ocr_image(image_path: Path) -> str:
    """Run OCR on a single image with optimal verbatim settings."""
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
    
    resp = requests.post(OCR_URL, json=payload, timeout=300)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def clean_repetitions(text: str) -> str:
    """Post-processing cleanup of repetition artifacts."""
    import re
    
    # Clean single character repetitions
    text = re.sub(r'(.)\1{15,}', r'\1\1\1', text)
    
    return text


def main() -> None:
    if not BUGS_FILE.exists():
        print(f"❌ Bugs file not found: {BUGS_FILE}")
        return
    
    with open(BUGS_FILE) as f:
        bugs = json.load(f)
    
    print(f"🔄 Re-OCR {len(bugs)} files with optimal verbatim settings")
    print(f"   temperature=0.0, repetition_penalty=1.0")
    
    # Check server is up
    try:
        requests.get("http://localhost:8001/health", timeout=5)
    except Exception:
        print("❌ Hunyuan OCR server not running on port 8001")
        print("   Start with: vllm serve tencent/HunyuanOCR --port 8001")
        return
    
    success = 0
    failed = []
    skipped = []
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        
        for bug in tqdm(bugs, desc="Re-OCR", unit="files"):
            txt_filename = bug["filename"]
            txt_path = STAGING_DIR / txt_filename
            
            # Find source PDF
            pdf_path = find_source_pdf(txt_filename)
            if not pdf_path:
                skipped.append(txt_filename)
                continue
            
            try:
                # Convert PDF to images
                images = pdf_to_images(pdf_path, tmpdir)
                if not images:
                    skipped.append(txt_filename)
                    continue
                
                # OCR each page
                all_text = []
                for img in images:
                    page_text = ocr_image(img)
                    page_text = clean_repetitions(page_text)
                    all_text.append(page_text)
                
                # Combine and save
                combined = "\n\n".join(all_text)
                
                # Backup original
                backup_path = txt_path.with_suffix(".txt.bak2")
                if txt_path.exists():
                    txt_path.rename(backup_path)
                
                txt_path.write_text(combined)
                success += 1
                
            except Exception as e:
                failed.append((txt_filename, str(e)[:50]))
    
    print(f"\n✅ Completed:")
    print(f"   Success: {success}")
    print(f"   Skipped (no PDF): {len(skipped)}")
    print(f"   Failed: {len(failed)}")
    
    if failed:
        print("\n⚠️  Failed files:")
        for f, err in failed[:5]:
            print(f"   {f}: {err}")


if __name__ == "__main__":
    main()
