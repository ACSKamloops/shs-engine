
import { Task } from "../types";
import { parseCSV } from "./csvLoader";
import { parseHistoricalDate } from "./dateParser";

declare const mammoth: any;
declare const pdfjsLib: any;

const MAX_FILE_READ_SIZE = 50 * 1024 * 1024;
const BATCH_SIZE = 500;

const cleanText = (text: string): string => {
  return text.replace(/^\uFEFF/, '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').trim();
};

const repairJson = (text: string): string => {
  return text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
};

// Simulation of SHA-256 for browser speed (sufficient for prototype)
const generateSimulatedHash = (content: string): string => {
    let hash = 0;
    if (content.length === 0) return "e3b0c442...";
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
};

const robustJSONParse = (text: string): any[] => {
  const trimmed = cleanText(text);
  try { return Array.isArray(JSON.parse(trimmed)) ? JSON.parse(trimmed) : [JSON.parse(trimmed)]; } catch (e) {}
  try { return Array.isArray(JSON.parse(repairJson(trimmed))) ? JSON.parse(repairJson(trimmed)) : [JSON.parse(repairJson(trimmed))]; } catch (e) {}
  return []; 
};

export const processFiles = async (files: FileList | File[]): Promise<Task[]> => {
  const tasks: Task[] = [];
  const fileArray = Array.from(files);

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    // Methodology v2.0: Generate StableID base
    const seq = Math.floor(Math.random() * 900000) + 100000;
    const uniqueIdBase = `DOC-${seq}`;
    
    const now = new Date().toISOString();

    try {
      let content = "";
      let type = "text";
      let provenance = `Incoming Import (${file.name})`; // Default Provenance

      if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        content = await readFileAsText(file);
        const dataArray = robustJSONParse(content);
        
        if (dataArray.length > 0) {
            dataArray.forEach((item, idx) => {
                const subId = `DOC-${seq + idx}`;
                // Prefer internal provenance if available in JSON
                const itemProvenance = item.provenance || item.source || item.archive_ref || provenance;
                
                tasks.push({
                    id: subId,
                    path: file.name,
                    status: 'PENDING',
                    provenance: itemProvenance,
                    hash: generateSimulatedHash(JSON.stringify(item)),
                    content: JSON.stringify(item, null, 2),
                    jsonContent: item,
                    timestamp: parseHistoricalDate(item.date || item.timestamp),
                    originalDateString: item.date || "Unknown"
                } as Task);
            });
            continue; 
        }
      } else if (file.name.endsWith('.pdf')) {
         const buffer = await readFileAsArrayBuffer(file);
         content = await readPdfText(buffer);
         type = "pdf";
      }

      // Fallback for non-JSON or unparseable text
      tasks.push({
          id: uniqueIdBase,
          path: file.name,
          status: 'PENDING',
          provenance: provenance,
          hash: generateSimulatedHash(content),
          content: content.substring(0, 5000), 
          jsonContent: { text: content, type: type },
          timestamp: now,
          originalDateString: "Unknown"
      });

    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }
  }
  return tasks;
};

const readPdfText = async (data: ArrayBuffer): Promise<string> => {
    try {
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n";
        }
        return fullText;
    } catch (e) { return "PDF Read Error"; }
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file);
  });
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });
};
