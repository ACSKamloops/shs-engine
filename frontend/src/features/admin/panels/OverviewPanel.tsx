import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv } from '../AdminUtils';

type QueueSummary = {
  theme: string;
  file: string;
  total: number;
  counts: Record<string, number>;
};

type QueueStatus = Record<string, number>;

type FlaggedTask = {
  id: number;
  file_path: string;
  last_error?: string;
  error_summary?: string;
  updated_at?: number;
  theme?: string;
};

type GpuDevice = {
  name: string;
  uuid: string;
  utilization?: number | null;
  memory_used?: number | null;
  memory_total?: number | null;
  temperature?: number | null;
  power_draw?: number | null;
  power_limit?: number | null;
};

type GpuStatus = {
  available: boolean;
  gpus?: GpuDevice[];
  error?: string;
  ts?: number;
};

type OcrFilesystemStatus = {
  total_pdfs: number;
  completed: number;
  skipped: number;
  pending: number;
  progress_pct: number;
  pdf_sizes: { small: number; medium: number; large: number };
  last_completed_file?: string | null;
  last_completed_time?: number;
  ts: number;
};

export function OverviewPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [engineTasks, setEngineTasks] = useState<any[]>([]);
  const [engineJobs, setEngineJobs] = useState<any[]>([]);
  const [codexQueues, setCodexQueues] = useState<QueueSummary[]>([]);
  const [codexFlagged, setCodexFlagged] = useState<any[]>([]);
  const [ocrStatus, setOcrStatus] = useState<{ files_to_ocr_count: number; vision_required_count: number } | null>(null);
  const [cliStatus, setCliStatus] = useState<{ enabled: boolean; allowed_prefixes: string[] } | null>(null);
  const [execLogs, setExecLogs] = useState<{ logs: any[] } | null>(null);
  const [metricsSnap, setMetricsSnap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [flaggedTasks, setFlaggedTasks] = useState<FlaggedTask[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueUpdatedAt, setQueueUpdatedAt] = useState<number | null>(null);
  const [autoRefreshQueue, setAutoRefreshQueue] = useState(true);
  const [gpuStatus, setGpuStatus] = useState<GpuStatus | null>(null);
  const [ocrFsStatus, setOcrFsStatus] = useState<OcrFilesystemStatus | null>(null);
  const [recentDone, setRecentDone] = useState<any[]>([]);
  const [processingTasks, setProcessingTasks] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const [t, j, q, f, o, c, e, m] = await Promise.all([
        api<{ tasks: any[] }>('/tasks?limit=500'),
        api<{ jobs: any[] }>('/jobs'),
        api<{ queues: QueueSummary[] }>('/admin/codex/queues'),
        api<{ tasks: any[] }>('/admin/codex/flagged'),
        api<any>('/admin/codex/ocr/status'),
        api<any>('/admin/cli/status'),
        api<any>('/admin/codex/exec/events'),
        api<{ counters: Record<string, number> }>('/metrics'),
      ]);
      setEngineTasks(t.tasks || []);
      setEngineJobs(j.jobs || []);
      setCodexQueues(q.queues || []);
      setCodexFlagged(f.tasks || []);
      setOcrStatus(o);
      setCliStatus(c);
      setExecLogs(e);
      setMetricsSnap(m.counters || {});
    } catch (err) {
      setBanner(`Overview load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [api, setBanner, useLiveApi]);

  const loadQueueStatus = useCallback(async () => {
    if (!useLiveApi) return;
    setQueueLoading(true);
    try {
      const [status, flagged, gpu, ocrFs, done, processing] = await Promise.all([
        api<{ queue: QueueStatus }>('/status'),
        api<{ tasks: FlaggedTask[] }>('/tasks/flagged?limit=5'),
        api<GpuStatus>('/admin/system/gpu'),
        api<OcrFilesystemStatus>('/admin/ocr/filesystem-status'),
        api<{ tasks: any[] }>('/tasks?status=done&limit=10'),
        api<{ tasks: any[] }>('/tasks?status=leased&limit=5'),
      ]);
      setQueueStatus(status.queue || {});
      setFlaggedTasks(flagged.tasks || []);
      setGpuStatus(gpu || null);
      setOcrFsStatus(ocrFs || null);
      setRecentDone((done.tasks || []).sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)));
      setProcessingTasks(processing.tasks || []);
      setQueueUpdatedAt(Date.now());
    } catch (err) {
      setBanner(`Queue status failed: ${(err as Error).message}`);
    } finally {
      setQueueLoading(false);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadQueueStatus();
  }, [loadQueueStatus]);

  useEffect(() => {
    if (!useLiveApi || !autoRefreshQueue) return;
    const handle = window.setInterval(() => {
      void loadQueueStatus();
    }, 5000);
    return () => window.clearInterval(handle);
  }, [autoRefreshQueue, loadQueueStatus, useLiveApi]);

  const handleRefresh = () => {
    void load();
    void loadQueueStatus();
  };

  const engineTaskCounts = engineTasks.reduce<Record<string, number>>((acc, t) => {
    const s = (t.status || 'unknown').toString();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const engineJobCounts = engineJobs.reduce<Record<string, number>>((acc, j) => {
    const s = (j.status || 'unknown').toString();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const codexTotals = codexQueues.reduce<Record<string, number>>((acc, q) => {
    for (const [k, v] of Object.entries(q.counts || {})) {
      acc[k] = (acc[k] || 0) + v;
    }
    return acc;
  }, {});

  const apiTotal = metricsSnap['api_requests_total'] || 0;
  const tasksCompleted = metricsSnap['tasks_completed'] || 0;
  const tasksFlagged = metricsSnap['tasks_flagged'] || 0;

  const lastExec = execLogs?.logs?.[0];
  const lastExecTime =
    lastExec?.mtime != null ? new Date(Number(lastExec.mtime) * 1000).toLocaleString() : 'n/a';

  const queueCounts = queueStatus || {};
  const done = (queueCounts.done || 0) + (queueCounts.completed || 0);
  const flagged = queueCounts.flagged || 0;
  const processing = (queueCounts.processing || 0) + (queueCounts.leased || 0);
  const pending = queueCounts.pending || 0;
  const other = Object.entries(queueCounts).reduce((sum, [k, v]) => {
    if (['done', 'completed', 'flagged', 'processing', 'leased', 'pending'].includes(k)) return sum;
    return sum + (v || 0);
  }, 0);
  const total = done + flagged + processing + pending + other;
  const completed = done + flagged;
  const progressPct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  const queueUpdatedLabel = queueUpdatedAt ? new Date(queueUpdatedAt).toLocaleTimeString() : 'n/a';
  const primaryGpu = gpuStatus?.gpus?.[0];
  const gpuMemPct =
    primaryGpu?.memory_total ? Math.min(100, ((primaryGpu.memory_used || 0) / primaryGpu.memory_total) * 100) : 0;
  const gpuUpdatedLabel = gpuStatus?.ts ? new Date(gpuStatus.ts * 1000).toLocaleTimeString() : 'n/a';

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">System Overview</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={handleRefresh} disabled={loading}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={async () => {
                if (!useLiveApi) return;
                try {
                  const st = useAppStore.getState();
                  const base = st.apiBase.replace(/\/$/, '');
                  const origin = base.startsWith('http') ? base : `${window.location.origin}${base}`;
                  const resp = await fetch(`${origin}/admin/export/bundle`, {
                    method: 'POST',
                    headers: { 'X-API-Key': st.apiKey, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'pukaist_bundle' }),
                  });
                  if (!resp.ok) throw new Error(await resp.text());
                  const blob = await resp.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'pukaist_bundle.zip';
                  a.click();
                  URL.revokeObjectURL(url);
                  setBanner('Bundle exported');
                } catch (err) {
                  setBanner(`Export failed: ${(err as Error).message}`);
                }
              }}
            >
              Export Bundle
            </button>
          </div>
        </div>

        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: overview unavailable.</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass p-4">
            <div className="text-xs text-white/50">Engine Tasks</div>
            <div className="text-2xl font-semibold text-white">{engineTasks.length}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-white/70">
              {Object.entries(engineTaskCounts).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-white/5">
                  {k}:{v}
                </span>
              ))}
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">Engine Jobs</div>
            <div className="text-2xl font-semibold text-white">{engineJobs.length}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-white/70">
              {Object.entries(engineJobCounts).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-white/5">
                  {k}:{v}
                </span>
              ))}
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">Codex Queues</div>
            <div className="text-2xl font-semibold text-white">
              {codexQueues.reduce((s, q) => s + (q.total || 0), 0)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-white/70">
              {Object.entries(codexTotals).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-white/5">
                  {k}:{v}
                </span>
              ))}
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">Codex Flagged</div>
            <div className="text-2xl font-semibold text-white">{codexFlagged.length}</div>
            <div className="mt-1 text-[11px] text-white/60">Review noisy/corrupt tasks.</div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">OCR Backlog</div>
            <div className="text-2xl font-semibold text-white">
              {(ocrStatus?.files_to_ocr_count || 0) + (ocrStatus?.vision_required_count || 0)}
            </div>
            <div className="mt-2 flex gap-2 text-[11px] text-white/70">
              <span>Files_To_OCR: {ocrStatus?.files_to_ocr_count ?? 0}</span>
              <span>Vision_Required: {ocrStatus?.vision_required_count ?? 0}</span>
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">Codex Exec</div>
            <div className="text-sm font-semibold text-white">
              {execLogs?.logs?.length ?? 0} runs
            </div>
            <div className="mt-1 text-[11px] text-white/60">Last: {lastExecTime}</div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">CLI Panel</div>
            <div className={`text-sm font-semibold ${cliStatus?.enabled ? 'text-emerald-300' : 'text-amber-300'}`}>
              {cliStatus?.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              Allowlist: {cliStatus?.allowed_prefixes?.length ?? 0} prefixes
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">API Requests</div>
            <div className="text-2xl font-semibold text-white">{apiTotal}</div>
            <div className="mt-1 text-[11px] text-white/60">
              Tasks completed: {tasksCompleted} · flagged: {tasksFlagged}
            </div>
          </div>

          <div className="glass p-4">
            <div className="text-xs text-white/50">GPU</div>
            {primaryGpu ? (
              <div className="mt-1 space-y-2">
                <div className="text-sm font-semibold text-white">{primaryGpu.name}</div>
                <div className="text-[11px] text-white/70">
                  Util {primaryGpu.utilization ?? 0}% · {primaryGpu.temperature ?? '—'}°C · {primaryGpu.power_draw ?? '—'}W
                </div>
                <div className="text-[11px] text-white/70">
                  VRAM {primaryGpu.memory_used ?? 0} / {primaryGpu.memory_total ?? 0} MB
                </div>
                <div className="h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${gpuMemPct}%` }} />
                </div>
                <div className="text-[10px] text-white/50">Updated {gpuUpdatedLabel}</div>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-white/50">
                {gpuStatus?.error ? `GPU unavailable: ${gpuStatus.error}` : 'GPU stats unavailable'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">OCR Processing Progress</h3>
          <div className="flex items-center gap-2 text-xs text-white/70">
            {queueLoading ? <span className="text-cyan-300 animate-pulse">Updating...</span> : null}
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={autoRefreshQueue}
                onChange={(e) => setAutoRefreshQueue(e.target.checked)}
                className="accent-cyan-500"
              />
              Auto (5s)
            </label>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void loadQueueStatus()}>
              Refresh
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: status unavailable.</p>}
        <div className="space-y-3">
          {/* OCR Filesystem Status - Accurate */}
          {ocrFsStatus && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                <span className="text-emerald-300 font-semibold">
                  {ocrFsStatus.completed}/{ocrFsStatus.total_pdfs} complete ({ocrFsStatus.progress_pct}%)
                </span>
                <span>
                  pending {ocrFsStatus.pending} · skipped {ocrFsStatus.skipped} · completed {ocrFsStatus.completed}
                </span>
                <span className="text-white/50">
                  Updated {ocrFsStatus.ts ? new Date(ocrFsStatus.ts * 1000).toLocaleTimeString() : 'n/a'}
                </span>
              </div>
              <div className="h-3 rounded bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${ocrFsStatus.progress_pct}%` }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="glass p-3">
                  <div className="text-xs text-white/50">PDF Size Breakdown</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/70">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Small (&lt;20MB): {ocrFsStatus.pdf_sizes.small}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Medium: {ocrFsStatus.pdf_sizes.medium}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                      Large (&gt;50MB): {ocrFsStatus.pdf_sizes.large}
                    </span>
                  </div>
                </div>
                <div className="glass p-3">
                  <div className="text-xs text-white/50">Last Completed</div>
                  <div className="mt-2 text-[11px] text-white/70 truncate">
                    {ocrFsStatus.last_completed_file || 'None yet'}
                  </div>
                  <div className="text-[10px] text-white/50">
                    {ocrFsStatus.last_completed_time
                      ? new Date(ocrFsStatus.last_completed_time * 1000).toLocaleString()
                      : '—'}
                  </div>
                </div>
                <div className="glass p-3">
                  <div className="text-xs text-white/50">Recent Errors</div>
                  <div className="mt-2 space-y-1 text-[11px] text-white/70 max-h-20 overflow-y-auto">
                    {flaggedTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="truncate">
                        <span className="text-red-300">#{t.id}</span>{' '}
                        {(t.file_path || '').split('/').slice(-1)[0]}
                      </div>
                    ))}
                    {flaggedTasks.length === 0 && <div className="text-white/40">No errors</div>}
                  </div>
                </div>
              </div>
            </>
          )}
          {!ocrFsStatus && <div className="text-xs text-white/50">Loading OCR status...</div>}
        </div>
      </div>

      {/* OCR Activity Log */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">📋 OCR Activity Log</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currently Processing */}
          <div className="glass p-3">
            <div className="text-xs text-cyan-300 font-semibold mb-2">▶ Processing ({processingTasks.length})</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {processingTasks.map((t) => (
                <div key={t.id} className="text-[11px] text-white/70 flex items-start gap-2">
                  <span className="animate-pulse text-cyan-400">●</span>
                  <span className="truncate">{(t.file_path || '').split('/').pop()}</span>
                </div>
              ))}
              {processingTasks.length === 0 && <div className="text-white/40 text-[11px]">No active tasks</div>}
            </div>
          </div>

          {/* Recent Completions */}
          <div className="glass p-3">
            <div className="text-xs text-emerald-300 font-semibold mb-2">✓ Recent Completions</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {recentDone.slice(0, 6).map((t) => (
                <div key={t.id} className="text-[11px] text-white/70 flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{(t.file_path || '').split('/').pop()}</div>
                    <div className="text-white/40 text-[10px]">
                      {t.updated_at ? new Date(t.updated_at * 1000).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </div>
              ))}
              {recentDone.length === 0 && <div className="text-white/40 text-[11px]">No recent completions</div>}
            </div>
          </div>

          {/* Flagged with Reasons */}
          <div className="glass p-3">
            <div className="text-xs text-red-300 font-semibold mb-2">⚠ Flagged ({flaggedTasks.length})</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {flaggedTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="text-[11px]">
                  <div className="text-white/70 truncate">{(t.file_path || '').split('/').pop()}</div>
                  <div className="text-red-400/80 text-[10px] truncate">
                    {t.error_summary || t.last_error || 'Unknown error'}
                  </div>
                </div>
              ))}
              {flaggedTasks.length === 0 && <div className="text-white/40 text-[11px]">No errors</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
