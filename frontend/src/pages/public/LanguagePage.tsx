/**
 * LanguagePage - Secwepemctsin Language Learning
 * Enhanced with curriculum structure from Secwepemctsin Book 1 (2021)
 * and vocabulary from Secwépemc Law Book Glossary (2018)
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';
import { FlipCard } from '../../components/public/FlipCard';
import { WordMatchGame } from '../../components/public/WordMatchGame';
import { DailyChallenge } from '../../components/public/DailyChallenge';
import thematicVocab from '../../data/thematic_vocabulary.json';
import dictionaryData from '../../data/dictionary_gold_standard.json';

// Animation hook
function useIntersectionObserver() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsIntersecting(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Word of the Day - Get the daily word for today from the data
const wordOfTheDay = (() => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, part, idx) => acc + (parseInt(part) * (idx + 1)), 0);
  const words = dictionaryData.words;
  const word = words[seed % words.length];
  return {
    word: word.word,
    pronunciation: word.pronunciation,
    meaning: word.meaning,
    usage: 'Secwépemctsín is the language of the land.',
    source: 'Authoritative Gold Standard',
    category: 'daily',
  };
})();

// Mapping themes to UI metadata
const themeMetadata: Record<string, { theme: string, description: string, icon: string }> = {
  wildlife: {
    theme: '🦌 Wildlife & Hunting',
    description: 'Animals of the territory and hunting vocabulary',
    icon: '🦌',
  },
  land: {
    theme: '🌲 Land & Territory',
    description: 'Places, plants, and navigation across Secwepemcúl̓ecw',
    icon: '🌲',
  },
  food: {
    theme: '🍖 Traditional Foods',
    description: 'Foods from the land - berries, roots, and game',
    icon: '🍖',
  },
  community: {
    theme: '👨‍👩‍👧 Community & Teaching',
    description: 'Family, elders, and passing on knowledge',
    icon: '👨‍👩‍👧',
  },
  numbers: {
    theme: '🔢 Numbers & Counting',
    description: 'Counting game and tracking harvests',
    icon: '🔢',
  }
};

interface ThemeCollection {
  theme: string;
  description: string;
  icon: string;
  words: Array<{ word: string; pronunciation: string; meaning: string }>;
}

// Merging data with metadata
const vocabularyByTheme = Object.keys(thematicVocab).reduce((acc, key) => {
  const k = key as keyof typeof thematicVocab;
  if (themeMetadata[k]) {
    acc[k] = {
      ...themeMetadata[k],
      words: thematicVocab[k]
    };
  }
  return acc;
}, {} as Record<string, ThemeCollection>);

// Territory place names with meanings
const placeNames = [
  { 
    english: 'Kamloops', 
    secwepemctsin: 'Tk̓emlúps', 
    pronunciation: 'TKEM-loops',
    meaning: 'Meeting of the waters',
  },
  { 
    english: 'Adams Lake', 
    secwepemctsin: 'Sexqeltqín', 
    pronunciation: 'sex-KELT-keen',
    meaning: 'Where the creek comes out',
  },
  { 
    english: 'Chase', 
    secwepemctsin: 'Tsq̓escen̓', 
    pronunciation: 'TSKES-ken',
    meaning: 'Crossing place',
  },
  { 
    english: 'Shuswap Lake', 
    secwepemctsin: 'Secwépemc te Qelmúcw', 
    pronunciation: 'se-KWEP-emc teh KEL-mooch',
    meaning: 'Lake of the Secwépemc people',
  },
  { 
    english: 'Salmon Arm', 
    secwepemctsin: 'Smelqmíx', 
    pronunciation: 'SMELK-mix',
    meaning: 'People of the narrows',
  },
  { 
    english: 'Williams Lake', 
    secwepemctsin: 'T̓exelc', 
    pronunciation: 'TEX-elc',
    meaning: 'Place of gathering',
  },
  { 
    english: 'Simpcw (North Thompson)', 
    secwepemctsin: 'Simpcw', 
    pronunciation: 'SIMP-kw',
    meaning: 'People of the river',
  },
  { 
    english: 'Skeetchestn', 
    secwepemctsin: 'Skeetchestn', 
    pronunciation: 'SKEE-chet-stn',
    meaning: 'Place of many people',
  },
];

// Learning resources with source documentation
const learningResources = [
  {
    title: 'Wuméc r Cqweqwelútn-kt',
    description: 'Intergenerational Secwepemctsín learning. 3-level fluency model with Elder-led classes and immersion camps.',
    type: 'Primary Partner',
    icon: '🌲',
    url: 'https://wumec.org',
    featured: true,
  },
  {
    title: 'Thompson Rivers University',
    description: 'FNLG courses: Secwépemc language courses on campus with cultural context.',
    type: 'University',
    icon: '🎓',
    url: 'https://www.tru.ca',
  },
  {
    title: 'FirstVoices',
    description: 'Online platform for Indigenous language learning, keywords, phrases, songs, and stories.',
    type: 'Platform',
    icon: '🎧',
    url: 'https://www.firstvoices.com',
  },
  {
    title: 'First Peoples\' Cultural Council',
    description: 'BC-wide organization supporting Indigenous language revitalization and resources.',
    type: 'Organization',
    icon: '🔗',
    url: 'https://fpcc.ca',
  },
  {
    title: 'Chief Atahm School',
    description: 'Secwépemc immersion school for children, rediscovering identity through language.',
    type: 'School',
    icon: '🏫',
    url: 'https://www.chiefatahm.com',
  },
  {
    title: 'Secwepemctsin Book 1',
    description: '26-lesson curriculum (Paul Creek Language Association). Materials provided by Wuméc.',
    type: 'Curriculum',
    icon: '📚',
    source: 'via Wuméc',
  },
];

// Cultural Skills from SCES Elder Memories Archive
const culturalSkills = [
  {
    title: 'Berry Harvesting',
    secwepemc: 'Qwléwem te speqpéq',
    icon: '🫐',
    description: 'Learn to identify and harvest saskatoon berries using respectful traditional practices.',
    skills: ['Plant identification', 'Harvesting techniques', 'Preservation methods', 'Taking only what is needed'],
    vocabulary: [
      { word: 'speqpéq7', meaning: 'saskatoon berries' },
      { word: 'qwléwem', meaning: 'picking/gathering' },
    ],
  },
  {
    title: 'Traditional Fishing',
    secwepemc: 'Wéwlem',
    icon: '🐟',
    description: 'Traditional salmon fishing techniques passed down through generations.',
    skills: ['Salmon identification', 'Spear fishing', 'Fish preparation', 'Smoking and preservation'],
    vocabulary: [
      { word: 'stselkék', meaning: 'salmon' },
      { word: 'wéwlem', meaning: 'fishing' },
      { word: 'ts\'ewén', meaning: 'fish spear' },
    ],
  },
  {
    title: 'Fire Making',
    secwepemc: 'Yéqwetem',
    icon: '🔥',
    description: 'Traditional fire drill technique using saskatoon wood and natural materials.',
    skills: ['Fire drill construction', 'Tinder preparation', 'Safety protocols'],
    vocabulary: [
      { word: 'pell', meaning: 'fire' },
      { word: 'yéqwetem', meaning: 'making fire' },
    ],
  },
  {
    title: 'Traditional Cooking',
    secwepemc: 'Kweltsentsiit',
    icon: '🍖',
    description: 'Learn traditional food preparation including bannock making and earth oven cooking.',
    skills: ['Bannock preparation', 'Earth oven construction', 'Meat smoking'],
    vocabulary: [
      { word: 'tiqw', meaning: 'bannock/bread' },
      { word: 'sqílye', meaning: 'meat' },
      { word: 'kweltsentsiit', meaning: 'cooking' },
    ],
  },
];

// Children's Reader Bilingual Sentences - From SCES Secwepemctsin Children's Reader (1998)
const childrenReaderSentences = [
  {
    secwepemc: "Me7 nes-kt te ckwénllgten tek me7 kwénll-qt.",
    english: "We will go to the garden to plant a vegetable garden.",
    theme: "gardening",
  },
  {
    secwepemc: "Me7 illentem re stékle-kt e crepqines.",
    english: "We will eat our lunch at noon.",
    theme: "food",
  },
  {
    secwepemc: "E wi7stem re s7élkst-kt, me7 nes-kt ne tswec tek me7 ipsem-kt.",
    english: "When we finish our chores, we will go to the creek to fish.",
    theme: "fishing",
  },
  {
    secwepemc: "E kwenwéllen-kt tek swewll me7 qwlentém, le7 ri7 te s7illen.",
    english: "If we catch a fish we can bake it, it's very good food.",
    theme: "fishing",
  },
  {
    secwepemc: "Ta7 me7 sllépentem e smetém re pus.",
    english: "We will not forget to feed the cat.",
    theme: "animals",
  },
  {
    secwepemc: "Me7 ctsuts'éwem-kt, enwi7 me7 c7épem.",
    english: "We will wash the dishes, you can wipe the dishes.",
    theme: "chores",
  },
  {
    secwepemc: "Re stsmémelt ec séyus ntskempéllew.",
    english: "The children play outdoors.",
    theme: "play",
  },
  {
    secwepemc: "Sécwem-ce, ta7us k sllépenc re ts'éwsten.",
    english: "Take a bath, don't forget the soap.",
    theme: "hygiene",
  },
  {
    secwepemc: "Me7 qweltéltcwtem re stsmémelt.",
    english: "We will read to the children.",
    theme: "learning",
  },
  {
    secwepemc: "Me7 lexéyentem re kenkéknem.",
    english: "We will tell all about the bears.",
    theme: "stories",
  },
];

// Traditional Games from SCES Cultural Series
const traditionalGames = [
  {
    name: 'Cat\'s Cradle',
    icon: '🧵',
    players: '1-2',
    difficulty: 'Easy',
    description: 'String game making traditional figures like teepee, eagle, and sturgeon.',
    equipment: ['String or twine'],
  },
  {
    name: 'Ring and Dart',
    icon: '🎯',
    players: 'Teams',
    difficulty: 'Easy',
    description: 'Roll a ring between players while others throw darts to knock it over.',
    equipment: ['10cm ring (reeds/bark)', 'Wood darts'],
  },
  {
    name: 'Lacrosse',
    icon: '🥍',
    players: 'Teams',
    difficulty: 'Medium',
    description: 'Score goals using curved sticks and feet only - no hands allowed!',
    equipment: ['Curved sticks', 'Ball', 'Goals'],
  },
  {
    name: 'Tug of War',
    icon: '🪢',
    players: 'Teams',
    difficulty: 'Easy',
    description: 'Traditional strength contest between teams.',
    equipment: ['Strong rope'],
  },
  {
    name: 'Foot Races',
    icon: '🏃',
    players: '2+',
    difficulty: 'Easy',
    description: 'Short or long distance races - historically up to 15 kilometers!',
    equipment: ['None'],
  },
  {
    name: 'Swimming Races',
    icon: '🏊',
    players: '2+',
    difficulty: 'Easy',
    description: 'Distance or speed swimming contests in lakes and rivers.',
    equipment: ['Water access'],
  },
  {
    name: 'Lehal (Bone Game)',
    icon: '🎲',
    players: 'Teams',
    difficulty: 'Advanced',
    description: 'Guessing game with bones hidden in hands, accompanied by singing and drumming.',
    equipment: ['Bones', 'Counting sticks', 'Drum'],
  },
  {
    name: 'Shinny',
    icon: '🏒',
    players: 'Teams',
    difficulty: 'Medium',
    description: 'Hockey-like game played on ice or ground with curved sticks.',
    equipment: ['Curved sticks', 'Ball or puck'],
  },
  {
    name: 'Snow Snake',
    icon: '❄️',
    players: '2+',
    difficulty: 'Easy',
    description: 'Throwing polished sticks to slide the farthest on snow.',
    equipment: ['Polished wood sticks'],
  },
  {
    name: 'Hoop and Pole',
    icon: '⭕',
    players: '2+',
    difficulty: 'Medium',
    description: 'Rolling hoops and throwing poles through them. Tests accuracy and timing.',
    equipment: ['Hoop', 'Poles'],
  },
];

export function LanguagePage() {
  const curriculumSection = useIntersectionObserver();
  const placesSection = useIntersectionObserver();
  const [selectedCategory, setSelectedCategory] = useState<string>('wildlife');
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  const currentVocab = vocabularyByTheme[selectedCategory as keyof typeof vocabularyByTheme];

  const toggleTheme = (key: string) => {
    setExpandedTheme(expandedTheme === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Secwepemctsín"
        subheadline="Learn the language of the Secwépemc people. Every word spoken keeps our culture alive for future generations."
        size="medium"
      />

      {/* Word of the Day - Featuring Stewardship */}
      <section className="py-12 bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white -mt-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-4">
              Word of the Day
            </span>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                {wordOfTheDay.word}
              </h2>
              <p className="text-lg text-shs-forest-200 mb-2">
                /{wordOfTheDay.pronunciation}/
              </p>
              <p className="text-2xl md:text-3xl text-shs-amber-300 font-semibold mb-4">
                {wordOfTheDay.meaning}
              </p>
              <div className="bg-black/20 rounded-xl p-4 inline-block mb-3">
                <p className="text-shs-forest-200 italic">
                  "{wordOfTheDay.usage}"
                </p>
              </div>
              <p className="text-xs text-shs-forest-400">
                Source: {wordOfTheDay.source}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation - NEW: Links to new content pages */}
      <section className="py-10 bg-shs-cream border-b border-shs-stone">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-shs-forest-800 mb-2">
              Explore Our Language Resources
            </h2>
            <p className="text-shs-text-muted">
              14,400+ structured language items • Stories • Phrase Books • Cultural Knowledge
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Traditional Stories',
                subtitle: 'Sptékwles',
                description: '15 Elder stories with 787 bilingual pairs',
                icon: '📖',
                href: '/language/stories',
                color: 'from-emerald-500 to-emerald-700',
              },
              {
                title: 'Phrase Books',
                subtitle: '3 Dialects',
                description: '440 phrases in Eastern, Western, Northern',
                icon: '💬',
                href: '/language/phrases',
                color: 'from-blue-500 to-blue-700',
              },
              {
                title: 'Cultural Knowledge',
                subtitle: '10 Books',
                description: 'Foods, Technology, Games, History & more',
                icon: '🏛️',
                href: '/cultural-knowledge',
                color: 'from-purple-500 to-purple-700',
              },
              {
                title: 'Full Dictionary',
                subtitle: '12,690 Words',
                description: 'Authoritative Gold Standard vocabulary',
                icon: '📚',
                href: '/dictionary',
                color: 'from-amber-500 to-amber-700',
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${item.color} p-5 text-white`}>
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.subtitle}</p>
                </div>
                <div className="bg-white p-4 group-hover:bg-shs-forest-50 transition-colors">
                  <p className="text-shs-text-body text-sm">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Language & Land - The Stewardship Connection */}
      {/* Language of Law & Science - The Horizon Expansion */}
      <section className="py-16 bg-shs-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-shs-stone overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-shs-forest-50 rounded-full -mr-32 -mt-32 opacity-50" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
                  Language is Data
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-6">
                  Technical Fluency: Law & Science
                </h2>
                <p className="text-shs-text-body mb-6 leading-relaxed">
                  Secwepemctsín is not just a tool for communication—it is a technical instrument for managing the land. 
                  Our language contains precise ecological data, legal frameworks, and spatial analysis tools encoded 
                  over thousands of years.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-shs-amber-100 flex items-center justify-center flex-shrink-0 text-2xl">⚖️</div>
                    <div>
                      <h4 className="font-bold text-shs-forest-800 text-lg">Yecwmín̓men = Legal Policy</h4>
                      <p className="text-sm text-shs-text-body mt-1">
                        Often translated as "stewardship," this term actually defines a binding <strong>Legal Obligation</strong> to care for tmicw (land). It is the foundation of modern Indigenous Resource Management policy.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-2xl">🗺️</div>
                    <div>
                      <h4 className="font-bold text-shs-forest-800 text-lg">Tmicw = Spatial Analysis (GIS)</h4>
                      <p className="text-sm text-shs-text-body mt-1">
                        Our complex place names don't just label locations; they describe hydrological functions and resource zones, forming the base layer for <strong>Biocultural Mapping</strong> and GIS.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-2xl">🌱</div>
                    <div>
                      <h4 className="font-bold text-shs-forest-800 text-lg">Stipstem = Climatology</h4>
                      <p className="text-sm text-shs-text-body mt-1">
                        Referring to post-glacial adaptation, concepts like this provide longitudinal data on <strong>Climate Resilience</strong> and species adaptation that Western science is just beginning to model.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-shs-forest-900 rounded-3xl p-8 border border-shs-forest-800 rotate-1 shadow-2xl text-white">
                <h4 className="font-bold text-shs-amber-400 mb-6 flex items-center gap-2 text-lg">
                  <span className="w-2 h-2 rounded-full bg-shs-amber-400 animate-pulse"/>
                  Horizon Expansion
                </h4>
                <p className="text-shs-forest-200 mb-6 text-lg font-light leading-relaxed">
                  "When you learn Secwepemctsín, you aren't just preserving culture. You are acquiring the 
                  <strong> technical vocabulary </strong> required for careers in Environmental Law, 
                  Wildlife Biology, and Land Governance."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-shs-forest-700/50">
                    <span className="font-medium text-shs-forest-300">Biologist</span>
                    <span className="font-bold text-white">Ethnobotany & Taxonomy</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-shs-forest-700/50">
                    <span className="font-medium text-shs-forest-300">Guardian</span>
                    <span className="font-bold text-white">Territorial Monitoring</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="font-medium text-shs-forest-300">Leader</span>
                    <span className="font-bold text-white">Governance & Diplomacy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section 
        ref={curriculumSection.ref as React.RefObject<HTMLElement>}
        className="py-16 md:py-20 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Vocabulary for Hunters & Stewards
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              7 Thematic Collections
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Learn words relevant to our hunting society's mission—wildlife, land, seasons, 
              traditional foods, community, and more.
            </p>
          </div>

          {/* Expandable Theme Sections */}
          <div className="space-y-4 mb-10">
            {Object.entries(vocabularyByTheme).map(([key, theme]: [string, ThemeCollection], index) => (
              <div 
                key={key}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  curriculumSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Theme Header - Clickable */}
                <button
                  onClick={() => toggleTheme(key)}
                  className={`w-full p-5 flex items-center gap-4 transition-all duration-300 ${
                    expandedTheme === key 
                      ? 'bg-shs-forest-600 text-white' 
                      : 'bg-shs-sand hover:bg-shs-forest-50 text-shs-forest-800'
                  }`}
                >
                  <span className="text-3xl">{theme.icon}</span>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-lg">{theme.theme.replace(/^.+\s/, '')}</h4>
                    <p className={`text-sm ${expandedTheme === key ? 'text-shs-forest-100' : 'text-shs-text-muted'}`}>
                      {theme.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${expandedTheme === key ? 'text-shs-forest-100' : 'text-shs-forest-600'}`}>
                      {theme.words.length} words
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedTheme === key ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expandable Vocabulary Grid */}
                {expandedTheme === key && (
                  <div className="bg-white p-6 border-x border-b border-shs-stone/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {theme.words.map((word: { word: string; pronunciation: string; meaning: string }) => (
                        <FlipCard
                          key={word.word}
                          className="h-36 rounded-xl"
                          front={
                            <div className="bg-shs-sand rounded-xl p-4 h-full flex flex-col justify-center items-center text-center border border-shs-stone/50 hover:border-shs-forest-300 transition-colors">
                              <h4 className="text-xl font-bold text-shs-forest-800 mb-1">
                                {word.word}
                              </h4>
                              <p className="text-sm text-shs-text-muted">
                                /{word.pronunciation}/
                              </p>
                              <p className="text-xs text-shs-forest-500 mt-2">Hover to reveal</p>
                            </div>
                          }
                          back={
                            <div className="bg-shs-forest-700 rounded-xl p-4 h-full flex flex-col justify-center items-center text-center text-white">
                              <p className="text-lg font-bold mb-1">
                                {word.meaning}
                              </p>
                              <p className="text-sm text-shs-forest-200 italic">
                                "{word.word}"
                              </p>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Language Attribution */}
          <div className="bg-shs-forest-50 rounded-xl p-5 text-center border border-shs-forest-100">
            <p className="text-sm text-shs-forest-700 leading-relaxed">
              All Secwepemctsín vocabulary provided by{' '}
              <a 
                href="https://wumec.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-shs-forest-800 underline hover:text-shs-amber-600 transition-colors"
              >
                Wuméc r Cqweqwelútn-kt
              </a>
              {' '}— Intergenerational Secwepemctsín Learning.
            </p>
            <p className="text-xs text-shs-text-muted mt-2">
              Eastern Secwepemctsín dialect (Adams Lake, Simpcw, Neskonlith)
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Practice Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              Learn by Playing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Interactive Practice
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Test your knowledge with games and track your daily learning streak.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Daily Challenge */}
            <DailyChallenge 
              words={Object.values(vocabularyByTheme).flatMap((cat: ThemeCollection) => cat.words)}
            />

            {/* Word Match Game */}
            <WordMatchGame 
              words={currentVocab.words.map((w: { word: string; meaning: string }) => ({ word: w.word, meaning: w.meaning }))}
              category={selectedCategory}
              categories={Object.entries(vocabularyByTheme).map(([key, val]: [string, ThemeCollection]) => ({
                key,
                icon: val.icon,
                label: val.theme,
              }))}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
      </section>

      {/* Cultural Skills - From SCES Elder Memories */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Learn by Doing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Cultural Skills
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Traditional knowledge passed down through generations. Each skill includes vocabulary to learn while practicing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {culturalSkills.map((skill) => (
              <div
                key={skill.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-shs-stone"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{skill.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-shs-forest-800 mb-1">{skill.title}</h3>
                    <p className="text-sm text-shs-forest-600 italic mb-3">{skill.secwepemc}</p>
                    <p className="text-shs-text-body text-sm mb-4">{skill.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-shs-forest-700 uppercase mb-2">Skills You'll Learn</h4>
                      <div className="flex flex-wrap gap-2">
                        {skill.skills.map((s) => (
                          <span key={s} className="px-2 py-1 bg-shs-forest-50 text-shs-forest-700 text-xs rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-shs-amber-700 uppercase mb-2">Vocabulary</h4>
                      <div className="flex flex-wrap gap-2">
                        {skill.vocabulary.map((v) => (
                          <span key={v.word} className="px-2 py-1 bg-shs-amber-50 text-shs-amber-800 text-xs rounded-full">
                            <strong>{v.word}</strong> = {v.meaning}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Children's Reader - Immersive Reading Practice */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-4">
              Reading Practice
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Children's Reader
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Practice reading bilingual sentences from the SCES Secwepemctsin Children's Reader (1998).
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {childrenReaderSentences.map((sentence, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-100 hover:shadow-md transition-shadow"
              >
                <p className="text-lg font-semibold text-shs-forest-800 mb-2">
                  {sentence.secwepemc}
                </p>
                <p className="text-shs-text-body text-sm mb-3">
                  {sentence.english}
                </p>
                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                  {sentence.theme}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-shs-text-muted mt-8">
            Source: Secwepemctsin Children's Reader (1998) by Mona Jules, SCES Language Department
          </p>
        </div>
      </section>

      {/* Traditional Games */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
              Play & Learn
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
              Traditional Games
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Games Secwépemc people have played for generations. Perfect for cultural camp activities!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {traditionalGames.map((game) => (
              <div
                key={game.name}
                className="bg-shs-sand rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{game.icon}</span>
                  <div>
                    <h3 className="font-bold text-shs-forest-800">{game.name}</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="text-shs-forest-600">{game.players} players</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        game.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-shs-text-body mb-3">{game.description}</p>
                <div className="flex flex-wrap gap-1">
                  {game.equipment.map((eq) => (
                    <span key={eq} className="px-2 py-1 bg-white text-shs-text-muted text-xs rounded border border-shs-stone">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Place Names */}
      <section 
        ref={placesSection.ref as React.RefObject<HTMLElement>}
        className="py-16 md:py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
                Territory Names
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800">
                Places in Secwepemcúl̓ecw
              </h2>
            </div>
            <Link
              to="/map"
              className="text-shs-forest-600 font-semibold hover:text-shs-forest-800 transition-colors"
            >
              View on Map →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {placeNames.map((place, index) => (
              <div
                key={place.english}
                className={`bg-shs-sand rounded-xl p-5 hover:shadow-md transition-all duration-500 ${
                  placesSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <h3 className="text-lg font-bold text-shs-forest-800 mb-1">
                  {place.secwepemctsin}
                </h3>
                <p className="text-xs text-shs-text-muted mb-2">
                  /{place.pronunciation}/
                </p>
                <p className="text-shs-forest-600 font-medium text-sm mb-1">
                  {place.english}
                </p>
                <p className="text-xs text-shs-text-body italic">
                  "{place.meaning}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-shs-sand to-shs-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-shs-forest-800 mb-4">
              Learning Resources
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              Continue your Secwepemctsín journey with these resources. 
              All vocabulary on this page is provided by our language partner{' '}
              <a href="https://wumec.org" target="_blank" rel="noopener noreferrer" className="text-shs-forest-600 font-semibold hover:underline">
                Wuméc r Cqweqwelútn-kt
              </a>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningResources.map((resource) => (
              <div
                key={resource.title}
                className="bg-white rounded-xl p-5 text-center hover:shadow-lg transition-shadow border border-shs-stone"
              >
                <div className="text-3xl mb-3">{resource.icon}</div>
                <h3 className="font-bold text-shs-forest-800 text-sm mb-1">{resource.title}</h3>
                <p className="text-xs text-shs-text-body mb-3">{resource.description}</p>
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-shs-forest-600 font-semibold text-xs hover:underline"
                  >
                    Visit →
                  </a>
                ) : (
                  <span className="text-xs text-shs-text-muted">{resource.source}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elder Quote */}
      <section className="py-12 bg-shs-forest-50 border-y border-shs-forest-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-lg md:text-xl text-shs-forest-800 italic mb-4">
            "When we lose a language, we lose a unique way of seeing the world. 
            Secwepemctsín carries the wisdom of our ancestors and the knowledge of our land."
          </blockquote>
          <p className="text-shs-forest-600 font-medium">— Secwépemc Elder</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-shs-amber-50 to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Experience Language on the Land
          </h2>
          <p className="text-shs-text-body mb-8 max-w-xl mx-auto">
            Join our cultural camps where Secwepemctsín is spoken in its natural context - 
            on the land, during traditional activities with Elders and fluent speakers.
          </p>
          <Link
            to="/cultural-camps"
            className="inline-flex items-center gap-2 px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors shadow-lg"
          >
            Join a Cultural Camp
          </Link>
        </div>
      </section>
    </div>
  );
}
