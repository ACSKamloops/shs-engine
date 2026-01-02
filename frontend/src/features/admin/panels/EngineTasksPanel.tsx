import { useState, useEffect } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv, HelpText } from '../AdminUtils';

export function EngineTasksPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [tasks, setTasks] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const load = async () => {
    if (!useLiveApi) return;
    try {
      const t = await api<{ tasks: any[] }>('/tasks?limit=200');
      const j = await api<{ jobs: any[] }>('/jobs');
      setTasks(t.tasks || []);
      setJobs(j.jobs || []);
    } catch (err) {
      setBanner(`Engine load failed: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const jobCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    const s = j.status || 'unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Jobs</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!jobs.length}
              onClick={() => exportCsv('engine_jobs.csv', jobs)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!jobs.length}
              onClick={() => exportJson('engine_jobs.json', jobs)}
            >
              Export JSON
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: tasks unavailable.</p>}
        <HelpText>
          Jobs/tasks are created by uploads (<span className="font-mono">/upload</span>) or by scanning the intake folder. The worker leases <span className="font-mono">pending</span> tasks and marks them <span className="font-mono">done</span> or <span className="font-mono">flagged</span>.
        </HelpText>
        <div className="flex flex-wrap gap-1 text-[11px] text-white/70">
          {Object.entries(jobCounts).map(([k, v]) => (
            <span key={k} className="px-2 py-1 rounded bg-white/5">
              {k}: {v}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Tasks</h3>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!tasks.length}
              onClick={() => exportCsv('engine_tasks.csv', tasks)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!tasks.length}
              onClick={() => exportJson('engine_tasks.json', tasks)}
            >
              Export JSON
            </button>
          </div>
        </div>
        <HelpText>
          <span className="font-mono">flagged</span> means the worker could not validate/process a file; check <span className="font-mono">last_error</span> and fix/retry.
        </HelpText>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/60 border-b border-white/5">
                {['id', 'status', 'theme', 'file_path', 'attempts', 'last_error'].map((c) => (
                  <th key={c} className="text-left py-2 pr-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-3 text-white/80">{t.id}</td>
                  <td className="py-2 pr-3 text-white/80">{t.status}</td>
                  <td className="py-2 pr-3 text-white/80">{t.theme}</td>
                  <td className="py-2 pr-3 text-white/70 break-all">{t.file_path}</td>
                  <td className="py-2 pr-3 text-white/80">{t.attempts}</td>
                  <td className="py-2 pr-3 text-white/60">{t.error_summary || t.last_error}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-white/40">
                    No tasks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
