/**
 * StoriesPage - Sptékwles Re Qelmúcw (Stories of The People)
 * Teaching stories from Secwépemc legal traditions with proper attribution
 */
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';
import { LawsSourceBadge } from '../../components/public/LawsAttribution';

// Import teaching stories data
import lawsStories from '../../data/stories/laws_stories.json';

// Story Card Component
function StoryCard({ story }: { story: typeof lawsStories.stories[0] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-shs-stone hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">📖</span>
        <LawsSourceBadge />
      </div>
      <h3 className="text-lg font-bold text-shs-forest-800 mb-1">
        {story.title_english}
      </h3>
      <p className="text-sm text-shs-forest-600 italic mb-3">
        {story.title_secwepemc}
      </p>
      <p className="text-sm text-shs-text-body mb-4">
        {story.legal_teaching}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-shs-forest-50 text-shs-forest-700 text-xs rounded-full">
          {story.source}
        </span>
        {story.storyteller && (
          <span className="px-2 py-1 bg-shs-amber-50 text-shs-amber-700 text-xs rounded-full">
            {story.storyteller}
          </span>
        )}
      </div>
    </div>
  );
}

export function StoriesPage() {
  const teachingStories = lawsStories.stories;

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Sptékwles Re Qelmúcw"
        subheadline="Stories of The People — Traditional teaching stories that transmit Secwépemc law, ecological knowledge, and moral teachings through generations."
        size="medium"
      />

      {/* Teaching Stories Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Legal Teaching Stories
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Stories That Teach Law
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              In Secwépemc tradition, stories are not just entertainment — they are legal precedents, 
              moral teachings, and ecological wisdom passed down through generations.
            </p>
          </div>

          {/* Story Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {teachingStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* More Stories Coming */}
          <div className="bg-shs-sand rounded-2xl p-8 text-center border border-shs-stone">
            <span className="text-4xl mb-4 block">🔮</span>
            <h3 className="font-bold text-shs-forest-800 mb-2">More Stories Being Prepared</h3>
            <p className="text-sm text-shs-text-body mb-4 max-w-md mx-auto">
              We are carefully preparing additional stories from Elder oral histories, 
              ensuring accurate Secwepemctsín language and proper attribution.
            </p>
            <p className="text-xs text-shs-text-muted">
              Stories from: Ida William (Chu Chua), Nellie Taylor (Skeetchestn), 
              Lily Harry (Dog Creek), Alice Celesta, and other Elders.
            </p>
          </div>
        </div>
      </section>

      {/* Did You Know Section */}
      <section className="py-16 bg-white border-t border-shs-stone">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
            Horizon Expansion
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Did You Know?
          </h2>
          <p className="text-shs-text-body mb-8">
            Traditional storytelling transmits complex legal, ecological, and moral knowledge. 
            Youth who learn these skills develop abilities valuable in many fields.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '⚖️', skill: 'Oral Law', career: 'Lawyer, Mediator' },
              { icon: '📜', skill: 'Memory & Recitation', career: 'Archivist, Historian' },
              { icon: '🎭', skill: 'Performance', career: 'Educator, Broadcaster' },
            ].map((item) => (
              <div key={item.skill} className="bg-shs-sand rounded-xl p-4 border border-shs-stone">
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-bold text-shs-forest-800 mt-2">{item.skill}</h4>
                <p className="text-xs text-shs-amber-600">→ {item.career}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attribution Section */}
      <section className="py-12 bg-shs-forest-50 border-t border-shs-stone/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-bold text-shs-forest-800 mb-4">Story Sources</h3>
          <p className="text-sm text-shs-text-body mb-4">
            Teaching stories are documented in <strong>Secwépemc Laws 2023</strong> 
            and SCES Elder Archives. Used with respect and proper attribution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              SNTC/ILRU Laws 2023
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              SCES Elder Archive
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              Elder Oral Histories
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Explore Related Resources
          </h2>
          <p className="text-shs-forest-200 mb-8">
            Discover more about Secwépemc legal traditions and language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/laws"
              className="px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
            >
              Legal Reference
            </Link>
            <Link
              to="/curriculum"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Legal Traditions Module
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoriesPage;
