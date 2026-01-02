import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../../../hooks';
import { useAppStore, useCodexAdminStore } from '../../../store';
import { HelpText } from '../AdminUtils';

export function InteractiveTerminalPanel() {
  const apiBase = useAppStore((s) => s.apiBase);
  const apiKey = useAppStore((s) => s.apiKey);
  const useLiveApi = useAppStore((s) => s.useLiveApi);
  const setBanner = useAppStore((s) => s.setBanner);
  const codex = useCodexAdminStore();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [command, setCommand] = useState('');
  const [stdin, setStdin] = useState('');
  const [runId, setRunId] = useState<string | null>(null);
  const [output, setOutput] = useState('');

  const envOverrides = useMemo(
    () => ({
      PUKAIST_CODEX_PROFILE: codex.codexProfile,
      PUKAIST_CODEX_MODEL: codex.codexModel,
      PUKAIST_CODEX_EXEC_FLAGS: codex.codexExecFlags,
      PUKAIST_CODEX_LOG_EVENTS: codex.codexLogEvents ? '1' : '',
      PUKAIST_CODEX_LOG_DIR: codex.codexLogDir,
    }),
    [codex]
  );

  const connect = useCallback(() => {
    if (!useLiveApi) return;
    try {
      const base = apiBase.replace(/\/$/, '');
      const origin = base.startsWith('http') ? base : `${window.location.origin}${base}`;
      const wsOrigin = origin.replace(/^http/, 'ws');
      const wsUrl = `${wsOrigin}/admin/cli/ws?api_key=${encodeURIComponent(apiKey)}`;
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setSocket(null);
      };
      ws.onerror = () => {
        setBanner('WebSocket error');
        setConnected(false);
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'start') {
            setRunId(msg.run_id || null);
          }
          if (msg.type === 'line') {
            setOutput((o) => o + (msg.line || '') + '\n');
          }
          if (msg.type === 'end') {
            setBanner(`Process exited ${msg.exit_code}`);
            setRunId(null);
          }
          if (msg.type === 'error') {
            setBanner(`WS error: ${msg.error || 'unknown'}`);
          }
        } catch {
          // ignore
        }
      };
      setSocket(ws);
    } catch (err) {
      setBanner(`WS connect failed: ${(err as Error).message}`);
    }
  }, [apiBase, apiKey, setBanner, useLiveApi]);

  useEffect(() => {
    connect();
    return () => {
      try {
        socket?.close();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  const sendJson = (obj: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(obj));
  };

  const startCmd = () => {
    if (!command.trim()) return;
    setOutput('');
    sendJson({ type: 'start', command, env: envOverrides });
  };

  const sendInput = () => {
    if (!stdin.trim()) return;
    sendJson({ type: 'input', data: stdin });
    setStdin('');
  };

  const cancel = () => {
    sendJson({ type: 'cancel', run_id: runId });
  };

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Interactive Terminal (WebSocket)</h3>
          <div className="text-xs text-white/60">{connected ? 'connected' : 'disconnected'}</div>
          {!connected && (
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => connect()}>
              Reconnect
            </button>
          )}
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: terminal disabled.</p>}
        <HelpText>
          Bidirectional process runner (stdin/stdout). Commands are still allowlisted server-side; env overrides come from <span className="font-mono">Codex Exec Settings</span>.
        </HelpText>

        <div className="flex gap-2 mb-3">
          <input
            className="input flex-1"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="codex exec --profile pukaist_exec ..."
          />
          <button className="btn btn-primary btn-sm" disabled={!connected} onClick={startCmd}>
            Start
          </button>
          {runId && (
            <button className="btn btn-ghost btn-sm" onClick={cancel}>
              Cancel
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            className="input flex-1"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="stdin to running process"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendInput();
              }
            }}
          />
          <button className="btn btn-ghost btn-sm" disabled={!runId} onClick={sendInput}>
            Send
          </button>
          <button className="btn btn-ghost btn-sm" disabled={!runId} onClick={() => sendJson({ type: 'eof' })}>
            EOF
          </button>
        </div>

        <pre className="whitespace-pre-wrap text-xs text-white/80 max-h-[70vh] overflow-auto bg-black/40 rounded p-4 border border-white/5">
          {output || 'No output yet.'}
        </pre>
      </div>
    </div>
  );
}
