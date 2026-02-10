/**
 * PlantDatabasePage - Culturally Important Plants (Modernized Jan 2026)
 * Features: Framer Motion, animated filters, expand/collapse animations
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import plantData from '../../data/plants/culturally_important.json';
import { SectionReveal, FloatingIcon } from '../../components/ui/AnimatedComponents';

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

const categoryColors: Record<string, { bg: string; text: string; active: string }> = {
  'FOOD': { bg: 'bg-emerald-100', text: 'text-emerald-700', active: 'from-emerald-500 to-teal-500' },
  'MATERIALS': { bg: 'bg-amber-100', text: 'text-amber-700', active: 'from-amber-500 to-orange-500' },
  'SMOKING': { bg: 'bg-purple-100', text: 'text-purple-700', active: 'from-purple-500 to-pink-500' },
  'MEDICINE': { bg: 'bg-sky-100', text: 'text-sky-700', active: 'from-sky-500 to-blue-500' },
};

const categoryIcons: Record<string, string> = {
  'FOOD': '🍃',
  'MATERIALS': '🪵',
  'SMOKING': '💨',
  'MEDICINE': '💚',
};

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🌿</div>
          <div className="absolute bottom-10 left-10 text-9xl">🌱</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-4"
          >
            🌿
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-2"
          >
            Culturally Important Plants
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-emerald-200"
          >
            120+ Plants with Traditional Management Practices
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-emerald-300 mt-2"
          >
            Source: Secwépemc People and Plants Research Papers
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <motion.input
              type="text"
              placeholder="Search plants by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-shs-stone/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white shadow-sm"
              whileFocus={{ scale: 1.01 }}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !selectedCategory 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({plants.length})
            </motion.button>
            {categories.map(cat => {
              const colors = categoryColors[cat] || { bg: 'bg-gray-100', text: 'text-gray-600', active: 'from-gray-500 to-gray-600' };
              return (
                <motion.button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
                    selectedCategory === cat
                      ? `bg-gradient-to-r ${colors.active} text-white shadow-lg`
                      : `${colors.bg} ${colors.text}`
                  }`}
                >
                  <span>{categoryIcons[cat]}</span>
                  {cat} ({plants.filter(p => p.category === cat).length})
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredPlants.length} of {plants.length} plant uses
        </p>

        {/* Plant Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPlants.map((plant, idx) => {
              const colors = categoryColors[plant.category] || { bg: 'bg-gray-100', text: 'text-gray-600', active: '' };
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                  className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <motion.button
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4"
                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.03)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} flex items-center gap-1`}>
                          <span>{categoryIcons[plant.category]}</span>
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
                    <motion.svg 
                      className="w-6 h-6 text-gray-400 flex-shrink-0"
                      animate={{ rotate: expandedRow === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {expandedRow === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-shs-stone/20 overflow-hidden"
                      >
                        <div className="p-5 bg-gradient-to-br from-gray-50 to-emerald-50/30">
                          {/* Examples */}
                          <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                            <FloatingIcon icon="🌱" size="sm" />
                            Plant Species
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                            {plant.examples.filter(e => e.scientific || e.common).map((ex, exIdx) => (
                              <motion.div 
                                key={exIdx} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: exIdx * 0.05 }}
                                className="bg-white p-3 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors"
                              >
                                {ex.scientific && (
                                  <p className="font-medium text-emerald-800 italic text-sm">{ex.scientific}</p>
                                )}
                                {ex.common && (
                                  <p className="text-gray-600 text-sm">{ex.common}</p>
                                )}
                              </motion.div>
                            ))}
                          </div>

                          {/* Management Notes */}
                          <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                            <FloatingIcon icon="📋" size="sm" />
                            Traditional Management Practices
                          </h4>
                          <p className="text-shs-text-body bg-amber-50 p-4 rounded-xl border border-amber-200">
                            {plant.managementNotes}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <SectionReveal>
        <section className="py-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-emerald-700 flex items-center justify-center gap-2">
              <FloatingIcon icon="🌿" size="sm" />
              <span>Traditional plant knowledge preserved with respect for Secwépemc cultural protocols.</span>
            </p>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
