/**
 * DonatePage - Donation Portal with Premium UI (Modernized Jan 2026)
 * Features: Animated cards, floating icons, glassmorphism, hero image
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

// Donation impact examples
const impactExamples = [
  { amount: '$25', impact: 'Provides supplies for one youth participant at a cultural camp', icon: '🎒' },
  { amount: '$50', impact: 'Covers transportation for an Elder to share teachings', icon: '🚗' },
  { amount: '$100', impact: 'Supplies traditional tools and materials for a workshop', icon: '🏹' },
  { amount: '$250', impact: 'Sponsors a youth for an entire week-long cultural camp', icon: '⛺' },
  { amount: '$500', impact: 'Funds recording and preservation of Elder knowledge', icon: '📚' },
  { amount: '$1000+', impact: 'Supports a full program day including meals and instruction', icon: '🌲' },
];

// Ways to give
const waysToGive = [
  { title: 'One-Time Donation', description: 'Make a single contribution to support our programs.', available: true, icon: '💝' },
  { title: 'Monthly Giving', description: 'Become a sustaining supporter with recurring donations.', available: false, comingSoon: true, icon: '🔄' },
  { title: 'In-Kind Donations', description: 'Donate supplies, equipment, or materials for our camps.', available: true, icon: '🎁' },
  { title: 'Volunteer Time', description: 'Share your skills and time to support our events.', available: true, icon: '🤝' },
];

export function DonatePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/heroes/donate_hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-shs-forest-900/80" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-6"
            >
              💚
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Support Our Mission
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Your contribution helps strengthen Secwépemc culture for future generations through land-based learning and youth mentorship.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#donate-form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30"
            >
              <FloatingIcon icon="🌟" size="sm" />
              Make a Gift Today
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section id="donate-form" className="py-20 bg-gradient-to-b from-shs-forest-900 via-shs-forest-800 to-shs-sand">
        <div className="max-w-md mx-auto px-4">
          <SectionReveal>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="text-center mb-8">
                <FloatingIcon icon="💰" size="lg" />
                <h2 className="text-2xl font-bold text-shs-forest-800 mt-4 mb-2">
                  Choose Your Gift
                </h2>
                <p className="text-shs-text-muted text-sm">
                  Every gift makes a difference in our community.
                </p>
              </div>
              
              {/* Amount buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['$25', '$50', '$100', '$250', '$500', 'Other'].map((amt, i) => (
                  <motion.button
                    key={amt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="py-3 px-4 rounded-xl bg-shs-forest-50 text-shs-forest-700 font-semibold hover:bg-shs-forest-100 border-2 border-transparent hover:border-shs-forest-300 transition-all"
                  >
                    {amt}
                  </motion.button>
                ))}
              </div>

              <GlowButton className="w-full">
                Donate Now
              </GlowButton>

              <p className="text-center text-xs text-gray-400 mt-4">
                Secure payment processing
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-semibold rounded-full mb-4"
              >
                <FloatingIcon icon="✨" size="sm" delay={0.5} />
                Your Impact
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-shs-forest-800 mb-4">
                How Your Gift Helps
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                Every contribution directly supports cultural preservation and youth development.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactExamples.map((item, index) => (
              <AnimatedCard key={item.amount} delay={index * 0.1} className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="text-5xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      {item.amount}
                    </div>
                    <p className="text-shs-text-body text-sm leading-relaxed">{item.impact}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="py-24 bg-gradient-to-br from-shs-forest-50 to-emerald-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-shs-forest-800 mb-4">
                Ways to Give
              </h2>
              <p className="text-lg text-shs-text-body">
                Multiple ways to support our community
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {waysToGive.map((way, index) => (
              <AnimatedCard 
                key={way.title} 
                delay={index * 0.1} 
                className={`p-6 ${way.comingSoon ? 'opacity-80' : ''}`}
                glass
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{way.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-shs-forest-800">{way.title}</h3>
                      {way.comingSoon ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          Coming Soon
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-shs-text-body text-sm mb-4">{way.description}</p>
                    {way.available && !way.comingSoon && (
                      <Link
                        to="/contact"
                        className="inline-flex items-center text-shs-forest-600 font-semibold text-sm hover:text-shs-forest-800 transition-colors group"
                      >
                        Learn more 
                        <motion.span 
                          className="ml-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                        >
                          →
                        </motion.span>
                      </Link>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Info Banner */}
      <SectionReveal>
        <section className="py-12 bg-gradient-to-r from-shs-forest-100 to-emerald-100 border-y border-shs-forest-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-shs-forest-700 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-2xl">📋</span>
              <strong>Tax Information:</strong> The Secwépemc Hunting Society is working toward charitable status. 
              Contact us for information about tax receipts.
            </p>
          </div>
        </section>
      </SectionReveal>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🌲</div>
          <div className="absolute bottom-10 right-10 text-9xl">🌿</div>
        </div>
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <FloatingIcon icon="💬" size="xl" />
            <h2 className="text-4xl font-extrabold mb-6 mt-4">
              Questions About Giving?
            </h2>
            <p className="text-xl text-shs-forest-200 mb-10">
              We're happy to discuss how your support can make the greatest impact.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
              >
                <span>Get in Touch</span>
                <span className="text-2xl">→</span>
              </Link>
            </motion.div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

export default DonatePage;
