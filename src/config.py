"""
Local-first configuration loader for the Pukaist Engine skeleton.
Resolves paths relative to the repo root by default and ensures key folders exist.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional


def _root_dir() -> Path:
    return Path(__file__).resolve().parent.parent


def _resolve_path(value: str | None, default: str) -> Path:
    candidate = Path(value) if value else Path(default)
    if not candidate.is_absolute():
        candidate = _root_dir() / candidate
    return candidate


def _split_csv(value: str | None) -> List[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


THEME_KEYWORDS: dict[str, List[str]] = {
    # Land Reduction & Trespass (surveys, acreage, pre-emption, encroachment, cut-off lands, rights-of-way)
    "Land_Reduction_Trespass": [
        "acre",
        "acres",
        "survey",
        "surveyor",
        "boundary",
        "pre-emption",
        "preemption",
        "encroachment",
        "trespass",
        "cut-off",
        "cut off",
        "right of way",
        "right-of-way",
        "railway",
        "railroad",
    ],
    # Governance & Sovereignty (bands, chiefs, councils, title)
    "Governance_Sovereignty": [
        "chief",
        "council",
        "band council",
        "band meeting",
        "governance",
        "self-government",
        "aboriginal title",
        "title",
        "spatsum band",
        "pukaist",
        "cook's ferry",
        "election",
    ],
    # Fiduciary Duty & Negligence (trust, funds, mismanagement, protection)
    "Fiduciary_Duty_Negligence": [
        "trust",
        "trust fund",
        "funds",
        "mismanagement",
        "negligence",
        "fiduciary",
        "duty",
        "obligation",
        "compensation",
        "damages",
        "failure to protect",
    ],
    # Water Rights & Fishing (ditches, irrigation, water licences, fishing)
    "Water_Rights_Fishing": [
        "ditch",
        "ditches",
        "irrigation",
        "water license",
        "water licence",
        "license to take water",
        "licence to take water",
        "diversion",
        "fishery",
        "fishing",
        "weir",
        "dam",
        "stream",
        "river",
    ],
    # Coercion & Duress (surrenders, consent, threats)
    "Coercion_Duress": [
        "surrender",
        "land surrender",
        "consent",
        "without consent",
        "threat",
        "duress",
        "pressure",
        "coerced",
        "forced",
        "compelled",
    ],
}


@dataclass
class Settings:
    api_token: str
    rate_limit_per_min: int
    max_upload_mb: int
    cors_origins: List[str]
    db_driver: str
    db_url: str | None

    workspace: Path
    incoming_dir: Path
    staging_dir: Path
    index_path: Path
    queue_db: Path
    log_dir: Path
    refined_dir: Path
    projects_dir: Path

    llm_offline: bool
    llm_provider: str
    llm_model: str
    llm_base_url: str | None
    llm_api_key: str | None
    llm_mode: str
    llm_input_max_chars: int
    llm_max_tokens: int
    llm_temperature: float
    llm_forensic_enabled: bool
    llm_forensic_temperature: float
    llm_insights_enabled: bool
    prefilter_keywords: List[str]
    prefilter_min_chars: int
    ocr_enabled: bool
    ocr_backend: str
    embeddings_enabled: bool
    embeddings_provider: str | None
    embeddings_model: str | None
    embeddings_dim: int | None
    place_suggest_enabled: bool
    place_gazetteer: Optional[Path]
    roles_claim: str | None
    role_admin: str | None
    role_ingest: str | None
    role_viewer: str | None
    summary_enabled: bool
    max_docs_per_run: Optional[int]
    project_theme: Optional[str]
    project_config: Optional["ProjectConfig"]
    relevancy_enabled: bool
    relevancy_targets: List[str]
    relevancy_model: str | None
    oidc_issuer: str | None
    oidc_audience: str | None
    oidc_jwks_url: str | None
    oidc_dev_secret: str | None
    audit_log: bool
    kmz_enabled: bool

    default_tenant: str | None
    tenant_claim: str | None

    worker_interval: int
    worker_char_limit: int
    worker_tenant_id: str | None
    worker_allow_unscoped: bool
    allowed_exts: List[str]
    webhook_token: str | None
    callback_allowlist: List[str]
    callback_allow_private: bool
    callback_allow_all: bool

    @classmethod
    def load(cls) -> "Settings":
        workspace = _resolve_path(os.getenv("PUKAIST_WORKSPACE"), "workspace_skeleton")
        incoming_dir = _resolve_path(os.getenv("PUKAIST_INCOMING_DIR"), "99_Working_Files/Incoming")
        staging_dir = _resolve_path(os.getenv("PUKAIST_STAGING_DIR"), "99_Working_Files/Evidence_Staging")
        index_path = _resolve_path(os.getenv("PUKAIST_INDEX_PATH"), "99_Working_Files/Evidence_Index/index.db")
        queue_db = _resolve_path(os.getenv("PUKAIST_QUEUE_DB"), "99_Working_Files/queue.db")
        log_dir = _resolve_path(os.getenv("PUKAIST_LOG_DIR"), "99_Working_Files/Logs")
        refined_dir = _resolve_path(os.getenv("PUKAIST_REFINED_DIR"), "01_Internal_Reports")
        projects_dir = _resolve_path(os.getenv("PUKAIST_PROJECTS_DIR"), "projects")

        # Optional project config
        project_config = None
        cfg_path_env = os.getenv("PUKAIST_PROJECT_CONFIG")
        if cfg_path_env:
            cfg_path = Path(cfg_path_env)
            if cfg_path.is_file():
                from .project_config import ProjectConfig  # local import to avoid cycle

                project_config = ProjectConfig.load(cfg_path)

        # Ensure directories exist for local-only operation.
        for path in [workspace, incoming_dir, staging_dir, log_dir, refined_dir, index_path.parent, projects_dir]:
            path.mkdir(parents=True, exist_ok=True)

        llm_offline = os.getenv("PUKAIST_LLM_OFFLINE", "true").lower() == "true"
        llm_mode = os.getenv("PUKAIST_LLM_MODE", "sync")
        llm_insights_enabled = os.getenv("PUKAIST_LLM_INSIGHTS_ENABLED", "false").lower() == "true"
        llm_forensic_enabled = os.getenv("PUKAIST_LLM_FORENSIC_ENABLED", "false").lower() == "true"
        llm_forensic_temperature = float(os.getenv("PUKAIST_LLM_FORENSIC_TEMPERATURE", "0.1"))
        prefilter_keywords = _split_csv(os.getenv("PUKAIST_PREFILTER_KEYWORDS"))
        prefilter_min_chars = int(os.getenv("PUKAIST_PREFILTER_MIN_CHARS", "0"))
        ocr_enabled = os.getenv("PUKAIST_OCR_ENABLED", "false").lower() == "true"
        ocr_backend = os.getenv("PUKAIST_OCR_BACKEND", "pytesseract")
        embeddings_enabled = os.getenv("PUKAIST_EMBEDDINGS_ENABLED", "false").lower() == "true"
        embeddings_provider = os.getenv("PUKAIST_EMBEDDINGS_PROVIDER")
        embeddings_model = os.getenv("PUKAIST_EMBEDDINGS_MODEL", "tencent/KaLM-Embedding-Gemma3-12B-2511")
        embeddings_dim_env = os.getenv("PUKAIST_EMBEDDINGS_DIM")
        place_suggest_enabled = os.getenv("PUKAIST_PLACE_SUGGEST_ENABLED", "false").lower() == "true"
        place_gazetteer_env = os.getenv("PUKAIST_PLACE_GAZETTEER")
        place_gazetteer = _resolve_path(place_gazetteer_env, "") if place_gazetteer_env else None
        roles_claim = os.getenv("PUKAIST_ROLES_CLAIM")
        role_admin = os.getenv("PUKAIST_ROLE_ADMIN", "admin")
        role_ingest = os.getenv("PUKAIST_ROLE_INGEST", "ingest")
        role_viewer = os.getenv("PUKAIST_ROLE_VIEWER", "viewer")
        relevancy_enabled = os.getenv("PUKAIST_RELEVANCY_ENABLED", "false").lower() == "true"
        relevancy_targets = _split_csv(os.getenv("PUKAIST_RELEVANCY_TARGETS"))
        relevancy_model = os.getenv("PUKAIST_RELEVANCY_MODEL")
        allowed_exts = [
            ext.lstrip(".").lower()
            for ext in _split_csv(os.getenv("PUKAIST_ALLOWED_EXTS", "txt,pdf,docx,md,jpg,jpeg,png,tif,tiff,bmp,webp"))
        ]
        max_upload_mb = int(os.getenv("PUKAIST_MAX_UPLOAD_MB", "50"))
        callback_allowlist = _split_csv(
            os.getenv(
                "PUKAIST_CALLBACK_ALLOWLIST",
                "localhost,127.0.0.1,::1,host.docker.internal",
            )
        )
        callback_allow_private = os.getenv("PUKAIST_CALLBACK_ALLOW_PRIVATE", "false").lower() == "true"
        callback_allow_all = os.getenv("PUKAIST_CALLBACK_ALLOW_ALL", "false").lower() == "true"
        worker_tenant_id = os.getenv("PUKAIST_WORKER_TENANT") or None
        worker_allow_unscoped = os.getenv("PUKAIST_WORKER_ALLOW_UNSCOPED", "true").lower() == "true"
        summary_enabled = True
        max_docs_per_run: Optional[int] = None
        project_theme: Optional[str] = None
        kmz_enabled = os.getenv("PUKAIST_KMZ_ENABLED", "false").lower() == "true"

        # Apply project config overrides
        if project_config:
            if project_config.allowed_exts:
                allowed_exts = [ext.lstrip(".").lower() for ext in project_config.allowed_exts]
            if project_config.max_upload_mb is not None:
                max_upload_mb = project_config.max_upload_mb
            if project_config.prefilter_keywords:
                prefilter_keywords = [kw for kw in project_config.prefilter_keywords if kw]
            if project_config.prefilter_min_chars:
                prefilter_min_chars = project_config.prefilter_min_chars
            if project_config.llm_mode:
                llm_mode = project_config.llm_mode
            llm_insights_enabled = project_config.insights_enabled
            summary_enabled = project_config.summary_enabled
            if project_config.llm_enabled is False:
                llm_offline = True
            project_theme = project_config.theme or None
            max_docs_per_run = project_config.max_docs_per_run
            # Apply theme-driven relevancy targets if configured
            if getattr(project_config, "enabled_themes", None):
                theme_terms: list[str] = []
                for theme in project_config.enabled_themes or []:
                    theme_terms.extend(THEME_KEYWORDS.get(theme, []))
                if theme_terms:
                    # Merge env-configured targets with theme-derived ones, preserving order and uniqueness.
                    merged: list[str] = []
                    for kw in relevancy_targets + theme_terms:
                        kw_norm = kw.strip()
                        if kw_norm and kw_norm.lower() not in (t.lower() for t in merged):
                            merged.append(kw_norm)
                    relevancy_targets = merged
                    if not relevancy_enabled:
                        relevancy_enabled = True
            # Tenant override
            if project_config.tenant_id:
                os.environ["PUKAIST_DEFAULT_TENANT"] = project_config.tenant_id

        return cls(
            api_token=os.getenv("PUKAIST_API_TOKEN", "dev-token"),
            rate_limit_per_min=int(os.getenv("PUKAIST_RATE_LIMIT_PER_MIN", "120")),
            max_upload_mb=max_upload_mb,
            cors_origins=_split_csv(
                os.getenv(
                    "PUKAIST_CORS_ORIGINS",
                    "http://localhost:3000,http://localhost:4173,http://localhost:8002",
                )
            ),
            workspace=workspace,
            incoming_dir=incoming_dir,
            staging_dir=staging_dir,
            index_path=index_path,
            queue_db=queue_db,
            log_dir=log_dir,
            refined_dir=refined_dir,
            projects_dir=projects_dir,
            db_driver=os.getenv("PUKAIST_DB_DRIVER", "sqlite"),
            db_url=os.getenv("PUKAIST_DB_URL"),
            llm_offline=llm_offline,
            llm_provider=os.getenv("PUKAIST_LLM_PROVIDER", "openai"),
            llm_model=os.getenv("PUKAIST_LLM_MODEL", "gpt-5"),
            llm_base_url=os.getenv("PUKAIST_LLM_BASE_URL", "https://api.openai.com"),
            llm_api_key=os.getenv("PUKAIST_LLM_API_KEY") or os.getenv("LLM_API_KEY"),
            llm_mode=llm_mode,
            llm_input_max_chars=int(os.getenv("PUKAIST_LLM_INPUT_MAX_CHARS", "50000")),
            llm_max_tokens=int(os.getenv("PUKAIST_LLM_MAX_TOKENS", "2048")),
            llm_temperature=float(os.getenv("PUKAIST_LLM_TEMPERATURE", "0.2")),
            oidc_issuer=os.getenv("PUKAIST_OIDC_ISSUER"),
            oidc_audience=os.getenv("PUKAIST_OIDC_AUDIENCE"),
            oidc_jwks_url=os.getenv("PUKAIST_OIDC_JWKS_URL"),
            oidc_dev_secret=os.getenv("PUKAIST_OIDC_DEV_SECRET"),
            audit_log=os.getenv("PUKAIST_AUDIT_LOG", "false").lower() == "true",
            worker_interval=int(os.getenv("WORKER_INTERVAL", "2")),
            worker_char_limit=int(os.getenv("WORKER_CHAR_LIMIT", "50000")),
            worker_tenant_id=worker_tenant_id,
            worker_allow_unscoped=worker_allow_unscoped,
            allowed_exts=allowed_exts,
            webhook_token=os.getenv("PUKAIST_WEBHOOK_TOKEN") or None,
            callback_allowlist=callback_allowlist,
            callback_allow_private=callback_allow_private,
            callback_allow_all=callback_allow_all,
            llm_insights_enabled=llm_insights_enabled,
            llm_forensic_enabled=llm_forensic_enabled,
            llm_forensic_temperature=llm_forensic_temperature,
            prefilter_keywords=prefilter_keywords,
            prefilter_min_chars=prefilter_min_chars,
            ocr_enabled=ocr_enabled,
            ocr_backend=ocr_backend,
            embeddings_enabled=embeddings_enabled,
            embeddings_provider=embeddings_provider,
            embeddings_model=embeddings_model,
            embeddings_dim=int(embeddings_dim_env) if embeddings_dim_env else None,
            place_suggest_enabled=place_suggest_enabled,
            place_gazetteer=place_gazetteer,
            summary_enabled=summary_enabled,
            max_docs_per_run=max_docs_per_run,
            project_theme=project_theme,
            project_config=project_config,
            relevancy_enabled=relevancy_enabled,
            relevancy_targets=relevancy_targets,
            relevancy_model=relevancy_model,
            roles_claim=roles_claim,
            role_admin=role_admin,
            role_ingest=role_ingest,
            role_viewer=role_viewer,
            kmz_enabled=kmz_enabled,
            default_tenant=os.getenv("PUKAIST_DEFAULT_TENANT") or None,
            tenant_claim=os.getenv("PUKAIST_TENANT_CLAIM") or None,
        )
