import { useState, useMemo } from 'react';
import plantData from '../../data/plants/culturally_important.json';

interface PlantExample {
  scientific?: string;
  common?: string;
  raw: string;
}

interface PlantRow {
  category: string;
  use: string;
  countRaw?: string;
  examples: PlantExample[];
  managementNotes: string;
}

const plants = plantData.rows as PlantRow[];

// Get unique categories
const categories = [...new Set(plants.map(p => p.category))];

export default function PlantDatabasePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesCategory = !selectedCategory || plant.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        plant.use.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.examples.some(e => 
          e.scientific?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.common?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryColors: Record<string, string> = {
    'FOOD': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'MATERIALS': 'bg-amber-100 text-amber-700 border-amber-300',
    'SMOKING': 'bg-purple-100 text-purple-700 border-purple-300',
    'MEDICINE': 'bg-sky-100 text-sky-700 border-sky-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Culturally Important Plants</h1>
          <p className="text-xl opacity-90">120+ Plants with Traditional Management Practices</p>
          <p className="text-sm opacity-75 mt-2">
            Source: Secwépemc People and Plants Research Papers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search plants by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-shs-stone/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !selectedCategory 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({plants.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : categoryColors[cat] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat} ({plants.filter(p => p.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredPlants.length} of {plants.length} plant uses
        </p>

        {/* Plant Cards */}
        <div className="space-y-4">
          {filteredPlants.map((plant, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                className="w-full p-5 text-left flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[plant.category] || 'bg-gray-100'}`}>
                      {plant.category}
                    </span>
                    {plant.countRaw && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {plant.countRaw}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-shs-forest-800">{plant.use}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {plant.examples.slice(0, 3).map(e => e.common || e.scientific).filter(Boolean).join(', ')}
                    {plant.examples.length > 3 && ` +${plant.examples.length - 3} more`}
                  </p>
                </div>
                <svg 
                  className={`w-6 h-6 text-gray-400 transition-transform ${expandedRow === idx ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedRow === idx && (
                <div className="border-t border-shs-stone/20 p-5 bg-gray-50 animate-fadeIn">
                  {/* Examples */}
                  <h4 className="font-semibold text-emerald-700 mb-3">Plant Species</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                    {plant.examples.filter(e => e.scientific || e.common).map((ex, exIdx) => (
                      <div key={exIdx} className="bg-white p-3 rounded-lg border border-emerald-200">
                        {ex.scientific && (
                          <p className="font-medium text-emerald-800 italic text-sm">{ex.scientific}</p>
                        )}
                        {ex.common && (
                          <p className="text-gray-600 text-sm">{ex.common}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Management Notes */}
                  <h4 className="font-semibold text-amber-700 mb-2">Traditional Management Practices</h4>
                  <p className="text-shs-text-body bg-amber-50 p-4 rounded-xl">
                    {plant.managementNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
