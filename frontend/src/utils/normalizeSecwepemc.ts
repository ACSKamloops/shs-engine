/**
 * Secwépemctsín Text Normalization Utility
 * Normalizes confusable characters to their canonical forms
 * Based on FPCC's unicode-resources confusable character mappings
 * License: Apache-2.0 (FPCC data), project license for this code
 */

import confusablesData from '../data/secwepemc/confusables.json';

// Build confusable-to-canonical map, sorted by length descending for proper replacement
const confusableEntries = Object.entries(confusablesData.confusables as Record<string, string>)
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Normalize a Secwépemctsín text by replacing confusable characters with canonical forms
 * 
 * Common corrections include:
 * - Various apostrophe characters → combining comma above (U+0313)
 * - Different modifier letters → standard glottalization markers
 * 
 * @param text - Input text that may contain confusable characters
 * @returns Normalized text with canonical character forms
 */
export function normalizeSecwepemc(text: string): string {
  let result = text;
  
  // Replace each confusable with its canonical form
  // Process longer strings first to avoid partial replacements
  for (const [confusable, canonical] of confusableEntries) {
    // Use global replacement
    result = result.split(confusable).join(canonical);
  }
  
  return result;
}

/**
 * Check if a text contains any confusable characters
 * Useful for validation and data quality checks
 */
export function hasConfusables(text: string): boolean {
  for (const [confusable] of confusableEntries) {
    if (text.includes(confusable)) {
      return true;
    }
  }
  return false;
}

/**
 * Get list of confusable characters found in text
 * Useful for debugging and data quality reports
 */
export function findConfusables(text: string): Array<{ found: string; canonical: string; position: number }> {
  const found: Array<{ found: string; canonical: string; position: number }> = [];
  
  for (const [confusable, canonical] of confusableEntries) {
    let pos = text.indexOf(confusable);
    while (pos !== -1) {
      found.push({ found: confusable, canonical, position: pos });
      pos = text.indexOf(confusable, pos + 1);
    }
  }
  
  return found.sort((a, b) => a.position - b.position);
}

/**
 * Get the number of confusable mappings available
 */
export function getConfusableCount(): number {
  return confusableEntries.length;
}
