/**
 * ProjectsPage - Active Programs and Initiatives
 * Showcases major projects like Braided Infrastructure and Heritage Stewardship
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
      ([entry]) => {
        if (entry.isIntersecting) setIsIntersecting(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Project data - Updated from FPCC/TISF grant applications
const projects = [
  {
    id: 'braided-infrastructure',
    title: 'Secwépemc Mobile Foodways & Cultural Skills Hub',
    subtitle: 'FPCC Braided Infrastructure Program (BIP)',
    status: 'Active',
    year: '2025-2026',
    image: null,
    description: 'Mobile infrastructure to support land-based camps with safe food storage, weather-protected teaching spaces, and traditional skills workstations across Secwepemcúl̓ecw.',
    highlights: [
      'Mobile freezer trailer with generator for safe food preservation',
      'Heavy-duty canvas tents for Elder-led workshops in all weather',
      'Portable tanning racks for hide work instruction',
      'Enhanced capacity for kwséltkten (kinship) food sharing',
    ],
    outcomes: [
      'Safer traditional food storage at week-long camps',
      'Extended teaching capacity for Elders',
      'Revitalized hide tanning and preservation skills',
    ],
    partners: ['FPCC', 'Secwépemc Nation Communities'],
    color: 'forest',
    legalTerms: ['Kwséltkten', 'Syecwmenúlecwems'],
  },
  {
    id: 'heritage-stewardship',
    title: 'Secwépemc Ways: Ancestral Knowledge Documentation',
    subtitle: 'FPCC Heritage Stewardship Program (HSP)',
    status: 'Active',
    year: '2025-2026',
    image: null,
    description: 'Documenting and preserving Secwépemc oral histories (stsptekwll & slexéym), traditional ecological knowledge, and cultural protocols for curriculum development and community archives.',
    highlights: [
      'Elder oral history interviews and validation workshops',
      'Traditional place names (toponomy) documentation',
      'Curriculum development for land-based camps',
      'Youth mentees hired for intergenerational transfer',
    ],
    outcomes: [
      'Archived oral histories with community-controlled access',
      'TEK documentation for future generations',
      'Cultural curriculum materials for camps',
    ],
    partners: ['FPCC', 'Wuméc r Cqweqwelútn-kt'],
    color: 'amber',
    legalTerms: ['Stsptekwll', 'Slexéym', 'Stk̓wem7íplems'],
  },
  {
    id: 'tisf',
    title: 'Land-Based Cultural Camps & Language Revitalization',
    subtitle: 'Thriving Indigenous Systems Fund (TISF)',
    status: 'Active',
    year: '2025',
    image: null,
    description: 'Strengthening Secwépemc identity through immersive land-based camps that integrate traditional harvesting, Secwepemctsín language learning, and intergenerational knowledge transfer on Secwepemcúl̓ecw.',
    highlights: [
      'Traditional hunting, fishing, and sustainable harvesting',
      'Secwepemctsín language learning with Wuméc r Cqweqwelútn-kt',
      'Elder-led storytelling and oral traditions',
      'Food sovereignty through harvest sharing (kwséltkten)',
    ],
    outcomes: [
      'Deepened youth connection to land and culture',
      'Community healing through territorial reconnection',
      'Strengthened self-determination and inherent rights',
    ],
    partners: ['TISF', 'Wuméc r Cqweqwelútn-kt'],
    color: 'earth',
    legalTerms: ['Yecwmín̓men', 'Secwépemc-kt'],
  },
  {
    id: 'youth-mentorship',
    title: 'Youth Mentorship Initiative',
    subtitle: 'Next Generation Leaders',
    status: 'Ongoing',
    year: '2024+',
    image: null,
    description: 'Pairing Elders and experienced practitioners with young community members to transfer traditional hunting, gathering, and land stewardship skills through immersive, hands-on learning.',
    highlights: [
      'Multi-generational knowledge transfer',
      'Hands-on land-based learning at camps',
      'Cultural identity strengthening',
      'Leadership development for youth',
    ],
    outcomes: [
      '50+ youth participants trained',
      '20+ Elder mentors engaged',
      'Year-round programming established',
    ],
    partners: ['I-SPARC', 'Adams Lake', 'Little Shuswap Lake', 'Neskonlith'],
    color: 'forest',
  },
];

// Upcoming initiatives - Updated to reflect current status
const upcomingProjects = [
  {
    title: 'Cultural Archive',
    description: 'Sovereign digital repository for oral histories, traditional songs, and Elder teachings with community-controlled access (OCAP® compliant)',
    timeline: 'In Development',
  },
  {
    title: 'Curriculum Materials',
    description: 'Downloadable resources, lesson plans, and multimedia content for land-based cultural camps (HSP deliverable)',
    timeline: 'Coming 2026',
  },
  {
    title: 'Member Portal',
    description: 'Membership registration, camp enrollment, and community communication hub',
    timeline: 'Planning Phase',
  },
];

function ProjectCard({ project, index }: { project: typeof projects[0] & { to?: string }; index: number }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const colorClasses = {
    forest: {
      badge: 'bg-shs-forest-100 text-shs-forest-700',
      border: 'hover:border-shs-forest-300',
      accent: 'bg-shs-forest-600',
    },
    amber: {
      badge: 'bg-shs-amber-100 text-shs-amber-700',
      border: 'hover:border-shs-amber-300',
      accent: 'bg-shs-amber-500',
    },
    earth: {
      badge: 'bg-shs-earth-100 text-shs-earth-700',
      border: 'hover:border-shs-earth-300',
      accent: 'bg-shs-earth-600',
    },
  };
  const colors = colorClasses[project.color as keyof typeof colorClasses];

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`group bg-white rounded-3xl border border-shs-stone overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${colors.border} ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Image placeholder */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-shs-forest-100 to-shs-earth-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-shs-forest-300">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors.badge}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {project.status}
          </span>
        </div>
        {/* Year badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-shs-text-body">
            {project.year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <p className="text-sm text-shs-text-muted font-medium mb-2">{project.subtitle}</p>
        <h3 className="text-xl md:text-2xl font-bold text-shs-forest-800 mb-3 group-hover:text-shs-forest-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-shs-text-body leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Highlights */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-shs-forest-700 uppercase tracking-wide mb-3">Key Highlights</h4>
          <ul className="space-y-2">
            {project.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-shs-text-body">
                <svg className="w-5 h-5 text-shs-forest-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Partners */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.partners.map((partner, i) => (
            <span key={i} className="px-3 py-1 bg-shs-sand rounded-full text-xs font-medium text-shs-text-body">
              {partner}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          to={project.to || `/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-shs-forest-600 font-semibold hover:text-shs-forest-800 transition-colors group/link"
        >
          Learn More
          <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export function ProjectsPage() {
  const upcomingSection = useIntersectionObserver();

  return (
    <div>
      {/* Hero */}
      <Hero
        headline="Our Projects & Initiatives"
        subheadline="Explore the programs we're developing to strengthen Secwépemc culture, support our youth, and protect our heritage."
        primaryCta={{ label: 'Get Involved', to: '/contact' }}
        size="medium"
      />

      {/* Active Projects */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Current Work
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6">
              Active Programs
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              These initiatives represent our commitment to cultural preservation, community development, and youth engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Initiatives */}
      <section
        ref={upcomingSection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-28 bg-shs-forest-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-shs-amber-500 blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-shs-forest-400 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Coming Soon
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Future Initiatives
            </h2>
            <p className="text-lg text-shs-forest-200 max-w-xl mx-auto">
              Projects in development that will further our mission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingProjects.map((project, index) => (
              <div
                key={project.title}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-700 ${
                  upcomingSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-shs-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  {project.timeline}
                </div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-shs-forest-300 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner With Us CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-shs-cream to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
            Partner With Us
          </h2>
          <p className="text-lg text-shs-text-body mb-10 max-w-2xl mx-auto">
            We're always looking for organizations, funders, and community partners who share our vision 
            for cultural revitalization and Indigenous-led initiatives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-all shadow-lg hover:shadow-xl"
            >
              Discuss Partnership
            </Link>
            <Link
              to="/donate"
              className="w-full sm:w-auto px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              Support Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
