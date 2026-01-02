import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv } from '../AdminUtils';

export function FlaggedPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [codexFlagged, setCodexFlagged] = useState<Record<string, string>[]>([]);
  const [engineFlagged, setEngineFlagged] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const [c, e] = await Promise.all([
        api<{ tasks: Record<string, string>[] }>('/admin/codex/flagged'),
        api<{ tasks: any[] }>('/tasks/flagged?limit=200'),
      ]);
      setCodexFlagged(c.tasks || []);
      setEngineFlagged(e.tasks || []);
    } catch (err) {
      setBanner(`Flagged load failed: ${(err as Error).message}`);
    }
  }, [api, setBanner, useLiveApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const codexCols = codexFlagged[0] ? Object.keys(codexFlagged[0]) : [];

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Codex Flagged Tasks</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!codexFlagged.length}
              onClick={() => exportCsv('codex_flagged.csv', codexFlagged)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!codexFlagged.length}
              onClick={() => exportJson('codex_flagged.json', codexFlagged)}
            >
              Export JSON
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: flagged unavailable.</p>}
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/60 border-b border-white/5">
                {codexCols.map((c) => (
                  <th key={c} className="text-left py-2 pr-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codexFlagged.map((r, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  {codexCols.map((c) => (
                    <td key={c} className="py-2 pr-3 text-white/80">
                      {r[c]}
                    </td>
                  ))}
                </tr>
              ))}
              {codexFlagged.length === 0 && (
                <tr>
                  <td colSpan={codexCols.length || 1} className="py-4 text-center text-white/40">
                    No Codex flagged tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Engine Flagged Tasks</h3>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!engineFlagged.length}
              onClick={() => exportCsv('engine_flagged.csv', engineFlagged)}
            >
              Export CSV
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              disabled={!engineFlagged.length}
              onClick={() => exportJson('engine_flagged.json', engineFlagged)}
            >
              Export JSON
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/60 border-b border-white/5">
                {['id', 'theme', 'file_path', 'error_summary'].map((c) => (
                  <th key={c} className="text-left py-2 pr-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engineFlagged.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-3 text-white/80">{t.id}</td>
                  <td className="py-2 pr-3 text-white/80">{t.theme}</td>
                  <td className="py-2 pr-3 text-white/70 break-all">{t.file_path}</td>
                  <td className="py-2 pr-3 text-white/60">{t.error_summary}</td>
                </tr>
              ))}
              {engineFlagged.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-white/40">
                    No engine flagged tasks.
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
