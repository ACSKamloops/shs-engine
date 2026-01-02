
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { HelpText } from '../AdminUtils';

export default function AutorunPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [config, setConfig] = useState<any | null>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<any>('/admin/codex/autorun/status');
      setConfig(data.config || null);
      setThemes(data.themes || []);
      setRecent(data.recent_autoruns || []);
    } catch (err) {
      setBanner(`Autorun load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (k: string, v: any) =>
    setConfig((c: any) => ({ ...(c || {}), [k]: v }));

  const save = async () => {
    if (!useLiveApi || !config) return;
    setSaving(true);
    try {
      const payload = { ...config };
      if (typeof payload.themes === 'string') {
        payload.themes = payload.themes
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
      if (typeof payload.codex_env === 'string') {
        try {
          payload.codex_env = JSON.parse(payload.codex_env);
        } catch {
          payload.codex_env = {};
        }
      }
      if (typeof payload.on_upload_macros === 'string') {
        try {
          payload.on_upload_macros = JSON.parse(payload.on_upload_macros);
        } catch {
          payload.on_upload_macros = {};
        }
      }
      const res = await api<any>('/admin/codex/autorun/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setConfig(res.config);
      setBanner('Autorun config saved');
      await load();
    } catch (err) {
      setBanner(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Auto-Run</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
              Refresh
            </button>
            <button className="btn btn-primary btn-sm text-xs" disabled={saving} onClick={() => void save()}>
              Save
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: autorun disabled.</p>}
        <HelpText>
          Auto-Run triggers macros in the background. It requires the worker to be started with <span className="font-mono">PUKAIST_CODEX_AUTORUN_DAEMON=true</span>. Use limits and active hours to avoid surprise load.
        </HelpText>
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!config.enabled}
                onChange={(e) => patch('enabled', e.target.checked)}
              />
              <span className="text-white/80">Enabled (daemon reads this)</span>
            </label>
            <div />
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Interval (sec)</span>
              <input
                type="number"
                className="input"
                value={config.interval_sec ?? 300}
                onChange={(e) => patch('interval_sec', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Max concurrent runs</span>
              <input
                type="number"
                className="input"
                value={config.max_concurrent_runs ?? 1}
                onChange={(e) => patch('max_concurrent_runs', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Pending threshold</span>
              <input
                type="number"
                className="input"
                value={config.pending_threshold ?? 1}
                onChange={(e) => patch('pending_threshold', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Cooldown (sec)</span>
              <input
                type="number"
                className="input"
                value={config.cooldown_sec ?? 60}
                onChange={(e) => patch('cooldown_sec', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Active start hour</span>
              <input
                type="number"
                className="input"
                min={0}
                max={23}
                value={config.active_start_hour ?? 0}
                onChange={(e) => patch('active_start_hour', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Active end hour</span>
              <input
                type="number"
                className="input"
                min={0}
                max={24}
                value={config.active_end_hour ?? 24}
                onChange={(e) => patch('active_end_hour', Number(e.target.value))}
              />
              <span className="text-[10px] text-white/40">start==end means always on</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!config.require_no_inprogress}
                onChange={(e) => patch('require_no_inprogress', e.target.checked)}
              />
              <span className="text-white/80">Require no InProgress</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!config.reap_stale_before_run}
                onChange={(e) => patch('reap_stale_before_run', e.target.checked)}
              />
              <span className="text-white/80">Reap stale locks before run</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Stale mins</span>
              <input
                type="number"
                className="input"
                value={config.stale_mins ?? 120}
                onChange={(e) => patch('stale_mins', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Themes (comma list; empty=auto)</span>
              <input
                className="input"
                value={(config.themes || []).join(',')}
                onChange={(e) => patch('themes', e.target.value)}
                placeholder="Land_Reduction_Trespass, Governance_Sovereignty"
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-white/60">Codex env overrides (JSON)</span>
              <textarea
                className="input min-h-[120px] font-mono text-xs"
                value={
                  typeof config.codex_env === 'string'
                    ? config.codex_env
                    : JSON.stringify(config.codex_env || {}, null, 2)
                }
                onChange={(e) => patch('codex_env', e.target.value)}
              />
            </label>

            <div className="md:col-span-2 border-t border-white/10 pt-3 mt-2" />
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={!!config.on_upload_enabled}
                onChange={(e) => patch('on_upload_enabled', e.target.checked)}
              />
              <span className="text-white/80">Trigger macros after successful upload</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/60">Upload trigger delay (sec)</span>
              <input
                type="number"
                className="input"
                value={config.on_upload_delay_sec ?? 0}
                onChange={(e) => patch('on_upload_delay_sec', Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-white/60">On-upload macros (JSON map)</span>
              <textarea
                className="input min-h-[140px] font-mono text-xs"
                value={
                  typeof config.on_upload_macros === 'string'
                    ? config.on_upload_macros
                    : JSON.stringify(config.on_upload_macros || {}, null, 2)
                }
                onChange={(e) => patch('on_upload_macros', e.target.value)}
                placeholder='{"*":[{"id":"audit_task_overlap"}],"Land_Reduction_Trespass":[{"id":"codex_exec_env_runner"}]}'
              />
            </label>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Theme Eligibility</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {themes.map((t) => (
            <div key={t.theme} className="glass p-3">
              <div className="text-sm font-semibold text-white">{t.theme}</div>
              <div className="text-xs text-white/60">
                Pending {t.pending} · InProgress {t.inprogress}
              </div>
              <div className="mt-2 text-[10px] text-white/60">
                Eligible: {t.eligible ? 'yes' : 'no'} · AutoCodex locks: {t.inprogress_autocodex}
              </div>
            </div>
          ))}
          {themes.length === 0 && <div className="text-white/40">No themes yet.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Recent Auto-Runs</h3>
        </div>
        <div className="space-y-1 text-xs max-h-64 overflow-auto">
          {recent.map((r, i) => (
            <div key={i} className="glass p-2 flex justify-between">
              <div className="text-white/80">{r.command}</div>
              <div className="text-white/50">
                exit {r.exit_code} · {r.theme || ''} ·{' '}
                {r.ts_end ? new Date(r.ts_end * 1000).toLocaleString() : ''}
              </div>
            </div>
          ))}
          {recent.length === 0 && <div className="text-white/40">No autoruns recorded.</div>}
        </div>
      </div>
    </div>
  );
}
