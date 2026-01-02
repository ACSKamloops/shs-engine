/**
 * Export Panel
 * Export documents to various formats (ArcGIS, CSV, GeoJSON)
 */
import { useDocsStore } from '../../store';
import { docsToEsriFeatureSet, downloadEsriJson, downloadArcGisCsv } from '../../utils/arcgisExport';

export function ExportPanel() {
  const docs = useDocsStore((s) => s.docs);
  
  const geolocatedCount = docs.filter((d) => d.lat != null && d.lng != null).length;

  const handleExportEsriJson = () => {
    const featureSet = docsToEsriFeatureSet(docs);
    downloadEsriJson(featureSet, `pukaist-export-${Date.now()}`);
  };

  const handleExportCsv = () => {
    downloadArcGisCsv(docs, `pukaist-export-${Date.now()}`);
  };

  const handleExportGeoJson = () => {
    const geolocatedDocs = docs.filter((d) => d.lat != null && d.lng != null);
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: geolocatedDocs.map((doc) => ({
        type: 'Feature' as const,
        properties: {
          id: doc.id,
          title: doc.title,
          summary: doc.summary,
          theme: doc.theme,
          doc_type: doc.doc_type,
          status: doc.status,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [doc.lng!, doc.lat!],
        },
      })),
    };
    
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pukaist-export-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white">Export Data</h4>
      
      <div className="p-3 bg-slate-800/50 border border-white/10 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">
          📍 <strong>{geolocatedCount}</strong> of {docs.length} documents have coordinates
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleExportEsriJson}
          disabled={geolocatedCount === 0}
          className="w-full py-2 px-3 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🗺️ Export Esri JSON (ArcGIS)
        </button>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={geolocatedCount === 0}
          className="w-full py-2 px-3 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          📊 Export CSV (ArcGIS Compatible)
        </button>

        <button
          type="button"
          onClick={handleExportGeoJson}
          disabled={geolocatedCount === 0}
          className="w-full py-2 px-3 text-sm bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🌐 Export GeoJSON
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Only documents with geo-coordinates will be exported.
      </p>
    </div>
  );
}
