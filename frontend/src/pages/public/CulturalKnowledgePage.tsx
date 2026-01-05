/**
 * CulturalKnowledgePage - Cultural Series Library
 * Coming Soon - Content being verified for quality
 */
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';

export function CulturalKnowledgePage() {
  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Secwépemc Cultural Knowledge"
        subheadline="Explore the 10-volume Secwépemc Cultural Series — a comprehensive library of traditional knowledge, history, and practices."
        size="medium"
      />

      {/* Coming Soon Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-shs-stone">
            <span className="text-6xl mb-6 block">📚</span>
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Cultural Library Coming Soon
            </h2>
            <p className="text-shs-text-body mb-6 max-w-lg mx-auto">
              We are preparing our digital Cultural Series library with verified 
              content from the SCES 10-volume collection.
            </p>
            <div className="bg-shs-forest-50 rounded-xl p-6 mb-8 border border-shs-forest-100">
              <h3 className="font-semibold text-shs-forest-800 mb-3">Collection Preview</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-shs-text-body text-left max-w-md mx-auto">
                <div>• Introduction to Shuswap</div>
                <div>• Foods of Shuswap</div>
                <div>• Shuswap Homes</div>
                <div>• Clothing & Adornment</div>
                <div>• Technology</div>
                <div>• Traditional Games</div>
                <div>• Songs & Dances</div>
                <div>• A Century of Change</div>
                <div>• First 100 Years</div>
                <div>• The Things We Do</div>
              </div>
            </div>
            <p className="text-sm text-shs-text-muted">
              Content quality verification in progress
            </p>
          </div>
        </div>
      </section>

      {/* Available Now Section */}
      <section className="py-16 bg-shs-sand border-t border-shs-stone">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Available Now
          </h2>
          <p className="text-shs-text-body mb-8">
            While we verify the cultural content, explore our gold-standard verified dictionary.
          </p>
          <Link
            to="/dictionary"
            className="inline-block bg-white rounded-xl p-6 border border-shs-stone hover:shadow-md transition-all text-left max-w-xs mx-auto"
          >
            <span className="text-3xl">📚</span>
            <h3 className="font-bold text-shs-forest-800 mt-3">Secwepemctsín Dictionary</h3>
            <p className="text-sm text-shs-text-muted">12,690 verified words</p>
            <p className="text-xs text-shs-amber-600 mt-2">Gold Standard Verified ✓</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Explore Verified Language Resources
          </h2>
          <p className="text-shs-forest-200 mb-8">
            Our gold-standard dictionary is verified and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dictionary"
              className="px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
            >
              Browse Dictionary
            </Link>
            <Link
              to="/language"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Language Hub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CulturalKnowledgePage;
