/**
 * ElderQuoteCard - A reusable component for displaying elder wisdom contextually
 * 
 * Design Philosophy:
 * - Elder quotes should enhance and contextualize content, not be a data dump
 * - Each quote is displayed as a prominent, respectful callout
 * - Speaker attribution and citation are clearly shown
 * - Used sparingly for maximum impact
 */

interface ElderQuote {
  id: string;
  speaker?: string | null;
  english: string;
  secwepemc?: string | null;
  citation?: string;
  themes?: string[];
  source?: {
    pdfPage?: number;
    printedPage?: string;
    chapter?: number;
  };
}

interface ElderQuoteCardProps {
  quote: ElderQuote;
  variant?: 'featured' | 'inline' | 'minimal';
  showCitation?: boolean;
  className?: string;
}

export default function ElderQuoteCard({ 
  quote, 
  variant = 'featured',
  showCitation = true,
  className = ''
}: ElderQuoteCardProps) {
  if (variant === 'minimal') {
    return (
      <blockquote className={`border-l-4 border-shs-forest-400 pl-4 py-2 ${className}`}>
        <p className="text-shs-text-body italic text-sm leading-relaxed">
          "{quote.english}"
        </p>
        {quote.speaker && (
          <cite className="block mt-2 text-xs text-gray-500 not-italic">
            — {quote.speaker}
          </cite>
        )}
      </blockquote>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 ${className}`}>
        <div className="flex gap-3">
          <span className="text-2xl">🪶</span>
          <div>
            <p className="text-shs-text-body italic leading-relaxed text-sm">
              "{quote.english}"
            </p>
            {(quote.speaker || quote.citation) && (
              <p className="mt-2 text-xs text-amber-700 font-medium">
                {quote.speaker && <span>— {quote.speaker}</span>}
                {quote.citation && !quote.speaker && <span>— {quote.citation}</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Featured variant (default) - for prominent display
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-shs-forest-800 via-shs-forest-700 to-shs-forest-600 text-white p-8 ${className}`}>
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-6xl opacity-20">❝</div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full" />
      
      <div className="relative">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🪶</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">Elder Wisdom</h3>
            {quote.speaker && (
              <p className="text-white/70 text-sm">{quote.speaker}</p>
            )}
          </div>
        </div>

        {/* Secwépemctsín if available */}
        {quote.secwepemc && (
          <p className="text-amber-200 font-medium mb-4 text-lg leading-relaxed">
            "{quote.secwepemc}"
          </p>
        )}

        {/* English quote */}
        <blockquote className="text-white/90 text-lg leading-relaxed italic">
          "{quote.english}"
        </blockquote>

        {/* Citation */}
        {showCitation && quote.citation && (
          <p className="mt-6 text-sm text-white/60 flex items-center gap-2">
            <span>📖</span>
            {quote.citation}
          </p>
        )}
      </div>
    </div>
  );
}

// Example curated quotes for specific themes (pre-selected for quality)
export const curatedQuotes: Record<string, ElderQuote[]> = {
  foodways: [
    {
      id: 'curated_salmon',
      speaker: 'Laura Harry',
      secwepemc: 'Re sqlélten, yiri7 re sxetéqst.s te stsmémelt-kt',
      english: 'Salmon are our first children',
      citation: 'Laura Harry, Ron Ignace Interview 1998',
      themes: ['foodways', 'family_community'],
      source: { chapter: 2, pdfPage: 48, printedPage: '31' }
    },
    {
      id: 'curated_respect',
      english: 'With any kind of animal that we would hunt and eat, you have to respect them, too… We lived on a lot of fish-heads when we were kids. [My mother] would never allow you to play with the fish-heads or any part of that.',
      citation: 'Interview Marianne Boelscher Ignace, 1986',
      themes: ['foodways', 'family_community'],
      source: { chapter: 2, pdfPage: 57, printedPage: '40' }
    }
  ],
  land_stewardship: [
    {
      id: 'curated_burning',
      speaker: 'Baptiste Ritchie',
      english: 'When they used to burn that grass above timberline they used to say the Indian Potatoes were as big as your fist. Now they are only that big, because they are not cultivated. They would burn every five or six years.',
      citation: 'Baptiste Ritchie, transcription from taped interview with Dorothy Kennedy, May 1977',
      themes: ['land_environment'],
      source: { chapter: 5, pdfPage: 204, printedPage: '187' }
    },
    {
      id: 'curated_deterioration',
      speaker: 'Mary Thomas',
      english: 'Everything is deteriorating—the surface of the soil where we used to gather our food, there\'s about 4–6 inches of thick, thick sod and all introduced weeds and grasses. And on top of that the cattle walk on it, and it\'s packing it to the point where there\'s very little air goes into the ground.',
      citation: 'Mary Thomas, interview with N. Turner, 1994',
      themes: ['foodways', 'land_environment'],
      source: { chapter: 10, pdfPage: 364, printedPage: '347' }
    }
  ],
  land_loss: [
    {
      id: 'curated_bluebirds',
      speaker: 'Mary Thomas',
      english: 'I look around in the areas I was raised and born, the bluebirds that used to be aplenty. I don\'t see one bluebird anymore. We used to go down to the mouth of the river with all the plants that our grandparents dug in the spring to feed on. There\'s not one plant left down there.',
      citation: 'Mary Thomas, interview with AG, 1998',
      themes: ['land_environment'],
      source: { chapter: 10, pdfPage: 364, printedPage: '347' }
    }
  ]
};
