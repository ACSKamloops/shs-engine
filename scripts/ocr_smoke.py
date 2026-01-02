#!/usr/bin/env python
"""
Quick OCR smoke test for both pytesseract (default) and optional Hunyuan backend.

Usage:
  source .venv/bin/activate
  export PUKAIST_OCR_ENABLED=true
  # For pytesseract (default backend):
  python scripts/ocr_smoke.py [--image path] [--text "custom text"]
  # For Hunyuan (requires GPU + vLLM/transformers):
  export PUKAIST_OCR_BACKEND=hunyuan
  python scripts/ocr_smoke.py --image path/to/ocr-sample.png
"""
import argparse
from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, ImageDraw, ImageFont  # type: ignore

from src import worker


def make_test_image(text: str) -> Path:
    img = Image.new("RGB", (600, 200), color=(12, 18, 32))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 24)
    except Exception:
        font = ImageFont.load_default()
    draw.multiline_text((20, 40), text, fill=(56, 189, 248), font=font, spacing=8)
    tmp = NamedTemporaryFile(delete=False, suffix=".png")
    img.save(tmp.name)
    return Path(tmp.name)


def parse_args():
    parser = argparse.ArgumentParser(description="Quick OCR smoke test.")
    parser.add_argument("--image", type=Path, help="Existing image to OCR (skips generating a temp image).")
    parser.add_argument(
        "--text",
        type=str,
        default="Pukaist OCR smoke test\nBackend: pytesseract or Hunyuan",
        help="Text to render into the generated test image (ignored when --image is supplied).",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    if args.image:
        image_path = args.image
    else:
        image_path = make_test_image(args.text)
    print(f"Generated test image: {image_path}")
    text = worker._extract_text(image_path)  # type: ignore[attr-defined]
    print("OCR output:")
    print("-------------------------------------")
    print(text)
    print("-------------------------------------")


if __name__ == "__main__":
    main()
