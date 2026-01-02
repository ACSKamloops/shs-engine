#!/usr/bin/env python3
"""
OCR Quality Testing Framework

This script creates a reproducible testing framework to measure and improve
HunyuanOCR accuracy on handwritten historical documents.
"""
import os
import sys
import json
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

# Ensure we can import from src
sys.path.insert(0, str(Path(__file__).parent.parent))


@dataclass
class TestCase:
    """A test case for OCR accuracy measurement."""
    name: str
    pdf_path: Path
    page_num: int = 1
    ground_truth: Optional[str] = None  # Known correct text (for comparison)
    notes: str = ""


@dataclass
class PreprocessingConfig:
    """Configuration for image preprocessing."""
    dpi: int = 400
    use_clahe: bool = True
    clahe_clip_limit: float = 2.0
    clahe_grid_size: int = 8
    use_denoising: bool = False
    denoise_strength: int = 10
    use_sharpening: bool = False
    sharpen_amount: float = 1.5
    use_adaptive_threshold: bool = False
    convert_grayscale: bool = True


def preprocess_image_advanced(image_path: Path, config: PreprocessingConfig) -> Path:
    """
    Apply advanced preprocessing to improve OCR accuracy.
    
    Based on 2025 research:
    - CLAHE for contrast enhancement
    - Bilateral denoising (preserves edges while removing noise)
    - Optional sharpening
    - Optional adaptive thresholding
    """
    import cv2
    import numpy as np
    
    img = cv2.imread(str(image_path))
    if img is None:
        return image_path
    
    # Convert to grayscale
    if config.convert_grayscale:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    
    # Bilateral denoising (preserves edges better than Gaussian)
    if config.use_denoising:
        gray = cv2.bilateralFilter(gray, 9, config.denoise_strength, config.denoise_strength)
    
    # CLAHE for adaptive contrast enhancement
    if config.use_clahe:
        clahe = cv2.createCLAHE(
            clipLimit=config.clahe_clip_limit, 
            tileGridSize=(config.clahe_grid_size, config.clahe_grid_size)
        )
        gray = clahe.apply(gray)
    
    # Sharpening
    if config.use_sharpening:
        # Unsharp masking
        gaussian = cv2.GaussianBlur(gray, (0, 0), 3)
        gray = cv2.addWeighted(gray, config.sharpen_amount, gaussian, -(config.sharpen_amount - 1), 0)
    
    # Adaptive thresholding (optional - for very degraded documents)
    if config.use_adaptive_threshold:
        gray = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
    
    # Save preprocessed image
    out_path = image_path.with_suffix('.test_preprocessed.png')
    cv2.imwrite(str(out_path), gray)
    return out_path


def convert_pdf_page_to_image(pdf_path: Path, page_num: int, dpi: int) -> Path:
    """Convert a single PDF page to an image."""
    from pdf2image import convert_from_path
    
    images = convert_from_path(
        str(pdf_path), 
        dpi=dpi, 
        first_page=page_num, 
        last_page=page_num
    )
    
    out_path = Path(f"/tmp/ocr_test_{pdf_path.stem}_p{page_num}.png")
    images[0].save(out_path, 'PNG')
    return out_path


def run_ocr(image_path: Path, prompt: Optional[str] = None, use_hq: bool = False) -> str:
    """Run HunyuanOCR on an image."""
    if use_hq:
        os.environ["PUKAIST_OCR_HQ"] = "true"
    else:
        os.environ.pop("PUKAIST_OCR_HQ", None)
    
    from src.hunyuan_ocr import extract_text_with_hunyuan
    return extract_text_with_hunyuan(image_path, prompt=prompt)


def calculate_accuracy(ocr_output: str, ground_truth: str) -> dict:
    """
    Calculate accuracy metrics.
    
    Returns character-level and word-level accuracy.
    """
    import difflib
    
    # Normalize whitespace
    ocr_normalized = ' '.join(ocr_output.split())
    truth_normalized = ' '.join(ground_truth.split())
    
    # Character-level similarity
    char_ratio = difflib.SequenceMatcher(None, ocr_normalized, truth_normalized).ratio()
    
    # Word-level similarity
    ocr_words = ocr_normalized.split()
    truth_words = truth_normalized.split()
    word_ratio = difflib.SequenceMatcher(None, ocr_words, truth_words).ratio()
    
    # Count matching words
    matching_words = sum(1 for w in ocr_words if w in truth_words)
    total_words = len(truth_words)
    word_coverage = matching_words / total_words if total_words > 0 else 0
    
    return {
        "char_accuracy": round(char_ratio * 100, 2),
        "word_accuracy": round(word_ratio * 100, 2),
        "word_coverage": round(word_coverage * 100, 2),
        "ocr_length": len(ocr_normalized),
        "truth_length": len(truth_normalized),
    }


def run_test(
    test_case: TestCase,
    config: PreprocessingConfig,
    prompt: Optional[str] = None,
    use_hq: bool = False,
) -> dict:
    """Run a single test case with given config."""
    # Convert PDF to image
    raw_image = convert_pdf_page_to_image(test_case.pdf_path, test_case.page_num, config.dpi)
    
    # Preprocess
    preprocessed = preprocess_image_advanced(raw_image, config)
    
    # Run OCR
    ocr_output = run_ocr(preprocessed, prompt=prompt, use_hq=use_hq)
    
    # Calculate accuracy if ground truth available
    accuracy = None
    if test_case.ground_truth:
        accuracy = calculate_accuracy(ocr_output, test_case.ground_truth)
    
    # Cleanup
    if preprocessed != raw_image:
        preprocessed.unlink(missing_ok=True)
    raw_image.unlink(missing_ok=True)
    
    return {
        "test_name": test_case.name,
        "config": {
            "dpi": config.dpi,
            "clahe": config.use_clahe,
            "denoising": config.use_denoising,
            "sharpening": config.use_sharpening,
        },
        "ocr_output": ocr_output,
        "accuracy": accuracy,
        "prompt": prompt,
        "use_hq": use_hq,
    }


# Predefined test prompts to try
OCR_PROMPTS = {
    "simple": "Transcribe all text in this image exactly as written, preserving line breaks.",
    "detailed": "This is a historical handwritten letter. Transcribe every word exactly as written, including misspellings and abbreviations. Preserve line breaks and paragraph structure.",
    "structured": "Read this handwritten document carefully. Output all text exactly as written. Include dates, names, and places accurately. Preserve the original formatting.",
    "historical": "This is a historical document from the early 1900s. Transcribe all handwritten text verbatim. Pay special attention to proper nouns, dates, and place names.",
}


if __name__ == "__main__":
    # Example usage
    print("OCR Quality Testing Framework")
    print("=" * 50)
    print("\nUsage:")
    print("  from scripts.ocr_test_framework import run_test, TestCase, PreprocessingConfig")
    print("  ")
    print("  test = TestCase(")
    print("      name='Sample Letter',")
    print("      pdf_path=Path('/path/to/document.pdf'),")
    print("      page_num=1,")
    print("      ground_truth='Known correct text...',")
    print("  )")
    print("  ")
    print("  config = PreprocessingConfig(dpi=400, use_clahe=True)")
    print("  result = run_test(test, config)")
    print("  print(f'Accuracy: {result[\"accuracy\"]}')")
