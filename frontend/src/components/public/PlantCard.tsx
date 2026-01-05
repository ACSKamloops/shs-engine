/**
 * PlantCard - Botanical Entry Card
 * 
 * Rich card for displaying culturally important plant species with:
 * - Image area (placeholder pattern if no image)
 * - Secwépemc + English names
 * - Category badge (Food/Medicine/Material/Ceremonial)
 * - Uses list with bullet points
 * - Seasonal availability indicator (12 dots for months)
 */

interface PlantCardProps {
  secwepemcName: string;
  englishName: string;
  scientificName?: string;
  category: 'food' | 'medicine' | 'material' | 'ceremonial' | 'multiple';
  uses: string[];
  preparation?: string;
  seasonalAvailability?: number[]; // Array of months (1-12) when available
  imageUrl?: string;
  habitat?: string;
  harvestNotes?: string;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  onClick?: () => void;
}

// Category styling
const categoryStyles = {
  food: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🍽️' },
  medicine: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: '💊' },
  material: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: '🪵' },
  ceremonial: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', icon: '✨' },
  multiple: { bg: 'bg-shs-forest-100', text: 'text-shs-forest-700', border: 'border-shs-forest-200', icon: '🌿' },
};

// Month abbreviations
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function PlantCard({
  secwepemcName,
  englishName,
  scientificName,
  category,
  uses,
  preparation,
  seasonalAvailability = [],
  imageUrl,
  habitat,
  harvestNotes: _harvestNotes,
  variant = 'default',
  className = '',
  onClick,
}: PlantCardProps) {
  const catStyle = categoryStyles[category];

  // Placeholder pattern for missing images
  const placeholderPattern = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="leaf-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 5 Q30 15 20 25 Q10 15 20 5" fill="none" stroke="rgba(34,197,94,0.2)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#f0fdf4"/>
      <rect width="100%" height="100%" fill="url(#leaf-pattern)"/>
    </svg>
  `;

  if (variant === 'compact') {
    return (
      <div 
        className={`
          flex items-center gap-4 p-4 bg-white rounded-xl border border-shs-stone/30
          hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer
          ${className}
        `}
        onClick={onClick}
      >
        {/* Small image/icon */}
        <div 
          className={`w-14 h-14 rounded-lg flex-shrink-0 ${catStyle.bg} flex items-center justify-center`}
        >
          <span className="text-2xl">{catStyle.icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-shs-forest-800 truncate">{secwepemcName}</h4>
          <p className="text-sm text-shs-text-muted truncate">{englishName}</p>
        </div>
        
        {/* Category badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
          {category}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`
        group bg-white rounded-2xl border border-shs-stone/30 overflow-hidden
        hover:shadow-xl hover:-translate-y-1 transition-all duration-500
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={englishName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-shs-forest-50 to-emerald-50 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: placeholderPattern }}
          />
        )}
        
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span 
            className={`
              px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
              backdrop-blur-sm shadow-lg
              ${catStyle.bg} ${catStyle.text} ${catStyle.border} border
            `}
          >
            {catStyle.icon} {category}
          </span>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Bottom name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold leading-tight">{secwepemcName}</h3>
          <p className="text-sm opacity-90">{englishName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Scientific name */}
        {scientificName && (
          <p className="text-xs text-shs-text-muted italic mb-3">{scientificName}</p>
        )}

        {/* Uses list */}
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-shs-text-muted uppercase tracking-wide mb-2">
            Traditional Uses
          </h5>
          <ul className="space-y-1.5">
            {uses.slice(0, 3).map((use, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-shs-text-body">
                <svg className="w-4 h-4 text-shs-forest-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {use}
              </li>
            ))}
            {uses.length > 3 && (
              <li className="text-xs text-shs-forest-600 font-medium">
                +{uses.length - 3} more uses
              </li>
            )}
          </ul>
        </div>

        {/* Preparation note */}
        {preparation && (
          <div className="mb-4 p-3 bg-shs-amber-50 rounded-lg border border-shs-amber-100">
            <p className="text-xs text-shs-amber-800">
              <span className="font-semibold">Preparation:</span> {preparation}
            </p>
          </div>
        )}

        {/* Seasonal availability */}
        {seasonalAvailability.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-shs-text-muted uppercase tracking-wide mb-2">
              Seasonal Availability
            </h5>
            <div className="flex gap-1">
              {months.map((month, idx) => {
                const isAvailable = seasonalAvailability.includes(idx + 1);
                return (
                  <div
                    key={month}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium
                      transition-all duration-200
                      ${isAvailable 
                        ? 'bg-shs-forest-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                    title={`${['January','February','March','April','May','June','July','August','September','October','November','December'][idx]}: ${isAvailable ? 'Available' : 'Not available'}`}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Habitat */}
        {habitat && (
          <p className="mt-4 text-xs text-shs-text-muted">
            <span className="font-semibold">Habitat:</span> {habitat}
          </p>
        )}
      </div>
    </div>
  );
}

export default PlantCard;
