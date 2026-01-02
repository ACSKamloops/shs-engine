
import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { exportCsv, exportJson, HelpText, SHARED_THEME_KEY, Sparkline } from '../AdminUtils';

export type QueueSummary = {
  theme: string;
  total: number;
  counts: Record<string, number>;
};

export type CodexQueueTask = {
  TaskID: string;
  Theme: string;
  Status: string;
  Reason?: string;
  [key: string]: any;
};

export default function CodexQueuesPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [tasks, setTasks] = useState<CodexQueueTask[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CodexQueueTask | null>(null);
  const [queueHistory, setQueueHistory] = useState<
    { ts: number; theme: string; total: number; counts: Record<string, number> }[]
  >([]);

  useEffect(() => {
    try {
      const shared = localStorage.getItem(SHARED_THEME_KEY);
      if (shared) setSelectedTheme(shared);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedTheme) localStorage.setItem(SHARED_THEME_KEY, selectedTheme);
    } catch {
      // ignore
    }
  }, [selectedTheme]);

  const refreshQueues = async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const data = await api<{ queues: QueueSummary[] }>('/admin/codex/queues');
      setQueues(data.queues || []);
      if (!selectedTheme && data.queues?.length) {
        setSelectedTheme(data.queues[0].theme);
      }
      try {
        const histKey = 'pukaist-queue-history';
        const prev = JSON.parse(localStorage.getItem(histKey) || '[]') as any[];
        const ts = Date.now();
        const next = [
          ...data.queues.map((q) => ({ ts, theme: q.theme, total: q.total, counts: q.counts || {} })),
          ...prev,
        ].slice(0, 500);
        localStorage.setItem(histKey, JSON.stringify(next));
        setQueueHistory(next);
      } catch {
        // ignore
      }
    } catch (err) {
      setBanner(`Queue load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async (theme: string) => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const data = await api<{ tasks: CodexQueueTask[] }>(
        `/admin/codex/queue/${encodeURIComponent(theme)}?${params.toString()}`
      );
      setTasks(data.tasks || []);
    } catch (err) {
      setBanner(`Task load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshQueues();
  }, []);

  useEffect(() => {
    try {
      const histKey = 'pukaist-queue-history';
      const prev = JSON.parse(localStorage.getItem(histKey) || '[]');
      if (Array.isArray(prev)) setQueueHistory(prev);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!selectedTheme) return;
    setSelectedTask(null);
    try {
      const key = `pukaist-queue-filters-${selectedTheme}`;
      const saved = JSON.parse(localStorage.getItem(key) || '{}') as {
        statusFilter?: string;
        search?: string;
      };
      if (typeof saved.statusFilter === 'string') setStatusFilter(saved.statusFilter);
      if (typeof saved.search === 'string') setSearch(saved.search);
    } catch {
      // ignore
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (!selectedTheme) return;
    const key = `pukaist-queue-filters-${selectedTheme}`;
    try {
      localStorage.setItem(key, JSON.stringify({ statusFilter, search }));
    } catch {
      // ignore
    }
  }, [selectedTheme, statusFilter, search]);

  useEffect(() => {
    if (selectedTheme) void refreshTasks(selectedTheme);
  }, [selectedTheme, statusFilter, search]);

  const columns = tasks[0] ? Object.keys(tasks[0]).slice(0, 8) : [];
  const statusOrder = ['Pending', 'InProgress', 'ManagerReview', 'Complete', 'Flagged', 'Superseded'];
  const statusColor = (s: string) => {
    switch (s) {
      case 'Pending':
        return 'bg-slate-500/80';
      case 'InProgress':
        return 'bg-amber-400/80';
      case 'ManagerReview':
        return 'bg-purple-400/80';
      case 'Complete':
        return 'bg-emerald-400/80';
      case 'Flagged':
        return 'bg-red-400/80';
      default:
        return 'bg-white/20';
    }
  };

  const historyByTheme = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const h of queueHistory) {
      if (!h?.theme) continue;
      map[h.theme] = map[h.theme] || [];
      map[h.theme].push(h.total || 0);
    }
    for (const k of Object.keys(map)) {
      map[k] = map[k].slice(0, 20).reverse();
    }
    return map;
  }, [queueHistory]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Thematic Queues</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void refreshQueues()}>
            Refresh
          </button>
        </div>

        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: queues unavailable.</p>}
        <HelpText>
          These queues are TSV-based “worklists” for Codex refinement (separate from the Engine Tasks queue). Create a new shard in <span className="font-mono">Codex Exec → Add Theme</span>.
        </HelpText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {queues.map((q) => (
            <button
              key={q.theme}
              className={`glass glass-hover p-3 text-left ${
                selectedTheme === q.theme ? 'border-cyan-400/40' : ''
              }`}
              onClick={() => setSelectedTheme(q.theme)}
            >
              <div className="text-sm font-semibold text-white">{q.theme}</div>
              <div className="text-xs text-white/50">{q.total} tasks</div>
              <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-white/60">
                {Object.entries(q.counts).map(([k, v]) => (
                  <span key={k} className="px-1.5 py-0.5 rounded bg-white/5">
                    {k}:{v}
                  </span>
                ))}
              </div>
              <div className="mt-2 h-2 w-full bg-white/5 rounded overflow-hidden flex">
                {statusOrder.map((s) => {
                  const v = (q.counts as any)?.[s] || 0;
                  if (!v) return null;
                  const pct = q.total ? (v / q.total) * 100 : 0;
                  return (
                    <div
                      key={s}
                      className={statusColor(s)}
                      style={{ width: `${pct}%` }}
                      title={`${s}: ${v}`}
                    />
                  );
                })}
              </div>
              <Sparkline values={historyByTheme[q.theme] || []} />
            </button>
          ))}
          {queues.length === 0 && (
            <div className="text-xs text-white/50">
              No queue shards found in <span className="font-mono">99_Working_Files/Queues/</span> yet. Use <span className="font-mono">Codex Exec → Add Theme</span> to create one.
            </div>
          )}
        </div>
      </div>

      {selectedTheme && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Queue: {selectedTheme}</h3>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">InProgress</option>
                <option value="ManagerReview">ManagerReview</option>
                <option value="Complete">Complete</option>
                <option value="Flagged">Flagged</option>
              </select>
              <input
                className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
              />
              <button
                className="btn btn-ghost btn-sm text-xs"
                onClick={() => selectedTheme && void refreshTasks(selectedTheme)}
              >
                Apply
              </button>
              <button
                className="btn btn-ghost btn-sm text-xs"
                disabled={!tasks.length}
                onClick={() => exportCsv(`queue_${selectedTheme}.csv`, tasks)}
              >
                Export CSV
              </button>
              <button
                className="btn btn-ghost btn-sm text-xs"
                disabled={!tasks.length}
                onClick={() => exportJson(`queue_${selectedTheme}.json`, tasks)}
              >
                Export JSON
              </button>
            </div>
          </div>

          <HelpText>
            Tip: click any row to open details and copy ready-to-run commands (approve/reject/flag). Status filters only affect this view.
          </HelpText>

          <div className="flex flex-wrap gap-1 mb-3">
            {statusOrder.map((s) => (
              <button
                key={s}
                className={`px-2 py-1 rounded text-[11px] border border-white/10 ${
                  statusFilter === s ? `${statusColor(s)} text-white` : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              >
                {s}
              </button>
            ))}
            {statusFilter && (
              <button
                className="px-2 py-1 rounded text-[11px] bg-white/5 text-white/60 hover:bg-white/10"
                onClick={() => setStatusFilter('')}
              >
                Clear
              </button>
            )}
          </div>

          {loading && <p className="text-xs text-white/40">Loading…</p>}

          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/60 border-b border-white/5">
                  {columns.map((c) => (
                    <th key={c} className="text-left py-2 pr-3 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedTask(t)}
                  >
                    {columns.map((c) => (
                      <td key={c} className="py-2 pr-3 text-white/80 align-top">
                        {t[c]}
                      </td>
                    ))}
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="py-4 text-center text-white/40">
                      No tasks match filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div
            className="absolute right-0 top-0 h-full w-full md:w-[420px] glass p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Task Detail</h4>
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => setSelectedTask(null)}>
                Close
              </button>
            </div>
            <div className="space-y-1 text-xs">
              {Object.entries(selectedTask).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-1 border-b border-white/5 last:border-0">
                  <span className="text-white/60">{k}</span>
                  <span className="text-white/90 break-all text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-[11px] text-white/50">Quick copy commands</div>
              {(() => {
                const id = (selectedTask as any).TaskID || (selectedTask as any).task_id || '';
                const th = (selectedTask as any).Theme || selectedTheme || '';
                const cmds = [
                  id && `python3 99_Working_Files/refinement_workflow.py flag-task --id ${id} --theme ${th} --reason "Irrelevant"`,
                  id && `python3 99_Working_Files/refinement_workflow.py manager-approve --ids ${id} --theme ${th}`,
                  id && `python3 99_Working_Files/refinement_workflow.py manager-reject --ids ${id} --theme ${th} --reason "Needs review"`,
                ].filter(Boolean) as string[];
                return cmds.map((c) => (
                  <button
                    key={c}
                    className="btn btn-ghost btn-sm text-xs w-full text-left"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(c);
                        setBanner('Command copied');
                      } catch {
                        setBanner('Copy failed');
                      }
                    }}
                  >
                    {c}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
