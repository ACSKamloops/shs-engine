/**
 * PlaceNameExplorer - Interactive Secwépemc Place Names Component
 * Displays place names with geography, resources, and cultural significance
 * Features: Type filtering, resource associations, community connections
 */
import { useState, useMemo } from 'react';
import placeNamesData from '../../data/place_names.json';

interface Place {
  id: string;
  secwepemc: string | null;
  english: string;
  type: string;
  region?: string;
  resources?: string[];
  description: string;
  historicalNote?: string;
  significance?: string;
  source: { chapter: number; page: number };
}

interface PlaceNameExplorerProps {
  places?: Place[];
  showTerritory?: boolean;
  maxItems?: number;
}

// Place type configuration
const typeConfig: Record<string, { color: string; icon: string; label: string }> = {
  community: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🏘️', label: 'Community' },
  harvesting_ground: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🌾', label: 'Harvesting Ground' },
  sacred_site: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '✨', label: 'Sacred Site' },
  harvesting_area: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🍇', label: 'Harvesting Area' },
  legendary_site: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '📖', label: 'Legendary Site' },
  restoration_site: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: '🔄', label: 'Restoration Site' },
  political_entity: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🏛️', label: 'Political Entity' },
};

export function PlaceNameExplorer({
  places,
  showTerritory = true,
  maxItems,
}: PlaceNameExplorerProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use provided places or load from data file
  const allPlaces: Place[] = places || placeNamesData.places;
  const territory = placeNamesData.territory;

  // Get unique types
  const availableTypes = useMemo(() => {
    const types = new Set(allPlaces.map(p => p.type));
    return Array.from(types).sort();
  }, [allPlaces]);

  // Filter places
  const filteredPlaces = useMemo(() => {
    let result = allPlaces;
    
    if (selectedType) {
      result = result.filter(p => p.type === selectedType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.english.toLowerCase().includes(query) ||
        (p.secwepemc && p.secwepemc.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query)
      );
    }
    
    // Apply max limit
    if (maxItems && result.length > maxItems) {
      result = result.slice(0, maxItems);
    }
    
    return result;
  }, [allPlaces, selectedType, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-700 to-shs-forest-800 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <h3 className="font-bold text-lg">Secwépemc Place Names</h3>
            <p className="text-sm opacity-90">
              {allPlaces.length} places across Secwepemcúl̓ecw
            </p>
          </div>
        </div>
      </div>

      {/* Territory Overview */}
      {showTerritory && territory && (
        <div className="p-4 bg-shs-sand/50 border-b border-shs-stone/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-shs-forest-100 flex items-center justify-center text-2xl">
              🏔️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-shs-forest-800 text-lg">{territory.name}</h4>
              <p className="text-sm text-shs-forest-600 italic">{territory.english}</p>
              <p className="text-sm text-shs-text-body mt-1">{territory.description}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-shs-text-muted">
                <span>📐 {territory.area}</span>
                <span>🌲 {territory.biogeoclimaticZones} biogeoclimatic zones</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 bg-shs-sand/30 border-b border-shs-stone/20">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-shs-stone/30 focus:ring-2 focus:ring-shs-forest-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shs-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === null
                  ? 'bg-shs-forest-600 text-white'
                  : 'bg-white border border-shs-stone/30 text-shs-text-body hover:bg-shs-stone/10'
              }`}
            >
              All Types
            </button>
            {availableTypes.map(type => {
              const config = typeConfig[type] || { 
                color: 'bg-gray-100 text-gray-700 border-gray-200', 
                icon: '📍', 
                label: type 
              };
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedType === type
                      ? 'bg-shs-forest-600 text-white'
                      : `border ${config.color}`
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Places Grid */}
      <div className="p-6">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-8 text-shs-text-muted">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>No places found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => {
              const config = typeConfig[place.type] || { 
                color: 'bg-gray-100 text-gray-700 border-gray-200', 
                icon: '📍', 
                label: place.type 
              };
              const isSelected = selectedPlace?.id === place.id;
              
              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(isSelected ? null : place)}
                  className={`cursor-pointer rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-shs-forest-50 border-shs-forest-300 shadow-lg'
                      : 'bg-white border-shs-stone/20 hover:border-shs-forest-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-4">
                    {/* Place Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {place.secwepemc ? (
                          <>
                            <h4 className="font-bold text-shs-forest-800">{place.secwepemc}</h4>
                            <p className="text-sm text-shs-text-muted">{place.english}</p>
                          </>
                        ) : (
                          <h4 className="font-bold text-shs-forest-800">{place.english}</h4>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>

                    {/* Region */}
                    {place.region && (
                      <p className="text-xs text-shs-text-muted mb-2">
                        📍 {place.region}
                      </p>
                    )}

                    {/* Description */}
                    <p className={`text-sm text-shs-text-body ${!isSelected ? 'line-clamp-2' : ''}`}>
                      {place.description}
                    </p>

                    {/* Expanded Content */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-shs-stone/20 animate-fadeIn">
                        {/* Resources */}
                        {place.resources && place.resources.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-shs-forest-700 mb-1">Resources</h5>
                            <div className="flex flex-wrap gap-1">
                              {place.resources.map((r, i) => (
                                <span key={i} className="px-2 py-0.5 bg-shs-sand rounded text-xs text-shs-forest-700">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Historical Note */}
                        {place.historicalNote && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-shs-forest-700 mb-1">Historical Note</h5>
                            <p className="text-xs text-shs-text-muted italic">{place.historicalNote}</p>
                          </div>
                        )}

                        {/* Significance */}
                        {place.significance && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-shs-forest-700 mb-1">Significance</h5>
                            <p className="text-xs text-shs-text-muted">{place.significance}</p>
                          </div>
                        )}

                        {/* Source */}
                        <p className="text-xs text-shs-text-muted">
                          📖 Chapter {place.source.chapter}, p.{place.source.page}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-shs-sand/30 border-t border-shs-stone/20 text-center">
        <p className="text-sm text-shs-text-muted">
          Showing {filteredPlaces.length} of {allPlaces.length} places
          {selectedType && ` • Filtered by: ${typeConfig[selectedType]?.label || selectedType}`}
        </p>
      </div>
    </div>
  );
}

export default PlaceNameExplorer;
