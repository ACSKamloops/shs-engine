/**
 * Draw Filter Component
 * Adds drawing controls to the map for spatial filtering
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

interface DrawFilterProps {
  map: L.Map | null;
  onGeometryChange: (geometry: string | null) => void;
}

export function DrawFilter({ map, onGeometryChange }: DrawFilterProps) {
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const [hasFilter, setHasFilter] = useState(false);

  useEffect(() => {
    if (!map) return;

    // Add drawn items layer to map
    map.addLayer(drawnItemsRef.current);

    // Create draw control
    drawControlRef.current = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#8b5cf6',
            fillColor: '#8b5cf6',
            fillOpacity: 0.2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#8b5cf6',
            fillColor: '#8b5cf6',
            fillOpacity: 0.2,
          },
        },
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    });

    map.addControl(drawControlRef.current);

    // Handle draw created event
    const handleDrawCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(event.layer);
      
      // Convert to GeoJSON
      const geojson = event.layer.toGeoJSON();
      onGeometryChange(JSON.stringify(geojson.geometry));
      setHasFilter(true);
    };

    // Handle layer deleted
    const handleDrawDeleted = () => {
      if (drawnItemsRef.current.getLayers().length === 0) {
        onGeometryChange(null);
        setHasFilter(false);
      }
    };

    // Handle edit
    const handleDrawEdited = () => {
      const layers = drawnItemsRef.current.getLayers();
      if (layers.length > 0) {
        const layer = layers[0] as L.Polygon | L.Rectangle;
        const geojson = layer.toGeoJSON();
        onGeometryChange(JSON.stringify(geojson.geometry));
      }
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);
    map.on(L.Draw.Event.EDITED, handleDrawEdited);

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      map.removeLayer(drawnItemsRef.current);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);
      map.off(L.Draw.Event.EDITED, handleDrawEdited);
    };
  }, [map, onGeometryChange]);

  const handleClearFilter = () => {
    drawnItemsRef.current.clearLayers();
    onGeometryChange(null);
    setHasFilter(false);
  };

  if (!hasFilter) return null;

  return (
    <div className="absolute top-20 right-3 z-[1000]">
      <button
        onClick={handleClearFilter}
        className="px-3 py-1.5 text-xs font-medium bg-red-500/90 text-white rounded-lg
                   hover:bg-red-600 transition-colors shadow-lg flex items-center gap-1.5"
      >
        ✕ Clear Spatial Filter
      </button>
    </div>
  );
}

export default DrawFilter;
