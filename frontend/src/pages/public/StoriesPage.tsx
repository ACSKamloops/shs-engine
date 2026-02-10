/**
 * StoriesPage - Sptékwles Re Qelmúcw (Modernized Jan 2026)
 * Features: Framer Motion, animated story cards, premium hero, scroll reveals
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCard, SectionReveal, FloatingIcon } from '../../components/ui/AnimatedComponents';
import { LawsSourceBadge } from '../../components/public/LawsAttribution';

// Import teaching stories data
import lawsStories from '../../data/stories/laws_stories.json';

// Story Card Component
function StoryCard({ story, index }: { story: typeof lawsStories.stories[0]; index: number }) {
  return (
    <AnimatedCard delay={index * 0.1} className="p-6" glass>
      <div className="flex items-start justify-between mb-4">
        <motion.span 
          className="text-4xl"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          📖
        </motion.span>
        <LawsSourceBadge />
      </div>
      <h3 className="text-xl font-bold text-shs-forest-800 mb-1">
        {story.titleEnglish}
      </h3>
      <p className="text-sm text-shs-forest-600 italic mb-4">
        {story.titleSecwepemc}
      </p>
      <p className="text-shs-text-body mb-6 leading-relaxed">
        {('legalTeaching' in story) ? (story as any).legalTeaching : (story as any).summary}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          {story.source?.chapter ? `Ch. ${story.source.chapter}` : ''}
        </span>
        {story.narrator && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            {story.narrator}
          </span>
        )}
      </div>
    </AnimatedCard>
  );
}

// Skill cards data
const skillCards = [
  { icon: '⚖️', skill: 'Oral Law', career: 'Lawyer, Mediator' },
  { icon: '📜', skill: 'Memory & Recitation', career: 'Archivist, Historian' },
  { icon: '🎭', skill: 'Performance', career: 'Educator, Broadcaster' },
];

export function StoriesPage() {
  const teachingStories = lawsStories.stories;

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">📚</div>
          <div className="absolute bottom-10 left-10 text-9xl">🪶</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            📖
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
          >
            Sptékwles Re Qelmúcw
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-shs-forest-200 mb-4 italic"
          >
            Stories of The People
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-shs-forest-300 max-w-2xl mx-auto"
          >
            Traditional teaching stories that transmit Secwépemc law, ecological knowledge, 
            and moral teachings through generations.
          </motion.p>
        </div>
      </section>

      {/* Teaching Stories Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="✨" size="sm" />
                Legal Teaching Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
                Stories That Teach Law
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                In Secwépemc tradition, stories are not just entertainment — they are legal precedents, 
                moral teachings, and ecological wisdom passed down through generations.
              </p>
            </div>
          </SectionReveal>

          {/* Story Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {teachingStories.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>

          {/* More Stories Coming */}
          <SectionReveal delay={0.2}>
            <AnimatedCard className="p-8 text-center" glass>
              <FloatingIcon icon="🔮" size="lg" />
              <h3 className="font-bold text-shs-forest-800 mt-4 mb-3 text-xl">
                More Stories Being Prepared
              </h3>
              <p className="text-shs-text-body mb-4 max-w-md mx-auto">
                We are carefully preparing additional stories from Elder oral histories, 
                ensuring accurate Secwepemctsín language and proper attribution.
              </p>
              <p className="text-sm text-shs-text-muted">
                Stories from: Ida William (Chu Chua), Nellie Taylor (Skeetchestn), 
                Lily Harry (Dog Creek), Alice Celesta, and other Elders.
              </p>
            </AnimatedCard>
          </SectionReveal>
        </div>
      </section>

      {/* Did You Know Section */}
      <section className="py-20 bg-gradient-to-br from-white to-shs-sand border-t border-shs-stone/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="💡" size="sm" />
                Horizon Expansion
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
                Did You Know?
              </h2>
              <p className="text-lg text-shs-text-body">
                Traditional storytelling transmits complex legal, ecological, and moral knowledge. 
                Youth who learn these skills develop abilities valuable in many fields.
              </p>
            </div>
          </SectionReveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {skillCards.map((item, index) => (
              <AnimatedCard key={item.skill} delay={index * 0.1} className="p-6 text-center" glass>
                <motion.span 
                  className="text-4xl block mb-3"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {item.icon}
                </motion.span>
                <h4 className="font-bold text-shs-forest-800 mb-1">{item.skill}</h4>
                <p className="text-sm text-amber-600 font-medium">→ {item.career}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Attribution Section */}
      <SectionReveal>
        <section className="py-12 bg-gradient-to-r from-shs-forest-50 to-emerald-50 border-t border-shs-forest-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="font-bold text-shs-forest-800 mb-4 text-lg">Story Sources</h3>
            <p className="text-shs-text-body mb-6">
              Teaching stories are documented in <strong>Secwépemc Laws 2023</strong> 
              and SCES Elder Archives. Used with respect and proper attribution.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['SNTC/ILRU Laws 2023', 'SCES Elder Archive', 'Elder Oral Histories'].map((source) => (
                <motion.span 
                  key={source}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone shadow-sm"
                >
                  {source}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">📚</div>
          <div className="absolute bottom-10 right-10 text-9xl">⚖️</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <FloatingIcon icon="🔍" size="xl" />
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-6">
              Explore Related Resources
            </h2>
            <p className="text-xl text-shs-forest-200 mb-10">
              Discover more about Secwépemc legal traditions and language.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/laws"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
                >
                  Legal Reference →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Legal Traditions Module 📚
                </Link>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

export default StoriesPage;
