/**
 * Map state store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MapSuggestion {
  id: string;
  title: string;
  lat: number;
  lng: number;
  confidence: 'high' | 'medium' | 'low';
}

interface MapState {
  // Layer visibility
  showDocs: boolean;
  showSuggestions: boolean;
  showAoi: boolean;
  showPoi: boolean;
  showGlobalDocs: boolean;
  showCustomLayer: boolean;
  dimOutOfFrame: boolean;
  aoiLayerVisibility: Record<string, boolean>;  // Per-layer visibility

  // Layer data
  aoiGeojson: Record<string, GeoJSON.FeatureCollection | null>;
  poiGeojson: GeoJSON.FeatureCollection | null;
  customLayer: GeoJSON.FeatureCollection | null;
  customLayerName: string | null;
  suggestions: MapSuggestion[];

  // Actions
  setShowDocs: (show: boolean) => void;
  setShowSuggestions: (show: boolean) => void;
  setShowAoi: (show: boolean) => void;
  setShowPoi: (show: boolean) => void;
  setShowGlobalDocs: (show: boolean) => void;
  setShowCustomLayer: (show: boolean) => void;
  setDimOutOfFrame: (dim: boolean) => void;
  setAoiGeojson: (key: string, data: GeoJSON.FeatureCollection | null) => void;
  setPoiGeojson: (data: GeoJSON.FeatureCollection | null) => void;
  setCustomLayer: (data: GeoJSON.FeatureCollection | null, name?: string) => void;
  clearCustomLayer: () => void;
  setSuggestions: (suggestions: MapSuggestion[]) => void;
  toggleAoiLayer: (key: string, visible: boolean) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      // Defaults
      showDocs: true,
      showSuggestions: true,
      showAoi: true,
      showPoi: true,
      showGlobalDocs: false,
      showCustomLayer: true,
      dimOutOfFrame: true,
      aoiLayerVisibility: {
        bc_territories: true,
        bc_languages: true,
        bc_treaties: true,
        bc_interior_watersheds: true,
      },
      aoiGeojson: {},
      poiGeojson: null,
      customLayer: null,
      customLayerName: null,
      suggestions: [],

      // Actions
      setShowDocs: (show) => set({ showDocs: show }),
      setShowSuggestions: (show) => set({ showSuggestions: show }),
      setShowAoi: (show) => set({ showAoi: show }),
      setShowPoi: (show) => set({ showPoi: show }),
      setShowGlobalDocs: (show) => set({ showGlobalDocs: show }),
      setShowCustomLayer: (show) => set({ showCustomLayer: show }),
      setDimOutOfFrame: (dim) => set({ dimOutOfFrame: dim }),
      setAoiGeojson: (key, data) =>
        set((state) => ({ aoiGeojson: { ...state.aoiGeojson, [key]: data } })),
      setPoiGeojson: (data) => set({ poiGeojson: data }),
      setCustomLayer: (data, name) => {
        set({ customLayer: data, customLayerName: name ?? null });
        // Persist to localStorage
        if (data && name) {
          try {
            localStorage.setItem('shs-custom-layer-data', JSON.stringify(data));
            localStorage.setItem('shs-custom-layer-name', name);
          } catch { /* ignore */ }
        }
      },
      clearCustomLayer: () => {
        set({ customLayer: null, customLayerName: null });
        try {
          localStorage.removeItem('shs-custom-layer-data');
          localStorage.removeItem('shs-custom-layer-name');
        } catch { /* ignore */ }
      },
      setSuggestions: (suggestions) => set({ suggestions }),
      toggleAoiLayer: (key, visible) =>
        set((state) => ({
          aoiLayerVisibility: { ...state.aoiLayerVisibility, [key]: visible },
        })),
    }),
    {
      name: 'shs-map-store',
      partialize: (state) => ({
        customLayerName: state.customLayerName,
        showDocs: state.showDocs,
        showAoi: state.showAoi,
        showPoi: state.showPoi,
        dimOutOfFrame: state.dimOutOfFrame,
        aoiLayerVisibility: state.aoiLayerVisibility,
      }),
    }
  )
);
