"""
HunyuanOCR smoke test for Pukaist Engine.

This script wires up a throwaway workspace, generates a small PNG with text,
enqueues it via the intake scanner, runs the worker once, and prints search
results. It assumes:
- HunyuanOCR dependencies are installed in the active Python environment
  (vllm, transformers, PIL).
- `PUKAIST_OCR_ENABLED=true` and `PUKAIST_OCR_BACKEND=hunyuan` are set, or you
  are comfortable with this script overriding them for the duration of the run.

Usage (from repo root, with venv active):
  PYTHONPATH=. python -m scripts.ocr_smoke_hunyuan
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

from src.config import Settings
from scripts.intake_scan import scan_and_enqueue  # type: ignore


def _setup_workspace() -> Settings:
    root = Path(__file__).resolve().parent.parent
    workdir = Path(os.getenv("PUKAIST_OCR_WALKTHROUGH_DIR", "/tmp/pukaist_ocr_walkthrough"))
    incoming = workdir / "incoming"
    staging = workdir / "staging"
    logs = workdir / "logs"
    reports = workdir / "reports"

    for path in (incoming, staging, logs, reports):
        path.mkdir(parents=True, exist_ok=True)

    # Wire workspace env for this process.
    os.environ["PUKAIST_WORKSPACE"] = str(workdir)
    os.environ["PUKAIST_INCOMING_DIR"] = str(incoming)
    os.environ["PUKAIST_STAGING_DIR"] = str(staging)
    os.environ["PUKAIST_INDEX_PATH"] = str(workdir / "index.db")
    os.environ["PUKAIST_QUEUE_DB"] = str(workdir / "queue.db")
    os.environ["PUKAIST_LOG_DIR"] = str(logs)
    os.environ["PUKAIST_REFINED_DIR"] = str(reports)
    os.environ.setdefault("PUKAIST_ALLOWED_EXTS", "txt,pdf,docx,md,png,jpg,jpeg")
    os.environ.setdefault("PUKAIST_LLM_OFFLINE", "true")
    os.environ.setdefault("PUKAIST_EMBEDDINGS_ENABLED", "false")
    os.environ.setdefault("PUKAIST_OCR_ENABLED", "true")
    os.environ.setdefault("PUKAIST_OCR_BACKEND", "hunyuan")

    print(f"Workspace: {workdir}")
    return Settings.load()


def _write_test_image(path: Path) -> None:
    from PIL import Image, ImageDraw, ImageFont  # type: ignore[import]

    img = Image.new("RGB", (640, 200), color="white")
    draw = ImageDraw.Draw(img)
    text = "Pukaist OCR test via HunyuanOCR"
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    draw.text((10, 80), text, fill="black", font=font)
    img.save(str(path))
    print(f"Generated test image at {path}")


def _warn_if_missing_compiler() -> None:
    if shutil.which("gcc") is None:
        print("Warning: gcc not found; install build-essential for vLLM/Triton.")


def main() -> None:
    settings = _setup_workspace()
    from src import search_index, worker  # type: ignore
    incoming = settings.incoming_dir
    image_path = incoming / "ocr_hunyuan_sample.png"
    _write_test_image(image_path)
    _warn_if_missing_compiler()

    print("Enqueuing via intake-scan...")
    scan_and_enqueue(theme="ocr-hunyuan-test", dry_run=False)

    print("Running worker once (HunyuanOCR backend)...")
    worked = worker.run_once()
    print("Worker processed:", worked)

    print("Searching index for 'Pukaist'...")
    search_index.init(settings.index_path)
    rows = search_index.search(settings.index_path, "Pukaist", limit=5, tenant_id=None)
    for r in rows:
        print(dict(r))

    print(
        "Done. Check logs under "
        f"{settings.log_dir} for 'Using HunyuanOCR backend' entries "
        "to confirm the VLM OCR path was exercised."
    )


if __name__ == "__main__":
    main()
