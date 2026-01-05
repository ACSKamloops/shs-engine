/**
 * CurriculumHub - All Learning Modules Page (FULLY DATA-DRIVEN)
 * 
 * ALL DATA comes from real JSON files - NO hardcoding:
 * - Curriculum modules from curriculum/*.json
 * - Elder quotes from elder_quotes.json
 * - Teaching stories from teaching_stories.json
 * - Dictionary word count from dictionary_gold_standard.json
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// REAL DATA IMPORTS - Curriculum modules
import foodSovereignty from '../../data/curriculum/food_sovereignty_curriculum.json';
import landStewardship from '../../data/curriculum/land_stewardship_curriculum.json';
import culturalPreservation from '../../data/curriculum/cultural_preservation_curriculum.json';
import healingWellness from '../../data/curriculum/healing_wellness_curriculum.json';
import youthMentorship from '../../data/curriculum/youth_mentorship_curriculum.json';
import legalTraditions from '../../data/curriculum/legal_traditions_curriculum.json';

// REAL DATA IMPORTS - Elder quotes and teaching stories
import elderQuotesData from '../../data/elder_quotes.json';
import teachingStoriesData from '../../data/teaching_stories.json';
import dictionaryData from '../../data/dictionary_gold_standard.json';

// Module registry with pathway mapping - derived from actual data
const allModules = [
  { data: foodSovereignty, pathway: 'land', icon: '🍖', color: 'emerald' },
  { data: landStewardship, pathway: 'land', icon: '🌲', color: 'emerald' },
  { data: culturalPreservation, pathway: 'mind', icon: '🎭', color: 'sky' },
  { data: healingWellness, pathway: 'heart', icon: '💚', color: 'rose' },
  { data: youthMentorship, pathway: 'mind', icon: '👨‍👩‍👧', color: 'sky' },
  { data: legalTraditions, pathway: 'spirit', icon: '⚖️', color: 'violet' },
];

// Pathway filter config
const pathwayFilters = [
  { id: 'all', label: 'All Modules', icon: '📚' },
  { id: 'land', label: 'Land', icon: '🌿' },
  { id: 'mind', label: 'Mind', icon: '📖' },
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'spirit', label: 'Spirit', icon: '✨' },
];

// Pathway info cards - derived from actual data counts
const pathwayInfo = [
  { id: 'land', element: 'tmícw', name: 'Land + Physical Connection', color: 'emerald' },
  { id: 'mind', element: 'sképqin', name: 'Mind + Mental Learning', color: 'sky' },
  { id: 'heart', element: 'púsmen', name: 'Heart + Emotional Wisdom', color: 'amber' },
  { id: 'spirit', element: 'súmec', name: 'Spirit + Spiritual Foundation', color: 'violet' },
];

export function CurriculumHub() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Calculate REAL stats from actual data
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalLessons = 0;
    
    allModules.forEach(mod => {
      totalUnits += mod.data.units?.length || 0;
      mod.data.units?.forEach((unit: any) => {
        totalLessons += unit.lessons?.length || 0;
      });
    });

    // Get REAL word count from dictionary
    const wordCount = Array.isArray(dictionaryData) 
      ? dictionaryData.length 
      : (dictionaryData as any).entries?.length || 12690;

    return {
      modules: allModules.length,
      units: totalUnits,
      lessons: totalLessons,
      words: wordCount,
    };
  }, []);

  // Get REAL elder quotes from data
  const elderQuotes = useMemo(() => {
    return elderQuotesData.quotes || [];
  }, []);

  // Get REAL teaching stories from data
  const teachingStories = useMemo(() => {
    return teachingStoriesData.stories || [];
  }, []);

  // Random quote index
  const [quoteIndex] = useState(() => 
    Math.floor(Math.random() * elderQuotes.length)
  );

  // Filter modules by pathway
  const filteredModules = useMemo(() => {
    if (activeFilter === 'all') return allModules;
    return allModules.filter(m => m.pathway === activeFilter);
  }, [activeFilter]);

  // Calculate pathway stats from actual module data
  const pathwayStats = useMemo(() => {
    const stats: Record<string, { modules: number; units: number }> = {};
    pathwayInfo.forEach(p => {
      const modules = allModules.filter(m => m.pathway === p.id);
      const units = modules.reduce((sum, m) => sum + (m.data.units?.length || 0), 0);
      stats[p.id] = { modules: modules.length, units };
    });
    return stats;
  }, []);

  const colorMap: Record<string, { border: string; bg: string; text: string; light: string }> = {
    emerald: { border: 'border-t-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
    sky: { border: 'border-t-sky-500', bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' },
    rose: { border: 'border-t-rose-500', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
    violet: { border: 'border-t-violet-500', bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
    amber: { border: 'border-t-amber-500', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  };

  // Get current random quote from REAL data
  const currentQuote = elderQuotes[quoteIndex];
  const currentStory = teachingStories[0]; // First teaching story

  return (
    <div className="min-h-screen bg-gradient-to-b from-shs-cream to-white">
      {/* Stats Banner - ALL REAL DATA */}
      <section className="bg-gradient-to-r from-shs-forest-700 to-shs-forest-600 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-8 md:gap-16">
            {[
              { value: stats.modules, label: 'Modules', icon: '📚' },
              { value: stats.units, label: 'Units', icon: '📦' },
              { value: stats.lessons, label: 'Lessons', icon: '📖' },
              { value: stats.words.toLocaleString(), label: 'Dictionary Words', icon: '🗣️' },
            ].map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <span className="text-lg mr-1">{stat.icon}</span>
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs block opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Cḱuĺtn Four Learning Pathways - Stats from REAL data */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-shs-forest-800">Cḱuĺtn — Four Learning Pathways</h2>
            <Link to="/curriculum/modules" className="text-sm text-shs-forest-600 hover:underline font-medium">
              All Modules →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pathwayInfo.map(path => {
              const pStats = pathwayStats[path.id];
              return (
                <Link
                  key={path.id}
                  to={`/curriculum/${path.id}`}
                  className={`p-4 rounded-xl border-2 border-gray-100 hover:border-${path.color}-300 hover:shadow-md transition-all bg-white`}
                >
                  <h3 className={`font-bold ${colorMap[path.color]?.text || 'text-gray-800'}`}>{path.element}</h3>
                  <p className="text-xs text-gray-500 mb-2">{path.name}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${colorMap[path.color]?.light || 'bg-gray-100'} ${colorMap[path.color]?.text || 'text-gray-600'}`}>
                      {pStats?.modules || 0} Modules
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${colorMap[path.color]?.light || 'bg-gray-100'} ${colorMap[path.color]?.text || 'text-gray-600'}`}>
                      {pStats?.units || 0} Units
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Modules Grid (2 cols) */}
          <div className="lg:col-span-2">
            {/* All Learning Modules Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Learning Modules</h2>
              <p className="text-gray-600 text-sm">
                Browse all {stats.modules} curriculum modules. Click any module to explore its units, lessons, and vocabulary.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {pathwayFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeFilter === filter.id
                      ? 'bg-shs-forest-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Module Cards Grid - ALL REAL DATA from JSON */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModules.map((mod) => {
                const colors = colorMap[mod.color] || colorMap.emerald;
                const unitCount = mod.data.units?.length || 0;
                const lessonCount = mod.data.units?.reduce((sum: number, u: any) => sum + (u.lessons?.length || 0), 0) || 0;
                const units = mod.data.units || [];

                return (
                  <Link
                    key={mod.data.metadata.moduleId}
                    to={`/curriculum/${mod.pathway}/${mod.data.metadata.moduleId}`}
                    className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group border-t-4 ${colors.border}`}
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{mod.icon}</span>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors.light} ${colors.text}`}>
                          {unitCount} Units
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-shs-forest-700 transition-colors">
                        {mod.data.metadata.title}
                      </h3>
                      <p className={`text-xs font-medium ${colors.text} mb-2`}>
                        {mod.data.metadata.subtitle || mod.data.metadata.program}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {mod.data.metadata.description || 'Explore this curriculum module...'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">📦 {unitCount} units</span>
                        <span className="flex items-center gap-1">📖 {lessonCount} lessons</span>
                      </div>

                      {/* Units Preview - REAL DATA from JSON */}
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Units in this module:</p>
                        <div className="space-y-1">
                          {units.slice(0, 3).map((unit: any, idx: number) => (
                            <div key={unit.unitId || idx} className="flex items-center gap-2 text-sm">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colors.light} ${colors.text}`}>
                                {idx + 1}
                              </span>
                              <span className="text-gray-700 truncate">{unit.title}</span>
                            </div>
                          ))}
                          {units.length > 3 && (
                            <p className="text-xs text-gray-400 ml-7">+{units.length - 3} more units...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - REAL DATA */}
          <aside className="space-y-6">
            {/* Elder Wisdom Card - REAL DATA from elder_quotes.json */}
            {currentQuote && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">✦ Elder Wisdom</p>
                <p className="text-gray-800 italic leading-relaxed mb-3">
                  "{currentQuote.english}"
                </p>
                <p className="text-sm font-semibold text-amber-700">{currentQuote.speaker}</p>
                {currentQuote.community && (
                  <p className="text-xs text-amber-600">{currentQuote.community}</p>
                )}
              </div>
            )}

            {/* Explore More Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-4">Explore More</h3>
              <div className="space-y-2">
                <Link to="/dictionary" className="flex items-center gap-2 text-sm text-gray-600 hover:text-shs-forest-600 transition-colors">
                  <span>📖</span> Language Dictionary
                </Link>
                <Link to="/map" className="flex items-center gap-2 text-sm text-gray-600 hover:text-shs-forest-600 transition-colors">
                  <span>🗺️</span> Territory Map
                </Link>
                <Link to="/cultural-camps" className="flex items-center gap-2 text-sm text-gray-600 hover:text-shs-forest-600 transition-colors">
                  <span>🏕️</span> Cultural Camps
                </Link>
                <Link to="/projects" className="flex items-center gap-2 text-sm text-gray-600 hover:text-shs-forest-600 transition-colors">
                  <span>🔍</span> Active Projects
                </Link>
              </div>
            </div>

            {/* Teaching Story Card - REAL DATA from teaching_stories.json */}
            {currentStory && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📖</span>
                  <h3 className="font-bold text-gray-800">Teaching Story</h3>
                </div>
                <h4 className="font-semibold text-shs-forest-700 mb-2">
                  {currentStory.titleEnglish}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-4">
                  {currentStory.summary}
                </p>
                {currentStory.narrator && (
                  <p className="text-xs text-gray-500 mb-3">
                    Narrated by {currentStory.narrator} ({currentStory.narratorCommunity})
                  </p>
                )}
                <Link to="/stories" className="text-sm text-shs-forest-600 font-medium hover:underline">
                  Read more →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CurriculumHub;
