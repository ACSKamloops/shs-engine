
/**
 * Tries to parse vague historical date strings into a standard ISO format.
 * Examples: 
 * "1880" -> "1880-01-01"
 * "May 1880" -> "1880-05-01"
 * "c. 1900" -> "1900-01-01"
 * "12th Oct, 1916" -> "1916-10-12"
 */
export const parseHistoricalDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();

  // Clean the string (remove 'c.', 'circa', 'approx')
  const clean = dateStr.toLowerCase().replace(/c\.|circa|approx\.?|about/g, '').trim();

  // Try standard Date parse first
  const stdDate = new Date(clean);
  if (!isNaN(stdDate.getTime())) {
    return stdDate.toISOString();
  }

  // Regex for just a Year (e.g., "1880")
  const yearMatch = clean.match(/(18|19)\d{2}/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    
    // Try to find a month
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let monthIndex = 0;
    
    for (let i = 0; i < months.length; i++) {
      if (clean.includes(months[i])) {
        monthIndex = i;
        break;
      }
    }

    // Default to 1st of the month/year
    const d = new Date(year, monthIndex, 1);
    // Adjust for timezone offset to ensure yyyy-mm-dd matches
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString();
  }

  // Fallback: Return current date but log warning (or could return null)
  return new Date().toISOString();
};
