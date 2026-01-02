#!/usr/bin/env python
"""
Generate simple OCR test assets (PNG + PDF) under 99_Working_Files/Incoming by default.

Usage:
  source .venv/bin/activate
  python scripts/make_ocr_sample.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont  # type: ignore


def _load_font(size: int):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()


def make_assets(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    img_path = out_dir / "ocr-sample.png"
    pdf_path = out_dir / "ocr-sample.pdf"
    long_img_path = out_dir / "ocr-sample-long.png"
    long_pdf_path = out_dir / "ocr-sample-long.pdf"

    img = Image.new("RGB", (800, 300), color=(10, 15, 30))
    draw = ImageDraw.Draw(img)
    font = _load_font(28)
    draw.text((20, 60), "Pukaist OCR sample", fill=(56, 189, 248), font=font)
    draw.text((20, 120), "Upload this image/PDF to test OCR", fill=(167, 139, 250), font=font)
    draw.text((20, 180), "Backend: pytesseract or Hunyuan", fill=(52, 211, 153), font=font)
    img.save(img_path)
    img.save(pdf_path, "PDF")
    print(f"Wrote {img_path}")
    print(f"Wrote {pdf_path}")

    # Longer multi-line sample to stress OCR layout and numbers.
    long_img = Image.new("RGB", (1000, 1300), color=(6, 10, 24))
    long_draw = ImageDraw.Draw(long_img)
    header_font = _load_font(32)
    body_font = _load_font(26)
    lines = [
        "Pukaist OCR long-form sample (for Hunyuan + pytesseract)",
        "Case: Coastline damage survey — multi-line paragraphs and numbers.",
        "Metadata: AOI=Gulf Sector 4 | Team=Delta | Date=2025-12-01",
        "",
        "Checklist:",
        "1) Ingest high-res photos (drone + phone) with mixed lighting.",
        "2) Extract captions, GPS stamps, and markings on signage.",
        "3) Parse tabular measurements (elevation, water depth, debris counts).",
        "4) Note languages: English + Spanish labels on construction materials.",
        "",
        "Observations:",
        "- Shoreline revetment displaced ~12 m; exposed rebar visible.",
        "- Sand berm height: 1.6 m (target 2.0 m) — needs rework.",
        "- Debris piles: 18 items tagged, 6 require heavy equipment.",
        "- Power pole markers: IDs 114A, 114B, 117C; tilt 4–7 degrees.",
        "- Bridge plate shows \"Span 3\" stamped; paint faded but legible.",
        "",
        "Readings (metric):",
        "  Station S04: lat 28.7621, lon -89.4217, water depth 0.45 m.",
        "  Station S05: lat 28.7629, lon -89.4202, water depth 0.62 m.",
        "  Station S06: lat 28.7638, lon -89.4184, water depth 0.51 m.",
        "",
        "Action items:",
        "- Flag photos with tape-measure overlays for fast parsing.",
        "- Circle any handwritten notes; preserve coordinates in EXIF.",
        "- Export structured JSON with coordinates + measurements + IDs.",
        "",
        "End of sample block — ensure OCR captures bullets, numbers, and punctuation.",
    ]
    y = 40
    for line in lines:
        font_to_use = header_font if y == 40 else body_font
        long_draw.text((32, y), line, fill=(203, 213, 225), font=font_to_use)
        y += 40

    long_img.save(long_img_path)
    long_img.save(long_pdf_path, "PDF")
    print(f"Wrote {long_img_path}")
    print(f"Wrote {long_pdf_path}")


def main():
    out_dir = Path("99_Working_Files/Incoming")
    make_assets(out_dir)


if __name__ == "__main__":
    main()
