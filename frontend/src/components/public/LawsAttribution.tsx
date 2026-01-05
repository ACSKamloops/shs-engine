/**
 * LawsAttribution - Consistent attribution component for Laws 2023 content
 * Used across the site to credit SNTC/ILRU source material
 */

interface LawsAttributionProps {
  sectionId?: string;
  sectionTitle?: string;
  variant?: 'inline' | 'footer' | 'card';
  className?: string;
}

export function LawsAttribution({ 
  sectionId, 
  sectionTitle,
  variant = 'footer',
  className = '' 
}: LawsAttributionProps) {
  const baseStyles = {
    inline: 'text-xs text-shs-text-muted italic',
    footer: 'text-sm text-shs-text-muted mt-4 pt-4 border-t border-shs-stone/30',
    card: 'text-xs text-shs-forest-600 bg-shs-forest-50 px-3 py-2 rounded-lg inline-flex items-center gap-2'
  };

  return (
    <div className={`${baseStyles[variant]} ${className}`}>
      {variant === 'card' && (
        <svg className="w-4 h-4 text-shs-forest-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )}
      <span>
        <span className="font-medium">Source:</span> Secwépemc Laws 2023 (SNTC/ILRU)
        {sectionId && <span> — Section {sectionId}</span>}
        {sectionTitle && !sectionId && <span> — {sectionTitle}</span>}
      </span>
    </div>
  );
}

/**
 * LawsSourceBadge - Small badge for tagging content sourced from Laws
 */
export function LawsSourceBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-shs-forest-100 text-shs-forest-700 text-xs font-medium rounded-full ${className}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Laws 2023
    </span>
  );
}

export default LawsAttribution;
