/**
 * LessonCard - Compact Lesson Preview Card (Dec 2025 Design)
 * 
 * Features:
 * - Compact horizontal layout
 * - Completion checkmark 
 * - Duration indicator
 * - Hover animation
 */
import { Link } from 'react-router-dom';

interface LessonCardProps {
  lessonId: string;
  title: string;
  unitTitle?: string;
  duration?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  pathway: 'land' | 'mind' | 'heart' | 'spirit';
  moduleId: string;
  lessonNumber?: number;
  className?: string;
}

// Pathway color schemes
const pathwayColors = {
  land: {
    accent: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    check: 'text-emerald-500',
    border: 'border-emerald-200',
  },
  mind: {
    accent: 'bg-sky-500',
    light: 'bg-sky-50',
    text: 'text-sky-600',
    check: 'text-sky-500',
    border: 'border-sky-200',
  },
  heart: {
    accent: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-600',
    check: 'text-rose-500',
    border: 'border-rose-200',
  },
  spirit: {
    accent: 'bg-violet-500',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    check: 'text-violet-500',
    border: 'border-violet-200',
  },
};

export function LessonCard({
  lessonId,
  title,
  unitTitle,
  duration = '5 min',
  isCompleted = false,
  isActive = false,
  pathway,
  moduleId,
  lessonNumber,
  className = '',
}: LessonCardProps) {
  const colors = pathwayColors[pathway];

  return (
    <Link
      to={`/curriculum/${pathway}/${moduleId}?lesson=${lessonId}`}
      className={`
        group flex items-center gap-4 p-4 rounded-xl
        bg-white border 
        ${isActive ? `${colors.border} ${colors.light}` : 'border-gray-200'}
        ${isCompleted ? 'opacity-90' : ''}
        hover:shadow-md hover:border-gray-300
        transition-all duration-200
        ${className}
      `}
    >
      {/* Lesson number or checkmark */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full 
        flex items-center justify-center font-bold
        transition-all duration-200
        ${isCompleted 
          ? `${colors.light} ${colors.check}` 
          : isActive
            ? `${colors.accent} text-white`
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
        }
      `}>
        {isCompleted ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-sm">{lessonNumber || '•'}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {unitTitle && (
          <p className={`text-xs font-medium ${colors.text} mb-0.5`}>
            {unitTitle}
          </p>
        )}
        <h4 className={`
          font-semibold text-sm truncate
          ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}
        `}>
          {title}
        </h4>
      </div>

      {/* Duration and arrow */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-gray-400 hidden sm:block">
          {duration}
        </span>
        <svg 
          className={`
            w-4 h-4 text-gray-300 
            group-hover:text-gray-500 group-hover:translate-x-0.5
            transition-all duration-200
          `} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default LessonCard;
