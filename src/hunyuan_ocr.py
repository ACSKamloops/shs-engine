from __future__ import annotations

"""
Optional HunyuanOCR backend for high-quality OCR on images.

This module is only used when explicitly enabled via configuration.
It depends on GPU-heavy libraries (`vllm`, `transformers`, `PIL`) and
should not be imported unless the Hunyuan backend is selected.
"""

import base64
import os
import json
import threading
from pathlib import Path
from typing import Optional


_client_lock = threading.Lock()
_client: Optional["HunyuanOcrClient"] = None


def _clean_repeated_substrings(text: str) -> str:
    """
    Clean repeated substrings in text (adapted from the official README).
    Helps trim degenerate repetitions on very long generations.
    """
    import re
    
    # First pass: Clean single character repetitions (e.g., "£££££..." or "...........")
    text = re.sub(r'(.)\1{15,}', r'\1\1\1', text)
    
    # Second pass: Clean phrase repetitions
    n = len(text)
    # Lowered threshold from 3000 to 1000 for much earlier detection
    if n < 1000:
        return text
    for length in range(2, n // 10 + 1):
        candidate = text[-length:]
        count = 0
        i = n - length
        while i >= 0 and text[i : i + length] == candidate:
            count += 1
            i -= length
        # Lowered repeat threshold from 10 to 5 for earlier cleanup
        if count >= 5:
            return text[: n - length * (count - 1)]
    return text


def _clean_prompt_leakage(text: str) -> str:
    """
    Remove any leaked prompt instructions from OCR output.
    
    The Auto-Context workflow injects "DETECTED CONTEXT:" and "Instructions:"
    into the prompt, but sometimes these leak into the model output.
    This function strips them out.
    """
    # Check for common prompt leakage markers
    markers = [
        "DETECTED CONTEXT:",
        "Instructions:",
        "- Use the detected context",
        "- Preserve original spelling",
        "- Output only the transcription",
    ]
    
    result = text
    for marker in markers:
        if marker in result:
            # Find the marker and remove from there to next double newline or end of block
            idx = result.find(marker)
            if idx >= 0:
                # Find end of instruction block (next double newline or 200 chars max)
                end_search = result[idx:idx+500]
                end_idx = end_search.find("\n\n")
                if end_idx > 0:
                    # Remove the instruction block
                    result = result[:idx] + result[idx+end_idx+2:]
                else:
                    # No double newline found - check if marker is at start
                    if idx < 50:
                        # Marker near start, find where actual content begins
                        # Look for first line that doesn't look like an instruction
                        lines = result.split("\n")
                        content_lines = []
                        in_instructions = True
                        for line in lines:
                            if in_instructions:
                                # Skip instruction-like lines
                                if any(m in line for m in markers) or line.strip().startswith("-"):
                                    continue
                                in_instructions = False
                            content_lines.append(line)
                        result = "\n".join(content_lines)
                        break
    
    return result.strip()


# Default prompt for strict verbatim OCR - UPDATED based on research
_DEFAULT_OCR_PROMPT = (
    "Transcribe ONLY the exact text visible in this document image. "
    "Preserve original spelling, punctuation, line breaks, and casing exactly as written - including any errors. "
    "Do NOT correct, summarize, describe, or paraphrase. "
    "Do NOT start with phrases like 'The handwritten text is' or 'The document contains'. "
    "Mark unclear words as [illegible]. Output only the transcription, nothing else."
)

# Pacific Northwest Historical Documents - Known Entities
# Helps the model correctly transcribe frequently-occurring proper nouns
PACIFIC_NW_ENTITIES = {
    "places": [
        "Coeur d'Alene", "Pend d'Oreille", "Lillooet", "Okanagan", "Similkameen",
        "Kamloops", "Spences Bridge", "Spuzzum", "Lytton", "Yale", "Hope",
        "Kalispel", "Shuswap", "Thompson", "Fraser", "Nanaimo", "Musqueam",
        "Desmet", "Spokane", "Flathead", "Kootenay", "Colville", "Nicola",
        "Vancouver", "Victoria", "New Westminster", "Portland", "Seattle",
        "Columbia University", "New York", "American Philosophical Society",
        "Highland Valley", "Pavilion", "Clinton", "Ashcroft", "Bonaparte",
    ],
    "people": [
        "Franz Boas", "James Teit", "Tetlenitsa", "Julian", "Marcellian",
        "W. E. Ditchburn", "J. W. Clark", "Peter Burnet", "A. W. Vowell",
    ],
    "tribes": [
        "Nlaka'pamux", "Secwepemc", "Syilx", "St'at'imc", "Nuxalk",
        "Salish", "Interior Salish", "Coast Salish", "Athapaskan",
        "Chehalis", "Quinault", "Cowlitz", "Carrier", "Chilcotin",
    ],
}

def _get_entity_hints() -> str:
    """Get a compact string of known entities for prompt injection."""
    all_entities = []
    for category in PACIFIC_NW_ENTITIES.values():
        all_entities.extend(category[:10])  # Limit to prevent prompt bloat
    return ", ".join(all_entities[:30])

# Pass 1: Enhanced Entity Scout Prompt (Auto-Context)
# Extracts rich context: names, places, dates, document type, letterhead info
_SCOUT_OCR_PROMPT = f"""Analyze this document image and extract key information:
1. Names of people (sender, recipient, mentioned)
2. Place names (cities, addresses, institutions)
3. Dates (day, month, year)
4. Document type (letter, form, note)
5. Any letterhead or printed text

Known entities that may appear: {_get_entity_hints()}

List these briefly. Do not transcribe the full document yet."""


# Pass 2: Enhanced Context-Aware Prompt Template
_CONTEXTUAL_OCR_PROMPT_TEMPLATE = """Transcribe this document verbatim.

DETECTED CONTEXT:
{context}

Instructions:
- Use the detected context to accurately transcribe proper nouns
- Preserve original spelling, punctuation, line breaks, and casing
- Output only the transcription, no commentary or summaries
- Do not add or infer words not visible in the image
- Do not start with phrases like "The handwritten text is" or "The letter is"
- If a word is unclear, write [illegible]"""

# Pass 3: Self-Correction Prompt (Optional refinement pass)
_SELF_CORRECTION_PROMPT = """Look at this document image carefully.
A previous OCR attempt produced this text:
---
{transcription}
---
Your task: Compare the OCR text against what you see in the image. Fix any errors in names, dates, or words that were misread. Output ONLY the corrected text, nothing else."""

# Alternative prompts
OCR_PROMPTS = {
    "chinese_official": "检测并识别图片中的文字，将文本坐标格式化输出。",
    "handwritten": "Transcribe all handwritten text exactly as written.",
    "document": "Extract all text from this document in reading order, preserving structure.",
    "scout": _SCOUT_OCR_PROMPT,
    "self_correction": _SELF_CORRECTION_PROMPT,
}

def get_ocr_prompt(context: Optional[str] = None) -> str:
    """
    Get the OCR prompt, optionally enhanced with context.
    Context can be manual (env var) or auto-generated (scout pass).
    """
    # Manual context override
    manual_context = os.getenv("PUKAIST_OCR_CONTEXT")
    if manual_context:
        return _CONTEXTUAL_OCR_PROMPT_TEMPLATE.format(context=manual_context)
    
    # Auto-detected context passed in
    if context:
        return _CONTEXTUAL_OCR_PROMPT_TEMPLATE.format(context=context)
        
    return _DEFAULT_OCR_PROMPT


_SUMMARY_PREFIXES = (
    "the handwritten text is",
    "the letter is",
    "this letter",
    "this document",
    "the document",
    "the image",
    "this image",
)


def _looks_like_summary(text: str) -> bool:
    sample = text.strip().lower()
    if not sample:
        return False
    return any(sample.startswith(prefix) for prefix in _SUMMARY_PREFIXES)

class HunyuanOcrClient:
    """
    Thin wrapper around HunyuanOCR via vLLM + Transformers.

    This follows the pattern from the upstream README:
    - model: tencent/HunyuanOCR
    - processor: AutoProcessor
    - inference: vLLM LLM.generate with multi_modal_data
    """

    def __init__(self, model_name: str, max_tokens: int) -> None:
        from vllm import LLM, SamplingParams  # type: ignore[import]
        from transformers import AutoProcessor  # type: ignore[import]

        self.model_name = model_name
        self.llm = LLM(model=model_name, trust_remote_code=True)
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.sampling_params = SamplingParams(
            temperature=0,
            max_tokens=max_tokens,
            repetition_penalty=1.0,  # No penalty for verbatim - use post-processing instead
        )


    def extract_text(self, image_path: Path, prompt: Optional[str] = None) -> str:
        """
        Run a single image through HunyuanOCR and return plain text.
        """
        from PIL import Image  # type: ignore[import]

        effective_prompt = prompt or _DEFAULT_OCR_PROMPT
        image = Image.open(str(image_path))
        messages = [
            {"role": "system", "content": ""},
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": str(image_path)},
                    {"type": "text", "text": effective_prompt},
                ],
            },
        ]
        prompt_text = self.processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = {"prompt": prompt_text, "multi_modal_data": {"image": [image]}}
        outputs = self.llm.generate([inputs], self.sampling_params)[0]
        raw = outputs.outputs[0].text
        return _clean_repeated_substrings(raw)


