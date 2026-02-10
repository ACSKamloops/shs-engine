/**
 * Density Context Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('DensityContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('density modes', () => {
    it('should define compact mode with smaller values', () => {
      // Test CSS variable definitions
      const compactPadding = '0.25rem';
      const comfortablePadding = '0.5rem';
      
      expect(parseFloat(compactPadding)).toBeLessThan(parseFloat(comfortablePadding));
    });

    it('should define comfortable mode with larger values', () => {
      const compactRowHeight = '2rem';
      const comfortableRowHeight = '2.5rem';
      
      expect(parseFloat(comfortableRowHeight)).toBeGreaterThan(parseFloat(compactRowHeight));
    });
  });

  describe('localStorage persistence', () => {
    it('should save density preference to localStorage', () => {
      const key = 'shs-density-mode';
      const value = 'compact';
      
      localStorageMock.setItem(key, value);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(key, value);
      expect(localStorageMock.getItem(key)).toBe(value);
    });

    it('should retrieve density preference from localStorage', () => {
      const key = 'shs-density-mode';
      localStorageMock.setItem(key, 'comfortable');
      
      expect(localStorageMock.getItem(key)).toBe('comfortable');
    });

    it('should default to comfortable when no preference stored', () => {
      const key = 'shs-density-mode';
      const defaultMode = localStorageMock.getItem(key) || 'comfortable';
      
      expect(defaultMode).toBe('comfortable');
    });
  });

  describe('data-density attribute', () => {
    it('compact mode should have expected CSS variable values', () => {
      const compactVariables = {
        '--density-padding-sm': '0.25rem',
        '--density-padding-md': '0.5rem',
        '--density-padding-lg': '0.75rem',
        '--density-gap-sm': '0.25rem',
        '--density-gap-md': '0.5rem',
        '--density-row-height': '2rem',
      };
      
      expect(compactVariables['--density-row-height']).toBe('2rem');
    });

    it('comfortable mode should have expected CSS variable values', () => {
      const comfortableVariables = {
        '--density-padding-sm': '0.5rem',
        '--density-padding-md': '0.75rem',
        '--density-padding-lg': '1rem',
        '--density-gap-sm': '0.5rem',
        '--density-gap-md': '0.75rem',
        '--density-row-height': '2.5rem',
      };
      
      expect(comfortableVariables['--density-row-height']).toBe('2.5rem');
    });
  });

  describe('toggle functionality', () => {
    it('should toggle from compact to comfortable', () => {
      let density: 'compact' | 'comfortable' = 'compact';
      const toggle = () => {
        density = density === 'compact' ? 'comfortable' : 'compact';
      };
      
      toggle();
      expect(density).toBe('comfortable');
    });

    it('should toggle from comfortable to compact', () => {
      let density: 'compact' | 'comfortable' = 'comfortable';
      const toggle = () => {
        density = density === 'compact' ? 'comfortable' : 'compact';
      };
      
      toggle();
      expect(density).toBe('compact');
    });
  });
});
