/**
 * Secwépemctsín Alphabet Sorting Utility
 * Based on FPCC's unicode-resources alphabet ordering data
 * License: Apache-2.0 (FPCC data), project license for this code
 */

import alphabetData from '../data/secwepemc/alphabet_ordering.json';

// Build character-to-sort-order map
const charToOrder: Map<string, number> = new Map();

// Add all alphabet characters
alphabetData.alphabet.forEach((entry: { character: string; sort_order: number }) => {
  // Store both as-is and lowercase for case-insensitive comparison
  charToOrder.set(entry.character, entry.sort_order);
  charToOrder.set(entry.character.toLowerCase(), entry.sort_order);
  charToOrder.set(entry.character.toUpperCase(), entry.sort_order);
});

/**
 * Get the sort order for a character or grapheme
 * Multi-character graphemes (like 'kw', 'c̓') are checked first
 */
function getCharOrder(char: string): number {
  // Direct lookup
  if (charToOrder.has(char)) {
    return charToOrder.get(char)!;
  }
  // Try lowercase
  if (charToOrder.has(char.toLowerCase())) {
    return charToOrder.get(char.toLowerCase())!;
  }
  // Unknown characters sort last
  return 1000 + char.charCodeAt(0);
}

/**
 * Parse a word into graphemes according to Secwépemctsín alphabet
 * Handles multi-character graphemes like 'kw', 'gw', 'c̓', etc.
 */
function parseGraphemes(word: string): string[] {
  const graphemes: string[] = [];
  let i = 0;
  
  // Sort alphabet by length descending to match longest graphemes first
  const sortedChars = alphabetData.alphabet
    .map((a: { character: string }) => a.character)
    .sort((a: string, b: string) => b.length - a.length);
  
  while (i < word.length) {
    let matched = false;
    
    // Try to match longest grapheme first
    for (const grapheme of sortedChars) {
      const slice = word.slice(i, i + grapheme.length);
      if (slice.toLowerCase() === grapheme.toLowerCase()) {
        graphemes.push(slice);
        i += grapheme.length;
        matched = true;
        break;
      }
    }
    
    // If no grapheme matched, take single character
    if (!matched) {
      graphemes.push(word[i]);
      i++;
    }
  }
  
  return graphemes;
}

/**
 * Compare two Secwépemctsín words for sorting
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareSecwepemc(a: string, b: string): number {
  const graphemesA = parseGraphemes(a);
  const graphemesB = parseGraphemes(b);
  
  const minLen = Math.min(graphemesA.length, graphemesB.length);
  
  for (let i = 0; i < minLen; i++) {
    const orderA = getCharOrder(graphemesA[i]);
    const orderB = getCharOrder(graphemesB[i]);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
  }
  
  // If all compared graphemes are equal, shorter word comes first
  return graphemesA.length - graphemesB.length;
}

/**
 * Get the first grapheme of a word (for alphabet navigation)
 */
export function getFirstGrapheme(word: string): string {
  const graphemes = parseGraphemes(word);
  return graphemes.length > 0 ? graphemes[0] : '';
}

/**
 * Get the canonical alphabet for navigation UI
 * Returns array of unique first graphemes in Secwépemctsín order
 */
export function getSecwepemcAlphabet(): string[] {
  return alphabetData.alphabet.map((a: { character: string }) => a.character);
}

/**
 * Sort an array of words by Secwépemctsín alphabet order
 */
export function sortSecwepemc<T>(
  items: T[],
  getWord: (item: T) => string = (item) => String(item)
): T[] {
  return [...items].sort((a, b) => compareSecwepemc(getWord(a), getWord(b)));
}
