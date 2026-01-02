/**
 * Density Context
 * Provides Compact/Comfortable density modes (inspired by Zotero 7)
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type DensityMode = 'compact' | 'comfortable';

interface DensityContextValue {
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextValue | null>(null);

const STORAGE_KEY = 'pukaist-density-mode';

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<DensityMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'compact' || stored === 'comfortable') {
        return stored;
      }
    }
    return 'comfortable'; // Default
  });

  const setDensity = (mode: DensityMode) => {
    setDensityState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const toggleDensity = () => {
    setDensity(density === 'compact' ? 'comfortable' : 'compact');
  };

  // Apply density as data attribute on root for CSS targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}

/**
 * CSS class helper for density-aware styling
 */
export function densityClass(compact: string, comfortable: string): string {
  // This is a static helper, actual density should be applied via CSS
  return `density-compact:${compact} density-comfortable:${comfortable}`;
}
