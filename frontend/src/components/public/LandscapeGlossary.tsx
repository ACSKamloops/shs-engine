/**
 * LandscapeGlossary - Interactive Landscape Terms Component
 * Displays Secwépemc landscape terminology with morphological breakdowns
 * Features: Suffix reference, body-part connections, flashcard mode
 */
import { useState, useMemo } from 'react';
import placeNamesData from '../../data/place_names.json';

interface LandscapeTerm {
  secwepemc: string;
  english: string;
  morphology?: string;
}

interface LandscapeGlossaryProps {
  terms?: LandscapeTerm[];
  showFlashcardMode?: boolean;
}

// Body-part suffixes used in landscape terminology
const landscapeSuffixes = [
  { suffix: '-ups', meaning: 'bottom/rump', examples: ['melqw-éwll-ups (bottom of cliff)'] },
  { suffix: '-qen', meaning: 'top/head', examples: ['s-qen (top of mountain)'] },
  { suffix: '-ten', meaning: 'edge/side', examples: ['kew̓-ten (water\'s edge)'] },
  { suffix: '-úps', meaning: 'base/foundation', examples: ['t̓k̓em-ll-ups (slope base)'] },
  { suffix: '-ecw', meaning: 'land/ground', examples: ['tmicw (earth/land)'] },
  { suffix: '-llp', meaning: 'tree/plant', examples: ['seléwllp (white pine)'] },
  { suffix: '-qw', meaning: 'water feature', examples: ['t̓eqw (waterfall)'] },
  { suffix: '-m̓in', meaning: 'instrument/tool', examples: ['yecwmin̓men (caretaker)'] },
];

export function LandscapeGlossary({
  terms,
  showFlashcardMode = true,
}: LandscapeGlossaryProps) {
  const [selectedTerm, setSelectedTerm] = useState<LandscapeTerm | null>(null);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Use provided terms or load from data file
  const allTerms: LandscapeTerm[] = terms || placeNamesData.landscapeTerms || [];

  // Filter terms
  const filteredTerms = useMemo(() => {
    if (!searchQuery) return allTerms;
    const query = searchQuery.toLowerCase();
    return allTerms.filter(t =>
      t.secwepemc.toLowerCase().includes(query) ||
      t.english.toLowerCase().includes(query)
    );
  }, [allTerms, searchQuery]);

  // Shuffle for flashcards
  const shuffledTerms = useMemo(() => {
    return [...allTerms].sort(() => Math.random() - 0.5);
  }, [allTerms, flashcardMode]);

  const currentCard = shuffledTerms[currentCardIndex];

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prev) => (prev + 1) % shuffledTerms.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prev) => (prev - 1 + shuffledTerms.length) % shuffledTerms.length);
  };

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-600 to-shs-forest-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏔️</span>
            <div>
              <h3 className="font-bold text-lg">Landscape Glossary</h3>
              <p className="text-sm opacity-90">
                {allTerms.length} Secwépemctsín landscape terms
              </p>
            </div>
          </div>
          {showFlashcardMode && (
            <button
              onClick={() => {
                setFlashcardMode(!flashcardMode);
                setShowAnswer(false);
                setCurrentCardIndex(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                flashcardMode
                  ? 'bg-shs-amber-500 text-white'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {flashcardMode ? '📚 Exit Practice' : '🎯 Flashcards'}
            </button>
          )}
        </div>
      </div>

      {flashcardMode ? (
        /* Flashcard Mode */
        <div className="p-6">
          <div className="max-w-md mx-auto">
            {/* Card */}
            <div
              onClick={() => setShowAnswer(!showAnswer)}
              className="cursor-pointer bg-gradient-to-br from-shs-sand/50 to-white rounded-xl border-2 border-shs-stone/20 p-8 min-h-[200px] flex flex-col items-center justify-center transition-all hover:shadow-lg"
            >
              {showAnswer ? (
                <div className="text-center animate-fadeIn">
                  <p className="text-2xl font-bold text-shs-forest-800 mb-2">
                    {currentCard?.english}
                  </p>
                  {currentCard?.morphology && (
                    <p className="text-sm text-shs-forest-600 italic">
                      {currentCard.morphology}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-3xl font-bold text-shs-forest-700">
                    {currentCard?.secwepemc}
                  </p>
                  <p className="text-sm text-shs-text-muted mt-3">
                    Click to reveal meaning
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevCard}
                className="px-4 py-2 rounded-lg bg-shs-stone/10 hover:bg-shs-stone/20 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-shs-text-muted">
                {currentCardIndex + 1} / {shuffledTerms.length}
              </span>
              <button
                onClick={nextCard}
                className="px-4 py-2 rounded-lg bg-shs-forest-600 text-white hover:bg-shs-forest-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Browse Mode */
        <>
          {/* Search */}
          <div className="p-4 bg-shs-sand/30 border-b border-shs-stone/20">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search landscape terms..."
                className="w-full px-4 py-2 pl-10 rounded-lg border border-shs-stone/30 focus:ring-2 focus:ring-shs-forest-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shs-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-shs-stone/20">
            {/* Terms Grid */}
            <div className="p-4">
              <h4 className="font-semibold text-shs-forest-700 mb-3">Terms ({filteredTerms.length})</h4>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {filteredTerms.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTerm(selectedTerm?.secwepemc === term.secwepemc ? null : term)}
                    className={`text-left p-3 rounded-lg transition-all ${
                      selectedTerm?.secwepemc === term.secwepemc
                        ? 'bg-shs-forest-600 text-white shadow-md'
                        : 'bg-shs-sand/30 border border-shs-stone/10 hover:border-shs-forest-300'
                    }`}
                  >
                    <div className="font-medium">{term.secwepemc}</div>
                    <div className={`text-sm ${
                      selectedTerm?.secwepemc === term.secwepemc ? 'opacity-80' : 'text-shs-text-muted'
                    }`}>
                      {term.english}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suffix Reference */}
            <div className="p-4 bg-shs-sand/20">
              <h4 className="font-semibold text-shs-forest-700 mb-3">Body-Part Suffixes</h4>
              <p className="text-sm text-shs-text-muted mb-3">
                Secwépemctsín uses body-part metaphors to describe landscape features
              </p>
              <div className="space-y-2">
                {landscapeSuffixes.map((suffix, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-shs-stone/10">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-shs-forest-700">{suffix.suffix}</span>
                      <span className="text-sm text-shs-text-body">→ {suffix.meaning}</span>
                    </div>
                    <div className="text-xs text-shs-text-muted mt-1 italic">
                      {suffix.examples[0]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Term Detail */}
              {selectedTerm && (
                <div className="mt-4 p-4 bg-shs-forest-50 rounded-lg border border-shs-forest-200 animate-fadeIn">
                  <h5 className="font-bold text-shs-forest-800 text-lg">{selectedTerm.secwepemc}</h5>
                  <p className="text-shs-forest-600">{selectedTerm.english}</p>
                  {selectedTerm.morphology && (
                    <p className="text-sm text-shs-text-muted mt-2 italic">
                      Morphology: {selectedTerm.morphology}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LandscapeGlossary;
