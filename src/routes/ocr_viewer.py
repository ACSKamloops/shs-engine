"""
OCR Viewer API routes.
Serves PDF files and OCR text for the in-browser viewer.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, PlainTextResponse

router = APIRouter(tags=["ocr-viewer"])

# Default to project root Pukaist folder
BASE_DIR = Path(os.getenv("PUKAIST_DATA_DIR", "/home/astraithious/pukaist-engine"))
PUKAIST_DIR = BASE_DIR / "Pukaist"
OCR_OUTPUT_DIR = PUKAIST_DIR / "OCR_Output"


@router.get("/ocr/files")
def list_ocr_files(
    status: str | None = Query(None, description="Filter by status: completed, pending, skipped"),
    limit: int = Query(100, le=500),
) -> dict:
    """
    List PDF files with their OCR processing status.
    """
    files = []
    
    if not PUKAIST_DIR.exists():
        return {"files": [], "total": 0}
    
    for pdf in sorted(PUKAIST_DIR.glob("*.pdf"))[:limit]:
        basename = pdf.stem
        txt_path = OCR_OUTPUT_DIR / f"{basename}.txt"
        
        file_status = "pending"
        ocr_size = 0
        
        if txt_path.exists():
            ocr_size = txt_path.stat().st_size
            try:
                content_start = txt_path.read_text(errors="ignore")[:50]
                if "[SKIPPED:" in content_start:
                    file_status = "skipped"
                elif ocr_size > 50:
                    file_status = "completed"
            except Exception:
                pass
        
        # Apply status filter
        if status and file_status != status:
            continue
            
        files.append({
            "name": pdf.name,
            "basename": basename,
            "pdf_size": pdf.stat().st_size,
            "ocr_size": ocr_size,
            "status": file_status,
            "mtime": pdf.stat().st_mtime,
        })
    
    return {
        "files": files,
        "total": len(files),
        "pukaist_dir": str(PUKAIST_DIR),
    }


@router.get("/ocr/pdf/{filename}")
def get_pdf_file(filename: str) -> FileResponse:
    """
    Serve a PDF file for viewing.
    """
    # Sanitize filename
    safe_name = Path(filename).name
    if not safe_name.endswith(".pdf"):
        safe_name = f"{safe_name}.pdf"
    
    pdf_path = PUKAIST_DIR / safe_name
    
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=safe_name,
    )


@router.get("/ocr/text/{filename}")
def get_ocr_text(filename: str, page: int | None = Query(None, description="Get text for specific page")) -> dict:
    """
    Return OCR text content for a file.
    Optionally returns text for a specific page if page parameter is provided.
    """
    import re
    
    # Sanitize filename - get basename without extension
    safe_name = Path(filename).stem
    txt_path = OCR_OUTPUT_DIR / f"{safe_name}.txt"
    
    if not txt_path.exists():
        return {
            "filename": filename,
            "status": "pending",
            "content": None,
            "pages": [],
            "message": "OCR not yet completed for this file",
        }
    
    try:
        content = txt_path.read_text(errors="ignore")
        
        if content.startswith("[SKIPPED:"):
            return {
                "filename": filename,
                "status": "skipped",
                "content": None,
                "pages": [],
                "message": content.strip(),
            }
        
        # Parse page markers: --- Page N ---
        page_pattern = r"--- Page (\d+) ---"
        page_splits = re.split(page_pattern, content)
        
        # Build pages dict: {page_num: text}
        pages_dict: dict[int, str] = {}
        if len(page_splits) > 1:
            # Format is: [text_before, page_num, text, page_num, text, ...]
            for i in range(1, len(page_splits), 2):
                page_num = int(page_splits[i])
                page_text = page_splits[i + 1].strip() if i + 1 < len(page_splits) else ""
                pages_dict[page_num] = page_text
        else:
            # No page markers, treat entire content as page 1
            pages_dict[1] = content.strip()
        
        # Build pages list for frontend
        pages_list = [{"page": p, "text": t} for p, t in sorted(pages_dict.items())]
        
        # If specific page requested, return just that page's text
        if page is not None:
            page_text = pages_dict.get(page, "")
            return {
                "filename": filename,
                "status": "completed",
                "content": page_text,
                "page": page,
                "total_pages": len(pages_dict),
                "char_count": len(page_text),
            }
        
        return {
            "filename": filename,
            "status": "completed",
            "content": content,
            "pages": pages_list,
            "total_pages": len(pages_dict),
            "char_count": len(content),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
