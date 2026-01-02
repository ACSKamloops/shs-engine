import type React from 'react';
import { useEffect } from 'react';
import { MapPanel } from '../features/workspace/MapPanel';
import { LayerControls } from '../features/workspace/LayerControls';
import { DocsPanel } from '../features/workspace/DocsPanel';
import { useApi } from '../hooks';
import { useDocsStore } from '../store';

export const MapExplorer: React.FC = () => {
  const { loadDocs, loadAoiLayers } = useApi();
  const docs = useDocsStore((s) => s.docs);

  useEffect(() => {
    if (docs.length === 0) {
      void loadDocs();
    }
    void loadAoiLayers();
  }, [docs.length, loadDocs, loadAoiLayers]);

  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapPanel />
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 w-80 space-y-4 max-h-[calc(100%-2rem)] overflow-y-auto pr-2">
        <div className="glass rounded-xl shadow-lg backdrop-blur-xl border border-white/20">
          <LayerControls />
        </div>
        <div className="glass rounded-xl shadow-lg backdrop-blur-xl border border-white/20">
           <DocsPanel />
        </div>
      </div>
    </div>
  );
};
