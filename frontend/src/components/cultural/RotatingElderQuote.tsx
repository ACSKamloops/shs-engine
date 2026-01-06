/**
 * RotatingElderQuote - Auto-rotating elder wisdom carousel
 * 
 * Features:
 * - Auto-rotates quotes every 10 seconds
 * - Manual prev/next navigation
 * - Dot indicators
 * - Fade transition
 * - Pause on hover
 * - 3 size variants: hero, sidebar, compact
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import elderQuotesData from '../../data/elder_quotes.json';

interface Quote {
  id: string;
  speaker: string;
  community?: string;
  secwepemc?: string | null;
  english: string;
  themes: string[];
}

interface RotatingElderQuoteProps {
  variant?: 'hero' | 'sidebar' | 'compact';
  autoRotate?: boolean;
  intervalMs?: number;
  filterThemes?: string[];
  className?: string;
}

export default function RotatingElderQuote({
  variant = 'hero',
  autoRotate = true,
  intervalMs = 10000,
  filterThemes,
  className = ''
}: RotatingElderQuoteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter quotes by theme if specified
  const quotes = useMemo(() => {
    let result: Quote[] = elderQuotesData.quotes;
    if (filterThemes && filterThemes.length > 0) {
      result = result.filter(q => 
        q.themes.some(t => filterThemes.includes(t))
      );
    }
    return result;
  }, [filterThemes]);

  const currentQuote = quotes[currentIndex];

  // Navigate to next quote with transition
  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length);
      setIsTransitioning(false);
    }, 300);
  }, [quotes.length]);

  // Navigate to previous quote
  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length);
      setIsTransitioning(false);
    }, 300);
  }, [quotes.length]);

  // Go to specific index
  const goToIndex = useCallback((index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentIndex]);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isPaused || quotes.length <= 1) return;

    const interval = setInterval(goToNext, intervalMs);
    return () => clearInterval(interval);
  }, [autoRotate, isPaused, intervalMs, goToNext, quotes.length]);

  if (!currentQuote || quotes.length === 0) {
    return null;
  }

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <div 
        className={`bg-shs-forest-50 rounded-lg p-4 border border-shs-forest-200 ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-sm text-shs-text-body italic leading-relaxed">
            "{currentQuote.english.length > 150 
              ? currentQuote.english.slice(0, 150) + '...' 
              : currentQuote.english}"
          </p>
          <p className="text-xs text-shs-forest-600 mt-2 font-medium">
            — {currentQuote.speaker}
          </p>
        </div>
        {quotes.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {quotes.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-shs-forest-600' : 'bg-shs-forest-300'
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant - medium display
  if (variant === 'sidebar') {
    return (
      <div 
        className={`bg-gradient-to-br from-shs-forest-700 to-shs-forest-800 rounded-xl p-5 text-white ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🪶</span>
          <span className="text-sm font-semibold opacity-90">Elder Wisdom</span>
        </div>
        
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentQuote.secwepemc && (
            <p className="text-amber-200 italic mb-2 text-sm leading-relaxed">
              "{currentQuote.secwepemc}"
            </p>
          )}
          <p className="text-white/90 italic text-sm leading-relaxed">
            "{currentQuote.english.length > 200 
              ? currentQuote.english.slice(0, 200) + '...' 
              : currentQuote.english}"
          </p>
          <p className="text-white/70 text-xs mt-3">
            — {currentQuote.speaker}{currentQuote.community && `, ${currentQuote.community}`}
          </p>
        </div>

        {quotes.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
            <button
              onClick={goToPrev}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Previous quote"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-1.5">
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Next quote"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Hero variant (default) - large prominent display
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-shs-forest-800 via-shs-forest-700 to-shs-forest-600 text-white p-8 md:p-10 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-6xl opacity-10">❝</div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🪶</span>
          </div>
          <div>
            <h3 className="font-bold text-xl">Elder Wisdom</h3>
            <p className="text-white/70 text-sm">Words from our knowledge keepers</p>
          </div>
        </div>

        <div className={`transition-opacity duration-300 min-h-[140px] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Secwépemctsín if available */}
          {currentQuote.secwepemc && (
            <p className="text-amber-200 font-medium mb-4 text-lg leading-relaxed">
              "{currentQuote.secwepemc}"
            </p>
          )}

          {/* English quote */}
          <blockquote className="text-white/90 text-lg md:text-xl leading-relaxed italic">
            "{currentQuote.english}"
          </blockquote>

          {/* Attribution */}
          <p className="mt-6 text-sm text-white/70 flex items-center gap-2">
            <span className="w-8 h-px bg-white/30" />
            <span className="font-medium">{currentQuote.speaker}</span>
            {currentQuote.community && (
              <span className="opacity-70">• {currentQuote.community}</span>
            )}
          </p>
        </div>

        {/* Navigation */}
        {quotes.length > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/20">
            <button
              onClick={goToPrev}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group"
              aria-label="Previous quote"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex gap-2">
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group"
              aria-label="Next quote"
            >
              <span className="text-sm hidden sm:inline">Next</span>
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
