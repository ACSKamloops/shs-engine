#!/usr/bin/env python3
"""
OCR Quality Spot-Check Helper

This script prepares materials for quality review by extracting:
1. A sample page from the source PDF as PNG (for visual comparison)
2. The corresponding OCR output text

Usage:
    python scripts/quality-spot-check.py D1011_APS_259_121288 --page 1
    python scripts/quality-spot-check.py --random 5  # Random sample of 5 completed docs
"""
import argparse
import random
import sys
from pathlib import Path

# Paths
PUKAIST_DIR = Path("/home/astraithious/pukaist-engine/Pukaist")
OCR_OUTPUT_DIR = PUKAIST_DIR / "OCR_Output"
SPOT_CHECK_DIR = Path("/home/astraithious/pukaist-engine/quality_checks")


def extract_page_image(pdf_path: Path, page_num: int, output_path: Path) -> bool:
    """Extract a single page from PDF as high-quality PNG."""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(
            str(pdf_path), 
            dpi=200,  # Lower DPI for review (faster)
            first_page=page_num, 
            last_page=page_num
        )
        if images:
            images[0].save(str(output_path), 'PNG')
            return True
    except Exception as e:
        print(f"Error extracting page: {e}", file=sys.stderr)
    return False


def get_completed_docs() -> list:
    """Get list of documents that have been OCR'd."""
    completed = []
    for txt_file in OCR_OUTPUT_DIR.glob("*.txt"):
        if txt_file.stat().st_size > 0:
            pdf_name = txt_file.stem + ".pdf"
            pdf_path = PUKAIST_DIR / pdf_name
            if pdf_path.exists():
                completed.append({
                    "name": txt_file.stem,
                    "pdf_path": pdf_path,
                    "txt_path": txt_file,
                    "pdf_size_mb": pdf_path.stat().st_size / (1024 * 1024),
                    "ocr_size": txt_file.stat().st_size,
                })
    return completed


def prepare_spot_check(doc_name: str, page_num: int = 1) -> dict:
    """Prepare materials for a spot check."""
    SPOT_CHECK_DIR.mkdir(exist_ok=True)
    
    pdf_path = PUKAIST_DIR / f"{doc_name}.pdf"
    txt_path = OCR_OUTPUT_DIR / f"{doc_name}.txt"
    
    if not pdf_path.exists():
        return {"error": f"PDF not found: {pdf_path}"}
    if not txt_path.exists():
        return {"error": f"OCR output not found: {txt_path}"}
    
    # Extract the page image
    img_output = SPOT_CHECK_DIR / f"{doc_name}_page{page_num}.png"
    if not extract_page_image(pdf_path, page_num, img_output):
        return {"error": f"Failed to extract page {page_num}"}
    
    # Read OCR text for that page
    ocr_text = txt_path.read_text()
    
    # Find the specific page in OCR output
    page_marker = f"--- Page {page_num} ---"
    next_marker = f"--- Page {page_num + 1} ---"
    
    page_text = ""
    if page_marker in ocr_text:
        start = ocr_text.index(page_marker) + len(page_marker)
        if next_marker in ocr_text:
            end = ocr_text.index(next_marker)
            page_text = ocr_text[start:end].strip()
        else:
            page_text = ocr_text[start:].strip()
    else:
        page_text = ocr_text[:2000] + "..." if len(ocr_text) > 2000 else ocr_text
    
    # Save the page text for reference
    txt_output = SPOT_CHECK_DIR / f"{doc_name}_page{page_num}_ocr.txt"
    txt_output.write_text(page_text)
    
    return {
        "doc_name": doc_name,
        "page": page_num,
        "image_path": str(img_output),
        "ocr_text_path": str(txt_output),
        "ocr_text_preview": page_text[:500] + "..." if len(page_text) > 500 else page_text,
        "pdf_path": str(pdf_path),
    }


def random_sample(count: int = 5) -> list:
    """Get random sample of completed docs for spot checking."""
    completed = get_completed_docs()
    if not completed:
        return []
    
    sample_size = min(count, len(completed))
    return random.sample(completed, sample_size)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OCR Quality Spot-Check Helper")
    parser.add_argument("doc_name", nargs="?", help="Document name (without .pdf)")
    parser.add_argument("--page", type=int, default=1, help="Page number to check")
    parser.add_argument("--random", type=int, metavar="N", help="Select N random docs")
    parser.add_argument("--list", action="store_true", help="List completed documents")
    
    args = parser.parse_args()
    
    if args.list:
        completed = get_completed_docs()
        print(f"Completed OCR documents: {len(completed)}")
        for doc in sorted(completed, key=lambda x: x['ocr_size'], reverse=True)[:20]:
            print(f"  {doc['name']}: {doc['ocr_size']:,} bytes (PDF: {doc['pdf_size_mb']:.1f}MB)")
    
    elif args.random:
        samples = random_sample(args.random)
        print(f"Random sample of {len(samples)} documents:")
        for doc in samples:
            print(f"  {doc['name']} (PDF: {doc['pdf_size_mb']:.1f}MB, OCR: {doc['ocr_size']:,} bytes)")
    
    elif args.doc_name:
        result = prepare_spot_check(args.doc_name, args.page)
        if "error" in result:
            print(f"Error: {result['error']}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"Spot check prepared for: {result['doc_name']} (Page {result['page']})")
            print(f"  Image: {result['image_path']}")
            print(f"  OCR Text: {result['ocr_text_path']}")
            print(f"\nOCR Preview:\n{result['ocr_text_preview']}")
    
    else:
        parser.print_help()
