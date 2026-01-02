#!/usr/bin/env python3
"""
OCR Quality Assurance Test Script

Implements the standard testing protocol for verifying OCR output quality.
Run this after each OCR batch to ensure zero AI contamination.

Usage:
  python -m scripts.ocr_qa_test
  python -m scripts.ocr_qa_test --visual  # Include visual verification
"""

from __future__ import annotations

import argparse
import re
import subprocess
import tempfile
from pathlib import Path
from dataclasses import dataclass

# Configuration
STAGING_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
PDF_DIR = Path("/home/astraithious/pukaist-engine/Pukaist")
QUALITY_CHECK_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/quality_check_images")

# AI contamination patterns to detect (refined to avoid false positives)
# These patterns indicate AI-generated preambles/analysis, not legitimate historical text
AI_PATTERNS = [
    # AI descriptions of the document
    (r"the text shows|the text contains|the text appears|the document shows|the document contains", "Text description"),
    (r"the handwritten text|the handwritten note|the cursive text|handwritten notes show", "Handwriting description"),
    # AI analysis preambles (start of response)
    (r"^I can see|^I'll analyze|^I'll transcribe|^let me transcribe", "First-person preamble"),
    (r"^to address the|^here is the|^here's the transcription", "AI preamble"),
    (r"^this appears to be|^this seems to be|^this looks like|^this is a", "Appearance preamble"),
    # Markdown formatting (AI-generated structure)
    (r"^###\s|^\*\*[A-Z][a-z]+\*\*", "Markdown formatting"),
    # Analysis phrases mid-sentence
    (r"I'll break down|I'll provide|I can transcribe|let me analyze", "Analysis phrases"),
]


@dataclass
class QAResult:
    filename: str
    size_bytes: int
    line_count: int
    ai_patterns_found: list[tuple[str, str]]
    is_clean: bool


def check_file_patterns(filepath: Path) -> QAResult:
    """Check a file for AI contamination patterns."""
    content = filepath.read_text()
    patterns_found = []
    
    for pattern, name in AI_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
            # Find the actual match for context
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                start = max(0, match.start() - 20)
                end = min(len(content), match.end() + 20)
                context = content[start:end].replace('\n', ' ')
                patterns_found.append((name, context))
    
    return QAResult(
        filename=filepath.name,
        size_bytes=filepath.stat().st_size,
        line_count=len(content.splitlines()),
        ai_patterns_found=patterns_found,
        is_clean=len(patterns_found) == 0
    )


def deep_content_review(filepath: Path) -> dict:
    """Review first, middle, and last sections of file."""
    content = filepath.read_text()
    lines = content.splitlines()
    
    return {
        "first_500": content[:500],
        "middle": '\n'.join(lines[20:30]) if len(lines) > 30 else '\n'.join(lines[len(lines)//2:len(lines)//2+5]),
        "last_300": content[-300:],
    }


def visual_verification(txt_filename: str) -> Path | None:
    """Convert corresponding PDF to image for visual comparison."""
    pdf_name = txt_filename.replace(".txt", ".pdf")
    pdf_path = PDF_DIR / pdf_name
    
    if not pdf_path.exists():
        return None
    
    QUALITY_CHECK_DIR.mkdir(parents=True, exist_ok=True)
    output_prefix = QUALITY_CHECK_DIR / pdf_path.stem
    
    subprocess.run([
        "pdftoppm", "-png", "-r", "150", "-l", "1",
        str(pdf_path), str(output_prefix)
    ], check=True, capture_output=True)
    
    images = list(QUALITY_CHECK_DIR.glob(f"{pdf_path.stem}*.png"))
    return images[0] if images else None


def run_qa_test(visual: bool = False, sample_size: int = 10) -> None:
    """Run the full QA test suite."""
    txt_files = list(STAGING_DIR.glob("*.txt"))
    
    print("=" * 60)
    print("OCR QUALITY ASSURANCE TEST")
    print("=" * 60)
    print(f"\nTotal files: {len(txt_files)}")
    
    # Phase 1: Automated Pattern Detection
    print("\n" + "-" * 40)
    print("PHASE 1: Automated Pattern Detection")
    print("-" * 40)
    
    clean_count = 0
    contaminated = []
    
    for txt_file in txt_files:
        result = check_file_patterns(txt_file)
        if result.is_clean:
            clean_count += 1
        else:
            contaminated.append(result)
    
    print(f"✅ Clean files: {clean_count}")
    print(f"⚠️  Contaminated: {len(contaminated)}")
    
    if contaminated:
        print("\nContaminated files:")
        for r in contaminated[:10]:
            print(f"  - {r.filename}")
            for pattern_name, context in r.ai_patterns_found:
                print(f"    {pattern_name}: ...{context}...")
    
    # Phase 2: Deep Content Review (sample)
    print("\n" + "-" * 40)
    print(f"PHASE 2: Deep Content Review (sample of {min(sample_size, len(txt_files))})")
    print("-" * 40)
    
    import random
    sample = random.sample(txt_files, min(sample_size, len(txt_files)))
    
    for txt_file in sample[:3]:  # Show 3 examples
        print(f"\n📄 {txt_file.name}")
        review = deep_content_review(txt_file)
        print(f"   First 100: {review['first_500'][:100]}...")
        print(f"   Last 100: ...{review['last_300'][-100:]}")
    
    # Phase 3: Visual Verification (optional)
    if visual:
        print("\n" + "-" * 40)
        print("PHASE 3: Visual Verification")
        print("-" * 40)
        
        for txt_file in sample[:3]:
            img_path = visual_verification(txt_file.name)
            if img_path:
                print(f"✅ Created: {img_path}")
            else:
                print(f"⚠️  No PDF found for: {txt_file.name}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    contamination_rate = len(contaminated) / len(txt_files) * 100 if txt_files else 0
    print(f"Total files tested: {len(txt_files)}")
    print(f"Clean: {clean_count} ({100 - contamination_rate:.1f}%)")
    print(f"Contaminated: {len(contaminated)} ({contamination_rate:.1f}%)")
    
    if contamination_rate == 0:
        print("\n✅ PASS: Zero AI contamination detected!")
    else:
        print(f"\n❌ FAIL: {contamination_rate:.1f}% contamination rate")


def main():
    parser = argparse.ArgumentParser(description="OCR Quality Assurance Test")
    parser.add_argument("--visual", action="store_true", help="Include visual verification")
    parser.add_argument("--sample", type=int, default=10, help="Sample size for deep review")
    args = parser.parse_args()
    
    run_qa_test(visual=args.visual, sample_size=args.sample)


if __name__ == "__main__":
    main()
