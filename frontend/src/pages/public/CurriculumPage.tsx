/**
 * CurriculumPage - SHS Cultural Camp Curriculum (Redesigned Jan 2026)
 * 
 * CLEAN SINGLE-VIEW LAYOUT:
 * - Direct content display without redundant sections
 * - Left sidebar for module/unit navigation
 * - Right content area for lessons and details
 * - No duplicate module switchers
 */
import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

// Import curriculum data
import foodSovereignty from '../../data/curriculum/food_sovereignty_curriculum.json';
import landStewardship from '../../data/curriculum/land_stewardship_curriculum.json';
import culturalPreservation from '../../data/curriculum/cultural_preservation_curriculum.json';
import healingWellness from '../../data/curriculum/healing_wellness_curriculum.json';
import youthMentorship from '../../data/curriculum/youth_mentorship_curriculum.json';
import legalTraditions from '../../data/curriculum/legal_traditions_curriculum.json';

// Module data with color schemes and Cḱuĺtn pathway mapping
const modules = [
  { data: foodSovereignty, colorScheme: 'forest' as const, icon: '🍖', pathway: 'land' },
  { data: landStewardship, colorScheme: 'earth' as const, icon: '🌲', pathway: 'land' },
  { data: culturalPreservation, colorScheme: 'amber' as const, icon: '🎭', pathway: 'mind' },
  { data: healingWellness, colorScheme: 'forest' as const, icon: '💚', pathway: 'heart' },
  { data: youthMentorship, colorScheme: 'amber' as const, icon: '👨‍👩‍👧', pathway: 'mind' },
  { data: legalTraditions, colorScheme: 'earth' as const, icon: '⚖️', pathway: 'spirit' },
];

// Pathway metadata
const pathwayInfo: Record<string, { name: string; element: string; color: string }> = {
  land: { name: 'Land', element: 'tmícw', color: 'emerald' },
  mind: { name: 'Mind', element: 'sképqin', color: 'sky' },
  heart: { name: 'Heart', element: 'púsmen', color: 'amber' },
  spirit: { name: 'Spirit', element: 'súmec', color: 'violet' },
};

