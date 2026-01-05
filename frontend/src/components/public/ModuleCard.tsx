/**
 * ModuleCard - Storytelling & Discovery Design (Jan 2026)
 * 
 * IMAGE-BASED CARD LAYOUT:
 * - Photo placeholder with gradient fallback
 * - Serif title (Playfair Display)
 * - White/cream card on earth-tone background
 * - Soft drop shadows, museum-like feel
 */
import { Link } from 'react-router-dom';

interface UnitPreview {
  unitId: string;
  title: string;
}

interface ModuleCardProps {
  moduleId: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  pathway: 'land' | 'mind' | 'heart' | 'spirit';
  unitCount: number;
  lessonCount: number;
  progress?: number;
  highlights?: string[];
  units?: UnitPreview[];
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Pathway-specific image gradients (placeholders for real photos)
const pathwayImages = {
  land: {
    gradient: 'from-emerald-600 via-green-500 to-teal-600',
    overlay: 'bg-emerald-900/40',
    accent: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  mind: {
    gradient: 'from-sky-600 via-blue-500 to-indigo-600',
    overlay: 'bg-sky-900/40',
    accent: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700',
    pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  heart: {
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    overlay: 'bg-amber-900/40',
    accent: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    pattern: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
  },
  spirit: {
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-600',
    overlay: 'bg-violet-900/40',
    accent: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    pattern: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0l4 8 8 4-8 4-4 8-4-8-8-4 8-4z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
  },
};

// Pathway names
const pathwayMeta = {
  land: { element: 'tmícw', name: 'Land' },
  mind: { element: 'sképqin', name: 'Mind' },
  heart: { element: 'púsmen', name: 'Heart' },
  spirit: { element: 'súmec', name: 'Spirit' },
};

export function ModuleCard({
  moduleId,
  title,
  subtitle,
  description,
  icon,
  pathway,
  unitCount,
  lessonCount,
  progress = 0,
  units = [],
  className = '',
  isActive = false,
  onClick,
}: ModuleCardProps) {
  const images = pathwayImages[pathway];
  const meta = pathwayMeta[pathway];
  const hasProgress = progress > 0;

  const cardClasses = `
    group block overflow-hidden rounded-2xl bg-white
    shadow-md hover:shadow-xl
    transition-all duration-300 ease-out
    hover:-translate-y-2
    ${isActive ? 'ring-4 ring-stone-400 shadow-xl' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardContent = (
    <>
      {/* Image Area - Gradient with pattern overlay */}
      <div className={`relative h-48 bg-gradient-to-br ${images.gradient} overflow-hidden`}>
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: images.pattern }}
        />
        
        {/* Overlay gradient for text legibility */}
        <div className={`absolute inset-0 ${images.overlay}`} />
        
        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        </div>
        
        {/* Pathway badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {meta.element} • {meta.name}
          </span>
        </div>
        
        {/* Progress or unit count */}
        <div className="absolute top-4 right-4">
          {hasProgress ? (
            <span className="px-3 py-1 bg-white text-stone-700 text-xs font-semibold rounded-full shadow">
              {Math.round(progress)}% Complete
            </span>
          ) : (
            <span className="px-3 py-1 bg-white text-stone-700 text-xs font-semibold rounded-full shadow">
              {unitCount} Units
            </span>
          )}
        </div>
      </div>

      {/* Content Area - White */}
      <div className="p-6">
        {/* Title - Serif */}
        <h3 
          className="text-xl font-bold text-stone-800 mb-1 group-hover:text-stone-600 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>
        
        {/* Subtitle */}
        {subtitle && (
          <p className={`text-sm font-medium ${images.accent} mb-2`}>
            {subtitle}
          </p>
        )}
        
        {/* Description */}
        <p className="text-sm text-stone-600 line-clamp-2 mb-4">
          {description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {unitCount} units
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {lessonCount} lessons
          </span>
        </div>
        
        {/* Unit preview */}
        {units.length > 0 && (
          <div className="pt-4 border-t border-stone-100">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Units</p>
            <ul className="space-y-1">
              {units.slice(0, 3).map((unit, idx) => (
                <li key={unit.unitId} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className={`w-5 h-5 rounded-full ${images.badge} flex items-center justify-center text-[10px] font-bold`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{unit.title}</span>
                </li>
              ))}
              {units.length > 3 && (
                <li className="text-xs text-stone-400 pl-7">
                  +{units.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
        
        {/* CTA Arrow */}
        <div className="flex items-center justify-end mt-4">
          <span className={`text-sm font-medium ${images.accent} flex items-center gap-1 group-hover:gap-2 transition-all`}>
            <span>Explore</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardClasses}>
        {cardContent}
      </button>
    );
  }

  return (
    <Link to={`/curriculum/${pathway}/${moduleId}`} className={cardClasses}>
      {cardContent}
    </Link>
  );
}

export default ModuleCard;
