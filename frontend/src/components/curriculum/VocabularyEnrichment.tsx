/**
 * VocabularyEnrichment - Enhanced vocabulary display with themed groupings
 * 
 * Features:
 * - Auto-load themed vocabulary from authoritative dictionary
 * - Display by theme (food, land, animals, etc.)
 * - Integration with PracticeQuiz
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import themedVocabData from '../../data/curriculum/themed_vocabulary.json';

interface VocabTerm {
  secwepemc: string;
  english: string;
  partOfSpeech?: string;
  page?: number;
}

interface VocabularyEnrichmentProps {
  lessonTheme?: 'food_sovereignty' | 'land_stewardship' | 'animals' | 'body_wellness' | 'actions';
  customTerms?: VocabTerm[];
  maxTerms?: number;
  onPractice?: (terms: VocabTerm[]) => void;
}

const themeIcons: Record<string, string> = {
  food_sovereignty: '🍖',
  land_stewardship: '🌲',
  animals: '🦌',
  body_wellness: '💚',
  actions: '🏃',
};

const themeColors: Record<string, { bg: string; text: string; light: string }> = {
  food_sovereignty: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  land_stewardship: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  animals: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
  body_wellness: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  actions: { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' },
};

export function VocabularyEnrichment({
  lessonTheme,
  customTerms,
  maxTerms = 12,
  onPractice,
}: VocabularyEnrichmentProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(lessonTheme || 'food_sovereignty');
  const [showAll, setShowAll] = useState(false);

  const themeData = (themedVocabData as any).themeVocabulary;
  const availableThemes = Object.keys(themeData);

  const terms = useMemo(() => {
    if (customTerms?.length) return customTerms;
    const themeTerms = themeData[selectedTheme]?.terms || [];
    return showAll ? themeTerms : themeTerms.slice(0, maxTerms);
  }, [customTerms, selectedTheme, showAll, themeData, maxTerms]);

  const themeMeta = themeData[selectedTheme];
  const colors = themeColors[selectedTheme] || themeColors.food_sovereignty;

  return (
    <div className={`rounded-2xl p-6 ${colors.light} border border-gray-200`}>
      {/* Theme selector */}
      {!customTerms?.length && (
        <div className="flex flex-wrap gap-2 mb-4">
          {availableThemes.map((theme) => {
            const tc = themeColors[theme] || themeColors.food_sovereignty;
            const isActive = selectedTheme === theme;
            return (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? `${tc.bg} text-white shadow-sm`
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{themeIcons[theme] || '📖'}</span>
                {themeData[theme]?.name?.split(' ')[0] || theme}
              </button>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold ${colors.text} flex items-center gap-2`}>
            <span className="text-xl">{themeIcons[selectedTheme] || '📖'}</span>
            {themeMeta?.name || 'Vocabulary'}
          </h3>
          <p className="text-sm text-gray-500">{themeMeta?.count || terms.length} terms from dictionary</p>
        </div>
        {onPractice && terms.length >= 4 && (
          <button
            onClick={() => onPractice(terms)}
            className="px-4 py-2 bg-shs-forest-600 text-white text-sm font-semibold rounded-lg hover:bg-shs-forest-700 transition-colors"
          >
            🎯 Practice
          </button>
        )}
      </div>

      {/* Terms grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {terms.map((term: VocabTerm, index: number) => (
            <motion.div
              key={term.secwepemc}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className={`font-bold ${colors.text}`}>{term.secwepemc}</p>
              <p className="text-sm text-gray-700">{term.english}</p>
              {term.partOfSpeech && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                  {term.partOfSpeech}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more */}
      {themeMeta?.count > maxTerms && !customTerms?.length && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`mt-4 text-sm ${colors.text} font-medium hover:underline`}
        >
          {showAll ? '← Show less' : `Show all ${themeMeta.count} terms →`}
        </button>
      )}

      {/* Source attribution */}
      <p className="mt-4 text-xs text-gray-400">
        Source: Secwépemc-English Dictionary (Visual Audit, 7,329 entries)
      </p>
    </div>
  );
}

export default VocabularyEnrichment;
