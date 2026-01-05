/**
 * AboutPage - About the Secwépemc Hunting Society
 * History, mission, team, and organizational information
 */
import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { Hero } from '../../components/public/Hero';

// Intersection observer hook
function useIntersectionObserver() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsIntersecting(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Core values with Secwepemctsín language integration
const coreValues = [
  {
    title: 'Cultural Authenticity',
    secwepemcTerm: 'Kwséltkten',
    termMeaning: 'Relationality',
    description: 'We are guided by Secwépemc traditions, protocols, and worldviews in everything we do.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Intergenerational Learning',
    secwepemcTerm: 'Ctswum',
    termMeaning: 'To teach / train a child',
    description: 'Elders and youth learn together, passing knowledge across generations on the land.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Land Connection',
    secwepemcTerm: 'Secwepemcúl̓ecw',
    termMeaning: 'The Secwépemc homeland',
    description: 'Secwepemcúl̓ecw is our teacher. All our work happens on and in relationship with the land.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Community Driven',
    secwepemcTerm: 'Sqélemcw',
    termMeaning: 'People / Everyone',
    description: 'We are grassroots and Indigenous-led, responding to the needs and aspirations of our community.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Holistic Wellbeing',
    secwepemcTerm: 'Qwenqwent',
    termMeaning: 'Humble / Recognizing one\'s place',
    description: 'We support physical, mental, emotional, and spiritual health in balance with culture.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
  },
  {
    title: 'Stewardship Leadership',
    secwepemcTerm: 'Yecwmín̓men',
    termMeaning: 'Steward / Caretaker of the land',
    description: 'We take horizontal leadership in caring for Secwepemcúl̓ecw, ensuring its health for future generations.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];


// Timeline events
const historyTimeline = [
  {
    year: 'Anciently',
    title: 'Coyote\'s Time & The Great Drainage',
    description: 'Secwépemc ecological protocols have been woven into the landscape since the era of Coyote, over 10,000 years ago.',
  },
  {
    year: '1911',
    title: 'Adaptive Practices',
    description: 'Secwépemc people continue to adapt cultural land-use practices amidst shifting regulatory and environmental landscapes.',
  },
  {
    year: '2000s',
    title: 'Community Conversations',
    description: 'Community members begin discussing the need to revitalize traditional hunting practices and knowledge transfer.',
  },
  {
    year: '2018',
    title: 'Society Formation',
    description: 'The Secwépemc Hunting Society is formally established as a grassroots, community-driven organization.',
  },
  {
    year: '2020',
    title: 'First Cultural Camps',
    description: 'Initial cultural camps bring together Elders and youth for land-based learning and knowledge sharing.',
  },
  {
    year: '2023',
    title: 'Program Expansion',
    description: 'Partnerships with FPCC and I-SPARC enable expanded programming across multiple Secwépemc communities.',
  },
  {
    year: '2025',
    title: 'Heritage & Infrastructure',
    description: 'Launch of Braided Infrastructure Program and Heritage Stewardship initiatives for long-term cultural preservation.',
  },
];

// Partners - Updated with key project partners
const partners = [
  { name: 'First Peoples\' Cultural Council', abbr: 'FPCC', role: 'BIP & HSP Funder' },
  { name: 'Thriving Indigenous Systems Fund', abbr: 'TISF', role: 'Program Funder' },
  { name: 'Wuméc r Cqweqwelútn-kt', abbr: 'WrC', role: 'Language & Protocols Partner' },
  { name: 'Indigenous Sport, Physical Activity & Recreation Council', abbr: 'I-SPARC', role: 'Youth Programs' },
];

// Traditional Oral Stories - From SCES Stories Collection (Family-Friendly)
const traditionalStories = [
  {
    title: 'Coyote the Transformer',
    secwepemc: 'Cqwlewés',
    theme: 'Creation & Lessons',
    description: 'Coyote traveled the land after the Old One, transforming the world to make it a better place for the people. His adventures teach important lessons about humility, cleverness, and respect.',
    lesson: 'Through mistakes, we learn to be better.',
  },
  {
    title: 'The Old One',
    secwepemc: 'Qelmúcw',
    theme: 'Creation',
    description: 'The powerful being who created the mountains, lakes, streams, and everything in Secwepemcúl̓ecw. He left Coyote to complete the task of making the world right.',
    lesson: 'Respect the land that was created for us.',
  },
  {
    title: 'The Ant and the Grasshopper',
    secwepemc: 'Re Scwicwéye ell re Kelkléts',
    theme: 'Preparation',
    description: 'A traditional teaching story about the importance of preparing for winter and working hard during times of plenty.',
    lesson: 'Plan ahead and work hard in good times.',
  },
  {
    title: 'Salmon Stories',
    secwepemc: 'Stselkék-kt',
    theme: 'Gratitude',
    description: 'Stories of how salmon came to the rivers and why we must always show respect and gratitude when they return each year.',
    lesson: 'Give thanks for what the land provides.',
  },
];

export function AboutPage() {
  const valuesSection = useIntersectionObserver();
  const historySection = useIntersectionObserver();
  const partnersSection = useIntersectionObserver();

  return (
    <div>
      {/* Hero */}
      <Hero
        headline="About the Secwépemc Hunting Society"
        subheadline="A grassroots, Indigenous-led organization dedicated to strengthening Secwépemc identity and culture through outdoor living."
        primaryCta={{ label: 'Get Involved', to: '/contact' }}
        size="medium"
      />

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-6">
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
                More Than Preservation—Horizon Expansion
              </h2>
              <div className="space-y-6 text-lg text-shs-text-body leading-relaxed">
                <p>
                  For over 14 years, the Secwépemc Hunting Society has been a guardian of 
                  tradition. But our vision has evolved. We believe that **cultural grounding** 
                  is not just about looking back—it is the strongest foundation for moving forward.
                </p>
                <p>
                  We operate on the principle of <strong>"Two-Eyed Seeing"</strong>: 
                  viewing the world with the strengths of Indigenous knowledge and Western 
                  ways simultaneously.
                </p>
                <p>
                  Through this lens, a youth tracking a deer is learning **wildlife biology**. 
                  A hide tanner is practicing **organic chemistry**. A drone operator protecting 
                  the land is a **modern guardian**. We reveal these pathways to empower the 
                  next generation of Secwépemc leaders.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-shs-sand p-8 rounded-3xl border border-shs-stone">
                <div className="w-12 h-12 bg-shs-amber-500 rounded-xl flex items-center justify-center text-white mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-shs-forest-800 mb-3">Our Mission</h3>
                <p className="text-shs-text-body">
                  To provide food for our families through hunting, while carrying on and teaching 
                  our Secwépemc ceremonies, traditions, and wisdom—empowering our youth to thrive 
                  in both legal and modern economic worlds.
                </p>
              </div>

              <div className="bg-shs-forest-900 p-8 rounded-3xl border border-shs-forest-700">
                <div className="w-12 h-12 bg-shs-forest-700 rounded-xl flex items-center justify-center text-white mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
                <p className="text-shs-forest-200">
                  A self-reliant Secwépemc Nation where traditional skills are recognized as 
                  foundational value—creating food sovereignty, cultural continuity, and 
                  unlimited professional horizons for our people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Secwépemc Nation - Context */}
      <section className="py-20 md:py-28 bg-shs-forest-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Our Homeland
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              The Secwépemc Nation
            </h2>
            <p className="text-shs-forest-200 max-w-2xl mx-auto">
              Understanding where we come from to understand where we're going.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Territory Stats */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Secwepemcúl̓ecw</h3>
                <p className="text-shs-forest-200 mb-6">
                  The Secwépemc (Shuswap) people are the original inhabitants of a vast 
                  traditional territory in the Interior of British Columbia.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-3xl font-bold text-shs-amber-400">70,000</p>
                    <p className="text-sm text-shs-forest-300">Square Miles</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-3xl font-bold text-shs-amber-400">180,000</p>
                    <p className="text-sm text-shs-forest-300">km² of Territory</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <h4 className="font-bold text-white mb-3">Seven Divisions</h4>
                <p className="text-sm text-shs-forest-200 mb-4">
                  Historically, the Secwépemc organized into seven divisions:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { name: 'Fraser River', area: 'High Bar to Soda Creek' },
                    { name: 'Canon', area: 'West of Fraser' },
                    { name: 'Lake (Stietamux)', area: 'Interior Plateau' },
                    { name: 'North Thompson', area: 'Simpcw territory' },
                    { name: 'Kamloops', area: 'Tk\'emlúps area' },
                    { name: 'Shuswap Lake', area: 'Adams/Shuswap Lakes' },
                    { name: 'Bonaparte', area: 'Bonaparte River' },
                  ].map((div) => (
                    <div key={div.name} className="bg-white/5 rounded-lg p-2">
                      <p className="font-semibold text-white">{div.name}</p>
                      <p className="text-xs text-shs-forest-400">{div.area}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Declaration & Constitution */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📜</span>
                  <h3 className="text-xl font-bold text-white">1982 Shuswap Declaration</h3>
                </div>
                <p className="text-shs-forest-200 text-sm leading-relaxed mb-4">
                  On August 20, 1982, seventeen Shuswap bands signed a historic declaration 
                  agreeing to work together to <strong className="text-shs-amber-300">preserve, record, perpetuate, 
                  and enhance</strong> the Shuswap language, history, and culture.
                </p>
                <p className="text-xs text-shs-forest-400 italic">
                  This marked a renewal of pre-contact harmonious relationships and affirmed 
                  our collective commitment to cultural continuity.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚖️</span>
                  <h3 className="text-xl font-bold text-white">Our Constitutional Purposes</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    'Preserve and promote traditional knowledge, customs, and practices',
                    'Protect and conserve the natural environment and traditional lands',
                    'Foster unity, cooperation, and solidarity among members',
                    'Provide educational programs promoting Secwépemc culture',
                    'Build a strong and supportive community network',
                    'Encourage and foster self-reliance through traditional skills',
                  ].map((purpose, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-shs-amber-400 mt-0.5">•</span>
                      <p className="text-shs-forest-200">{purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Info */}
              <div className="flex items-center gap-4 p-4 bg-shs-amber-500/10 rounded-xl border border-shs-amber-500/20">
                <div className="text-center">
                  <p className="text-xs text-shs-amber-300 uppercase tracking-wide">Society #</p>
                  <p className="font-bold text-white">S0080318</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-shs-amber-300 uppercase tracking-wide">Founded</p>
                  <p className="font-bold text-white">May 2024</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-shs-amber-300 uppercase tracking-wide">Location</p>
                  <p className="font-bold text-white">Chase, BC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landscape of Memory - Narrative Geography */}
      <section className="py-20 md:py-28 bg-shs-cream overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              Narrative Geography
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
              A Landscape of Memory
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              Secwepemcúl̓ecw is a living record of geological and cultural transformation, 
              stretching back to the end of the last ice age.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-2xl border border-shs-stone shadow-sm">
                <h3 className="text-xl font-bold text-shs-forest-800 mb-3">The Great Drainage (9,750 BP)</h3>
                <p className="text-shs-text-body text-sm leading-relaxed mb-4">
                  Oral histories record the sudden drainage of Glacial Lake Thompson, an event that created 
                  the current Thompson River valley. These "strand lines" (old shorelines) are still visible 
                  high on the hillsides today—marking the start of salmon cycles and our long-term ecological commitment.
                </p>
                <div className="flex items-center gap-2 text-shs-amber-600 font-bold text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-shs-amber-500 animate-pulse"></span>
                  Living Landmark
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-shs-stone shadow-sm">
                <h3 className="text-xl font-bold text-shs-forest-800 mb-3">Stipstem (Post-Glacial Survival)</h3>
                <p className="text-shs-text-body text-sm leading-relaxed mb-4">
                  Our ancestors adapted to a rapidly changing landscape of retreating ice and emerging 
                  grasslands. This era of "Coyote's Time" established the foundational protocols for 
                  how we coexist with animals, water, and fire.
                </p>
                <div className="flex items-center gap-2 text-shs-forest-600 font-bold text-xs uppercase">
                  <span>10,000+ Years of Presence</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Abstract representation of strand lines/hills */}
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-b from-shs-forest-800 via-shs-earth-700 to-shs-amber-900 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-0 w-full h-px bg-white/50 shadow-[0_0_10px_white]" />
                  <div className="absolute top-1/3 left-0 w-full h-px bg-white/30 shadow-[0_0_5px_white]" />
                  <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-bold text-lg uppercase tracking-widest">Secwepemcúl̓ecw</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-shs-amber-500/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Rooted in Secwépemc Law - From Law Books */}
      <section className="py-16 md:py-20 bg-shs-forest-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Rooted in Secwépemc Law
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Our Guiding Principles
            </h2>
            <p className="text-shs-forest-200 max-w-2xl mx-auto">
              Our work is grounded in Secwépemc legal traditions documented through 
              the ILRU-SNTC collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 text-center flex flex-col">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-bold text-white mb-2">Responsibility to Learn</h3>
              <p className="text-sm text-shs-forest-200 flex-grow">
                Learning about the land is a lifelong legal obligation. Through "keen observation" and the guidance of Elders, we recognize our role within <strong className="text-shs-amber-300">kwséltkten</strong> (relationality).
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 text-center flex flex-col">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">🌲</span>
              </div>
              <h3 className="font-bold text-white mb-2">Responsibility to Teach</h3>
              <p className="text-sm text-shs-forest-200 flex-grow">
                Knowledge of Secwepemcúl̓ecw is a communal resource. Elders have a specific mandate to identify youth "gifts" and pass on the spiritual and technical skills for survival.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 text-center flex flex-col">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">🙏</span>
              </div>
              <h3 className="font-bold text-white mb-2">Responsibility to Follow</h3>
              <p className="text-sm text-shs-forest-200 flex-grow">
                Following law means respecting the agency of the land. We approach water, fire, and animals with <strong className="text-shs-amber-300">Qwenqwent</strong> (humility), acknowledging our total dependence on them.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-shs-forest-400">
              Principles from the Secwépemc Lands and Resources Law Analysis (ILRU-SNTC, 2018)
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section
        ref={valuesSection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-shs-cream"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              What Guides Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              These principles shape everything we do and how we do it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-shs-stone hover:shadow-lg transition-all duration-500 ${
                  valuesSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-shs-forest-800 mb-1">{value.title}</h3>
                <p className="text-shs-amber-600 text-sm font-semibold italic mb-2">
                  {value.secwepemcTerm} — {value.termMeaning}
                </p>
                <p className="text-shs-text-body text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section
        ref={historySection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-28 bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
              A History of Resilience
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              From colonial restrictions to cultural resurgence, our journey continues.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-shs-forest-200 md:-translate-x-1/2" />

            <div className="space-y-8">
              {historyTimeline.map((event, index) => (
                <div
                  key={event.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    historySection.isIntersecting ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    transition: 'opacity 0.5s ease-out',
                  }}
                >
                  {/* Left content (desktop) */}
                  <div className={`hidden md:block w-1/2 pr-12 text-right ${index % 2 === 1 ? 'invisible' : ''}`}>
                    <span className="text-shs-amber-600 font-bold text-lg">{event.year}</span>
                    <h3 className="text-xl font-bold text-shs-forest-800 mt-1">{event.title}</h3>
                    <p className="text-shs-text-body mt-2">{event.description}</p>
                  </div>

                  {/* Circle marker */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-shs-forest-600 rounded-full border-4 border-white shadow-md md:-translate-x-1/2 z-10" />

                  {/* Right content (desktop) / Main content (mobile) */}
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:invisible md:pl-12' : 'md:pl-12'}`}>
                    <span className="text-shs-amber-600 font-bold text-lg md:hidden">{event.year}</span>
                    <h3 className="text-xl font-bold text-shs-forest-800 mt-1 md:mt-0 md:hidden">{event.title}</h3>
                    <p className="text-shs-text-body mt-2 md:hidden">{event.description}</p>
                    
                    <div className="hidden md:block">
                      <span className="text-shs-amber-600 font-bold text-lg">{event.year}</span>
                      <h3 className="text-xl font-bold text-shs-forest-800 mt-1">{event.title}</h3>
                      <p className="text-shs-text-body mt-2">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section
        ref={partnersSection.ref as React.RefObject<HTMLElement>}
        className="py-16 md:py-20 bg-shs-sand border-y border-shs-stone"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-shs-forest-800 mb-4">Our Partners</h2>
            <p className="text-shs-text-muted">Supported by organizations that share our vision.</p>
          </div>

          <div 
            className={`flex flex-wrap items-center justify-center gap-8 md:gap-16 transition-all duration-700 ${
              partnersSection.isIntersecting ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {partners.map((partner) => (
              <div key={partner.abbr} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <span className="text-shs-forest-600 font-bold text-sm">{partner.abbr}</span>
                </div>
                <p className="text-sm font-semibold text-shs-forest-700">{partner.name}</p>
                <p className="text-xs text-shs-text-muted">{partner.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional Stories - From SCES Oral Histories */}
      <section className="py-16 md:py-24 bg-shs-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Oral Tradition
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Stories from the Land
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              For thousands of years, Secwépemc knowledge has been passed through stories. These teachings continue at our camps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {traditionalStories.map((story) => (
              <div
                key={story.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-shs-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                      <h3 className="text-lg font-bold text-shs-forest-800">{story.title}</h3>
                      <span className="text-sm text-shs-amber-600 italic">{story.secwepemc}</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-shs-forest-50 text-shs-forest-600 text-xs rounded-full mb-3">
                      {story.theme}
                    </span>
                    <p className="text-sm text-shs-text-body mb-3">{story.description}</p>
                    <p className="text-sm text-shs-forest-700 font-medium italic">
                      "{story.lesson}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-shs-text-muted mt-8">
            Stories shared at camps by Elders. Collected by the BC Indian Language Project (1971-1975).
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Want to Learn More?
          </h2>
          <p className="text-lg text-shs-forest-200 mb-10 max-w-2xl mx-auto">
            We'd love to share more about our work and explore how you can be part of this movement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
            >
              Get in Touch
            </Link>
            <Link
              to="/projects"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              View Our Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
