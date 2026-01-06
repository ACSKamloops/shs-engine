import { useState, useMemo } from 'react';
import placeNamesData from '../../data/cultural_reference/place_names.json';

interface PlaceName {
  id: string;
  name: string;
  nameNFC: string;
  occurrences: {
    chunkId: string;
    source: {
      docId: string;
      sectionId: string;
      chapter: number;
      pdfPage: number;
      printedPage: string | null;
    };
  }[];
  themes: string[];
  needsReview: boolean;
}

const placeNames = placeNamesData.names as PlaceName[];

// Theme labels for display
const themeLabels: Record<string, string> = {
  land_environment: '🏔️ Land & Environment',
  foodways: '🍂 Foodways',
  history_territory_governance: '📜 History & Territory',
  curriculum_teaching: '📚 Teaching',
  family_community: '👨‍👩‍👧‍👦 Family & Community',
  stories_oral_history: '📖 Stories',
  health_body_wellness: '💚 Health & Wellness'
};

export default function PlaceNamesGlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Get unique themes
  const allThemes = useMemo(() => {
    const themes = new Set<string>();
    placeNames.forEach(p => p.themes.forEach(t => themes.add(t)));
    return Array.from(themes).sort();
  }, []);

  // Filter place names
  const filteredNames = useMemo(() => {
    return placeNames.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nameNFC.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTheme = !selectedTheme || p.themes.includes(selectedTheme);
      return matchesSearch && matchesTheme;
    });
  }, [searchTerm, selectedTheme]);

  // Group by first letter
  const groupedByLetter = useMemo(() => {
    const groups: Record<string, PlaceName[]> = {};
    filteredNames.forEach(p => {
      const firstLetter = p.name[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredNames]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-shs-forest-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-700 to-shs-forest-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Secwépemctsín Place Names</h1>
          <p className="text-xl opacity-90">Traditional Toponyms of Secwepemcúl̓ecw</p>
          <p className="text-sm opacity-75 mt-2">
            {placeNames.length} place names documented from cultural reference materials
          </p>
        </div>
      </div>

      {/* Notice about coordinates */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <h3 className="font-bold text-amber-800">Map Integration Coming</h3>
              <p className="text-sm text-amber-700">
                This glossary contains traditional place names extracted from academic sources. 
                Geographic coordinates are needed for future map integration. 
                Currently organized as a searchable reference.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 pb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search place names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-shs-stone/30 focus:border-shs-forest-500 focus:ring-2 focus:ring-shs-forest-200 outline-none"
            />
          </div>
          
          {/* Theme Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTheme(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedTheme 
                  ? 'bg-shs-forest-600 text-white' 
                  : 'bg-shs-stone/10 text-shs-forest-700 hover:bg-shs-stone/20'
              }`}
            >
              All ({placeNames.length})
            </button>
            {allThemes.slice(0, 4).map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme === selectedTheme ? null : theme)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTheme === theme 
                    ? 'bg-shs-forest-600 text-white' 
                    : 'bg-shs-stone/10 text-shs-forest-700 hover:bg-shs-stone/20'
                }`}
              >
                {themeLabels[theme] || theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-6 pb-4">
        <p className="text-sm text-shs-text-body">
          Showing <strong>{filteredNames.length}</strong> of {placeNames.length} place names
        </p>
      </div>

      {/* Place Names Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {groupedByLetter.map(([letter, names]) => (
          <div key={letter} className="mb-8">
            <h2 className="text-2xl font-bold text-shs-forest-700 mb-4 pb-2 border-b border-shs-stone/20">
              {letter}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {names.map(place => (
                <div
                  key={place.id}
                  className="bg-white p-5 rounded-2xl border border-shs-stone/30 hover:border-shs-forest-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-bold text-lg text-shs-forest-800 mb-2">
                    {place.name}
                  </h3>
                  
                  {/* Themes */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {place.themes.slice(0, 3).map(theme => (
                      <span 
                        key={theme}
                        className="text-xs px-2 py-1 bg-shs-forest-50 text-shs-forest-700 rounded-full"
                      >
                        {theme.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Occurrences */}
                  <p className="text-xs text-shs-text-muted">
                    {place.occurrences.length} occurrence{place.occurrences.length !== 1 ? 's' : ''} • 
                    Chapter {place.occurrences[0]?.source?.chapter || '?'}
                  </p>
                  
                  {place.occurrences[0]?.source?.pdfPage && (
                    <p className="text-xs text-shs-text-muted">
                      Source: p. {place.occurrences[0].source.pdfPage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredNames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-shs-text-muted">No place names match your search.</p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-br from-shs-forest-50 to-emerald-50 rounded-2xl p-6 border border-shs-forest-200">
          <h3 className="font-bold text-shs-forest-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            About This Glossary
          </h3>
          <p className="text-shs-text-body text-sm leading-relaxed mb-4">
            These <strong>{placeNames.length} Secwépemctsín place names</strong> were extracted from 
            the academic ethnobotanical research document "Secwepemc-web-07-2017.pdf". 
            They represent traditional toponyms that describe features of Secwepemcúl̓ecw, 
            the Secwépemc homeland.
          </p>
          <p className="text-shs-text-body text-sm leading-relaxed">
            Many names contain lexical suffixes derived from body parts (see Landscape Terms page), 
            reflecting a worldview where the land is understood through embodied metaphors. 
            Future integration with geographic coordinates will enable interactive map visualization.
          </p>
        </div>
      </div>
    </div>
  );
}
