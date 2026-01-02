/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcut handling for the application
 * Supports single-key and two-key sequences (e.g., g+d for go to dashboard)
 */
import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  prefix?: string; // For two-key sequences like 'g' then 'd'
  description: string;
  category?: 'navigation' | 'actions' | 'documents';
  action: () => void;
}

const shortcuts: KeyboardShortcut[] = [];
let isHelpVisible = false;

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(shortcut: KeyboardShortcut): () => void {
  shortcuts.push(shortcut);
  return () => {
    const index = shortcuts.indexOf(shortcut);
    if (index > -1) shortcuts.splice(index, 1);
  };
}

/**
 * Get all registered shortcuts
 */
export function getShortcuts(): KeyboardShortcut[] {
  return [...shortcuts];
}

/**
 * Toggle help panel visibility
 */
export function toggleShortcutHelp(): boolean {
  isHelpVisible = !isHelpVisible;
  return isHelpVisible;
}

/**
 * Format shortcut key for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  if (shortcut.prefix) parts.push(shortcut.prefix.toUpperCase());
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

/**
 * Hook to use keyboard shortcuts with support for two-key sequences
 */
export function useKeyboardShortcuts(customShortcuts?: KeyboardShortcut[]) {
  const pendingPrefix = useRef<string | null>(null);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const allShortcuts = [...shortcuts, ...(customShortcuts || [])];
    const key = e.key.toLowerCase();
    
    // Check if this completes a two-key sequence
    if (pendingPrefix.current) {
      const prefix = pendingPrefix.current;
      pendingPrefix.current = null;
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
      
      for (const shortcut of allShortcuts) {
        if (shortcut.prefix?.toLowerCase() === prefix && shortcut.key.toLowerCase() === key) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
      // Prefix didn't match any shortcut, fall through to normal handling
    }
    
    // Check for prefix keys (keys that start two-key sequences)
    const prefixKeys = new Set(allShortcuts.filter(s => s.prefix).map(s => s.prefix!.toLowerCase()));
    if (prefixKeys.has(key) && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      pendingPrefix.current = key;
      // Clear prefix after 1.5 seconds
      pendingTimeout.current = setTimeout(() => {
        pendingPrefix.current = null;
      }, 1500);
      return;
    }
    
    // Normal single-key shortcuts
    for (const shortcut of allShortcuts) {
      if (shortcut.prefix) continue; // Skip two-key shortcuts
      
      const keyMatch = key === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
      const shiftMatch = !!shortcut.shift === e.shiftKey;
      const altMatch = !!shortcut.alt === e.altKey;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [customShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Default application shortcuts
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation shortcuts (g + key)
  {
    key: 'd',
    prefix: 'g',
    category: 'navigation',
    description: 'Go to Dashboard',
    action: () => {
      window.location.href = '/';
    },
  },
  {
    key: 'o',
    prefix: 'g',
    category: 'navigation',
    description: 'Go to Documents',
    action: () => {
      window.location.href = '/documents';
    },
  },
  {
    key: 'm',
    prefix: 'g',
    category: 'navigation',
    description: 'Go to Map',
    action: () => {
      window.location.href = '/map';
    },
  },
  {
    key: 's',
    prefix: 'g',
    category: 'navigation',
    description: 'Go to Settings',
    action: () => {
      window.location.href = '/settings';
    },
  },
  {
    key: 'a',
    prefix: 'g',
    category: 'navigation',
    description: 'Go to Admin',
    action: () => {
      window.location.href = '/admin';
    },
  },
  // Action shortcuts
  {
    key: '/',
    category: 'actions',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
      searchInput?.focus();
    },
  },
  {
    key: 'n',
    category: 'actions',
    description: 'New project wizard',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:new-wizard'));
    },
  },
  {
    key: 'u',
    ctrl: true,
    category: 'actions',
    description: 'Upload files',
    action: () => {
      const uploadInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      uploadInput?.click();
    },
  },
  {
    key: 'Escape',
    category: 'actions',
    description: 'Close modal / Clear selection',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:escape'));
    },
  },
  {
    key: '?',
    shift: true,
    category: 'actions',
    description: 'Show keyboard shortcuts',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:help'));
    },
  },
  // Document shortcuts
  {
    key: 'j',
    category: 'documents',
    description: 'Next document',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:next-doc'));
    },
  },
  {
    key: 'k',
    category: 'documents',
    description: 'Previous document',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:prev-doc'));
    },
  },
  {
    key: 'e',
    category: 'actions',
    description: 'Export data',
    action: () => {
      document.dispatchEvent(new CustomEvent('shortcut:export'));
    },
  },
];

