/**
 * ArcGIS Export Utility
 * Convert internal GeoJSON to Esri-compatible formats
 */

import type { Doc } from '../store/useDocsStore';

export interface EsriFeature {
  attributes: Record<string, unknown>;
  geometry: {
    x: number;
    y: number;
    spatialReference: { wkid: number };
  };
}

export interface EsriFeatureSet {
  displayFieldName: string;
  fieldAliases: Record<string, string>;
  geometryType: 'esriGeometryPoint';
  spatialReference: { wkid: number };
  features: EsriFeature[];
}

/**
 * Convert documents with coordinates to Esri FeatureSet format
 */
export function docsToEsriFeatureSet(docs: Doc[]): EsriFeatureSet {
  const geolocatedDocs = docs.filter((d) => d.lat != null && d.lng != null);
  
  const features: EsriFeature[] = geolocatedDocs.map((doc) => ({
    attributes: {
      OBJECTID: doc.id,
      title: doc.title,
      summary: doc.summary,
      theme: doc.theme || '',
      doc_type: doc.doc_type || '',
      status: doc.status || 'not_started',
      created_at: doc.created_at || Date.now() / 1000,
    },
    geometry: {
      x: doc.lng!,
      y: doc.lat!,
      spatialReference: { wkid: 4326 }, // WGS84
    },
  }));

  return {
    displayFieldName: 'title',
    fieldAliases: {
      OBJECTID: 'Object ID',
      title: 'Title',
      summary: 'Summary',
      theme: 'Theme',
      doc_type: 'Document Type',
      status: 'Status',
      created_at: 'Created At',
    },
    geometryType: 'esriGeometryPoint',
    spatialReference: { wkid: 4326 },
    features,
  };
}

/**
 * Convert GeoJSON FeatureCollection to Esri format
 */
export function geojsonToEsri(geojson: GeoJSON.FeatureCollection): EsriFeatureSet {
  const features: EsriFeature[] = [];
  
  for (const feature of geojson.features) {
    if (feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates;
      features.push({
        attributes: {
          OBJECTID: features.length + 1,
          ...(feature.properties || {}),
        },
        geometry: {
          x: lng,
          y: lat,
          spatialReference: { wkid: 4326 },
        },
      });
    }
  }

  return {
    displayFieldName: 'name',
    fieldAliases: {
      OBJECTID: 'Object ID',
      name: 'Name',
    },
    geometryType: 'esriGeometryPoint',
    spatialReference: { wkid: 4326 },
    features,
  };
}

/**
 * Download Esri FeatureSet as JSON file
 */
export function downloadEsriJson(featureSet: EsriFeatureSet, filename = 'export'): void {
  const blob = new Blob([JSON.stringify(featureSet, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.esri.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export documents to ArcGIS CSV format
 */
export function docsToArcGisCsv(docs: Doc[]): string {
  const geolocatedDocs = docs.filter((d) => d.lat != null && d.lng != null);
  
  const headers = ['OBJECTID', 'title', 'summary', 'theme', 'doc_type', 'status', 'lat', 'lng'];
  const rows = geolocatedDocs.map((doc) => [
    doc.id,
    `"${(doc.title || '').replace(/"/g, '""')}"`,
    `"${(doc.summary || '').replace(/"/g, '""').substring(0, 200)}"`,
    doc.theme || '',
    doc.doc_type || '',
    doc.status || 'not_started',
    doc.lat,
    doc.lng,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download documents as ArcGIS-compatible CSV
 */
export function downloadArcGisCsv(docs: Doc[], filename = 'export'): void {
  const csv = docsToArcGisCsv(docs);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
