import { useState, useEffect } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';

export function RefinedEvidencePanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState<string>('');

  const loadFiles = async () => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ files: { name: string; path: string }[] }>('/admin/codex/refined/files');
      setFiles(data.files || []);
      if (!selected && data.files?.length) setSelected(data.files[0].name);
    } catch (err) {
      setBanner(`Refined files load failed: ${(err as Error).message}`);
    }
  };

  const loadText = async (name: string) => {
    if (!useLiveApi) return;
    try {
      const data = await api<{ text: string }>(
        `/admin/codex/refined/text?name=${encodeURIComponent(name)}`
      );
      setText(data.text || '');
    } catch (err) {
      setBanner(`Refined text load failed: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    void loadFiles();
  }, []);

  useEffect(() => {
    if (selected) void loadText(selected);
  }, [selected]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Refined Evidence Files</h3>
          <button className="btn btn-ghost btn-sm text-xs" onClick={() => void loadFiles()}>
            Refresh
          </button>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: refined viewer disabled.</p>}
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <button
              key={f.name}
              className={`btn btn-sm ${selected === f.name ? 'btn-primary' : 'btn-ghost'} text-xs`}
              onClick={() => setSelected(f.name)}
            >
              {f.name}
            </button>
          ))}
          {files.length === 0 && <span className="text-xs text-white/50">No refined files yet.</span>}
        </div>
      </div>

      {selected && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">{selected}</h3>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-[70vh] overflow-auto bg-black/40 rounded p-4 border border-white/5">
            {text || 'Empty'}
          </pre>
        </div>
      )}
    </div>
  );
}
