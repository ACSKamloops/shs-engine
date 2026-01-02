import type React from 'react';
import { useEffect } from 'react';
import { DocsPanel } from '../features/workspace/DocsPanel';
import { FiltersPanel } from '../features/workspace/FiltersPanel';
import { InspectorPanel } from '../features/workspace/InspectorPanel';
import { useApi } from '../hooks';
import { useDocsStore } from '../store';

export const DocumentList: React.FC = () => {
  const { loadDocs } = useApi();
  const selectedId = useDocsStore((s) => s.selectedId);
  const docs = useDocsStore((s) => s.docs);

  useEffect(() => {
    if (docs.length === 0) {
      void loadDocs();
    }
  }, [docs.length, loadDocs]);

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Filters & List */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
        <FiltersPanel />
        <div className="flex-1 overflow-hidden flex flex-col">
          <DocsPanel />
        </div>
      </div>

      {/* Inspector / Detail View */}
      <div className="lg:col-span-8 h-full overflow-y-auto">
        {selectedId ? (
          <InspectorPanel />
        ) : (
          <div 
            className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5"
            data-tour="inspector"
          >
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-white/40 font-medium">Select a document to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};