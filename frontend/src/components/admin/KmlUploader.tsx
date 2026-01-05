/**
 * KML/KMZ Uploader - Upload and parse geographic data files
 * Supports KML (XML) and KMZ (zipped KML) formats
 */
import { useState, useCallback } from 'react';
import JSZip from 'jszip';
// @ts-ignore
import * as toGeoJSON from '@mapbox/togeojson';
import { useMapMarkersStore } from '../../store/useMapMarkersStore';

type UploadStatus = 'idle' | 'loading' | 'preview' | 'success' | 'error';

interface ParsedData {
  name: string;
  geojson: GeoJSON.FeatureCollection;
  featureCount: number;
  type: 'polygon' | 'point' | 'mixed';
}

export function KmlUploader() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [layerName, setLayerName] = useState('');
  const [layerColor, setLayerColor] = useState('#6366f1');
  const [isPublic, setIsPublic] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { addLayer } = useMapMarkersStore();

  // Parse KML string to GeoJSON
  const parseKml = (kmlString: string, fileName: string): ParsedData => {
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
    
    // Check for parse errors
    const parseError = kmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid KML file format');
    }

    const geojson = toGeoJSON.kml(kmlDoc);
    
    if (!geojson.features || geojson.features.length === 0) {
      throw new Error('No features found in file');
    }

    // Determine feature type
    const types = new Set(geojson.features.map((f: any) => f.geometry?.type));
    let type: 'polygon' | 'point' | 'mixed' = 'mixed';
    if (types.size === 1) {
      const t = [...types][0];
      if (t === 'Point' || t === 'MultiPoint') type = 'point';
      else if (t === 'Polygon' || t === 'MultiPolygon') type = 'polygon';
    }

    // Extract name from KML or use filename
    const docName = kmlDoc.querySelector('Document > name')?.textContent 
      || fileName.replace(/\.(kml|kmz)$/i, '');

    return {
      name: docName,
      geojson,
      featureCount: geojson.features.length,
      type,
    };
  };

  // Process uploaded file
  const processFile = async (file: File) => {
    setStatus('loading');
    setError(null);
    setParsedData(null);

    try {
      const fileName = file.name.toLowerCase();
      let kmlContent: string;

      if (fileName.endsWith('.kmz')) {
        // Extract KML from KMZ (zip file)
        const zip = await JSZip.loadAsync(file);
        const kmlFile = Object.keys(zip.files).find(name => 
          name.toLowerCase().endsWith('.kml')
        );
        
        if (!kmlFile) {
          throw new Error('No KML file found inside KMZ');
        }
        
        kmlContent = await zip.files[kmlFile].async('string');
      } else if (fileName.endsWith('.kml')) {
        // Read KML directly
        kmlContent = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload .kml or .kmz');
      }

      const data = parseKml(kmlContent, file.name);
      setParsedData(data);
      setLayerName(data.name);
      setStatus('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setStatus('error');
    }
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Save as layer
  const handleSave = () => {
    if (!parsedData) return;

    addLayer({
      name: layerName || parsedData.name,
      geojson: parsedData.geojson,
      isPublic,
      color: layerColor,
    });

    // Reset
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setParsedData(null);
      setLayerName('');
    }, 2000);
  };

  // Reset
  const handleReset = () => {
    setStatus('idle');
    setParsedData(null);
    setError(null);
    setLayerName('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-shs-forest-800">Upload KML/KMZ</h3>
      <p className="text-sm text-shs-text-muted">
        Import geographic data from Google Earth, Google My Maps, or other GIS tools.
      </p>

      {/* Drop Zone (Idle State) */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-shs-forest-500 bg-shs-forest-50'
              : 'border-shs-stone hover:border-shs-forest-300'
          }`}
        >
          <svg
            className="w-12 h-12 mx-auto mb-3 text-shs-stone"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-shs-text-muted mb-3">
            Drag and drop a KML or KMZ file here
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-shs-forest-600 text-white text-sm font-medium rounded-lg hover:bg-shs-forest-700 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose File
            <input
              type="file"
              accept=".kml,.kmz"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-shs-text-muted mt-2">
            Supported: .kml, .kmz
          </p>
        </div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-3 border-shs-forest-200 border-t-shs-forest-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-shs-text-muted">Processing file...</p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Preview State */}
      {status === 'preview' && parsedData && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">File parsed successfully</span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              Found {parsedData.featureCount} feature(s) ({parsedData.type})
            </p>
          </div>

          {/* Layer Name */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Layer Name
            </label>
            <input
              type="text"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
              placeholder="Enter layer name"
            />
          </div>

          {/* Layer Color */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Layer Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={layerColor}
                onChange={(e) => setLayerColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={layerColor}
                onChange={(e) => setLayerColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-shs-stone rounded-lg font-mono text-sm"
              />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-shs-sand">
            <div>
              <span className="font-medium text-shs-forest-800">Public</span>
              <p className="text-xs text-shs-text-muted">
                {isPublic ? 'Visible on public map' : 'Hidden from public'}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPublic ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-shs-forest-600 text-white font-medium rounded-lg hover:bg-shs-forest-700 transition-colors"
            >
              Add Layer
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-shs-stone text-shs-text-body rounded-lg hover:bg-shs-sand transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-emerald-800">Layer Added!</p>
          <p className="text-sm text-emerald-600 mt-1">
            View it in the Layers tab
          </p>
        </div>
      )}

      {/* Help Section */}
      {status === 'idle' && (
        <div className="border-t border-shs-stone pt-4 mt-4">
          <h4 className="text-sm font-semibold text-shs-forest-700 mb-2">
            Where to get KML files?
          </h4>
          <ul className="space-y-2 text-sm text-shs-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-shs-forest-500">•</span>
              <a 
                href="https://www.google.com/maps/d/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-shs-forest-600 hover:underline"
              >
                Google My Maps
              </a> - Create custom maps, export as KML
            </li>
            <li className="flex items-start gap-2">
              <span className="text-shs-forest-500">•</span>
              <a 
                href="https://native-land.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-shs-forest-600 hover:underline"
              >
                Native-Land.ca
              </a> - Territory boundaries (with permission)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-shs-forest-500">•</span>
              <span>Google Earth Pro - Export places as KML/KMZ</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
