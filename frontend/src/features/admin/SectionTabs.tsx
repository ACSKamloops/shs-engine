
export default function SectionTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'metrics', label: 'Metrics' },
    { key: 'audit', label: 'Audit Trail' },
    { key: 'codex', label: 'Codex Hub' },
    { key: 'exec', label: 'Codex Exec' },
    { key: 'chat', label: 'Codex Chat' },
    { key: 'workflows', label: 'Workflows' },
    { key: 'autorun', label: 'Auto-Run' },
    { key: 'prompts', label: 'Prompts' },
    { key: 'queues', label: 'Codex Queues' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'contradictions', label: 'Contradictions' },
    { key: 'graph', label: 'Graph' },
    { key: 'refined', label: 'Refined Evidence' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'map', label: 'Map' },
    { key: 'tasks', label: 'Engine Tasks' },
    { key: 'logs', label: 'Logs' },
    { key: 'cli', label: 'CLI Console' },
    { key: 'terminal', label: 'Interactive Terminal' },
  ];
  return (
    <div className="panel space-y-2">
      <div className="panel-header">
        <h2 className="panel-title">Admin</h2>
      </div>
      <div className="flex flex-col gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-2 rounded-lg text-left text-sm transition-all ${
              active === t.key
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
