from __future__ import annotations

"""
Local KaLM embedding server for semantic search.

This wraps Hugging Face transformers around the
`tencent/KaLM-Embedding-Gemma3-12B-2511` model and exposes a minimal
OpenAI-style `/v1/embeddings` endpoint that matches EmbeddingsClient.

Usage (8-bit example):
  UVICORN_TIMEOUT=30 \
  QUANTIZATION=8bit \
  MODEL_ID=tencent/KaLM-Embedding-Gemma3-12B-2511 \
  uvicorn scripts.kalm_embedding_server:app --host 0.0.0.0 --port 8080

For 4-bit, set QUANTIZATION=4bit. This assumes bitsandbytes + a GPU.
"""

import os
from typing import Any, Dict, List, Optional

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModel, AutoTokenizer
try:
  from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover - optional dependency
  SentenceTransformer = None


MODEL_ID = os.getenv("MODEL_ID", "tencent/KaLM-Embedding-Gemma3-12B-2511")
QUANTIZATION = os.getenv("QUANTIZATION", "8bit")  # "4bit", "8bit", or "none"
MAX_SEQ_LEN = int(os.getenv("MAX_SEQ_LEN", "512"))
MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", "8"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
EMBEDDING_MODE = os.getenv("KALM_EMBEDDING_MODE", "document").lower()
EMBEDDING_PROMPT = os.getenv("KALM_EMBEDDING_PROMPT")
EMBEDDING_NORMALIZE = os.getenv("KALM_EMBEDDING_NORMALIZE", "true").lower() == "true"
QUERY_PROMPT = os.getenv(
  "KALM_QUERY_PROMPT",
  "Instruct: Given a query, retrieve documents that answer the query \nQuery: ",
)
DOCUMENT_PROMPT = os.getenv("KALM_DOCUMENT_PROMPT", "")
ATTN_IMPL = os.getenv("KALM_ATTN_IMPL")
TORCH_DTYPE = os.getenv("KALM_TORCH_DTYPE")


class EmbeddingRequest(BaseModel):
  model: str
  input: List[str]
  input_type: Optional[str] = None
  prompt: Optional[str] = None


class EmbeddingObject(BaseModel):
  object: str = "embedding"
  index: int
  embedding: List[float]


class EmbeddingResponse(BaseModel):
  object: str = "list"
  data: List[EmbeddingObject]
  model: str


def _load_model() -> tuple[AutoTokenizer, torch.nn.Module]:
  kwargs: Dict[str, Any] = {"trust_remote_code": True}
  if QUANTIZATION.lower() == "4bit":
    kwargs.update(
      {
        "load_in_4bit": True,
        "device_map": "auto",
      }
    )
  elif QUANTIZATION.lower() == "8bit":
    kwargs.update(
      {
        "load_in_8bit": True,
        "device_map": "auto",
      }
    )
  tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)
  model = AutoModel.from_pretrained(MODEL_ID, **kwargs)
  if QUANTIZATION.lower() == "none" and DEVICE == "cuda":
    model = model.to(DEVICE)
  model.eval()
  return tokenizer, model


def _sentence_transformer_kwargs() -> Dict[str, Any]:
  model_kwargs: Dict[str, Any] = {}
  if QUANTIZATION.lower() == "4bit":
    model_kwargs.update(
      {
        "load_in_4bit": True,
        "device_map": "auto",
      }
    )
  elif QUANTIZATION.lower() == "8bit":
    model_kwargs.update(
      {
        "load_in_8bit": True,
        "device_map": "auto",
      }
    )
  if TORCH_DTYPE:
    dtype = getattr(torch, TORCH_DTYPE, None)
    if dtype is not None:
      model_kwargs["torch_dtype"] = dtype
  elif DEVICE == "cuda":
    model_kwargs["torch_dtype"] = torch.bfloat16
  if ATTN_IMPL:
    model_kwargs["attn_implementation"] = ATTN_IMPL
  return model_kwargs


def _load_sentence_transformer() -> SentenceTransformer:
  kwargs: Dict[str, Any] = {
    "trust_remote_code": True,
    "model_kwargs": _sentence_transformer_kwargs(),
  }
  if QUANTIZATION.lower() == "none":
    kwargs["device"] = DEVICE
  model = SentenceTransformer(MODEL_ID, **kwargs)
  model.max_seq_length = MAX_SEQ_LEN
  return model


sentence_model: Optional[SentenceTransformer] = None
tokenizer: Optional[AutoTokenizer] = None
model: Optional[torch.nn.Module] = None
if SentenceTransformer is not None:
  sentence_model = _load_sentence_transformer()
else:
  tokenizer, model = _load_model()
app = FastAPI(title="KaLM Embedding Server", version="0.1.0")


