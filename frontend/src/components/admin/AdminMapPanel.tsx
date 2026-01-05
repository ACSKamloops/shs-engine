/**
 * Admin Map Panel - Interactive Map for Marker Management
 * Features: Drag-drop markers, click-to-add, layer display
 */
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapMarkersStore, type MapMarker } from '../../store/useMapMarkersStore';

interface AdminMapPanelProps {
  isPreviewMode: boolean;
  isAddingMarker: boolean;
}

// Secwepemcúl'ecw center
const TERRITORY_CENTER: [number, number] = [51.0, -120.0];
const TERRITORY_ZOOM = 7;

// Marker colors
const markerColors: Record<string, string> = {
  camp: '#059669',       // emerald
  project: '#d97706',    // amber
  partner: '#8b5cf6',    // violet
  'cultural-site': '#06b6d4', // cyan
  event: '#ef4444',      // red
};

const markerIcons: Record<string, string> = {
  camp: '⛺',
  project: '🏗️',
  partner: '🤝',
  'cultural-site': '🪶',
  event: '📅',
};

// Create marker icon
function createMarkerIcon(type: MapMarker['type'], isPublic: boolean): L.DivIcon {
  const color = markerColors[type] || '#6b7280';
  const icon = markerIcons[type] || '📍';
  const opacity = isPublic ? 1 : 0.6;
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid ${isPublic ? 'white' : '#fbbf24'};
        cursor: grab;
        opacity: ${opacity};
      ">${icon}</div>
    `,
    className: 'admin-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export function AdminMapPanel({ isPreviewMode, isAddingMarker }: AdminMapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const territoryLayerRef = useRef<L.LayerGroup | null>(null);
  const customLayersRef = useRef<L.LayerGroup | null>(null);

  const {
    markers,
    customLayers,
    selectedMarkerId,
    addMarker,
    moveMarker,
    selectMarker,
    setAddingMarker,
    getPublicMarkers,
  } = useMapMarkersStore();

  // Handle map click for adding markers
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isAddingMarker) return;
    
    const { lat, lng } = e.latlng;
    const newId = addMarker({
      lat,
      lng,
      title: 'New Marker',
      description: 'Click to edit details',
      type: 'camp',
      isPublic: false, // Start as private
    });
    
    selectMarker(newId);
    setAddingMarker(false);
  }, [isAddingMarker, addMarker, selectMarker, setAddingMarker]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(TERRITORY_CENTER, TERRITORY_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile layer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '&copy; Stadia Maps | Territory: Native-Land.ca',
    }).addTo(map);

    mapRef.current = map;
    customLayersRef.current = L.layerGroup().addTo(map);
    territoryLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Load territory
    fetch('/geo/secwepemc_territory.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        if (!territoryLayerRef.current) return;
        L.geoJSON(data, {
          style: {
            color: '#2d7351',
            weight: 3,
            fillColor: '#2d7351',
            fillOpacity: 0.1,
            dashArray: '8 4',
          },
        }).addTo(territoryLayerRef.current);
      })
      .catch(console.warn);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle click events
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.on('click', handleMapClick);
    
    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [handleMapClick]);

  // Update cursor style when adding marker
  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapContainerRef.current.style.cursor = isAddingMarker ? 'crosshair' : '';
  }, [isAddingMarker]);

  // Render markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;
    markersLayerRef.current.clearLayers();

    // In preview mode, only show public markers
    const displayMarkers = isPreviewMode ? getPublicMarkers() : markers;

    displayMarkers.forEach((marker) => {
      const icon = createMarkerIcon(marker.type, marker.isPublic);
      
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon,
        draggable: !isPreviewMode, // Only draggable in edit mode
      });

      // Tooltip
      leafletMarker.bindTooltip(
        `<strong>${marker.title}</strong><br/>${marker.isPublic ? 'Public' : 'Private'}`,
        { direction: 'top', offset: [0, -20] }
      );

      // Click to select
      leafletMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (!isPreviewMode) {
          selectMarker(marker.id);
        }
      });

      // Drag end - update position
      leafletMarker.on('dragend', () => {
        const pos = leafletMarker.getLatLng();
        moveMarker(marker.id, pos.lat, pos.lng);
      });

      // Highlight selected
      if (marker.id === selectedMarkerId && !isPreviewMode) {
        leafletMarker.setZIndexOffset(1000);
      }

      markersLayerRef.current?.addLayer(leafletMarker);
    });
  }, [markers, selectedMarkerId, isPreviewMode, getPublicMarkers, selectMarker, moveMarker]);

  // Render custom layers
  useEffect(() => {
    if (!customLayersRef.current) return;
    customLayersRef.current.clearLayers();

    // In preview mode, only show public layers
    const displayLayers = isPreviewMode 
      ? customLayers.filter(l => l.isPublic) 
      : customLayers;

    displayLayers.forEach((layer) => {
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
  }, [customLayers, isPreviewMode]);

  return (
    <div className="h-full w-full relative">
      <div
        ref={mapContainerRef}
        className="h-full w-full"
      />
      
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="absolute top-4 left-4 z-[1000] px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-lg">
          <span className="font-medium">Preview Mode</span>
          <span className="ml-2 text-emerald-100">Showing public view</span>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        .admin-marker {
          background: transparent !important;
          border: none !important;
        }
        .admin-marker:hover div {
          transform: scale(1.1);
          transition: transform 0.15s;
        }
      `}</style>
    </div>
  );
}
