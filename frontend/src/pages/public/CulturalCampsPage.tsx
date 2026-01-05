/**
 * CulturalCampsPage - Cultural Camps & Land-Based Learning
 * Showcases camp programs aligned with the six pillars
 */
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Hero } from '../../components/public/Hero';
import { PillarIcons } from '../../components/public/PillarCard';

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

// Camp types data
const campTypes = [
  {
    id: 'hunting',
    title: 'Hunting & Harvesting',
    icon: PillarIcons.foodSovereignty,
    description: 'Learn traditional hunting, fishing, gathering, and food preservation practices. Guided by the "Spirit of the Harvest," we utilize our Mobile Foodways Hub to support land-based processing and sharing.',
    activities: [
      'Hunting protocols and "Take only what you need"',
      'Mobile Hub: Field processing and storage',
      'Traditional fishing & Salmon arrival stories',
      'Food preservation (smoking, drying, freezing)',
      'Intergenerational community feasts',
    ],
    season: 'Spring & Fall',
    duration: '3-10 days',
    modernSkills: ['Food Safety', 'Culinary Arts', 'Supply Chain Mgmt'],
  },
  {
    id: 'stewardship',
    title: 'Land Stewardship Camps',
    icon: PillarIcons.stewardship,
    description: 'Deepen your connection to Secwepemcúl̓ecw through seasonal knowledge and responsible land care.',
    activities: [
      'Traditional ecological knowledge',
      'Seasonal harvesting practices',
      'Land management techniques',
      'Water and watershed protection',
      'Wildlife stewardship',
    ],
    season: 'Year-round',
    duration: '2-4 days',
    modernSkills: ['GIS & Mapping', 'Environmental Monitoring', 'Forestry'],
  },
  {
    id: 'culture',
    title: 'Cultural Preservation Camps',
    icon: PillarIcons.culturalPreservation,
    description: 'Immerse yourself in Secwépemc language, arts, storytelling, and traditional practices.',
    activities: [
      'Secwepemctsín language learning',
      'Traditional arts and crafts',
      'Story sharing with Elders',
      'Songs and ceremony',
      'Cultural protocol teachings',
    ],
    season: 'Summer',
    duration: '5-7 days',
    modernSkills: ['Linguistics', 'Arts Administration', 'Education'],
  },
  {
    id: 'wellness',
    title: 'Healing & Wellness Camps',
    icon: PillarIcons.healing,
    description: 'Support your holistic wellbeing through circle gatherings, outdoor therapy, and community connection.',
    activities: [
      'Circle gatherings',
      'Land-based healing practices',
      'Traditional medicine teachings',
      'Physical wellness activities',
      'Mental and spiritual support',
    ],
    season: 'Spring & Summer',
    duration: '3-5 days',
    modernSkills: ['Social Work', 'Health Promotion', 'Counselling'],
  },
  {
    id: 'guardian',
    title: 'Guardian Training (Drone/GIS)',
    icon: PillarIcons.partnerships,
    description: 'Training programs for the next generation of cultural leaders, using our "Hunting Camp Curriculum Blueprint" rooted in oral histories.',
    activities: [
      'Elder-youth mentorship pairings',
      'Technical skills: Drone Ops & GIS Mapping',
      '"Narrative Sovereignty" media training',
      'Secwépemctsín immersion',
      'Next Gen Stewardship leadership',
    ],
    season: 'Summer',
    duration: '7-14 days',
    modernSkills: ['Public Policy', 'Communications', 'Leadership'],
  },
];

// Upcoming camps (placeholder data)
const upcomingCamps = [
  {
    title: 'Spring Food Sovereignty Camp',
    dates: 'April 2026',
    location: 'Adams Lake Area',
    spots: 15,
    status: 'Registration Opening Soon',
  },
  {
    title: 'Summer Youth Camp',
    dates: 'July 2026',
    location: 'Chase Region',
    spots: 25,
    status: 'Planning',
  },
  {
    title: 'Fall Hunting Camp',
    dates: 'September 2026',
    location: 'Secwepemcúl̓ecw',
    spots: 12,
    status: 'Planning',
  },
];

