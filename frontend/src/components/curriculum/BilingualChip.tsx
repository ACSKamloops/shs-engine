/**
 * BilingualChip - Reusable component for displaying Secwépemctsín + English pairs
 * Extracted from LessonAccordion to eliminate 8+ duplicate rendering patterns
 */

type ChipVariant = 'vocabulary' | 'phrase' | 'pattern' | 'command' | 'species' | 'root' | 'animal' | 'number' | 'color';

interface BilingualChipProps {
  secwepemc?: string;
  english?: string;
  // Alternative fields
  method?: string;
  animal?: string;
  description?: string;
  number?: string | number;
  season?: string;
  variant?: ChipVariant;
  className?: string;
}

// Variant-specific styles
const variantStyles: Record<ChipVariant, string> = {
  vocabulary: 'bg-emerald-50 border-emerald-200',
  phrase: 'bg-white border-gray-200',
  pattern: 'bg-violet-50 border-l-4 border-violet-300 rounded-r-lg',
  command: 'bg-emerald-50 border-emerald-200',
  species: 'bg-sky-50 border-sky-200',
  root: 'bg-amber-50 border-amber-200',
  animal: 'bg-white border-gray-200',
  number: 'bg-sky-50 border-sky-200 text-center',
  color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-center',
};

const secwepemcStyles: Record<ChipVariant, string> = {
  vocabulary: 'text-emerald-700',
  phrase: 'text-emerald-700',
  pattern: 'text-violet-800',
  command: 'text-emerald-800',
  species: 'text-sky-700',
  root: 'text-amber-800',
  animal: 'text-gray-800',
  number: 'text-sky-800 text-lg',
  color: 'text-gray-800',
};

export function BilingualChip({
  secwepemc,
  english,
  method,
  animal,
  description,
  number,
  season,
  variant = 'vocabulary',
  className = '',
}: BilingualChipProps) {
  const baseClasses = 'p-3 rounded-lg border';
  const variantClass = variantStyles[variant] || variantStyles.vocabulary;
  const textClass = secwepemcStyles[variant] || secwepemcStyles.vocabulary;

  // Handle number variant specially
  if (variant === 'number' && number !== undefined) {
    return (
      <div className={`p-2 ${variantClass} ${className}`}>
        <p className={`font-bold ${textClass}`}>{number}</p>
        {secwepemc && <p className="text-xs text-sky-600">{secwepemc}</p>}
      </div>
    );
  }

  // Handle animal variant specially
  if (variant === 'animal') {
    return (
      <div className={`${baseClasses} ${variantClass} ${className}`}>
        {animal && <p className="font-semibold text-gray-800">{animal}</p>}
        {method && <p className="text-sm text-gray-600">{method}</p>}
      </div>
    );
  }

  // Standard bilingual display
  return (
    <div className={`${baseClasses} ${variantClass} ${className}`}>
      {(method || animal) && <p className="font-semibold text-gray-800">{method || animal}</p>}
      {secwepemc && <p className={`font-semibold ${textClass}`}>{secwepemc}</p>}
      {(description || english) && (
        <p className="text-sm text-gray-600 mt-1">{description || english}</p>
      )}
      {season && <span className="text-xs text-amber-600">Season: {season}</span>}
    </div>
  );
}

export default BilingualChip;
