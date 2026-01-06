/**
 * CurriculumPage - Premium Module Experience (Redesigned Jan 2026)
 * 
 * UX FEATURES:
 * - Immersive hero header with module theme
 * - Syllabus timeline view (vertical)
 * - Expandable unit cards with smooth animation
 * - Tabbed lesson content (Content | Vocabulary | Elder Wisdom)
 * - Progress tracking and completion celebrations
 */
import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonContentRenderer, PracticeQuiz } from '../../components/curriculum';

// Curriculum data imports
import foodSovereignty from '../../data/curriculum/food_sovereignty_curriculum.json';
import landStewardship from '../../data/curriculum/land_stewardship_curriculum.json';
import culturalPreservation from '../../data/curriculum/cultural_preservation_curriculum.json';
import healingWellness from '../../data/curriculum/healing_wellness_curriculum.json';
import youthMentorship from '../../data/curriculum/youth_mentorship_curriculum.json';
import legalTraditions from '../../data/curriculum/legal_traditions_curriculum.json';

// Gold standard reading imports
import foodsBook from '../../data/gold_standard/foods_cultural_series.json';
import gamesBook from '../../data/gold_standard/games_cultural_series.json';
import homesBook from '../../data/gold_standard/homes_cultural_series.json';
import clothingBook from '../../data/gold_standard/clothing_cultural_series.json';
import technologyBook from '../../data/gold_standard/technology_cultural_series.json';
import songsDancesBook from '../../data/gold_standard/songs_dances_cultural_series.json';
import thingsWeDoBook from '../../data/gold_standard/things_we_do_cultural.json';

// Configs
import pathwayConfig from '../../data/config/pathways.json';
import unitReadingMap from '../../data/config/unit_reading_map.json';

// Helper to get module metadata
const getModuleMeta = (data: any) => ({
  moduleId: data.moduleId || data.metadata?.moduleId,
  title: data.title || data.metadata?.title,
  subtitle: data.subtitle || data.metadata?.subtitle,
  program: data.program || data.metadata?.program,
  description: data.description || data.metadata?.description,
});

// Book sources for supplemental reading
const bookSources: Record<string, any> = {
  foods: foodsBook, games: gamesBook, homes: homesBook,
  clothing: clothingBook, technology: technologyBook,
  songsDances: songsDancesBook, thingsWeDo: thingsWeDoBook,
};

// Build unit chapter map
const unitChapterMap: Record<string, any[]> = {};
for (const [unitId, readings] of Object.entries(unitReadingMap as Record<string, any[]>)) {
  unitChapterMap[unitId] = readings.map(r => ({
    ...r, source: bookSources[r.sourceKey] || null,
  }));
}

// Curriculum registry
const curriculumData: Record<string, any> = {
  food_sovereignty: foodSovereignty,
  land_stewardship: landStewardship,
  cultural_preservation: culturalPreservation,
  healing_wellness: healingWellness,
  youth_mentorship: youthMentorship,
  legal_traditions: legalTraditions,
};

