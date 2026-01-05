/**
 * StewardshipPractices - Interactive Stewardship Practices Component
 * Displays Secwépemc land and resource management practices
 * Features: Practice cards, principles display, technique details
 */
import { useState } from 'react';
import stewardshipData from '../../data/stewardship_practices.json';

interface Practice {
  id: string;
  name: string;
  secwepemc?: string | null;
  description: string;
  techniques?: string[];
  targetSpecies?: Array<{
    secwepemc?: string | null;
    english: string;
    scientific?: string;
  }>;
  timing?: string;
  factors?: string[];
  results?: string;
  practitioners?: string[];
  location?: string;
  source?: { chapter?: number; pages?: string; page?: number; chapters?: number[] };
}

interface Principle {
  secwepemc: string;
  description: string;
  examples?: string[];
}

interface StewardshipPracticesProps {
  showPrinciples?: boolean;
  showPractices?: boolean;
}

// Practice type icons
const practiceIcons: Record<string, string> = {
  landscape_burning: '🔥',
  selective_root_harvesting: '🌿',
  bark_harvesting: '🌲',
  berry_bush_management: '🍇',
  salmon_management: '🐟',
  wapato_restoration: '💧',
};

export function StewardshipPractices({
  showPrinciples = true,
  showPractices = true,
}: StewardshipPracticesProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [activeTab, setActiveTab] = useState<'principles' | 'practices'>('principles');

  const principles = stewardshipData.principles as Record<string, Principle>;
  const practices: Practice[] = stewardshipData.practices;

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <h3 className="font-bold text-lg">Secwépemc Stewardship</h3>
            <p className="text-sm opacity-90">Traditional land and resource management</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-shs-stone/20 bg-shs-sand/30">
        <div className="flex">
          {showPrinciples && (
            <button
              onClick={() => setActiveTab('principles')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'principles'
                  ? 'border-shs-forest-600 text-shs-forest-700 bg-white'
                  : 'border-transparent text-shs-text-muted hover:text-shs-forest-600'
              }`}
            >
              🙏 Guiding Principles
            </button>
          )}
          {showPractices && (
            <button
              onClick={() => setActiveTab('practices')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'practices'
                  ? 'border-shs-forest-600 text-shs-forest-700 bg-white'
                  : 'border-transparent text-shs-text-muted hover:text-shs-forest-600'
              }`}
            >
              🌿 Practices
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'principles' && showPrinciples && (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(principles).map(([key, principle]) => (
              <div
                key={key}
                className="p-4 bg-gradient-to-br from-shs-sand/50 to-white rounded-xl border border-shs-stone/20"
              >
                <div className="mb-2">
                  <h4 className="font-bold text-shs-forest-800 capitalize">
                    {key.replace('_', ' ')}
                  </h4>
                  {principle.secwepemc && (
                    <p className="text-sm text-shs-forest-600 italic">{principle.secwepemc}</p>
                  )}
                </div>
                <p className="text-sm text-shs-text-body mb-3">{principle.description}</p>
                
                {principle.examples && principle.examples.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-shs-forest-700 mb-1">Examples:</h5>
                    <ul className="text-xs text-shs-text-muted space-y-1">
                      {principle.examples.slice(0, 3).map((ex, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-shs-forest-500">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'practices' && showPractices && (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Practice List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-shs-forest-700 mb-3">Management Practices</h4>
              {practices.map((practice) => (
                <button
                  key={practice.id}
                  onClick={() => setSelectedPractice(
                    selectedPractice?.id === practice.id ? null : practice
                  )}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                    selectedPractice?.id === practice.id
                      ? 'bg-shs-forest-600 text-white shadow-md'
                      : 'bg-white border border-shs-stone/20 hover:border-shs-forest-300'
                  }`}
                >
                  <span className="text-xl">{practiceIcons[practice.id] || '🌿'}</span>
                  <div>
                    <div className="font-medium text-sm">{practice.name}</div>
                    {practice.secwepemc && (
                      <div className={`text-xs ${
                        selectedPractice?.id === practice.id ? 'opacity-80' : 'text-shs-forest-600 italic'
                      }`}>
                        {practice.secwepemc}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Practice Detail */}
            <div className="lg:col-span-2">
              {selectedPractice ? (
                <div className="bg-shs-sand/30 rounded-xl p-5 animate-fadeIn">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{practiceIcons[selectedPractice.id] || '🌿'}</span>
                    <div>
                      <h3 className="font-bold text-xl text-shs-forest-800">
                        {selectedPractice.name}
                      </h3>
                      {selectedPractice.secwepemc && (
                        <p className="text-shs-forest-600 italic">{selectedPractice.secwepemc}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-shs-text-body mb-4">{selectedPractice.description}</p>

                  {/* Techniques */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-shs-forest-700 mb-2">Techniques</h5>
                    <ul className="space-y-1">
                      {selectedPractice.techniques?.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-shs-text-body">
                          <span className="text-shs-forest-500 mt-1">✓</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Target Species */}
                  {selectedPractice.targetSpecies && selectedPractice.targetSpecies.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-shs-forest-700 mb-2">Target Species</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedPractice.targetSpecies.map((species, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 bg-white rounded-lg border border-shs-stone/20"
                          >
                            {species.secwepemc && (
                              <div className="font-medium text-shs-forest-700 text-sm">
                                {species.secwepemc}
                              </div>
                            )}
                            <div className="text-xs text-shs-text-body">{species.english}</div>
                            {species.scientific && (
                              <div className="text-xs text-shs-text-muted italic">
                                {species.scientific}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timing & Location */}
                  <div className="flex flex-wrap gap-4 text-sm text-shs-text-muted">
                    {selectedPractice.timing && (
                      <span className="flex items-center gap-1">
                        🗓️ {selectedPractice.timing}
                      </span>
                    )}
                    {selectedPractice.location && (
                      <span className="flex items-center gap-1">
                        📍 {selectedPractice.location}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-shs-text-muted rounded-xl bg-shs-sand/20">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">👈</span>
                    <p>Select a practice to learn more</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StewardshipPractices;
