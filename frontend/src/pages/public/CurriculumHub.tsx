/**
 * CurriculumHub - Premium Masterclass-Style Learning Platform
 * 
 * UX REDESIGN (Jan 2026):
 * - Hero section with featured pathway
 * - "Continue Learning" resume card
 * - 4 pathway tabs with progress rings
 * - Premium module cards
 * - Progress tracking integration
 */
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Curriculum data imports
import foodSovereignty from '../../data/curriculum/food_sovereignty_curriculum.json';
import landStewardship from '../../data/curriculum/land_stewardship_curriculum.json';
import culturalPreservation from '../../data/curriculum/cultural_preservation_curriculum.json';
import healingWellness from '../../data/curriculum/healing_wellness_curriculum.json';
import youthMentorship from '../../data/curriculum/youth_mentorship_curriculum.json';
import legalTraditions from '../../data/curriculum/legal_traditions_curriculum.json';

// Supporting data
import elderQuotesData from '../../data/elder_quotes.json';
import dictionaryData from '../../data/dictionary_gold_standard.json';

// Helper to get module metadata
const getModuleMeta = (data: any) => ({
  moduleId: data.moduleId || data.metadata?.moduleId,
  title: data.title || data.metadata?.title,
  subtitle: data.subtitle || data.metadata?.subtitle,
  program: data.program || data.metadata?.program,
  description: data.description || data.metadata?.description,
});

// Pathway definitions with Secwépemctsín
const pathways = [
  { id: 'land', element: 'tmícw', name: 'Land', fullName: 'Physical Connection', color: 'emerald', icon: '🌲' },
  { id: 'mind', element: 'sképqin', name: 'Mind', fullName: 'Mental Learning', color: 'sky', icon: '📖' },
  { id: 'heart', element: 'púsmen', name: 'Heart', fullName: 'Emotional Wisdom', color: 'rose', icon: '❤️' },
  { id: 'spirit', element: 'súmec', name: 'Spirit', fullName: 'Spiritual Foundation', color: 'violet', icon: '✨' },
];

// Module registry
const allModules = [
  { data: foodSovereignty, pathway: 'land', icon: '🍖', heroGradient: 'from-amber-600 to-orange-700' },
  { data: landStewardship, pathway: 'land', icon: '🌲', heroGradient: 'from-emerald-600 to-teal-700' },
  { data: culturalPreservation, pathway: 'mind', icon: '🎭', heroGradient: 'from-sky-600 to-blue-700' },
  { data: healingWellness, pathway: 'heart', icon: '💚', heroGradient: 'from-rose-500 to-pink-600' },
  { data: youthMentorship, pathway: 'mind', icon: '👨‍👩‍👧', heroGradient: 'from-indigo-500 to-purple-600' },
  { data: legalTraditions, pathway: 'spirit', icon: '⚖️', heroGradient: 'from-violet-600 to-purple-700' },
];

// Color schemes
const pathwayColors: Record<string, { bg: string; text: string; light: string; ring: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', ring: 'ring-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50', ring: 'ring-sky-400', gradient: 'from-sky-500 to-blue-500' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', ring: 'ring-rose-400', gradient: 'from-rose-500 to-pink-500' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50', ring: 'ring-violet-400', gradient: 'from-violet-500 to-purple-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', ring: 'ring-amber-400', gradient: 'from-amber-500 to-orange-500' },
};