def _last_token_pool(last_hidden_state: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
  lengths = attention_mask.sum(dim=1) - 1
  lengths = torch.clamp(lengths, min=0).long()
  batch_indices = torch.arange(last_hidden_state.size(0), device=last_hidden_state.device)
  return last_hidden_state[batch_indices, lengths]


def _resolve_input_type(input_type: Optional[str]) -> str:
  resolved = (input_type or EMBEDDING_MODE or "document").lower()
  return resolved


def _resolve_prompt(input_type: str, prompt: Optional[str]) -> Optional[str]:
  if prompt is not None:
    return prompt
  if input_type in {"raw", "none"}:
    return None
  if input_type == "query":
    return QUERY_PROMPT
  if input_type == "document":
    return DOCUMENT_PROMPT
  return None


def _encode_with_sentence_transformer(
  texts: List[str],
  input_type: str,
  prompt: Optional[str],
  explicit_prompt: bool,
) -> List[List[float]]:
  assert sentence_model is not None
  if explicit_prompt and prompt is not None and prompt != "":
    vecs = sentence_model.encode(
      texts,
      prompt=prompt,
      normalize_embeddings=EMBEDDING_NORMALIZE,
      batch_size=MAX_BATCH_SIZE,
      show_progress_bar=False,
    )
    return vecs.tolist()
  if input_type == "query" and hasattr(sentence_model, "encode_query"):
    vecs = sentence_model.encode_query(
      texts,
      normalize_embeddings=EMBEDDING_NORMALIZE,
      batch_size=MAX_BATCH_SIZE,
      show_progress_bar=False,
    )
    return vecs.tolist()
  if input_type == "document" and hasattr(sentence_model, "encode_document"):
    vecs = sentence_model.encode_document(
      texts,
      normalize_embeddings=EMBEDDING_NORMALIZE,
      batch_size=MAX_BATCH_SIZE,
      show_progress_bar=False,
    )
    return vecs.tolist()
  kwargs: Dict[str, Any] = {
    "normalize_embeddings": EMBEDDING_NORMALIZE,
    "batch_size": MAX_BATCH_SIZE,
    "show_progress_bar": False,
  }
  if prompt:
    kwargs["prompt"] = prompt
  vecs = sentence_model.encode(texts, **kwargs)
  return vecs.tolist()


def _embed_batch(
  texts: List[str],
  input_type: str,
  prompt: Optional[str],
  explicit_prompt: bool,
) -> List[List[float]]:
  # Respect MAX_BATCH_SIZE to avoid OOM on smaller GPUs.
  if not texts:
    return []
  if sentence_model is not None:
    return _encode_with_sentence_transformer(texts, input_type, prompt, explicit_prompt)
  if tokenizer is None or model is None:
    raise RuntimeError("Embedding model failed to load.")
  batches = [texts[i : i + MAX_BATCH_SIZE] for i in range(0, len(texts), MAX_BATCH_SIZE)]
  all_vecs: List[List[float]] = []
  with torch.no_grad():
    for batch in batches:
      if prompt:
        batch = [f"{prompt}{text}" for text in batch]
      enc = tokenizer(
        batch,
        padding=True,
        truncation=True,
        return_tensors="pt",
        max_length=MAX_SEQ_LEN,
      )
      if hasattr(model, "device"):
        device = next(model.parameters()).device
        enc = {k: v.to(device) for k, v in enc.items()}
      outputs = model(**enc)
      # Try to use last_hidden_state; fall back if model has a custom method.
      if hasattr(outputs, "last_hidden_state"):
        reps = _last_token_pool(outputs.last_hidden_state, enc["attention_mask"])
      elif isinstance(outputs, torch.Tensor):
        reps = outputs
      else:
        raise RuntimeError("Unexpected model outputs; update kalm_embedding_server pooling logic.")
      if EMBEDDING_NORMALIZE:
        reps = torch.nn.functional.normalize(reps, p=2, dim=-1)
      reps = torch.nan_to_num(reps, nan=0.0, posinf=0.0, neginf=0.0)
      all_vecs.extend(reps.cpu().tolist())
  return all_vecs


@app.post("/v1/embeddings", response_model=EmbeddingResponse)
def create_embeddings(payload: EmbeddingRequest) -> EmbeddingResponse:
  texts = payload.input
  if not isinstance(texts, list):
    texts = [str(texts)]
  input_type = _resolve_input_type(payload.input_type)
  explicit_prompt = payload.prompt is not None or EMBEDDING_PROMPT is not None
  prompt_override = payload.prompt if payload.prompt is not None else EMBEDDING_PROMPT
  prompt = _resolve_prompt(input_type, prompt_override)
  vecs = _embed_batch(texts, input_type, prompt, explicit_prompt)
  data = [EmbeddingObject(index=i, embedding=vec) for i, vec in enumerate(vecs)]
  return EmbeddingResponse(data=data, model=payload.model or MODEL_ID)
