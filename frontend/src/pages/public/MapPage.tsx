/**
 * MapPage - Interactive Territory Map Page
 * Showcases Secwepemcúl̓ecw territory with projects and cultural sites
 */
import { Link } from 'react-router-dom';
import { TerritoryMap } from '../../components/public/TerritoryMap';

export function MapPage() {
  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Header */}
      <section className="bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
                Explore Our Territory
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                Secwepemcúl̓ecw
              </h1>
              <p className="text-lg text-shs-forest-200 leading-relaxed">
                Discover the traditional lands of the Secwépemc people. Explore our cultural camps, 
                program sites, and partnerships across the territory.
              </p>
            </div>
            {/* Admin link for staff */}
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
          </div>
        </div>
      </section>

      {/* Map Container */}
      <section className="py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-shs-stone overflow-hidden">
            <div className="h-[70vh] min-h-[500px]">
              <TerritoryMap />
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Territory Info */}
            <div className="bg-white rounded-2xl p-6 border border-shs-stone shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-shs-forest-100 flex items-center justify-center text-2xl mb-4">
                🌲
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">
                The Territory
              </h3>
              <p className="text-sm text-shs-text-body leading-relaxed mb-4">
                Secwepemcúl̓ecw spans over 180,000 square kilometres in the interior of 
                British Columbia, encompassing diverse ecosystems from grasslands to alpine.
              </p>
              <Link 
                to="/about" 
                className="text-shs-forest-600 text-sm font-semibold hover:text-shs-forest-800 transition-colors"
              >
                Learn about our history →
              </Link>
            </div>

            {/* Active Programs */}
            <div className="bg-white rounded-2xl p-6 border border-shs-stone shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-shs-amber-100 flex items-center justify-center text-2xl mb-4">
                ⛺
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">
                Active Programs
              </h3>
              <p className="text-sm text-shs-text-body leading-relaxed mb-4">
                Our cultural camps and programs operate throughout the territory, 
                bringing communities together for land-based learning experiences.
              </p>
              <Link 
                to="/cultural-camps" 
                className="text-shs-forest-600 text-sm font-semibold hover:text-shs-forest-800 transition-colors"
              >
                View our camps →
              </Link>
            </div>

            {/* Partner Nations */}
            <div className="bg-white rounded-2xl p-6 border border-shs-stone shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-4">
                🤝
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">
                Partnerships
              </h3>
              <p className="text-sm text-shs-text-body leading-relaxed mb-4">
                We collaborate with Secwépemc communities, First Nations organizations, 
                and cultural partners to strengthen our collective impact.
              </p>
              <Link 
                to="/projects" 
                className="text-shs-forest-600 text-sm font-semibold hover:text-shs-forest-800 transition-colors"
              >
                See our projects →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Names Note */}
      <section className="py-8 bg-shs-forest-50 border-t border-shs-forest-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-shs-forest-700 italic">
            <strong>Note:</strong> This map shows an approximate representation of Secwepemcúl̓ecw. 
            Traditional territory boundaries are complex and we continue to work on incorporating 
            accurate cultural geography and Secwepemctsín place names.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-br from-shs-earth-100 to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Want to Visit?
          </h2>
          <p className="text-shs-text-body mb-8 max-w-xl mx-auto">
            Join us at an upcoming cultural camp or event to experience the land firsthand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors shadow-lg"
            >
              View Upcoming Events
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-shs-forest-700 font-semibold rounded-xl border-2 border-shs-forest-200 hover:border-shs-forest-300 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
