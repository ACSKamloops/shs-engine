/**
 * AI Rules Store
 * Custom instructions/rules for AI responses
 * Like Cursor's "Rules for AI" feature
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** A custom AI rule/instruction */
export interface AiRule {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  scope: 'global' | 'coding' | 'analysis' | 'summarization';
}

/** Built-in rule templates */
export const RULE_TEMPLATES: Omit<AiRule, 'id'>[] = [
  {
    name: 'Concise Responses',
    content: 'Be concise. Provide direct answers without unnecessary preamble or repetition.',
    enabled: false,
    scope: 'global',
  },
  {
    name: 'Expert Mode',
    content: 'Assume I am an expert. Skip basic explanations and provide advanced insights.',
    enabled: false,
    scope: 'global',
  },
  {
    name: 'Code Only',
    content: 'When coding, provide code solutions without explanations unless I ask.',
    enabled: false,
    scope: 'coding',
  },
  {
    name: 'Step-by-Step',
    content: 'Explain your reasoning step-by-step before giving the final answer.',
    enabled: false,
    scope: 'analysis',
  },
  {
    name: 'Indigenous Context',
    content: 'Consider Indigenous perspectives, treaty rights, and traditional territories in analysis. Use respectful terminology.',
    enabled: false,
    scope: 'analysis',
  },
  {
    name: 'Legal Precision',
    content: 'Use precise legal terminology. Cite relevant statutes, treaties, or case law when applicable.',
    enabled: false,
    scope: 'analysis',
  },
  {
    name: 'Executive Summary',
    content: 'Start every response with a one-paragraph executive summary, then provide details.',
    enabled: false,
    scope: 'summarization',
  },
];

interface AiRulesState {
  /** User's custom rules */
  rules: AiRule[];
  /** Global system prompt (prepended to all requests) */
  globalSystemPrompt: string;
  /** Add a new rule */
  addRule: (rule: Omit<AiRule, 'id'>) => void;
  /** Update an existing rule */
  updateRule: (id: string, updates: Partial<AiRule>) => void;
  /** Delete a rule */
  deleteRule: (id: string) => void;
  /** Toggle a rule's enabled state */
  toggleRule: (id: string) => void;
  /** Set global system prompt */
  setGlobalPrompt: (prompt: string) => void;
  /** Get all enabled rules as a combined prompt */
  getEnabledRulesPrompt: (scope?: AiRule['scope']) => string;
  /** Reset to defaults */
  reset: () => void;
}

const generateId = () => `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const defaults = {
  rules: [],
  globalSystemPrompt: '',
};

export const useAiRulesStore = create<AiRulesState>()(
  persist(
    (set, get) => ({
      ...defaults,

      addRule: (rule) => {
        set((state) => ({
          rules: [...state.rules, { ...rule, id: generateId() }],
        }));
      },

      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        }));
      },

      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        }));
      },

      setGlobalPrompt: (prompt) => {
        set({ globalSystemPrompt: prompt });
      },

      getEnabledRulesPrompt: (scope) => {
        const state = get();
        const enabledRules = state.rules.filter(
          (r) => r.enabled && (!scope || r.scope === 'global' || r.scope === scope)
        );
        
        const parts: string[] = [];
        
        if (state.globalSystemPrompt.trim()) {
          parts.push(state.globalSystemPrompt);
        }
        
        if (enabledRules.length > 0) {
          parts.push('Rules to follow:');
          enabledRules.forEach((r, i) => {
            parts.push(`${i + 1}. ${r.content}`);
          });
        }
        
        return parts.join('\n');
      },

      reset: () => set(defaults),
    }),
    {
      name: 'pukaist-ai-rules',
    }
  )
);
