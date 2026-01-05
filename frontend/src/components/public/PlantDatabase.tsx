/**
 * PlantDatabase - Interactive Plant Species Database Component
 * Displays Secwépemc ethnobotanical knowledge with scientific names
 * Features: Category filtering, search, species cards with uses
 */
import { useState, useMemo } from 'react';
import vocabularyData from '../../data/vocabulary_master.json';

interface PlantSpecies {
  secwepemc: string | null;
  english: string;
  scientific?: string;
  harvestRate?: string;
  indicator?: string;
  source?: string;
}

interface PlantDatabaseProps {
  showTrees?: boolean;
  showFoodPlants?: boolean;
}

// Category configuration
const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
  trees: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🌲', label: 'Trees' },
  plants_food: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🌿', label: 'Food Plants' },
};

export function PlantDatabase({
  showTrees = true,
  showFoodPlants = true,
}: PlantDatabaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<'trees' | 'plants_food' | 'all'>('all');
  const [selectedPlant, setSelectedPlant] = useState<PlantSpecies | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract plant data from vocabulary master
  const trees: PlantSpecies[] = vocabularyData.categories.trees?.terms || [];
  const foodPlants: PlantSpecies[] = vocabularyData.categories.plants_food?.terms || [];

  // Combine based on props
  const allPlants = useMemo(() => {
    let plants: Array<PlantSpecies & { category: string }> = [];
    if (showTrees) {
      plants = [...plants, ...trees.map(p => ({ ...p, category: 'trees' }))];
    }
    if (showFoodPlants) {
      plants = [...plants, ...foodPlants.map(p => ({ ...p, category: 'plants_food' }))];
    }
    return plants;
  }, [trees, foodPlants, showTrees, showFoodPlants]);

  // Filter plants
  const filteredPlants = useMemo(() => {
    let result = allPlants;

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.english.toLowerCase().includes(query) ||
        (p.secwepemc && p.secwepemc.toLowerCase().includes(query)) ||
        (p.scientific && p.scientific.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allPlants, selectedCategory, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h3 className="font-bold text-lg">Plant Database</h3>
            <p className="text-sm opacity-90">
              {allPlants.length} species with Secwépemctsín names
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-shs-sand/30 border-b border-shs-stone/20">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name (Secwépemctsín, English, or Scientific)..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-shs-stone/30 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shs-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-shs-stone/30 text-shs-text-body hover:bg-shs-stone/10'
              }`}
            >
              All Species
            </button>
            {showTrees && (
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'trees' ? 'all' : 'trees')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'trees'
                    ? 'bg-green-600 text-white'
                    : `border ${categoryConfig.trees.color}`
                }`}
              >
                {categoryConfig.trees.icon} {categoryConfig.trees.label}
              </button>
            )}
            {showFoodPlants && (
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'plants_food' ? 'all' : 'plants_food')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'plants_food'
                    ? 'bg-green-600 text-white'
                    : `border ${categoryConfig.plants_food.color}`
                }`}
              >
                {categoryConfig.plants_food.icon} {categoryConfig.plants_food.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plant Grid */}
      <div className="p-6">
        {filteredPlants.length === 0 ? (
          <div className="text-center py-8 text-shs-text-muted">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>No plants found.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant, i) => {
              const isSelected = selectedPlant?.english === plant.english;
              const config = categoryConfig[plant.category];

              return (
                <div
                  key={i}
                  onClick={() => setSelectedPlant(isSelected ? null : plant)}
                  className={`cursor-pointer rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-green-50 border-green-300 shadow-lg'
                      : 'bg-white border-shs-stone/20 hover:border-green-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-4">
                    {/* Plant Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {plant.secwepemc ? (
                          <>
                            <h4 className="font-bold text-shs-forest-800">{plant.secwepemc}</h4>
                            <p className="text-sm text-shs-text-muted">{plant.english}</p>
                          </>
                        ) : (
                          <h4 className="font-bold text-shs-forest-800">{plant.english}</h4>
                        )}
                        {plant.scientific && (
                          <p className="text-xs text-shs-text-muted italic mt-0.5">
                            {plant.scientific}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>

                    {/* Expanded Content */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-shs-stone/20 animate-fadeIn">
                        {plant.indicator && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-green-700">Ecological Indicator:</span>
                            <p className="text-sm text-shs-text-body">{plant.indicator}</p>
                          </div>
                        )}
                        {plant.harvestRate && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-green-700">Harvest Rate:</span>
                            <p className="text-sm text-shs-text-body">{plant.harvestRate}</p>
                          </div>
                        )}
                        {plant.source && (
                          <p className="text-xs text-shs-text-muted">
                            📖 Source: {plant.source}
                          </p>
                        )}
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
          Showing {filteredPlants.length} of {allPlants.length} species
          {selectedCategory !== 'all' && ` • ${categoryConfig[selectedCategory]?.label}`}
        </p>
      </div>
    </div>
  );
}

export default PlantDatabase;
