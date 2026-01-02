#!/usr/bin/env python3
"""
PDF Analysis Tool - Classifies PDFs for optimal extraction method.

Analyzes each PDF to determine:
- DIGITAL: Text-based, use direct extraction (fast)
- SCANNED: Image-based, needs VLM OCR
- HANDWRITTEN: Detected handwriting, needs VLM OCR with entity hints
- MIXED: Some pages text, some image

Usage:
  python -m scripts.analyze_pdfs
"""

from __future__ import annotations

import json
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Literal
from tqdm import tqdm

# Try PyMuPDF first (faster), fall back to pypdf
try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False
    from pypdf import PdfReader

# Configuration
PDF_DIR = Path("/home/astraithious/shs-engine/SHS_Materials")
OUTPUT_FILE = Path("/home/astraithious/shs-engine/data/pdf_analysis.json")

# Classification thresholds
MIN_TEXT_CHARS_PER_PAGE = 100  # Pages with less text are likely image-based
TEXT_PAGE_RATIO_THRESHOLD = 0.7  # 70%+ text pages = DIGITAL


@dataclass
class PageAnalysis:
    page_num: int
    text_chars: int
    has_images: bool
    classification: Literal["TEXT", "IMAGE", "MIXED", "EMPTY"]


@dataclass
class PDFAnalysis:
    filename: str
    total_pages: int
    text_pages: int
    image_pages: int
    mixed_pages: int
    empty_pages: int
    total_text_chars: int
    classification: Literal["DIGITAL", "SCANNED", "HANDWRITTEN", "MIXED", "EMPTY"]
    extraction_method: Literal["DIRECT", "VLM_OCR", "HYBRID"]
    notes: str = ""


def analyze_page_fitz(page) -> PageAnalysis:
    """
    Analyze a single page using PyMuPDF with MULTI-SIGNAL detection.
    
    Uses 5 signals for high accuracy classification (2025 best practices):
    1. Text extraction character count
    2. Image area vs page area ratio
    3. Garbled unicode detection (chr(0xFFFD))
    4. Embedded font count
    5. High vector drawing count (simulated text)
    """
    # Signal 1: Text extraction
    text = page.get_text().strip()
    text_chars = len(text)
    
    # Signal 2: Image area vs page area
    images = page.get_images()
    has_images = len(images) > 0
    
    page_area = page.rect.width * page.rect.height
    image_area = 0
    
    try:
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block.get("type") == 1:  # Image block
                bbox = block.get("bbox", (0, 0, 0, 0))
                block_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                image_area += block_area
    except Exception:
        pass  # Fall back to simple image detection
    
    image_coverage = image_area / page_area if page_area > 0 else 0
    
    # Signal 3: Garbled unicode detection
    has_garbled = chr(0xFFFD) in text  # Invalid unicode chars indicate missing char map
    
    # Signal 4: Embedded font count
    try:
        fonts = page.get_fonts()
        font_count = len(fonts)
    except Exception:
        font_count = 0
    
    # Signal 5: High vector drawing count (simulated text)
    try:
        drawings = page.get_drawings()
        has_simulated_text = len(drawings) > 1000
    except Exception:
        has_simulated_text = False
    
    # WEIGHTED SCORING (2025 best practice)
    ocr_score = 0
    
    if text_chars < MIN_TEXT_CHARS_PER_PAGE:
        ocr_score += 30  # 30% weight: Low text extraction
    
    if image_coverage > 0.8:
        ocr_score += 30  # 30% weight: High image coverage
    
    if font_count == 0:
        ocr_score += 20  # 20% weight: No embedded fonts (scanned)
    
    if has_garbled:
        ocr_score += 15  # 15% weight: Garbled unicode (missing char map)
    
    if has_simulated_text:
        ocr_score += 5   # 5% weight: Vector graphics as text
    
    # Classify based on weighted score
    if ocr_score >= 60:
        classification = "IMAGE"  # Needs VLM OCR
    elif ocr_score >= 30:
        classification = "MIXED"  # Partial OCR may help
    elif text_chars < 10:
        classification = "EMPTY"
    else:
        classification = "TEXT"   # Direct extraction works
    
    return PageAnalysis(
        page_num=page.number + 1,
        text_chars=text_chars,
        has_images=has_images,
        classification=classification,
    )


def analyze_page_pypdf(page, page_num: int) -> PageAnalysis:
    """Analyze a single page using pypdf."""
    try:
        text = page.extract_text() or ""
        text = text.strip()
    except Exception:
        text = ""
    
    text_chars = len(text)
    
    # pypdf doesn't easily expose image count, assume images if low text
    has_images = text_chars < 100
    
    if text_chars >= MIN_TEXT_CHARS_PER_PAGE:
        classification = "TEXT"
    elif text_chars < 10:
        classification = "EMPTY"
    else:
        classification = "IMAGE"  # Assume image if little text
    
    return PageAnalysis(
        page_num=page_num,
        text_chars=text_chars,
        has_images=has_images,
        classification=classification,
    )