// Progress Ring Component
function ProgressRing({ progress, size = 48, strokeWidth = 4, color = 'emerald' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-200"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={pathwayColors[color]?.text || 'text-emerald-500'}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
}

export function CurriculumHub() {
  const navigate = useNavigate();
  const [activePathway, setActivePathway] = useState<string | null>(null);
  
  // Simulated progress (would come from a store in production)
  const [progress] = useState(() => ({
    lastModule: 'food_sovereignty',
    lastUnit: 'gathering_knowledge',
    lastLesson: 'berry_harvesting',
    completedLessons: ['deer_hunting', 'salmon_ceremony', 'root_foods'],
    streak: 3,
  }));

  // Calculate stats
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalLessons = 0;
    
    allModules.forEach(mod => {
      totalUnits += mod.data.units?.length || 0;
      mod.data.units?.forEach((unit: any) => {
        totalLessons += unit.lessons?.length || 0;
      });
    });

    const wordCount = Array.isArray(dictionaryData) 
      ? dictionaryData.length 
      : (dictionaryData as any).entries?.length || 12690;

    return { modules: allModules.length, units: totalUnits, lessons: totalLessons, words: wordCount };
  }, []);

  // Get pathway stats
  const pathwayStats = useMemo(() => {
    const result: Record<string, { modules: number; completed: number; total: number }> = {};
    pathways.forEach(p => {
      const mods = allModules.filter(m => m.pathway === p.id);
      const total = mods.reduce((acc, m) => {
        return acc + (m.data.units?.reduce((a: number, u: any) => a + (u.lessons?.length || 0), 0) || 0);
      }, 0);
      const completed = Math.floor(total * Math.random() * 0.4); // Simulated progress
      result[p.id] = { modules: mods.length, completed, total };
    });
    return result;
  }, []);

  // Filter modules by pathway
  const filteredModules = useMemo(() => {
    if (!activePathway) return allModules;
    return allModules.filter(m => m.pathway === activePathway);
  }, [activePathway]);

  // Get random elder quote
  const elderQuote = useMemo(() => {
    const quotes = elderQuotesData.quotes || [];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  // Find resume module
  const resumeModule = useMemo(() => {
    return allModules.find(m => getModuleMeta(m.data).moduleId === progress.lastModule);
  }, [progress.lastModule]);

  const resumeUnit = useMemo(() => {
    if (!resumeModule) return null;
    return resumeModule.data.units?.find((u: any) => u.unitId === progress.lastUnit);
  }, [resumeModule, progress.lastUnit]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-700 to-shs-forest-900 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-shs-forest-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 font-medium">
                  🔥 {progress.streak} day streak
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 font-medium">
                  ✓ {progress.completedLessons.length} lessons completed
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Learn Traditional<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  Secwépemc Knowledge
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-8 max-w-lg">
                Explore {stats.modules} curriculum modules covering food sovereignty, land stewardship, 
                cultural preservation, and more.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => resumeModule && navigate(`/curriculum/land/${getModuleMeta(resumeModule.data).moduleId}`)}
                  className="px-8 py-4 bg-white text-shs-forest-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                >
                  <span className="text-2xl">▶️</span>
                  Continue Learning
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Browse All Modules
                </motion.button>
              </div>
            </motion.div>

            {/* Right: Resume Card */}
            {resumeModule && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                  <p className="text-sm font-medium text-white/60 uppercase tracking-wide mb-4">
                    Continue where you left off
                  </p>
                  
                  <div className={`bg-gradient-to-br ${resumeModule.heroGradient} rounded-2xl p-6 mb-4`}>
                    <span className="text-5xl mb-4 block">{resumeModule.icon}</span>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {getModuleMeta(resumeModule.data).title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {resumeUnit?.title || 'Getting Started'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Your Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-white/20 rounded-full w-32">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="h-full bg-white rounded-full"
                          />
                        </div>
                        <span className="text-white font-semibold text-sm">45%</span>
                      </div>
                    </div>
                    <Link
                      to={`/curriculum/land/${getModuleMeta(resumeModule.data).moduleId}`}
                      className="p-3 bg-white rounded-xl text-shs-forest-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* PATHWAY TABS */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {/* All tab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePathway(null)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activePathway === null
                  ? 'bg-shs-forest-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">📚</span>
              All Pathways
            </motion.button>

            {pathways.map((pathway) => {
              const colors = pathwayColors[pathway.color];
              const pStats = pathwayStats[pathway.id];
              const progressPercent = pStats.total > 0 ? Math.round((pStats.completed / pStats.total) * 100) : 0;
              
              return (
                <motion.button
                  key={pathway.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActivePathway(pathway.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    activePathway === pathway.id
                      ? `${colors.bg} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="relative">
                    <ProgressRing progress={progressPercent} size={32} strokeWidth={3} color={pathway.color} />
                    <span className="absolute inset-0 flex items-center justify-center text-sm">
                      {pathway.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">{pathway.element}</div>
                    <div className={`text-xs ${activePathway === pathway.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {pathway.name}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODULES GRID */}
      <section id="modules" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activePathway ? pathways.find(p => p.id === activePathway)?.name + ' Pathway' : 'All Learning Modules'}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredModules.length} modules • {stats.lessons} total lessons
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePathway || 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredModules.map((mod, index) => {
              const meta = getModuleMeta(mod.data);
              const unitCount = mod.data.units?.length || 0;
              const lessonCount = mod.data.units?.reduce((a: number, u: any) => a + (u.lessons?.length || 0), 0) || 0;
              const moduleProgress = Math.floor(Math.random() * 100); // Simulated

              return (
                <motion.div
                  key={meta.moduleId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    to={`/curriculum/${mod.pathway}/${meta.moduleId}`}
                    className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    {/* Hero Image/Gradient */}
                    <div className={`h-40 bg-gradient-to-br ${mod.heroGradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                          className="text-7xl opacity-30"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                          {mod.icon}
                        </motion.span>
                      </div>
                      
                      {/* Progress badge */}
                      {moduleProgress > 0 && (
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white" />
                          <span className="text-white text-sm font-semibold">{moduleProgress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-shs-forest-600 transition-colors">
                          {meta.title}
                        </h3>
                        <span className="text-3xl">{mod.icon}</span>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {meta.description || meta.subtitle || 'Explore traditional knowledge and cultural teachings...'}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <span>📦</span> {unitCount} units
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📖</span> {lessonCount} lessons
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="relative">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${moduleProgress}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                            className={`h-full bg-gradient-to-r ${mod.heroGradient} rounded-full`}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ELDER WISDOM FOOTER */}
      {elderQuote && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-amber-600 text-sm font-bold uppercase tracking-widest">✦ Elder Wisdom</span>
              <p className="text-2xl lg:text-3xl text-gray-800 italic mt-6 mb-6 leading-relaxed">
                "{elderQuote.english}"
              </p>
              <p className="text-lg font-bold text-amber-800">{elderQuote.speaker}</p>
              {elderQuote.community && (
                <p className="text-amber-600">{elderQuote.community}</p>
              )}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CurriculumHub;
