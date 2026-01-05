/**
 * DonatePage - Donation Portal with PayPal Integration
 * Features amount selection and PayPal payments
 */
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';
import { DonateForm } from '../../components/public/DonateForm';

// Donation impact examples
const impactExamples = [
  {
    amount: '$25',
    impact: 'Provides supplies for one youth participant at a cultural camp',
    icon: '🎒',
  },
  {
    amount: '$50',
    impact: 'Covers transportation for an Elder to share teachings',
    icon: '🚗',
  },
  {
    amount: '$100',
    impact: 'Supplies traditional tools and materials for a workshop',
    icon: '🏹',
  },
  {
    amount: '$250',
    impact: 'Sponsors a youth for an entire week-long cultural camp',
    icon: '⛺',
  },
  {
    amount: '$500',
    impact: 'Funds recording and preservation of Elder knowledge',
    icon: '📚',
  },
  {
    amount: '$1000+',
    impact: 'Supports a full program day including meals and instruction',
    icon: '🌲',
  },
];

// Ways to give
const waysToGive = [
  {
    title: 'One-Time Donation',
    description: 'Make a single contribution to support our programs.',
    available: true,
    comingSoon: false,
  },
  {
    title: 'Monthly Giving',
    description: 'Become a sustaining supporter with recurring donations.',
    available: false,
    comingSoon: true,
  },
  {
    title: 'In-Kind Donations',
    description: 'Donate supplies, equipment, or materials for our camps.',
    available: true,
    comingSoon: false,
  },
  {
    title: 'Volunteer Time',
    description: 'Share your skills and time to support our events.',
    available: true,
    comingSoon: false,
  },
];

export function DonatePage() {
  return (
    <div>
      {/* Hero */}
      <Hero
        headline="Support Our Mission"
        subheadline="Your contribution helps strengthen Secwépemc culture for future generations through land-based learning and youth mentorship."
        size="medium"
      />

      {/* Main Content */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Donation Form */}
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-shs-stone p-8 shadow-lg mb-16">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-shs-forest-800 mb-2">
                Make a Donation
              </h2>
              <p className="text-shs-text-muted text-sm">
                Every gift makes a difference in our community.
              </p>
            </div>
            <DonateForm 
              onSuccess={(details) => {
                console.log('Donation completed:', details);
              }}
            />
          </div>

          {/* Impact Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
                Your Impact
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
                How Your Gift Helps
              </h2>
              <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
                Every contribution, no matter the size, directly supports cultural preservation and youth development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactExamples.map((item) => (
                <div
                  key={item.amount}
                  className="bg-white rounded-2xl p-6 border border-shs-stone hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{item.icon}</div>
                    <div>
                      <div className="text-2xl font-bold text-shs-forest-700 mb-1">{item.amount}</div>
                      <p className="text-shs-text-body text-sm">{item.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ways to Give */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-shs-forest-800 mb-4">
                Ways to Give
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {waysToGive.map((way) => (
                <div
                  key={way.title}
                  className={`bg-white rounded-2xl p-6 border ${
                    way.available ? 'border-shs-forest-200' : 'border-shs-stone'
                  } ${way.comingSoon ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-shs-forest-800">{way.title}</h3>
                    {way.comingSoon && (
                      <span className="px-2.5 py-1 bg-shs-amber-100 text-shs-amber-700 text-xs font-semibold rounded-full">
                        Coming Soon
                      </span>
                    )}
                    {way.available && !way.comingSoon && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-shs-text-body text-sm mb-4">{way.description}</p>
                  {way.available && !way.comingSoon && (
                    <Link
                      to="/contact"
                      className="text-shs-forest-600 font-semibold text-sm hover:text-shs-forest-800 transition-colors"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tax Receipt Info */}
      <section className="py-12 bg-shs-forest-50 border-y border-shs-forest-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-shs-forest-700">
            <strong>Tax Information:</strong> The Secwépemc Hunting Society is working toward charitable status. 
            Please contact us for current information about tax receipts and donation acknowledgements.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-6">
            Questions About Giving?
          </h2>
          <p className="text-lg text-shs-forest-200 mb-8">
            We're happy to discuss how your support can make the greatest impact for our community.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
