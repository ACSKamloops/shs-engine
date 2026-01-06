import { useState, useMemo } from 'react';
import plantsData from '../../data/cultural_reference/plants_database.json';
import ElderQuoteCard, { curatedQuotes } from '../../components/cultural/ElderQuoteCard';

interface Plant {
  id: string;
  category: string;
  use: string;
  scientific: string;
  common: string;
  managementNotes: string;
  source: {
    pdfPages: number[];
    printedPage: string;
  };
}

const plants = plantsData.plants as Plant[];

// Get unique categories and uses
const categories = [...new Set(plants.map(p => p.category))].sort();
const usesByCategory: Record<string, string[]> = {};
plants.forEach(p => {
  if (!usesByCategory[p.category]) usesByCategory[p.category] = [];
  if (!usesByCategory[p.category].includes(p.use)) {
    usesByCategory[p.category].push(p.use);
  }
});

// Category icons
const categoryIcons: Record<string, string> = {
  'FOOD': '🍽️',
  'MEDICINE': '💊',
  'MATERIALS': '🧵',
  'TOOLS': '🔧',
  'BURNING': '🔥',
};

// Category colors
const categoryColors: Record<string, string> = {
  'FOOD': 'from-green-600 to-emerald-500',
  'MEDICINE': 'from-violet-600 to-purple-500',
  'MATERIALS': 'from-amber-600 to-orange-500',
  'TOOLS': 'from-slate-600 to-gray-500',
  'BURNING': 'from-red-600 to-orange-500',
};

const categoryBg: Record<string, string> = {
  'FOOD': 'bg-green-50 border-green-200',
  'MEDICINE': 'bg-violet-50 border-violet-200',
  'MATERIALS': 'bg-amber-50 border-amber-200',
  'TOOLS': 'bg-slate-50 border-slate-200',
  'BURNING': 'bg-red-50 border-red-200',
};

export default function PlantsExplorerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUse, setSelectedUse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const filteredPlants = useMemo(() => {
    let result = plants;
    
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (selectedUse) {
      result = result.filter(p => p.use === selectedUse);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.common.toLowerCase().includes(q) || 
        p.scientific.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [selectedCategory, selectedUse, searchQuery]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    plants.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-shs-cream via-white to-shs-sand/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 text-white py-16 px-6">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🌿</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Secwépemc Plants Database
              </h1>
              <p className="text-xl opacity-90 font-light mt-1">
                126 Culturally Important Species & Their Traditional Uses
              </p>
            </div>
          </div>
          <p className="text-sm opacity-70 max-w-2xl mt-4">
            Source: <em>Secwépemc People and Plants: Research Papers in Shuswap Ethnobotany</em> — Appendix Summary
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? null : cat);
                setSelectedUse(null);
              }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedCategory === cat
                  ? 'border-shs-forest-600 bg-white shadow-lg scale-105'
                  : `${categoryBg[cat]} hover:shadow-md hover:scale-[1.02]`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryIcons[cat] || '🌱'}</span>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">{categoryCounts[cat]}</p>
                  <p className="text-sm text-gray-600">{cat}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Plants</label>
              <input
                type="text"
                placeholder="Search by common or scientific name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {selectedCategory && usesByCategory[selectedCategory] && (
              <div className="md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Use</label>
                <select
                  value={selectedUse || ''}
                  onChange={e => setSelectedUse(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Uses</option>
                  {usesByCategory[selectedCategory].map(use => (
                    <option key={use} value={use}>{use}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Showing <strong>{filteredPlants.length}</strong> of {plants.length} plants
            {selectedCategory && <span className="text-emerald-600"> in {selectedCategory}</span>}
          </p>
        </div>

        {/* Plants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlants.slice(0, 30).map(plant => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlant(plant)}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-lg hover:scale-[1.01] ${
                selectedPlant?.id === plant.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : `${categoryBg[plant.category]} hover:border-gray-300`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{categoryIcons[plant.category] || '🌱'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{plant.common}</h3>
                  <p className="text-sm text-gray-500 italic truncate">{plant.scientific}</p>
                  <p className="text-xs text-emerald-600 mt-1">{plant.use}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {filteredPlants.length > 30 && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            Showing first 30 results. Use search or filters to narrow down.
          </p>
        )}

        {/* Selected Plant Detail */}
        {selectedPlant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className={`bg-gradient-to-r ${categoryColors[selectedPlant.category]} p-6 text-white rounded-t-3xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{categoryIcons[selectedPlant.category]}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPlant.common}</h2>
                      <p className="text-white/80 italic">{selectedPlant.scientific}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPlant(null)}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {selectedPlant.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {selectedPlant.use}
                  </span>
                </div>
                
                <div className="bg-shs-sand/30 rounded-2xl p-5">
                  <h3 className="font-bold text-shs-forest-800 mb-2 flex items-center gap-2">
                    <span>🌱</span> Traditional Management
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedPlant.managementNotes}
                  </p>
                </div>
                
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span>📖</span>
                  Source: Appendix, p. {selectedPlant.source.printedPage} (PDF p. {selectedPlant.source.pdfPages[0]})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Elder Wisdom - Respect for Food */}
        {curatedQuotes.foodways?.[0] && (
          <div className="mt-12">
            <ElderQuoteCard 
              quote={curatedQuotes.foodways[0]} 
              variant="featured"
            />
          </div>
        )}

        {/* About Section */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
          <h3 className="font-bold text-shs-forest-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            About This Database
          </h3>
          <p className="text-shs-text-body text-sm leading-relaxed">
            This database documents <strong>126 culturally important plant species</strong> used by the 
            Secwépemc people for food, medicine, materials, tools, and fire management. Each entry includes 
            traditional management practices that reflect generations of ecological knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
