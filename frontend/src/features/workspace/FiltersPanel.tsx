/**
 * Filters Panel - Premium Redesign
 * Mission controls, search, and filter management
 */
import type React from 'react';
import { useRef, useState } from 'react';
import { useDocsStore, useWizardStore, useAppStore, useMapStore } from '../../store';
import { useApi } from '../../hooks';
import { SAMPLE_DOCS, SAMPLE_ARTIFACTS } from '../../sampleData';
import { SavedFiltersPanel } from './SavedFiltersPanel';

interface FiltersPanelProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ sectionRef }) => {
  const kmzInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const docs = useDocsStore((s) => s.docs);
  const search = useDocsStore((s) => s.search);
  const setSearch = useDocsStore((s) => s.setSearch);
  const themeFilter = useDocsStore((s) => s.themeFilter);
  const setThemeFilter = useDocsStore((s) => s.setThemeFilter);
  const docTypeFilter = useDocsStore((s) => s.docTypeFilter);
  const setDocTypeFilter = useDocsStore((s) => s.setDocTypeFilter);
  const reviewMode = useDocsStore((s) => s.reviewMode);
  const setReviewMode = useDocsStore((s) => s.setReviewMode);
  const showFiltersOpen = useDocsStore((s) => s.showFiltersOpen);
  const setShowFiltersOpen = useDocsStore((s) => s.setShowFiltersOpen);
  const setDocs = useDocsStore((s) => s.setDocs);
  const setSelectedId = useDocsStore((s) => s.setSelectedId);
  const cacheArtifact = useDocsStore((s) => s.cacheArtifact);

  const fields = useWizardStore((s) => s.fields);
  const applyFrame = useWizardStore((s) => s.applyFrame);
  const setApplyFrame = useWizardStore((s) => s.setApplyFrame);
  const setOpen = useWizardStore((s) => s.setOpen);

  const showConfidence = useAppStore((s) => s.showConfidence);
  const setShowConfidence = useAppStore((s) => s.setShowConfidence);
  const useLiveApi = useAppStore((s) => s.useLiveApi);
  const setUseLiveApi = useAppStore((s) => s.setUseLiveApi);
  const setBanner = useAppStore((s) => s.setBanner);

  const dimOutOfFrame = useMapStore((s) => s.dimOutOfFrame);
  const setDimOutOfFrame = useMapStore((s) => s.setDimOutOfFrame);

  const uploading = useAppStore((s) => s.uploading);
  
  const { loadDocs, importKmz, uploadDocs } = useApi();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void uploadDocs(files);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const handleKmzImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void importKmz(file);
      if (kmzInputRef.current) kmzInputRef.current.value = '';
    }
  };

  const handleLoadDemo = () => {
    setDocs(SAMPLE_DOCS);
    setSelectedId(SAMPLE_DOCS[0]?.id ?? null);
    for (const [id, artifact] of Object.entries(SAMPLE_ARTIFACTS)) {
      cacheArtifact(parseInt(id, 10), artifact);
    }
    setBanner('Demo dataset loaded');
  };

  const themes = Array.from(new Set(docs.filter((d) => d.theme).map((d) => d.theme!)));
  const docTypes = Array.from(new Set(docs.filter((d) => d.doc_type).map((d) => d.doc_type!)));

  // Toggle component
  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-all ${
          checked ? 'bg-indigo-500' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">{label}</span>
    </label>
  );

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement> | undefined}
      className="panel"
      data-tour="filters"
    >
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h2>
        <button
          onClick={() => setShowFiltersOpen(!showFiltersOpen)}
          className="btn-ghost btn-sm text-xs"
        >
          {showFiltersOpen ? (
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

      {showFiltersOpen && (
        <div className="space-y-4 animate-fade-in">
          {/* Search Input */}
          <div className="relative">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
              isSearchFocused
                ? 'bg-white/7 border-indigo-500/50 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
                : 'bg-white/5 border-white/10 hover:border-white/15'
            }`}>
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && void loadDocs(search, themeFilter, docTypeFilter)}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="select text-xs"
            >
              <option value="">All themes</option>
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="select text-xs"
            >
              <option value="">All types</option>
              {docTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Mission Summary Card */}
          {fields.mission && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-indigo-300 mb-0.5">Active Goal</p>
                  <p className="text-xs text-white/70 line-clamp-2">{fields.mission}</p>
                </div>
              </div>
            </div>
          )}

          {/* Frame Details */}
          {applyFrame && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-1">
              <p className="text-[11px] text-purple-300 font-medium">Frame Applied</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-white/60">
                <span>Period:</span>
                <span className="text-white/80">{fields.periodStart}–{fields.periodEnd}</span>
                <span>Theme:</span>
                <span className="text-white/80">{fields.theme || 'any'}</span>
                <span>AOI:</span>
                <span className="text-white/80">{fields.aoiTheme}/{fields.aoiCode || 'n/a'}</span>
              </div>
            </div>
          )}

          {/* Toggle Controls */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <Toggle checked={useLiveApi} onChange={setUseLiveApi} label="Live API" />
            <Toggle checked={reviewMode} onChange={setReviewMode} label="Review Mode" />
            <Toggle checked={applyFrame} onChange={setApplyFrame} label="Apply Frame" />
            <Toggle checked={dimOutOfFrame} onChange={setDimOutOfFrame} label="Dim Others" />
            <Toggle checked={showConfidence} onChange={setShowConfidence} label="Confidence" />
          </div>

          {/* Keyboard Hint */}
          <p className="text-[10px] text-white/30 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px]">j</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px]">k</kbd>
            <span>to navigate</span>
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setOpen(true)}
              className="btn-primary btn-sm col-span-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Wizard
            </button>
            <button
              onClick={handleLoadDemo}
              className="btn-secondary btn-sm"
            >
              Demo
            </button>
            <button
              onClick={() => kmzInputRef.current?.click()}
              className="btn-secondary btn-sm"
              title="Import KMZ/KML/GeoJSON"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              uploading
                ? 'bg-emerald-500/20 text-emerald-400 cursor-wait'
                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
            }`}
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Documents</span>
              </>
            )}
          </button>

          {/* Hidden file inputs */}
          <input
            ref={kmzInputRef}
            type="file"
            accept=".kmz,.kml,.geojson,.json"
            className="hidden"
            onChange={handleKmzImport}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.doc"
            multiple
            className="hidden"
            onChange={handleUpload}
          />

          {/* Saved Filters */}
          <SavedFiltersPanel
            currentTheme={themeFilter || undefined}
            currentDateRange={undefined}
            onApplyFilter={(filter) => {
              if (filter.theme) setThemeFilter(filter.theme);
              if (filter.dateRange?.start) {
                // Could apply date range filtering here
              }
            }}
          />
        </div>
      )}
    </section>
  );
};