// Daily Camp Activities from SCES Elder Memories & TPR Curriculum
const dailyCampActivities = [
  {
    time: 'Morning (7:00)',
    activity: 'Wake & Welcome',
    secwepemc: 'Qillte me7 ce7miuit-ucw!',
    english: 'Wake up and get out of bed!',
    description: 'Start the day with traditional greetings and morning stretches.',
    vocabulary: [
      { word: 'Weytk', meaning: 'Hello' },
      { word: 'Le7 t̕e scwéwe', meaning: 'Good morning' },
    ],
  },
  {
    time: 'Morning (8:00)',
    activity: 'Berry Harvesting',
    secwepemc: 'Qwléwem te speqpéq',
    english: 'Picking berries',
    description: 'Learn traditional saskatoon berry identification and harvesting practices.',
    vocabulary: [
      { word: 'speqpéq7', meaning: 'saskatoon berries' },
      { word: 'qwléwem', meaning: 'picking/gathering' },
    ],
  },
  {
    time: 'Midday (12:00)',
    activity: 'Bannock Making',
    secwepemc: 'Re skilem te spixle7cw',
    english: 'Making fried bread',
    description: 'Prepare traditional bannock together over the fire.',
    vocabulary: [
      { word: 'tiqw', meaning: 'bannock/bread' },
      { word: 'pell', meaning: 'fire' },
    ],
  },
  {
    time: 'Afternoon (2:00)',
    activity: 'Fishing',
    secwepemc: 'Me7 wéwlem-kt',
    english: 'We will go fishing!',
    description: 'Traditional salmon fishing techniques and spear construction.',
    vocabulary: [
      { word: 'stselkék', meaning: 'salmon' },
      { word: 'ts\'ewén', meaning: 'fish spear' },
    ],
  },
  {
    time: 'Evening (6:00)',
    activity: 'Community Meal',
    secwepemc: 'Me7 kweltsentsiit-kt',
    english: 'We will cook a meal!',
    description: 'Prepare and share a meal together using harvested foods.',
    vocabulary: [
      { word: 'sqílye', meaning: 'meat' },
      { word: 'íllen', meaning: 'eating' },
    ],
  },
];

// FAQ data
const faqs = [
  {
    question: 'Who can attend the camps?',
    answer: 'Our camps are primarily for Secwépemc Nation members and their families. Some camps may be open to other Indigenous community members. Contact us for specific eligibility requirements.',
  },
  {
    question: 'Is there a cost to attend?',
    answer: 'Most of our camps are offered at no cost to participants thanks to funding support from organizations like FPCC and I-SPARC. Some specialized programs may have nominal fees for supplies.',
  },
  {
    question: 'What should I bring?',
    answer: 'We provide detailed packing lists upon registration. Generally, you\'ll need appropriate outdoor clothing, personal items, and any specialized equipment we\'ll specify for the particular camp.',
  },
  {
    question: 'Are camps suitable for beginners?',
    answer: 'Yes! We welcome participants of all skill levels. Our experienced mentors and Elders adjust teachings to meet you where you are in your learning journey.',
  },
  {
    question: 'Can families attend together?',
    answer: 'Many of our camps are designed for multi-generational participation. Family camps are a wonderful way to learn and connect together on the land.',
  },
];

