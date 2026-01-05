/**
 * VoiceCard - Premium Elder Quote Display
 * 
 * Glassmorphism card for displaying Elder wisdom with:
 * - Large decorative quote marks
 * - Quote text (italic, prominent)
 * - Speaker name + community attribution
 * - Audio waveform placeholder (future: actual audio)
 * - Smooth reveal animation
 */
import { useState } from 'react';

interface VoiceCardProps {
  quote: string;
  secwepemcQuote?: string;
  speaker: string;
  community?: string;
  source?: {
    chapter?: number;
    page?: number;
    document?: string;
  };
  theme?: string;
  hasAudio?: boolean;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function VoiceCard({
  quote,
  secwepemcQuote,
  speaker,
  community,
  source,
  theme,
  hasAudio = false,
  variant = 'default',
  className = '',
}: VoiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Variant styles
  const variantStyles = {
    default: 'bg-white/80 backdrop-blur-xl border-shs-forest-200',
    featured: 'bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white border-shs-forest-700',
    compact: 'bg-shs-sand border-shs-stone/30',
  };

  const textStyles = {
    default: { quote: 'text-shs-text-dark', speaker: 'text-shs-forest-600', meta: 'text-shs-text-muted' },
    featured: { quote: 'text-white', speaker: 'text-shs-amber-400', meta: 'text-shs-forest-300' },
    compact: { quote: 'text-shs-text-body', speaker: 'text-shs-forest-700', meta: 'text-shs-text-muted' },
  };

  const colors = textStyles[variant];

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border shadow-lg
        transition-all duration-500 hover:shadow-xl hover:-translate-y-1
        ${variantStyles[variant]}
        ${variant === 'compact' ? 'p-4' : 'p-6 md:p-8'}
        ${className}
      `}
    >
      {/* Decorative background elements */}
      {variant === 'featured' && (
        <>
          <div className="absolute top-0 right-0 w-48 h-48 bg-shs-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-shs-forest-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        </>
      )}

      <div className="relative z-10">
        {/* Header with quote icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪶</span>
            {theme && (
              <span className={`text-xs font-medium uppercase tracking-wide ${colors.meta}`}>
                {theme}
              </span>
            )}
          </div>
          
          {/* Audio button placeholder */}
          {hasAudio && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-300
                ${variant === 'featured' 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-shs-forest-100 hover:bg-shs-forest-200 text-shs-forest-700'
                }
              `}
            >
              {isPlaying ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Listen
                </>
              )}
            </button>
          )}
        </div>

        {/* Opening quote mark */}
        <div 
          className={`
            text-6xl leading-none font-serif opacity-20
            ${variant === 'featured' ? 'text-shs-amber-400' : 'text-shs-forest-400'}
          `}
          style={{ marginTop: '-0.3em', marginBottom: '-0.5em' }}
        >
          "
        </div>

        {/* Quote text */}
        <blockquote 
          className={`
            ${variant === 'compact' ? 'text-base' : 'text-lg md:text-xl'}
            font-medium leading-relaxed italic mb-6
            ${colors.quote}
          `}
        >
          {quote}
        </blockquote>

        {/* Secwépemctsín quote (if available) */}
        {secwepemcQuote && (
          <div 
            className={`
              mb-6 p-4 rounded-xl
              ${variant === 'featured' ? 'bg-white/10' : 'bg-shs-forest-50'}
            `}
          >
            <p className={`text-sm font-medium mb-1 ${colors.meta}`}>In Secwépemctsín:</p>
            <p className={`text-base italic ${colors.quote}`}>{secwepemcQuote}</p>
          </div>
        )}

        {/* Audio waveform placeholder */}
        {hasAudio && isPlaying && (
          <div className="mb-6 h-12 flex items-center justify-center gap-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-1 rounded-full
                  ${variant === 'featured' ? 'bg-shs-amber-400' : 'bg-shs-forest-400'}
                `}
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  animation: `waveform 0.5s ease-in-out ${i * 0.02}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}

        {/* Attribution */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold ${variant === 'compact' ? 'text-base' : 'text-lg'} ${colors.speaker}`}>
              — {speaker}
            </p>
            {community && (
              <p className={`text-sm ${colors.meta}`}>{community}</p>
            )}
          </div>
          
          {/* Source info (expandable) */}
          {source && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs ${colors.meta} hover:underline`}
            >
              {isExpanded ? 'Hide source' : 'View source'}
            </button>
          )}
        </div>

        {/* Expanded source info */}
        {source && isExpanded && (
          <div 
            className={`
              mt-4 pt-4 border-t text-xs
              ${variant === 'featured' ? 'border-white/20' : 'border-shs-stone/30'}
              ${colors.meta}
            `}
          >
            {source.document && <p>Document: {source.document}</p>}
            {source.chapter && <p>Chapter: {source.chapter}</p>}
            {source.page && <p>Page: {source.page}</p>}
          </div>
        )}
      </div>

      {/* CSS for waveform animation */}
      <style>{`
        @keyframes waveform {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default VoiceCard;
