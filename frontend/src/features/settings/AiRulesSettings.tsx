/**
 * AI Rules Settings Panel
 * Configure custom AI rules/instructions like Cursor's "Rules for AI"
 */
import { useState } from 'react';
import { useAiRulesStore, RULE_TEMPLATES, type AiRule } from '../../store/useAiRulesStore';

export function AiRulesSettings() {
  const store = useAiRulesStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', content: '', scope: 'global' as AiRule['scope'] });

  const handleAddRule = () => {
    if (newRule.name.trim() && newRule.content.trim()) {
      store.addRule({ ...newRule, enabled: true });
      setNewRule({ name: '', content: '', scope: 'global' });
      setShowAddForm(false);
    }
  };

  const handleAddTemplate = (template: typeof RULE_TEMPLATES[0]) => {
    store.addRule({ ...template, enabled: true });
  };

  const scopeColors: Record<AiRule['scope'], string> = {
    global: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    coding: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    analysis: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    summarization: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          AI Rules
        </h3>
        <span className="text-[10px] text-white/40">{store.rules.length} rules</span>
      </div>

      {/* Global System Prompt */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-medium text-white/60">Global System Prompt</span>
          <textarea
            value={store.globalSystemPrompt}
            onChange={(e) => store.setGlobalPrompt(e.target.value)}
            placeholder="Custom instructions prepended to all AI requests..."
            rows={3}
            className="mt-1 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
          />
        </label>
      </div>

      {/* Active Rules */}
      <div className="space-y-2">
        <p className="text-xs text-white/50">Active Rules</p>
        {store.rules.length === 0 ? (
          <p className="text-xs text-white/30 py-4 text-center bg-white/3 rounded-lg">
            No custom rules. Add from templates or create your own.
          </p>
        ) : (
          <div className="space-y-2">
            {store.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-lg border transition-all ${
                  rule.enabled
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/2 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => store.toggleRule(rule.id)}
                        className={`relative w-8 h-4 rounded-full transition-all ${
                          rule.enabled ? 'bg-indigo-500' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-4' : ''
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium text-white/90">{rule.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${scopeColors[rule.scope]}`}>
                        {rule.scope}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/50 line-clamp-2">{rule.content}</p>
                  </div>
                  <button
                    onClick={() => store.deleteRule(rule.id)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1"
                    title="Delete rule"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Rule Form */}
      {showAddForm ? (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 animate-fade-in">
          <input
            type="text"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="Rule name..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500"
          />
          <textarea
            value={newRule.content}
            onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
            placeholder="Rule instructions..."
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none outline-none focus:border-indigo-500"
          />
          <div className="flex items-center gap-2">
            <select
              value={newRule.scope}
              onChange={(e) => setNewRule({ ...newRule, scope: e.target.value as AiRule['scope'] })}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none"
            >
              <option value="global">Global</option>
              <option value="coding">Coding</option>
              <option value="analysis">Analysis</option>
              <option value="summarization">Summarization</option>
            </select>
            <div className="flex-1" />
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              className="px-3 py-1.5 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-400"
            >
              Add Rule
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 text-xs text-white/60 border border-dashed border-white/10 rounded-lg hover:border-white/20 hover:text-white/80 transition-all flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Rule
        </button>
      )}

      {/* Rule Templates */}
      <div className="space-y-2">
        <p className="text-xs text-white/50">Quick Add from Templates</p>
        <div className="flex flex-wrap gap-1.5">
          {RULE_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => handleAddTemplate(template)}
              className="px-2.5 py-1 text-[11px] bg-white/5 text-white/60 rounded-lg border border-white/10 hover:bg-white/10 hover:text-white/80 transition-all"
              title={template.content}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(store.globalSystemPrompt || store.rules.some((r) => r.enabled)) && (
        <details className="text-xs">
          <summary className="text-white/40 cursor-pointer hover:text-white/60">
            Preview combined prompt
          </summary>
          <pre className="mt-2 p-3 bg-black/30 rounded-lg text-white/60 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
            {store.getEnabledRulesPrompt() || 'No rules enabled'}
          </pre>
        </details>
      )}
    </div>
  );
}