function CampTypeCard({ camp, index }: { camp: typeof campTypes[0] & { modernSkills?: string[] }; index: number }) {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      id={camp.id}
      className={`scroll-mt-24 bg-white rounded-3xl border border-shs-stone overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-shs-forest-100 to-shs-forest-200 flex items-center justify-center text-shs-forest-700 flex-shrink-0">
            {camp.icon}
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-shs-forest-800 mb-1">
              {camp.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-shs-text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {camp.season}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {camp.duration}
              </span>
            </div>
          </div>
        </div>

        <p className="text-shs-text-body leading-relaxed mb-6">
          {camp.description}
        </p>

        {/* Modern Skills (Horizon Expansion) */}
        {camp.modernSkills && (
          <div className="mb-6 bg-shs-amber-50 rounded-xl p-3 border border-shs-amber-100">
             <h4 className="flex items-center gap-2 text-xs font-bold text-shs-amber-700 uppercase tracking-wide mb-2">
               <span className="w-1.5 h-1.5 rounded-full bg-shs-amber-500"/>
               Career Pathways
             </h4>
             <div className="flex flex-wrap gap-2">
               {camp.modernSkills.map(skill => {
                 // Soft pastel colors for different skill categories
                 const skillColors: Record<string, string> = {
                   'Linguistics': 'bg-purple-50 text-purple-700 border-purple-200',
                   'Education': 'bg-blue-50 text-blue-700 border-blue-200',
                   'Arts Administration': 'bg-pink-50 text-pink-700 border-pink-200',
                   'Social Work': 'bg-rose-50 text-rose-700 border-rose-200',
                   'Health Promotion': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                   'Counselling': 'bg-teal-50 text-teal-700 border-teal-200',
                   'Public Policy': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                   'Communications': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                   'Leadership': 'bg-amber-50 text-amber-700 border-amber-200',
                   'Food Safety': 'bg-orange-50 text-orange-700 border-orange-200',
                   'Culinary Arts': 'bg-red-50 text-red-700 border-red-200',
                   'Supply Chain Mgmt': 'bg-slate-50 text-slate-700 border-slate-200',
                   'GIS & Mapping': 'bg-sky-50 text-sky-700 border-sky-200',
                   'Environmental Monitoring': 'bg-lime-50 text-lime-700 border-lime-200',
                   'Forestry': 'bg-green-50 text-green-700 border-green-200',
                 };
                 const colorClass = skillColors[skill] || 'bg-shs-forest-50 text-shs-forest-700 border-shs-forest-200';
                 return (
                   <span key={skill} className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
                     {skill}
                   </span>
                 );
               })}
             </div>
          </div>
        )}

        {/* Activities */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-shs-forest-700 uppercase tracking-wide mb-3">
            What You'll Learn
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {camp.activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-shs-text-body">
                <svg className="w-4 h-4 text-shs-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {activity}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-shs-forest-600 text-white font-semibold rounded-lg hover:bg-shs-forest-700 transition-colors"
        >
          Express Interest
        </Link>
      </div>
    </div>
  );
}

function FAQItem({ faq }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-shs-stone last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-shs-forest-800 group-hover:text-shs-forest-600 transition-colors pr-4">
          {faq.question}
        </span>
        <svg
          className={`w-5 h-5 text-shs-forest-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-48 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-shs-text-body leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export function CulturalCampsPage() {
  const upcomingSection = useIntersectionObserver();

  return (
    <div>
      {/* Hero */}
      <Hero
        headline="Cultural Camps & Land-Based Learning"
        subheadline="Reconnect with your roots through immersive, multi-day experiences on the land with Elders and knowledge keepers."
        primaryCta={{ label: 'View Upcoming Camps', to: '#upcoming' }}
        secondaryCta={{ label: 'Contact Us', to: '/contact' }}
        size="medium"
      />

      {/* Why Land-Based Learning - From Secwépemc Law Book */}
      <section className="py-16 md:py-20 bg-shs-forest-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Rooted in Secwépemc Law
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Why Land-Based Learning?
            </h2>
            <p className="text-shs-forest-200 max-w-2xl mx-auto">
              Our camps continue a practice documented in Secwépemc legal traditions—learning from the land itself.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quote 1 */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <blockquote className="text-shs-forest-100 italic mb-4 leading-relaxed">
                "They took care of children and they taught them all these values... when they're outside 
                they learned how, you know, testing the dirt, eating it, rocks, whatever, weeds... 
                Doing their own stuff - where when they're indoors they don't do that."
              </blockquote>
              <footer className="text-shs-amber-300 font-semibold text-sm">
                — Julianna Alexander
                <span className="block text-xs text-shs-forest-400 font-normal mt-1">
                  Secwépemc Lands and Resources Law Analysis, 2018
                </span>
              </footer>
            </div>

            {/* Quote 2 */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <blockquote className="text-shs-forest-100 italic mb-4 leading-relaxed">
                "If you just take it and kill it, it's just a dead plant. But if you ask it and tell it 
                why you need its help and its medicine, then its medicine, its mala'men. 
                That's one of the laws that teaches us to be human beings: respectfulness and thankfulness."
              </blockquote>
              <footer className="text-shs-amber-300 font-semibold text-sm">
                — Randy Williams
                <span className="block text-xs text-shs-forest-400 font-normal mt-1">
                  On traditional protocols for harvesting medicine
                </span>
              </footer>
            </div>
          </div>

          {/* Key Principles */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-xl">🌲</span>
              </div>
              <h3 className="font-bold text-white mb-1">Experiential Learning</h3>
              <p className="text-sm text-shs-forest-300">Learning by doing, directly on the land with guidance from Elders</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="font-bold text-white mb-1">Respect & Protocol</h3>
              <p className="text-sm text-shs-forest-300">Following Secwépemc law when harvesting and interacting with the land</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-shs-amber-500/20 flex items-center justify-center">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="font-bold text-white mb-1">Multi-Generational</h3>
              <p className="text-sm text-shs-forest-300">Elders teaching youth, continuing knowledge that was passed to them</p>
            </div>
          </div>
        </div>
      </section>

      {/* Horizon Expansion - Opportunity Exposure */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              More Than a Camp
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Discover What's Possible
            </h2>
            <p className="text-lg text-shs-text-body max-w-3xl mx-auto">
              Our camps aren't vocational training—they're <strong>horizon expansion</strong>. 
              For traditionally underserved Indigenous youth, we open doors to pathways they 
              may never have known existed, all grounded in tradition, togetherness, and community.
            </p>
          </div>

          {/* Philosophy Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-shs-stone">
              <div className="w-12 h-12 rounded-full bg-shs-forest-100 flex items-center justify-center mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Exposure Over Instruction</h3>
              <p className="text-sm text-shs-text-body">
                Informal mentorship—chatting with knowledge keepers while fishing—is more 
                effective than formal career fairs.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-shs-stone">
              <div className="w-12 h-12 rounded-full bg-shs-forest-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Identity Before Skills</h3>
              <p className="text-sm text-shs-text-body">
                Programs focusing on identity and belonging have higher long-term outcomes 
                because they build the resilience needed to navigate the world.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-shs-stone">
              <div className="w-12 h-12 rounded-full bg-shs-forest-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Traditional Skills ARE Science</h3>
              <p className="text-sm text-shs-text-body">
                Tracking a deer requires observation, hypothesis, and evidence—the same 
                skills used by wildlife biologists. This is Two-Eyed Seeing.
              </p>
            </div>
          </div>

          {/* Did You Know Cards */}
          <div className="bg-shs-forest-50 rounded-3xl p-8 border border-shs-forest-100">
            <h3 className="text-xl font-bold text-shs-forest-800 mb-6 text-center">
              Did You Know?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  skill: 'Tracking & Hunting',
                  insight: 'Requires observation, pattern recognition, and evidence gathering',
                  careers: 'Wildlife Biologist, Conservation Officer',
                },
                {
                  skill: 'Plant Knowledge',
                  insight: 'Understanding medicinal properties and ecosystems',
                  careers: 'Ethnobotanist, Forester, Pharmacologist',
                },
                {
                  skill: 'Territory Patrol',
                  insight: 'Monitoring vast land bases using modern tools',
                  careers: 'Drone Pilot, GIS Specialist, Guardian',
                },
                {
                  skill: 'Hide Tanning',
                  insight: 'Complex organic chemistry transformation',
                  careers: 'Chemical Engineer, Material Scientist',
                },
                {
                  skill: 'Oral History',
                  insight: 'Memorizing and transmitting complex laws and histories',
                  careers: 'Lawyer, Archivist, Historian',
                },
                {
                  skill: 'Speaking Secwepemctsín',
                  insight: 'Preserving an endangered language for future generations',
                  careers: 'Language Teacher, Linguist, Cultural Coordinator',
                },
              ].map((item) => (
                <div key={item.skill} className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-shs-forest-700 mb-1">{item.skill}</h4>
                  <p className="text-sm text-shs-text-body mb-2">{item.insight}</p>
                  <p className="text-xs text-shs-amber-600 font-medium">
                    → {item.careers}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-shs-text-muted mt-6">
              Our camps reveal these connections naturally through lived cultural experience.
            </p>
          </div>
        </div>
      </section>

      {/* Camp Types */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Our Programs
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6">
              Camp Programs
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              Each of our camp programs aligns with one or more of our six pillars, ensuring a holistic approach to cultural learning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {campTypes.map((camp, index) => (
              <CampTypeCard key={camp.id} camp={camp} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Sample Day Schedule - From SCES TPR Curriculum */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              What to Expect
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Sample Day at Camp
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Each activity includes Secwepemctsín vocabulary so you learn language while doing.
            </p>
          </div>

          <div className="space-y-4">
            {dailyCampActivities.map((item) => (
              <div
                key={item.activity}
                className="bg-shs-sand rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-32 flex-shrink-0">
                    <span className="text-sm font-semibold text-shs-forest-600">{item.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <h3 className="text-lg font-bold text-shs-forest-800">{item.activity}</h3>
                      <span className="text-shs-amber-600 italic text-sm">{item.secwepemc}</span>
                    </div>
                    <p className="text-sm text-shs-text-body mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.vocabulary.map((v) => (
                        <span key={v.word} className="px-2 py-1 bg-white text-xs rounded-full border border-shs-stone">
                          <strong className="text-shs-forest-700">{v.word}</strong>
                          <span className="text-shs-text-muted"> = {v.meaning}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-shs-text-muted mt-8">
            Activities vary by camp type and season. Language content provided by SCES curriculum.
          </p>
        </div>
      </section>

      {/* Upcoming Camps */}
      <section
        id="upcoming"
        ref={upcomingSection.ref as React.RefObject<HTMLElement>}
        className="scroll-mt-20 py-20 md:py-28 bg-shs-forest-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-shs-amber-500 blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Join Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Upcoming Camps
            </h2>
            <p className="text-lg text-shs-forest-200 max-w-xl mx-auto">
              Registration details will be shared via our newsletter and social media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingCamps.map((camp, index) => (
              <div
                key={camp.title}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-700 ${
                  upcomingSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-shs-amber-400 text-xs font-semibold uppercase tracking-wide">
                    {camp.status}
                  </span>
                  <span className="text-shs-forest-300 text-sm">{camp.spots} spots</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{camp.title}</h3>
                <div className="space-y-1 text-sm text-shs-forest-300 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {camp.dates}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {camp.location}
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="text-shs-amber-300 text-sm font-medium hover:text-white transition-colors"
                >
                  Get Notified →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-shs-forest-300 mb-4">Want to be the first to know about new camps?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors"
            >
              Join Our Mailing List
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-shs-text-body">
              Have questions about our camps? Here are some common answers.
            </p>
          </div>

          <div className="bg-shs-sand rounded-2xl p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-shs-text-muted mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="text-shs-forest-600 font-semibold hover:text-shs-forest-800 transition-colors"
            >
              Contact us directly →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
