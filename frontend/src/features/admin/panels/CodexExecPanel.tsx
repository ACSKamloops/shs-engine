
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppStore, useCodexAdminStore, CODEX_PROVIDER_PRESETS } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { HelpText, KNOWN_THEMES, SHARED_THEME_KEY } from '../AdminUtils';

export default function CodexExecPanel() {
  const { api, apiStream, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();
  
  // Local UI state
  const [running, setRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [contextFiles, setContextFiles] = useState('');
  const [theme, setTheme] = useState(KNOWN_THEMES[0]);
  
  // Theme sync
  useEffect(() => {
    try {
      const shared = localStorage.getItem(SHARED_THEME_KEY);
      if (shared) setTheme(shared);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (theme) localStorage.setItem(SHARED_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const loadHistory = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ runs: any[] }>('/admin/codex/exec/history?limit=50');
      setHistory(data.runs || []);
    } catch (err) {
      setBanner(`History load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const runCodex = async () => {
    if (!useLiveApi) return;
    if (!prompt.trim()) {
      setBanner('Prompt is required');
      return;
    }
    
    setRunning(true);
    setExitCode(null);
    setOutput('');
    setCurrentRunId(null);

    try {
      const files = contextFiles.split(',').map(s => s.trim()).filter(Boolean);
      const env = {
        PUKAIST_CODEX_PROFILE: codex.codexProfile,
        PUKAIST_CODEX_MODEL: codex.codexModel,
        PUKAIST_CODEX_EXEC_FLAGS: codex.codexExecFlags,
        PUKAIST_CODEX_LOG_EVENTS: codex.codexLogEvents ? '1' : '',
        PUKAIST_CODEX_LOG_DIR: codex.codexLogDir,
      };

      const resp = await apiStream('/admin/codex/exec/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          files,
          theme,
          env,
        }),
      });

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk) continue;
          
          let ev = 'message';
          const dataLines: string[] = [];
          for (const ln of chunk.split('\n')) {
            if (ln.startsWith('event:')) ev = ln.slice(6).trim();
            else if (ln.startsWith('data:')) dataLines.push(ln.slice(5).trim());
          }
          
          const dataStr = dataLines.join('\n');
          let data: any = dataStr;
          try {
            data = JSON.parse(dataStr);
          } catch {
            // raw
          }

          if (ev === 'start' && data?.run_id) {
            setCurrentRunId(String(data.run_id));
          }
          if (ev === 'line' && data?.line) {
            setOutput(prev => prev + String(data.line) + '\n');
          }
          if (ev === 'end') {
            setExitCode(Number(data?.exit_code ?? 0));
          }
          if (ev === 'error') {
            setBanner(`Exec error: ${data?.error || dataStr}`);
          }
        }
      }
      
      await loadHistory();
      setBanner('Execution completed');
    } catch (err) {
      setBanner(`Exec failed: ${(err as Error).message}`);
    } finally {
      setRunning(false);
      setCurrentRunId(null);
    }
  };

  const cancelRun = async () => {
    if (!useLiveApi || !currentRunId) return;
    try {
      await api('/admin/cli/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: currentRunId }),
      });
      setBanner('Cancelling run...');
    } catch (err) {
      setBanner(`Cancel failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Exec Settings</h3>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: Settings not saved.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-white/60">Profile</span>
            <select 
              className="input" 
              value={codex.codexProfile} 
              onChange={e => codex.set('codexProfile', e.target.value)}
            >
              {Object.keys(CODEX_PROVIDER_PRESETS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
              <option value="custom">custom</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-white/60">Model</span>
            <input 
              className="input" 
              value={codex.codexModel} 
              onChange={e => codex.set('codexModel', e.target.value)} 
              placeholder="gpt-4o"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-white/60">Exec Flags</span>
            <input 
              className="input font-mono" 
              value={codex.codexExecFlags} 
              onChange={e => codex.set('codexExecFlags', e.target.value)} 
              placeholder="--confirm-risky --verbose"
            />
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={codex.codexLogEvents} 
              onChange={e => codex.set('codexLogEvents', e.target.checked)} 
            />
            <span className="text-white/80">Log Events (JSONL)</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-white/60">Log Dir</span>
            <input 
              className="input" 
              value={codex.codexLogDir} 
              onChange={e => codex.set('codexLogDir', e.target.value)} 
            />
          </label>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Exec Runner</h3>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: Execution disabled.</p>}
        <HelpText>
          Directly invoke the Codex CLI on the host. This runs <span className="font-mono">codex exec</span> with the selected provider/model environment.
        </HelpText>
        
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Theme</span>
            <div className="flex gap-2">
              <select className="input flex-1" value={theme} onChange={e => setTheme(e.target.value)}>
                {KNOWN_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                <option value={theme}>{theme}</option>
              </select>
              <input 
                className="input flex-1" 
                placeholder="Custom theme" 
                value={theme}
                onChange={e => setTheme(e.target.value)}
              />
            </div>
          </label>
          
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Context Files (comma separated)</span>
            <input 
              className="input font-mono" 
              value={contextFiles} 
              onChange={e => setContextFiles(e.target.value)} 
              placeholder="frontend/src/App.tsx, backend/main.go"
            />
          </label>
          
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-white/60">Prompt</span>
            <textarea 
              className="input min-h-[100px]" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="What should I do?"
            />
          </label>
          
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-primary btn-sm text-xs" 
              disabled={running} 
              onClick={() => void runCodex()}
            >
              Execute
            </button>
            {running && currentRunId && (
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => void cancelRun()}>
                Cancel
              </button>
            )}
            <span className="text-xs text-white/40 ml-auto">
              {running ? 'Running...' : exitCode !== null ? `Exit code: ${exitCode}` : ''}
            </span>
          </div>
        </div>
        
        {output && (
          <div className="mt-4">
            <div className="text-xs text-white/50 mb-1">Output</div>
            <pre className="p-3 bg-black/40 rounded border border-white/5 text-xs text-white/80 font-mono whitespace-pre-wrap max-h-96 overflow-auto">
              {output}
            </pre>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Recent Executions</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void loadHistory()}>Refresh</button>
        </div>
        <div className="space-y-1 text-xs max-h-64 overflow-auto">
          {history.map((h, i) => (
            <div key={i} className="glass p-2 flex justify-between gap-4">
              <div className="truncate text-white/80 flex-1">{h.prompt}</div>
              <div className="text-white/50 shrink-0">
                {h.theme} · {new Date(h.ts * 1000).toLocaleString()} · exit {h.exit_code}
              </div>
            </div>
          ))}
          {history.length === 0 && <div className="text-white/40">No history available.</div>}
        </div>
      </div>
    </div>
  );
}
