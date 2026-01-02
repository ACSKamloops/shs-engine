/**
 * Map Panel Component
 * Leaflet map with document markers, AOI, POI, and suggestions layers
 */
import type React from 'react';
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDocsStore, useMapStore, useWizardStore } from '../../store';
import { useApi } from '../../hooks';
import { getConsultationContext, formatConsultationSummary } from '../../utils/geoAnalysis';
import { HeatmapLayer } from './HeatmapLayer';
import { DrawFilter } from './DrawFilter';
import { BufferZoneDraw } from './BufferZoneDraw';

// Local geo cache layers served via API
const LAYER_KEYS = [
  'bc_territories',
  'bc_languages',
  'bc_treaties',
  'bc_interior_watersheds',
];
const POI_LAYER = 'bc_first_nations_locations';

interface MapPanelProps {
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

export const MapPanel: React.FC<MapPanelProps> = ({ sectionRef }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const docsLayerRef = useRef<L.LayerGroup | null>(null);
  const aoiLayerRef = useRef<L.LayerGroup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const suggestionsLayerRef = useRef<L.LayerGroup | null>(null);

  // Drag-drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [overlapMessage, setOverlapMessage] = useState<string | null>(null);

  // API
  const { loadSuggestions, acceptSuggestion, rejectSuggestion, addCoord, updateCoord, fetchGeoLayer, useLiveApi } =
    useApi();

  // Store actions for updating doc location  
  const updateDocLocation = useDocsStore((s) => s.updateDocLocation);


  // Store state
  const docs = useDocsStore((s) => s.docs);
  const selectedId = useDocsStore((s) => s.selectedId);
  const setSelectedId = useDocsStore((s) => s.setSelectedId);

  const showDocs = useMapStore((s) => s.showDocs);
  const showSuggestions = useMapStore((s) => s.showSuggestions);
  const setShowSuggestions = useMapStore((s) => s.setShowSuggestions);
  const showAoi = useMapStore((s) => s.showAoi);
  const showPoi = useMapStore((s) => s.showPoi);
  const dimOutOfFrame = useMapStore((s) => s.dimOutOfFrame);
  const aoiGeojson = useMapStore((s) => s.aoiGeojson);
  const poiGeojson = useMapStore((s) => s.poiGeojson);
  const setAoiGeojson = useMapStore((s) => s.setAoiGeojson);
  const setPoiGeojson = useMapStore((s) => s.setPoiGeojson);
  const suggestions = useMapStore((s) => s.suggestions);
  const aoiLayerVisibility = useMapStore((s) => s.aoiLayerVisibility);

  const wizardFields = useWizardStore((s) => s.fields);
  const applyFrame = useWizardStore((s) => s.applyFrame);

  // Filter docs with coordinates
  const docsWithCoords = useMemo(
    () => docs.filter((d) => typeof d.lat === 'number' && typeof d.lng === 'number'),
    [docs]
  );

  // Map docs based on frame
  const mapDocs = useMemo(() => {
    let base = docsWithCoords;
    if (applyFrame) {
      const start = parseInt(wizardFields.periodStart, 10);
      const end = parseInt(wizardFields.periodEnd, 10);
      const hasValidPeriod = !isNaN(start) && !isNaN(end) && start > 0 && end > 0;
      const hasTheme = wizardFields.theme && wizardFields.theme.trim().length > 0;
      
      // Only filter if at least one filter value is set
      if (hasTheme || hasValidPeriod) {
        base = base.filter((d) => {
          let ok = true;
          if (hasTheme) {
            ok = ok && (d.theme || '').toLowerCase().includes(wizardFields.theme.toLowerCase());
          }
          if (hasValidPeriod && d.created_at) {
            const year = new Date(d.created_at * 1000).getFullYear();
            ok = ok && year >= start && year <= end;
          }
          return ok;
        });
      }
    }
    return base;
  }, [applyFrame, docsWithCoords, wizardFields.periodEnd, wizardFields.periodStart, wizardFields.theme]);

  // Load suggestions when selected doc changes
  useEffect(() => {
    if (selectedId) {
      void loadSuggestions(selectedId);
    }
  }, [selectedId, loadSuggestions]);

  // Handle map click to add point
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!selectedId) return;
      const { lat, lng } = e.latlng;
      void addCoord(selectedId, lat, lng, 'Manual point');
    },
    [selectedId, addCoord]
  );

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      worldCopyJump: true,
    }).setView([50.5, -121.5], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    docsLayerRef.current = L.layerGroup().addTo(map);
    aoiLayerRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);
    suggestionsLayerRef.current = L.layerGroup().addTo(map);

    // Click to add point
    map.on('click', handleMapClick);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [handleMapClick]);

  // Load ALL AOI GeoJSON layers on mount
  useEffect(() => {
    const loadAllAoi = async () => {
      if (!useLiveApi) return;
      for (const key of LAYER_KEYS) {
        if (aoiGeojson[key] !== undefined) continue;
        const data = await fetchGeoLayer(key);
        if (data) {
          setAoiGeojson(key, data);
        }
      }
    };
    void loadAllAoi();
  }, [aoiGeojson, fetchGeoLayer, setAoiGeojson, useLiveApi]);

  // Load POI GeoJSON (skip if file doesn't exist or is empty)
  useEffect(() => {
    const loadPoi = async () => {
      if (poiGeojson !== null || !useLiveApi) return;
      try {
        const data = await fetchGeoLayer(POI_LAYER);
        if (data && data.features?.length > 0) {
          setPoiGeojson(data);
        }
      } catch {
        // POI load failed, that's OK - just skip it
      }
    };
    void loadPoi();
  }, [fetchGeoLayer, poiGeojson, setPoiGeojson, useLiveApi]);

  // Update document markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !docsLayerRef.current) return;

    docsLayerRef.current.clearLayers();
    if (!showDocs) return;

    const docIcon = (relevant?: boolean) =>
      L.divIcon({
        className: relevant ? 'marker-confirmed-high' : 'marker-confirmed-med',
        iconSize: [18, 18],
      });

    mapDocs.forEach((d) => {
      const opacity = applyFrame && dimOutOfFrame ? 0.6 : 1;
      const isSelected = d.id === selectedId;
      
      const marker = L.marker([d.lat!, d.lng!], {
        icon: docIcon(d.relevant),
        opacity,
        draggable: isSelected, // Only selected doc is draggable
      }).bindTooltip(
        isSelected ? `${d.title} (drag to move)` : d.title,
        { direction: 'top' }
      );

      marker.on('click', () => setSelectedId(d.id));
      
      // On drag end, update coordinates via API
      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        // Use coord_id if available on doc, otherwise use doc.id as fallback
        const coordId = (d as { coord_id?: number }).coord_id ?? d.id;
        void updateCoord(d.id, coordId, latlng.lat, latlng.lng);
      });
      
      // Highlight selected
      if (isSelected) {
        marker.setZIndexOffset(1000);
      }
      
      docsLayerRef.current?.addLayer(marker);
    });
  }, [mapDocs, showDocs, selectedId, setSelectedId, applyFrame, dimOutOfFrame]);

  // Update suggestions layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !suggestionsLayerRef.current) return;

    suggestionsLayerRef.current.clearLayers();
    if (!showSuggestions || !selectedId) return;

    suggestions.forEach((s) => {
      const confidenceColor = {
        high: '#22c55e',
        medium: '#eab308',
        low: '#ef4444',
      }[s.confidence] || '#94a3b8';

      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 10,
        color: confidenceColor,
        fillColor: confidenceColor,
        fillOpacity: 0.4,
        weight: 2,
        dashArray: '4 4',
      });

      // Create popup with accept/reject buttons
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 150px;">
          <p style="margin: 0 0 8px; font-weight: 600;">${s.title}</p>
          <p style="margin: 0 0 8px; font-size: 11px; color: #666;">Confidence: ${s.confidence}</p>
          <div style="display: flex; gap: 8px;">
            <button class="sugg-accept" style="flex:1; padding: 4px 8px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">Accept</button>
            <button class="sugg-reject" style="flex:1; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Reject</button>
          </div>
        </div>
      `;

      popupContent.querySelector('.sugg-accept')?.addEventListener('click', () => {
        void acceptSuggestion(selectedId, s.id);
        marker.closePopup();
      });

      popupContent.querySelector('.sugg-reject')?.addEventListener('click', () => {
        void rejectSuggestion(selectedId, s.id);
        marker.closePopup();
      });

      marker.bindPopup(popupContent);
      marker.bindTooltip(`${s.title} (${s.confidence})`, { direction: 'top' });

      suggestionsLayerRef.current?.addLayer(marker);
    });
  }, [suggestions, showSuggestions, selectedId, acceptSuggestion, rejectSuggestion]);

  // Update AOI layer - render ALL loaded layers with click-to-focus
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !aoiLayerRef.current) return;

    aoiLayerRef.current.clearLayers();
    if (!showAoi) return;

    // Color scheme for different layer types
    const layerColors: Record<string, string> = {
      bc_territories: '#06b6d4',      // cyan
      bc_languages: '#8b5cf6',         // violet  
      bc_treaties: '#22c55e',          // green
      bc_interior_watersheds: '#3b82f6', // blue
    };

    // Render only VISIBLE AOI layers
    Object.entries(aoiGeojson).forEach(([key, geo]) => {
      if (!geo) return;
      // Check per-layer visibility
      if (aoiLayerVisibility[key] === false) return;
      
      const color = layerColors[key] || '#94a3b8';
      
      L.geoJSON(geo as GeoJSON.GeoJsonObject, {
        style: () => ({
          color,
          weight: 2,
          fillOpacity: 0.1,
          dashArray: '4 4',
        }),
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 8,
            color,
            fillColor: color,
            fillOpacity: 0.6,
            weight: 2,
          }),
        onEachFeature: (feat, layer) => {
          const props = feat.properties || {};
          const name = props.Name || props.name || props.MAJOR_WATERSHED_SYSTEM || key;
          
          // Create popup with zoom button
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `
            <div style="min-width:150px;">
              <p style="margin:0 0 8px;font-weight:600;color:#333;">${name}</p>
              <button class="zoom-btn" style="width:100%;padding:6px 12px;background:#8b5cf6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">
                🔍 Focus on Area
              </button>
            </div>
          `;
          
          popupContent.querySelector('.zoom-btn')?.addEventListener('click', () => {
            const bounds = (layer as L.Polygon | L.Polyline).getBounds?.();
            if (bounds?.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            } else if ('getLatLng' in layer) {
              map.setView((layer as L.CircleMarker).getLatLng(), 12);
            }
            layer.closePopup();
          });
          
          layer.bindPopup(popupContent);
          layer.bindTooltip(String(name), { direction: 'top' });
          
          // Click to open popup (for polygons)
          layer.on('click', () => {
            layer.openPopup();
          });
        },
      }).addTo(aoiLayerRef.current!);
    });
  }, [aoiGeojson, showAoi, aoiLayerVisibility]);

  // Update POI layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !poiLayerRef.current) return;

    poiLayerRef.current.clearLayers();
    if (!showPoi || !poiGeojson) return;

    L.geoJSON(poiGeojson as GeoJSON.GeoJsonObject, {
      pointToLayer: (_feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 8,
          color: '#a855f7',
          fillColor: '#a855f7',
          fillOpacity: 0.6,
          weight: 2,
        }),
      onEachFeature: (feat, layer) => {
        const props = feat.properties || {};
        const name = props.name || props.NAME || 'Office / POI';
        layer.bindTooltip(name, { direction: 'top' });
      },
    }).addTo(poiLayerRef.current);
  }, [poiGeojson, showPoi]);

  // Handle document drop on map
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const docId = e.dataTransfer.getData('application/x-doc-id');
      if (!docId || !mapRef.current || !mapContainerRef.current) return;
      
      // Get drop position relative to map container
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Convert screen coords to lat/lng
      const latlng = mapRef.current.containerPointToLatLng([x, y]);
      const { lat, lng } = latlng;
      
      // Update doc location in store
      updateDocLocation(parseInt(docId), lat, lng);
      
      // Also call API to persist (addCoord creates a coordinate entry)
      void addCoord(parseInt(docId), lat, lng, 'Drag-drop location');
      
      // Get overlap context from map layers (territories/treaties/offices + heuristic signal level)
      const geoContext = getConsultationContext(lat, lng, aoiGeojson, poiGeojson);
      
      if (geoContext.territories.length > 0 || geoContext.nearbyOffices.length > 0) {
        const depthEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[geoContext.suggestedDepth];
        const summary = formatConsultationSummary(geoContext);
        setOverlapMessage(`${depthEmoji} Geo context:\n${summary}`);
        console.log('Geo context:', geoContext);
        // Clear message after 8 seconds (more content to read)
        setTimeout(() => setOverlapMessage(null), 8000);
      } else {
        setOverlapMessage('📍 Location set (no mapped context overlaps identified)');
        setTimeout(() => setOverlapMessage(null), 3000);
      }
      
      console.log(`Dropped doc ${docId} at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    },
    [addCoord, updateDocLocation, aoiGeojson, poiGeojson]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);


  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement> | undefined}
      className="glass rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      data-tour="workspace"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-lg font-semibold text-white">Map</h2>
        <div className="flex gap-2 text-xs items-center">
          <HeatmapLayer map={mapRef.current} />
          <BufferZoneDraw map={mapRef.current} onBufferChange={(center, radiusKm) => {
            if (center) {
              setOverlapMessage(`⭕ Buffer: ${radiusKm}km radius at ${center[0].toFixed(4)}, ${center[1].toFixed(4)}`);
            } else {
              setOverlapMessage(null);
            }
          }} />
          <span className={`px-2 py-0.5 rounded ${showDocs ? 'bg-cyan-600/30 text-cyan-300' : 'bg-white/10 text-white/50'}`}>
            {mapDocs.length} docs
          </span>
          {suggestions.length > 0 && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`px-2 py-0.5 rounded ${showSuggestions ? 'bg-yellow-600/30 text-yellow-300' : 'bg-white/10 text-white/50'}`}
            >
              {suggestions.length} suggestions
            </button>
          )}
          {applyFrame && (
            <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">
              Frame active
            </span>
          )}
        </div>
      </div>
      <div
        ref={mapContainerRef}
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`h-[450px] rounded-lg overflow-hidden transition-all relative ${
          isDragOver ? 'ring-4 ring-cyan-500/50 ring-offset-2 ring-offset-slate-900' : ''
        }`}
        style={{ background: '#1e293b' }}
      />
      
      {/* Spatial Draw Filter */}
      {mapRef.current && (
        <DrawFilter
          map={mapRef.current}
          onGeometryChange={(geo) => {
            if (geo) {
              setOverlapMessage(`🎯 Spatial filter active (${geo.length > 100 ? 'polygon' : 'geometry'})`);
              // You can emit this geometry to parent/store for search filtering
              console.log('Spatial filter geometry:', geo);
            } else {
              setOverlapMessage(null);
            }
          }}
        />
      )}
      
      {/* Overlap Toast */}
      {overlapMessage && (
        <div className="mt-2 p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 animate-pulse">
          <p className="text-xs text-emerald-300">{overlapMessage}</p>
        </div>
      )}
      
      <p className="text-[10px] text-white/40 mt-2">
        {isDragOver 
          ? '📍 Drop document here to set location' 
          : selectedId 
            ? 'Click map to add a point to the selected document'
            : 'Drag unlocated documents from the list onto the map'}
      </p>
    </section>
  );
};
