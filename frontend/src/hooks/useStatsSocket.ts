/**
 * useStatsSocket hook
 * Real-time connection to /ws/stats for live dashboard updates
 */
import { useEffect, useState, useRef, useCallback } from 'react';

interface ProcessingStatus {
  pending: number;
  done: number;
  flagged: number;
  processing: number;
}

interface StatsUpdate {
  type: 'update';
  processing_status: ProcessingStatus;
  total_docs: number;
  ts: number;
}

interface UseStatsSocketReturn {
  status: ProcessingStatus | null;
  totalDocs: number | null;
  connected: boolean;
  lastUpdate: number | null;
}

export function useStatsSocket(enabled = true): UseStatsSocketReturn {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [totalDocs, setTotalDocs] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    const apiKey = localStorage.getItem('apiKey') || 'dev-token';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/stats?api_key=${apiKey}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('Stats WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: StatsUpdate = JSON.parse(event.data);
          if (data.type === 'update') {
            setStatus(data.processing_status);
            setTotalDocs(data.total_docs);
            setLastUpdate(data.ts);
          }
        } catch (e) {
          console.warn('Failed to parse stats update:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = window.setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        setConnected(false);
      };
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  }, [enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        // Only send stop if WebSocket is open
        if (wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
          } catch {
            // Ignore send errors during cleanup
          }
        }
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return { status, totalDocs, connected, lastUpdate };
}

export default useStatsSocket;
