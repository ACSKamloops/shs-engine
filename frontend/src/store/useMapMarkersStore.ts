/**
 * Map Markers Store - Admin Map Management
 * Zustand store for managing map markers and custom layers
 * Phase 1: localStorage persistence
 * Phase 2: Supabase integration (future)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'camp' | 'project' | 'partner' | 'cultural-site' | 'event';
  link?: string;
  isPublic: boolean;
  // Camp-specific fields
  season?: string;
  duration?: string;
  campType?: string;
  activities?: string[];
  // Multimedia (future)
  multimedia?: { type: 'image' | 'video' | 'audio'; url: string }[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CustomLayer {
  id: string;
  name: string;
  geojson: GeoJSON.FeatureCollection;
  isPublic: boolean;
  color?: string;
  opacity?: number;
  createdAt: string;
}

interface MapMarkersState {
  // Data
  markers: MapMarker[];
  customLayers: CustomLayer[];
  
  // Selection state
  selectedMarkerId: string | null;
  selectedLayerId: string | null;
  isAddingMarker: boolean;
  
  // Marker CRUD
  addMarker: (marker: Omit<MapMarker, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMarker: (id: string, updates: Partial<MapMarker>) => void;
  deleteMarker: (id: string) => void;
  moveMarker: (id: string, lat: number, lng: number) => void;
  
  // Layer CRUD
  addLayer: (layer: Omit<CustomLayer, 'id' | 'createdAt'>) => string;
  updateLayer: (id: string, updates: Partial<CustomLayer>) => void;
  deleteLayer: (id: string) => void;
  
  // Selection
  selectMarker: (id: string | null) => void;
  selectLayer: (id: string | null) => void;
  setAddingMarker: (adding: boolean) => void;
  
  // Bulk operations
  importMarkers: (markers: MapMarker[]) => void;
  clearAllMarkers: () => void;
  
  // Getters
  getPublicMarkers: () => MapMarker[];
  getPublicLayers: () => CustomLayer[];
  getMarkerById: (id: string) => MapMarker | undefined;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Default markers (migrate from hardcoded data)
const defaultMarkers: MapMarker[] = [
  {
    id: 'chase-office',
    lat: 50.8185,
    lng: -119.6868,
    title: 'SHS Home Base - Chase',
    description: 'Main coordination point for Secwépemc Hunting Society activities. Contact us here for camp registrations and general inquiries.',
    type: 'partner',
    link: '/contact',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'adams-lake-food',
    lat: 50.9275,
    lng: -119.7167,
    title: 'Adams Lake - Food Sovereignty Camp',
    description: 'Learn traditional hunting, fishing, gathering, and food preservation practices from experienced practitioners.',
    type: 'camp',
    link: '/cultural-camps#food-sovereignty',
    isPublic: true,
    season: 'Spring & Fall',
    duration: '3-5 days',
    campType: 'Food Sovereignty',
    activities: ['Hunting protocols', 'Traditional fishing', 'Plant gathering', 'Food preservation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salmon-arm-youth',
    lat: 50.7027,
    lng: -119.2727,
    title: 'Salmon Arm - Youth Mentorship Site',
    description: 'Training programs for the next generation of hunters, gatherers, and cultural leaders with Elder-youth mentorship.',
    type: 'camp',
    link: '/cultural-camps#youth',
    isPublic: true,
    season: 'Summer',
    duration: '7-10 days',
    campType: 'Youth Mentorship',
    activities: ['Elder-youth mentorship', 'Practical skills', 'Leadership development'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kamloops-partner',
    lat: 50.6761,
    lng: -120.3408,
    title: 'Tk̓emlúps te Secwépemc',
    description: 'Partner Nation and cultural collaboration site. Key partner in Heritage Stewardship Program.',
    type: 'partner',
    link: '/projects',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'williams-lake-culture',
    lat: 52.1417,
    lng: -122.1417,
    title: 'Williams Lake - Cultural Preservation',
    description: 'Immerse yourself in Secwépemc language, arts, storytelling, and traditional practices.',
    type: 'camp',
    link: '/cultural-camps#culture',
    isPublic: true,
    season: 'Summer',
    duration: '5-7 days',
    campType: 'Cultural Preservation',
    activities: ['Secwepemctsín language', 'Traditional arts', 'Story sharing with Elders'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shuswap-stewardship',
    lat: 51.2000,
    lng: -119.9500,
    title: 'Shuswap Region - Land Stewardship',
    description: 'Deepen your connection through seasonal knowledge and responsible land care practices.',
    type: 'camp',
    link: '/cultural-camps#stewardship',
    isPublic: true,
    season: 'Year-round',
    duration: '2-4 days',
    campType: 'Land Stewardship',
    activities: ['Traditional ecological knowledge', 'Seasonal harvesting', 'Wildlife stewardship'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'healing-camp',
    lat: 50.5500,
    lng: -120.8000,
    title: 'Healing & Wellness Gathering Site',
    description: 'Support your holistic wellbeing through circle gatherings, outdoor therapy, and community connection.',
    type: 'camp',
    link: '/cultural-camps#wellness',
    isPublic: true,
    season: 'Spring & Summer',
    duration: '3-5 days',
    campType: 'Healing & Wellness',
    activities: ['Circle gatherings', 'Land-based healing', 'Traditional medicine teachings'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'heritage-site',
    lat: 51.5000,
    lng: -121.3000,
    title: 'Heritage Stewardship Site',
    description: 'Part of the Heritage Stewardship Program funded by FPCC. Supporting cultural revitalization initiatives.',
    type: 'project',
    link: '/projects',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'braided-infrastructure',
    lat: 50.3500,
    lng: -119.5000,
    title: 'Braided Infrastructure Project',
    description: 'Integrating Indigenous knowledge systems with community infrastructure development.',
    type: 'project',
    link: '/projects',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useMapMarkersStore = create<MapMarkersState>()(
  persist(
    (set, get) => ({
      // Initial state
      markers: defaultMarkers,
      customLayers: [],
      selectedMarkerId: null,
      selectedLayerId: null,
      isAddingMarker: false,

      // Marker CRUD
      addMarker: (markerData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const marker: MapMarker = {
          ...markerData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ markers: [...state.markers, marker] }));
        return id;
      },

      updateMarker: (id, updates) => {
        set((state) => ({
          markers: state.markers.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          ),
        }));
      },

      deleteMarker: (id) => {
        set((state) => ({
          markers: state.markers.filter((m) => m.id !== id),
          selectedMarkerId: state.selectedMarkerId === id ? null : state.selectedMarkerId,
        }));
      },

      moveMarker: (id, lat, lng) => {
        set((state) => ({
          markers: state.markers.map((m) =>
            m.id === id
              ? { ...m, lat, lng, updatedAt: new Date().toISOString() }
              : m
          ),
        }));
      },

      // Layer CRUD
      addLayer: (layerData) => {
        const id = generateId();
        const layer: CustomLayer = {
          ...layerData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customLayers: [...state.customLayers, layer] }));
        return id;
      },

      updateLayer: (id, updates) => {
        set((state) => ({
          customLayers: state.customLayers.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },

      deleteLayer: (id) => {
        set((state) => ({
          customLayers: state.customLayers.filter((l) => l.id !== id),
          selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        }));
      },

      // Selection
      selectMarker: (id) => set({ selectedMarkerId: id, selectedLayerId: null }),
      selectLayer: (id) => set({ selectedLayerId: id, selectedMarkerId: null }),
      setAddingMarker: (adding) => set({ isAddingMarker: adding }),

      // Bulk operations
      importMarkers: (markers) => {
        set((state) => ({
          markers: [...state.markers, ...markers],
        }));
      },

      clearAllMarkers: () => set({ markers: [], selectedMarkerId: null }),

      // Getters
      getPublicMarkers: () => get().markers.filter((m) => m.isPublic),
      getPublicLayers: () => get().customLayers.filter((l) => l.isPublic),
      getMarkerById: (id) => get().markers.find((m) => m.id === id),
    }),
    {
      name: 'shs-map-markers',
      version: 1,
    }
  )
);
