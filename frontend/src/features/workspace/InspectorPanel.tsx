/**
 * Inspector Panel - Premium Redesign
 * Document details, artifacts, and settings with tabbed interface
 */
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocsStore, useAppStore } from '../../store';
import { computeOcrQuality } from '../../utils/ocr';
import { PipelineStages, type PipelineStage } from '../../components/PipelineStages';
import { ConsultationPanel } from './ConsultationPanel';
import { JobsPanel } from './JobsPanel';
import { useApi } from '../../hooks/useApi';

interface InspectorPanelProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

type TabKey = 'source' | 'ocr' | 'metadata' | 'insights' | 'consult' | 'jobs' | 'pipeline';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'source', label: 'Source', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'ocr', label: 'OCR', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'metadata', label: 'Meta', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
  { key: 'insights', label: 'AI', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
  { key: 'consult', label: 'Geo', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { key: 'jobs', label: 'Jobs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { key: 'pipeline', label: 'Pipeline', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ sectionRef }) => {
  const selectedId = useDocsStore((s) => s.selectedId);
  const docs = useDocsStore((s) => s.docs);
  const artifact = useDocsStore((s) => s.artifact);
  const artifactCache = useDocsStore((s) => s.artifactCache);
  const showConfidence = useAppStore((s) => s.showConfidence);
  const copyNotice = useAppStore((s) => s.copyNotice);
  const setCopyNotice = useAppStore((s) => s.setCopyNotice);
  const navigate = useNavigate();
  const { deleteDoc, updateDoc, loadDocDetail, loadArtifact } = useApi();

  const [activeTab, setActiveTab] = useState<TabKey>('ocr');
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = docs.find((d) => d.id === selectedId);
  const currentArtifact = selected ? artifactCache[selected.id] || artifact : artifact;

  useEffect(() => {
    if (!selectedId) return;
    void loadDocDetail(selectedId);
    void loadArtifact(selectedId);
  }, [selectedId, loadDocDetail, loadArtifact]);

  const getPipelineStages = (): PipelineStage[] => {
    const hasOcr = Boolean(currentArtifact?.content_preview);
    const hasSummary = Boolean(currentArtifact?.summary);
    const hasInsights = Boolean(currentArtifact?.insights);
    const source = currentArtifact?.metadata?.source as string | undefined;
    
    return [
      { key: 'upload', label: 'Uploaded', done: true, detail: 'Document received' },
      { key: 'ocr', label: 'OCR', done: hasOcr, detail: source ? `Source: ${source}` : 'Text extraction' },
      { key: 'metadata', label: 'Metadata', done: Boolean(currentArtifact?.metadata), detail: 'Parsed metadata' },
      { key: 'summary', label: 'Summary', done: hasSummary, detail: hasSummary ? 'LLM summary' : 'Pending' },
      { key: 'indexed', label: 'Indexed', done: hasInsights, detail: hasInsights ? 'Search ready' : 'Pending' },
    ];
  };

  const formatSourceLabel = (src?: string | null): string => {
    const val = (src || '').toLowerCase();
    if (val === 'pdf_text') return 'PDF text';
    if (val === 'tesseract') return 'Tesseract OCR';
    if (val === 'hunyuan') return 'Hunyuan OCR';
    if (val === 'none') return 'No text';
    if (!src) return 'Unknown';
    return src;
  };

  const ocrQuality = currentArtifact?.content_preview
    ? computeOcrQuality(currentArtifact.content_preview)
    : null;

  const confidenceValue = currentArtifact?.metadata?.confidence;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(`${label} copied!`);
      setTimeout(() => setCopyNotice(null), 2000);
    } catch {
      setCopyNotice('Copy failed');
      setTimeout(() => setCopyNotice(null), 2000);
    }
  };

  // Quality badge component
  const QualityBadge = ({ quality }: { quality: string }) => {
    const colors = quality === 'high' 
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      : quality === 'medium'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
      : 'bg-red-500/15 text-red-400 border-red-500/20';
    
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${colors}`}>
        {quality.toUpperCase()}
      </span>
    );
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement> | undefined}
      className="panel relative"
      data-tour="inspector"
    >
      {/* Copy toast */}
      {copyNotice && (
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-emerald-500/25 animate-fade-in-down z-10">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            {copyNotice}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Inspector
        </h2>
        <div className="flex items-center gap-2">
          {ocrQuality && showConfidence && <QualityBadge quality={ocrQuality} />}
          {showConfidence && typeof confidenceValue === 'number' && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded border bg-indigo-500/15 text-indigo-400 border-indigo-500/20">
              {Math.round(confidenceValue * 100)}%
            </span>
          )}
          {selected && (
            <>
              <button
                onClick={() => {
                  setEditTitle(selected.title || '');
                  setEditTheme(selected.theme || '');
                  setEditSummary(selected.summary || '');
                  setShowEdit(true);
                }}
                className="px-2 py-1 text-[10px] bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 transition-colors"
                title="Edit document"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${selected.title}"? This cannot be undone.`)) {
                    deleteDoc(selected.id);
                  }
                }}
                className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                title="Delete document"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Theme</label>
                <input
                  type="text"
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Summary</label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={async () => {
                  setSaving(true);
                  await updateDoc(selected.id, {
                    title: editTitle || undefined,
                    theme: editTheme || undefined,
                    summary: editSummary || undefined,
                  });
                  setSaving(false);
                  setShowEdit(false);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Pill style */}
      <div className="flex gap-1 mb-4 p-1 bg-white/3 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${ 
              activeTab === tab.key
                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label && <span className="hidden sm:inline">{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {!selected ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-white/40 text-sm">Select a document to inspect</p>
          </div>
        ) : (
          <div className="text-sm">
            {activeTab === 'source' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-end">
                  <button
                    className="btn btn-ghost btn-sm text-xs"
                    onClick={() => {
                      if (!selected) return;
                      const meta = (currentArtifact?.metadata || {}) as any;
                      const stableId = meta.stable_id || meta.StableID || `doc-${selected.id}`;
                      const preview = (currentArtifact?.content_preview || selected.snippet || '').toString();
                      const trimmed = preview.length > 1200 ? preview.slice(0, 1200) + '…' : preview;
                      const msg =
                        `Review document ${stableId}.\n` +
                        `Title: ${selected.title}\n` +
                        (selected.theme ? `Theme: ${selected.theme}\n` : '') +
                        (selected.doc_type ? `Doc type: ${selected.doc_type}\n` : '') +
                        (selected.summary ? `Summary: ${selected.summary}\n` : '') +
                        (trimmed ? `\nPreview:\n${trimmed}\n` : '') +
                        `\nPlease extract key verbatim excerpts (enough context to verify) and suggest next steps.`;
                      try {
                        localStorage.setItem('pukaist-codex-prefill', msg);
                        if (selected.theme) {
                          localStorage.setItem('pukaist-admin-theme', selected.theme);
                        }
                      } catch {
                        // ignore
                      }
                      navigate('/admin?tab=chat');
                    }}
                    type="button"
                  >
                    Send to Codex Chat
                  </button>
                </div>
                {/* Document info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/3 rounded-lg p-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Title</p>
                    <p className="text-white/90 font-medium truncate">{selected.title}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-white/90">{selected.doc_type || 'Unknown'}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Theme</p>
                    <p className="text-white/90">{selected.theme || 'None'}</p>
                  </div>
                  {typeof currentArtifact?.metadata?.source === 'string' && (
                    <div className="bg-white/3 rounded-lg p-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Source</p>
                      <p className="text-white/90">{formatSourceLabel(currentArtifact.metadata.source as string)}</p>
                    </div>
                  )}
                </div>
                
                {/* Geo context */}
                {(selected.lat != null || selected.lng != null) && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">📍</span>
                        <p className="text-xs font-medium text-purple-300">Geo Context</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Clear location? Document will become draggable again.')) {
                            useDocsStore.getState().clearDocLocation(selected.id);
                          }
                        }}
                        className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        ✕ Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-white/50">Lat:</span>
                        <span className="ml-1 text-white/90 font-mono">{selected.lat?.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Lng:</span>
                        <span className="ml-1 text-white/90 font-mono">{selected.lng?.toFixed(6)}</span>
                      </div>
                    </div>
                    {selected.location_name && (
                      <p className="mt-2 text-xs text-white/70">{selected.location_name}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  {ocrQuality && <QualityBadge quality={ocrQuality} />}
                  {currentArtifact?.content_preview && (
                    <button
                      onClick={() => void handleCopy(currentArtifact.content_preview!, 'OCR')}
                      className="btn-ghost btn-sm text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  )}
                </div>
                <div className="bg-black/30 rounded-lg p-4 max-h-[280px] overflow-y-auto font-mono text-xs text-white/80 leading-relaxed border border-white/5">
                  {currentArtifact?.content_preview || (
                    <span className="text-white/40 italic">No OCR content available</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="space-y-3 animate-fade-in">
                {currentArtifact?.metadata ? (
                  <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-xs font-mono text-white/80 border border-white/5 max-h-[300px]">
                    {JSON.stringify(currentArtifact.metadata, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/40">No metadata available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4 animate-fade-in">
                {currentArtifact?.summary && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">Summary</span>
                      <button
                        onClick={() => void handleCopy(currentArtifact.summary!, 'Summary')}
                        className="btn-ghost btn-sm text-xs"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{currentArtifact.summary}</p>
                  </div>
                )}
                {currentArtifact?.insights ? (
                  <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-xs font-mono text-white/80 border border-white/5">
                    {JSON.stringify(currentArtifact.insights, null, 2)}
                  </pre>
                ) : (
                  !currentArtifact?.summary && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-white/40 text-sm">No AI insights available</p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'consult' && <ConsultationPanel />}
            {activeTab === 'jobs' && <JobsPanel />}

            {activeTab === 'pipeline' && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs text-white/50">Document processing pipeline:</p>
                <PipelineStages stages={getPipelineStages()} orientation="vertical" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
