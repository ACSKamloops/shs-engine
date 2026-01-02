/**
 * Multi-Model Comparison Panel
 * Send prompts to multiple models and compare responses side-by-side
 */
import { useState } from 'react';
import { useMultiModelStore, type ComparisonModel } from '../../store/useMultiModelStore';
import { useAiProviderStore, PROVIDER_PRESETS, type AiProvider } from '../../store/useAiProviderStore';
import { callOpenAIChat } from '../../utils/openai';

export function MultiModelComparison() {
  const store = useMultiModelStore();
  const providerStore = useAiProviderStore();
  const [prompt, setPrompt] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [newModel, setNewModel] = useState<Omit<ComparisonModel, 'id'>>({
    provider: 'openai',
    model: 'gpt-5.2-instant',
    label: 'GPT-5.2',
  });

  const runComparison = async () => {
    if (!prompt.trim() || store.models.length === 0) return;

    store.startComparison(prompt);

    // Run all model calls in parallel
    await Promise.all(
      store.models.map(async (model) => {
        const startTime = Date.now();
        const preset = PROVIDER_PRESETS[model.provider];
        
        try {
          const response = await callOpenAIChat({
            apiKey: providerStore.apiKey || 'demo',
            baseUrl: preset.baseUrl,
            model: model.model,
            prompt: prompt,
          });
          
          store.updateResult(model.id, {
            response,
            loading: false,
            latencyMs: Date.now() - startTime,
          });
        } catch (err) {
          store.updateResult(model.id, {
            error: err instanceof Error ? err.message : 'Request failed',
            loading: false,
            latencyMs: Date.now() - startTime,
          });
        }
      })
    );

    store.saveToHistory();
  };

  const handleAddModel = () => {
    store.addModel(newModel);
    setShowModelPicker(false);
    setNewModel({ provider: 'openai', model: 'gpt-5.2-instant', label: 'GPT-5.2' });
  };

  // Get models for selected provider
  const providerModels = PROVIDER_PRESETS[newModel.provider]?.models || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Multi-Model Compare
        </h3>
        <button
          onClick={() => store.setComparisonEnabled(!store.comparisonEnabled)}
          className={`relative w-10 h-5 rounded-full transition-all ${
            store.comparisonEnabled ? 'bg-indigo-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              store.comparisonEnabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {store.comparisonEnabled && (
        <div className="space-y-4 animate-fade-in">
          {/* Selected Models */}
          <div className="space-y-2">
            <p className="text-xs text-white/50">Models to Compare ({store.models.length})</p>
            <div className="flex flex-wrap gap-2">
              {store.models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="text-xs font-medium text-white/80">{model.label}</span>
                  <span className="text-[10px] text-white/40">{model.provider}</span>
                  <button
                    onClick={() => store.removeModel(model.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowModelPicker(true)}
                className="px-3 py-1.5 text-xs text-white/40 rounded-lg border border-dashed border-white/10 hover:border-white/20 hover:text-white/60 transition-all"
              >
                + Add Model
              </button>
            </div>
          </div>

          {/* Add Model Picker */}
          {showModelPicker && (
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-3 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newModel.provider}
                  onChange={(e) => {
                    const provider = e.target.value as AiProvider;
                    const preset = PROVIDER_PRESETS[provider];
                    setNewModel({
                      provider,
                      model: preset.defaultModel,
                      label: preset.models[0]?.name || provider,
                    });
                  }}
                  className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white outline-none"
                >
                  {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
                <select
                  value={newModel.model}
                  onChange={(e) => {
                    const model = providerModels.find((m) => m.id === e.target.value);
                    setNewModel({
                      ...newModel,
                      model: e.target.value,
                      label: model?.name || e.target.value,
                    });
                  }}
                  className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white outline-none"
                >
                  {providerModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowModelPicker(false)}
                    className="flex-1 px-2 py-1.5 text-[10px] text-white/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddModel}
                    className="flex-1 px-2 py-1.5 text-[10px] bg-indigo-500 text-white rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to compare responses..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none outline-none focus:border-indigo-500"
            />
            <button
              onClick={runComparison}
              disabled={!prompt.trim() || store.models.length < 2 || store.currentSession?.results.some((r) => r.loading)}
              className="w-full py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              {store.currentSession?.results.some((r) => r.loading) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Comparing...
                </span>
              ) : (
                `Compare ${store.models.length} Models`
              )}
            </button>
          </div>

          {/* Results */}
          {store.currentSession && (
            <div className="space-y-3">
              <p className="text-xs text-white/50">Comparison Results</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {store.currentSession.results.map((result) => {
                  const model = store.models.find((m) => m.id === result.modelId);
                  return (
                    <div
                      key={result.modelId}
                      className="p-3 bg-white/3 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white/80">{model?.label || 'Unknown'}</span>
                        {!result.loading && (
                          <span className="text-[10px] text-white/40">
                            {result.latencyMs}ms
                          </span>
                        )}
                      </div>
                      {result.loading ? (
                        <div className="flex items-center gap-2 py-4">
                          <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-xs text-white/40">Loading...</span>
                        </div>
                      ) : result.error ? (
                        <p className="text-xs text-red-400">{result.error}</p>
                      ) : (
                        <p className="text-xs text-white/70 max-h-32 overflow-y-auto leading-relaxed">
                          {result.response}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History */}
          {store.history.length > 0 && (
            <details className="text-xs">
              <summary className="text-white/40 cursor-pointer hover:text-white/60">
                Past comparisons ({store.history.length})
              </summary>
              <div className="mt-2 space-y-2">
                {store.history.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-2 bg-white/3 rounded-lg border border-white/5">
                    <p className="text-white/60 truncate">{session.prompt}</p>
                    <p className="text-white/30 text-[10px]">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {!store.comparisonEnabled && (
        <p className="text-xs text-white/40 py-4 text-center">
          Enable to send prompts to multiple models and compare responses side-by-side
        </p>
      )}
    </div>
  );
}
