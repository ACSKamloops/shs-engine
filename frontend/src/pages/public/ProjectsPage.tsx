/**
 * ProjectsPage - Active Programs and Initiatives (Modernized Jan 2026)
 * Features: Framer Motion, animated cards, glassmorphism, timeline effects
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

// Project data - Updated from FPCC/TISF grant applications
const projects = [
  {
    id: 'braided-infrastructure',
    title: 'Secwépemc Mobile Foodways & Cultural Skills Hub',
    subtitle: 'FPCC Braided Infrastructure Program (BIP)',
    status: 'Active',
    year: '2025-2026',
    icon: '🏕️',
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
    color: 'emerald',
  },
  {
    id: 'heritage-stewardship',
    title: 'Secwépemc Ways: Ancestral Knowledge Documentation',
    subtitle: 'FPCC Heritage Stewardship Program (HSP)',
    status: 'Active',
    year: '2025-2026',
    icon: '📜',
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
  },
  {
    id: 'tisf',
    title: 'Land-Based Cultural Camps & Language Revitalization',
    subtitle: 'Thriving Indigenous Systems Fund (TISF)',
    status: 'Active',
    year: '2025',
    icon: '🌲',
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
    color: 'teal',
  },
  {
    id: 'youth-mentorship',
    title: 'Youth Mentorship Initiative',
    subtitle: 'Next Generation Leaders',
    status: 'Ongoing',
    year: '2024+',
    icon: '👨‍👧',
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
    color: 'purple',
  },
];

// Upcoming initiatives
const upcomingProjects = [
  {
    icon: '🗄️',
    title: 'Cultural Archive',
    description: 'Sovereign digital repository for oral histories, traditional songs, and Elder teachings with community-controlled access (OCAP® compliant)',
    timeline: 'In Development',
  },
  {
    icon: '📚',
    title: 'Curriculum Materials',
    description: 'Downloadable resources, lesson plans, and multimedia content for land-based cultural camps (HSP deliverable)',
    timeline: 'Coming 2026',
  },
  {
    icon: '🔐',
    title: 'Member Portal',
    description: 'Membership registration, camp enrollment, and community communication hub',
    timeline: 'Planning Phase',
  },
];

const colorClasses: Record<string, { badge: string; gradient: string }> = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-500 to-orange-500',
  },
  teal: {
    badge: 'bg-teal-100 text-teal-700',
    gradient: 'from-teal-500 to-cyan-500',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-500 to-pink-500',
  },
};

export function ProjectsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🚀</div>
          <div className="absolute bottom-10 left-10 text-9xl">🌱</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            🎯
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-6"
          >
            Our Initiatives
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
          >
            Projects & Programs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-shs-forest-200 max-w-2xl mx-auto mb-10"
          >
            Explore the programs we're developing to strengthen Secwépemc culture, 
            support our youth, and protect our heritage.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlowButton onClick={() => document.getElementById('active-projects')?.scrollIntoView({ behavior: 'smooth' })}>
              View Projects ↓
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* Active Projects */}
      <section id="active-projects" className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="✨" size="sm" />
                Current Work
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-shs-forest-800 mb-6">
                Active Programs
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                These initiatives represent our commitment to cultural preservation, 
                community development, and youth engagement.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const colors = colorClasses[project.color];
              return (
                <AnimatedCard key={project.id} delay={index * 0.1} className="p-0 overflow-hidden">
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <motion.span 
                          className="text-4xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {project.icon}
                        </motion.span>
                        <div>
                          <p className="text-sm text-white/80 font-medium">{project.subtitle}</p>
                          <h3 className="text-xl font-bold">{project.title}</h3>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {project.year}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors.badge}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {project.status}
                      </span>
                    </div>

                    <p className="text-shs-text-body leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-shs-forest-700 uppercase tracking-wide mb-3">
                        Key Highlights
                      </h4>
                      <ul className="space-y-2">
                        {project.highlights.slice(0, 3).map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-shs-text-body">
                            <span className="text-emerald-500 mt-0.5">✓</span>
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
                    <motion.div whileHover={{ x: 4 }} className="inline-block">
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center gap-2 text-shs-forest-600 font-semibold hover:text-shs-forest-800 transition-colors"
                      >
                        Learn More →
                      </Link>
                    </motion.div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Initiatives */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-shs-amber-500 blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-shs-forest-400 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionReveal>
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
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingProjects.map((project, index) => (
              <AnimatedCard key={project.title} delay={index * 0.15} glass className="p-6 bg-white/5 border-white/10">
                <motion.span 
                  className="text-4xl block mb-4"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {project.icon}
                </motion.span>
                <div className="text-shs-amber-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  {project.timeline}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                <p className="text-shs-forest-300 text-sm leading-relaxed">
                  {project.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Partner With Us CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-shs-cream to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <FloatingIcon icon="🤝" size="xl" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6 mt-4">
              Partner With Us
            </h2>
            <p className="text-lg text-shs-text-body mb-10 max-w-2xl mx-auto">
              We're always looking for organizations, funders, and community partners who share our vision 
              for cultural revitalization and Indigenous-led initiatives.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  Discuss Partnership →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  Support Our Work 💚
                </Link>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
