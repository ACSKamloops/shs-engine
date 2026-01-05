/**
 * SkillStep - Practical Activity Step Card
 * 
 * Card for displaying practical camp skills with:
 * - Numbered step circle (large, gradient)
 * - Step title
 * - Description text
 * - Duration estimate (optional)
 * - Difficulty badge (Beginner/Intermediate/Advanced)
 * - Materials list (optional)
 */

interface SkillStepProps {
  stepNumber: number;
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  materials?: string[];
  tips?: string;
  safetyNote?: string;
  imageUrl?: string;
  isCompleted?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  colorScheme?: 'forest' | 'amber' | 'earth';
  className?: string;
  onComplete?: () => void;
}

// Difficulty styling
const difficultyStyles = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700', label: 'Beginner' },
  intermediate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Intermediate' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700', label: 'Advanced' },
};

// Color schemes
const colorSchemes = {
  forest: { gradient: 'from-shs-forest-500 to-shs-forest-700', ring: 'ring-shs-forest-200' },
  amber: { gradient: 'from-shs-amber-500 to-shs-amber-700', ring: 'ring-shs-amber-200' },
  earth: { gradient: 'from-shs-earth-500 to-shs-earth-700', ring: 'ring-shs-earth-200' },
};

export function SkillStep({
  stepNumber,
  title,
  description,
  duration,
  difficulty,
  materials,
  tips,
  safetyNote,
  imageUrl,
  isCompleted = false,
  variant = 'default',
  colorScheme = 'forest',
  className = '',
  onComplete,
}: SkillStepProps) {
  const colors = colorSchemes[colorScheme];
  const diffStyle = difficulty ? difficultyStyles[difficulty] : null;

  // Inline variant for numbered lists
  if (variant === 'inline') {
    return (
      <div 
        className={`
          flex items-start gap-4 py-4
          ${className}
        `}
      >
        {/* Step number */}
        <div 
          className={`
            w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
            text-sm font-bold text-white bg-gradient-to-br ${colors.gradient}
            ${isCompleted ? 'opacity-50' : ''}
          `}
        >
          {isCompleted ? '✓' : stepNumber}
        </div>
        
        {/* Content */}
        <div className={`flex-1 ${isCompleted ? 'opacity-60' : ''}`}>
          <h4 className={`font-semibold text-shs-forest-800 ${isCompleted ? 'line-through' : ''}`}>
            {title}
          </h4>
          <p className="text-sm text-shs-text-body mt-1">{description}</p>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        className={`
          flex items-center gap-4 p-4 bg-white rounded-xl border border-shs-stone/30
          hover:shadow-md transition-all duration-300
          ${isCompleted ? 'opacity-60 bg-gray-50' : ''}
          ${className}
        `}
      >
        <div 
          className={`
            w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
            text-base font-bold text-white bg-gradient-to-br ${colors.gradient}
          `}
        >
          {isCompleted ? '✓' : stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-shs-forest-800 truncate ${isCompleted ? 'line-through' : ''}`}>
            {title}
          </h4>
          {duration && <span className="text-xs text-shs-text-muted">{duration}</span>}
        </div>
        {diffStyle && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}>
            {diffStyle.label}
          </span>
        )}
      </div>
    );
  }

  // Default full variant
  return (
    <div 
      className={`
        bg-white rounded-2xl border border-shs-stone/30 overflow-hidden
        hover:shadow-lg transition-all duration-300
        ${isCompleted ? 'opacity-70' : ''}
        ${className}
      `}
    >
      {/* Header with step number */}
      <div className="flex items-center gap-4 p-5 border-b border-shs-stone/20">
        <div 
          className={`
            w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center
            text-xl font-bold text-white bg-gradient-to-br ${colors.gradient}
            ring-4 ${colors.ring} shadow-lg
            ${isCompleted ? 'bg-gray-400' : ''}
          `}
        >
          {isCompleted ? (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-bold text-shs-forest-800 ${isCompleted ? 'line-through' : ''}`}>
            {title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            {duration && (
              <span className="flex items-center gap-1 text-xs text-shs-text-muted">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
              </span>
            )}
            {diffStyle && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}>
                {diffStyle.label}
              </span>
            )}
          </div>
        </div>

        {/* Completion checkbox */}
        {onComplete && (
          <button
            onClick={onComplete}
            className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isCompleted 
                ? 'bg-shs-forest-500 border-shs-forest-500 text-white' 
                : 'border-gray-300 hover:border-shs-forest-400'
              }
            `}
          >
            {isCompleted && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Image (if provided) */}
      {imageUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Description */}
        <p className="text-shs-text-body leading-relaxed">{description}</p>

        {/* Materials list */}
        {materials && materials.length > 0 && (
          <div className="bg-shs-sand rounded-lg p-4">
            <h5 className="text-xs font-semibold text-shs-text-muted uppercase tracking-wide mb-2">
              Materials Needed
            </h5>
            <ul className="grid grid-cols-2 gap-2">
              {materials.map((material, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-shs-text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-shs-forest-400" />
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {tips && (
          <div className="flex gap-3 p-3 bg-shs-forest-50 rounded-lg border border-shs-forest-100">
            <span className="text-lg">💡</span>
            <div>
              <span className="text-xs font-semibold text-shs-forest-700">Tip:</span>
              <p className="text-sm text-shs-forest-700">{tips}</p>
            </div>
          </div>
        )}

        {/* Safety note */}
        {safetyNote && (
          <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="text-xs font-semibold text-amber-700">Safety:</span>
              <p className="text-sm text-amber-700">{safetyNote}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillStep;
