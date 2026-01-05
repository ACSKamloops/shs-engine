/**
 * MorphologyBreakdown - Interactive Landscape Term Deconstruction
 * 
 * Shows how Secwépemc landscape terms are constructed from roots + suffixes.
 * Features:
 * - Large term display with color-coded segments
 * - Click segment to show meaning popup
 * - Suffix reference table
 * - Example terms list
 */
import { useState } from 'react';

interface MorphologyPart {
  text: string;
  type: 'root' | 'suffix' | 'prefix';
  meaning: string;
  details?: string;
}

interface MorphologyBreakdownProps {
  term: string;
  englishMeaning: string;
  parts: MorphologyPart[];
  relatedTerms?: { term: string; meaning: string }[];
  notes?: string;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

// Colors for different part types
const partStyles = {
  root: { bg: 'bg-shs-forest-100', text: 'text-shs-forest-700', border: 'border-shs-forest-300' },
  suffix: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  prefix: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
};

export function MorphologyBreakdown({
  term,
  englishMeaning,
  parts,
  relatedTerms,
  notes,
  variant = 'default',
  className = '',
}: MorphologyBreakdownProps) {
  const [selectedPart, setSelectedPart] = useState<MorphologyPart | null>(null);
  const [showAllRelated, setShowAllRelated] = useState(false);

  // Inline variant for simple display
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-0.5 ${className}`}>
        {parts.map((part, i) => {
          const style = partStyles[part.type];
          return (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded text-sm font-medium ${style.bg} ${style.text}`}
              title={`${part.type}: ${part.meaning}`}
            >
              {part.text}
            </span>
          );
        })}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-shs-stone/30 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {parts.map((part, i) => {
              const style = partStyles[part.type];
              return (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-lg text-base font-bold ${style.bg} ${style.text} ${style.border} border`}
                >
                  {part.text}
                </span>
              );
            })}
          </div>
          <span className="text-sm text-shs-text-muted">{englishMeaning}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {parts.map((part, i) => (
            <span key={i} className={`${partStyles[part.type].text}`}>
              <span className="font-medium">{part.text}</span> = {part.meaning}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <div className={`bg-white rounded-2xl border border-shs-stone/30 overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-50 to-violet-50 p-5 border-b border-shs-stone/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔤</span>
          <span className="text-xs font-medium text-shs-text-muted uppercase tracking-wide">
            Word Structure
          </span>
        </div>
        <h3 className="text-2xl font-bold text-shs-forest-800">{term}</h3>
        <p className="text-shs-text-body">"{englishMeaning}"</p>
      </div>

      {/* Interactive breakdown */}
      <div className="p-5">
        <h4 className="text-xs font-semibold text-shs-text-muted uppercase tracking-wide mb-4">
          Click each part to learn more
        </h4>
        
        {/* Term parts - clickable */}
        <div className="flex flex-wrap items-center gap-1 mb-6">
          {parts.map((part, i) => {
            const style = partStyles[part.type];
            const isSelected = selectedPart?.text === part.text;
            
            return (
              <button
                key={i}
                onClick={() => setSelectedPart(isSelected ? null : part)}
                className={`
                  px-4 py-2 rounded-xl text-lg font-bold
                  border-2 transition-all duration-300
                  ${style.bg} ${style.text} ${style.border}
                  ${isSelected 
                    ? 'ring-4 ring-offset-2 ring-shs-forest-300 scale-110 shadow-lg' 
                    : 'hover:scale-105 hover:shadow-md'
                  }
                `}
              >
                {part.text}
                {i === 0 && parts.length > 1 && (
                  <span className="text-gray-400 ml-1">+</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected part details */}
        {selectedPart && (
          <div 
            className={`
              p-4 rounded-xl border-2 mb-6
              animate-[fade-in_0.2s_ease-out]
              ${partStyles[selectedPart.type].bg}
              ${partStyles[selectedPart.type].border}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={`
                px-2 py-0.5 rounded text-xs font-bold uppercase
                ${partStyles[selectedPart.type].text}
              `}>
                {selectedPart.type}
              </span>
              <span className="text-lg font-bold text-gray-800">{selectedPart.text}</span>
            </div>
            <p className="text-gray-700 font-medium mb-1">Meaning: {selectedPart.meaning}</p>
            {selectedPart.details && (
              <p className="text-sm text-gray-600">{selectedPart.details}</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-shs-stone/20">
          {Object.entries(partStyles).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${style.bg} ${style.border} border-2`} />
              <span className="text-xs text-shs-text-muted capitalize">{type}</span>
            </div>
          ))}
        </div>

        {/* Related terms */}
        {relatedTerms && relatedTerms.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-shs-text-muted uppercase tracking-wide mb-3">
              Related Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(showAllRelated ? relatedTerms : relatedTerms.slice(0, 4)).map((related, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="font-medium text-shs-forest-700">{related.term}</span>
                  <span className="text-shs-text-muted">{related.meaning}</span>
                </div>
              ))}
            </div>
            {relatedTerms.length > 4 && (
              <button
                onClick={() => setShowAllRelated(!showAllRelated)}
                className="mt-2 text-xs text-shs-forest-600 hover:underline"
              >
                {showAllRelated ? 'Show less' : `+${relatedTerms.length - 4} more`}
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mt-4 p-3 bg-shs-amber-50 rounded-lg border border-shs-amber-100">
            <p className="text-xs text-shs-amber-800">
              <span className="font-semibold">Note:</span> {notes}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default MorphologyBreakdown;
