/**
 * Multi-Model Comparison Store
 * Send prompts to multiple models and compare responses
 */
import { create } from 'zustand';
import type { AiProvider } from './useAiProviderStore';

/** A model configuration for comparison */
export interface ComparisonModel {
  id: string;
  provider: AiProvider;
  model: string;
  label: string;
}

/** A comparison result from one model */
export interface ComparisonResult {
  modelId: string;
  response: string | null;
  error: string | null;
  latencyMs: number;
  tokenCount?: number;
  loading: boolean;
}

/** A comparison session */
export interface ComparisonSession {
  id: string;
  prompt: string;
  results: ComparisonResult[];
  createdAt: number;
}

/** Default comparison configs */
export const DEFAULT_COMPARISON_MODELS: ComparisonModel[] = [
  { id: 'gpt5', provider: 'openai', model: 'gpt-5.2-instant', label: 'GPT-5.2' },
  { id: 'claude', provider: 'anthropic', model: 'claude-sonnet-4.5', label: 'Claude' },
  { id: 'gemini', provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini' },
];

interface MultiModelState {
  /** Enabled for comparison mode */
  comparisonEnabled: boolean;
  /** Models to compare */
  models: ComparisonModel[];
  /** Current comparison session */
  currentSession: ComparisonSession | null;
  /** Past comparison sessions */
  history: ComparisonSession[];
  /** Toggle comparison mode */
  setComparisonEnabled: (enabled: boolean) => void;
  /** Add a model to compare */
  addModel: (model: Omit<ComparisonModel, 'id'>) => void;
  /** Remove a model */
  removeModel: (id: string) => void;
  /** Update a model */
  updateModel: (id: string, updates: Partial<ComparisonModel>) => void;
  /** Start a new comparison */
  startComparison: (prompt: string) => void;
  /** Update a result */
  updateResult: (modelId: string, result: Partial<ComparisonResult>) => void;
  /** Save current session to history */
  saveToHistory: () => void;
  /** Clear current session */
  clearSession: () => void;
  /** Reset to defaults */
  reset: () => void;
}

const generateId = () => `model_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const generateSessionId = () => `session_${Date.now()}`;

const defaults = {
  comparisonEnabled: false,
  models: DEFAULT_COMPARISON_MODELS,
  currentSession: null,
  history: [],
};

export const useMultiModelStore = create<MultiModelState>()((set, get) => ({
  ...defaults,

  setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),

  addModel: (model) => {
    set((state) => ({
      models: [...state.models, { ...model, id: generateId() }],
    }));
  },

  removeModel: (id) => {
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
    }));
  },

  updateModel: (id, updates) => {
    set((state) => ({
      models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  startComparison: (prompt) => {
    const state = get();
    const session: ComparisonSession = {
      id: generateSessionId(),
      prompt,
      results: state.models.map((m) => ({
        modelId: m.id,
        response: null,
        error: null,
        latencyMs: 0,
        loading: true,
      })),
      createdAt: Date.now(),
    };
    set({ currentSession: session });
  },

  updateResult: (modelId, result) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          results: state.currentSession.results.map((r) =>
            r.modelId === modelId ? { ...r, ...result } : r
          ),
        },
      };
    });
  },

  saveToHistory: () => {
    const state = get();
    if (!state.currentSession) return;
    set((s) => ({
      history: [state.currentSession!, ...s.history].slice(0, 10), // Keep last 10
    }));
  },

  clearSession: () => set({ currentSession: null }),

  reset: () => set(defaults),
}));
