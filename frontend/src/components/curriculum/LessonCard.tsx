/**
 * LessonCard - Modern expandable lesson component with animations
 * 
 * Features:
 * - Spring-animated expand/collapse (Framer Motion)
 * - Glassmorphism card with backdrop-blur
 * - Progress indicator
 * - Hover micro-interactions
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonCardProps {
  lesson: {
    lessonId: string;
    title: string;
    content?: string | Record<string, any>;
    vocabulary?: any[];
    elderWisdom?: any;
    practices?: any[];
    calendar?: any;
    source?: string;
  };
  index: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  colorScheme?: 'forest' | 'earth' | 'amber';
  onToggle?: () => void;
}

const colorSchemes = {
  forest: {
    accent: 'bg-shs-forest-600',
    accentHover: 'hover:bg-shs-forest-700',
    light: 'bg-shs-forest-50',
    border: 'border-shs-forest-200',
    text: 'text-shs-forest-700',
    ring: 'ring-shs-forest-500',
  },
  earth: {
    accent: 'bg-shs-earth-600',
    accentHover: 'hover:bg-shs-earth-700',
    light: 'bg-shs-earth-50',
    border: 'border-shs-earth-200',
    text: 'text-shs-earth-700',
    ring: 'ring-shs-earth-500',
  },
  amber: {
    accent: 'bg-shs-amber-500',
    accentHover: 'hover:bg-shs-amber-600',
    light: 'bg-shs-amber-50',
    border: 'border-shs-amber-200',
    text: 'text-shs-amber-700',
    ring: 'ring-shs-amber-500',
  },
};

export default function LessonCard({
  lesson,
  index,
  isCompleted = false,
  isCurrent = false,
  isLocked = false,
  colorScheme = 'forest',
  onToggle,
}: LessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(isCurrent);
  const colors = colorSchemes[colorScheme];

  const handleToggle = () => {
    if (!isLocked) {
      setIsExpanded(!isExpanded);
      onToggle?.();
    }
  };

  // Get content preview
  const getContentPreview = () => {
    if (typeof lesson.content === 'string') {
      return lesson.content.slice(0, 120) + (lesson.content.length > 120 ? '...' : '');
    }
    return null;
  };

  // Count content items
  const contentItems = [
    lesson.vocabulary?.length && `${lesson.vocabulary.length} vocabulary`,
    lesson.elderWisdom && 'Elder wisdom',
    lesson.practices?.length && `${lesson.practices.length} practices`,
    lesson.calendar && 'Seasonal calendar',
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <motion.div
        className={`
          relative overflow-hidden rounded-2xl
          bg-white/80 backdrop-blur-sm
          border ${isExpanded ? colors.border : 'border-gray-200/60'}
          shadow-sm hover:shadow-lg
          transition-all duration-300
          ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${isCurrent ? `ring-2 ${colors.ring} ring-offset-2` : ''}
        `}
        whileHover={!isLocked ? { y: -2, scale: 1.005 } : {}}
        whileTap={!isLocked ? { scale: 0.995 } : {}}
      >
        {/* Header */}
        <div
          onClick={handleToggle}
          className="flex items-center gap-4 p-5"
        >
          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-10 h-10 rounded-xl ${colors.accent} flex items-center justify-center`}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            ) : isLocked ? (
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-xl ${colors.light} ${colors.text} flex items-center justify-center font-bold`}>
                {index + 1}
              </div>
            )}
          </div>

          {/* Title and meta */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 group-hover:${colors.text} transition-colors truncate`}>
              {lesson.title}
            </h3>
            {contentItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {contentItems.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && !isLocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className={`px-5 pb-5 pt-2 border-t ${colors.border}`}>
                {/* Main content */}
                {getContentPreview() && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {getContentPreview()}
                  </p>
                )}

                {/* Elder Wisdom */}
                {lesson.elderWisdom && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🪶</span>
                      <div>
                        <p className="text-amber-900 italic text-sm leading-relaxed">
                          "{lesson.elderWisdom.quote || lesson.elderWisdom.english || 'Elder wisdom shared at camps'}"
                        </p>
                        {lesson.elderWisdom.speaker && (
                          <p className="text-amber-700 text-xs mt-2 font-medium">
                            — {lesson.elderWisdom.speaker}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Vocabulary preview */}
                {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-4"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📚</span> Vocabulary ({lesson.vocabulary.length} terms)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.vocabulary.slice(0, 5).map((v: any, i: number) => (
                        <span
                          key={i}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${colors.light} ${colors.text}`}
                        >
                          {v.secwepemc || v.term}
                        </span>
                      ))}
                      {lesson.vocabulary.length > 5 && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                          +{lesson.vocabulary.length - 5} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Practices preview */}
                {lesson.practices && lesson.practices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>🌱</span> Stewardship Practices ({lesson.practices.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {lesson.practices.slice(0, 4).map((p: any, i: number) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-green-50 rounded-lg text-xs text-green-700 font-medium"
                        >
                          {p.category}
                        </div>
                      ))}
                    </div>
                    {lesson.practices.length > 4 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{lesson.practices.length - 4} more categories
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Source attribution */}
                {lesson.source && (
                  <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                    Source: {lesson.source}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current lesson indicator bar */}
        {isCurrent && (
          <motion.div
            layoutId="currentLesson"
            className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent}`}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
