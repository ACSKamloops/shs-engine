/**
 * AOI Layer Overlay
 * Shows treaty, reserve, and SOI boundaries on the map with click-to-filter
 */
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';

interface AOILayerProps {
  map: L.Map | null;
  onAOISelect?: (aoiCode: string, aoiTheme: string) => void;
}

const LAYER_COLORS = {
  Modern_Treaty: '#8b5cf6',
  BC_SOI: '#06b6d4',
  ALC_Confirmed: '#10b981',
  Reserve: '#f59e0b',
};

type ThemeKey = keyof typeof LAYER_COLORS;

export function AOILayerOverlay({ map, onAOISelect }: AOILayerProps) {
  const [layers, setLayers] = useState<Record<string, L.GeoJSON>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({
    Modern_Treaty: false,
    BC_SOI: false,
    ALC_Confirmed: false,
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleLayer = useCallback(async (theme: ThemeKey) => {
    if (!map) return;

    if (visible[theme]) {
      // Hide layer
      if (layers[theme]) {
        map.removeLayer(layers[theme]);
      }
      setVisible((v) => ({ ...v, [theme]: false }));
      return;
    }

    // Load and show layer
    if (layers[theme]) {
      map.addLayer(layers[theme]);
      setVisible((v) => ({ ...v, [theme]: true }));
      return;
    }

    // Fetch GeoJSON
    setLoading((l) => ({ ...l, [theme]: true }));
    try {
      const res = await fetch(`/geo/aoi?theme=${theme}`, {
        headers: { 'X-API-Key': localStorage.getItem('apiKey') || 'dev-token' },
      });
      if (!res.ok) throw new Error('Failed to load AOI');
      const geojson = await res.json();

      const layer = L.geoJSON(geojson, {
        style: {
          color: LAYER_COLORS[theme],
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.15,
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          const name = props.name || props.NAME || 'Unknown';
          const code = props.alcode || props.tag_id || props.soi_id || '';
          
          layer.bindPopup(`
            <div style="font-family: system-ui; padding: 4px;">
              <strong>${name}</strong><br/>
              <span style="color: #64748b">${theme}</span>
              ${code ? `<br/><code>${code}</code>` : ''}
            </div>
          `);

          layer.on('click', () => {
            if (onAOISelect && code) {
              onAOISelect(code, theme);
            }
          });
        },
      });

      layer.addTo(map);
      setLayers((l) => ({ ...l, [theme]: layer }));
      setVisible((v) => ({ ...v, [theme]: true }));
    } catch (error) {
      console.error(`Failed to load ${theme}:`, error);
    } finally {
      setLoading((l) => ({ ...l, [theme]: false }));
    }
  }, [map, layers, visible, onAOISelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(layers).forEach((layer) => {
        if (map) map.removeLayer(layer);
      });
    };
  }, [map, layers]);

  return (
    <div className="absolute top-3 left-3 z-[1000] bg-slate-800/90 backdrop-blur border border-white/10 rounded-lg p-2">
      <h5 className="text-xs font-semibold text-white/80 mb-2">AOI Layers</h5>
      <div className="space-y-1">
        {(Object.keys(LAYER_COLORS) as ThemeKey[]).map((theme) => (
          <label
            key={theme}
            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
          >
            <input
              type="checkbox"
              checked={visible[theme] || false}
              onChange={() => toggleLayer(theme)}
              disabled={loading[theme]}
              className="rounded border-slate-600"
            />
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: LAYER_COLORS[theme] }}
            />
            {theme.replace(/_/g, ' ')}
            {loading[theme] && <span className="animate-spin">⏳</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

export default AOILayerOverlay;
