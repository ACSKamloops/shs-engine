/**
 * StewardshipPage - Secwépemc Territory Stewardship (Modernized Jan 2026)
 * Features: Framer Motion, animated cards, glassmorphism, section reveals
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

// Elephant Hill recovery cards
const recoveryCards = [
  {
    icon: '🔥',
    title: 'Joint Governance',
    description: 'Implementation of the Joint Leadership Council (JLC), ensuring Secwépemc Chiefs have final authority on all land-based decisions alongside provincial managers.',
  },
  {
    icon: '🌱',
    title: 'Fireguard Rehab',
    description: '100% completion of fireguard rehabilitation using native seed mixes and protocols that prioritize riparian zones and wildlife corridors over loop-road convenience.',
  },
  {
    icon: '🏺',
    title: 'Archaeology',
    description: 'Documentation of 218 new cultural sites, validating ancient presence and informing stewardship priorities through Secwépemc-led field surveys.',
  },
];

// Legal narratives
const legalNarratives = [
  {
    icon: '🦫',
    title: 'Beaver & Porcupine',
    description: 'When Porcupine repeatedly stole Beaver\'s food, Beaver responded with proportional interventions—first moving away, and only using separation as a last resort.',
    principle: 'Proportionality & Obligation',
  },
  {
    icon: '🦊',
    title: 'Coyote & the Cannibal Boy',
    description: 'Coyote brought a stranger into the community for personal gain without vetting him. The community responded by asserting that collective safety overrides individual desire.',
    principle: 'Collective Responsibility',
  },
  {
    icon: '🦌',
    title: 'Dirty-Lad & his Elk Wives',
    description: 'When an agreement was broken, the marriage was severed, illustrating that all treaties and relations are conditional on mutual respect of terms.',
    principle: 'Treaty Integrity',
  },
  {
    icon: '🐟',
    title: 'The Sucker Story',
    description: 'The entire community contributed to rebuilding Sucker after an injury, showing that shared obligation to help remains even if the harm was self-inflicted.',
    principle: 'Restorative Justice',
  },
];

// Stewardship principles
const stewardshipPrinciples = [
  {
    icon: '🔧',
    title: 'Technical Guardianship',
    description: 'Building long-term capacity for Secwépemc careers in forestry, archaeology, and ecological monitoring.',
    color: 'emerald',
  },
  {
    icon: '🤝',
    title: 'Relational Accountability',
    description: 'Shifting from \'service delivery\' to the fulfillment of mandatory kinship responsibilities to the land.',
    color: 'amber',
  },
  {
    icon: '📜',
    title: 'Narrative Revitalization',
    description: 'Positioning youth as creators of digital media and guardians of Secwépemcúl̓ecw land data.',
    color: 'teal',
  },
  {
    icon: '⚡',
    title: 'Landscape Continuity',
    description: 'Moving beyond single-focus management toward holistic, multi-generational ecological resilience.',
    color: 'purple',
  },
];

// Traditional technology data
const technologyCategories = [
  {
    icon: '🔧',
    title: 'Tool Making',
    items: [
      { name: 'Knife', desc: 'Basalt stone flaked to sharp edge, wood handle wrapped in buckskin' },
      { name: 'Arrow Flaker', desc: 'Deer antler for sharpening stone tools' },
      { name: 'Bark Peeler', desc: 'Wood or caribou antler for removing tree bark' },
      { name: 'Thread', desc: 'Braided from Indian hemp, nettle, or elaegnus bark' },
    ],
  },
  {
    icon: '🐟',
    title: 'Fishing Technology',
    items: [
      { name: 'Fish Spear (Ts\'ewén)', desc: 'Deer antler prongs on fir handle, lashed with hemp' },
      { name: 'Fish Weir (Stséwc)', desc: 'Poles and twigs lashed together to trap fish' },
      { name: 'Dip Net', desc: 'Indian hemp bark netting on wooden frame' },
      { name: 'Canoe', desc: 'Spruce or pine bark sewn with split willow root' },
    ],
  },
  {
    icon: '🏠',
    title: 'Traditional Homes',
    items: [
      { name: 'Pit House (C7ístken)', desc: 'Underground winter dwelling with ladder entry' },
      { name: 'Sweat House (S\'istken)', desc: 'Bent willow covered with bark and earth' },
      { name: 'Mat Lodge', desc: 'Tule and rush mats over conical pole frame' },
      { name: 'Hunting Lodge', desc: 'Round or square, covered with mats or bark' },
    ],
  },
];

export function StewardshipPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🌲</div>
          <div className="absolute bottom-10 left-10 text-9xl">🌿</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            🏔️
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-6"
          >
            Land Stewardship
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
          >
            Walking on Two Legs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-shs-forest-200 max-w-2xl mx-auto mb-10"
          >
            Honoring Secwépemc ecological knowledge and holistic resilience 
            through collaborative territory management.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlowButton onClick={() => window.location.href = '/projects'}>
              Our Projects →
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-shs-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-full mb-6">
                  <FloatingIcon icon="✨" size="sm" />
                  Our Philosophy
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6 leading-tight">
                  Walking on Two Legs
                </h2>
                <div className="space-y-4 text-lg text-shs-text-body leading-relaxed">
                  <p>
                    At the heart of our stewardship is the <strong className="text-shs-forest-700">"Walking on Two Legs"</strong> philosophy. 
                    This approach treats Secwépemc traditional knowledge and Western science as equal, complementary pillars of land management.
                  </p>
                  <p>
                    Rather than viewing land as a collection of "resources," we recognize 
                    <strong className="text-shs-forest-700"> Secwepemcúl̓ecw</strong> as a living web of relations 
                    where we have inherent responsibilities to care for all human and more-than-human kin.
                  </p>
                </div>
              </div>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-200 to-teal-200 overflow-hidden shadow-2xl flex items-center justify-center">
                  <motion.span 
                    className="text-9xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🌲
                  </motion.span>
                </div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-amber-200 rounded-2xl -z-10 -rotate-3" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-teal-200 rounded-xl -z-10 rotate-6" />
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Elephant Hill Case Study */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionReveal>
            <div className="mb-16">
              <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
                Case Study: Resilience
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                The Elephant Hill Wildfire Recovery
              </h2>
              <p className="text-xl text-shs-forest-200 max-w-3xl leading-relaxed">
                Following the 2017 wildfires, the Secwépemc Nation established a paradigm-shifting collaborative 
                framework for landscape-level recovery and long-term land health.
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {recoveryCards.map((card, index) => (
              <AnimatedCard key={card.title} delay={index * 0.15} glass className="p-8 bg-white/5 border-white/10">
                <motion.span 
                  className="text-4xl block mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {card.icon}
                </motion.span>
                <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
                <p className="text-shs-forest-300 text-sm leading-relaxed">
                  {card.description}
                </p>
              </AnimatedCard>
            ))}
          </div>

          <SectionReveal delay={0.3}>
            <div className="mt-16 p-8 bg-white/5 rounded-3xl border border-white/10 text-center backdrop-blur-sm">
              <p className="text-shs-forest-200 italic text-lg leading-relaxed">
                "The relationships formed 'on the land' during the recovery were more durable 
                than the institutional mandates they served under."
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Legal Narratives */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="⚖️" size="sm" />
                Law in Action
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
                Secwépemc Legal Narratives
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                Our oral traditions (<em>stsptekwll</em>) serve as primary legal texts, 
                illustrating the application of law through history.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalNarratives.map((narrative, index) => (
              <AnimatedCard key={narrative.title} delay={index * 0.1} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {narrative.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-shs-forest-800">{narrative.title}</h3>
                </div>
                <p className="text-shs-text-body text-sm leading-relaxed mb-4">
                  {narrative.description}
                </p>
                <div className="pt-4 border-t border-shs-stone/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Principle</span>
                  <span className="text-sm text-shs-forest-700 font-medium">{narrative.principle}</span>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stewardship Principles */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
                Collaborative Stewardship
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                We work in partnership with diverse organizations to apply Secwépemc ecological values to modern land management.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stewardshipPrinciples.map((principle, index) => (
              <AnimatedCard key={principle.title} delay={index * 0.1} className="p-6 text-center">
                <motion.span 
                  className="text-5xl block mb-4"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {principle.icon}
                </motion.span>
                <h3 className="text-lg font-bold text-shs-forest-800 mb-2">{principle.title}</h3>
                <p className="text-shs-text-body text-sm leading-relaxed">{principle.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional Technology */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-shs-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="📚" size="sm" />
                From the Archive
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
                Traditional Technology
              </h2>
              <p className="text-shs-text-body max-w-2xl mx-auto">
                For thousands of years, Secwépemc people developed sophisticated technologies using natural materials.
                This knowledge is documented in the SCES Cultural Series.
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {technologyCategories.map((category, index) => (
              <AnimatedCard key={category.title} delay={index * 0.15} className="p-6" glass>
                <motion.span 
                  className="text-4xl block mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {category.icon}
                </motion.span>
                <h3 className="text-lg font-bold text-shs-forest-800 mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.items.map((item) => (
                    <li key={item.name} className="text-sm text-shs-text-body">
                      <span className="text-emerald-600 mr-1">•</span>
                      <strong>{item.name}:</strong> {item.desc}
                    </li>
                  ))}
                </ul>
              </AnimatedCard>
            ))}
          </div>

          <p className="text-center text-sm text-shs-text-muted mt-8">
            Source: SCES Cultural Series Book 5 - Technology of the Shuswap (1986)
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🌲</div>
          <div className="absolute bottom-10 right-10 text-9xl">🏔️</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <SectionReveal>
            <FloatingIcon icon="🤝" size="xl" />
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-6">
              Want to Partner on Stewardship?
            </h2>
            <p className="text-xl text-shs-forest-200 mb-10">
              We collaborate with technical teams, government agencies, and community members to protect our territory.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
              >
                Connect With Our Team →
              </Link>
            </motion.div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
