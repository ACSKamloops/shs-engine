/**
 * DictionaryPage - Secwepemctsín Dictionary (Modernized Jan 2026)
 * Features: Framer Motion, animated search, staggered card entries
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dictionaryData from '../../data/dictionary_gold_standard.json';
import { SectionReveal, FloatingIcon } from '../../components/ui/AnimatedComponents';

interface DictionaryEntry {
  word: string;
  pronunciation: string;
  meaning: string;
}

const entries = dictionaryData.words as DictionaryEntry[];

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries.slice(0, 100); // Show first 100 by default
    const term = searchTerm.toLowerCase();
    return entries.filter(e => 
      e.word.toLowerCase().includes(term) || 
      e.meaning.toLowerCase().includes(term)
    ).slice(0, 100); // Limit results for performance
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-shs-cream to-white">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">📖</div>
          <div className="absolute bottom-10 left-10 text-9xl">🗣️</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-4"
          >
            📚
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Secwepemctsín Dictionary
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-shs-forest-200 mb-2"
          >
            Gold Standard • Eastern Dialect
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-shs-forest-300"
          >
            {dictionaryData.metadata.totalWords.toLocaleString()} validated entries available
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border transition-all duration-300 ${
            isFocused ? 'border-emerald-400 shadow-emerald-500/20' : 'border-white/50'
          }`}
        >
          <div className="relative">
            <motion.input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search for a word or meaning..."
              className="w-full px-6 py-4 pl-14 bg-shs-sand/30 border-2 border-transparent focus:border-emerald-400 focus:bg-white rounded-xl text-lg font-medium transition-all outline-none"
              whileFocus={{ scale: 1.01 }}
            />
            <motion.span 
              className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl"
              animate={{ rotate: isFocused ? 15 : 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              🔍
            </motion.span>
          </div>
          <div className="mt-3 flex justify-between text-sm text-gray-500 px-2">
            <span>{searchTerm ? `Found ${filteredEntries.length} matches` : 'Showing top 100 entries'}</span>
            <span>Total words: {entries.length.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4">
            {filteredEntries.map((entry, idx) => (
              <motion.div 
                key={`${entry.word}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: Math.min(idx * 0.03, 0.5), duration: 0.3 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-shs-stone/20 hover:border-emerald-300 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <motion.h3 
                      className="text-2xl font-bold text-shs-forest-800 font-serif mb-1 group-hover:text-emerald-700 transition-colors"
                    >
                      {entry.word}
                    </motion.h3>
                    {entry.pronunciation && entry.pronunciation !== entry.word && (
                      <p className="text-sm text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">
                        /{entry.pronunciation}/
                      </p>
                    )}
                  </div>
                  <div className="md:text-right">
                    <p className="text-lg text-gray-800 font-medium">
                      {entry.meaning}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredEntries.length === 0 && (
              <SectionReveal>
                <div className="text-center py-20">
                  <motion.span 
                    className="text-6xl block mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    🤷
                  </motion.span>
                  <p className="text-xl text-gray-500">No words found for "{searchTerm}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              </SectionReveal>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <SectionReveal>
        <section className="py-8 bg-gradient-to-r from-shs-forest-50 to-emerald-50 border-t border-shs-forest-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-shs-forest-700 flex items-center justify-center gap-2">
              <FloatingIcon icon="💚" size="sm" />
              <span>This dictionary is maintained with respect for Secwépemc language and cultural protocols.</span>
            </p>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
