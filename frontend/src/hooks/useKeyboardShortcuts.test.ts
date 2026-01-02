/**
 * Keyboard Shortcuts Hook Tests
 */
import { describe, it, expect, vi } from 'vitest';
import {
  registerShortcut,
  getShortcuts,
  formatShortcut,
  DEFAULT_SHORTCUTS,
  type KeyboardShortcut,
} from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  describe('registerShortcut', () => {
    it('should add a shortcut to the registry', () => {
      const initialCount = getShortcuts().length;
      const shortcut: KeyboardShortcut = {
        key: 'x',
        description: 'Test shortcut',
        action: vi.fn(),
      };
      
      const unregister = registerShortcut(shortcut);
      expect(getShortcuts().length).toBe(initialCount + 1);
      
      // Cleanup
      unregister();
      expect(getShortcuts().length).toBe(initialCount);
    });

    it('should return an unregister function', () => {
      const shortcut: KeyboardShortcut = {
        key: 'y',
        description: 'Test shortcut 2',
        action: vi.fn(),
      };
      
      const unregister = registerShortcut(shortcut);
      expect(typeof unregister).toBe('function');
      unregister();
    });
  });

  describe('formatShortcut', () => {
    it('should format a simple key', () => {
      const shortcut: KeyboardShortcut = {
        key: 'a',
        description: 'Test',
        action: vi.fn(),
      };
      expect(formatShortcut(shortcut)).toBe('A');
    });

    it('should format a key with Ctrl modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 's',
        ctrl: true,
        description: 'Save',
        action: vi.fn(),
      };
      expect(formatShortcut(shortcut)).toBe('Ctrl + S');
    });

    it('should format a key with Shift modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: '?',
        shift: true,
        description: 'Help',
        action: vi.fn(),
      };
      expect(formatShortcut(shortcut)).toBe('Shift + ?');
    });

    it('should format a key with prefix (two-key sequence)', () => {
      const shortcut: KeyboardShortcut = {
        key: 'd',
        prefix: 'g',
        description: 'Go to Dashboard',
        action: vi.fn(),
      };
      expect(formatShortcut(shortcut)).toBe('G + D');
    });

    it('should format multiple modifiers', () => {
      const shortcut: KeyboardShortcut = {
        key: 'p',
        ctrl: true,
        shift: true,
        description: 'Print',
        action: vi.fn(),
      };
      expect(formatShortcut(shortcut)).toBe('Ctrl + Shift + P');
    });
  });

  describe('DEFAULT_SHORTCUTS', () => {
    it('should have navigation shortcuts with g prefix', () => {
      const navigationShortcuts = DEFAULT_SHORTCUTS.filter(s => s.prefix === 'g');
      expect(navigationShortcuts.length).toBeGreaterThan(0);
      expect(navigationShortcuts.some(s => s.key === 'd')).toBe(true); // Dashboard
      expect(navigationShortcuts.some(s => s.key === 'm')).toBe(true); // Map
      expect(navigationShortcuts.some(s => s.key === 's')).toBe(true); // Settings
    });

    it('should have the new wizard shortcut', () => {
      const wizardShortcut = DEFAULT_SHORTCUTS.find(s => s.key === 'n' && s.category === 'actions');
      expect(wizardShortcut).toBeDefined();
      expect(wizardShortcut?.description).toContain('wizard');
    });

    it('should have search focus shortcut', () => {
      const searchShortcut = DEFAULT_SHORTCUTS.find(s => s.key === '/');
      expect(searchShortcut).toBeDefined();
      expect(searchShortcut?.description.toLowerCase()).toContain('search');
    });

    it('should have help shortcut', () => {
      const helpShortcut = DEFAULT_SHORTCUTS.find(s => s.key === '?' && s.shift);
      expect(helpShortcut).toBeDefined();
    });

    it('should have document navigation shortcuts', () => {
      const nextDoc = DEFAULT_SHORTCUTS.find(s => s.key === 'j' && s.category === 'documents');
      const prevDoc = DEFAULT_SHORTCUTS.find(s => s.key === 'k' && s.category === 'documents');
      expect(nextDoc).toBeDefined();
      expect(prevDoc).toBeDefined();
    });

    it('should have all shortcuts categorized', () => {
      const categorized = DEFAULT_SHORTCUTS.filter(s => s.category);
      expect(categorized.length).toBe(DEFAULT_SHORTCUTS.length);
    });
  });
});
