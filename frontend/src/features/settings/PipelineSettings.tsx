/**
 * Pipeline Settings panel for configuring document processing stages.
 * Toggle switches for OCR, LLM, embeddings, geo, insights, and forensic analysis.
 */
import { usePipelineStore, type OcrBackend, type LlmMode } from '../../store/usePipelineStore';

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
};

function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <label className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div>
        <span className="text-sm font-medium text-white">{label}</span>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}

type SelectProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
};

function Select<T extends string>({ label, value, options, onChange, disabled }: SelectProps<T>) {
  return (
    <label className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm font-medium text-white">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="px-2 py-1 text-sm bg-slate-700 border border-white/10 rounded text-white disabled:opacity-40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PipelineSettings() {
  const store = usePipelineStore();

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        📋 Pipeline Settings
      </h3>

      {/* OCR Section */}
      <div className="bg-black/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">👁️</span>
          <span className="text-sm font-semibold text-white">OCR / Machine Vision</span>
        </div>
        <Toggle
          label="Enable OCR"
          checked={store.ocrEnabled}
          onChange={(v) => store.set('ocrEnabled', v)}
          hint="Extract text from scanned documents and images"
        />
        <Select<OcrBackend>
          label="OCR Backend"
          value={store.ocrBackend}
          options={[
            { value: 'tesseract', label: 'Tesseract (fast)' },
            { value: 'hunyuan', label: 'Hunyuan (handwritten)' },
          ]}
          onChange={(v) => store.set('ocrBackend', v)}
          disabled={!store.ocrEnabled}
        />
      </div>

      {/* LLM Section */}
      <div className="bg-black/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold text-white">LLM Processing</span>
        </div>
        <Toggle
          label="Enable Summarization"
          checked={store.llmEnabled}
          onChange={(v) => store.set('llmEnabled', v)}
          hint="Generate AI summaries for documents"
        />
        <Select<LlmMode>
          label="Processing Mode"
          value={store.llmMode}
          options={[
            { value: 'sync', label: 'Sync (per-doc)' },
            { value: 'batch', label: 'Batch (bulk)' },
            { value: 'offline', label: 'Offline (skip)' },
          ]}
          onChange={(v) => store.set('llmMode', v)}
          disabled={!store.llmEnabled}
        />
      </div>

      {/* Optional Stages */}
      <div className="bg-black/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚙️</span>
          <span className="text-sm font-semibold text-white">Optional Stages</span>
        </div>
        <Toggle
          label="📊 Embeddings"
          checked={store.embeddingsEnabled}
          onChange={(v) => store.set('embeddingsEnabled', v)}
          hint="Semantic search vectors (requires API key)"
        />
        <Toggle
          label="📍 Geo Context"
          checked={store.geoEnabled}
          onChange={(v) => store.set('geoEnabled', v)}
          hint="Extract coordinates and place names"
        />
        <Toggle
          label="🔍 LLM Insights"
          checked={store.insightsEnabled}
          onChange={(v) => store.set('insightsEnabled', v)}
          hint="AI-extracted entities and themes"
        />
        <Toggle
          label="🔬 Forensic Analysis"
          checked={store.forensicEnabled}
          onChange={(v) => store.set('forensicEnabled', v)}
          hint="Record type, reliability, key quotes"
        />
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => store.reset()}
        className="w-full py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