def analyze_pdf(pdf_path: Path) -> PDFAnalysis:
    """
    Analyze a PDF and classify it for extraction.
    
    Uses RANDOM INNER PAGE SAMPLING to avoid bias from:
    - Cover pages (often digital)
    - Table of contents (often digital)
    - Appendices/references (often digital)
    
    Samples up to 5 random pages from the middle 70% of the document.
    """
    import random
    
    try:
        if HAS_FITZ:
            doc = fitz.open(pdf_path)
            total_pages = len(doc)
        else:
            reader = PdfReader(str(pdf_path))
            total_pages = len(reader.pages)
    except Exception as e:
        return PDFAnalysis(
            filename=pdf_path.name,
            total_pages=0,
            text_pages=0,
            image_pages=0,
            mixed_pages=0,
            empty_pages=0,
            total_text_chars=0,
            classification="EMPTY",
            extraction_method="VLM_OCR",
            notes=f"Error: {str(e)[:50]}",
        )
    
    if total_pages == 0:
        if HAS_FITZ:
            doc.close()
        return PDFAnalysis(
            filename=pdf_path.name,
            total_pages=0,
            text_pages=0, image_pages=0, mixed_pages=0, empty_pages=0,
            total_text_chars=0,
            classification="EMPTY",
            extraction_method="VLM_OCR",
        )
    
    # Determine which pages to sample (skip first 15% and last 15%)
    # This avoids cover pages, TOCs, and appendices in academic documents
    skip_start = max(2, int(total_pages * 0.15))  # At least skip first 2 pages
    skip_end = max(2, int(total_pages * 0.15))    # At least skip last 2 pages
    
    inner_start = skip_start
    inner_end = total_pages - skip_end
    
    # For very short docs (< 6 pages), analyze all
    if inner_end <= inner_start:
        sample_indices = list(range(total_pages))
    else:
        # Sample up to 5 random inner pages
        inner_pages = list(range(inner_start, inner_end))
        sample_size = min(5, len(inner_pages))
        sample_indices = random.sample(inner_pages, sample_size)
    
    # Analyze sampled pages
    page_analyses = []
    try:
        if HAS_FITZ:
            for i in sample_indices:
                page_analyses.append(analyze_page_fitz(doc[i]))
            doc.close()
        else:
            for i in sample_indices:
                page_analyses.append(analyze_page_pypdf(reader.pages[i], i+1))
    except Exception as e:
        if HAS_FITZ:
            try:
                doc.close()
            except:
                pass
        return PDFAnalysis(
            filename=pdf_path.name,
            total_pages=total_pages,
            text_pages=0, image_pages=0, mixed_pages=0, empty_pages=0,
            total_text_chars=0,
            classification="SCANNED",
            extraction_method="VLM_OCR",
            notes=f"Sample error: {str(e)[:30]}",
        )
    
    # Count page types from sample
    text_pages = sum(1 for p in page_analyses if p.classification == "TEXT")
    image_pages = sum(1 for p in page_analyses if p.classification == "IMAGE")
    mixed_pages = sum(1 for p in page_analyses if p.classification == "MIXED")
    empty_pages = sum(1 for p in page_analyses if p.classification == "EMPTY")
    total_text_chars = sum(p.text_chars for p in page_analyses)
    sampled = len(page_analyses)
    
    # Classify PDF based on SAMPLED inner pages
    notes = f"Sampled {sampled}/{total_pages} inner pages"
    
    if sampled == 0:
        classification = "SCANNED"
        extraction_method = "VLM_OCR"
    elif text_pages / sampled >= TEXT_PAGE_RATIO_THRESHOLD:
        classification = "DIGITAL"
        extraction_method = "DIRECT"
    elif image_pages / sampled >= TEXT_PAGE_RATIO_THRESHOLD:
        classification = "SCANNED"
        extraction_method = "VLM_OCR"
    elif mixed_pages > 0 or (text_pages > 0 and image_pages > 0):
        classification = "MIXED"
        extraction_method = "HYBRID"
    else:
        classification = "SCANNED"
        extraction_method = "VLM_OCR"
    
    # Check for potential handwriting (heuristic: historical docs often have specific patterns)
    if "APS" in pdf_path.name or "LAC" in pdf_path.name:
        if classification in ("SCANNED", "MIXED"):
            classification = "HANDWRITTEN"
            notes += " | Historical archive"
    
    return PDFAnalysis(
        filename=pdf_path.name,
        total_pages=total_pages,
        text_pages=text_pages,
        image_pages=image_pages,
        mixed_pages=mixed_pages,
        empty_pages=empty_pages,
        total_text_chars=total_text_chars,
        classification=classification,
        extraction_method=extraction_method,
        notes=notes,
    )



def main() -> None:
    print("📊 PDF Analysis Tool - Smart Classification")
    print(f"   Using: {'PyMuPDF (fitz)' if HAS_FITZ else 'pypdf'}")
    print(f"   Source: {PDF_DIR}")
    
    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    print(f"   Found: {len(pdf_files)} PDFs")
    
    results = []
    
    for pdf_path in tqdm(pdf_files, desc="Analyzing", unit="PDFs"):
        analysis = analyze_pdf(pdf_path)
        results.append(asdict(analysis))
    
    # Summary statistics
    classifications = {}
    methods = {}
    for r in results:
        c = r["classification"]
        m = r["extraction_method"]
        classifications[c] = classifications.get(c, 0) + 1
        methods[m] = methods.get(m, 0) + 1
    
    print("\n📈 Classification Summary:")
    for c, count in sorted(classifications.items()):
        pct = count / len(results) * 100
        print(f"   {c}: {count} ({pct:.1f}%)")
    
    print("\n🔧 Extraction Methods:")
    for m, count in sorted(methods.items()):
        pct = count / len(results) * 100
        print(f"   {m}: {count} ({pct:.1f}%)")
    
    # Save results
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump({
            "summary": {
                "total_pdfs": len(results),
                "classifications": classifications,
                "extraction_methods": methods,
            },
            "pdfs": results,
        }, f, indent=2)
    
    print(f"\n✅ Results saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
