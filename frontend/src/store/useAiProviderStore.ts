/**
 * AI Provider configuration store.
 * Stores user's AI provider preferences in localStorage.
 * 
 * SECURITY: API keys are stored client-side only and NEVER sent to the backend.
 * They are used for direct browser-to-provider API calls.
 * 
 * Features:
 * - Multi-provider support (11 providers, 300+ models via OpenRouter)
 * - Tiered model selection (Economy/Balanced/Premium)
 * - Cost estimates and context window info
 * - Auto mode for smart model selection
 * - Presets for quick configuration
 * - OpenAI Batch API support
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Supported AI providers - Updated December 2025 */
export type AiProvider = 
  | 'openai' 
  | 'gemini' 
  | 'anthropic'
  | 'deepseek'
  | 'xai'
  | 'mistral'
  | 'ollama' 
  | 'groq' 
  | 'together' 
  | 'openrouter' 
  | 'custom';

/** Model option with pricing and context info */
export interface ModelOption {
  id: string;
  name: string;
  tier: 'economy' | 'balanced' | 'premium';
  description: string;
  /** Context window in tokens */
  contextWindow: number;
  /** Input cost per 1M tokens in USD */
  inputCost: number;
  /** Output cost per 1M tokens in USD */
  outputCost: number;
  /** Supports vision/images */
  supportsVision?: boolean;
  /** Supports OpenAI Batch API (50% discount) */
  supportsBatch?: boolean;
  /** Optimized for coding */
  isCodeModel?: boolean;
}

/** Provider preset configuration with tiered models */
export interface ProviderPreset {
  name: string;
  description: string;
  baseUrl: string;
  models: ModelOption[];
  defaultModel: string;
  requiresApiKey: boolean;
  apiKeyUrl?: string;
  apiKeyNote?: string;
  pricingUrl?: string;
}

/** Built-in presets for quick configuration */
export interface Preset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  provider: AiProvider;
  model: string;
  useBatch?: boolean;
}

/** Auto mode preference */
export type AutoModePreference = 'cost' | 'quality' | 'speed' | 'balanced';

// =============================================================================
// BUILT-IN PRESETS
// =============================================================================

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'fast-cheap',
    name: 'Fast & Cheap',
    emoji: '⚡',
    description: 'Groq + Llama 3.1 8B - Free tier, ultra-fast inference',
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
  },
  {
    id: 'best-quality',
    name: 'Best Quality',
    emoji: '⭐',
    description: 'OpenAI GPT-5.2 Thinking - Top reasoning, 400k context',
    provider: 'openai',
    model: 'gpt-5.2-thinking',
  },
  {
    id: 'coding',
    name: 'Coding',
    emoji: '💻',
    description: 'Anthropic Claude Opus 4.5 - Best for code generation',
    provider: 'anthropic',
    model: 'claude-opus-4.5',
  },
  {
    id: 'batch-processing',
    name: 'Batch Processing',
    emoji: '📦',
    description: 'OpenAI Batch API - 50% cheaper, 24h completion',
    provider: 'openai',
    model: 'gpt-5.2-instant',
    useBatch: true,
  },
  {
    id: 'budget-reasoning',
    name: 'Budget Reasoning',
    emoji: '🧠',
    description: 'DeepSeek R1 - Great reasoning at 10x less cost',
    provider: 'deepseek',
    model: 'deepseek-r1',
  },
  {
    id: 'openrouter-auto',
    name: 'OpenRouter',
    emoji: '🌐',
    description: 'Access 300+ models with one key (5.5% fee)',
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash',
  },
  {
    id: 'local-free',
    name: 'Local (Free)',
    emoji: '🏠',
    description: 'Ollama + Llama 3.2 - 100% free, runs locally',
    provider: 'ollama',
    model: 'llama3.2',
  },
];

// =============================================================================
// PROVIDER PRESETS WITH FULL MODEL DATA
// =============================================================================

