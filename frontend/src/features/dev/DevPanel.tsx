/**
 * Developer Panel Component
 * API configuration, LLM scratchpad, and dev tools
 */
import type React from 'react';
import { useAppStore, useDocsStore } from '../../store';
import { useApi } from '../../hooks';
import { callOpenAIChat, DEFAULT_OPENAI_MODEL } from '../../sampleData';

export const DevPanel: React.FC = () => {
  const apiBase = useAppStore((s) => s.apiBase);
  const setApiBase = useAppStore((s) => s.setApiBase);
  const apiKey = useAppStore((s) => s.apiKey);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const useLiveApi = useAppStore((s) => s.useLiveApi);
  const setUseLiveApi = useAppStore((s) => s.setUseLiveApi);
  const showDevPanel = useAppStore((s) => s.showDevPanel);
  const setShowDevPanel = useAppStore((s) => s.setShowDevPanel);
  const setBanner = useAppStore((s) => s.setBanner);
  
  // LLM state
  const llmPrompt = useAppStore((s) => s.llmPrompt);
  const setLlmPrompt = useAppStore((s) => s.setLlmPrompt);
  const llmOutput = useAppStore((s) => s.llmOutput);
  const setLlmOutput = useAppStore((s) => s.setLlmOutput);
  const llmError = useAppStore((s) => s.llmError);
  const setLlmError = useAppStore((s) => s.setLlmError);
  const llmLoading = useAppStore((s) => s.llmLoading);
  const setLlmLoading = useAppStore((s) => s.setLlmLoading);
  const setCopyNotice = useAppStore((s) => s.setCopyNotice);

  // Docs stats
  const docs = useDocsStore((s) => s.docs);
  const selectedId = useDocsStore((s) => s.selectedId);
  const artifactCache = useDocsStore((s) => s.artifactCache);

  const { loadDocs } = useApi();

  if (!showDevPanel) return null;

  const handleRunLlm = async () => {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    const apiKeyEnv = env?.VITE_OPENAI_API_KEY;
    const baseUrl = env?.VITE_OPENAI_BASE;

    if (!apiKeyEnv) {
      setLlmError('Set VITE_OPENAI_API_KEY to enable.');
      return;
    }

    setLlmError(null);
    setLlmLoading(true);
    try {
      const resp = await callOpenAIChat({
        apiKey: apiKeyEnv,
        prompt: llmPrompt || 'Summarize the mission frame in 2 bullets.',
        model: DEFAULT_OPENAI_MODEL,
        baseUrl: baseUrl || 'https://api.openai.com/v1',
      });
      setLlmOutput(resp);
    } catch (err) {
      setLlmError((err as Error).message);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleCopy = async (label: string, text?: string) => {
    if (!text) {
      setBanner(`Nothing to copy for ${label}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(`Copied ${label}`);
    } catch (err) {
      setBanner(`Copy failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 glass rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl max-w-md backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Dev / Settings</h3>
        <button
          onClick={() => setShowDevPanel(false)}
          className="text-xs px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>

      {/* API Config */}
      <div className="grid gap-3 md:grid-cols-2 text-xs mb-4">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400">API base</span>
          <input
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400">API key (X-API-Key)</span>
          <input
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2 text-[11px] mb-4">
        <label className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded">
          <input
            type="checkbox"
            checked={useLiveApi}
            onChange={(e) => setUseLiveApi(e.target.checked)}
          />
          <span className="text-slate-200">Use live API</span>
        </label>
      </div>

      {/* Stats */}
      <div className="space-y-1 text-xs text-white/70 mb-4 p-2 rounded bg-black/30 border border-white/10">
        <p>Docs loaded: {docs.length}</p>
        <p>Selected: {selectedId ?? 'none'}</p>
        <p>Cached artifacts: {Object.keys(artifactCache).length}</p>
        <button
          onClick={() => void loadDocs()}
          className="w-full mt-2 py-1.5 px-3 rounded bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/40"
        >
          Reload Docs
        </button>
      </div>

      {/* LLM Scratchpad */}
      <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <p className="uppercase tracking-widest text-[10px] text-slate-400">LLM scratchpad (OpenAI)</p>
          <span className="pill bg-white/10 text-[11px]">Model {DEFAULT_OPENAI_MODEL}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Uses VITE_OPENAI_API_KEY (and optional VITE_OPENAI_BASE) if set.
        </p>
        <textarea
          className="w-full rounded border border-white/10 bg-slate-900/50 p-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          rows={3}
          value={llmPrompt}
          onChange={(e) => setLlmPrompt(e.target.value)}
          placeholder="Ask GPT to summarize, extract tasks, or rephrase instructions..."
        />
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-3 py-1 rounded bg-cyan-400 text-slate-900 font-semibold disabled:opacity-50"
            disabled={llmLoading}
            onClick={() => void handleRunLlm()}
          >
            {llmLoading ? 'Running...' : `Run ${DEFAULT_OPENAI_MODEL}`}
          </button>
          {llmError && <span className="text-amber-200 text-[11px]">{llmError}</span>}
          {llmOutput && (
            <button
              className="text-[11px] px-2 py-[2px] rounded bg-white/10 text-white hover:bg-white/20"
              onClick={() => void handleCopy('LLM output', llmOutput)}
            >
              Copy output
            </button>
          )}
        </div>
        {llmOutput && (
          <div className="rounded border border-white/10 bg-slate-900/70 p-2 text-[11px] text-slate-100 whitespace-pre-wrap max-h-32 overflow-auto">
            {llmOutput}
          </div>
        )}
      </div>
    </div>
  );
};
