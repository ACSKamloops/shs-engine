import { useState } from "react";

type Props = {
  summary?: string | null;
  preview?: string | null;
  metadata?: Record<string, unknown> | null;
  insights?: Record<string, unknown> | null;
  relevancy?: { score?: number; rationale?: string; tags?: string[] } | null;
  artifactJson?: unknown;
  forensic?: {
    record_type?: string;
    breach_category?: string;
    reliability?: string;
    privileged?: boolean;
    key_quote?: string;
    entities?: {
      people?: string[];
      locations?: string[];
      organizations?: string[];
    };
  } | null;
  onDownload?: () => void;
  onCopy?: () => void;
  highlightTerms?: string[];
  onFlagLowOcr?: () => void;
};

export function ArtifactPanels({
  summary,
  preview,
  metadata,
  insights,
  relevancy,
  artifactJson,
  forensic,
  onDownload,
  onCopy,
  highlightTerms = [],
  onFlagLowOcr,
}: Props) {
  const hasForensic = Boolean(forensic);
  const tabs: ("summary" | "ocr" | "metadata" | "insights" | "forensic" | "artifact")[] = hasForensic
    ? ["summary", "ocr", "metadata", "insights", "forensic", "artifact"]
    : ["summary", "ocr", "metadata", "insights", "artifact"];
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(
    preview && !summary ? "ocr" : "summary",
  );
  const [expanded, setExpanded] = useState(false);

  const highlightText = (text: string, terms: string[]) => {
    if (!text || !terms.length) return text;
    const cleaned = terms
      .map((t) => t.trim())
      .filter((t) => t.length > 1)
      .map((t) => t.toLowerCase());
    if (!cleaned.length) return text;

    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = cleaned.map(escape).join("|");
    if (!pattern) return text;

    const re = new RegExp(`(${pattern})`, "gi");
    const parts = text.split(re);

    return parts.map((part, idx) => {
      const lower = part.toLowerCase();
      if (cleaned.includes(lower)) {
        return (
          <span key={idx} className="bg-amber-400/30 text-amber-100 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const estimateOcrQuality = (text: string | null | undefined): "high" | "medium" | "low" | null => {
    if (!text) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    const len = trimmed.length;
    if (len < 40) return "low";
    let cleanChars = 0;
    let noisyChars = 0;
    for (const ch of trimmed) {
      if (/[a-zA-Z0-9\s.,;:'"()-]/.test(ch)) cleanChars += 1;
      else noisyChars += 1;
    }
    const total = cleanChars + noisyChars || 1;
    const cleanRatio = cleanChars / total;
    if (cleanRatio < 0.5) return "low";
    if (len < 200 || cleanRatio < 0.75) return "medium";
    return "high";
  };

  const ocrQuality = estimateOcrQuality(preview || undefined);

  const renderContent = () => {
    if (activeTab === "summary") {
      return (
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pill bg-white/10 text-[11px]">Summary</span>
            {relevancy && typeof relevancy.score === "number" ? (
              <span className="pill bg-emerald-500/20 text-emerald-50 text-[11px]">
                Relevancy {relevancy.score}/100
              </span>
            ) : null}
            {relevancy?.tags && relevancy.tags.length ? (
              <span className="pill bg-sky-500/15 text-sky-50 text-[11px]">Tags: {relevancy.tags.join(", ")}</span>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap">{summary || "No summary recorded."}</p>
          {relevancy?.rationale && (
            <div className="text-xs text-slate-300">
              <p className="uppercase tracking-widest text-[10px] text-slate-400 mb-1">Rationale</p>
              <p>{relevancy.rationale}</p>
            </div>
          )}
        </div>
      );
    }
    if (activeTab === "ocr") {
      return preview ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="pill bg-white/10 text-[11px]">OCR Preview</span>
              {ocrQuality && (
                <span
                  className={`pill text-[10px] ${
                    ocrQuality === "high"
                      ? "bg-emerald-500/20 text-emerald-50"
                      : ocrQuality === "medium"
                        ? "bg-amber-400/30 text-amber-50"
                        : "bg-red-500/40 text-red-50"
                  }`}
                >
                  OCR quality: {ocrQuality}
                </span>
              )}
            </div>
            {ocrQuality === "low" && onFlagLowOcr && (
              <button
                type="button"
                className="text-[10px] px-2 py-1 rounded bg-red-500/30 text-red-50 hover:bg-red-500/50"
                onClick={onFlagLowOcr}
              >
                Flag for re-OCR / review
              </button>
            )}
          </div>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap">
            {highlightText(preview, highlightTerms)}
          </pre>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No OCR/text preview available.</p>
      );
    }
    if (activeTab === "metadata") {
      return metadata ? (
        <pre className="text-xs text-emerald-100 whitespace-pre-wrap">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-slate-400">No metadata recorded.</p>
      );
    }
    if (activeTab === "insights") {
      return insights ? (
        <pre className="text-xs text-emerald-100 whitespace-pre-wrap">
          {JSON.stringify(insights, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-slate-400">No insights recorded.</p>
      );
    }
    if (activeTab === "forensic") {
      if (!forensic) {
        return <p className="text-sm text-slate-400">No forensic metadata recorded.</p>;
      }
      const lists = [
        { label: "People", values: forensic.entities?.people },
        { label: "Locations", values: forensic.entities?.locations },
        { label: "Organizations", values: forensic.entities?.organizations },
      ];
      return (
        <div className="space-y-3 text-sm text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {forensic.record_type && <span className="pill bg-white/10 text-[11px]">Type: {forensic.record_type}</span>}
            {forensic.breach_category && (
              <span className="pill bg-emerald-500/20 text-emerald-50 text-[11px]">Theme: {forensic.breach_category}</span>
            )}
            {typeof forensic.privileged === "boolean" && (
              <span
                className={`pill text-[11px] ${
                  forensic.privileged ? "bg-purple-500/30 text-purple-50" : "bg-white/10 text-slate-100"
                }`}
              >
                Privileged: {forensic.privileged ? "Yes" : "No"}
              </span>
            )}
            {forensic.reliability && (
              <span className="pill bg-sky-500/20 text-sky-50 text-[11px]">Reliability: {forensic.reliability}</span>
            )}
          </div>
          {forensic.key_quote && (
            <div className="rounded border border-emerald-400/30 bg-emerald-500/5 p-3 text-emerald-50 text-sm">
              “{forensic.key_quote}”
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-200">
            {lists.map(
              (item) =>
                item.values &&
                item.values.length > 0 && (
                  <div key={item.label} className="rounded border border-white/10 bg-white/5 p-2">
                    <p className="uppercase tracking-widest text-[10px] text-slate-400 mb-1">{item.label}</p>
                    <ul className="space-y-1">
                      {item.values.slice(0, 8).map((v, idx) => (
                        <li key={idx} className="text-slate-100">
                          • {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </div>
        </div>
      );
    }
    // artifact
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <button className="text-xs px-2 py-1 rounded bg-emerald-400 text-slate-900 hover:bg-emerald-300" onClick={onDownload}>
            Download
          </button>
          <button className="text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20" onClick={onCopy}>
            Copy curl
          </button>
        </div>
        <pre className="text-xs text-emerald-100 whitespace-pre-wrap">
          {artifactJson ? JSON.stringify(artifactJson, null, 2) : "No artifact data available."}
        </pre>
      </div>
    );
  };

  const panelHeight = expanded ? "h-[520px]" : "h-[360px]";

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              className={`text-[11px] px-3 py-1 rounded-full ${
                activeTab === key ? "bg-emerald-400 text-slate-900" : "bg-white/10 text-slate-100 hover:bg-white/20"
              }`}
              onClick={() => setActiveTab(key)}
            >
              {key === "artifact" ? "Artifact JSON" : key === "ocr" ? "OCR" : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-[11px] px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      <div className={`rounded-lg border border-white/10 bg-black/60 overflow-auto p-3 ${panelHeight}`}>
        {renderContent()}
      </div>
    </div>
  );
}
