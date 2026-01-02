import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv, Sparkline } from '../AdminUtils';

export function MetricsPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<{ ts: number; counters: Record<string, number> }[]>([]);
  const [kpis, setKpis] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const [snapRes, histRes] = await Promise.all([
        api<{ counters: Record<string, number> }>('/metrics'),
        api<{ history: { ts: number; counters: Record<string, number> }[] }>('/metrics/history?limit=120'),
      ]);
      const snap = snapRes.counters || {};
      setCounters(snap);
      setHistory(histRes.history || []);
      try {
        const k = await api<{ summary: any }>('/admin/analytics/summary');
        setKpis(k.summary || null);
      } catch {
        setKpis(null);
      }
    } catch (err) {
      setBanner(`Metrics load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15000);
    return () => clearInterval(id);
  }, [load]);

  const apiTotal = counters['api_requests_total'] || 0;
  const tasksCompleted = counters['tasks_completed'] || 0;
  const tasksFlagged = counters['tasks_flagged'] || 0;
  const tasksPerHour = kpis?.metrics?.tasks_per_hour ?? null;
  const codexSuccess = kpis?.codex?.codex_success_rate ?? null;
  const codexRuns24h = kpis?.codex?.codex_runs_24h ?? null;

  const avg = (base: string) => {
    const totalMs = counters[`${base}_total_ms`] || 0;
    const count = counters[`${base}_count`] || 0;
    if (!count) return 0;
    return totalMs / 1000 / count;
  };

  const avgApiSec = avg('api_request_duration_sec');
  const avgTaskSec = avg('task_duration_sec');

  const endpointCounts = Object.entries(counters)
    .filter(([k]) => k.startsWith('api_requests_total::'))
    .map(([k, v]) => ({ key: k.replace('api_requests_total::', ''), value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  // Simple sparkline for total API requests
  const apiSpark = history.map((h) => h.counters['api_requests_total'] || 0).reverse();
  const exportHistoryRows = history
    .slice()
    .reverse()
    .map((h) => ({
      ts: new Date(h.ts * 1000).toISOString(),
      ...(h.counters || {}),
    }));

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Metrics</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()} disabled={loading}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => exportJson('metrics_counters.json', counters)}
            >
              Export JSON
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!exportHistoryRows.length}
              onClick={() => exportCsv('metrics_history.csv', exportHistoryRows)}
            >
              Export CSV
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: metrics unavailable.</p>}

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="glass p-4">
            <div className="text-xs text-white/50">API Requests</div>
            <div className="text-2xl font-semibold text-white">{apiTotal}</div>
            <Sparkline values={apiSpark} />
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/50">Avg API Latency</div>
            <div className="text-2xl font-semibold text-white">{avgApiSec.toFixed(2)}s</div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/50">Tasks Completed</div>
            <div className="text-2xl font-semibold text-white">{tasksCompleted}</div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/50">Tasks Flagged</div>
            <div className="text-2xl font-semibold text-white">{tasksFlagged}</div>
            <div className="mt-1 text-[11px] text-white/60">
              Avg task duration: {avgTaskSec.toFixed(2)}s
            </div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/50">Tasks / Hour</div>
            <div className="text-2xl font-semibold text-white">
              {tasksPerHour != null ? tasksPerHour.toFixed(2) : '—'}
            </div>
            <div className="mt-1 text-[11px] text-white/60">last ~60m</div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/50">Codex Success (24h)</div>
            <div className="text-2xl font-semibold text-white">
              {codexSuccess != null ? `${Math.round(codexSuccess * 100)}%` : '—'}
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              {codexRuns24h != null ? `${codexRuns24h} runs` : ''}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass p-4">
            <div className="text-sm font-semibold text-white mb-2">Top Endpoints</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/60 border-b border-white/5">
                  <th className="text-left py-1">Endpoint</th>
                  <th className="text-right py-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {endpointCounts.map((e) => (
                  <tr key={e.key} className="border-b border-white/5 last:border-0">
                    <td className="py-1 text-white/80">{e.key}</td>
                    <td className="py-1 text-right text-white/80">{e.value}</td>
                  </tr>
                ))}
                {endpointCounts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-2 text-center text-white/40">
                      No endpoint metrics yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="glass p-4">
            <div className="text-sm font-semibold text-white mb-2">Raw Counters</div>
            <div className="max-h-72 overflow-auto text-[11px]">
              {Object.entries(counters)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-white/70 pr-2">{k}</span>
                    <span className="text-white/90 font-mono">{v}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
