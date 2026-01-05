/**
 * Admin Map Page - Map Management Interface
 * Allows admins to add/edit/delete markers and upload KML/KMZ files
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminMapPanel } from '../../components/admin/AdminMapPanel';
import { MarkerEditor } from '../../components/admin/MarkerEditor';
import { KmlUploader } from '../../components/admin/KmlUploader';
import { useMapMarkersStore } from '../../store/useMapMarkersStore';

type TabType = 'markers' | 'layers' | 'upload';

export function AdminMapPage() {
  const [activeTab, setActiveTab] = useState<TabType>('markers');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const { 
    markers, 
    customLayers, 
    selectedMarkerId, 
    isAddingMarker,
    setAddingMarker,
    getPublicMarkers,
  } = useMapMarkersStore();

  const publicCount = getPublicMarkers().length;
  const privateCount = markers.length - publicCount;

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Header */}
      <header className="bg-shs-forest-800 text-white">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-shs-forest-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Back to Site</span>
            </Link>
            <div className="h-6 w-px bg-shs-forest-600" />
            <h1 className="text-xl font-bold">Map Manager</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                {publicCount} Public
              </span>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">
                {privateCount} Private
              </span>
              <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded">
                {customLayers.length} Layers
              </span>
            </div>
            
            {/* Preview Toggle */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-emerald-500 text-white'
                  : 'bg-shs-forest-700 text-shs-forest-200 hover:bg-shs-forest-600'
              }`}
            >
              {isPreviewMode ? '✓ Preview Mode' : 'Preview Public View'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Map Panel - Left Side */}
        <div className="flex-1 relative">
          <AdminMapPanel 
            isPreviewMode={isPreviewMode} 
            isAddingMarker={isAddingMarker}
          />
          
          {/* Floating Add Marker Button */}
          {!isPreviewMode && (
            <div className="absolute top-4 right-4 z-[1000]">
              <button
                onClick={() => setAddingMarker(!isAddingMarker)}
                className={`px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all ${
                  isAddingMarker
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-shs-forest-600 text-white hover:bg-shs-forest-700'
                }`}
              >
                {isAddingMarker ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Marker
                  </span>
                )}
              </button>
              
              {isAddingMarker && (
                <div className="mt-2 px-3 py-2 bg-amber-100 text-amber-800 text-sm rounded-lg shadow-lg">
                  Click on the map to place a marker
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editor Panel - Right Side */}
        <div className="w-[400px] bg-white border-l border-shs-stone flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-shs-stone">
            {[
              { id: 'markers', label: 'Markers', icon: '📍' },
              { id: 'layers', label: 'Layers', icon: '🗺️' },
              { id: 'upload', label: 'Upload', icon: '📁' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-shs-forest-700 border-b-2 border-shs-forest-600 bg-shs-sand/50'
                    : 'text-shs-text-muted hover:text-shs-forest-600'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'markers' && (
              <div className="p-4">
                {selectedMarkerId ? (
                  <MarkerEditor markerId={selectedMarkerId} />
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8 text-shs-text-muted">
                      <svg className="w-12 h-12 mx-auto mb-3 text-shs-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm">Select a marker on the map to edit</p>
                      <p className="text-xs mt-1">or click "Add Marker" to create new</p>
                    </div>
                    
                    {/* Marker List */}
                    <div>
                      <h3 className="text-sm font-semibold text-shs-forest-700 mb-2">All Markers ({markers.length})</h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {markers.map((marker) => (
                          <MarkerListItem key={marker.id} marker={marker} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-shs-forest-700 mb-3">Custom Layers ({customLayers.length})</h3>
                {customLayers.length === 0 ? (
                  <div className="text-center py-8 text-shs-text-muted">
                    <p className="text-sm">No custom layers yet</p>
                    <p className="text-xs mt-1">Upload KML/KMZ files to add layers</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customLayers.map((layer) => (
                      <LayerListItem key={layer.id} layer={layer} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="p-4">
                <KmlUploader />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Marker list item component
function MarkerListItem({ marker }: { marker: ReturnType<typeof useMapMarkersStore.getState>['markers'][0] }) {
  const { selectMarker, selectedMarkerId } = useMapMarkersStore();
  
  const typeIcons: Record<string, string> = {
    camp: '⛺',
    project: '🏗️',
    partner: '🤝',
    'cultural-site': '🪶',
    event: '📅',
  };

  return (
    <button
      onClick={() => selectMarker(marker.id)}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selectedMarkerId === marker.id
          ? 'border-shs-forest-500 bg-shs-forest-50'
          : 'border-shs-stone hover:border-shs-forest-300 hover:bg-shs-sand/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{typeIcons[marker.type] || '📍'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-shs-forest-800 truncate">
            {marker.title}
          </div>
          <div className="text-xs text-shs-text-muted truncate">
            {marker.type} • {marker.isPublic ? 'Public' : 'Private'}
          </div>
        </div>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          marker.isPublic ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />
      </div>
    </button>
  );
}

// Layer list item component
function LayerListItem({ layer }: { layer: ReturnType<typeof useMapMarkersStore.getState>['customLayers'][0] }) {
  const { selectedLayerId, updateLayer, deleteLayer } = useMapMarkersStore();

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        selectedLayerId === layer.id
          ? 'border-shs-forest-500 bg-shs-forest-50'
          : 'border-shs-stone hover:border-shs-forest-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-4 h-4 rounded"
          style={{ backgroundColor: layer.color || '#94a3b8' }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-shs-forest-800 truncate">
            {layer.name}
          </div>
          <div className="text-xs text-shs-text-muted">
            {layer.geojson.features.length} features
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateLayer(layer.id, { isPublic: !layer.isPublic })}
            className={`p-1.5 rounded ${
              layer.isPublic 
                ? 'text-emerald-600 hover:bg-emerald-50' 
                : 'text-amber-600 hover:bg-amber-50'
            }`}
            title={layer.isPublic ? 'Public - click to hide' : 'Hidden - click to publish'}
          >
            {layer.isPublic ? '👁️' : '🙈'}
          </button>
          <button
            onClick={() => deleteLayer(layer.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            title="Delete layer"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