// Module themes
const moduleThemes: Record<string, { gradient: string; icon: string }> = {
  food_sovereignty: { gradient: 'from-amber-600 via-orange-600 to-red-600', icon: '🍖' },
  land_stewardship: { gradient: 'from-emerald-600 via-teal-600 to-cyan-600', icon: '🌲' },
  cultural_preservation: { gradient: 'from-sky-600 via-blue-600 to-indigo-600', icon: '🎭' },
  healing_wellness: { gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', icon: '💚' },
  youth_mentorship: { gradient: 'from-indigo-500 via-purple-500 to-pink-500', icon: '👨‍👩‍👧' },
  legal_traditions: { gradient: 'from-violet-600 via-purple-600 to-indigo-600', icon: '⚖️' },
};

const pathwayInfo = pathwayConfig as Record<string, { name: string; element: string; color: string }>;

export function CurriculumPage() {
  const { pathwayId, moduleId } = useParams<{ pathwayId?: string; moduleId?: string }>();
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'vocabulary' | 'elder' | 'practice' | 'reading' | 'plants'>('content');
  const [userMode, setUserMode] = useState<'explore' | 'learn'>('explore'); // Default to explore

  // Get current module
  const currentModule = useMemo(() => {
    if (!moduleId) return null;
    return curriculumData[moduleId];
  }, [moduleId]);

  const moduleMeta = currentModule ? getModuleMeta(currentModule) : null;
  const theme = moduleId ? moduleThemes[moduleId] || moduleThemes.food_sovereignty : moduleThemes.food_sovereignty;
  const pathway = pathwayId && pathwayInfo[pathwayId] ? pathwayInfo[pathwayId] : null;

  // Calculate stats
  const stats = useMemo(() => {
    if (!currentModule) return { units: 0, lessons: 0, completed: 0 };
    const units = currentModule.units?.length || 0;
    const lessons = currentModule.units?.reduce((a: number, u: any) => a + (u.lessons?.length || 0), 0) || 0;
    const completed = completedLessons.length;
    return { units, lessons, completed };
  }, [currentModule, completedLessons]);

  // Auto-expand first unit
  useEffect(() => {
    if (currentModule?.units?.[0] && !expandedUnit) {
      setExpandedUnit(currentModule.units[0].unitId);
    }
  }, [currentModule, expandedUnit]);

  if (!currentModule || !moduleMeta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md"
        >
          <span className="text-6xl mb-4 block">📚</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Not Found</h2>
          <p className="text-gray-600 mb-6">The curriculum module you're looking for doesn't exist.</p>
          <Link
            to="/curriculum"
            className="inline-flex items-center gap-2 px-6 py-3 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors"
          >
            ← Back to Curriculum
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* IMMERSIVE HERO */}
      <section className={`relative bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12 lg:py-16">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-white/70 mb-8"
          >
            <Link to="/curriculum" className="hover:text-white transition-colors">Curriculum</Link>
            <span>/</span>
            {pathway && (
              <>
                <Link to={`/curriculum/${pathwayId}`} className="hover:text-white transition-colors">
                  {pathway.element}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white font-medium">{moduleMeta.title}</span>
          </motion.nav>

          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Module Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-7xl block mb-6"
              >
                {theme.icon}
              </motion.span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {moduleMeta.title}
              </h1>
              <p className="text-xl text-white/80 mb-6 max-w-lg">
                {moduleMeta.description || moduleMeta.subtitle || 'Explore traditional knowledge and cultural teachings.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="text-white font-bold">{stats.units}</p>
                    <p className="text-white/70 text-sm">Units</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="text-white font-bold">{stats.lessons}</p>
                    <p className="text-white/70 text-sm">Lessons</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="text-white font-bold">{stats.completed}</p>
                    <p className="text-white/70 text-sm">Completed</p>
                  </div>
                </div>
              </div>

              {/* Explore/Learn Mode Toggle */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-white/70 text-sm">Mode:</span>
                <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={() => setUserMode('explore')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      userMode === 'explore'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    🔍 Explore
                  </button>
                  <button
                    onClick={() => setUserMode('learn')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      userMode === 'learn'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    📚 Track Progress
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Progress Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 283' }}
                    animate={{ strokeDasharray: `${(stats.completed / Math.max(stats.lessons, 1)) * 283} 283` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl font-bold">
                    {stats.lessons > 0 ? Math.round((stats.completed / stats.lessons) * 100) : 0}%
                  </span>
                  <span className="text-sm text-white/70">Complete</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SYLLABUS TIMELINE */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Syllabus</h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

          {/* Units */}
          <div className="space-y-6">
            {currentModule.units?.map((unit: any, unitIndex: number) => {
              const isExpanded = expandedUnit === unit.unitId;
              const unitLessons = unit.lessons || [];
              const unitCompleted = unitLessons.filter((l: any) => completedLessons.includes(l.lessonId)).length;
              const unitProgress = unitLessons.length > 0 ? Math.round((unitCompleted / unitLessons.length) * 100) : 0;

              return (
                <motion.div
                  key={unit.unitId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: unitIndex * 0.1 }}
                  className="relative"
                >
                  {/* Timeline node */}
                  <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                    unitProgress === 100 ? 'bg-green-500 border-green-200' :
                    unitProgress > 0 ? 'bg-amber-500 border-amber-200' :
                    'bg-gray-300 border-gray-100'
                  }`} />

                  {/* Unit Card */}
                  <div className="ml-14">
                    <motion.button
                      onClick={() => setExpandedUnit(isExpanded ? null : unit.unitId)}
                      className={`w-full text-left p-6 rounded-2xl transition-all ${
                        isExpanded
                          ? 'bg-white shadow-xl ring-2 ring-shs-forest-200'
                          : 'bg-white/80 hover:bg-white hover:shadow-lg'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                              Unit {unitIndex + 1}
                            </span>
                            {unitProgress === 100 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                ✓ Complete
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{unit.title}</h3>
                          {unit.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">{unit.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>{unitLessons.length} lessons</span>
                            <span>{unitCompleted}/{unitLessons.length} completed</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Mini progress */}
                          <div className="hidden sm:block w-24">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${unitProgress}%` }}
                                className={`h-full rounded-full ${
                                  unitProgress === 100 ? 'bg-green-500' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Expand arrow */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Expanded Lessons */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {unitLessons.map((lesson: any, lessonIndex: number) => {
                              const isComplete = completedLessons.includes(lesson.lessonId);
                              const isLessonExpanded = expandedLesson === lesson.lessonId;

                              return (
                                <motion.div
                                  key={lesson.lessonId}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: lessonIndex * 0.05 }}
                                >
                                  <button
                                    onClick={() => setExpandedLesson(isLessonExpanded ? null : lesson.lessonId)}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${
                                      isLessonExpanded
                                        ? 'bg-shs-forest-50 ring-2 ring-shs-forest-200'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                      }`}>
                                        {isComplete ? (
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        ) : (
                                          <span className="text-sm font-bold">{lessonIndex + 1}</span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold ${isComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                          {lesson.title}
                                        </h4>
                                      </div>
                                      <motion.div
                                        animate={{ rotate: isLessonExpanded ? 180 : 0 }}
                                        className="text-gray-400"
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </motion.div>
                                    </div>
                                  </button>

                                  {/* Lesson Content */}
                                  <AnimatePresence>
                                    {isLessonExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-4 bg-white rounded-xl mt-2 border border-gray-200">
                                        {/* Tabs - Only show tabs that have lesson-specific content */}
                                          <div className="flex flex-wrap gap-2 mb-4">
                                            <button
                                              onClick={() => setActiveTab('content')}
                                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                activeTab === 'content'
                                                  ? 'bg-shs-forest-600 text-white'
                                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                              }`}
                                            >
                                              📖 Content
                                            </button>
                                            {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                                              <button
                                                onClick={() => setActiveTab('practice')}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                  activeTab === 'practice'
                                                    ? 'bg-shs-forest-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                              >
                                                🎯 Practice ({lesson.vocabulary.length} terms)
                                              </button>
                                            )}
                                            {lesson.elderWisdom && (
                                              <button
                                                onClick={() => setActiveTab('elder')}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                  activeTab === 'elder'
                                                    ? 'bg-shs-forest-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                              >
                                                🪶 Elder Wisdom
                                              </button>
                                            )}
                                          </div>

                                          {/* Tab Content */}
                                          <div className="min-h-[100px]">
                                            {activeTab === 'content' && (
                                              <LessonContentRenderer
                                                content={lesson.content}
                                                steps={lesson.steps}
                                                protocol={lesson.protocol}
                                                animals={lesson.animals}
                                                species={lesson.species}
                                                roots={lesson.roots}
                                                practices={lesson.practices}
                                                calendar={lesson.calendar}
                                              />
                                            )}

                                            {activeTab === 'practice' && lesson.vocabulary && (
                                              <PracticeQuiz
                                                vocabulary={lesson.vocabulary}
                                                lessonTitle={lesson.title}
                                                onComplete={(score, total) => {
                                                  if (score / total >= 0.8 && !completedLessons.includes(lesson.lessonId)) {
                                                    setCompletedLessons(prev => [...prev, lesson.lessonId]);
                                                  }
                                                }}
                                              />
                                            )}

                                            {activeTab === 'elder' && lesson.elderWisdom && (
                                              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <p className="text-amber-900 italic text-lg mb-3">
                                                  "{lesson.elderWisdom.quote || lesson.elderWisdom.english}"
                                                </p>
                                                {lesson.elderWisdom.speaker && (
                                                  <p className="text-amber-700 font-semibold">
                                                    — {lesson.elderWisdom.speaker}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {/* Mark Complete Button */}
                                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <motion.button
                                              whileHover={{ scale: 1.02 }}
                                              whileTap={{ scale: 0.98 }}
                                              onClick={() => {
                                                if (isComplete) {
                                                  setCompletedLessons(prev => prev.filter(id => id !== lesson.lessonId));
                                                } else {
                                                  setCompletedLessons(prev => [...prev, lesson.lessonId]);
                                                }
                                              }}
                                              className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                                                isComplete
                                                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                  : 'bg-shs-forest-600 text-white hover:bg-shs-forest-700'
                                              }`}
                                            >
                                              {isComplete ? '↩ Mark Incomplete' : '✓ Mark Complete'}
                                            </motion.button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CurriculumPage;
