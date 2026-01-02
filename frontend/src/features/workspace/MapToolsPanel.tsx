/**
 * Map Tools Panel
 * Combined controls for spatial features
 */
import L from 'leaflet';
import { HeatmapLayer } from './HeatmapLayer';
import { DrawFilter } from './DrawFilter';
import { AOILayerOverlay } from './AOILayerOverlay';

interface MapToolsPanelProps {
  map: L.Map | null;
  onGeometryChange?: (geometry: string | null) => void;
  onAOISelect?: (aoiCode: string, aoiTheme: string) => void;
}

export function MapToolsPanel({ map, onGeometryChange, onAOISelect }: MapToolsPanelProps) {
  return (
    <>
      {/* AOI Layer Controls - Top Left */}
      <AOILayerOverlay map={map} onAOISelect={onAOISelect} />
      
      {/* Draw Filter - Managed by Leaflet Draw */}
      <DrawFilter map={map} onGeometryChange={onGeometryChange || (() => {})} />
      
      {/* Map Controls - Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] flex gap-2">
        <HeatmapLayer map={map} />
      </div>
    </>
  );
}

export default MapToolsPanel;
