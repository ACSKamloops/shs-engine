/**
 * Saved Filters Store
 * Persists named spatial and search filters to localStorage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedFilter {
  id: string;
  name: string;
  createdAt: number;
  geometry?: string; // GeoJSON string
  theme?: string;
  dateRange?: { start: string; end: string };
  breach?: string;
  aoiCode?: string;
}

interface SavedFiltersState {
  filters: SavedFilter[];
  addFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt'>) => void;
  removeFilter: (id: string) => void;
  getFilter: (id: string) => SavedFilter | undefined;
  clearAll: () => void;
}

export const useSavedFiltersStore = create<SavedFiltersState>()(
  persist(
    (set, get) => ({
      filters: [],
      
      addFilter: (filter) => {
        const id = `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((state) => ({
          filters: [...state.filters, { ...filter, id, createdAt: Date.now() }],
        }));
      },
      
      removeFilter: (id) => {
        set((state) => ({
          filters: state.filters.filter((f) => f.id !== id),
        }));
      },
      
      getFilter: (id) => {
        return get().filters.find((f) => f.id === id);
      },
      
      clearAll: () => {
        set({ filters: [] });
      },
    }),
    {
      name: 'pukaist-saved-filters',
    }
  )
);

export default useSavedFiltersStore;
