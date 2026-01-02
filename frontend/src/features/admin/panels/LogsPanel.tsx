import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';

export function LogsPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [kind, setKind] = useState<'api' | 'worker' | 'hunyuan'>('api');
  const [content, setContent] = useState('');
  const [limit, setLimit] = useState(200);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ content: string }>(`/logs?kind=${kind}&limit=${limit}`);
      setContent(data.content || '');
    } catch (err) {
      setBanner(`Logs load failed: ${(err as Error).message}`);
    }
  }, [api, kind, limit, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!useLiveApi || !autoRefresh) return;
    const handle = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(handle);
  }, [autoRefresh, load, useLiveApi]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Logs</h3>
          <div className="flex items-center gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
            >
              <option value="api">API</option>
              <option value="worker">Worker</option>
              <option value="hunyuan">Hunyuan</option>
            </select>
            <input
              type="number"
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs w-20"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
            <label className="flex items-center gap-1 text-xs text-white/70">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-cyan-500"
              />
              Auto (5s)
            </label>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
              Refresh
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: logs disabled.</p>}
        <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-[75vh] overflow-auto bg-black/40 rounded p-4 border border-white/5">
          {content || 'No logs.'}
        </pre>
      </div>
    </div>
  );
}
