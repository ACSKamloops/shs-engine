/**
 * Documents Panel - Premium Redesign
 * Document list with cards, status indicators, and drag-drop
 */
import type React from 'react';
import { useMemo, useState, useCallback } from 'react';
import { useDocsStore, useWizardStore } from '../../store';
import { usePipelineStore } from '../../store/usePipelineStore';
import { useApi } from '../../hooks/useApi';
import type { Doc } from '../../store';

interface DocsPanelProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

export const DocsPanel: React.FC<DocsPanelProps> = ({ sectionRef }) => {
  const docs = useDocsStore((s) => s.docs);
  const selectedId = useDocsStore((s) => s.selectedId);
  const setSelectedId = useDocsStore((s) => s.setSelectedId);
  const search = useDocsStore((s) => s.search);
  const reviewMode = useDocsStore((s) => s.reviewMode);
  const setRelevant = useDocsStore((s) => s.setRelevant);
  const setStatus = useDocsStore((s) => s.setStatus);
  const showDocsOpen = useDocsStore((s) => s.showDocsOpen);
  const setShowDocsOpen = useDocsStore((s) => s.setShowDocsOpen);
  
  // Bulk selection
  const selectionMode = useDocsStore((s) => s.selectionMode);
  const selectedIds = useDocsStore((s) => s.selectedIds);
  const toggleSelectionMode = useDocsStore((s) => s.toggleSelectionMode);
  const toggleSelect = useDocsStore((s) => s.toggleSelect);
  const selectAll = useDocsStore((s) => s.selectAll);
  const clearSelection = useDocsStore((s) => s.clearSelection);

  const fields = useWizardStore((s) => s.fields);
  const applyFrame = useWizardStore((s) => s.applyFrame);

  const toIntent = usePipelineStore((s) => s.toIntent);
  const { uploadDocs, deleteDoc, addToCollection, listCollections } = useApi();

  const [showUnlocatedOnly, setShowUnlocatedOnly] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [collections, setCollections] = useState<{name: string}[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const intent = { ...toIntent() };
      const theme = fields.theme || undefined;
      void uploadDocs(files, theme, intent);
    }
  }, [toIntent, uploadDocs, fields.theme]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = docs;

    if (showUnlocatedOnly) {
      base = base.filter((d) => d.lat == null || d.lng == null);
    }

    if (reviewMode) {
      const scoped = base.filter((d) => d.relevant || d.status === 'follow_up');
      if (scoped.length) base = scoped;
    }

    if (applyFrame) {
      const start = parseInt(fields.periodStart, 10);
      const end = parseInt(fields.periodEnd, 10);
      const hasValidPeriod = !isNaN(start) && !isNaN(end) && start > 0 && end > 0;
      const hasTheme = fields.theme && fields.theme.trim().length > 0;
      
      if (hasTheme || hasValidPeriod) {
        base = base.filter((d) => {
          let ok = true;
          if (hasTheme) {
            ok = ok && (d.theme || '').toLowerCase().includes(fields.theme.toLowerCase());
          }
          if (hasValidPeriod && d.created_at) {
            const year = new Date(d.created_at * 1000).getFullYear();
            ok = ok && year >= start && year <= end;
          }
          return ok;
        });
      }
    }

    if (!q) return base;
    return base.filter(
      (d) => d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q)
    );
  }, [applyFrame, docs, reviewMode, search, showUnlocatedOnly, fields.periodEnd, fields.periodStart, fields.theme]);

  const handleDragStart = (e: React.DragEvent, doc: Doc) => {
    e.dataTransfer.setData('application/x-doc-id', String(doc.id));
    e.dataTransfer.setData('text/plain', doc.title);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Status badge component
  const StatusBadge = ({ doc }: { doc: Doc }) => {
    if (doc.relevant) {
      return (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }
    if (doc.status === 'follow_up') {
      return (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
          !
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-white/30">
        <span className="w-2 h-2 rounded-full bg-white/20" />
      </span>
    );
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement> | undefined}
      className={`panel transition-all ${
        isDragOver ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''
      }`}
      data-tour="documents"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragOver && (
        <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-500/10 text-center animate-fade-in">
          <svg className="w-8 h-8 mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-indigo-300">Drop files to process</p>
          <p className="text-xs text-indigo-400/70 mt-1">Using current pipeline settings</p>
        </div>
      )}

      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents
          <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/60 font-normal">
            {filtered.length}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          {/* Unlocated filter */}
          <label className="flex items-center gap-1.5 text-[11px] text-white/50 cursor-pointer hover:text-white/70 transition-colors">
            <input
              type="checkbox"
              checked={showUnlocatedOnly}
              onChange={(e) => setShowUnlocatedOnly(e.target.checked)}
              className="w-3 h-3 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
            />
            Unlocated
          </label>
          <button
            onClick={toggleSelectionMode}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              selectionMode 
                ? 'bg-indigo-500 text-white' 
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
            title="Toggle selection mode"
          >
            ☑
          </button>
          <button
            onClick={() => setShowDocsOpen(!showDocsOpen)}
            className="btn-ghost btn-sm"
          >
            {showDocsOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-fade-in">
          <span className="text-xs text-indigo-300 font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={selectAll}
            className="px-2 py-1 text-[10px] bg-white/10 text-white/70 rounded hover:bg-white/20"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-2 py-1 text-[10px] text-white/50 hover:text-white"
          >
            Clear
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete ${selectedIds.size} documents? This cannot be undone.`)) return;
              setBulkLoading(true);
              for (const id of selectedIds) {
                await deleteDoc(id);
              }
              clearSelection();
              setBulkLoading(false);
            }}
            disabled={bulkLoading}
            className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50"
          >
            {bulkLoading ? '...' : '🗑 Delete'}
          </button>
          <select
            onChange={async (e) => {
              const colName = e.target.value;
              if (!colName) return;
              setBulkLoading(true);
              for (const id of selectedIds) {
                await addToCollection(colName, id);
              }
              clearSelection();
              setBulkLoading(false);
              e.target.value = '';
            }}
            onFocus={async () => {
              const cols = await listCollections();
              setCollections(cols);
            }}
            className="px-2 py-1 text-[10px] bg-purple-500/20 text-purple-300 rounded cursor-pointer"
            disabled={bulkLoading}
          >
            <option value="">+ Collection</option>
            {collections.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {showDocsOpen && (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 animate-fade-in">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-white/40">
                {showUnlocatedOnly ? 'All documents have locations' : 'No documents match filters'}
              </p>
            </div>
          ) : (
            filtered.map((doc, idx) => {
              const hasLocation = doc.lat != null && doc.lng != null;
              const isSelected = selectedId === doc.id;
              
              return (
                <div
                  key={doc.id}
                  draggable={!hasLocation && !selectionMode}
                  onDragStart={(e) => handleDragStart(e, doc)}
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelect(doc.id);
                    } else {
                      setSelectedId(doc.id);
                    }
                  }}
                  className={`group relative p-3 rounded-xl transition-all cursor-pointer ${
                    !hasLocation && !selectionMode ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${
                    selectedIds.has(doc.id)
                      ? 'bg-indigo-500/20 border border-indigo-500/50'
                      : isSelected
                      ? 'bg-indigo-500/15 border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                      : 'bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10'
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => toggleSelect(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                    )}
                    {/* Status indicator */}
                    <StatusBadge doc={doc} />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                          {doc.title}
                        </h3>
                        {!hasLocation && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/20">
                            📍 Drag to map
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                      {doc.theme && (
                        <span className="inline-flex items-center mt-2 px-2 py-0.5 text-[10px] bg-purple-500/15 text-purple-400 rounded border border-purple-500/20">
                          {doc.theme}
                        </span>
                      )}
                    </div>

                    {/* Action buttons (visible on selection) */}
                    {isSelected && (
                      <div className="flex flex-col gap-1.5 animate-fade-in">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRelevant(doc.id, !doc.relevant);
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
                            doc.relevant
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                              : 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white/80'
                          }`}
                        >
                          {doc.relevant ? '✓ Relevant' : 'Mark'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(doc.id, doc.status === 'follow_up' ? 'reviewed' : 'follow_up');
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
                            doc.status === 'follow_up'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                              : 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white/80'
                          }`}
                        >
                          {doc.status === 'follow_up' ? '! Follow' : 'Flag'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
