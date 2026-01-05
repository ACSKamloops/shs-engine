import { useState } from 'react';
import landscapeData from '../../data/calendar/landscape_terms.json';

interface LandscapeTerm {
  term: string;
  description: string;
}

interface LexicalSuffix {
  suffix: string;
  meaning: string;
}

const landscapeTerms = landscapeData.landscapeTerms as LandscapeTerm[];
const bodyPartSuffixes = landscapeData.lexicalSuffixes.entries as LexicalSuffix[];
const otherSuffixes = landscapeData.otherLexicalSuffixes.entries as LexicalSuffix[];

type TabId = 'terms' | 'body' | 'other';

export default function LandscapeTermsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('terms');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'terms', label: 'Landscape Terms', count: landscapeTerms.length },
    { id: 'body', label: 'Body-Part Suffixes', count: bodyPartSuffixes.length },
    { id: 'other', label: 'Other Suffixes', count: otherSuffixes.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-shs-forest-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-700 to-shs-forest-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Secwépemc Landscape Terms</h1>
          <p className="text-xl opacity-90">Generic Toponyms & Lexical Suffixes</p>
          <p className="text-sm opacity-75 mt-2">
            {landscapeTerms.length} landscape terms • {bodyPartSuffixes.length + otherSuffixes.length} lexical suffixes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex gap-2 border-b border-shs-stone/30 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-shs-forest-600 text-white shadow-lg'
                  : 'bg-shs-stone/10 text-shs-forest-700 hover:bg-shs-stone/20'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'terms' && (
          <div>
            <p className="text-shs-text-body mb-6">
              These landscape terms (generic toponyms) describe features of the Secwépemc homeland.
              Many contain lexical suffixes derived from body parts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landscapeTerms.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTerm(selectedTerm === term.term ? null : term.term)}
                  className={`p-5 rounded-2xl text-left transition-all ${
                    selectedTerm === term.term
                      ? 'bg-shs-forest-100 border-2 border-shs-forest-500 shadow-md'
                      : 'bg-white border border-shs-stone/30 hover:border-shs-forest-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-bold text-lg text-shs-forest-800 mb-1">
                    {term.term}
                  </h3>
                  <p className="text-sm text-shs-text-body">
                    {term.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div>
            <div className="bg-violet-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-violet-800 mb-2">Body-Part Metaphors for Landscape</h3>
              <p className="text-violet-700 text-sm">
                {landscapeData.lexicalSuffixes.description}
                <span className="opacity-75 ml-2">{landscapeData.lexicalSuffixes.sourceNote}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bodyPartSuffixes.map((suffix, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-violet-200 hover:border-violet-400 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-xl text-violet-800">
                      {suffix.suffix}
                    </h3>
                  </div>
                  <p className="text-shs-text-body">
                    {suffix.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'other' && (
          <div>
            <p className="text-shs-text-body mb-6">
              {landscapeData.otherLexicalSuffixes.description} These prominently occur in place names.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherSuffixes.map((suffix, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-emerald-200 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-xl text-emerald-800">
                      {suffix.suffix}
                    </h3>
                  </div>
                  <p className="text-shs-text-body">
                    {suffix.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Note */}
        <div className="mt-10 p-6 bg-shs-sand/50 rounded-2xl">
          <h3 className="font-bold text-shs-forest-800 mb-3">Understanding Secwépemc Toponyms</h3>
          <p className="text-shs-text-body">
            Secwépemc place names and landscape terms often combine root words with lexical suffixes 
            derived from body parts. For example, <strong>-us</strong> (face) describes the steep side 
            of a mountain, while <strong>-tsin</strong> (mouth) describes where a creek enters a river. 
            This linguistic pattern reflects a worldview where the land is understood through embodied 
            metaphors.
          </p>
        </div>
      </div>
    </div>
  );
}
