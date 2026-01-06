/**
 * CurriculumSidebar - Unified navigation for curriculum modules
 * 
 * Features:
 * - Sticky sidebar on desktop
 * - Collapsible unit groups
 * - Active lesson indicator
 * - Smooth scroll-to-section
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Unit {
  unitId: string;
  title: string;
  lessons: Array<{
    lessonId: string;
    title: string;
  }>;
}

interface CurriculumSidebarProps {
  units: Unit[];
  currentUnitId?: string;
  currentLessonId?: string;
  completedLessons?: string[];
  colorScheme?: 'forest' | 'earth' | 'amber';
  onUnitSelect?: (unitId: string) => void;
  onLessonSelect?: (unitId: string, lessonId: string) => void;
}

const colorSchemes = {
  forest: {
    accent: 'bg-shs-forest-600',
    accentText: 'text-shs-forest-600',
    hover: 'hover:bg-shs-forest-50',
    active: 'bg-shs-forest-50 text-shs-forest-700',
    border: 'border-shs-forest-200',
  },
  earth: {
    accent: 'bg-shs-earth-600',
    accentText: 'text-shs-earth-600',
    hover: 'hover:bg-shs-earth-50',
    active: 'bg-shs-earth-50 text-shs-earth-700',
    border: 'border-shs-earth-200',
  },
  amber: {
    accent: 'bg-shs-amber-500',
    accentText: 'text-shs-amber-600',
    hover: 'hover:bg-shs-amber-50',
    active: 'bg-shs-amber-50 text-shs-amber-700',
    border: 'border-shs-amber-200',
  },
};

export default function CurriculumSidebar({
  units,
  currentUnitId,
  currentLessonId,
  completedLessons = [],
  colorScheme = 'forest',
  onUnitSelect,
  onLessonSelect,
}: CurriculumSidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(
    currentUnitId ? [currentUnitId] : units.length > 0 ? [units[0].unitId] : []
  );
  const colors = colorSchemes[colorScheme];

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
    onUnitSelect?.(unitId);
  };

  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const getUnitProgress = (unit: Unit) => {
    const completed = unit.lessons.filter(l => isLessonCompleted(l.lessonId)).length;
    return { completed, total: unit.lessons.length };
  };

  return (
    <nav className="w-full">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Contents</h2>
        <p className="text-sm text-gray-500">
          {units.length} units • {units.reduce((acc, u) => acc + u.lessons.length, 0)} lessons
        </p>
      </div>

      {/* Units list */}
      <div className="space-y-2">
        {units.map((unit, unitIndex) => {
          const isExpanded = expandedUnits.includes(unit.unitId);
          const isCurrentUnit = currentUnitId === unit.unitId;
          const progress = getUnitProgress(unit);

          return (
            <div key={unit.unitId} className="rounded-xl overflow-hidden">
              {/* Unit header */}
              <motion.button
                onClick={() => toggleUnit(unit.unitId)}
                className={`
                  w-full flex items-center gap-3 p-3 text-left
                  ${isCurrentUnit ? colors.active : `bg-white ${colors.hover}`}
                  transition-all duration-200 rounded-xl
                  ${isExpanded ? '' : 'border border-gray-200/60'}
                `}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Unit number */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                  ${isCurrentUnit ? colors.accent + ' text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {unitIndex + 1}
                </div>

                {/* Unit title and progress */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm truncate ${isCurrentUnit ? colors.accentText : 'text-gray-900'}`}>
                    {unit.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        className={`h-full bg-gradient-to-r ${colorScheme === 'forest' ? 'from-green-400 to-green-500' : colorScheme === 'amber' ? 'from-amber-400 to-amber-500' : 'from-orange-400 to-orange-500'} rounded-full`}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                </div>

                {/* Expand indicator */}
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.button>

              {/* Lessons list */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 px-2">
                      {unit.lessons.map((lesson, lessonIndex) => {
                        const isCurrentLesson = currentLessonId === lesson.lessonId;
                        const isCompleted = isLessonCompleted(lesson.lessonId);

                        return (
                          <motion.button
                            key={lesson.lessonId}
                            onClick={() => onLessonSelect?.(unit.unitId, lesson.lessonId)}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: lessonIndex * 0.03 }}
                            className={`
                              w-full flex items-center gap-3 p-2.5 rounded-lg text-left
                              ${isCurrentLesson ? colors.active : `${colors.hover} text-gray-700`}
                              transition-all duration-150
                            `}
                            whileHover={{ x: 4 }}
                          >
                            {/* Status indicator */}
                            <div className={`
                              w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                              ${isCompleted 
                                ? colors.accent + ' text-white' 
                                : isCurrentLesson 
                                  ? `ring-2 ${colors.border} bg-white`
                                  : 'bg-gray-200'
                              }
                            `}>
                              {isCompleted ? (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-medium text-gray-500">
                                  {lessonIndex + 1}
                                </span>
                              )}
                            </div>

                            {/* Lesson title */}
                            <span className={`
                              text-sm truncate
                              ${isCurrentLesson ? 'font-medium' : ''}
                              ${isCompleted ? 'line-through opacity-70' : ''}
                            `}>
                              {lesson.title}
                            </span>

                            {/* Current indicator */}
                            {isCurrentLesson && (
                              <motion.div
                                layoutId="currentLessonIndicator"
                                className={`ml-auto w-1.5 h-1.5 rounded-full ${colors.accent}`}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
