/**
 * HomePage - SHS Public Website Landing Page (2025 Best Practices)
 * Features: Intersection observer animations, React 19 patterns,
 * optimistic hooks, advanced accessibility
 */
import { Link } from 'react-router-dom';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Hero } from '../../components/public/Hero';
import { PillarCard, PillarIcons } from '../../components/public/PillarCard';
import { SeasonalCalendar } from '../../components/public/SeasonalCalendar';

// Custom hook for intersection observer animations
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsIntersecting(true);
        setHasAnimated(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return { ref, isIntersecting };
}

// Six program pillars data
const pillars = [
  {
    icon: PillarIcons.foodSovereignty,
    title: 'Food Sovereignty',
    description: 'Reclaiming traditional food systems through hunting, fishing, gathering, and food preservation practices passed down through generations.',
    link: '/cultural-camps#food-sovereignty',
  },
  {
    icon: PillarIcons.stewardship,
    title: 'Stewardship of Secwepemcúl̓ecw',
    description: 'Deepening our connection to the land through seasonal knowledge, natural laws, and responsible care of our territory.',
    link: '/cultural-camps#stewardship',
  },
  {
    icon: PillarIcons.culturalPreservation,
    title: 'Cultural Preservation',
    description: 'Keeping our language (Secwepemctsín), arts, storytelling, and traditions alive for future generations.',
    link: '/cultural-camps#culture',
  },
  {
    icon: PillarIcons.healing,
    title: 'Healing & Wellness',
    description: 'Supporting physical, mental, spiritual, and emotional health through circle gatherings, outdoor therapy, and community connection.',
    link: '/cultural-camps#wellness',
  },
  {
    icon: PillarIcons.youthMentorship,
    title: 'Youth Mentorship',
    description: 'Training the next generation of hunters, gatherers, and land stewards through multi-generational camps and skill transfer.',
    link: '/cultural-camps#youth',
  },
  {
    icon: PillarIcons.partnerships,
    title: 'Strategic Partnerships',
    description: 'Building collaborations with organizations and institutions to strengthen our collective impact and reach.',
    link: '/projects',
  },
];

// Impact stats
const impactStats = [
  { value: '500+', label: 'Youth Served' },
  { value: '12', label: 'Cultural Camps' },
  { value: '7', label: 'Partner Nations' },
];

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  const start = useCallback(() => {
    setHasStarted(true);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, target, duration]);

  return { count, start };
}

// Animated stat component
function AnimatedStat({ value, label, index }: { value: string; label: string; index: number }) {
  const numericValue = parseInt(value.replace(/\D/g, ''), 10);
  const suffix = value.replace(/[\d]/g, '');
  const { count, start } = useAnimatedCounter(numericValue, 2000, true);
  const { ref, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting) start();
  }, [isIntersecting, start]);

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="text-center"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-shs-forest-700 mb-2">
        {count}{suffix}
      </div>
      <div className="text-shs-text-muted font-medium">{label}</div>
    </div>
  );
}

