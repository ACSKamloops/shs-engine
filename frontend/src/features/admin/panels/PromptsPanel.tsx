
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../../store';
import { useApi } from '../../../hooks/useApi';
import { HelpText } from '../AdminUtils';

export default function PromptsPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [prompts, setPrompts] = useState<{ name: string; path: string; exists: boolean }[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [content, setContent] = useState('');
  const [versions, setVersions] = useState<{ file: string; mtime: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ prompts: any[] }>('/admin/codex/prompts');
      setPrompts(data.prompts || []);
      if (!selected && data.prompts?.length) {
        setSelected(data.prompts[0].name);
      }
    } catch (err) {
      setBanner(`Prompts load failed: ${(err as Error).message}`);
    }
  }, [api, selected, setBanner, useLiveApi]);

  const loadPrompt = useCallback(
    async (name: string) => {
      if (!useLiveApi || !name) return;
      try {
        const data = await api<{ content: string }>(`/admin/codex/prompts/${encodeURIComponent(name)}`);
        setContent(data.content || '');
      } catch (err) {
        setBanner(`Prompt load failed: ${(err as Error).message}`);
      }
      try {
        const v = await api<{ versions: any[] }>(
          `/admin/codex/prompts/${encodeURIComponent(name)}/versions`
        );
        setVersions(v.versions || []);
      } catch {
        setVersions([]);
      }
    },
    [api, setBanner, useLiveApi]
  );

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selected) void loadPrompt(selected);
  }, [selected, loadPrompt]);

  const save = async () => {
    if (!useLiveApi || !selected) return;
    setSaving(true);
    try {
      await api(`/admin/codex/prompts/${encodeURIComponent(selected)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setBanner('Prompt saved (versioned)');
      await loadPrompt(selected);
    } catch (err) {
      setBanner(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const restore = async (file: string) => {
    if (!useLiveApi || !selected) return;
    try {
      await api(`/admin/codex/prompts/${encodeURIComponent(selected)}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file }),
      });
      setBanner(`Restored ${file}`);
      await loadPrompt(selected);
    } catch (err) {
      setBanner(`Restore failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Prompt / Playbook Manager</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void loadList()}>
            Refresh
          </button>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: prompt editor disabled.</p>}
        <HelpText>
          These files are the “templates” used by Codex exec/chat. Saving creates a version snapshot so you can roll back.
        </HelpText>
        <div className="flex gap-2 mb-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
          >
            {prompts.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm text-xs" disabled={saving} onClick={() => void save()}>
            Save
          </button>
        </div>
        <textarea
          className="input w-full min-h-[45vh] font-mono text-xs"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Versions</h3>
        </div>
        <div className="space-y-1 text-xs max-h-72 overflow-auto">
          {versions.map((v) => (
            <div key={v.file} className="flex items-center justify-between glass p-2">
              <div className="text-white/80">{v.file}</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-white/50">
                  {new Date(v.mtime * 1000).toLocaleString()}
                </div>
                <button className="btn btn-ghost btn-sm text-[10px]" onClick={() => void restore(v.file)}>
                  Restore
                </button>
              </div>
            </div>
          ))}
          {versions.length === 0 && <div className="text-white/40">No versions yet.</div>}
        </div>
      </div>
    </div>
  );
}
