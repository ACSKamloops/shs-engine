/**
 * Codex/Admin UI state.
 * Stores local preferences for running Codex CLI via the backend.
 *
 * These settings are sent as env overrides to /admin/cli/run.
 * They do not require any external API keys.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CodexProviderPreset {
  id: string;
  name: string;
  description: string;
  execFlags: string;
  modelHint?: string;
  envHint?: string;
}

export const CODEX_PROVIDER_PRESETS: CodexProviderPreset[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Runs models via Ollama on localhost.',
    execFlags: '--oss --local-provider ollama',
    modelHint: 'llama3.2',
    envHint: 'Ensure OLLAMA_BASE_URL is set if not default (http://127.0.0.1:11434/v1).',
  },
  {
    id: 'ollama_reasoning',
    name: 'Ollama – DeepSeek R1',
    description: 'Ollama local with a reasoning‑heavy model.',
    execFlags: '--oss --local-provider ollama',
    modelHint: 'deepseek-r1:14b',
    envHint: 'Requires DeepSeek R1 pulled in Ollama; uses OLLAMA_BASE_URL if overridden.',
  },
  {
    id: 'ollama_large',
    name: 'Ollama – Llama 3.3 (Large)',
    description: 'Higher‑quality local Llama; needs more RAM/VRAM.',
    execFlags: '--oss --local-provider ollama',
    modelHint: 'llama3.3',
    envHint: 'Pull llama3.3 in Ollama; uses OLLAMA_BASE_URL if overridden.',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    description: 'Uses LM Studio OpenAI-compatible server.',
    execFlags: '--oss --local-provider lmstudio',
    modelHint: 'your-lmstudio-model',
    envHint: 'Ensure LMSTUDIO_BASE_URL is set (http://127.0.0.1:1234/v1).',
  },
  {
    id: 'openai_compat',
    name: 'OpenAI-Compatible Local Server',
    description: 'vLLM / llama.cpp / TGI exposing an OpenAI-style /v1 endpoint.',
    execFlags: "--oss -c model_provider='openai'",
    modelHint: 'your-server-model',
    envHint: 'Set OPENAI_BASE_URL (or provider base URL) to your local server /v1 endpoint.',
  },
  {
    id: 'vllm_local',
    name: 'vLLM (Local OpenAI Server)',
    description: 'Use a vLLM OpenAI‑compatible server for fast local inference.',
    execFlags: "--oss -c model_provider='openai'",
    modelHint: 'your-vllm-model',
    envHint: 'Common base URL: http://127.0.0.1:8001/v1 (set OPENAI_BASE_URL).',
  },
  {
    id: 'llamacpp_local',
    name: 'llama.cpp server (Local OpenAI Server)',
    description: 'Use llama.cpp / llama-server OpenAI‑compat endpoint.',
    execFlags: "--oss -c model_provider='openai'",
    modelHint: 'your-llama.cpp-model',
    envHint: 'Common base URL: http://127.0.0.1:8080/v1 (set OPENAI_BASE_URL).',
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Manual flags and model.',
    execFlags: '',
  },
];

export interface CodexAdminState {
  codexProfile: string;
  codexModel: string;
  codexExecFlags: string;
  codexLogEvents: boolean;
  codexLogDir: string;
  codexProviderPresetId: string;

  set: <K extends keyof Omit<CodexAdminState, 'set'>>(key: K, value: CodexAdminState[K]) => void;
  reset: () => void;
}

const DEFAULTS: Omit<CodexAdminState, 'set' | 'reset'> = {
  codexProfile: 'pukaist_exec',
  // Default to a local model; adjust to whatever you have installed.
  codexModel: 'llama3.2',
  // Default to local provider. Adjust as needed.
  codexExecFlags: '--oss --local-provider ollama',
  codexLogEvents: false,
  codexLogDir: '99_Working_Files/Logs',
  codexProviderPresetId: 'ollama',
};

export const useCodexAdminStore = create<CodexAdminState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (key, value) => set({ [key]: value } as any),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: 'pukaist-codex-admin' }
  )
);
