import type React from 'react';
import { useState } from 'react';
import { ProjectSettings } from '../features/settings/ProjectSettings';
import { PipelineSettings } from '../features/settings/PipelineSettings';
import { AiProviderSettings } from '../features/settings/AiProviderSettings';
import { AiRulesSettings } from '../features/settings/AiRulesSettings';
import { WebhookManager } from '../features/settings/WebhookManager';
import { MultiModelComparison } from '../features/settings/MultiModelComparison';

type SettingsTab = 'project' | 'pipeline' | 'ai' | 'rules' | 'webhooks' | 'testing';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { 
    id: 'project', 
    label: 'Project', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  },
  { 
    id: 'pipeline', 
    label: 'Pipeline', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  },
  { 
    id: 'ai', 
    label: 'AI Provider', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  { 
    id: 'rules', 
    label: 'Rules & Prompts', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  },
  { 
    id: 'webhooks', 
    label: 'Integrations', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  },
  { 
    id: 'testing', 
    label: 'Model Testing', 
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('project');

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Settings Navigation */}
      <div className="w-64 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white mb-4 px-3">Settings</h2>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === tab.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="max-w-3xl">
          <div className="animate-fade-in">
            {activeTab === 'project' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">Project Configuration</h3>
                  <ProjectSettings />
                </div>
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">Ingestion Pipeline</h3>
                  <PipelineSettings />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">AI Provider & Models</h3>
                  <AiProviderSettings />
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">Analysis Rules</h3>
                  <AiRulesSettings />
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">Webhooks & Events</h3>
                  <WebhookManager />
                </div>
              </div>
            )}

            {activeTab === 'testing' && (
              <div className="space-y-6">
                <div className="panel">
                  <h3 className="panel-title mb-4">Multi-Model Comparison</h3>
                  <MultiModelComparison />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
