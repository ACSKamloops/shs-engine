/**
 * Filter Presets Store
 * Save and load filter configurations
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterPreset {
  id: string;
  name: string;
  createdAt: number;
  filters: {
    theme?: string;
    docType?: string;
    status?: string;
    hasGeo?: boolean;
    searchQuery?: string;
  };
}

interface FilterPresetsState {
  presets: FilterPreset[];
  addPreset: (name: string, filters: FilterPreset['filters']) => void;
  removePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
}

export const useFilterPresetsStore = create<FilterPresetsState>()(
  persist(
    (set) => ({
      presets: [],
      
      addPreset: (name, filters) => {
        const preset: FilterPreset = {
          id: `preset-${Date.now()}`,
          name,
          createdAt: Date.now(),
          filters,
        };
        set((s) => ({ presets: [...s.presets, preset] }));
      },
      
      removePreset: (id) => {
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
      },
      
      renamePreset: (id, name) => {
        set((s) => ({
          presets: s.presets.map((p) => (p.id === id ? { ...p, name } : p)),
        }));
      },
    }),
    {
      name: 'pukaist-filter-presets',
    }
  )
);
