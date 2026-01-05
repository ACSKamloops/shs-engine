import { useState, useMemo } from 'react';
import dictionaryData from '../../data/dictionary_gold_standard.json';

interface DictionaryEntry {
  word: string;
  pronunciation: string;
  meaning: string;
}

const entries = dictionaryData.words as DictionaryEntry[];

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries.slice(0, 100); // Show first 100 by default
    const term = searchTerm.toLowerCase();
    return entries.filter(e => 
      e.word.toLowerCase().includes(term) || 
      e.meaning.toLowerCase().includes(term)
    ).slice(0, 100); // Limit results for performance
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-800 to-shs-forest-700 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4">Secwepemctsín Dictionary</h1>
          <p className="text-xl opacity-90">Gold Standard • Eastern Dialect</p>
          <p className="text-sm opacity-75 mt-2">
            {dictionaryData.metadata.totalWords.toLocaleString()} validated entries available
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-shs-stone/20">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a word or meaning..."
              className="w-full px-6 py-4 pl-14 bg-shs-sand/30 border-2 border-transparent focus:border-shs-forest-400 focus:bg-white rounded-xl text-lg font-medium transition-all outline-none"
              autoFocus
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
          <div className="mt-3 flex justify-between text-sm text-gray-500 px-2">
            <span>{searchTerm ? `Found ${filteredEntries.length} matches` : 'Showing top 100 entries'}</span>
            <span>Total words: {entries.length.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-4">
          {filteredEntries.map((entry, idx) => (
            <div 
              key={`${entry.word}-${idx}`}
              className="bg-white p-6 rounded-xl border border-shs-stone/20 hover:border-shs-forest-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-shs-forest-800 font-serif mb-1 group-hover:text-shs-forest-600 transition-colors">
                    {entry.word}
                  </h3>
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
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <span className="text-6xl block mb-4">🤷</span>
              <p className="text-xl">No words found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