export const PROVIDER_PRESETS: Record<AiProvider, ProviderPreset> = {
  openai: {
    name: 'OpenAI',
    description: 'Industry leader with GPT-5 series',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-5.2-thinking', name: 'GPT-5.2 Thinking', tier: 'premium', description: '400k context, deep reasoning (Dec 2025)', contextWindow: 400000, inputCost: 15, outputCost: 60, supportsVision: true, supportsBatch: true },
      { id: 'gpt-5.2-instant', name: 'GPT-5.2 Instant', tier: 'balanced', description: 'Fast responses, great quality', contextWindow: 128000, inputCost: 2.5, outputCost: 10, supportsVision: true, supportsBatch: true },
      { id: 'gpt-5.1', name: 'GPT-5.1', tier: 'balanced', description: 'Nov 2025 release', contextWindow: 128000, inputCost: 2, outputCost: 8, supportsVision: true, supportsBatch: true },
      { id: 'o3-mini', name: 'o3-mini', tier: 'economy', description: 'Cost-efficient reasoning', contextWindow: 128000, inputCost: 1.1, outputCost: 4.4, supportsBatch: true },
      { id: 'gpt-5-codex', name: 'GPT-5 Codex', tier: 'balanced', description: 'Coding specialist', contextWindow: 128000, inputCost: 2.5, outputCost: 10, isCodeModel: true, supportsBatch: true },
    ],
    defaultModel: 'gpt-5.2-instant',
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeyNote: 'Free tier available with limits',
    pricingUrl: 'https://openai.com/pricing',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Free tier available, multimodal',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro', tier: 'premium', description: 'Most intelligent (Nov 2025)', contextWindow: 1000000, inputCost: 1.25, outputCost: 5, supportsVision: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'balanced', description: 'Stable, great reasoning', contextWindow: 1000000, inputCost: 1.25, outputCost: 5, supportsVision: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'economy', description: 'Fast & very affordable', contextWindow: 1000000, inputCost: 0.075, outputCost: 0.3, supportsVision: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'economy', description: 'Ultra low-cost', contextWindow: 1000000, inputCost: 0.02, outputCost: 0.08, supportsVision: true },
    ],
    defaultModel: 'gemini-2.5-flash',
    requiresApiKey: true,
    apiKeyUrl: 'https://aistudio.google.com/apikey',
    apiKeyNote: 'Free tier: 60 requests/minute',
    pricingUrl: 'https://ai.google.dev/pricing',
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Best for coding & agents',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', tier: 'premium', description: 'Most capable (Nov 2025)', contextWindow: 200000, inputCost: 15, outputCost: 75, supportsVision: true, isCodeModel: true },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', tier: 'balanced', description: 'Great balance of speed & quality', contextWindow: 200000, inputCost: 3, outputCost: 15, supportsVision: true, isCodeModel: true },
      { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', tier: 'economy', description: 'Fast & affordable', contextWindow: 200000, inputCost: 0.8, outputCost: 4, supportsVision: true },
    ],
    defaultModel: 'claude-sonnet-4.5',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyNote: '$5 free credits on signup',
    pricingUrl: 'https://www.anthropic.com/pricing',
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'Extremely affordable, great reasoning',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek R1', tier: 'balanced', description: 'Reasoning specialist', contextWindow: 131000, inputCost: 0.55, outputCost: 2.19 },
      { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', tier: 'economy', description: 'Best value for money', contextWindow: 131000, inputCost: 0.27, outputCost: 1.1 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', tier: 'economy', description: 'Coding specialist, very cheap', contextWindow: 131000, inputCost: 0.14, outputCost: 0.28, isCodeModel: true },
    ],
    defaultModel: 'deepseek-v3.2',
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    apiKeyNote: '~10x cheaper than OpenAI',
    pricingUrl: 'https://platform.deepseek.com/pricing',
  },
  xai: {
    name: 'xAI Grok',
    description: 'Real-time knowledge, social context',
    baseUrl: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-4.1', name: 'Grok 4.1', tier: 'premium', description: 'Enhanced reasoning (Nov 2025)', contextWindow: 131000, inputCost: 5, outputCost: 15 },
      { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', tier: 'balanced', description: 'Quick responses', contextWindow: 131000, inputCost: 2, outputCost: 10 },
      { id: 'grok-code-fast', name: 'Grok Code Fast', tier: 'economy', description: 'Rapid code generation', contextWindow: 131000, inputCost: 1, outputCost: 5, isCodeModel: true },
    ],
    defaultModel: 'grok-4.1-fast',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.x.ai/team/default/api-keys',
    apiKeyNote: 'X Premium+ includes API access',
    pricingUrl: 'https://x.ai/api',
  },
  mistral: {
    name: 'Mistral AI',
    description: 'European, open-weight models',
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', tier: 'premium', description: 'Complex reasoning', contextWindow: 128000, inputCost: 2, outputCost: 6 },
      { id: 'magistral-medium', name: 'Magistral Medium', tier: 'balanced', description: 'Reasoning model', contextWindow: 40000, inputCost: 1, outputCost: 3 },
      { id: 'magistral-small', name: 'Magistral Small', tier: 'economy', description: 'Fast reasoning', contextWindow: 40000, inputCost: 0.5, outputCost: 1.5 },
      { id: 'codestral-latest', name: 'Codestral', tier: 'economy', description: 'Code generation', contextWindow: 256000, inputCost: 0.3, outputCost: 0.9, isCodeModel: true },
    ],
    defaultModel: 'magistral-small',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.mistral.ai/api-keys/',
    apiKeyNote: 'Free tier available',
    pricingUrl: 'https://mistral.ai/technology/#pricing',
  },
  ollama: {
    name: 'Ollama (Local)',
    description: '100% free, runs on your machine',
    baseUrl: 'http://localhost:11434/v1',
    models: [
      { id: 'llama3.3', name: 'Llama 3.3', tier: 'balanced', description: 'Latest Meta model', contextWindow: 128000, inputCost: 0, outputCost: 0 },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', tier: 'premium', description: 'Powerful (needs 48GB+ RAM)', contextWindow: 128000, inputCost: 0, outputCost: 0 },
      { id: 'deepseek-r1:14b', name: 'DeepSeek R1 14B', tier: 'balanced', description: 'Local reasoning', contextWindow: 64000, inputCost: 0, outputCost: 0 },
      { id: 'llama3.2', name: 'Llama 3.2', tier: 'economy', description: 'Good for most tasks', contextWindow: 128000, inputCost: 0, outputCost: 0 },
      { id: 'mistral', name: 'Mistral 7B', tier: 'economy', description: 'Fast, low memory', contextWindow: 32000, inputCost: 0, outputCost: 0 },
    ],
    defaultModel: 'llama3.2',
    requiresApiKey: false,
    apiKeyUrl: 'https://ollama.ai/download',
    apiKeyNote: 'No API key needed - download & run locally',
  },
  groq: {
    name: 'Groq',
    description: 'Ultra-fast inference, free tier',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', tier: 'balanced', description: 'Best quality on Groq', contextWindow: 128000, inputCost: 0.59, outputCost: 0.79 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', tier: 'economy', description: 'Fastest, free tier', contextWindow: 128000, inputCost: 0.05, outputCost: 0.08 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', tier: 'economy', description: 'Good balance', contextWindow: 32768, inputCost: 0.24, outputCost: 0.24 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', tier: 'economy', description: 'Google model, free', contextWindow: 8192, inputCost: 0.2, outputCost: 0.2 },
    ],
    defaultModel: 'llama-3.1-8b-instant',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.groq.com/keys',
    apiKeyNote: 'Generous free tier!',
    pricingUrl: 'https://groq.com/pricing/',
  },
  together: {
    name: 'Together AI',
    description: 'Many open models, good pricing',
    baseUrl: 'https://api.together.xyz/v1',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', tier: 'balanced', description: 'Best Llama model', contextWindow: 128000, inputCost: 0.88, outputCost: 0.88 },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', tier: 'balanced', description: 'Reasoning specialist', contextWindow: 64000, inputCost: 3, outputCost: 7 },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', tier: 'balanced', description: 'Powerful Chinese model', contextWindow: 128000, inputCost: 1.2, outputCost: 1.2 },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', tier: 'economy', description: 'Fast & cheap', contextWindow: 32000, inputCost: 0.2, outputCost: 0.2 },
    ],
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.3',
    requiresApiKey: true,
    apiKeyUrl: 'https://api.together.xyz/settings/api-keys',
    apiKeyNote: '$5 free credits on signup',
    pricingUrl: 'https://www.together.ai/pricing',
  },
  openrouter: {
    name: 'OpenRouter',
    description: '300+ models with one key (5.5% fee)',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      // Free tier
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', tier: 'economy', description: 'Free tier, rate limited', contextWindow: 128000, inputCost: 0, outputCost: 0 },
      // Economy
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'economy', description: 'Best value', contextWindow: 1000000, inputCost: 0.075, outputCost: 0.3, supportsVision: true },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', tier: 'economy', description: 'Cheap reasoning', contextWindow: 131000, inputCost: 0.55, outputCost: 2.19 },
      // Balanced
      { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', tier: 'balanced', description: 'Great all-rounder', contextWindow: 200000, inputCost: 3, outputCost: 15, supportsVision: true },
      { id: 'openai/gpt-5.2-instant', name: 'GPT-5.2 Instant', tier: 'balanced', description: 'Fast OpenAI', contextWindow: 128000, inputCost: 2.5, outputCost: 10, supportsVision: true },
      // Premium
      { id: 'openai/gpt-5.2-thinking', name: 'GPT-5.2 Thinking', tier: 'premium', description: 'Top reasoning', contextWindow: 400000, inputCost: 15, outputCost: 60, supportsVision: true },
      { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', tier: 'premium', description: 'Best for coding', contextWindow: 200000, inputCost: 15, outputCost: 75, supportsVision: true, isCodeModel: true },
    ],
    defaultModel: 'google/gemini-2.5-flash',
    requiresApiKey: true,
    apiKeyUrl: 'https://openrouter.ai/keys',
    apiKeyNote: 'Pay only for what you use + 5.5% fee',
    pricingUrl: 'https://openrouter.ai/models',
  },
  custom: {
    name: 'Custom Provider',
    description: 'Any OpenAI-compatible API',
    baseUrl: '',
    models: [],
    defaultModel: '',
    requiresApiKey: true,
  },
};

