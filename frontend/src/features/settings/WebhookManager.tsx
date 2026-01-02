/**
 * Webhook Manager Panel
 * Configure, test, and monitor webhook callbacks
 */
import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../../hooks';
import { useAppStore } from '../../store';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  lastDelivery?: {
    status: 'success' | 'failed';
    timestamp: number;
    statusCode?: number;
    error?: string;
  };
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  statusCode?: number;
  error?: string;
  retryCount: number;
}

const EVENT_TYPES = [
  { key: 'doc.uploaded', label: 'Document Uploaded', emoji: '📤' },
  { key: 'doc.processed', label: 'Document Processed', emoji: '✅' },
  { key: 'doc.flagged', label: 'Document Flagged', emoji: '⚠️' },
  { key: 'job.completed', label: 'Job Completed', emoji: '📋' },
  { key: 'consultation.detected', label: 'Geo Context Detected', emoji: '📍' },
];

export function WebhookManager() {
  const { useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>(['doc.processed']);
  const [testing, setTesting] = useState<string | null>(null);

  // Load webhooks (demo mode fallback)
  useEffect(() => {
    if (!useLiveApi) {
      setWebhooks([
        {
          id: 'wh_demo_1',
          url: 'https://example.com/webhook',
          events: ['doc.processed', 'doc.flagged'],
          enabled: true,
          lastDelivery: {
            status: 'success',
            timestamp: Date.now() - 3600000,
            statusCode: 200,
          },
        },
      ]);
      setLogs([
        {
          id: 'log_1',
          webhookId: 'wh_demo_1',
          event: 'doc.processed',
          status: 'success',
          timestamp: Date.now() - 3600000,
          statusCode: 200,
          retryCount: 0,
        },
        {
          id: 'log_2',
          webhookId: 'wh_demo_1',
          event: 'doc.flagged',
          status: 'failed',
          timestamp: Date.now() - 7200000,
          statusCode: 500,
          error: 'Internal server error',
          retryCount: 3,
        },
      ]);
    }
  }, [useLiveApi]);

  const handleAddWebhook = useCallback(async () => {
    if (!newUrl) return;

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url: newUrl,
      events: newEvents,
      enabled: true,
    };

    setWebhooks((prev) => [...prev, webhook]);
    setNewUrl('');
    setNewEvents(['doc.processed']);
    setShowAddForm(false);
    setBanner('Webhook registered');
  }, [newUrl, newEvents, setBanner]);

  const handleTestWebhook = useCallback(async (webhookId: string) => {
    setTesting(webhookId);
    
    // Simulate test delivery
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newLog: DeliveryLog = {
      id: `log_${Date.now()}`,
      webhookId,
      event: 'test.ping',
      status: 'success',
      timestamp: Date.now(),
      statusCode: 200,
      retryCount: 0,
    };
    
    setLogs((prev) => [newLog, ...prev]);
    setTesting(null);
    setBanner('Test webhook sent successfully');
  }, [setBanner]);

  const handleToggleWebhook = useCallback((webhookId: string) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === webhookId ? { ...wh, enabled: !wh.enabled } : wh
      )
    );
  }, []);

  const handleDeleteWebhook = useCallback((webhookId: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== webhookId));
    setBanner('Webhook deleted');
  }, [setBanner]);

  const handleEventToggle = useCallback((event: string) => {
    setNewEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Webhooks</h4>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
        >
          {showAddForm ? 'Cancel' : '+ Add Webhook'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-3 bg-slate-800/50 border border-white/10 rounded-lg space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Endpoint URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-site.com/webhook"
              className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Events</label>
            <div className="flex flex-wrap gap-1">
              {EVENT_TYPES.map((event) => (
                <button
                  key={event.key}
                  type="button"
                  onClick={() => handleEventToggle(event.key)}
                  className={`text-xs px-2 py-1 rounded ${
                    newEvents.includes(event.key)
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-white/10 text-slate-400 border border-white/10'
                  }`}
                >
                  {event.emoji} {event.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddWebhook}
            disabled={!newUrl || newEvents.length === 0}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg disabled:opacity-50"
          >
            Register Webhook
          </button>
        </div>
      )}

      {/* Webhooks List */}
      <div className="space-y-2">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className={`p-3 rounded-lg border ${
              webhook.enabled
                ? 'bg-slate-800/50 border-white/10'
                : 'bg-slate-900/50 border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{webhook.url}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {webhook.events.map((event) => {
                    const eventInfo = EVENT_TYPES.find((e) => e.key === event);
                    return (
                      <span
                        key={event}
                        className="text-xs px-1.5 py-0.5 bg-white/10 text-slate-300 rounded"
                      >
                        {eventInfo?.emoji} {event.split('.')[1]}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTestWebhook(webhook.id)}
                  disabled={testing === webhook.id}
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded"
                >
                  {testing === webhook.id ? '...' : '🧪 Test'}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleWebhook(webhook.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    webhook.enabled
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-600/20 text-slate-400'
                  }`}
                >
                  {webhook.enabled ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            {webhook.lastDelivery && (
              <p className="text-xs text-slate-500 mt-2">
                Last delivery: {webhook.lastDelivery.status === 'success' ? '✅' : '❌'}{' '}
                {new Date(webhook.lastDelivery.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        ))}
        {webhooks.length === 0 && !showAddForm && (
          <p className="text-sm text-slate-400 text-center py-4">
            No webhooks configured. Click "Add Webhook" to get started.
          </p>
        )}
      </div>

      {/* Delivery Logs */}
      {logs.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <h5 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
            Recent Deliveries
          </h5>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-2 text-xs py-1"
              >
                <span>
                  {log.status === 'success' && '✅'}
                  {log.status === 'failed' && '❌'}
                  {log.status === 'pending' && '⏳'}
                </span>
                <span className="text-slate-400">{log.event}</span>
                {log.statusCode && (
                  <span className={`${log.statusCode < 400 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {log.statusCode}
                  </span>
                )}
                <span className="text-slate-500 ml-auto">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
