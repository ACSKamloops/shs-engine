/**
 * Heatmap Layer Overlay
 * Shows document density as a heatmap on the map
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  map: L.Map | null;
}

// Extend Leaflet types for heat layer
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

export function HeatmapLayer({ map }: HeatmapLayerProps) {
  const heatLayerRef = useRef<L.Layer | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleHeatmap = useCallback(async () => {
    if (!map) return;

    if (enabled && heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
      setEnabled(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all geo points
      const res = await fetch('/geo/geojson', {
        headers: { 'X-API-Key': localStorage.getItem('apiKey') || 'dev-token' },
      });
      if (!res.ok) throw new Error('Failed');
      const geojson = await res.json();

      // Extract coordinates
      const points: Array<[number, number, number]> = [];
      for (const feature of geojson.features || []) {
        const coords = feature.geometry?.coordinates;
        if (coords && feature.geometry?.type === 'Point') {
          // GeoJSON is [lon, lat], heat needs [lat, lon, intensity]
          points.push([coords[1], coords[0], 1]);
        }
      }

      if (points.length === 0) {
        console.warn('No points for heatmap');
        return;
      }

      // Create heat layer
      const heat = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: '#06b6d4',
          0.6: '#8b5cf6',
          0.8: '#f59e0b',
          1.0: '#ef4444',
        },
      });

      heat.addTo(map);
      heatLayerRef.current = heat;
      setEnabled(true);
    } catch (error) {
      console.error('Heatmap load failed:', error);
    } finally {
      setLoading(false);
    }
  }, [map, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map]);

  return (
    <button
      onClick={toggleHeatmap}
      disabled={loading}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
        enabled
          ? 'bg-orange-500 text-white'
          : 'bg-white/10 text-slate-300 hover:bg-white/20'
      }`}
    >
      {loading ? '⏳' : '🔥'} Heatmap
    </button>
  );
}

export default HeatmapLayer;
