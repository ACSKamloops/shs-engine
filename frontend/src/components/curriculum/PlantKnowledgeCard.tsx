/**
 * PlantKnowledgeCard - Display plant information from authoritative data
 * 
 * Features:
 * - Displays common/scientific names
 * - Use categories and management notes
 * - Expandable details
 * - Integration with lessons
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Plant {
  id: string;
  common: string;
  scientific?: string;
  use?: string;
  category?: string;
  managementNotes?: string;
}

interface PlantKnowledgeCardProps {
  plants: Plant[];
  title?: string;
  showCategory?: boolean;
  maxDisplay?: number;
}

export function PlantKnowledgeCard({ 
  plants, 
  title = "Plant Knowledge",
  showCategory = true,
  maxDisplay = 8
}: PlantKnowledgeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  
  const displayPlants = expanded ? plants : plants.slice(0, maxDisplay);

  if (!plants?.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          {title}
        </h3>
        <span className="text-sm text-green-600 font-medium">
          {plants.length} plants
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayPlants.map((plant, index) => (
          <motion.button
            key={plant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => setSelectedPlant(selectedPlant?.id === plant.id ? null : plant)}
            className={`text-left p-3 rounded-xl transition-all ${
              selectedPlant?.id === plant.id
                ? 'bg-white shadow-md ring-2 ring-green-300'
                : 'bg-white/60 hover:bg-white hover:shadow-sm'
            }`}
          >
            <p className="font-semibold text-green-800">{plant.common}</p>
            {plant.scientific && (
              <p className="text-xs text-gray-500 italic">{plant.scientific}</p>
            )}
            {showCategory && plant.use && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {plant.use.split(',')[0]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {selectedPlant?.managementNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
              <h4 className="font-bold text-green-800 mb-2">{selectedPlant.common}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedPlant.managementNotes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show more */}
      {plants.length > maxDisplay && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm text-green-600 font-medium hover:text-green-700 transition-colors"
        >
          {expanded ? '← Show less' : `Show all ${plants.length} plants →`}
        </button>
      )}
    </div>
  );
}

export default PlantKnowledgeCard;
