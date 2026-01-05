/**
 * TerritoryMap Component - Public Interactive Territory Map
 * Modern 2025 implementation with Leaflet
 * Features: Project markers, cultural sites, layer controls, location info
 * Data: Native-Land.ca official territory boundaries
 * Markers: Read from useMapMarkersStore (admin-managed)
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapMarkersStore, type MapMarker } from '../../store/useMapMarkersStore';

// Re-export type for local use (optional fields from store may differ)

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  description?: string;
}

// Secwepemcúl̓ecw territory center
const TERRITORY_CENTER: [number, number] = [51.0, -120.0];
const TERRITORY_ZOOM = 7;

// Note: Markers are now managed via useMapMarkersStore
// Admin can add/edit markers at /admin/map


// Available map layers
const defaultLayers: MapLayer[] = [
  { id: 'territory', name: 'Secwepemcúl̓ecw Territory', visible: true, color: '#2d7351', description: 'Secwépemc traditional territory (FPCC)' },
  { id: 'communities', name: 'Secwépemc Communities', visible: true, color: '#e11d48', description: '12 band communities (FPCC)' },
  { id: 'projects', name: 'SHS Projects & Camps', visible: true, color: '#d97706', description: 'Active program locations' },
  { id: 'cultural', name: 'Cultural Sites', visible: false, color: '#06b6d4', description: 'Significant cultural locations' },
];

// Marker icon factory
function createMarkerIcon(type: MapMarker['type']): L.DivIcon {
  const colors: Record<string, string> = {
    project: '#d97706',
    camp: '#059669',
    'cultural-site': '#06b6d4',
    partner: '#8b5cf6',
    event: '#ef4444',
  };
  
  const icons: Record<string, string> = {
    project: '🏗️',
    camp: '⛺',
    'cultural-site': '🪶',
    partner: '🤝',
    event: '📅',
  };
  
  return L.divIcon({
    html: `
      <div style="
        background: ${colors[type]};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        cursor: pointer;
      ">${icons[type]}</div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

// Layer control component
function LayerControl({ 
  layers, 
  onToggle 
}: { 
  layers: MapLayer[]; 
  onToggle: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-shs-stone overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-shs-forest-600 text-white"
      >
        <span className="font-semibold text-sm">Map Layers</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-4 space-y-3">
          {layers.map((layer) => (
            <label key={layer.id} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onToggle(layer.id)}
                className="mt-0.5 w-4 h-4 rounded border-shs-stone text-shs-forest-600 focus:ring-shs-forest-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-sm font-medium text-shs-forest-800 group-hover:text-shs-forest-600">
                    {layer.name}
                  </span>
                </div>
                {layer.description && (
                  <p className="text-xs text-shs-text-muted mt-0.5 pl-5">
                    {layer.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Selected location info panel - Enhanced with camp details
function LocationInfo({ 
  marker, 
  onClose 
}: { 
  marker: MapMarker | null; 
  onClose: () => void;
}) {
  if (!marker) return null;

  const typeLabels: Record<string, string> = {
    project: 'Project Site',
    camp: 'Cultural Camp',
    'cultural-site': 'Cultural Site',
    partner: 'Partner',
    event: 'Event Location',
  };

  const typeColors: Record<string, string> = {
    project: 'bg-amber-100 text-amber-700',
    camp: 'bg-emerald-100 text-emerald-700',
    'cultural-site': 'bg-cyan-100 text-cyan-700',
    partner: 'bg-violet-100 text-violet-700',
    event: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-shs-stone overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[400px] overflow-y-auto">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${typeColors[marker.type]}`}>
              {marker.campType || typeLabels[marker.type]}
            </span>
            <h3 className="text-lg font-bold text-shs-forest-800 leading-tight">{marker.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-shs-text-muted hover:text-shs-forest-600 hover:bg-shs-sand rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Season & Duration for camps */}
        {(marker.season || marker.duration) && (
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-shs-text-muted">
            {marker.season && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {marker.season}
              </span>
            )}
            {marker.duration && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {marker.duration}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {marker.description && (
          <p className="text-sm text-shs-text-body mb-4 leading-relaxed">{marker.description}</p>
        )}

        {/* Activities list for camps */}
        {marker.activities && marker.activities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-shs-forest-700 uppercase tracking-wide mb-2">
              What You'll Learn
            </div>
            <div className="flex flex-wrap gap-1.5">
              {marker.activities.map((activity, i) => (
                <span 
                  key={i} 
                  className="inline-block px-2 py-1 bg-shs-sand text-shs-forest-700 text-xs rounded-md"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        {marker.link && (
          <a
            href={marker.link}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-shs-forest-600 text-white text-sm font-semibold rounded-lg hover:bg-shs-forest-700 transition-colors w-full justify-center"
          >
            {marker.type === 'camp' ? 'View Camp Details' : 'Learn More'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// Main Territory Map Component
export function TerritoryMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const territoryLayerRef = useRef<L.LayerGroup | null>(null);
  const communitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const customLayersRef = useRef<L.LayerGroup | null>(null);
  
  // Get markers from store using stable selectors (prevents re-renders)
  const allMarkers = useMapMarkersStore((state) => state.markers);
  const allCustomLayers = useMapMarkersStore((state) => state.customLayers);
  
  // Memoize filtered results to prevent new arrays on every render
  const markers = useMemo(() => allMarkers.filter((m) => m.isPublic), [allMarkers]);
  const customLayers = useMemo(() => allCustomLayers.filter((l) => l.isPublic), [allCustomLayers]);
  
  const [layers, setLayers] = useState(defaultLayers);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true, // Use canvas renderer for better pan/zoom performance
      zoomAnimation: true, // Smooth zoom animations (CSS override prevents lag)
      markerZoomAnimation: true, // Markers animate with zoom
      inertia: true, // Smooth pan momentum
      inertiaDeceleration: 3000, // Faster deceleration for snappier feel
      easeLinearity: 0.25, // Smoother easing
    }).setView(TERRITORY_CENTER, TERRITORY_ZOOM);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Beautiful tile layer - Stadia outdoors for nature focus
    L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      updateWhenZooming: false, // Don't update tiles while zooming
      updateWhenIdle: true, // Only update when pan/zoom stops
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> | Territory data: <a href="https://native-land.ca">Native-Land.ca</a>',
    }).addTo(map);

    mapRef.current = map;
    customLayersRef.current = L.layerGroup().addTo(map);
    communitiesLayerRef.current = L.layerGroup().addTo(map);
    territoryLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers based on layer visibility
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const projectsVisible = layers.find((l) => l.id === 'projects')?.visible;
    const partnersVisible = layers.find((l) => l.id === 'partners')?.visible;
    const culturalVisible = layers.find((l) => l.id === 'cultural')?.visible;

    markers.forEach((marker) => {
      if (marker.type === 'partner' && !partnersVisible) return;
      if ((marker.type === 'project' || marker.type === 'camp') && !projectsVisible) return;
      if (marker.type === 'cultural-site' && !culturalVisible) return;

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createMarkerIcon(marker.type),
      });

      leafletMarker.on('click', () => {
        setSelectedMarker(marker);
        mapRef.current?.panTo([marker.lat, marker.lng], { animate: true });
      });

      leafletMarker.bindTooltip(marker.title, {
        direction: 'top',
        offset: [0, -20],
        className: 'custom-tooltip',
      });

      markersLayerRef.current?.addLayer(leafletMarker);
    });
  }, [layers, markers]);

  // Render custom layers from store
  useEffect(() => {
    if (!customLayersRef.current) return;
    customLayersRef.current.clearLayers();

    customLayers.forEach((layer) => {
      L.geoJSON(layer.geojson, {
        style: {
          color: layer.color || '#6b7280',
          weight: 2,
          fillColor: layer.color || '#6b7280',
          fillOpacity: layer.opacity ?? 0.2,
        },
        onEachFeature: (feature, leafletLayer) => {
          const name = feature.properties?.name || feature.properties?.Name || layer.name;
          leafletLayer.bindTooltip(name);
        },
      }).addTo(customLayersRef.current!);
    });
  }, [customLayers]);

  // Load Secwepemcúl'ecw territory boundary
  useEffect(() => {
    if (!territoryLayerRef.current || !mapRef.current) return;
    
    performance.mark('territory-layer-start');
    territoryLayerRef.current.clearLayers();

    const territoryVisible = layers.find((l) => l.id === 'territory')?.visible;
    if (!territoryVisible) {
      setIsLoading(false);
      return;
    }

    fetch('/geo/secwepemc_territory_fpcc.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        if (!territoryLayerRef.current) return;
        
        performance.mark('territory-render-start');
        
        L.geoJSON(data, {
          style: {
            color: '#2d7351',
            weight: 3,
            fillColor: '#2d7351',
            fillOpacity: 0.12,
            dashArray: '8 4',
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.Name || "Secwepemcúl'ecw (Secwépemc)";
            layer.bindTooltip(name, { 
              direction: 'center', 
              className: 'custom-tooltip',
            });
            
            layer.on('click', () => {
              const bounds = (layer as L.Polygon).getBounds?.();
              if (bounds?.isValid()) {
                mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
              }
            });
          },
        }).addTo(territoryLayerRef.current);
        
        performance.mark('territory-render-end');
        performance.measure('territory-render', 'territory-render-start', 'territory-render-end');
        console.log('[Perf] Territory layer rendered:', performance.getEntriesByName('territory-render').pop()?.duration.toFixed(2), 'ms');
        
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load territory GeoJSON:', err);
        setIsLoading(false);
      });
  }, [layers]);



  // Load Secwépemc communities (FPCC data)
  useEffect(() => {
    if (!communitiesLayerRef.current || !mapRef.current) return;
    
    performance.mark('communities-layer-start');
    communitiesLayerRef.current.clearLayers();

    const communitiesVisible = layers.find((l) => l.id === 'communities')?.visible;
    if (!communitiesVisible) {
      performance.mark('communities-layer-hidden');
      return;
    }

    fetch('/geo/secwepemc_communities.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        if (!communitiesLayerRef.current) return;
        
        performance.mark('communities-render-start');
        
        L.geoJSON(data, {
          pointToLayer: (_feature, latlng) => {
            // Create distinctive community markers
            const icon = L.divIcon({
              html: `
                <div style="
                  background: #e11d48;
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
                  border: 3px solid white;
                  cursor: pointer;
                ">🏠</div>
              `,
              className: 'custom-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16],
            });
            return L.marker(latlng, { icon });
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.name || 'Unknown Community';
            layer.bindTooltip(name, {
              direction: 'top',
              className: 'custom-tooltip',
              offset: [0, -16],
            });
          },
        }).addTo(communitiesLayerRef.current);
        
        performance.mark('communities-render-end');
        performance.measure('communities-render', 'communities-render-start', 'communities-render-end');
        console.log('[Perf] Communities layer rendered:', performance.getEntriesByName('communities-render')[0]?.duration.toFixed(2), 'ms');
      })
      .catch((err) => {
        console.warn('Failed to load communities GeoJSON:', err);
      });
  }, [layers]);

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-shs-cream flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-shs-forest-200 border-t-shs-forest-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shs-text-muted">Loading territory data...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-xl overflow-hidden"
        style={{ minHeight: '500px' }}
      />

      {/* Layer controls - top left */}
      <div className="absolute top-4 left-4 z-[1000] w-64">
        <LayerControl layers={layers} onToggle={toggleLayer} />
      </div>

      {/* Selected location info - bottom left */}
      <div className="absolute bottom-4 left-4 z-[1000] w-80">
        <LocationInfo
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      </div>

      {/* Legend - bottom right */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-shs-stone">
          <div className="text-xs font-semibold text-shs-forest-700 mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span>🏠</span>
              <span className="text-shs-text-body">Band Community</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>⛺</span>
              <span className="text-shs-text-body">Cultural Camp</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>🏗️</span>
              <span className="text-shs-text-body">Project Site</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>🤝</span>
              <span className="text-shs-text-body">Partner</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>🪶</span>
              <span className="text-shs-text-body">Cultural Site</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom styles */}
      <style>{`
        .custom-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 8px 12px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #1c1917;
        }
        .custom-tooltip::before {
          border-top-color: rgba(255, 255, 255, 0.95) !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
