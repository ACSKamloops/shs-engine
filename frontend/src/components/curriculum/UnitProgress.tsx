/**
 * UnitProgress - Visual progress tracker for curriculum units
 * 
 * Features:
 * - Animated progress bar with gradient
 * - Lesson completion dots
 * - Current lesson highlight pulse
 * - Celebration animation on completion
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface UnitProgressProps {
  totalLessons: number;
  completedLessons: number;
  currentLessonIndex?: number;
  colorScheme?: 'forest' | 'earth' | 'amber';
  showDots?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorSchemes = {
  forest: {
    bar: 'from-shs-forest-500 to-shs-forest-600',
    bg: 'bg-shs-forest-100',
    dot: 'bg-shs-forest-500',
    dotBg: 'bg-shs-forest-200',
    text: 'text-shs-forest-700',
  },
  earth: {
    bar: 'from-shs-earth-500 to-shs-earth-600',
    bg: 'bg-shs-earth-100',
    dot: 'bg-shs-earth-500',
    dotBg: 'bg-shs-earth-200',
    text: 'text-shs-earth-700',
  },
  amber: {
    bar: 'from-shs-amber-400 to-shs-amber-500',
    bg: 'bg-shs-amber-100',
    dot: 'bg-shs-amber-500',
    dotBg: 'bg-shs-amber-200',
    text: 'text-shs-amber-700',
  },
};

const sizes = {
  sm: { bar: 'h-1.5', dot: 'w-2 h-2' },
  md: { bar: 'h-2.5', dot: 'w-3 h-3' },
  lg: { bar: 'h-3.5', dot: 'w-4 h-4' },
};

export default function UnitProgress({
  totalLessons,
  completedLessons,
  currentLessonIndex = 0,
  colorScheme = 'forest',
  showDots = true,
  size = 'md',
}: UnitProgressProps) {
  const colors = colorSchemes[colorScheme];
  const sizeStyles = sizes[size];
  
  const percentage = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }, [completedLessons, totalLessons]);

  const isComplete = completedLessons >= totalLessons;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative">
        <div className={`w-full ${sizeStyles.bar} ${colors.bg} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`h-full bg-gradient-to-r ${colors.bar} rounded-full relative`}
          >
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
                repeatDelay: 3,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Percentage label */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -top-6 right-0 text-xs font-semibold ${colors.text}`}
        >
          {percentage}%
        </motion.div>
      </div>

      {/* Lesson dots */}
      {showDots && totalLessons <= 20 && (
        <div className="flex items-center justify-between mt-3 gap-1">
          {Array.from({ length: totalLessons }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex-1 flex justify-center"
            >
              <motion.div
                className={`
                  ${sizeStyles.dot} rounded-full transition-all duration-300
                  ${index < completedLessons 
                    ? colors.dot 
                    : index === currentLessonIndex 
                      ? `${colors.dot} ring-2 ring-offset-2 ring-${colorScheme === 'forest' ? 'green' : colorScheme === 'amber' ? 'amber' : 'orange'}-300`
                      : colors.dotBg
                  }
                `}
                animate={index === currentLessonIndex ? {
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                {/* Checkmark for completed */}
                {index < completedLessons && (
                  <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completion celebration */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-xl"
          >
            🎉
          </motion.span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            Unit Complete!
          </span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{completedLessons} of {totalLessons} lessons</span>
        {!isComplete && currentLessonIndex !== undefined && (
          <span>Current: Lesson {currentLessonIndex + 1}</span>
        )}
      </div>
    </div>
  );
}
