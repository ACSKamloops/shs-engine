/**
 * ComponentShowcase - Demo page for new curriculum components
 * 
 * Displays all 6 new premium components with sample data for testing.
 * Access at: /dev/components
 */
import { CkultnCompass } from '../../components/public/CkultnCompass';
import { VoiceCard } from '../../components/public/VoiceCard';
import { PlantCard } from '../../components/public/PlantCard';
import { SkillStep } from '../../components/public/SkillStep';
import { MorphologyBreakdown } from '../../components/public/MorphologyBreakdown';
import { MoonSelector } from '../../components/public/MoonSelector';

export function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-shs-cream py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-shs-forest-800 mb-2">
          Component Showcase
        </h1>
        <p className="text-shs-text-body mb-12">
          Premium curriculum components for the SHS Engine
        </p>

        {/* CkultnCompass */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">1</span>
            Cḱuĺtn Compass
          </h2>
          <div className="bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 rounded-3xl p-12 flex justify-center">
            <CkultnCompass size="lg" showLabels={true} />
          </div>
        </section>

        {/* VoiceCard */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">2</span>
            Voice Card (Elder Quotes)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VoiceCard
              quote="The land is our identity. We are inseparable from it—it is not just where we live, but who we are."
              speaker="Elder Mary Thomas"
              community="Neskonlith"
              theme="Land Connection"
              variant="default"
              hasAudio={true}
            />
            <VoiceCard
              quote="When we speak our language, we carry our ancestors with us."
              speaker="Dr. Marianne Ignace"
              community="Skeetchestn"
              variant="featured"
              hasAudio={true}
            />
          </div>
        </section>

        {/* PlantCard */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">3</span>
            Plant Card (Botanical Database)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlantCard
              secwepemcName="Sqemém̓c"
              englishName="Saskatoon Berry"
              scientificName="Amelanchier alnifolia"
              category="food"
              uses={['Fresh eating', 'Dried for winter storage', 'Mixed with meat for pemmican', 'Medicine for stomach ailments']}
              preparation="Berries can be dried on racks or mashed into cakes"
              seasonalAvailability={[6, 7, 8]}
              habitat="Dry hillsides, forest clearings"
            />
            <PlantCard
              secwepemcName="Yélemec"
              englishName="Bitterroot"
              scientificName="Lewisia rediviva"
              category="food"
              uses={['Roots boiled or roasted', 'Important trade item', 'Ceremonial significance']}
              seasonalAvailability={[4, 5, 6]}
            />
            <PlantCard
              secwepemcName="Tséktsek"
              englishName="Devil's Club"
              scientificName="Oplopanax horridus"
              category="medicine"
              uses={['Arthritis treatment', 'Diabetes management', 'Spiritual protection']}
              preparation="Bark and roots prepared as decoction"
              seasonalAvailability={[3, 4, 5, 6, 7, 8, 9, 10]}
            />
          </div>
        </section>

        {/* SkillStep */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">4</span>
            Skill Step (Practical Activities)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillStep
              stepNumber={1}
              title="Prepare the Fire Pit"
              description="Clear a safe area at least 3 meters in diameter. Remove all flammable debris and create a rock ring to contain the fire."
              duration="15 minutes"
              difficulty="beginner"
              materials={['Rocks', 'Shovel', 'Water bucket']}
              tips="Check local fire regulations before starting. Always have water nearby."
              safetyNote="Never leave a fire unattended. Ensure fully extinguished before leaving."
            />
            <SkillStep
              stepNumber={2}
              title="Gather Kindling"
              description="Collect dry twigs, small branches, and birch bark. Start with pencil-thick pieces and work up to thumb-thick branches."
              duration="20 minutes"
              difficulty="beginner"
              materials={['Birch bark', 'Dry twigs', 'Small branches']}
            />
          </div>
        </section>

        {/* MorphologyBreakdown */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">5</span>
            Morphology Breakdown
          </h2>
          <MorphologyBreakdown
            term="Secwepemcúl̓ecw"
            englishMeaning="Secwépemc Territory"
            parts={[
              { text: 'Secwepemc', type: 'root', meaning: 'Secwépemc people', details: 'Name of the nation' },
              { text: 'úl̓ecw', type: 'suffix', meaning: 'land/territory', details: 'Locative suffix indicating place/land belonging to' },
            ]}
            relatedTerms={[
              { term: 'Tk̓emlúps', meaning: 'Kamloops' },
              { term: 'Qw̓eqw̓íe', meaning: 'Bluebird' },
              { term: 'Stqetkwe', meaning: 'Adams Lake' },
            ]}
            notes="The suffix -úl̓ecw indicates territorial belonging and is common in Secwépemc place names."
          />
        </section>

        {/* MoonSelector */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-shs-forest-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600">6</span>
            Moon Selector
          </h2>
          <div className="bg-white rounded-2xl border border-shs-stone/30 p-6 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-shs-text-muted mb-4">Horizontal (default)</h3>
              <MoonSelector variant="horizontal" size="md" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-shs-text-muted mb-4">Dots (minimal)</h3>
              <MoonSelector variant="dots" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default ComponentShowcase;