// =============================================================================
// STORE TYPES
// =============================================================================

/** AI provider configuration state */
export interface AiProviderConfig {
  /** Selected provider */
  provider: AiProvider;
  /** API base URL */
  baseUrl: string;
  /** Model name */
  model: string;
  /** API key (stored locally only, NEVER sent to backend) */
  apiKey: string;
  /** Whether to use client-side AI (user's key) vs server processing */
  useClientSideAi: boolean;
  /** Show API key in input */
  showApiKey: boolean;
  /** Auto mode enabled */
  autoMode: boolean;
  /** Auto mode preference */
  autoModePreference: AutoModePreference;
  /** Use OpenAI Batch API when available */
  useBatchApi: boolean;
  /** Current preset ID (if using a preset) */
  activePresetId: string | null;
}

interface AiProviderStore extends AiProviderConfig {
  /** Update a config value */
  set: <K extends keyof AiProviderConfig>(key: K, value: AiProviderConfig[K]) => void;
  /** Switch to a provider preset */
  setProvider: (provider: AiProvider) => void;
  /** Apply a preset */
  applyPreset: (presetId: string) => void;
  /** Reset to defaults */
  reset: () => void;
  /** Check if provider is configured */
  isConfigured: () => boolean;
  /** Get current preset */
  getPreset: () => ProviderPreset;
  /** Get current model info */
  getModelInfo: () => ModelOption | undefined;
  /** Get estimated cost for a request */
  getEstimatedCost: (inputTokens: number, outputTokens: number) => number;
  /** Get auto-selected model based on task */
  getAutoModel: (task: 'chat' | 'code' | 'summarize' | 'analyze') => { provider: AiProvider; model: string };
}

