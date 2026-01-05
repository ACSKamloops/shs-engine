/**
 * PhraseBrowserPage - Secwepemctsín Phrase Books
 * Coming Soon - Content being verified for quality
 */
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';

export function PhraseBrowserPage() {
  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Secwepemctsín Phrase Books"
        subheadline="Practical phrases for daily use across three dialects — Eastern, Western, and Northern Secwepemctsín."
        size="medium"
      />

      {/* Coming Soon Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-shs-stone">
            <span className="text-6xl mb-6 block">💬</span>
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Phrase Books Coming Soon
            </h2>
            <p className="text-shs-text-body mb-6 max-w-lg mx-auto">
              We are verifying our phrase book collection to ensure accurate 
              Secwepemctsín language representation across all dialects.
            </p>
            <div className="bg-shs-forest-50 rounded-xl p-6 mb-8 border border-shs-forest-100">
              <h3 className="font-semibold text-shs-forest-800 mb-3">What's Being Prepared</h3>
              <ul className="text-sm text-shs-text-body space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-shs-amber-500">•</span>
                  <span>440 phrases across 3 dialects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-amber-500">•</span>
                  <span>Eastern, Western, and Northern variations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-amber-500">•</span>
                  <span>19 categories (Family, Health, Directions, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-amber-500">•</span>
                  <span>Quality verification by language experts</span>
                </li>
              </ul>
            </div>
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
            While we verify the phrase books, explore our gold-standard verified dictionary.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link
              to="/dictionary"
              className="bg-white rounded-xl p-6 border border-shs-stone hover:shadow-md transition-all text-left"
            >
              <span className="text-3xl">📚</span>
              <h3 className="font-bold text-shs-forest-800 mt-3">Dictionary</h3>
              <p className="text-sm text-shs-text-muted">12,690 verified words</p>
            </Link>
            <Link
              to="/language"
              className="bg-white rounded-xl p-6 border border-shs-stone hover:shadow-md transition-all text-left"
            >
              <span className="text-3xl">🎯</span>
              <h3 className="font-bold text-shs-forest-800 mt-3">Language Hub</h3>
              <p className="text-sm text-shs-text-muted">Games & daily challenges</p>
            </Link>
          </div>
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
          <Link
            to="/dictionary"
            className="inline-block px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
          >
            Browse Dictionary
          </Link>
        </div>
      </section>
    </div>
  );
}

export default PhraseBrowserPage;
