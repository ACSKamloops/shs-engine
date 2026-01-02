import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv } from '../AdminUtils';

export function ContradictionsPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    DocID: '',
    Theme: '',
    Statement_A: '',
    Page_A: '',
    Statement_B: '',
    Page_B: '',
    Notes: '',
    Status: 'Open',
    LoggedBy: 'Manager',
  });

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ rows: Record<string, string>[] }>('/admin/codex/contradictions');
      setRows(data.rows || []);
    } catch (err) {
      setBanner(`Contradictions load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!useLiveApi) return;
    try {
      await api('/admin/codex/contradictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, DateLogged: new Date().toISOString() }),
      });
      setBanner('Contradiction logged');
      setForm((f) => ({ ...f, Statement_A: '', Statement_B: '', Notes: '' }));
      await load();
    } catch (err) {
      setBanner(`Add failed: ${(err as Error).message}`);
    }
  };

  const cols = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Log Contradiction</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[
            ['DocID', 'Doc ID'],
            ['Theme', 'Theme'],
            ['Page_A', 'Page A'],
            ['Page_B', 'Page B'],
            ['Status', 'Status'],
            ['LoggedBy', 'Logged By'],
          ].map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-white/60">{label}</span>
              <input
                className="input"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-white/60">Statement A</span>
            <textarea
              className="input min-h-[80px]"
              value={form.Statement_A}
              onChange={(e) => setForm((f) => ({ ...f, Statement_A: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-white/60">Statement B</span>
            <textarea
              className="input min-h-[80px]"
              value={form.Statement_B}
              onChange={(e) => setForm((f) => ({ ...f, Statement_B: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-white/60">Notes</span>
            <textarea
              className="input min-h-[60px]"
              value={form.Notes}
              onChange={(e) => setForm((f) => ({ ...f, Notes: e.target.value }))}
            />
          </label>
        </div>
        <button className="btn btn-primary btn-sm mt-3" onClick={() => void submit()}>
          Add
        </button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Contradictions Register</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!rows.length}
              onClick={() => exportCsv('contradictions_register.csv', rows)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!rows.length}
              onClick={() => exportJson('contradictions_register.json', rows)}
            >
              Export JSON
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: contradictions disabled.</p>}
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/60 border-b border-white/5">
                {cols.map((c) => (
                  <th key={c} className="text-left py-2 pr-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  {cols.map((c) => (
                    <td key={c} className="py-2 pr-3 text-white/80">
                      {r[c]}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={cols.length || 1} className="py-4 text-center text-white/40">
                    No contradictions logged yet.
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
