/**
 * Geo Context Panel
 * Shows overlap context from AOI layers and nearby POIs (heuristic; informational only)
 */
import { useMemo } from 'react';
import { useDocsStore, useMapStore } from '../../store';
import { getConsultationContext, formatConsultationSummary, type ConsultationContext } from '../../utils/geoAnalysis';

export function ConsultationPanel() {
  const selectedId = useDocsStore((s) => s.selectedId);
  const docs = useDocsStore((s) => s.docs);
  const aoiGeojson = useMapStore((s) => s.aoiGeojson);
  const poiGeojson = useMapStore((s) => s.poiGeojson);

  const selectedDoc = docs.find((d) => d.id === selectedId);

  // Compute consultation context for selected document
  const context = useMemo<ConsultationContext | null>(() => {
    if (!selectedDoc?.lat || !selectedDoc?.lng) return null;
    return getConsultationContext(selectedDoc.lat, selectedDoc.lng, aoiGeojson, poiGeojson);
  }, [selectedDoc, aoiGeojson, poiGeojson]);

  if (!selectedDoc) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-400">Select a document to view geo context</p>
      </div>
    );
  }

  if (!selectedDoc.lat || !selectedDoc.lng) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-400">
          📍 Document has no location. Drag it onto the map to assign coordinates and view geo context.
        </p>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-400">Loading geo context...</p>
      </div>
    );
  }

  const depthColors = {
    high: 'bg-red-500/20 border-red-500 text-red-300',
    medium: 'bg-amber-500/20 border-amber-500 text-amber-300',
    low: 'bg-green-500/20 border-green-500 text-green-300',
  };

  const depthIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <div className="space-y-4">
      {/* Context Signal Banner */}
      <div className={`p-3 rounded-lg border ${depthColors[context.suggestedDepth]}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{depthIcons[context.suggestedDepth]}</span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              {context.suggestedDepth} Context Signal
            </p>
            <p className="text-xs opacity-80">
              {context.suggestedDepth === 'high' && 'Multiple overlaps detected (e.g., treaty area or multiple territories)'}
              {context.suggestedDepth === 'medium' && 'Single territory overlap detected'}
              {context.suggestedDepth === 'low' && 'No territory/treaty overlaps detected'}
            </p>
            <p className="text-[11px] opacity-70 mt-1">
              Informational only. Validate with your own process and data sources.
            </p>
          </div>
        </div>
      </div>

      {/* Territory Overlaps */}
      {context.territories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
            <span>🏔️</span> Territory Overlaps
          </h4>
          <div className="space-y-1">
            {context.territories.map((t, i) => (
              <div key={i} className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm font-medium text-purple-300">{t.featureName}</p>
                {t.layerLabel && <p className="text-xs text-purple-400/70">Layer: {t.layerLabel}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treaty Overlaps */}
      {context.treaties.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
            <span>📜</span> Treaty Overlaps
          </h4>
          <div className="space-y-1">
            {context.treaties.map((t, i) => (
              <div key={i} className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm font-medium text-amber-300">{t.featureName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Offices */}
      {context.nearbyOffices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
            <span>📍</span> Nearby Offices / POIs
          </h4>
          <div className="space-y-1">
            {context.nearbyOffices.map((office, i) => (
              <div key={i} className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-300">{office.name}</p>
                  {office.code && <p className="text-xs text-cyan-400/70">Code: {office.code}</p>}
                </div>
                <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                  {office.distance.toFixed(1)} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <button
          type="button"
          className="w-full py-2 px-3 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          onClick={() => {
            const summary = formatConsultationSummary(context);
            void navigator.clipboard.writeText(summary);
          }}
        >
          📋 Copy Context Summary
        </button>
      </div>

      {/* Location Info */}
      <div className="text-xs text-slate-500 text-center">
        📍 {selectedDoc.lat.toFixed(5)}, {selectedDoc.lng.toFixed(5)}
      </div>
    </div>
  );
}
