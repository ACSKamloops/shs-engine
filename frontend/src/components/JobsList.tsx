type Job = {
  id: number;
  status: string;
  last_error?: string;
  created_at?: number;
  updated_at?: number;
};

type Task = {
  id: number;
  status: string;
  theme?: string;
  created_at?: number;
  updated_at?: number;
};

type Props = {
  jobs: Job[];
  jobStatusFilter: string;
  taskStatusFilter: string;
  expandedJobId: number | null;
  jobTasks: Record<number, Task[]>;
  onReload: () => void;
  onLoadTasks: (jobId: number) => void;
  onViewPipeline: (taskId: number) => void;
};

export function JobsList({
  jobs,
  jobStatusFilter,
  taskStatusFilter,
  expandedJobId,
  jobTasks,
  onReload,
  onLoadTasks,
  onViewPipeline,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Jobs</h3>
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-slate-300">
              Status
              <select className="ml-1 rounded bg-white/10 text-xs text-white px-2 py-1" value={jobStatusFilter}>
                <option value="all">All</option>
              </select>
            </label>
            <label className="text-xs text-slate-300">
              Tasks
              <select className="ml-1 rounded bg-white/10 text-xs text-white px-2 py-1" value={taskStatusFilter}>
                <option value="all">All</option>
              </select>
            </label>
          </div>
        </div>
        <button className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 h-8" onClick={onReload}>
          Reload
        </button>
      </div>
      <div className="max-h-48 overflow-auto space-y-2">
        {jobs
          .filter((j) => jobStatusFilter === "all" || j.status === jobStatusFilter)
          .map((j) => (
            <div key={j.id} className="glass border border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill bg-white/15 text-white">job #{j.id}</span>
                <span className="pill bg-emerald-500/20 text-emerald-100">{j.status}</span>
                <button className="ml-auto text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20" onClick={() => onLoadTasks(j.id)}>
                  View tasks
                </button>
              </div>
              {j.last_error && <p className="text-xs text-amber-200 mt-1">{j.last_error}</p>}
              {expandedJobId === j.id && (
                <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
                  {(jobTasks[j.id] || [])
                    .filter((t) => taskStatusFilter === "all" || t.status === taskStatusFilter)
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-2 flex-wrap">
                        <span className="pill bg-white/15 text-white">task #{t.id}</span>
                        <span className="pill bg-emerald-500/20 text-emerald-100">{t.status}</span>
                        {t.theme && <span className="pill">{t.theme}</span>}
                        <button
                          className="ml-auto text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20"
                          onClick={() => onViewPipeline(t.id)}
                        >
                          View pipeline
                        </button>
                      </div>
                    ))}
                  {!(jobTasks[j.id] || []).length && <p className="text-xs text-slate-400">No tasks yet. Refresh after uploads.</p>}
                </div>
              )}
            </div>
          ))}
        {!jobs.length && <p className="text-sm text-slate-400">No jobs yet. Upload to create one.</p>}
      </div>
    </div>
  );
}
