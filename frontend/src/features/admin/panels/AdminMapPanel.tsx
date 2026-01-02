import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { SHARED_THEME_KEY } from '../AdminUtils'; // We need to define this or just use string literal

// Helper for consistent theme key if not in Utils yet.
const MAP_THEME_KEY = 'pukaist-admin-theme';

export function AdminMapPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [docs, setDocs] = useState<any[]>([]);
  const [theme, setTheme] = useState<string>('');
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    try {
      const shared = localStorage.getItem(MAP_THEME_KEY);
      if (shared) setTheme(shared);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (theme) localStorage.setItem(MAP_THEME_KEY, theme);
      else localStorage.removeItem(MAP_THEME_KEY);
    } catch {
      // ignore
    }
  }, [theme]);

  const loadDocs = useCallback(async () => {
    if (!useLiveApi) return;
    try {
      const params = new URLSearchParams({ limit: '2000' });
      if (theme) params.set('theme', theme);
      if (label) params.set('label', label);
      const data = await api<{ docs: any[] }>(`/docs?${params.toString()}`);
      setDocs((data.docs || []).filter((d) => typeof d.lat === 'number' && typeof d.lng === 'number'));
    } catch (err) {
      setBanner(`Map docs load failed: ${(err as Error).message}`);
    }
  }, [api, label, setBanner, theme, useLiveApi]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([50.5, -121.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    for (const d of docs) {
      const icon = L.divIcon({
        className: d.user_relevance === 'relevant' ? 'marker-confirmed-high' : 'marker-confirmed-med',
        iconSize: [18, 18],
      });
      L.marker([d.lat, d.lng], { icon }).bindTooltip(d.title || String(d.id)).addTo(layer);
    }
  }, [docs]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Geo Map (Docs)</h3>
          <div className="flex items-center gap-2">
            <input
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Theme filter"
            />
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-xs"
            >
              <option value="">All</option>
              <option value="relevant">Relevant only</option>
            </select>
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void loadDocs()}>
              Apply
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: map disabled.</p>}
        <div ref={containerRef} className="w-full h-[70vh] rounded-lg overflow-hidden border border-white/5" />
      </div>
    </div>
  );
}
