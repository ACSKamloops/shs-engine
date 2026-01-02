/**
 * Pipeline configuration store for document processing settings.
 * Controls which optional processing stages are enabled when uploading documents.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * OCR backend options:
 * - 'smart': Multi-signal classification (uses direct extraction for digital, VLM for scanned/handwritten)
 * - 'hunyuan': Force Hunyuan VLM OCR for all documents (best for handwriting)
 * - 'tesseract': Force Tesseract OCR (fast, printed text only)
 */
export type OcrBackend = 'smart' | 'hunyuan' | 'tesseract';

/** LLM processing mode */
export type LlmMode = 'sync' | 'batch' | 'offline';

/** Pipeline configuration state */
export interface PipelineConfig {
  /** Enable OCR for scanned documents/images */
  ocrEnabled: boolean;
  /** OCR backend: smart (recommended), hunyuan (VLM), or tesseract (legacy) */
  ocrBackend: OcrBackend;
  /** Enable LLM summarization */
  llmEnabled: boolean;
  /** LLM mode: sync (per-doc), batch (bulk), offline (skip) */
  llmMode: LlmMode;
  /** Enable text embeddings for semantic search */
  embeddingsEnabled: boolean;
  /** Enable geo extraction (coords, places) */
  geoEnabled: boolean;
  /** Enable LLM-based insights extraction */
  insightsEnabled: boolean;
  /** Enable forensic analysis (record type, reliability) */
  forensicEnabled: boolean;
}

/** Intent object sent to backend with upload */
export interface PipelineIntent {
  ocr_enabled?: boolean;
  ocr_backend?: OcrBackend;
  llm_mode?: LlmMode;
  summary_enabled?: boolean;
  embeddings_enabled?: boolean;
  place_suggest_enabled?: boolean;
  llm_insights_enabled?: boolean;
  llm_forensic_enabled?: boolean;
}

interface PipelineStore extends PipelineConfig {
  /** Update a single config value */
  set: <K extends keyof PipelineConfig>(key: K, value: PipelineConfig[K]) => void;
  /** Reset to defaults */
  reset: () => void;
  /** Export as backend intent object */
  toIntent: () => PipelineIntent;
}

const defaults: PipelineConfig = {
  ocrEnabled: true,
  ocrBackend: 'smart',
  llmEnabled: true,
  llmMode: 'sync',
  embeddingsEnabled: false,
  geoEnabled: true,
  insightsEnabled: false,
  forensicEnabled: false,
};

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set, get) => ({
      ...defaults,

      set: (key, value) => set({ [key]: value }),

      reset: () => set(defaults),

      toIntent: () => {
        const s = get();
        return {
          ocr_enabled: s.ocrEnabled,
          ocr_backend: s.ocrBackend,
          llm_mode: s.llmEnabled ? s.llmMode : 'offline',
          summary_enabled: s.llmEnabled,
          embeddings_enabled: s.embeddingsEnabled,
          place_suggest_enabled: s.geoEnabled,
          llm_insights_enabled: s.insightsEnabled,
          llm_forensic_enabled: s.forensicEnabled,
        };
      },
    }),
    {
      name: 'pukaist-pipeline-config',
    }
  )
);
