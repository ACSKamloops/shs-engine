/**
 * Buffer Zone Draw
 * Draw circles with adjustable radius for buffer zone searches
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';

interface BufferZoneDrawProps {
  map: L.Map | null;
  onBufferChange: (center: [number, number] | null, radiusKm: number) => void;
}

export function BufferZoneDraw({ map, onBufferChange }: BufferZoneDrawProps) {
  const [active, setActive] = useState(false);
  const [radius, setRadius] = useState(10); // km
  const [center, setCenter] = useState<[number, number] | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!active || !map) return;

    const { lat, lng } = e.latlng;
    const newCenter: [number, number] = [lat, lng];
    setCenter(newCenter);

    // Remove existing
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add circle (radius in meters)
    circleRef.current = L.circle([lat, lng], {
      radius: radius * 1000,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.15,
      weight: 2,
      dashArray: '8 4',
    }).addTo(map);

    // Add center marker
    markerRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'buffer-center',
        html: '<div style="width:12px;height:12px;background:#f59e0b;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
      draggable: true,
    }).addTo(map);

    // Handle drag
    markerRef.current.on('dragend', () => {
      const pos = markerRef.current?.getLatLng();
      if (pos && circleRef.current) {
        circleRef.current.setLatLng(pos);
        const updatedCenter: [number, number] = [pos.lat, pos.lng];
        setCenter(updatedCenter);
        onBufferChange(updatedCenter, radius);
      }
    });

    onBufferChange(newCenter, radius);
  }, [active, map, radius, onBufferChange]);

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius * 1000);
      if (center) {
        onBufferChange(center, radius);
      }
    }
  }, [radius, center, onBufferChange]);

  // Map click listener
  useEffect(() => {
    if (!map) return;
    
    if (active) {
      map.on('click', handleMapClick);
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    };
  }, [map, active, handleMapClick]);

  const clearBuffer = useCallback(() => {
    if (map && circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (map && markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setCenter(null);
    onBufferChange(null, 0);
  }, [map, onBufferChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map && circleRef.current) {
        map.removeLayer(circleRef.current);
      }
      if (map && markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (active) {
            setActive(false);
            clearBuffer();
          } else {
            setActive(true);
          }
        }}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
          active
            ? 'bg-amber-500 text-white'
            : center
            ? 'bg-amber-500/30 text-amber-300'
            : 'bg-white/10 text-slate-300 hover:bg-white/20'
        }`}
      >
        ⭕ Buffer
      </button>
      
      {(active || center) && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={500}
            value={radius}
            onChange={(e) => setRadius(Math.max(1, Math.min(500, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 text-xs bg-white/10 border border-white/10 rounded text-white text-center"
          />
          <span className="text-xs text-white/50">km</span>
        </div>
      )}
      
      {center && (
        <button
          onClick={clearBuffer}
          className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default BufferZoneDraw;