const defaults: AiProviderConfig = {
  provider: 'openai',
  baseUrl: PROVIDER_PRESETS.openai.baseUrl,
  model: PROVIDER_PRESETS.openai.defaultModel,
  apiKey: '',
  useClientSideAi: false,
  showApiKey: false,
  autoMode: false,
  autoModePreference: 'balanced',
  useBatchApi: false,
  activePresetId: null,
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useAiProviderStore = create<AiProviderStore>()(
  persist(
    (set, get) => ({
      ...defaults,

      set: (key, value) => set({ [key]: value, activePresetId: null }),

      setProvider: (provider) => {
        const preset = PROVIDER_PRESETS[provider];
        set({
          provider,
          baseUrl: preset.baseUrl,
          model: preset.defaultModel,
          activePresetId: null,
        });
      },

      applyPreset: (presetId) => {
        const preset = BUILT_IN_PRESETS.find(p => p.id === presetId);
        if (!preset) return;
        
        const providerPreset = PROVIDER_PRESETS[preset.provider];
        set({
          provider: preset.provider,
          baseUrl: providerPreset.baseUrl,
          model: preset.model,
          useBatchApi: preset.useBatch || false,
          activePresetId: presetId,
        });
      },

      reset: () => set(defaults),

      isConfigured: () => {
        const s = get();
        const preset = PROVIDER_PRESETS[s.provider];
        if (!preset.requiresApiKey) return true;
        return s.apiKey.length > 0;
      },

      getPreset: () => PROVIDER_PRESETS[get().provider],

      getModelInfo: () => {
        const s = get();
        const preset = PROVIDER_PRESETS[s.provider];
        return preset.models.find(m => m.id === s.model);
      },

      getEstimatedCost: (inputTokens, outputTokens) => {
        const modelInfo = get().getModelInfo();
        if (!modelInfo) return 0;
        
        const inputCost = (inputTokens / 1_000_000) * modelInfo.inputCost;
        const outputCost = (outputTokens / 1_000_000) * modelInfo.outputCost;
        let total = inputCost + outputCost;
        
        // Apply 50% batch discount if enabled and supported
        if (get().useBatchApi && modelInfo.supportsBatch) {
          total *= 0.5;
        }
        
        return total;
      },

      getAutoModel: (task) => {
        const preference = get().autoModePreference;
        
        // Auto selection logic based on task and preference
        if (task === 'code') {
          switch (preference) {
            case 'cost':
              return { provider: 'deepseek', model: 'deepseek-coder' };
            case 'quality':
              return { provider: 'anthropic', model: 'claude-opus-4.5' };
            case 'speed':
              return { provider: 'groq', model: 'llama-3.1-8b-instant' };
            default:
              return { provider: 'anthropic', model: 'claude-sonnet-4.5' };
          }
        }
        
        if (task === 'summarize' || task === 'analyze') {
          switch (preference) {
            case 'cost':
              return { provider: 'gemini', model: 'gemini-2.5-flash-lite' };
            case 'quality':
              return { provider: 'openai', model: 'gpt-5.2-thinking' };
            case 'speed':
              return { provider: 'groq', model: 'llama-3.3-70b-versatile' };
            default:
              return { provider: 'gemini', model: 'gemini-2.5-flash' };
          }
        }
        
        // Default chat
        switch (preference) {
          case 'cost':
            return { provider: 'groq', model: 'llama-3.1-8b-instant' };
          case 'quality':
            return { provider: 'openai', model: 'gpt-5.2-thinking' };
          case 'speed':
            return { provider: 'groq', model: 'llama-3.1-8b-instant' };
          default:
            return { provider: 'gemini', model: 'gemini-2.5-flash' };
        }
      },
    }),
    {
      name: 'pukaist-ai-provider',
      partialize: (state) => ({
        provider: state.provider,
        baseUrl: state.baseUrl,
        model: state.model,
        apiKey: state.apiKey,
        useClientSideAi: state.useClientSideAi,
        autoMode: state.autoMode,
        autoModePreference: state.autoModePreference,
        useBatchApi: state.useBatchApi,
        activePresetId: state.activePresetId,
      }),
    }
  )
);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Format cost for display */
export function formatCost(cost: number): string {
  if (cost === 0) return 'Free';
  if (cost < 0.001) return '<$0.001';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/** Format context window for display */
export function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}k`;
  return `${tokens}`;
}

/** Get tier color classes */
export function getTierColors(tier: ModelOption['tier']): string {
  switch (tier) {
    case 'economy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'balanced':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'premium':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
}

/** Get tier label */
export function getTierLabel(tier: ModelOption['tier']): string {
  switch (tier) {
    case 'economy':
      return '💰 Economy';
    case 'balanced':
      return '⚖️ Balanced';
    case 'premium':
      return '⭐ Premium';
  }
}
