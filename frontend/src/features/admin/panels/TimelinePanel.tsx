import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';

export function TimelinePanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [events, setEvents] = useState<{ ts: number; label: string; kind: string }[]>([]);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const [comms, execs, jobs, tasks] = await Promise.all([
        api<{ entries: any[] }>('/admin/codex/comms?limit=80'),
        api<{ logs: any[] }>('/admin/codex/exec/events'),
        api<{ jobs: any[] }>('/jobs'),
        api<{ tasks: any[] }>('/tasks?limit=200'),
      ]);
      const next: { ts: number; label: string; kind: string }[] = [];
      for (const e of comms.entries || []) {
        const ts = Date.parse(e.Timestamp) || Date.now();
        next.push({ ts, label: `${e.Agent}: ${e.Message}`, kind: 'comms' });
      }
      for (const l of execs.logs || []) {
        if (l.mtime != null) {
          next.push({
            ts: Number(l.mtime) * 1000,
            label: `Codex exec: ${l.name}`,
            kind: 'exec',
          });
        }
      }
      for (const j of jobs.jobs || []) {
        if (j.created_at) {
          next.push({
            ts: Number(j.created_at) * 1000,
            label: `Job ${j.id} ${j.status}`,
            kind: 'job',
          });
        }
      }
      for (const t of tasks.tasks || []) {
        if (t.created_at) {
          next.push({
            ts: Number(t.created_at) * 1000,
            label: `Task ${t.id} ${t.status} (${t.theme || 'no theme'})`,
            kind: 'task',
          });
        }
      }
      next.sort((a, b) => b.ts - a.ts);
      setEvents(next.slice(0, 200));
    } catch (err) {
      setBanner(`Timeline load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const kindColor = (k: string) => {
    switch (k) {
      case 'exec':
        return 'text-purple-300';
      case 'job':
        return 'text-cyan-300';
      case 'task':
        return 'text-emerald-300';
      default:
        return 'text-white/70';
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Activity Timeline</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: timeline disabled.</p>}
        <div className="space-y-2 max-h-[75vh] overflow-auto">
          {events.map((e, i) => (
            <div key={i} className="glass p-3 flex items-start justify-between">
              <div className="text-xs text-white/80">{e.label}</div>
              <div className={`text-[11px] ${kindColor(e.kind)}`}>
                {new Date(e.ts).toLocaleString()}
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="text-xs text-white/50">No events yet.</div>}
        </div>
      </div>
    </div>
  );
}
