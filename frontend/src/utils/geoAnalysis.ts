/**
 * Geo Analysis Utilities
 * Point-in-polygon detection for AOI overlap analysis
 */
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';

export interface AOIOverlap {
  layerKey: string;
  layerLabel: string;
  featureName: string;
  color: string;
  properties: Record<string, unknown>;
}

// Human-readable labels and colors for layer types
const LAYER_META: Record<string, { label: string; color: string; emoji: string }> = {
  bc_territories: { label: 'Territory', color: '#06b6d4', emoji: '🏔️' },
  bc_languages: { label: 'Language Region', color: '#8b5cf6', emoji: '🗣️' },
  bc_treaties: { label: 'Treaty', color: '#22c55e', emoji: '📜' },
  bc_interior_watersheds: { label: 'Watershed', color: '#3b82f6', emoji: '💧' },
};

/**
 * Find all AOI polygons that contain the given point
 */
export function findOverlappingAOIs(
  lat: number,
  lng: number,
  aoiGeojson: Record<string, FeatureCollection | null>
): AOIOverlap[] {
  const pt = point([lng, lat]); // GeoJSON uses [lng, lat] order
  const overlaps: AOIOverlap[] = [];

  for (const [layerKey, fc] of Object.entries(aoiGeojson)) {
    if (!fc || !fc.features) continue;

    const meta = LAYER_META[layerKey] || { label: layerKey, color: '#94a3b8', emoji: '📍' };

    for (const feature of fc.features) {
      const geomType = feature.geometry?.type;
      if (geomType !== 'Polygon' && geomType !== 'MultiPolygon') continue;

      try {
        if (booleanPointInPolygon(pt, feature as Feature<Polygon | MultiPolygon>)) {
          const props = feature.properties || {};
          const name = 
            props.Name || 
            props.name || 
            props.MAJOR_WATERSHED_SYSTEM ||
            props.Slug ||
            layerKey;

          overlaps.push({
            layerKey,
            layerLabel: meta.label,
            featureName: String(name),
            color: meta.color,
            properties: props,
          });
        }
      } catch {
        // Skip invalid geometries
      }
    }
  }

  return overlaps;
}

/**
 * Format overlaps for display as a summary string
 */
export function formatOverlapsSummary(overlaps: AOIOverlap[]): string {
  if (overlaps.length === 0) return 'No AOI overlaps detected';
  
  return overlaps
    .map((o) => {
      const meta = LAYER_META[o.layerKey];
      const emoji = meta?.emoji || '📍';
      return `${emoji} ${o.featureName}`;
    })
    .join(' • ');
}

/**
 * Group overlaps by layer type for structured display
 */
export function groupOverlapsByLayer(overlaps: AOIOverlap[]): Record<string, AOIOverlap[]> {
  const grouped: Record<string, AOIOverlap[]> = {};
  
  for (const overlap of overlaps) {
    if (!grouped[overlap.layerKey]) {
      grouped[overlap.layerKey] = [];
    }
    grouped[overlap.layerKey].push(overlap);
  }
  
  return grouped;
}

// ============================================================================
// GEO CONTEXT (HEURISTIC)
// ============================================================================

export interface FirstNationOffice {
  name: string;
  code?: number;
  distance: number; // km from point
  lat: number;
  lng: number;
}

export interface ConsultationContext {
  territories: AOIOverlap[];
  languages: AOIOverlap[];
  treaties: AOIOverlap[];
  watersheds: AOIOverlap[];
  nearbyOffices: FirstNationOffice[];
  suggestedDepth: 'high' | 'medium' | 'low';
  summary: string;
}

/**
 * Calculate haversine distance between two points (km)
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find First Nation offices from POI layer
 */
export function findNearbyOffices(
  lat: number,
  lng: number,
  poiGeojson: GeoJSON.FeatureCollection | null,
  maxDistance = 100 // km
): FirstNationOffice[] {
  if (!poiGeojson?.features) return [];
  
  const offices: FirstNationOffice[] = [];
  
  for (const feature of poiGeojson.features) {
    if (feature.geometry?.type !== 'Point') continue;
    const coords = feature.geometry.coordinates;
    if (!coords || coords.length < 2) continue;
    
    const [officeLng, officeLat] = coords;
    const distance = haversineDistance(lat, lng, officeLat, officeLng);
    
    if (distance <= maxDistance) {
      const props = feature.properties || {};
      offices.push({
        name: String(props.name || props.Name || 'Unknown'),
        code: typeof props.code === 'number' ? props.code : undefined,
        distance: Math.round(distance * 10) / 10,
        lat: officeLat,
        lng: officeLng,
      });
    }
  }
  
  // Sort by distance
  return offices.sort((a, b) => a.distance - b.distance);
}

/**
 * Get full consultation context for a location
 */
export function getConsultationContext(
  lat: number,
  lng: number,
  aoiGeojson: Record<string, FeatureCollection | null>,
  poiGeojson: FeatureCollection | null
): ConsultationContext {
  const overlaps = findOverlappingAOIs(lat, lng, aoiGeojson);
  const grouped = groupOverlapsByLayer(overlaps);
  
  const territories = grouped.bc_territories || [];
  const languages = grouped.bc_languages || [];
  const treaties = grouped.bc_treaties || [];
  const watersheds = grouped.bc_interior_watersheds || [];
  
  const nearbyOffices = findNearbyOffices(lat, lng, poiGeojson, 50);
  
  // Compute a simple signal level based on overlap significance (informational only)
  let suggestedDepth: 'high' | 'medium' | 'low' = 'low';
  if (treaties.length > 0 || territories.length >= 2) {
    suggestedDepth = 'high';
  } else if (territories.length === 1) {
    suggestedDepth = 'medium';
  }
  
  // Generate summary
  const parts: string[] = [];
  if (territories.length > 0) {
    parts.push(`${territories.length} territory(s): ${territories.map(t => t.featureName).join(', ')}`);
  }
  if (treaties.length > 0) {
    parts.push(`Treaty overlap: ${treaties.map(t => t.featureName).join(', ')}`);
  }
  if (nearbyOffices.length > 0) {
    parts.push(`Nearest office: ${nearbyOffices[0].name} (${nearbyOffices[0].distance}km)`);
  }
  
  const summary = parts.length > 0 
    ? parts.join(' | ') 
    : 'No mapped overlap context identified';
  
  return {
    territories,
    languages,
    treaties,
    watersheds,
    nearbyOffices,
    suggestedDepth,
    summary,
  };
}

/**
 * Format consultation context for display
 */
export function formatConsultationSummary(ctx: ConsultationContext): string {
  const depthEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[ctx.suggestedDepth];
  
  const lines: string[] = [
    `${depthEmoji} Context signal: ${ctx.suggestedDepth.toUpperCase()}`,
  ];
  
  if (ctx.territories.length > 0) {
    lines.push(`🏔️ Territories: ${ctx.territories.map(t => t.featureName).join(', ')}`);
  }
  
  if (ctx.treaties.length > 0) {
    lines.push(`📜 Treaty overlaps: ${ctx.treaties.map(t => t.featureName).join(', ')}`);
  }
  
  if (ctx.nearbyOffices.length > 0) {
    lines.push(`📍 Offices/POIs: ${ctx.nearbyOffices.slice(0, 3).map(o => `${o.name} (${o.distance}km)`).join(', ')}`);
  }

  lines.push('Note: Informational only. Verify with your own process and sources.');
  
  return lines.join('\n');
}
