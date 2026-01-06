/**
 * Shared UI constants for the SHS curriculum system
 * Extracted from CurriculumPage.tsx to enable reuse and avoid duplication
 */

// Color map for pathway theming
export const pathwayColorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-300', light: 'bg-emerald-50' },
  sky: { bg: 'bg-sky-600', text: 'text-sky-600', border: 'border-sky-300', light: 'bg-sky-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-300', light: 'bg-amber-50' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-300', light: 'bg-violet-50' },
  forest: { bg: 'bg-shs-forest-600', text: 'text-shs-forest-600', border: 'border-shs-forest-300', light: 'bg-shs-forest-50' },
  earth: { bg: 'bg-stone-600', text: 'text-stone-600', border: 'border-stone-300', light: 'bg-stone-50' },
};

// Game difficulty color schemes
export const difficultyColors: Record<string, string> = {
  easy: 'bg-green-50 border-green-200 text-green-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  advanced: 'bg-red-50 border-red-200 text-red-800',
};

// Module metadata (icon and pathway for each curriculum module)
export const moduleMetadata: Record<string, { icon: string; pathway: string; colorScheme: string }> = {
  food_sovereignty: { icon: '🍖', pathway: 'land', colorScheme: 'forest' },
  land_stewardship: { icon: '🌲', pathway: 'land', colorScheme: 'earth' },
  cultural_preservation: { icon: '🎭', pathway: 'mind', colorScheme: 'amber' },
  healing_wellness: { icon: '💚', pathway: 'heart', colorScheme: 'forest' },
  youth_mentorship: { icon: '👨‍👩‍👧', pathway: 'mind', colorScheme: 'amber' },
  legal_traditions: { icon: '⚖️', pathway: 'spirit', colorScheme: 'earth' },
};

export type PathwayColors = typeof pathwayColorMap[keyof typeof pathwayColorMap];
