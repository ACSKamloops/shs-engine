/**
 * MapPage - Interactive Territory Map (Modernized Jan 2026)
 * Features: Framer Motion, animated cards, section reveals
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TerritoryMap } from '../../components/public/TerritoryMap';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

// Info cards data
const infoCards = [
  {
    icon: '🌲',
    title: 'The Territory',
    description: 'Secwepemcúl̓ecw spans over 180,000 square kilometres in the interior of British Columbia, encompassing diverse ecosystems from grasslands to alpine.',
    link: '/about',
    linkText: 'Learn about our history →',
    color: 'emerald',
  },
  {
    icon: '⛺',
    title: 'Active Programs',
    description: 'Our cultural camps and programs operate throughout the territory, bringing communities together for land-based learning experiences.',
    link: '/cultural-camps',
    linkText: 'View our camps →',
    color: 'amber',
  },
  {
    icon: '🤝',
    title: 'Partnerships',
    description: 'We collaborate with Secwépemc communities, First Nations organizations, and cultural partners to strengthen our collective impact.',
    link: '/projects',
    linkText: 'See our projects →',
    color: 'purple',
  },
];

export function MapPage() {
  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🗺️</div>
          <div className="absolute bottom-10 left-10 text-9xl">🏔️</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4"
              >
                <FloatingIcon icon="✨" size="sm" />
                Explore Our Territory
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
              >
                Secwepemcúl̓ecw
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-shs-forest-200 leading-relaxed"
              >
                Discover the traditional lands of the Secwépemc people. Explore our cultural camps, 
                program sites, and partnerships across the territory.
              </motion.p>
            </div>
            {/* Admin link for staff */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/admin/territory-map"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-shs-forest-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Staff Only: Manage Map"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Container */}
      <section className="py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl border border-shs-stone overflow-hidden"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-[70vh] min-h-[500px]">
                <TerritoryMap />
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infoCards.map((card, index) => (
              <AnimatedCard key={card.title} delay={index * 0.1} className="p-6" glass>
                <motion.span 
                  className="text-4xl block mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {card.icon}
                </motion.span>
                <h3 className="text-lg font-bold text-shs-forest-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-shs-text-body leading-relaxed mb-4">
                  {card.description}
                </p>
                <motion.div whileHover={{ x: 4 }}>
                  <Link 
                    to={card.link} 
                    className="text-shs-forest-600 text-sm font-semibold hover:text-shs-forest-800 transition-colors"
                  >
                    {card.linkText}
                  </Link>
                </motion.div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional Names Note */}
      <SectionReveal>
        <section className="py-8 bg-gradient-to-r from-shs-forest-50 to-emerald-50 border-t border-shs-forest-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-shs-forest-700 italic flex items-center justify-center gap-2">
              <FloatingIcon icon="📌" size="sm" />
              <span>
                <strong>Note:</strong> This map shows an approximate representation of Secwepemcúl̓ecw. 
                Traditional territory boundaries are complex and we continue to work on incorporating 
                accurate cultural geography and Secwepemctsín place names.
              </span>
            </p>
          </div>
        </section>
      </SectionReveal>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-shs-earth-100 to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <FloatingIcon icon="🏕️" size="xl" />
            <h2 className="text-3xl md:text-4xl font-bold text-shs-forest-800 mt-4 mb-4">
              Want to Visit?
            </h2>
            <p className="text-shs-text-body mb-8 max-w-xl mx-auto text-lg">
              Join us at an upcoming cultural camp or event to experience the land firsthand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  View Upcoming Events →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-shs-forest-700 font-bold rounded-2xl border-2 border-shs-forest-200 hover:border-shs-forest-300 transition-colors"
                >
                  Get in Touch 💬
                </Link>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