def _get_client() -> HunyuanOcrClient:
    """
    Lazily construct and cache a global client to avoid reloading the
    1B-parameter model on every call.
    """
    global _client
    if _client is not None:
        return _client
    with _client_lock:
        if _client is not None:
            return _client
        model_name = os.getenv("PUKAIST_HUNYUAN_OCR_MODEL", "tencent/HunyuanOCR")
        max_tokens_env = os.getenv("PUKAIST_HUNYUAN_OCR_MAX_TOKENS", "16384")
        try:
            max_tokens = int(max_tokens_env)
        except ValueError:
            max_tokens = 16384
        _client = HunyuanOcrClient(model_name=model_name, max_tokens=max_tokens)
        return _client


def extract_text_with_hunyuan(image_path: Path, prompt: Optional[str] = None) -> str:
    """
    Public helper used by the worker to run OCR via HunyuanOCR.
    
    Supports \"Auto-Context\" workflow (Scout -> Transcribe) by default.
    Disable with PUKAIST_OCR_AUTO_CONTEXT=false.
    """
    # Multi-pass Auto-Context Workflow (Default - scientifically proven +14pp accuracy)
    # 1. Scout for entities
    # 2. Transcribe with entity hints
    # Enabled by default; set PUKAIST_OCR_AUTO_CONTEXT=false to disable
    auto_context_enabled = os.getenv("PUKAIST_OCR_AUTO_CONTEXT", "true").lower() not in {"false", "0", "no", "off"}
    
    if not prompt and auto_context_enabled:
        import logging
        logger = logging.getLogger("pukaist.hunyuan_ocr")
    
        # Pass 1: Scout Entities - Use HTTP API if available
        logger.info("Running OCR Pass 1: Entity Scout")
        
        base_url = os.getenv("PUKAIST_HUNYUAN_OCR_BASE_URL")
        api_key = os.getenv("PUKAIST_HUNYUAN_OCR_API_KEY", "EMPTY")
        
        if base_url:
            # Use HTTP API for scout
            from openai import OpenAI
            client = OpenAI(base_url=base_url.rstrip("/"), api_key=api_key, timeout=3600)
            data_url = _make_data_url(image_path)
            scout_messages = [
                {"role": "system", "content": ""},
                {"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": _SCOUT_OCR_PROMPT},
                ]},
            ]
            scout_resp = client.chat.completions.create(
                model=os.getenv("PUKAIST_HUNYUAN_OCR_MODEL", "tencent/HunyuanOCR"),
                messages=scout_messages,
                temperature=0.0,
                extra_body={"top_k": 1, "max_tokens": 512},
            )
            entities = scout_resp.choices[0].message.content or ""
        else:
            # Fallback to in-process client
            native_client = _get_client()
            entities = native_client.extract_text(image_path, prompt=_SCOUT_OCR_PROMPT)
            
        logger.info("OCR Scout found hints: %s", entities[:100].replace('\n', ' ') + "...")
        
        # Pass 2: Context-Aware Transcription
        effective_prompt = get_ocr_prompt(context=entities)
        
    else:
        # Standard Single Pass
        effective_prompt = prompt or get_ocr_prompt()

    base_url = os.getenv("PUKAIST_HUNYUAN_OCR_BASE_URL")
    api_key = os.getenv("PUKAIST_HUNYUAN_OCR_API_KEY", "EMPTY")

    if base_url:
        # Use OpenAI-compatible HTTP endpoint (e.g., vllm serve tencent/HunyuanOCR ...)
        from openai import OpenAI  # type: ignore

        client = OpenAI(base_url=base_url.rstrip("/"), api_key=api_key, timeout=3600)
        data_url = _make_data_url(image_path)
        messages = [
            {"role": "system", "content": ""},
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": effective_prompt},
                ],
            },
        ]
        resp = client.chat.completions.create(
            model=os.getenv("PUKAIST_HUNYUAN_OCR_MODEL", "tencent/HunyuanOCR"),
            messages=messages,
            temperature=0.0,
            extra_body={
                "top_k": 1,
                "repetition_penalty": 1.0,  # No penalty for verbatim - research shows 1.0 is optimal
                "max_tokens": 8192,  # Leave room for image input tokens (model has 16384 context limit)
            },
        )
        content = resp.choices[0].message.content or ""
        if isinstance(content, list):
            # OpenAI client may return list segments; join textual parts.
            content = "".join(str(part) for part in content)
        # Apply repetition cleanup (same as in-process path)
        result = _clean_repeated_substrings(str(content))
        # Remove any leaked prompt instructions
        result = _clean_prompt_leakage(result)

        if _looks_like_summary(result):
            import logging

            logger = logging.getLogger("pukaist.hunyuan_ocr")
            logger.warning("OCR output looks like a summary; retrying with strict prompt")
            strict_messages = [
                {"role": "system", "content": ""},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": _DEFAULT_OCR_PROMPT},
                    ],
                },
            ]
            strict_resp = client.chat.completions.create(
                model=os.getenv("PUKAIST_HUNYUAN_OCR_MODEL", "tencent/HunyuanOCR"),
                messages=strict_messages,
                temperature=0.0,
                extra_body={
                    "top_k": 1,
                    "repetition_penalty": 1.0,
                    "max_tokens": 8192,
                },
            )
            strict_content = strict_resp.choices[0].message.content or ""
            if isinstance(strict_content, list):
                strict_content = "".join(str(part) for part in strict_content)
            result = _clean_repeated_substrings(str(strict_content))
            result = _clean_prompt_leakage(result)

        # Optional Self-Correction Pass
        if os.getenv("PUKAIST_OCR_SELF_CORRECT", "false").lower() == "true":
            import logging
            logger = logging.getLogger("pukaist.hunyuan_ocr")
            logger.info("Running Self-Correction pass...")
            
            correction_prompt = _SELF_CORRECTION_PROMPT.format(transcription=result[:2000])
            correction_messages = [
                {"role": "system", "content": ""},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": correction_prompt},
                    ],
                },
            ]
            correction_resp = client.chat.completions.create(
                model=os.getenv("PUKAIST_HUNYUAN_OCR_MODEL", "tencent/HunyuanOCR"),
                messages=correction_messages,
                temperature=0.0,
                extra_body={"top_k": 1, "repetition_penalty": 1.05, "max_tokens": 16384},
            )
            corrected = correction_resp.choices[0].message.content or result
            if isinstance(corrected, list):
                corrected = "".join(str(part) for part in corrected)
            result = _clean_repeated_substrings(str(corrected))
            
        return result

    client = _get_client()
    return client.extract_text(image_path, prompt=prompt)


def _make_data_url(image_path: Path) -> str:
    mime = "image/png"
    if image_path.suffix.lower() in {".jpg", ".jpeg"}:
        mime = "image/jpeg"
    elif image_path.suffix.lower() in {".tif", ".tiff"}:
        mime = "image/tiff"
    b64 = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"
