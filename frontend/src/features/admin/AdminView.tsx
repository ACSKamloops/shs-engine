
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

import SectionTabs from './SectionTabs';
import { OverviewPanel } from './panels/OverviewPanel';
import { MetricsPanel } from './panels/MetricsPanel';
import { AuditPanel } from './panels/AuditPanel';
import { CodexHubPanel } from './panels/CodexHubPanel';
import CodexExecPanel from './panels/CodexExecPanel';
import CodexChatPanel from './panels/CodexChatPanel';
import WorkflowsPanel from './panels/WorkflowsPanel';
import AutorunPanel from './panels/AutorunPanel';
import PromptsPanel from './panels/PromptsPanel';
import CodexQueuesPanel from './panels/CodexQueuesPanel';
import { FlaggedPanel } from './panels/FlaggedPanel';
import { ContradictionsPanel } from './panels/ContradictionsPanel';
import { GraphPanel } from './panels/GraphPanel';
import { RefinedEvidencePanel } from './panels/RefinedEvidencePanel';
import { TimelinePanel } from './panels/TimelinePanel';
import { AdminMapPanel } from './panels/AdminMapPanel';
import { EngineTasksPanel } from './panels/EngineTasksPanel';
import { LogsPanel } from './panels/LogsPanel';
import { CliConsolePanel } from './panels/CliConsolePanel';
import { InteractiveTerminalPanel } from './panels/InteractiveTerminalPanel';

export function AdminView() {
  const { api, useLiveApi } = useApi();
  const [whoami, setWhoami] = useState<any | null>(null);

  const VALID_TABS = [
    'overview',
    'metrics',
    'audit',
    'codex',
    'exec',
    'chat',
    'workflows',
    'autorun',
    'prompts',
    'queues',
    'flagged',
    'contradictions',
    'graph',
    'refined',
    'timeline',
    'map',
    'tasks',
    'logs',
    'cli',
    'terminal',
  ];
  const [active, setActive] = useState('overview');

  useEffect(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab && VALID_TABS.includes(tab)) setActive(tab);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!useLiveApi) {
      setWhoami({ is_admin: true, roles: ['admin'], tenant: 'demo' });
      return;
    }
    api<any>('/whoami')
      .then((data) => setWhoami(data))
      .catch(() => setWhoami({ is_admin: false, roles: [], tenant: 'local' }));
  }, [api, useLiveApi]);

  if (whoami && !whoami.is_admin) {
    return (
      <main className="max-w-[1200px] mx-auto px-6 py-10 animate-fade-in-up">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Admin Access Required</h2>
          </div>
          <p className="text-sm text-white/80">
            Your roles ({(whoami.roles || []).join(', ') || 'none'}) do not include admin permissions.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1920px] mx-auto px-6 py-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-2">
          <SectionTabs active={active} onChange={setActive} />
        </div>
        <div className="lg:col-span-10">
          {active === 'overview' && <OverviewPanel />}
          {active === 'metrics' && <MetricsPanel />}
          {active === 'audit' && <AuditPanel />}
          {active === 'codex' && <CodexHubPanel />}
          {active === 'exec' && <CodexExecPanel />}
          {active === 'chat' && <CodexChatPanel />}
          {active === 'workflows' && <WorkflowsPanel />}
          {active === 'autorun' && <AutorunPanel />}
          {active === 'prompts' && <PromptsPanel />}
          {active === 'queues' && <CodexQueuesPanel />}
          {active === 'flagged' && <FlaggedPanel />}
          {active === 'contradictions' && <ContradictionsPanel />}
          {active === 'graph' && <GraphPanel />}
          {active === 'refined' && <RefinedEvidencePanel />}
          {active === 'timeline' && <TimelinePanel />}
          {active === 'map' && <AdminMapPanel />}
          {active === 'tasks' && <EngineTasksPanel />}
          {active === 'logs' && <LogsPanel />}
          {active === 'cli' && <CliConsolePanel />}
          {active === 'terminal' && <InteractiveTerminalPanel />}
        </div>
      </div>
    </main>
  );
}

export default AdminView;
