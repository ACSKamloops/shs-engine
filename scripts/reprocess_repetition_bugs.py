#!/usr/bin/env python3
"""
Re-process OCR files that had repetition bugs.

Reads REPETITION_BUGS.json, finds the source PDFs, and re-runs OCR
with improved anti-repetition settings.

Usage:
  python -m scripts.reprocess_repetition_bugs
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from tqdm import tqdm

# Configuration
STAGING_DIR = Path("/home/astraithious/pukaist-engine/99_Working_Files/Evidence_Staging")
PDF_SOURCE_DIR = Path("/mnt/c/Users/Astraithious/Documents/Pukaist")
BUGS_FILE = STAGING_DIR / "REPETITION_BUGS.json"


def find_source_pdf(txt_filename: str) -> Path | None:
    """Find the source PDF for a given OCR txt file."""
    # Extract base name without .txt extension
    base = txt_filename.replace(".txt", "")
    
    # Try common patterns
    patterns = [
        f"{base}.pdf",
        f"{base.replace('_processed', '')}.pdf",
    ]
    
    for pattern in patterns:
        pdf_path = PDF_SOURCE_DIR / pattern
        if pdf_path.exists():
            return pdf_path
    
    # Search for partial match
    for pdf in PDF_SOURCE_DIR.glob("*.pdf"):
        # Match on document ID (e.g., D1000, D1008)
        txt_id = base.split("_")[0] if "_" in base else base
        if pdf.name.startswith(txt_id):
            return pdf
    
    return None


def reprocess_with_cleanup(txt_path: Path) -> bool:
    """Apply post-processing cleanup to existing OCR output."""
    import re
    
    try:
        content = txt_path.read_text(errors="ignore")
        original_len = len(content)
        
        # Clean single character repetitions
        content = re.sub(r'(.)\1{15,}', r'\1\1\1', content)
        
        # Clean phrase repetitions (simpler approach)
        words = content.split()
        if len(words) > 100:
            # Find and remove repeated 5-word phrases
            cleaned_words = []
            i = 0
            while i < len(words):
                if i + 10 < len(words):
                    phrase1 = " ".join(words[i:i+5])
                    phrase2 = " ".join(words[i+5:i+10])
                    if phrase1 == phrase2:
                        # Skip repeated phrase
                        i += 5
                        continue
                cleaned_words.append(words[i])
                i += 1
            content = " ".join(cleaned_words)
        
        # Write back if changed significantly
        new_len = len(content)
        if new_len < original_len * 0.9:  # Removed at least 10%
            # Backup original
            backup_path = txt_path.with_suffix(".txt.bak")
            txt_path.rename(backup_path)
            txt_path.write_text(content)
            return True
        elif new_len < original_len:
            txt_path.write_text(content)
            return True
            
        return False
    except Exception as e:
        print(f"Error processing {txt_path.name}: {e}")
        return False


def main() -> None:
    if not BUGS_FILE.exists():
        print(f"❌ Bugs file not found: {BUGS_FILE}")
        return
    
    with open(BUGS_FILE) as f:
        bugs = json.load(f)
    
    print(f"🔧 Found {len(bugs)} files with repetition bugs")
    print(f"   Applying post-processing cleanup...")
    
    cleaned = 0
    unchanged = 0
    
    with tqdm(bugs, desc="Cleaning", unit="files") as pbar:
        for bug in pbar:
            txt_path = STAGING_DIR / bug["filename"]
            if not txt_path.exists():
                continue
                
            if reprocess_with_cleanup(txt_path):
                cleaned += 1
                pbar.set_postfix({"cleaned": cleaned})
            else:
                unchanged += 1
    
    print(f"\n✅ Completed:")
    print(f"   Cleaned: {cleaned}")
    print(f"   Unchanged: {unchanged}")
    

if __name__ == "__main__":
    main()