export function HomePage() {
  const pillarsSection = useIntersectionObserver();
  const storySection = useIntersectionObserver();
  const ctaSection = useIntersectionObserver();

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <Hero
        headline="Strengthening our Secwépemc Identity and Culture through "
        highlightedText="Outdoor Living"
        subheadline="Join us in preserving traditional practices, mentoring youth, and reconnecting with our ancestral lands through cultural camps and community gatherings."
        primaryCta={{ label: 'Join a Camp', to: '/cultural-camps' }}
        secondaryCta={{ label: 'Get Involved', to: '/events' }}
        size="fullscreen"
        stats={impactStats}
        parallax={true}
        showParticles={true}
      />

      {/* Six Pillars Section */}
      <section 
        ref={pillarsSection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 bg-gradient-to-b from-shs-sand via-shs-cream to-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-shs-forest-100/30 to-transparent rounded-bl-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              pillarsSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Our Foundation
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-shs-forest-800 mb-6">
              Built on <span className="text-gradient-shs">Six Pillars</span>
            </h2>
            <p className="text-lg md:text-xl text-shs-text-body max-w-2xl mx-auto leading-relaxed">
              Everything we do is guided by these core areas of focus, ensuring a holistic approach to cultural strengthening and community wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`transition-all duration-700 ${
                  pillarsSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <PillarCard
                  icon={pillar.icon}
                  title={pillar.title}
                  description={pillar.description}
                  learnMoreLink={pillar.link}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 md:py-20 bg-white border-y border-shs-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {impactStats.map((stat, index) => (
              <AnimatedStat key={stat.label} {...stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Language Spotlight - Word of the Day */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-shs-forest-950 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-shs-amber-500 blur-[150px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-6">
            📅 Word of the Day
          </span>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10 mb-8">
            <h3 className="text-4xl md:text-5xl font-extrabold mb-3">
              Yecwmín̓men
            </h3>
            <p className="text-lg text-shs-forest-200 mb-2">
              /yech-MEEN-men/
            </p>
            <p className="text-2xl text-shs-amber-300 font-semibold mb-4">
              Steward / Caretaker of the land
            </p>
            <p className="text-shs-forest-300 italic max-w-lg mx-auto">
              "Ren yecwmín̓men te tmicw" — I am a steward of the land
            </p>
          </div>
          
          <Link 
            to="/language" 
            className="group inline-flex items-center gap-2 px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-all duration-300 hover:shadow-xl focus-ring"
          >
            Explore Our Language
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          
          <p className="mt-6 text-sm text-shs-forest-400">
            Learn 100+ Secwépemctsín words • Interactive games • Daily practice
          </p>
        </div>
      </section>

      {/* Seasonal Round - Current Moon Section */}
      <SeasonalCalendar 
        variant="hero" 
        className="bg-gradient-to-br from-shs-forest-900 via-shs-forest-800 to-shs-forest-950"
      />

      {/* Discover Pathways - Horizon Expansion */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-shs-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              Horizon Expansion
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6">
              Discover What's <span className="text-gradient-shs">Possible</span>
            </h2>
            <p className="text-lg text-shs-text-body max-w-3xl mx-auto">
              Our camps aren't vocational training—they're <strong>horizon expansion</strong>. 
              Through cultural experience, youth discover that traditional skills connect to 
              countless modern opportunities.
            </p>
          </div>

          {/* Did You Know Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                skill: 'Tracking & Hunting',
                icon: '🦌',
                insight: 'Observation, pattern recognition, evidence gathering',
                careers: 'Wildlife Biologist, Conservation Officer',
              },
              {
                skill: 'Plant Knowledge',
                icon: '🌿',
                insight: 'Understanding ecosystems and medicinal properties',
                careers: 'Ethnobotanist, Forester, Pharmacologist',
              },
              {
                skill: 'Territory Monitoring',
                icon: '🛰️',
                insight: 'Protecting vast land bases with modern tools',
                careers: 'Drone Pilot, GIS Specialist, Guardian',
              },
              {
                skill: 'Oral History',
                icon: '📜',
                insight: 'Transmitting complex laws and knowledge',
                careers: 'Lawyer, Archivist, Historian',
              },
              {
                skill: 'Secwepemctsín',
                icon: '🗣️',
                insight: 'Preserving an endangered language',
                careers: 'Language Teacher, Linguist',
              },
              {
                skill: 'Food Preservation',
                icon: '🍖',
                insight: 'Traditional techniques for food safety',
                careers: 'Food Scientist, Nutritionist',
              },
            ].map((item) => (
              <div key={item.skill} className="bg-white rounded-2xl p-6 shadow-sm border border-shs-stone hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="font-bold text-shs-forest-800">{item.skill}</h3>
                </div>
                <p className="text-sm text-shs-text-body mb-3">{item.insight}</p>
                <p className="text-xs font-semibold text-shs-amber-600">
                  → {item.careers}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/camps" 
              className="group inline-flex items-center gap-2 px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-all shadow-lg hover:shadow-xl"
            >
              Experience Horizon Expansion
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Funded By - Program Partners */}
      <section className="py-12 bg-shs-forest-50 border-y border-shs-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-shs-text-muted uppercase tracking-wide mb-6">
            Supported By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { name: 'TISF', full: 'Thriving Indigenous Systems Fund', amount: '$300K' },
              { name: 'HSP', full: 'Heritage Stewardship Program', amount: '~$75K' },
              { name: 'BIP', full: 'Braided Infrastructure Program', amount: '~$75K' },
              { name: 'FPCC', full: 'First Peoples\' Cultural Council', amount: '' },
            ].map((funder) => (
              <div key={funder.name} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-sm flex items-center justify-center border border-shs-stone group-hover:border-shs-forest-300 transition-colors">
                  <span className="text-shs-forest-700 font-bold">{funder.name}</span>
                </div>
                <p className="text-xs text-shs-text-muted">{funder.full}</p>
                {funder.amount && (
                  <p className="text-xs font-semibold text-shs-forest-600">{funder.amount}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section 
        ref={storySection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 bg-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image with decorative elements */}
            <div 
              className={`relative transition-all duration-1000 ${
                storySection.isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
            >
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-shs-forest-200 via-shs-earth-100 to-shs-forest-300 overflow-hidden shadow-2xl">
                {/* Placeholder - replace with actual image */}
                <div className="absolute inset-0 flex items-center justify-center text-shs-forest-400">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm opacity-50">Community Photo</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-shs-amber-100 rounded-3xl -z-10 rotate-6" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-shs-forest-100 rounded-2xl -z-10 -rotate-12" />
            </div>

            {/* Content */}
            <div 
              className={`transition-all duration-1000 delay-200 ${
                storySection.isIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
            >
              <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-6">
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6 leading-tight">
                A Grassroots Movement for Cultural Resurgence
              </h2>
              <div className="space-y-5 text-shs-text-body leading-relaxed text-lg">
                <p>
                  The Secwépemc Hunting Society was born from a community desire to reclaim our 
                  traditional practices and pass them on to future generations. Since the 1911 
                  wildlife laws that restricted our hunting rights, our people have fought to 
                  maintain our connection to the land.
                </p>
                <p>
                  Today, we organize cultural camps, mentorship programs, and community events 
                  that bring together Elders, youth, and families. Through hands-on learning on 
                  the land, we strengthen our Secwépemc identity and ensure our traditions 
                  continue to thrive.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link 
                  to="/about" 
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-all duration-300 hover:shadow-lg focus-ring"
                >
                  Our Full Story
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-shs-forest-200 text-shs-forest-700 font-semibold rounded-xl hover:border-shs-forest-300 hover:bg-shs-forest-50 transition-all duration-300 focus-ring"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-shs-forest-950 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-shs-amber-500 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-shs-forest-400 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
                Don't Miss Out
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-shs-forest-200 max-w-xl">
                Join us at our next cultural camp or community gathering.
              </p>
            </div>
            <Link 
              to="/events" 
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 text-shs-amber-300 font-semibold hover:text-white transition-colors mt-4 md:mt-0"
            >
              View All Events
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Event cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Spring Camp', 'Summer Gathering', 'Youth Mentorship'].map((event) => (
              <div 
                key={event}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-shs-amber-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-shs-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-shs-amber-400 text-sm font-semibold">Coming 2026</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-shs-amber-300 transition-colors">{event}</h3>
                <p className="text-shs-forest-300 text-sm mb-4 leading-relaxed">
                  Join us for this special event connecting community members with traditional practices.
                </p>
                <Link 
                  to="/events" 
                  className="inline-flex items-center gap-1 text-shs-forest-200 text-sm font-medium hover:text-white transition-colors"
                >
                  Learn more
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link 
              to="/events" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors"
            >
              View All Events
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section 
        ref={ctaSection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 bg-gradient-to-br from-shs-cream via-shs-sand to-shs-earth-100 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div 
            className={`transition-all duration-700 ${
              ctaSection.isIntersecting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6 leading-tight">
              Ready to Connect with Your Culture?
            </h2>
            <p className="text-lg md:text-xl text-shs-text-body mb-10 max-w-2xl mx-auto">
              Whether you want to join a camp, volunteer, donate, or partner with us, 
              there are many ways to be part of this movement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/cultural-camps" 
                className="group w-full sm:w-auto px-8 py-4 bg-shs-forest-600 text-white font-semibold text-lg rounded-xl hover:bg-shs-forest-700 transition-all duration-300 hover:shadow-xl glow-forest focus-ring inline-flex items-center justify-center gap-2"
              >
                Register for a Camp
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                to="/donate" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-shs-amber-500 to-shs-amber-600 text-white font-semibold text-lg rounded-xl hover:from-shs-amber-600 hover:to-shs-amber-700 transition-all duration-300 hover:shadow-xl glow-amber focus-ring"
              >
                Support Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 md:py-16 bg-shs-forest-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
              <p className="text-shs-forest-300">
                Get news about camps, events, and community updates delivered to your inbox.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-5 py-3.5 bg-shs-forest-800 border border-shs-forest-700 rounded-xl text-white placeholder-shs-forest-500 focus:outline-none focus:border-shs-amber-500 focus:ring-2 focus:ring-shs-amber-500/20 transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors whitespace-nowrap focus-ring"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
