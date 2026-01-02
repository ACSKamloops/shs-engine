/**
 * Theme Store
 * Manages dark/light theme with localStorage persistence
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: () => 'dark' | 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      resolvedTheme: () => {
        const theme = get().theme;
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'pukaist-theme',
    }
  )
);

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
}

/**
 * Initialize theme on app load
 */
export function initializeTheme() {
  const stored = localStorage.getItem('pukaist-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      applyTheme(parsed.state?.theme || 'dark');
    } catch {
      applyTheme('dark');
    }
  } else {
    applyTheme('dark');
  }
}
