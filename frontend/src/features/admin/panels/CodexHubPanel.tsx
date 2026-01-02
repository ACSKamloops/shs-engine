import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore, useCodexAdminStore } from '../../../store';
import { HelpText } from '../AdminUtils';

export function CodexHubPanel() {
  const { api, apiStream, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();

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

  const [system, setSystem] = useState<any | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const [sys, sum, skl] = await Promise.all([
        api<any>('/admin/codex/system'),
        api<any>('/admin/analytics/summary'),
        api<any>('/admin/codex/skills'),
      ]);
      setSystem(sys);
      setSummary(sum?.summary || null);
      setSkills(skl?.skills || []);
    } catch (err) {
      setBanner(`Codex system load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const codexVersion = system?.codex?.version?.stdout || system?.codex?.version?.stderr || '—';
  const featuresText = system?.codex?.features?.stdout || system?.codex?.features?.stderr || '';

  const codexRuns24h = summary?.codex?.codex_runs_24h ?? null;
  const codexSuccess = summary?.codex?.codex_success_rate ?? null;
  const codexAvgMs = summary?.codex?.codex_avg_duration_ms ?? null;

  const [resumeForm, setResumeForm] = useState({
    session_id: '',
    last: true,
    json_events: false,
    message: '',
  });
  const [resumeOutput, setResumeOutput] = useState('');
  const [resumeEvents, setResumeEvents] = useState<any[]>([]);
  const [resumeRunning, setResumeRunning] = useState(false);
  const [resumeRunId, setResumeRunId] = useState<string | null>(null);

  const runResume = async () => {
    if (!useLiveApi) return;
    const msg = resumeForm.message.trim();
    if (!msg) return;
    setResumeOutput('');
    setResumeEvents([]);
    setResumeRunId(null);
    setResumeRunning(true);
    try {
      const resp = await apiStream('/admin/codex/resume/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          session_id: resumeForm.session_id.trim() || undefined,
          last: resumeForm.last,
          json_events: resumeForm.json_events,
          env: envOverrides,
        }),
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
          if (ev === 'start' && data?.run_id) setResumeRunId(String(data.run_id));
          if (ev === 'line' && data?.line) setResumeOutput((o) => o + String(data.line) + '\n');
          if (ev === 'json' && data?.event) setResumeEvents((e) => [...e.slice(-199), data.event]);
          if (ev === 'end') finalExit = Number(data?.exit_code ?? 0);
          if (ev === 'error') setBanner(`Resume error: ${data?.error || dataStr}`);
        }
      }
      if (finalExit === 0) setBanner('Resume completed');
      else if (finalExit != null) setBanner(`Resume failed (${finalExit})`);
    } catch (err) {
      setBanner(`Resume failed: ${(err as Error).message}`);
    } finally {
      setResumeRunning(false);
    }
  };

  const cancelResume = async () => {
    if (!useLiveApi || !resumeRunId) return;
    try {
      await api('/admin/cli/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: resumeRunId }),
      });
      setBanner('Cancelling resume…');
    } catch (err) {
      setBanner(`Cancel failed: ${(err as Error).message}`);
    }
  };

  const [reviewForm, setReviewForm] = useState({
    prompt: 'Review changes and suggest improvements.',
    uncommitted: true,
    base: '',
    commit: '',
    title: '',
    json_events: false,
  });
  const [reviewOutput, setReviewOutput] = useState('');
  const [reviewEvents, setReviewEvents] = useState<any[]>([]);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [reviewRunId, setReviewRunId] = useState<string | null>(null);

  const runReview = async () => {
    if (!useLiveApi) return;
    setReviewOutput('');
    setReviewEvents([]);
    setReviewRunId(null);
    setReviewRunning(true);
    try {
      const resp = await apiStream('/admin/codex/review/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: reviewForm.prompt,
          uncommitted: reviewForm.uncommitted,
          base: reviewForm.base.trim() || undefined,
          commit: reviewForm.commit.trim() || undefined,
          title: reviewForm.title.trim() || undefined,
          json_events: reviewForm.json_events,
          env: envOverrides,
        }),
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
          if (ev === 'start' && data?.run_id) setReviewRunId(String(data.run_id));
          if (ev === 'line' && data?.line) setReviewOutput((o) => o + String(data.line) + '\n');
          if (ev === 'json' && data?.event) setReviewEvents((e) => [...e.slice(-199), data.event]);
          if (ev === 'end') finalExit = Number(data?.exit_code ?? 0);
          if (ev === 'error') setBanner(`Review error: ${data?.error || dataStr}`);
        }
      }
      if (finalExit === 0) setBanner('Review completed');
      else if (finalExit != null) setBanner(`Review failed (${finalExit})`);
    } catch (err) {
      setBanner(`Review failed: ${(err as Error).message}`);
    } finally {
      setReviewRunning(false);
    }
  };

  const cancelReview = async () => {
    if (!useLiveApi || !reviewRunId) return;
    try {
      await api('/admin/cli/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_id: reviewRunId }),
      });
      setBanner('Cancelling review…');
    } catch (err) {
      setBanner(`Cancel failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Hub</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: Codex disabled.</p>}
        <HelpText>
          Runs Codex CLI workflows from the web UI. Most runs use the env values from the <span className="font-mono">Codex Exec</span> tab.
        </HelpText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass p-4">
            <div className="text-xs text-white/60">Codex CLI</div>
            <div className="text-sm text-white font-semibold mt-1">{codexVersion}</div>
            <div className="text-[11px] text-white/40 mt-2">Profile: {codex.codexProfile || '—'}</div>
            <div className="text-[11px] text-white/40">Model: {codex.codexModel || '—'}</div>
            <div className="text-[11px] text-white/40">Exec flags: {codex.codexExecFlags || '—'}</div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/60">24h</div>
            <div className="text-2xl font-semibold text-white mt-1">{codexRuns24h != null ? codexRuns24h : '—'}</div>
            <div className="text-[11px] text-white/40 mt-1">
              Success: {codexSuccess != null ? `${Math.round(codexSuccess * 100)}%` : '—'}
            </div>
            <div className="text-[11px] text-white/40">Avg duration: {codexAvgMs != null ? `${Math.round(codexAvgMs)} ms` : '—'}</div>
          </div>
          <div className="glass p-4">
            <div className="text-xs text-white/60">Features</div>
            <pre className="mt-2 text-[11px] text-white/70 whitespace-pre-wrap max-h-28 overflow-auto">
              {featuresText || '—'}
            </pre>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Skill Library</h3>
          <div className="text-xs text-white/60">{skills.length} skills</div>
        </div>
        <HelpText>
          Skills are reusable role prompts stored in the repo (<span className="font-mono">.codex/skills</span>). In Codex CLI you can invoke them by typing <span className="font-mono">$name</span>.
        </HelpText>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {skills.map((s) => {
            const skillName = String(s?.name || s?.id || '').trim();
            const skillId = String(s?.id || '').trim();
            const label = skillName || skillId || 'skill';
            const desc = String(s?.description || '').trim();
            const path = String(s?.path || '').trim();
            return (
              <div key={skillId || label} className="glass p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <button
                    className="btn btn-ghost btn-sm text-[10px]"
                    type="button"
                    onClick={async () => {
                      const token = `$${label}`;
                      try {
                        await navigator.clipboard.writeText(token);
                        setBanner(`Copied ${token}`);
                      } catch {
                        setBanner('Copy failed');
                      }
                    }}
                  >
                    Copy {`$${label}`}
                  </button>
                </div>
                {desc && <div className="text-xs text-white/60 mt-1">{desc}</div>}
                {path && <div className="text-[10px] text-white/40 mt-2 font-mono">{path}</div>}
              </div>
            );
          })}
          {skills.length === 0 && <div className="text-xs text-white/50">No repo skills found.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Resume Session</h3>
          <div className="flex items-center gap-2">
            {resumeRunning && resumeRunId && (
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => void cancelResume()}>
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass p-3 space-y-2">
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Session ID (optional)</span>
              <input
                className="input"
                value={resumeForm.session_id}
                onChange={(e) => setResumeForm((f) => ({ ...f, session_id: e.target.value }))}
                placeholder="UUID…"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={resumeForm.last}
                onChange={(e) => setResumeForm((f) => ({ ...f, last: e.target.checked }))}
              />
              <span className="text-white/70">Use most recent session (--last)</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={resumeForm.json_events}
                onChange={(e) => setResumeForm((f) => ({ ...f, json_events: e.target.checked }))}
              />
              <span className="text-white/70">Stream JSON events</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Message</span>
              <textarea
                className="input min-h-[90px]"
                value={resumeForm.message}
                onChange={(e) => setResumeForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Continue the session…"
              />
            </label>
            <button className="btn btn-primary btn-sm text-xs w-full" disabled={resumeRunning} onClick={() => void runResume()}>
              Send
            </button>
          </div>
          <pre className="md:col-span-2 bg-black/40 rounded p-3 text-xs text-white/80 border border-white/5 max-h-72 overflow-auto whitespace-pre-wrap">
            {resumeOutput || 'Output will appear here.'}
          </pre>
        </div>
        {resumeEvents.length > 0 && (
          <pre className="mt-3 bg-black/40 rounded p-3 text-[11px] text-white/80 border border-white/5 max-h-72 overflow-auto whitespace-pre-wrap">
            {resumeEvents.map((e) => JSON.stringify(e)).join('\n')}
          </pre>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Repo Review</h3>
          <div className="flex items-center gap-2">
            {reviewRunning && reviewRunId && (
              <button className="btn btn-ghost btn-sm text-xs" onClick={() => void cancelReview()}>
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass p-3 space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={reviewForm.uncommitted}
                onChange={(e) => setReviewForm((f) => ({ ...f, uncommitted: e.target.checked }))}
              />
              <span className="text-white/70">Review uncommitted changes</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Base branch (optional)</span>
              <input
                className="input"
                value={reviewForm.base}
                onChange={(e) => setReviewForm((f) => ({ ...f, base: e.target.value }))}
                placeholder="main"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Commit SHA (optional)</span>
              <input
                className="input"
                value={reviewForm.commit}
                onChange={(e) => setReviewForm((f) => ({ ...f, commit: e.target.value }))}
                placeholder="abc123…"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Title (optional)</span>
              <input
                className="input"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Review"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60 text-xs">Instructions</span>
              <textarea
                className="input min-h-[90px]"
                value={reviewForm.prompt}
                onChange={(e) => setReviewForm((f) => ({ ...f, prompt: e.target.value }))}
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={reviewForm.json_events}
                onChange={(e) => setReviewForm((f) => ({ ...f, json_events: e.target.checked }))}
              />
              <span className="text-white/70">Stream JSON events</span>
            </label>
            <button className="btn btn-primary btn-sm text-xs w-full" disabled={reviewRunning} onClick={() => void runReview()}>
              Run review
            </button>
            <p className="text-[11px] text-white/40">
              Choose only one mode: uncommitted, base, or commit.
            </p>
          </div>
          <pre className="md:col-span-2 bg-black/40 rounded p-3 text-xs text-white/80 border border-white/5 max-h-72 overflow-auto whitespace-pre-wrap">
            {reviewOutput || 'Output will appear here.'}
          </pre>
        </div>
        {reviewEvents.length > 0 && (
          <pre className="mt-3 bg-black/40 rounded p-3 text-[11px] text-white/80 border border-white/5 max-h-72 overflow-auto whitespace-pre-wrap">
            {reviewEvents.map((e) => JSON.stringify(e)).join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
}
