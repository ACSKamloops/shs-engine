/**
 * AI Provider Settings panel.
 * Configure which AI provider to use for client-side processing.
 * 
 * SECURITY: API keys are stored in localStorage only and NEVER sent to the backend.
 * 
 * Features:
 * - Preset quick-select buttons
 * - Auto mode with preference selector
 * - Model selection with cost/context info
 * - Batch API toggle for 50% savings
 * - Test connection button
 */
import { useState } from 'react';
import { 
  useAiProviderStore, 
  PROVIDER_PRESETS, 
  BUILT_IN_PRESETS,
  type AiProvider,
  type AutoModePreference,
  formatCost,
  formatContextWindow,
  getTierColors,
  getTierLabel,
} from '../../store/useAiProviderStore';
import { callOpenAIChat } from '../../utils/openai';

export function AiProviderSettings() {
  const store = useAiProviderStore();
  const preset = store.getPreset();
  const modelInfo = store.getModelInfo();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleProviderChange = (provider: AiProvider) => {
    store.setProvider(provider);
    setTestResult(null);
    setTestError(null);
  };

  const testConnection = async () => {
    if (!store.apiKey && preset.requiresApiKey) {
      setTestResult('error');
      setTestError('API key required');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      await callOpenAIChat({
        apiKey: store.apiKey || 'ollama',
        baseUrl: store.baseUrl,
        model: store.model,
        prompt: 'Say "Connection successful" in exactly 2 words.',
      });
      setTestResult('success');
    } catch (err) {
      setTestResult('error');
      setTestError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  // Estimated cost for a typical request (1000 input, 500 output tokens)
  const estimatedCost = store.getEstimatedCost(1000, 500);

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        🔑 AI Provider
      </h3>

      {/* Security Notice */}
      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-emerald-400">🔒</span>
          <p className="text-xs text-emerald-300">
            Your API key is stored locally in your browser and <strong>never sent to our servers</strong>.
            It's used for direct communication with your chosen AI provider.
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-400">Quick Presets</span>
        <div className="grid grid-cols-2 gap-2">
          {BUILT_IN_PRESETS.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => store.applyPreset(p.id)}
              className={`text-left p-2 rounded-lg border transition-all ${
                store.activePresetId === p.id
                  ? 'bg-cyan-600/30 border-cyan-500 text-white'
                  : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{p.emoji}</span>
                <span className="text-xs font-medium truncate">{p.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Mode Toggle */}
      <div className="bg-black/20 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🤖</span>
            <span className="text-sm font-medium text-white">Auto Mode</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={store.autoMode}
            onClick={() => store.set('autoMode', !store.autoMode)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              store.autoMode ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                store.autoMode ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        
        {store.autoMode && (
          <div className="flex gap-1">
            {(['cost', 'speed', 'balanced', 'quality'] as AutoModePreference[]).map((pref) => (
              <button
                key={pref}
                onClick={() => store.set('autoModePreference', pref)}
                className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                  store.autoModePreference === pref
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {pref === 'cost' && '💰'}
                {pref === 'speed' && '⚡'}
                {pref === 'balanced' && '⚖️'}
                {pref === 'quality' && '⭐'}
                <span className="ml-1 capitalize">{pref}</span>
              </button>
            ))}
          </div>
        )}
        
        {store.autoMode && (
          <p className="text-xs text-slate-400">
            Auto-selects the best model based on your preference and task type.
          </p>
        )}
      </div>

      {/* Provider Selection */}
      {!store.autoMode && (
        <div className="bg-black/20 rounded-lg p-3 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-white mb-1 block">Provider</span>
            <select
              value={store.provider}
              onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
            >
              {Object.entries(PROVIDER_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.name} — {p.description}
                </option>
              ))}
            </select>
          </label>

          {/* Provider info */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {preset.apiKeyNote && (
              <span className="text-amber-400">💡 {preset.apiKeyNote}</span>
            )}
            {preset.pricingUrl && (
              <a
                href={preset.pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                View pricing →
              </a>
            )}
          </div>

          {/* API Key */}
          {preset.requiresApiKey && (
            <label className="block">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">API Key</span>
                {preset.apiKeyUrl && (
                  <a
                    href={preset.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    🔗 Get API key
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={store.showApiKey ? 'text' : 'password'}
                  value={store.apiKey}
                  onChange={(e) => store.set('apiKey', e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full px-3 py-2 pr-10 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => store.set('showApiKey', !store.showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {store.showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </label>
          )}

          {/* Model Selection with Info */}
          <label className="block">
            <span className="text-sm font-medium text-white mb-1 block">Model</span>
            {preset.models.length > 0 ? (
              <select
                value={store.model}
                onChange={(e) => store.set('model', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
              >
                <optgroup label="💰 Economy (Cheapest)">
                  {preset.models.filter(m => m.tier === 'economy').map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} — {model.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚖️ Balanced (Recommended)">
                  {preset.models.filter(m => m.tier === 'balanced').map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} — {model.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⭐ Premium (Best Quality)">
                  {preset.models.filter(m => m.tier === 'premium').map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} — {model.description}
                    </option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <input
                type="text"
                value={store.model}
                onChange={(e) => store.set('model', e.target.value)}
                placeholder="Enter model name..."
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400"
              />
            )}
          </label>

          {/* Model Info Card */}
          {modelInfo && (
            <div className="bg-slate-800/50 rounded-lg p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getTierColors(modelInfo.tier)}`}>
                    {getTierLabel(modelInfo.tier)}
                  </span>
                  <span className="text-xs text-slate-400">{modelInfo.description}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Context Window */}
                <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  📏 {formatContextWindow(modelInfo.contextWindow)} tokens
                </span>
                
                {/* Cost */}
                <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  💵 ~{formatCost(estimatedCost)}/req
                </span>
                
                {/* Features */}
                {modelInfo.supportsVision && (
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">👁️ Vision</span>
                )}
                {modelInfo.supportsBatch && (
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">📦 Batch</span>
                )}
                {modelInfo.isCodeModel && (
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">💻 Code</span>
                )}
              </div>
            </div>
          )}

          {/* Batch API Toggle */}
          {modelInfo?.supportsBatch && (
            <div className="flex items-center justify-between py-2 px-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div>
                <span className="text-sm font-medium text-amber-300">📦 Use Batch API</span>
                <p className="text-xs text-amber-400/70">50% cheaper, completes within 24h</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={store.useBatchApi}
                onClick={() => store.set('useBatchApi', !store.useBatchApi)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  store.useBatchApi ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    store.useBatchApi ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          )}

          {/* Base URL (advanced) */}
          <details className="text-sm">
            <summary className="text-slate-400 cursor-pointer hover:text-white">
              Advanced: Custom Base URL
            </summary>
            <input
              type="text"
              value={store.baseUrl}
              onChange={(e) => store.set('baseUrl', e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full mt-2 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400 text-xs"
            />
          </details>
        </div>
      )}

      {/* Test Connection */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={testConnection}
          disabled={testing}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            testing
              ? 'bg-slate-600 text-slate-400 cursor-wait'
              : 'bg-cyan-600 text-white hover:bg-cyan-500'
          }`}
        >
          {testing ? '⏳ Testing...' : '🔌 Test Connection'}
        </button>
        {testResult === 'success' && (
          <span className="text-emerald-400 text-sm">✓ Connected!</span>
        )}
        {testResult === 'error' && (
          <span className="text-red-400 text-sm" title={testError || undefined}>
            ✗ Failed
          </span>
        )}
      </div>

      {testError && (
        <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
          {testError}
        </p>
      )}

      {/* Use Client-Side AI Toggle */}
      <label className="flex items-center justify-between py-2 border-t border-white/10">
        <div>
          <span className="text-sm font-medium text-white">Use your API key</span>
          <p className="text-xs text-slate-400">
            Enable to use your own API key for AI features
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={store.useClientSideAi}
          onClick={() => store.set('useClientSideAi', !store.useClientSideAi)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            store.useClientSideAi ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              store.useClientSideAi ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </label>

      {/* Status indicator */}
      <div className="text-center py-2 rounded-lg bg-black/20">
        {store.useClientSideAi ? (
          store.isConfigured() ? (
            <span className="text-emerald-400 text-sm">
              ✓ Using {preset.name} with your API key
              {store.useBatchApi && modelInfo?.supportsBatch && ' (Batch: 50% off)'}
            </span>
          ) : (
            <span className="text-amber-400 text-sm">
              ⚠️ Enter API key to enable AI features
            </span>
          )
        ) : (
          <span className="text-slate-400 text-sm">
            Using server-side processing
          </span>
        )}
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() => store.reset()}
        className="w-full py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
