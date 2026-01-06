/**
 * PlantLibrary - Display culturally important plants with categories
 * 
 * Features:
 * - Category filtering (Berries, Root Vegetables, Medicine, etc.)
 * - Expandable plant cards with management notes
 * - Citations to source pages
 * - Integration with curriculum modules
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import plantsData from '../../data/plants/culturally_important_plants.json';

interface Plant {
  id: string;
  common: string;
  scientific: string;
  management: string;
  category: string;
  source: {
    docId: string;
    pdfPages: number[];
    printedPage: string;
  };
}

interface PlantCategoryData {
  count: number;
  plants: Plant[];
}

interface PlantLibraryProps {
  moduleId?: 'food_sovereignty' | 'land_stewardship' | 'healing_wellness';
  maxPlants?: number;
}

const categoryIcons: Record<string, string> = {
  'Berries': '🫐',
  'Root Vegetables': '🥕',
  'Green Vegetables': '🥬',
  'Mushrooms': '🍄',
  'Seeds and Nuts': '🌰',
  'Tree Inner Bark': '🌲',
  'Lichen': '🌿',
  'Medicine': '💚',
};

// Curriculum module to category mapping
const moduleCategories: Record<string, string[]> = {
  food_sovereignty: ['Berries', 'Root Vegetables', 'Green Vegetables', 'Mushrooms', 'Lichen', 'Seeds and Nuts', 'Tree Inner Bark'],
  land_stewardship: ['Woods for construction and manufacture', 'Pitch, resin, latex', 'Bark sheets for manufacture, or lining caches'],
  healing_wellness: ['Medicine', 'Scents, Cleansing agents, Miscellaneous'],
};

export function PlantLibrary({ moduleId, maxPlants = 12 }: PlantLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const byCategory = (plantsData as any).byUseCategory as Record<string, PlantCategoryData>;
  
  // Filter categories by module
  const relevantCategories = useMemo(() => {
    if (!moduleId || !moduleCategories[moduleId]) {
      return Object.keys(byCategory);
    }
    return moduleCategories[moduleId].filter(cat => byCategory[cat]);
  }, [moduleId, byCategory]);

  // Get plants for display
  const displayPlants = useMemo(() => {
    if (selectedCategory && byCategory[selectedCategory]) {
      return byCategory[selectedCategory].plants;
    }
    // Combine all relevant categories
    const allPlants: Plant[] = [];
    for (const cat of relevantCategories) {
      if (byCategory[cat]) {
        allPlants.push(...byCategory[cat].plants);
      }
    }
    return showAll ? allPlants : allPlants.slice(0, maxPlants);
  }, [selectedCategory, relevantCategories, byCategory, showAll, maxPlants]);

  const totalPlants = relevantCategories.reduce((sum, cat) => sum + (byCategory[cat]?.count || 0), 0);

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          All ({totalPlants})
        </button>
        {relevantCategories.slice(0, 6).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              selectedCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <span>{categoryIcons[cat] || '🌿'}</span>
            {cat.split(' ')[0]} ({byCategory[cat]?.count || 0})
          </button>
        ))}
      </div>

      {/* Plants grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {displayPlants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white rounded-xl border border-green-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedPlant(expandedPlant === plant.id ? null : plant.id)}
                className="w-full text-left p-3 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-green-800">{plant.common}</p>
                    <p className="text-xs text-gray-500 italic">{plant.scientific}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                    p.{plant.source?.printedPage || '?'}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {expandedPlant === plant.id && plant.management && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-2 border-t border-green-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-green-700">Management: </span>
                        {plant.management}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more */}
      {totalPlants > maxPlants && !selectedCategory && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-green-600 font-medium text-sm hover:text-green-700"
        >
          {showAll ? '← Show less' : `Show all ${totalPlants} plants →`}
        </button>
      )}

      {/* Source attribution */}
      <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
        Source: Secwepemc-web Appendix - Culturally Important Plants (126 species)
      </p>
    </div>
  );
}

export default PlantLibrary;