export function CurriculumPage() {
  const { pathwayId, moduleId } = useParams<{ pathwayId?: string; moduleId?: string }>();
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  // Filter modules by pathway
  const filteredModules = useMemo(() => {
    if (!pathwayId || pathwayId === 'modules') return modules;
    return modules.filter(m => m.pathway === pathwayId);
  }, [pathwayId]);

  // Find current module by ID or default to first
  const currentModule = useMemo(() => {
    if (moduleId) {
      return filteredModules.find(m => m.data.metadata.moduleId === moduleId) || filteredModules[0];
    }
    return filteredModules[0];
  }, [moduleId, filteredModules]);

  // Get current pathway info
  const currentPathway = pathwayId && pathwayInfo[pathwayId] ? pathwayInfo[pathwayId] : null;

  // Auto-expand first unit on load
  useEffect(() => {
    if (currentModule?.data.units?.length > 0 && !expandedUnit) {
      setExpandedUnit(currentModule.data.units[0].unitId);
    }
  }, [currentModule, expandedUnit]);

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-shs-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-2">Module Not Found</h2>
          <Link to="/curriculum" className="text-shs-forest-600 underline">Return to Curriculum Hub</Link>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50' },
    sky: { bg: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-300', light: 'bg-sky-50' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-300', light: 'bg-violet-50' },
  };
  const colors = currentPathway ? colorMap[currentPathway.color] : colorMap.emerald;

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Compact Header with Breadcrumb */}
      <header className={`${colors.bg} text-white py-6`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm opacity-80 mb-3">
            <Link to="/curriculum" className="hover:underline">Curriculum</Link>
            <span>/</span>
            {currentPathway && (
              <>
                <Link to={`/curriculum/${pathwayId}`} className="hover:underline capitalize">
                  {currentPathway.element} — {currentPathway.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="font-medium">{currentModule.data.metadata.title}</span>
          </nav>
          
          {/* Module Header */}
          <div className="flex items-center gap-4">
            <span className="text-4xl">{currentModule.icon}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{currentModule.data.metadata.title}</h1>
              <p className="text-sm opacity-80">
                {currentModule.data.units.length} units • {currentModule.data.metadata.program}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: Module & Unit Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Module Switcher (if multiple modules in pathway) */}
            {filteredModules.length > 1 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Modules
                </h3>
                <div className="space-y-1">
                  {filteredModules.map((mod) => (
                    <Link
                      key={mod.data.metadata.moduleId}
                      to={`/curriculum/${pathwayId || mod.pathway}/${mod.data.metadata.moduleId}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        mod.data.metadata.moduleId === currentModule.data.metadata.moduleId
                          ? `${colors.light} ${colors.text} font-semibold`
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{mod.icon}</span>
                      <span className="text-sm">{mod.data.metadata.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Units
              </h3>
              <nav className="space-y-1">
                {currentModule.data.units.map((unit: any, idx: number) => (
                  <button
                    key={unit.unitId}
                    onClick={() => setExpandedUnit(unit.unitId)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      expandedUnit === unit.unitId
                        ? `${colors.light} ${colors.text} font-semibold border-l-4 ${colors.border}`
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2">{unit.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* RIGHT CONTENT: Selected Unit Details */}
          <main className="flex-1 min-w-0">
            {currentModule.data.units
              .filter((unit: any) => expandedUnit === unit.unitId)
              .map((unit: any) => (
                <div key={unit.unitId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Unit Header */}
                  <div className={`${colors.light} px-6 py-5 border-b ${colors.border}`}>
                    <h2 className="text-xl font-bold text-gray-900">{unit.title}</h2>
                    {unit.description && (
                      <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      {unit.duration && <span>⏱ {unit.duration}</span>}
                      {unit.season && <span>🌿 {unit.season}</span>}
                      <span>📚 {unit.lessons?.length || 0} lessons</span>
                    </div>
                  </div>

                  {/* Unit Vocabulary (if exists) */}
                  {unit.vocabulary && unit.vocabulary.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        📖 Vocabulary ({unit.vocabulary.length} words)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {unit.vocabulary.slice(0, 8).map((word: any, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                            title={word.english}
                          >
                            <span className="font-medium text-gray-800">{word.secwepemc}</span>
                            <span className="text-gray-400 ml-1">— {word.english}</span>
                          </span>
                        ))}
                        {unit.vocabulary.length > 8 && (
                          <span className="px-3 py-1 text-gray-500 text-sm">
                            +{unit.vocabulary.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lessons List */}
                  <div className="divide-y divide-gray-100">
                    {unit.lessons?.map((lesson: any, lessonIdx: number) => (
                      <LessonAccordion
                        key={lesson.lessonId || lessonIdx}
                        lesson={lesson}
                        index={lessonIdx}
                        colors={colors}
                      />
                    ))}
                    {(!unit.lessons || unit.lessons.length === 0) && (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <p>No lessons available for this unit yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Unit Protocols (if exists) */}
                  {unit.protocols && unit.protocols.length > 0 && (
                    <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
                      <h4 className="text-sm font-semibold text-amber-800 mb-2">🪶 Protocols</h4>
                      <ul className="space-y-1">
                        {unit.protocols.map((protocol: string, i: number) => (
                          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            {protocol}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

            {/* Prompt to select a unit if none selected */}
            {!expandedUnit && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">← Select a unit from the sidebar to view its content</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * LessonAccordion - Expandable lesson with content
 */
function LessonAccordion({ 
  lesson, 
  index, 
  colors 
}: { 
  lesson: any; 
  index: number; 
  colors: { bg: string; text: string; border: string; light: string };
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Lesson Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`w-8 h-8 rounded-full ${isExpanded ? colors.bg + ' text-white' : 'bg-gray-100 text-gray-600'} flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors`}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
          {lesson.source && (
            <p className="text-xs text-gray-400 truncate">{lesson.source}</p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Lesson Content (expanded) */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 bg-gray-50">
          {/* Context / Key Teaching */}
          {lesson.context && (
            <p className="text-sm text-gray-700">{lesson.context}</p>
          )}
          {lesson.keyTeaching && (
            <div className="p-4 bg-violet-50 border-l-4 border-violet-400 rounded-r-lg">
              <h5 className="text-sm font-semibold text-violet-700 mb-1">Key Teaching</h5>
              <p className="text-sm text-gray-700">{lesson.keyTeaching}</p>
            </div>
          )}
          {lesson.teaching && typeof lesson.teaching === 'string' && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <p className="text-sm text-gray-700 italic">"{lesson.teaching}"</p>
              {lesson.elder && <p className="text-xs text-amber-700 mt-2">— {lesson.elder}</p>}
            </div>
          )}

          {/* Content array */}
          {lesson.content && Array.isArray(lesson.content) && lesson.content.length > 0 && (
            <div className="space-y-2">
              {lesson.content.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                  {item.method && <p className="font-semibold text-gray-800">{item.method}</p>}
                  {item.animal && <p className="font-semibold text-gray-800">{item.animal}</p>}
                  {item.secwepemc && <p className="font-semibold text-emerald-700">{item.secwepemc}</p>}
                  {(item.description || item.english) && (
                    <p className="text-sm text-gray-600 mt-1">{item.description || item.english}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Discussion Questions */}
          {lesson.discussionQuestions && lesson.discussionQuestions.length > 0 && (
            <div className="p-4 bg-sky-50 rounded-lg">
              <h5 className="text-sm font-semibold text-sky-700 mb-2">Discussion Questions</h5>
              <ul className="space-y-1">
                {lesson.discussionQuestions.map((q: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-sky-400">•</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details object (coming of age, etc) */}
          {lesson.details && typeof lesson.details === 'object' && (
            <div className="p-4 bg-rose-50 rounded-lg space-y-2">
              {lesson.details.duration && (
                <p className="text-sm"><strong>Duration:</strong> {lesson.details.duration}</p>
              )}
              {lesson.details.skills && (
                <div>
                  <p className="text-sm font-semibold text-rose-700">Skills:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {lesson.details.skills.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {lesson.details.attire && (
                <div>
                  <p className="text-sm font-semibold text-rose-700">Attire:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {lesson.details.attire.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Phrases */}
          {lesson.phrases && lesson.phrases.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lesson.phrases.map((p: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-emerald-700">{p.secwepemc}</p>
                  <p className="text-sm text-gray-600">{p.english}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pattern */}
          {lesson.pattern && lesson.pattern.length > 0 && (
            <div className="space-y-2">
              {lesson.pattern.map((p: any, i: number) => (
                <div key={i} className="p-3 bg-violet-50 border-l-4 border-violet-300 rounded-r-lg">
                  <p className="font-semibold text-violet-800">{p.secwepemc}</p>
                  <p className="text-sm text-gray-600">{p.english}</p>
                </div>
              ))}
            </div>
          )}

          {/* Numbers */}
          {lesson.numbers && lesson.numbers.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {lesson.numbers.map((n: any, i: number) => (
                <div key={i} className="p-2 bg-sky-50 rounded-lg text-center border border-sky-200">
                  <p className="text-lg font-bold text-sky-800">{n.number}</p>
                  <p className="text-xs text-sky-600">{n.secwepemc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Commands */}
          {lesson.commands && lesson.commands.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lesson.commands.map((cmd: any, i: number) => (
                <div key={i} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-800">{cmd.secwepemc}</p>
                  <p className="text-sm text-gray-600">{cmd.english}</p>
                </div>
              ))}
            </div>
          )}

          {/* Games */}
          {lesson.games && typeof lesson.games === 'object' && (
            <div className="space-y-3">
              {['easy', 'medium', 'advanced'].map((difficulty) => {
                const games = (lesson.games as any)[difficulty];
                if (!games) return null;
                const diffColors: Record<string, string> = {
                  easy: 'bg-green-50 border-green-200 text-green-800',
                  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  advanced: 'bg-red-50 border-red-200 text-red-800',
                };
                return (
                  <div key={difficulty}>
                    <h6 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                      {difficulty} Games
                    </h6>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {games.map((g: any, i: number) => (
                        <div key={i} className={`p-2 rounded-lg border ${diffColors[difficulty]}`}>
                          <p className="font-medium text-sm">{g.name}</p>
                          <p className="text-xs opacity-70">Players: {g.players}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CurriculumPage;
