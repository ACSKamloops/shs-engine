/**
 * API client hook with full document loading and upload support
 */
import { useCallback } from 'react';
import { useAppStore, useDocsStore, useMapStore } from '../store';
import { SAMPLE_DOCS, SAMPLE_ARTIFACTS, SAMPLE_SUGGESTIONS, SAMPLE_AOI_LAYERS } from '../sampleData';
import type { Doc, Artifact } from '../store/useDocsStore';
import type { MapSuggestion } from '../store/useMapStore';

interface DocsResponse {
  docs: Doc[];
}

interface DocDetailResponse extends Doc {}

interface ArtifactResponse extends Artifact {}

interface SuggestionsResponse {
  suggestions: MapSuggestion[];
}

export function useApi() {
  // App store selectors with explicit types
  const apiBase = useAppStore((s) => s.apiBase);
  const apiKey = useAppStore((s) => s.apiKey);
  const useLiveApi = useAppStore((s) => s.useLiveApi);
  const setBanner = useAppStore((s) => s.setBanner);
  const setLoading = useAppStore((s) => s.setLoading);
  const setUploading = useAppStore((s) => s.setUploading);
  const setUploadNotice = useAppStore((s) => s.setUploadNotice);
  
  // Docs store selectors
  const setDocs = useDocsStore((s) => s.setDocs);
  const setSelectedId = useDocsStore((s) => s.setSelectedId);
  const setDocDetail = useDocsStore((s) => s.setDocDetail);
  const setArtifact = useDocsStore((s) => s.setArtifact);
  const cacheArtifact = useDocsStore((s) => s.cacheArtifact);
  const artifactCache = useDocsStore((s) => s.artifactCache);

  // Map store selectors
  const setSuggestions = useMapStore((s) => s.setSuggestions);

  /**
   * Base API call with auth header
   */
  const api = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      if (!useLiveApi) {
        throw new Error('Live API disabled (using demo).');
      }
      const resp = await fetch(`${apiBase.replace(/\/$/, '')}${path}`, {
        ...options,
        headers: {
          'X-API-Key': apiKey,
          ...(options.headers || {}),
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }
      return (await resp.json()) as T;
    },
    [apiBase, apiKey, useLiveApi]
  );

  /**
   * Streaming API call (returns raw Response for SSE/streams)
   */
  const apiStream = useCallback(
    async (path: string, options: RequestInit = {}): Promise<Response> => {
      if (!useLiveApi) {
        throw new Error('Live API disabled (using demo).');
      }
      const resp = await fetch(`${apiBase.replace(/\/$/, '')}${path}`, {
        ...options,
        headers: {
          'X-API-Key': apiKey,
          ...(options.headers || {}),
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }
      return resp;
    },
    [apiBase, apiKey, useLiveApi]
  );

  /**
   * Load documents from API or fallback to sample data
   */
  const loadDocs = useCallback(
    async (search?: string, theme?: string, docType?: string) => {
      setLoading(true);
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (theme) params.set('theme', theme);
        if (docType) params.set('doc_type', docType);
        const data = await api<DocsResponse>(`/docs?${params.toString()}`);
        setDocs(data.docs || []);
        if (data.docs?.length) {
          setSelectedId(data.docs[0].id);
        }
      } catch {
        // Fallback to sample data with local filtering
        let filtered = SAMPLE_DOCS;
        const q = search?.toLowerCase() || '';
        if (q) {
          filtered = filtered.filter((d) =>
            d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q)
          );
        }
        if (theme) {
          filtered = filtered.filter((d) => d.theme?.toLowerCase() === theme.toLowerCase());
        }
        if (docType) {
          filtered = filtered.filter((d) => d.doc_type?.toLowerCase() === docType.toLowerCase());
        }
        setDocs(filtered);
        if (filtered.length) setSelectedId(filtered[0].id);
        setBanner('Using sample data (API unavailable)');
      } finally {
        setLoading(false);
      }
    },
    [api, setDocs, setSelectedId, setBanner, setLoading, useLiveApi]
  );

  /**
   * Load document detail
   */
  const loadDocDetail = useCallback(
    async (id: number) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        const data = await api<DocDetailResponse>(`/docs/${id}`);
        setDocDetail(data);
      } catch {
        // Use doc from list as detail
        const docs = useDocsStore.getState().docs;
        const doc = docs.find((d) => d.id === id) || null;
        setDocDetail(doc);
      }
    },
    [api, setDocDetail, useLiveApi]
  );

  /**
   * Load artifact for document
   */
  const loadArtifact = useCallback(
    async (id: number) => {
      // Check cache first
      if (artifactCache[id]) {
        setArtifact(artifactCache[id]);
        return;
      }
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        const data = await api<ArtifactResponse>(`/docs/${id}/artifact`);
        setArtifact(data);
        cacheArtifact(id, data);
      } catch {
        // Fallback to sample artifacts
        const sample = SAMPLE_ARTIFACTS[id] || null;
        setArtifact(sample);
        if (sample) cacheArtifact(id, sample);
      }
    },
    [api, artifactCache, cacheArtifact, setArtifact, useLiveApi]
  );

  /**
   * Load suggestions for a document
   */
  const loadSuggestions = useCallback(
    async (docId: number) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        const data = await api<SuggestionsResponse>(`/docs/${docId}/suggestions`);
        setSuggestions(data.suggestions || []);
      } catch {
        // Fallback to sample suggestions
        setSuggestions(SAMPLE_SUGGESTIONS);
      }
    },
    [api, setSuggestions, useLiveApi]
  );

  /**
   * Accept a suggestion (moves to geo_points)
   */
  const acceptSuggestion = useCallback(
    async (docId: number, suggestionId: string) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        await api(`/docs/${docId}/suggestions/${suggestionId}/accept`, { method: 'POST' });
        // Reload suggestions and docs to reflect change
        await loadSuggestions(docId);
        await loadDocs();
        setBanner('Suggestion accepted');
      } catch (err) {
        // In demo mode, remove from local suggestions
        const suggestions = useMapStore.getState().suggestions;
        setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
        setBanner('Suggestion accepted (demo)');
      }
    },
    [api, loadSuggestions, loadDocs, setBanner, setSuggestions, useLiveApi]
  );

  /**
   * Reject a suggestion
   */
  const rejectSuggestion = useCallback(
    async (docId: number, suggestionId: string) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        await api(`/docs/${docId}/suggestions/${suggestionId}/reject`, { method: 'POST' });
        await loadSuggestions(docId);
        setBanner('Suggestion rejected');
      } catch {
        // In demo mode, remove from local suggestions
        const suggestions = useMapStore.getState().suggestions;
        setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
        setBanner('Suggestion rejected (demo)');
      }
    },
    [api, loadSuggestions, setBanner, setSuggestions, useLiveApi]
  );

  /**
   * Add a new coordinate point to document
   */
  const addCoord = useCallback(
    async (docId: number, lat: number, lng: number, label?: string) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        await api(`/docs/${docId}/coords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, label: label || 'Manual point' }),
        });
        await loadDocs();
        setBanner('Point added');
      } catch {
        setBanner('Add point is disabled in demo mode');
      }
    },
    [api, loadDocs, setBanner, useLiveApi]
  );

  /**
   * Update an existing coordinate point (for drag)
   */
  const updateCoord = useCallback(
    async (docId: number, coordId: number, lat: number, lng: number) => {
      try {
        if (!useLiveApi) throw new Error('Demo mode');
        await api(`/docs/${docId}/coords/${coordId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        });
        setBanner('Point updated');
      } catch {
        setBanner('Update point is disabled in demo mode');
      }
    },
    [api, setBanner, useLiveApi]
  );

  /**
   * Upload document files with optional pipeline intent
   */
  const uploadDocs = useCallback(
    async (files: FileList | File[] | null, theme?: string, intent?: Record<string, unknown>) => {
      if (!files || files.length === 0) return;
      if (!useLiveApi) {
        setBanner('Upload disabled in demo mode');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        const fileArr = Array.from(files);
        for (const file of fileArr) {
          formData.append('files', file);
        }
        if (theme) formData.append('theme', theme);
        if (intent) formData.append('intent', JSON.stringify(intent));
        
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/upload`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey },
          body: formData,
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Upload failed: ${text}`);
        }
        const data = (await resp.json()) as { count?: number };
        setUploadNotice(`Uploaded ${data.count || fileArr.length} file(s)`);
        // Refresh docs list
        await loadDocs();
      } catch (err) {
        setBanner((err as Error).message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [apiBase, apiKey, loadDocs, setBanner, setUploading, setUploadNotice, useLiveApi]
  );


  /**
   * Import KMZ/KML/GeoJSON file as AOI
   */
  const importKmz = useCallback(
    async (file: File, aoiName?: string) => {
      if (!useLiveApi) {
        setBanner('KMZ import disabled in demo mode');
        return;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (aoiName) formData.append('name', aoiName);
        
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/aoi/import_kmz`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey },
          body: formData,
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Import failed: ${text}`);
        }
        const data = (await resp.json()) as { features?: number };
        setBanner(`Imported ${data.features || 'N'} features from ${file.name}`);
      } catch (err) {
        setBanner((err as Error).message || 'KMZ import failed');
      }
    },
    [apiBase, apiKey, setBanner, useLiveApi]
  );

  /**
   * Get geo suggestions from mission text
   */
  interface GeoSuggestion {
    aoi_themes: string[];
    aoi_codes: string[];
    aoi_names: string[];
    band_numbers: string[];
  }

  const geoSuggest = useCallback(
    async (mission: string): Promise<GeoSuggestion | null> => {
      if (!useLiveApi) {
        // Demo mode fallback
        return {
          aoi_themes: ['ALC_Confirmed', 'Modern_Treaty'],
          aoi_codes: ['BC-001', 'BC-002'],
          aoi_names: ['Sample Reserve', 'Demo Treaty Area'],
          band_numbers: ['123', '456'],
        };
      }
      try {
        const resp = await fetch(`${apiBase.replace(/\/$/, '')}/mission/geo_suggest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({ mission }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Geo suggest failed: ${text}`);
        }
        return (await resp.json()) as GeoSuggestion;
      } catch (err) {
        setBanner((err as Error).message || 'Geo suggest failed');
        return null;
      }
    },
    [apiBase, apiKey, setBanner, useLiveApi]
  );

  const setAoiGeojson = useMapStore((s) => s.setAoiGeojson);

  /**
   * Load all AOI GeoJSON layers
   */
  const AOI_LAYERS = [
    'aoi_ALC_Confirmed',
    'aoi_ALC_Modified',
    'aoi_BC_SOI',
    'aoi_First_Nation_Office',
    'aoi_Modern_Treaty',
  ];

  // Local geo cache layers (served via API)
  const BC_INTERIOR_LAYERS = [
    'bc_territories',
    'bc_languages',
    'bc_treaties',
    'bc_interior_watersheds',
  ];

  const fetchGeoLayer = useCallback(
    async (layerName: string): Promise<GeoJSON.FeatureCollection | null> => {
      if (!useLiveApi) return null;
      try {
        return await api<GeoJSON.FeatureCollection>(`/geo/layers/${encodeURIComponent(layerName)}`);
      } catch {
        return null;
      }
    },
    [api, useLiveApi]
  );

  const loadAoiLayers = useCallback(
    async () => {
      // Load sample AOI layers first (reserves, offices)
      for (const layerName of AOI_LAYERS) {
        const sampleLayer = SAMPLE_AOI_LAYERS[layerName];
        if (sampleLayer) {
          setAoiGeojson(layerName, sampleLayer);
        }
      }

      // Load local geo cache layers (BC interior)
      let loaded = 0;
      if (useLiveApi) {
        for (const layerName of BC_INTERIOR_LAYERS) {
          const data = await fetchGeoLayer(layerName);
          if (data) {
            setAoiGeojson(layerName, data);
            loaded += 1;
          }
        }
      }

      // Also try live API if enabled
      if (useLiveApi) {
        for (const layerName of AOI_LAYERS) {
          try {
            const data = await api<GeoJSON.FeatureCollection>(`/aoi/${layerName}`);
            setAoiGeojson(layerName, data);
          } catch {
            // Layer not found, skip
          }
        }
      }

      if (loaded > 0) {
        setBanner('Loaded BC interior territories, languages, watersheds, treaties');
      } else if (useLiveApi) {
        setBanner('Geo cache layers not found. Run scripts/download_geo_data.py and scripts/filter_bc_interior.py');
      }
    },
    [api, fetchGeoLayer, setAoiGeojson, useLiveApi, setBanner]
  );

  /**
   * Get job task statuses for progress tracking
   */
  interface TaskStatus {
    id: number;
    status: 'pending' | 'processing' | 'done' | 'flagged';
    file_path: string;
    theme?: string;
    created_at: number;
    completed_at?: number;
  }

  interface JobTasksResponse {
    tasks: TaskStatus[];
    job_id: number;
    total: number;
    done: number;
    pending: number;
    flagged: number;
  }

  const loadJobTasks = useCallback(
    async (jobId: number): Promise<JobTasksResponse | null> => {
      if (!useLiveApi) return null;
      try {
        const data = await api<JobTasksResponse>(`/jobs/${jobId}/tasks`);
        return data;
      } catch {
        return null;
      }
    },
    [api, useLiveApi]
  );

  /**
   * Poll a specific task for status
   */
  interface TaskDetailResponse {
    id: number;
    status: 'pending' | 'processing' | 'done' | 'flagged';
    file_path: string;
    doc_id?: number;
    error?: string;
  }

  const pollTaskStatus = useCallback(
    async (taskId: number): Promise<TaskDetailResponse | null> => {
      if (!useLiveApi) return null;
      try {
        const data = await api<TaskDetailResponse>(`/tasks/${taskId}`);
        return data;
      } catch {
        return null;
      }
    },
    [api, useLiveApi]
  );

  /**
   * Delete a document permanently
   */
  const deleteDoc = useCallback(
    async (docId: number): Promise<boolean> => {
      if (!useLiveApi) {
        setBanner('Delete disabled in demo mode');
        return false;
      }
      try {
        await api(`/docs/${docId}`, { method: 'DELETE' });
        setBanner('Document deleted');
        await loadDocs();
        return true;
      } catch (err) {
        setBanner((err as Error).message || 'Delete failed');
        return false;
      }
    },
    [api, loadDocs, setBanner, useLiveApi]
  );

  /**
   * Update a document's metadata
   */
  interface DocUpdate {
    title?: string;
    theme?: string;
    summary?: string;
    doc_type?: string;
    inferred_date?: string;
    breach_category?: string;
    reliability?: string;
    key_quote?: string;
    privileged?: boolean;
  }

  const updateDoc = useCallback(
    async (docId: number, updates: DocUpdate): Promise<boolean> => {
      if (!useLiveApi) {
        setBanner('Edit disabled in demo mode');
        return false;
      }
      try {
        await api(`/docs/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        setBanner('Document updated');
        await loadDocs();
        return true;
      } catch (err) {
        setBanner((err as Error).message || 'Update failed');
        return false;
      }
    },
    [api, loadDocs, setBanner, useLiveApi]
  );

  /**
   * Collection management
   */
  interface Collection {
    name: string;
    tenant_id?: string;
    doc_ids: number[];
  }

  interface CollectionsResponse {
    collections: Collection[];
  }

  const listCollections = useCallback(
    async (): Promise<Collection[]> => {
      if (!useLiveApi) return [];
      try {
        const data = await api<CollectionsResponse>('/collections');
        return data.collections || [];
      } catch {
        return [];
      }
    },
    [api, useLiveApi]
  );

  const createCollection = useCallback(
    async (name: string, docIds?: number[]): Promise<Collection | null> => {
      if (!useLiveApi) {
        setBanner('Collections disabled in demo mode');
        return null;
      }
      try {
        // Create by adding first doc (or just name)
        if (docIds && docIds.length > 0) {
          const col = await api<{ collection: Collection }>(`/collections/${encodeURIComponent(name)}/docs/${docIds[0]}`, {
            method: 'POST',
          });
          // Add remaining docs
          for (let i = 1; i < docIds.length; i++) {
            await api(`/collections/${encodeURIComponent(name)}/docs/${docIds[i]}`, { method: 'POST' });
          }
          setBanner(`Collection "${name}" created with ${docIds.length} docs`);
          return col.collection;
        }
        setBanner('Please select documents to create a collection');
        return null;
      } catch (err) {
        setBanner((err as Error).message || 'Create collection failed');
        return null;
      }
    },
    [api, setBanner, useLiveApi]
  );

  const addToCollection = useCallback(
    async (collectionName: string, docId: number): Promise<boolean> => {
      if (!useLiveApi) return false;
      try {
        await api(`/collections/${encodeURIComponent(collectionName)}/docs/${docId}`, { method: 'POST' });
        setBanner(`Added to "${collectionName}"`);
        return true;
      } catch {
        return false;
      }
    },
    [api, setBanner, useLiveApi]
  );

  const removeFromCollection = useCallback(
    async (collectionName: string, docId: number): Promise<boolean> => {
      if (!useLiveApi) return false;
      try {
        await api(`/collections/${encodeURIComponent(collectionName)}/docs/${docId}`, { method: 'DELETE' });
        setBanner(`Removed from "${collectionName}"`);
        return true;
      } catch {
        return false;
      }
    },
    [api, setBanner, useLiveApi]
  );

  const deleteCollection = useCallback(
    async (name: string): Promise<boolean> => {
      if (!useLiveApi) return false;
      try {
        await api(`/collections/${encodeURIComponent(name)}`, { method: 'DELETE' });
        setBanner(`Collection "${name}" deleted`);
        return true;
      } catch {
        return false;
      }
    },
    [api, setBanner, useLiveApi]
  );

  return { 
    api, 
    apiStream,
    useLiveApi,
    loadDocs,
    loadDocDetail,
    loadArtifact,
    loadSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    addCoord,
    updateCoord,
    uploadDocs,
    importKmz,
    geoSuggest,
    fetchGeoLayer,
    loadAoiLayers,
    loadJobTasks,
    pollTaskStatus,
    deleteDoc,
    updateDoc,
    listCollections,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
  };
}
