/**
 * StewardshipPage - Secwépemc Territory Stewardship
 * Showcases the "Walking on Two Legs" philosophy and the Elephant Hill recovery.
 */
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';

export function StewardshipPage() {
  return (
    <div className="bg-shs-sand min-h-screen">
      {/* Hero */}
      <Hero
        headline="Walking on Two Legs: Collaborative Stewardship"
        subheadline="Honoring Secwépemc ecological knowledge and holistic resilience through leadership and territory management."
        primaryCta={{ label: 'Our Projects', to: '/projects' }}
        size="medium"
      />

      {/* Philosophy Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-6">
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
                  <strong className="text-shs-forest-700">Secwepemcúl̓ecw</strong> as a living web of relations 
                  where we have inherent responsibilities to care for all human and more-than-human kin.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-shs-forest-200 to-shs-earth-200 overflow-hidden shadow-2xl flex items-center justify-center text-shs-forest-400">
                <svg className="w-24 h-24 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-shs-amber-100 rounded-2xl -z-10 -rotate-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Elephant Hill Case Study */}
      <section className="py-20 md:py-28 bg-shs-forest-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="text-xl font-bold mb-3">Joint Governance</h3>
              <p className="text-shs-forest-300 text-sm leading-relaxed">
                Implementation of the Joint Leadership Council (JLC), ensuring Secwépemc Chiefs have final authority 
                on all land-based decisions alongside provincial managers.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-3">Fireguard Rehab</h3>
              <p className="text-shs-forest-300 text-sm leading-relaxed">
                100% completion of fireguard rehabilitation using native seed mixes and protocols that prioritize 
                riparian zones and wildlife corridors over loop-road convenience.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-3xl mb-4">🏺</div>
              <h3 className="text-xl font-bold mb-3">Archaeology</h3>
              <p className="text-shs-forest-300 text-sm leading-relaxed">
                Documentation of 218 new cultural sites, validating ancient presence 
                and informing stewardship priorities through Secwépemc-led field surveys.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
            <p className="text-shs-forest-200 italic text-lg leading-relaxed">
              "The relationships formed 'on the land' during the recovery were more durable 
              than the institutional mandates they served under."
            </p>
          </div>
        </div>
      </section>

      {/* Legal Narratives (Case Studies) */}
      <section className="py-20 md:py-28 bg-shs-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Law in Action
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
              Secwépemc Legal Narratives
            </h2>
            <p className="text-lg text-shs-text-body max-w-2xl mx-auto">
              Our oral traditions (*stsptekwll*) serve as primary legal texts, illustrating the application of law through history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Case 1: Proportionality */}
            <div className="bg-white rounded-3xl p-8 border border-shs-stone shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-shs-forest-50 flex items-center justify-center text-xl">🦫</div>
                <h3 className="text-xl font-bold text-shs-forest-800">Beaver & Porcupine</h3>
              </div>
              <p className="text-shs-text-body text-sm leading-relaxed mb-6">
                When Porcupine repeatedly stole Beaver’s food, Beaver responded with proportional interventions—first moving away, and only using separation as a last resort.
              </p>
              <div className="pt-4 border-t border-shs-stone flex items-center justify-between">
                <span className="text-xs font-bold text-shs-forest-600 uppercase">Principle</span>
                <span className="text-sm text-shs-forest-700 font-medium">Proportionality & Obligation</span>
              </div>
            </div>

            {/* Case 2: Community Safety */}
            <div className="bg-white rounded-3xl p-8 border border-shs-stone shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-shs-forest-50 flex items-center justify-center text-xl">🦊</div>
                <h3 className="text-xl font-bold text-shs-forest-800">Coyote & the Cannibal Boy</h3>
              </div>
              <p className="text-shs-text-body text-sm leading-relaxed mb-6">
                Coyote brought a stranger into the community for personal gain without vetting him. The community responded by asserting that collective safety overrides individual desire.
              </p>
              <div className="pt-4 border-t border-shs-stone flex items-center justify-between">
                <span className="text-xs font-bold text-shs-forest-600 uppercase">Principle</span>
                <span className="text-sm text-shs-forest-700 font-medium">Collective Responsibility</span>
              </div>
            </div>

            {/* Case 3: Sovereignty in Marriage */}
            <div className="bg-white rounded-3xl p-8 border border-shs-stone shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-shs-forest-50 flex items-center justify-center text-xl">🦌</div>
                <h3 className="text-xl font-bold text-shs-forest-800">Dirty-Lad & his Elk Wives</h3>
              </div>
              <p className="text-shs-text-body text-sm leading-relaxed mb-6">
                When an agreement was broken, the marriage was severed, illustrating that all treaties and relations are conditional on mutual respect of terms.
              </p>
              <div className="pt-4 border-t border-shs-stone flex items-center justify-between">
                <span className="text-xs font-bold text-shs-forest-600 uppercase">Principle</span>
                <span className="text-sm text-shs-forest-700 font-medium">Treaty Integrity</span>
              </div>
            </div>

            {/* Case 4: Rehabilitation */}
            <div className="bg-white rounded-3xl p-8 border border-shs-stone shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-shs-forest-50 flex items-center justify-center text-xl">🐟</div>
                <h3 className="text-xl font-bold text-shs-forest-800">The Sucker Story</h3>
              </div>
              <p className="text-shs-text-body text-sm leading-relaxed mb-6">
                The entire community contributed to rebuilding Sucker after an injury, showing that shared obligation to help remains even if the harm was self-inflicted.
              </p>
              <div className="pt-4 border-t border-shs-stone flex items-center justify-between">
                <span className="text-xs font-bold text-shs-forest-600 uppercase">Principle</span>
                <span className="text-sm text-shs-forest-700 font-medium">Restorative Justice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stewardship Principles */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
              Collaborative Stewardship
            </h2>
            <p className="text-lg text-shs-text-body max-w-7xl mx-auto">
              We work in partnership with diverse organizations to apply Secwépemc ecological values to modern land management.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-shs-forest-100 rounded-2xl flex items-center justify-center text-shs-forest-600 mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Technical Guardianship</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">Building long-term capacity for Secwépemc careers in forestry, archaeology, and ecological monitoring.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-shs-amber-100 rounded-2xl flex items-center justify-center text-shs-amber-600 mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Relational Accountability</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">Shifting from 'service delivery' to the fulfillment of mandatory kinship responsibilities to the land.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-shs-earth-100 rounded-2xl flex items-center justify-center text-shs-earth-600 mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Narrative Revitalization</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">Positioning youth as creators of digital media and guardians of Secwépemcúl̓ecw land data.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-shs-sand rounded-2xl flex items-center justify-center text-shs-forest-600 mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-2">Landscape Continuity</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">Moving beyond single-focus management toward holistic, multi-generational ecological resilience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Technology - From SCES Cultural Series */}
      <section className="py-16 md:py-24 bg-shs-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tools */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-3">Tool Making</h3>
              <ul className="space-y-2 text-sm text-shs-text-body">
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Knife:</strong> Basalt stone flaked to sharp edge, wood handle wrapped in buckskin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Arrow Flaker:</strong> Deer antler for sharpening stone tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Bark Peeler:</strong> Wood or caribou antler for removing tree bark</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Thread:</strong> Braided from Indian hemp, nettle, or elaegnus bark</span>
                </li>
              </ul>
            </div>

            {/* Fishing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🐟</div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-3">Fishing Technology</h3>
              <ul className="space-y-2 text-sm text-shs-text-body">
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Fish Spear (Ts'ewén):</strong> Deer antler prongs on fir handle, lashed with hemp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Fish Weir (Stséwc):</strong> Poles and twigs lashed together to trap fish</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Dip Net:</strong> Indian hemp bark netting on wooden frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Canoe:</strong> Spruce or pine bark sewn with split willow root</span>
                </li>
              </ul>
            </div>

            {/* Homes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="text-lg font-bold text-shs-forest-800 mb-3">Traditional Homes</h3>
              <ul className="space-y-2 text-sm text-shs-text-body">
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Pit House (C7ístken):</strong> Underground winter dwelling with ladder entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Sweat House (S'istken):</strong> Bent willow covered with bark and earth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Mat Lodge:</strong> Tule and rush mats over conical pole frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-shs-forest-500">•</span>
                  <span><strong>Hunting Lodge:</strong> Round or square, covered with mats or bark</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-shs-text-muted mt-8">
            Source: SCES Cultural Series Book 5 - Technology of the Shuswap (1986)
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-shs-forest-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-6">Want to Partner on Stewardship?</h2>
          <p className="text-shs-forest-200 mb-10 text-lg">
            We collaborate with technical teams, government agencies, and community members to protect our territory.
          </p>
          <Link
            to="/contact"
            className="px-8 py-4 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
          >
            Connect With Our Team
          </Link>
        </div>
      </section>
    </div>
  );
}
