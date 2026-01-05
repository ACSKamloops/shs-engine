/**
 * ElderQuoteDisplay - Interactive Elder Quotes Component
 * Displays Secwépemc elder quotes with Secwépemctsín and English
 * Features: Theme filtering, speaker info, audio placeholder, card display
 */
import { useState, useMemo } from 'react';
import elderQuotesData from '../../data/elder_quotes.json';

interface ElderQuote {
  id: string;
  speaker: string;
  community?: string;
  secwepemc: string | null;
  english: string;
  themes: string[];
  context?: string;
  source: {
    chapter: number;
    page: number;
  };
}

interface ElderQuoteDisplayProps {
  quotes?: ElderQuote[];
  maxQuotes?: number;
  filterThemes?: string[];
  showFilters?: boolean;
  showExploreLink?: boolean;
}

// Theme colors and icons
const themeConfig: Record<string, { color: string; icon: string; label: string }> = {
  foodways: { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '🍂', label: 'Foodways' },
  seasonal_round: { color: 'bg-green-100 text-green-700 border-green-300', icon: '🗓️', label: 'Seasonal Round' },
  TEK: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🌿', label: 'Traditional Knowledge' },
  stewardship: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '🌲', label: 'Stewardship' },
  respect: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '🙏', label: 'Respect' },
  sharing: { color: 'bg-rose-100 text-rose-700 border-rose-300', icon: '🤝', label: 'Sharing' },
  sustainability: { color: 'bg-teal-100 text-teal-700 border-teal-300', icon: '♻️', label: 'Sustainability' },
  salmon: { color: 'bg-cyan-100 text-cyan-700 border-cyan-300', icon: '🐟', label: 'Salmon' },
  territory: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🏔️', label: 'Territory' },
  environmental_change: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🌍', label: 'Environment' },
  cultural_knowledge: { color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: '📚', label: 'Cultural Knowledge' },
  philosophy: { color: 'bg-violet-100 text-violet-700 border-violet-300', icon: '💭', label: 'Philosophy' },
  harvesting: { color: 'bg-lime-100 text-lime-700 border-lime-300', icon: '🌾', label: 'Harvesting' },
  processing: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🔥', label: 'Processing' },
};

export function ElderQuoteDisplay({
  quotes,
  maxQuotes,
  filterThemes,
  showFilters = true,
}: ElderQuoteDisplayProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  // Use provided quotes or load from data file
  const allQuotes: ElderQuote[] = quotes || elderQuotesData.quotes;

  // Get unique themes from all quotes
  const availableThemes = useMemo(() => {
    const themes = new Set<string>();
    allQuotes.forEach(q => q.themes.forEach(t => themes.add(t)));
    return Array.from(themes).sort();
  }, [allQuotes]);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    let result = allQuotes;
    
    // Apply prop-based theme filter
    if (filterThemes && filterThemes.length > 0) {
      result = result.filter(q => 
        q.themes.some(t => filterThemes.includes(t))
      );
    }
    
    // Apply user-selected theme filter
    if (selectedTheme) {
      result = result.filter(q => q.themes.includes(selectedTheme));
    }
    
    // Apply max limit
    if (maxQuotes && result.length > maxQuotes) {
      result = result.slice(0, maxQuotes);
    }
    
    return result;
  }, [allQuotes, filterThemes, selectedTheme, maxQuotes]);

  // Get unique speakers for stats
  const uniqueSpeakers = useMemo(() => {
    const speakers = new Set(allQuotes.map(q => q.speaker));
    return speakers.size;
  }, [allQuotes]);

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-600 to-shs-forest-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪶</span>
          <div>
            <h3 className="font-bold text-lg">Elder Wisdom</h3>
            <p className="text-sm opacity-90">
              {allQuotes.length} quotes from {uniqueSpeakers} elders
            </p>
          </div>
        </div>
      </div>

      {/* Theme Filters */}
      {showFilters && (
        <div className="p-4 bg-shs-sand/50 border-b border-shs-stone/20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTheme(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTheme === null
                  ? 'bg-shs-forest-600 text-white'
                  : 'bg-white border border-shs-stone/30 text-shs-text-body hover:bg-shs-stone/10'
              }`}
            >
              All Themes
            </button>
            {availableThemes.map(theme => {
              const config = themeConfig[theme] || { 
                color: 'bg-gray-100 text-gray-700 border-gray-300', 
                icon: '📝', 
                label: theme.replace('_', ' ') 
              };
              return (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedTheme === theme
                      ? 'bg-shs-forest-600 text-white'
                      : `border ${config.color}`
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className="capitalize">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quotes Grid */}
      <div className="p-6">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-8 text-shs-text-muted">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>No quotes found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredQuotes.map((quote) => {
              const isExpanded = expandedQuote === quote.id;
              
              return (
                <div
                  key={quote.id}
                  className={`bg-gradient-to-br from-shs-sand/30 to-white rounded-xl border border-shs-stone/20 overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'md:col-span-2 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                  {/* Quote Card Header */}
                  <div className="p-4 border-b border-shs-stone/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-700 font-bold">
                          {quote.speaker.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-shs-forest-800">{quote.speaker}</h4>
                          <p className="text-sm text-shs-text-muted">{quote.community}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedQuote(isExpanded ? null : quote.id)}
                        className="text-shs-forest-600 hover:text-shs-forest-800 transition-colors"
                      >
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Quote Content */}
                  <div className="p-4">
                    {/* Secwépemctsín */}
                    {quote.secwepemc && (
                      <div className="mb-3">
                        <p className="text-lg italic text-shs-forest-700 leading-relaxed">
                          "{quote.secwepemc}"
                        </p>
                      </div>
                    )}

                    {/* English Translation */}
                    <div className="mb-3">
                      <p className={`text-shs-text-body leading-relaxed ${!isExpanded && !quote.secwepemc ? '' : ''}`}>
                        "{quote.english}"
                      </p>
                    </div>

                    {/* Themes */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {quote.themes.map(theme => {
                        const config = themeConfig[theme] || { 
                          color: 'bg-gray-100 text-gray-600 border-gray-200', 
                          icon: '📝', 
                          label: theme 
                        };
                        return (
                          <span
                            key={theme}
                            className={`px-2 py-0.5 rounded-full text-xs border ${config.color}`}
                          >
                            {config.icon} {config.label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-shs-stone/20 animate-fadeIn">
                        {quote.context && (
                          <div className="mb-3">
                            <h5 className="text-sm font-semibold text-shs-forest-700 mb-1">Context</h5>
                            <p className="text-sm text-shs-text-muted">{quote.context}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-shs-text-muted">
                          <span className="flex items-center gap-1">
                            📖 Chapter {quote.source.chapter}, p.{quote.source.page}
                          </span>
                          <button className="flex items-center gap-1 text-shs-forest-600 hover:text-shs-forest-800 transition-colors">
                            🔊 Audio (coming soon)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-shs-sand/30 border-t border-shs-stone/20 text-center">
        <p className="text-sm text-shs-text-muted">
          Showing {filteredQuotes.length} of {allQuotes.length} quotes
          {selectedTheme && ` • Filtered by: ${themeConfig[selectedTheme]?.label || selectedTheme}`}
        </p>
      </div>
    </div>
  );
}

export default ElderQuoteDisplay;
