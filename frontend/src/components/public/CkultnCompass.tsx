/**
 * CkultnCompass - Radial Navigation Widget
 * 
 * Medicine Wheel-inspired compass showing the 4 Cḱuĺtn pathways:
 * - Land (tmícw) - NE quadrant - Emerald
 * - Mind (sképqin) - SE quadrant - Sky
 * - Heart (púsmen) - SW quadrant - Amber
 * - Spirit (súmec) - NW quadrant - Violet
 * 
 * Features: Hover glow, click navigation, animated entrance, center balance indicator
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface PathwayData {
  id: string;
  element: string;
  english: string;
  subtitle: string;
  gradient: string;
  glow: string;
  position: 'ne' | 'se' | 'sw' | 'nw';
}

const pathways: PathwayData[] = [
  {
    id: 'land',
    element: 'tmícw',
    english: 'Land',
    subtitle: 'Physical',
    gradient: 'from-emerald-500 to-emerald-700',
    glow: 'rgba(16, 185, 129, 0.4)',
    position: 'ne',
  },
  {
    id: 'mind',
    element: 'sképqin',
    english: 'Mind',
    subtitle: 'Mental',
    gradient: 'from-sky-500 to-sky-700',
    glow: 'rgba(14, 165, 233, 0.4)',
    position: 'se',
  },
  {
    id: 'heart',
    element: 'púsmen',
    english: 'Heart',
    subtitle: 'Emotional',
    gradient: 'from-amber-500 to-amber-700',
    glow: 'rgba(245, 158, 11, 0.4)',
    position: 'sw',
  },
  {
    id: 'spirit',
    element: 'súmec',
    english: 'Spirit',
    subtitle: 'Spiritual',
    gradient: 'from-violet-500 to-violet-700',
    glow: 'rgba(139, 92, 246, 0.4)',
    position: 'nw',
  },
];

// Position mapping for quadrants
const positionStyles: Record<string, { top?: string; bottom?: string; left?: string; right?: string; transform: string }> = {
  ne: { top: '0', right: '0', transform: 'translate(0, 0)' },
  se: { bottom: '0', right: '0', transform: 'translate(0, 0)' },
  sw: { bottom: '0', left: '0', transform: 'translate(0, 0)' },
  nw: { top: '0', left: '0', transform: 'translate(0, 0)' },
};

interface CkultnCompassProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
  onPathwayClick?: (pathwayId: string) => void;
}

export function CkultnCompass({
  size = 'md',
  showLabels = true,
  className = '',
  onPathwayClick,
}: CkultnCompassProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger entrance animation
  useState(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  });

  // Size configurations
  const sizeConfig = {
    sm: { wrapper: 'w-48 h-48', quadrant: 'w-20 h-20', text: 'text-xs', center: 'w-16 h-16' },
    md: { wrapper: 'w-72 h-72', quadrant: 'w-32 h-32', text: 'text-sm', center: 'w-24 h-24' },
    lg: { wrapper: 'w-96 h-96', quadrant: 'w-44 h-44', text: 'text-base', center: 'w-32 h-32' },
  };

  const config = sizeConfig[size];

  return (
    <div 
      className={`relative ${config.wrapper} ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Outer glow ring */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        style={{
          background: 'conic-gradient(from 45deg, rgba(16,185,129,0.15), rgba(14,165,233,0.15), rgba(245,158,11,0.15), rgba(139,92,246,0.15), rgba(16,185,129,0.15))',
          filter: 'blur(20px)',
        }}
      />

      {/* Quadrant container */}
      <div className="relative w-full h-full">
        {pathways.map((pathway, index) => {
          const isHovered = hoveredId === pathway.id;
          const posStyle = positionStyles[pathway.position];
          
          return (
            <Link
              key={pathway.id}
              to={`/curriculum/${pathway.id}`}
              onClick={() => onPathwayClick?.(pathway.id)}
              onMouseEnter={() => setHoveredId(pathway.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                absolute ${config.quadrant} flex flex-col items-center justify-center
                rounded-full transition-all duration-500 cursor-pointer
                ${isAnimated ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                ...posStyle,
                transitionDelay: `${index * 100}ms`,
                transform: `${posStyle.transform} ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                boxShadow: isHovered ? `0 0 40px 10px ${pathway.glow}` : 'none',
              }}
            >
              {/* Gradient background */}
              <div 
                className={`
                  absolute inset-0 rounded-full bg-gradient-to-br ${pathway.gradient}
                  transition-all duration-300
                  ${isHovered ? 'opacity-100' : 'opacity-80'}
                `}
              />
              
              {/* Inner content */}
              <div className="relative z-10 text-center text-white">
                <div className={`font-bold ${config.text}`}>{pathway.element}</div>
                {showLabels && (
                  <>
                    <div className="text-xs opacity-80">{pathway.english}</div>
                    <div className="text-[10px] opacity-60">{pathway.subtitle}</div>
                  </>
                )}
              </div>

              {/* Hover ring */}
              <div 
                className={`
                  absolute inset-0 rounded-full border-2 border-white/30
                  transition-all duration-300
                  ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}
                `}
              />
            </Link>
          );
        })}

        {/* Center balance indicator */}
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            ${config.center} rounded-full
            bg-gradient-to-br from-shs-forest-700 to-shs-forest-900
            border-4 border-white/20 shadow-xl
            flex flex-col items-center justify-center text-white
            transition-all duration-700 z-20
            ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          `}
          style={{ transitionDelay: '400ms' }}
        >
          <svg 
            className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} mb-1`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.5" />
            <circle cx="12" cy="12" r="4" strokeWidth="2" fill="currentColor" opacity="0.3" />
            <path d="M12 2v8M12 14v8M2 12h8M14 12h8" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="text-[10px] font-medium tracking-wider uppercase opacity-70">Cḱuĺtn</span>
        </div>

        {/* Connecting lines (decorative) */}
        <svg 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
            isAnimated ? 'opacity-30' : 'opacity-0'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          {/* Cross lines */}
          <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          {/* Diagonal lines */}
          <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>
    </div>
  );
}

export default CkultnCompass;
