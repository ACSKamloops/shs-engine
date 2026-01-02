"""
Text extraction utilities for Pukaist Engine worker.

Handles text extraction from various document formats (PDF, DOCX, images)
with OCR fallback support for scanned or image-based documents.
"""

from __future__ import annotations

import logging
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .config import Settings

logger = logging.getLogger("pukaist.text_extraction")


def _preprocess_image_for_ocr(image_path: Path) -> Path:
    """
    Apply image preprocessing to improve OCR accuracy.
    Uses CLAHE (Contrast Limited Adaptive Histogram Equalization) for contrast enhancement.
    
    Returns path to preprocessed image (or original if preprocessing fails).
    """
    try:
        import cv2
        import numpy as np
        
        img = cv2.imread(str(image_path))
        if img is None:
            return image_path
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply CLAHE for adaptive contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Save preprocessed image
        out_path = image_path.with_suffix('.preprocessed.png')
        cv2.imwrite(str(out_path), enhanced)
        logger.debug("Preprocessed image saved to %s", out_path)
        return out_path
    except Exception:
        logger.debug("Image preprocessing failed, using original")
        return image_path


def _quality(text: str) -> tuple[float, int]:
    """
    Compute a quality score for extracted text.
    
    Returns (score, length) where score is 0.0-1.0 indicating text quality.
    """
    if not text:
        return 0.0, 0
    printable = [ch for ch in text if ch.isprintable()]
    length = len(printable)
    if length == 0:
        return 0.0, 0
    alpha = sum(ch.isalpha() for ch in printable)
    digit = sum(ch.isdigit() for ch in printable)
    printable_ratio = length / max(len(text), 1)
    alpha_ratio = alpha / length
    density = (alpha + digit) / length
    unique = len(set(printable)) / length
    score = alpha_ratio * 0.4 + density * 0.3 + printable_ratio * 0.2 + min(unique, 0.5) * 0.1
    return score, length


def _ocr_image(
    image_path: Path,
    settings: "Settings",
    prompt: str | None = None,
) -> tuple[str, str, str | None]:
    """
    Perform OCR on an image file.
    
    Returns (text, backend_name, note).
    """
    backend = "tesseract"
    note = None
    
    if settings.ocr_enabled and getattr(settings, "ocr_backend", "pytesseract") == "hunyuan":
        try:
            from .hunyuan_ocr import extract_text_with_hunyuan

            logger.info("Using HunyuanOCR backend for %s", image_path.name)
            return extract_text_with_hunyuan(image_path, prompt=prompt), "hunyuan", None
        except Exception:
            logger.exception("HunyuanOCR backend failed; falling back to pytesseract")
    
    try:
        import pytesseract  # type: ignore
        from PIL import Image  # type: ignore

        image = Image.open(str(image_path))
        text = pytesseract.image_to_string(image)
        score, length = _quality(text)
        
        if score < 0.25 or length < 30:
            if settings.ocr_enabled and getattr(settings, "ocr_backend", "pytesseract") == "hunyuan":
                try:
                    from .hunyuan_ocr import extract_text_with_hunyuan

                    logger.info("Escalating to HunyuanOCR due to low OCR quality for %s", image_path.name)
                    hy_text = extract_text_with_hunyuan(image_path, prompt=prompt)
                    hy_score, _ = _quality(hy_text)
                    if hy_text.strip() and hy_score >= score:
                        return hy_text, "hunyuan", "Escalated to Hunyuan (low tesseract quality)"
                except Exception:
                    logger.exception("HunyuanOCR escalation failed; keeping tesseract output")
            note = "Low OCR quality (tesseract)"
        return text, backend, note
    except Exception:
        logger.exception("pytesseract OCR failed; falling back to raw bytes decode")
        return image_path.read_text(errors="ignore"), "none", "pytesseract failure"


def extract_text(file_path: Path, settings: "Settings") -> tuple[str, str, str | None]:
    """
    Extract text from a file based on its extension.
    
    Supports PDF (with OCR fallback), DOCX, images, and plain text files.
    
    Args:
        file_path: Path to the file to extract text from.
        settings: Application settings for OCR configuration.
    
    Returns:
        (text, source, note) where:
        - text: The extracted text content
        - source: The extraction method used (e.g., "pdf_text", "tesseract", "hunyuan")
        - note: Optional note about extraction quality or issues
    """
    suffix = file_path.suffix.lower()
    
    # PDF extraction
    if suffix == ".pdf":
        # Try direct text extraction first
        try:
            from pypdf import PdfReader  # type: ignore

            reader = PdfReader(str(file_path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            if text.strip():
                return text, "pdf_text", None
        except Exception:
            text = ""
        
        # Fall back to OCR
        try:
            from pdf2image import convert_from_path  # type: ignore

            images = convert_from_path(str(file_path), dpi=400)  # 400 DPI for better OCR
            parts: list[str] = []
            src = "tesseract"
            note: str | None = None
            
            for img in images:
                with NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                    tmp_path = Path(tmp.name)
                    img.save(tmp_path, format="PNG")
                try:
                    # Preprocess image for better OCR (CLAHE contrast enhancement)
                    preprocessed_path = _preprocess_image_for_ocr(tmp_path)
                    ocr_text, ocr_src, ocr_note = _ocr_image(
                        preprocessed_path, 
                        settings,
                        # Use default strict verbatim prompt from hunyuan_ocr
                    )
                    # Clean up preprocessed file if different from original
                    if preprocessed_path != tmp_path:
                        preprocessed_path.unlink(missing_ok=True)
                    parts.append(ocr_text)
                    src = ocr_src
                    if ocr_note and not note:
                        note = ocr_note
                finally:
                    tmp_path.unlink(missing_ok=True)
            
            if parts:
                return "\n\n".join(parts), src, note or "PDF OCR fallback"
        except Exception:
            logger.exception("PDF OCR fallback failed; returning raw bytes")
        
        return file_path.read_text(errors="ignore"), "none", "PDF decode failed"
    
    # DOCX extraction
    if suffix == ".docx":
        try:
            from docx import Document  # type: ignore

            doc = Document(str(file_path))
            text = "\n".join(p.text for p in doc.paragraphs)
            return text, "docx", None
        except Exception:
            pass
    
    # Image OCR
    if suffix in {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"}:
        # Preprocess image for better OCR (CLAHE contrast enhancement)
        preprocessed_path = _preprocess_image_for_ocr(file_path)
        text, src, note = _ocr_image(preprocessed_path, settings)
        # Clean up preprocessed file if different from original
        if preprocessed_path != file_path:
            preprocessed_path.unlink(missing_ok=True)
        return text, src, note
    
    # Plain text fallback
    try:
        data = file_path.read_bytes()
        return data.decode(errors="ignore"), "text", None
    except Exception:
        logger.exception("raw text read failed; returning empty string")
        return "", "none", "Raw text read failed"


def process_task(file_path: Path, settings: "Settings") -> tuple[Path, str, str, str | None]:
    """
    Extract text from a file and write to staging directory.
    
    Args:
        file_path: Source file to process.
        settings: Application settings.
    
    Returns:
        (staged_path, text, source, note) where staged_path is the written .txt file.
    """
    staging = settings.staging_dir
    staging.mkdir(parents=True, exist_ok=True)

    text, source, note = extract_text(file_path, settings)
    text = text[: settings.worker_char_limit]
    dest = staging / f"{file_path.stem}.txt"
    dest.write_text(text)
    return dest, text, source, note
