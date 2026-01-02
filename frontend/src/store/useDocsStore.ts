/**
 * Documents state store
 */
import { create } from 'zustand';

export interface Doc {
  id: number;
  title: string;
  summary: string;
  theme?: string;
  snippet?: string;
  doc_type?: string;
  created_at?: number;
  lat?: number;
  lng?: number;
  location_name?: string;
  status?: 'reviewed' | 'follow_up' | 'not_started';
  relevant?: boolean;
}

export interface Artifact {
  metadata?: Record<string, unknown> | null;
  content_preview?: string | null;
  insights?: Record<string, unknown> | null;
  summary?: string | null;
}

interface DocsState {
  // Data
  docs: Doc[];
  selectedId: number | null;
  search: string;
  themeFilter: string;
  docTypeFilter: string;
  reviewMode: boolean;
  artifact: Artifact | null;
  artifactCache: Record<number, Artifact>;
  docDetail: Doc | null;
  
  // UI toggles
  showFiltersOpen: boolean;
  showDocsOpen: boolean;

  // Bulk selection
  selectionMode: boolean;
  selectedIds: Set<number>;

  // Actions
  setDocs: (docs: Doc[]) => void;
  setSelectedId: (id: number | null) => void;
  setSearch: (q: string) => void;
  setThemeFilter: (theme: string) => void;
  setDocTypeFilter: (docType: string) => void;
  setReviewMode: (on: boolean) => void;
  setArtifact: (a: Artifact | null) => void;
  cacheArtifact: (docId: number, a: Artifact) => void;
  setDocDetail: (d: Doc | null) => void;
  setRelevant: (id: number, relevant: boolean) => void;
  setStatus: (id: number, status: Doc['status']) => void;
  setShowFiltersOpen: (open: boolean) => void;
  setShowDocsOpen: (open: boolean) => void;
  
  // Location update
  updateDocLocation: (id: number, lat: number, lng: number) => void;
  clearDocLocation: (id: number) => void;

  // Bulk selection actions
  toggleSelectionMode: () => void;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Navigation
  gotoNext: () => void;
  gotoPrev: () => void;
}

export const useDocsStore = create<DocsState>()((set, get) => ({
  // Defaults
  docs: [],
  selectedId: null,
  search: '',
  themeFilter: '',
  docTypeFilter: '',
  reviewMode: false,
  artifact: null,
  artifactCache: {},
  docDetail: null,
  showFiltersOpen: true,
  showDocsOpen: true,
  selectionMode: false,
  selectedIds: new Set<number>(),

  // Actions
  setDocs: (docs) => set({ docs }),
  setSelectedId: (id) => set({ selectedId: id }),
  setSearch: (q) => set({ search: q }),
  setThemeFilter: (theme) => set({ themeFilter: theme }),
  setDocTypeFilter: (docType) => set({ docTypeFilter: docType }),
  setReviewMode: (on) => set({ reviewMode: on }),
  setArtifact: (a) => set({ artifact: a }),
  cacheArtifact: (docId, a) =>
    set((state) => ({ artifactCache: { ...state.artifactCache, [docId]: a } })),
  setDocDetail: (d) => set({ docDetail: d }),
  setRelevant: (id, relevant) =>
    set((state) => ({
      docs: state.docs.map((d) => (d.id === id ? { ...d, relevant } : d)),
    })),
  setStatus: (id, status) =>
    set((state) => ({
      docs: state.docs.map((d) => (d.id === id ? { ...d, status } : d)),
    })),
  setShowFiltersOpen: (open) => set({ showFiltersOpen: open }),
  setShowDocsOpen: (open) => set({ showDocsOpen: open }),
  updateDocLocation: (id, lat, lng) =>
    set((state) => ({
      docs: state.docs.map((d) => (d.id === id ? { ...d, lat, lng } : d)),
    })),
  clearDocLocation: (id) =>
    set((state) => ({
      docs: state.docs.map((d) => (d.id === id ? { ...d, lat: undefined, lng: undefined } : d)),
    })),

  // Bulk selection actions
  toggleSelectionMode: () =>
    set((state) => ({
      selectionMode: !state.selectionMode,
      selectedIds: state.selectionMode ? new Set<number>() : state.selectedIds,
    })),
  toggleSelect: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedIds: newSet };
    }),
  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.docs.map((d) => d.id)),
    })),
  clearSelection: () => set({ selectedIds: new Set<number>() }),


  // Navigation
  gotoNext: () => {
    const { docs, selectedId, reviewMode } = get();
    const list = reviewMode
      ? docs.filter((d) => d.relevant || d.status === 'follow_up')
      : docs;
    if (!list.length) return;
    const idx = list.findIndex((d) => d.id === selectedId);
    const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0;
    set({ selectedId: list[nextIdx].id });
  },
  gotoPrev: () => {
    const { docs, selectedId, reviewMode } = get();
    const list = reviewMode
      ? docs.filter((d) => d.relevant || d.status === 'follow_up')
      : docs;
    if (!list.length) return;
    const idx = list.findIndex((d) => d.id === selectedId);
    const prevIdx = idx > 0 ? idx - 1 : list.length - 1;
    set({ selectedId: list[prevIdx].id });
  },
}));
