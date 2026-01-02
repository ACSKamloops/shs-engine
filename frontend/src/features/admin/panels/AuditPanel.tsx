import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson, exportCsv } from '../AdminUtils';

export function AuditPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [events, setEvents] = useState<any[]>([]);
  const [action, setAction] = useState('');
  const [tenant, setTenant] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (action.trim()) params.set('action', action.trim());
      if (tenant.trim()) params.set('tenant', tenant.trim());
      const data = await api<any>(`/admin/audit/events?${params.toString()}`);
      setEvents(data.events || []);
    } catch (err) {
      setBanner(`Audit load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [action, api, setBanner, tenant, useLiveApi]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 15000);
    return () => clearInterval(id);
  }, [load]);

  const exportRows = events.map((e) => ({
    ts: e.ts ? new Date(e.ts * 1000).toISOString() : '',
    action: e.action,
    tenant_id: e.tenant_id,
    roles: (e.roles || []).join(','),
    details: JSON.stringify(
      Object.fromEntries(Object.entries(e).filter(([k]) => !['ts', 'action', 'tenant_id', 'roles'].includes(k)))
    ),
  }));

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Audit Trail</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()} disabled={loading}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => exportJson('audit_events.json', events)}
              disabled={!events.length}
            >
              Export JSON
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => exportCsv('audit_events.csv', exportRows)}
              disabled={!events.length}
            >
              Export CSV
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: audit unavailable.</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 text-xs">
          <input
            className="input"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter action (e.g. cli_run)"
          />
          <input
            className="input"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            placeholder="Filter tenant"
          />
        </div>

        <div className="overflow-auto max-h-[520px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/60 border-b border-white/5">
                <th className="text-left py-2 pr-3 font-medium">Time</th>
                <th className="text-left py-2 pr-3 font-medium">Action</th>
                <th className="text-left py-2 pr-3 font-medium">Tenant</th>
                <th className="text-left py-2 pr-3 font-medium">Roles</th>
                <th className="text-left py-2 pr-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const detailObj = Object.fromEntries(
                  Object.entries(e).filter(([k]) => !['ts', 'action', 'tenant_id', 'roles'].includes(k))
                );
                const details = JSON.stringify(detailObj);
                return (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="py-2 pr-3 text-white/80">
                      {e.ts ? new Date(e.ts * 1000).toLocaleString() : ''}
                    </td>
                    <td className="py-2 pr-3 text-white/80">{e.action}</td>
                    <td className="py-2 pr-3 text-white/80">{e.tenant_id || ''}</td>
                    <td className="py-2 pr-3 text-white/70">{(e.roles || []).join(', ')}</td>
                    <td className="py-2 pr-3 text-white/70 font-mono max-w-[520px] truncate">{details}</td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-white/40">
                    No audit events yet.
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
