
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore, useCodexAdminStore } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { HelpText, SHARED_THEME_KEY } from '../AdminUtils';

export default function WorkflowsPanel() {
  const { api, apiStream, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();

  const [macros, setMacros] = useState<any[]>([]);
  const [argsMap, setArgsMap] = useState<Record<string, Record<string, any>>>({});
  const [lastRun, setLastRun] = useState<{ command: string; output: string; exit_code: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const envOverrides = useMemo(
    () => ({
      PUKAIST_CODEX_PROFILE: codex.codexProfile,
      PUKAIST_CODEX_MODEL: codex.codexModel,
      PUKAIST_CODEX_EXEC_FLAGS: codex.codexExecFlags,
      PUKAIST_CODEX_LOG_EVENTS: codex.codexLogEvents ? '1' : '',
      PUKAIST_CODEX_LOG_DIR: codex.codexLogDir,
    }),
    [codex]
  );

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ macros: any[] }>('/admin/codex/macros');
      setMacros(data.macros || []);
      setArgsMap((prev) => {
        const next = { ...prev };
        for (const m of data.macros || []) {
          if (!next[m.id]) {
            const fields = m.fields || [];
            const defaults: Record<string, any> = {};
            for (const f of fields) {
              if (f.default != null) defaults[f.key] = f.default;
              if (f.key === 'theme') {
                try {
                  const shared = localStorage.getItem(SHARED_THEME_KEY);
                  if (shared) defaults[f.key] = shared;
                } catch {
                  // ignore
                }
              }
            }
            next[m.id] = defaults;
          }
        }
        return next;
      });
    } catch (err) {
      setBanner(`Macros load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const runMacro = async (macro: any) => {
    if (!useLiveApi) return;
    setRunning(true);
    setLastRun({ command: macro.template || macro.id, output: '', exit_code: 0 });
    setCurrentRunId(null);
    try {
      const payload = { id: macro.id, args: argsMap[macro.id] || {}, env: envOverrides };
      const resp = await apiStream('/admin/codex/run-macro/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream body');
      const decoder = new TextDecoder();
      let buffer = '';
      let finalExit: number | null = null;
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
            const line = String(data.line);
            setLastRun((prev) =>
              prev ? { ...prev, output: (prev.output || '') + line + '\n' } : { command: macro.id, output: line + '\n', exit_code: 0 }
            );
          }
          if (ev === 'end') {
            finalExit = Number(data?.exit_code ?? 0);
            setLastRun((prev) =>
              prev ? { ...prev, exit_code: finalExit ?? 0 } : { command: macro.id, output: '', exit_code: finalExit ?? 0 }
            );
          }
          if (ev === 'error') {
            setBanner(`Macro error: ${data?.error || dataStr}`);
          }
        }
      }
      if (finalExit === 0) setBanner('Macro completed');
      else if (finalExit != null) setBanner(`Macro failed (${finalExit})`);
    } catch (err) {
      setBanner(`Macro run failed: ${(err as Error).message}`);
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
      setBanner('Cancelling macro…');
    } catch (err) {
      setBanner(`Cancel failed: ${(err as Error).message}`);
    }
  };

  const groups = useMemo(() => {
    const by: Record<string, any[]> = {};
    for (const m of macros) {
      const g = m.group || 'Other';
      by[g] = by[g] || [];
      by[g].push(m);
    }
    return by;
  }, [macros]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Workflows & Macros</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: macros disabled.</p>}
        <HelpText>
          Macros are predefined, server-allowlisted commands. They run on the API host and inherit the Codex env overrides from <span className="font-mono">Codex Exec Settings</span>.
        </HelpText>

        <div className="space-y-4">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group} className="glass p-3 space-y-2">
              <div className="text-sm font-semibold text-white">{group}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {list.map((m) => (
                  <div key={m.id} className="glass p-3 space-y-2">
                    <div className="text-sm text-white font-semibold">{m.name}</div>
                    {m.description && <div className="text-xs text-white/60">{m.description}</div>}
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {(m.fields || []).map((f: any) => (
                        <label key={f.key} className="flex flex-col gap-1">
                          <span className="text-white/60">
                            {f.label || f.key} {f.required ? '*' : ''}
                          </span>
                          <input
                            className="input"
                            type={f.type === 'number' ? 'number' : 'text'}
                            value={(argsMap[m.id] || {})[f.key] ?? ''}
                            onChange={(e) =>
                              setArgsMap((prev) => ({
                                ...prev,
                                [m.id]: { ...(prev[m.id] || {}), [f.key]: e.target.value },
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-primary btn-sm text-xs"
                        disabled={running}
                        onClick={() => void runMacro(m)}
                      >
                        Run
                      </button>
                      {running && currentRunId && (
                        <button className="btn btn-ghost btn-sm text-xs" onClick={() => void cancelRun()}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {macros.length === 0 && (
            <div className="text-xs text-white/50">No macros available.</div>
          )}
        </div>
      </div>

      {lastRun && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title text-xs">$ {lastRun.command}</h3>
            <span className={`text-xs ${lastRun.exit_code === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              exit {lastRun.exit_code}
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-64 overflow-auto bg-black/40 rounded p-3 border border-white/5">
            {lastRun.output}
          </pre>
        </div>
      )}
    </div>
  );
}
