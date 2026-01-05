/**
 * Hero - Premium Hero Section Component (2025)
 * Features: Parallax scrolling, video backgrounds, intersection animations,
 * particle effects, and dynamic gradients
 */
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  /** Main headline text */
  headline: string;
  /** Highlighted part of headline (different style) */
  highlightedText?: string;
  /** Optional subheadline/description */
  subheadline?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Video background URL (MP4) - takes precedence over image */
  backgroundVideo?: string;
  /** Primary CTA button */
  primaryCta?: {
    label: string;
    to: string;
    icon?: React.ReactNode;
  };
  /** Secondary CTA button */
  secondaryCta?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  /** Height variant */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Optional overlay darkness (0-1) */
  overlayOpacity?: number;
  /** Enable parallax effect */
  parallax?: boolean;
  /** Show floating particles */
  showParticles?: boolean;
  /** Stats to display below CTA */
  stats?: Array<{ value: string; label: string }>;
}

// Floating particle component for visual interest
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10 animate-float"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero({
  headline,
  highlightedText,
  subheadline,
  backgroundImage,
  backgroundVideo,
  primaryCta,
  secondaryCta,
  size = 'large',
  overlayOpacity: _overlayOpacity = 0.5,
  parallax = true,
  showParticles = true,
  stats,
}: HeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax scroll effect
  useEffect(() => {
    if (!parallax) return;
    
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  // Intersection observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play video when in view
  useEffect(() => {
    if (videoRef.current && isVisible) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, fallback handled
      });
    }
  }, [isVisible]);

  const heightClasses = {
    small: 'min-h-[40vh] md:min-h-[50vh]',
    medium: 'min-h-[60vh] md:min-h-[70vh]',
    large: 'min-h-[80vh] md:min-h-[90vh]',
    fullscreen: 'min-h-screen',
  };

  const parallaxOffset = parallax ? scrollY * 0.4 : 0;

  return (
    <section 
      ref={heroRef}
      className={`relative ${heightClasses[size]} flex items-center justify-center overflow-hidden`}
    >
      {/* Video Background */}
      {backgroundVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
          loop
          muted
          playsInline
          poster={backgroundImage}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Image Background with Parallax */}
      {!backgroundVideo && backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          }}
        />
      )}
      
      {/* Default gradient background if no media */}
      {!backgroundVideo && !backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-shs-forest-800 via-shs-forest-700 to-shs-forest-900" />
      )}

      {/* Gradient Overlay - Always visible to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-shs-forest-950/80 via-shs-forest-900/60 to-shs-forest-950/90" />

      {/* Mesh Gradient Effect - Animated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 animate-gradient-drift"
          style={{ background: 'radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-gradient-drift-reverse"
          style={{ background: 'radial-gradient(circle, rgba(58, 144, 101, 0.4) 0%, transparent 70%)' }}
        />
      </div>


      {/* Floating Particles */}
      {showParticles && <FloatingParticles />}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-shs-forest-100 text-sm transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-shs-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-shs-amber-500"></span>
          </span>
          <span>Chase, BC — Secwepemcúl̓ecw Territory</span>
        </div>

        {/* Headline with gradient text */}
        <h1 
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-white drop-shadow-lg">
            {highlightedText ? headline.replace(highlightedText, '') : headline}
          </span>
          {highlightedText && (
            <span className="bg-gradient-to-r from-shs-amber-300 via-shs-amber-400 to-shs-amber-500 bg-clip-text text-transparent">
              {highlightedText}
            </span>
          )}
        </h1>
        
        {subheadline && (
          <p 
            className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {subheadline}
          </p>
        )}

        {/* CTA Buttons */}
        {(primaryCta || secondaryCta) && (
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {primaryCta && (
              <Link
                to={primaryCta.to}
                className="group relative w-full sm:w-auto px-8 py-4 overflow-hidden rounded-2xl font-semibold text-lg transition-all duration-300"
              >
                {/* Button background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-shs-amber-500 via-shs-amber-600 to-shs-amber-500 bg-[length:200%_100%] animate-shimmer" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-shs-amber-600 to-shs-amber-700" />
                
                {/* Button content */}
                <span className="relative flex items-center justify-center gap-2 text-white">
                  {primaryCta.label}
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            )}
            {secondaryCta && (
              secondaryCta.onClick ? (
                <button
                  onClick={secondaryCta.onClick}
                  className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] transition-all duration-300"
                >
                  {secondaryCta.label}
                </button>
              ) : secondaryCta.to ? (
                <Link
                  to={secondaryCta.to}
                  className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] transition-all duration-300"
                >
                  {secondaryCta.label}
                </Link>
              ) : null
            )}
          </div>
        )}

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div 
            className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 pt-8 border-t border-white/10 transition-all duration-700 delay-[400ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-shs-forest-200">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-white/60 hover:text-white/80 transition-colors cursor-pointer group">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
