import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore, useCodexAdminStore } from '../../../store';
import { exportJson, exportCsv } from '../AdminUtils';

export function CliConsolePanel() {
  const {  apiStream, useLiveApi, api } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ command: string; output: string; exit_code: number }[]>([]);
  const [current, setCurrent] = useState<{ command: string; output: string; exit_code: number } | null>(null);
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

  const run = async () => {
    if (!command.trim()) return;
    if (!useLiveApi) {
      setHistory((h) => [{ command, output: 'Demo mode: CLI disabled.', exit_code: 0 }, ...h]);
      return;
    }
    setRunning(true);
    setCurrent({ command, output: '', exit_code: 0 });
    setCurrentRunId(null);
    try {
      const resp = await apiStream('/admin/cli/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, env: envOverrides }),
      });
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream body');
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
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
            accumulated += line + '\n';
            setCurrent((prev) =>
              prev ? { ...prev, output: (prev.output || '') + line + '\n' } : { command, output: line + '\n', exit_code: 0 }
            );
          }
          if (ev === 'end') {
            finalExit = Number(data?.exit_code ?? 0);
            setCurrent((prev) =>
              prev ? { ...prev, exit_code: finalExit ?? 0 } : { command, output: accumulated, exit_code: finalExit ?? 0 }
            );
          }
          if (ev === 'error') {
            setBanner(`CLI error: ${data?.error || dataStr}`);
          }
        }
      }
      if (finalExit == null) finalExit = 0;
      setHistory((h) => [{ command, output: accumulated, exit_code: finalExit! }, ...h].slice(0, 20));
      setCommand('');
      if (finalExit === 0) setBanner('CLI command completed');
      else setBanner(`CLI command failed (${finalExit})`);
    } catch (err) {
      setBanner(`CLI run failed: ${(err as Error).message}`);
    } finally {
      setRunning(false);
      setCurrent(null);
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
      setBanner('Cancelling run…');
    } catch (err) {
      setBanner(`Cancel failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Safe CLI Runner</h3>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!history.length}
              onClick={() => exportCsv('cli_history.csv', history)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!history.length}
              onClick={() => exportJson('cli_history.json', history)}
            >
              Export JSON
            </button>
          </div>
        </div>
        <p className="text-xs text-white/50 mb-2">
          Commands are allowlisted server-side. Codex env overrides come from the Exec Settings tab.
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="python3 99_Working_Files/refinement_workflow.py manager-approve --theme ..."
          />
          <button className="btn btn-primary btn-sm" disabled={running} onClick={() => void run()}>
            Run
          </button>
          {running && currentRunId && (
            <button className="btn btn-ghost btn-sm" onClick={() => void cancelRun()}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {current && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title text-xs">$ {current.command}</h3>
            <span className="text-xs text-white/60">running…</span>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-64 overflow-auto bg-black/40 rounded p-3 border border-white/5">
            {current.output}
          </pre>
        </div>
      )}

      {history.map((h, i) => (
        <div key={i} className="panel">
          <div className="panel-header">
            <h3 className="panel-title text-xs">$ {h.command}</h3>
            <span className={`text-xs ${h.exit_code === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              exit {h.exit_code}
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-64 overflow-auto bg-black/40 rounded p-3 border border-white/5">
            {h.output}
          </pre>
        </div>
      ))}
    </div>
  );
}
