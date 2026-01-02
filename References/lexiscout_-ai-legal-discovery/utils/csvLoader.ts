
export const parseCSV = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  
  // Normalize line endings
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const len = normalizedText.length;
  
  let i = 0;
  let fieldStart = 0;
  let inQuotes = false;
  
  while (i < len) {
    const char = normalizedText[i];
    
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && normalizedText[i + 1] === '"') {
          // Escaped quote: skip next char
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        // Field separator
        // Extract field, handling quotes if necessary
        let field = normalizedText.slice(fieldStart, i);
        
        // If field started with quote and ended with quote (simple case check)
        // A robust check for unescaping quotes:
        if (field.startsWith('"') && field.endsWith('"') && field.length >= 2) {
             // Remove surrounding quotes and unescape double quotes
             field = field.substring(1, field.length - 1).replace(/""/g, '"');
        } else if (field.includes('"')) {
             // Fallback for messy CSVs or partial quotes (heuristic)
             field = field.replace(/"/g, '').trim(); 
        }
        
        currentRow.push(field);
        fieldStart = i + 1;
      } else if (char === '\n') {
        // Row separator
        let field = normalizedText.slice(fieldStart, i);
        if (field.startsWith('"') && field.endsWith('"') && field.length >= 2) {
             field = field.substring(1, field.length - 1).replace(/""/g, '"');
        } else if (field.includes('"')) {
             field = field.replace(/"/g, '').trim();
        }
        
        currentRow.push(field);
        rows.push(currentRow);
        currentRow = [];
        fieldStart = i + 1;
      }
    }
    i++;
  }
  
  // Handle last field/row if no newline at end
  if (fieldStart < len) {
    let field = normalizedText.slice(fieldStart);
    if (field.startsWith('"') && field.endsWith('"') && field.length >= 2) {
         field = field.substring(1, field.length - 1).replace(/""/g, '"');
    }
    currentRow.push(field);
    rows.push(currentRow);
  }

  // Expecting header in first row
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  
  // Filter out empty rows
  return rows.slice(1)
    .filter(row => row.length > 0 && (row.length > 1 || row[0] !== '')) 
    .map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        // Handle case where row might be shorter than header
        obj[header] = row[index] || '';
      });
      return obj;
    });
};
