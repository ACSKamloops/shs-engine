/**
 * Layer Controls - Premium Redesign
 * Toggle visibility of map layers with elegant styling
 */
import type React from 'react';
import { useMapStore } from '../../store';

const AOI_LAYERS = [
  { key: 'bc_territories', label: 'Territories', color: '#06b6d4', icon: '🗺️' },
  { key: 'bc_languages', label: 'Languages', color: '#8b5cf6', icon: '🗣️' },
  { key: 'bc_treaties', label: 'Treaties', color: '#22c55e', icon: '📜' },
  { key: 'bc_interior_watersheds', label: 'Watersheds', color: '#3b82f6', icon: '💧' },
];

export const LayerControls: React.FC = () => {
  const showDocs = useMapStore((s) => s.showDocs);
  const setShowDocs = useMapStore((s) => s.setShowDocs);
  const showAoi = useMapStore((s) => s.showAoi);
  const setShowAoi = useMapStore((s) => s.setShowAoi);
  const showPoi = useMapStore((s) => s.showPoi);
  const setShowPoi = useMapStore((s) => s.setShowPoi);
  const dimOutOfFrame = useMapStore((s) => s.dimOutOfFrame);
  const setDimOutOfFrame = useMapStore((s) => s.setDimOutOfFrame);
  const aoiLayerVisibility = useMapStore((s) => s.aoiLayerVisibility);
  const toggleAoiLayer = useMapStore((s) => s.toggleAoiLayer);

  // Toggle switch component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-8 h-4 rounded-full transition-all ${
        checked ? 'bg-indigo-500' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );

  return (
    <div className="panel">
      <div className="panel-header !mb-3 !pb-2">
        <h3 className="panel-title">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Layers
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Main layer toggles */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
          <Toggle checked={showDocs} onChange={setShowDocs} />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-white/80">Documents</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
          <Toggle checked={showAoi} onChange={setShowAoi} />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-white/80">AOI</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
          <Toggle checked={showPoi} onChange={setShowPoi} />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-xs text-white/80">POI</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 bg-white/3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
          <Toggle checked={dimOutOfFrame} onChange={setDimOutOfFrame} />
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs text-white/80">Dim</span>
          </div>
        </div>
      </div>
      
      {/* AOI sub-layers */}
      {showAoi && (
        <div className="mt-3 pt-3 border-t border-white/5 animate-fade-in">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-2">AOI Layers</p>
          <div className="flex flex-wrap gap-1.5">
            {AOI_LAYERS.map((layer) => {
              const isVisible = aoiLayerVisibility[layer.key] ?? true;
              return (
                <button
                  key={layer.key}
                  onClick={() => toggleAoiLayer(layer.key, !isVisible)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isVisible
                      ? 'text-white shadow-sm'
                      : 'bg-white/5 text-white/40 hover:text-white/60'
                  }`}
                  style={{
                    backgroundColor: isVisible ? `${layer.color}25` : undefined,
                    borderColor: isVisible ? `${layer.color}40` : 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isVisible ? layer.color : 'rgba(255,255,255,0.2)' }}
                  />
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
