
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("%c[Gemini] CRITICAL ERROR: No API Key found.", "color: red; font-weight: bold; background: #fee2e2; padding: 4px; border-radius: 4px;");
    throw new Error("API Key not found in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

// Methodology v2.0: Entity Normalization & Clerk Standard
const FORENSIC_CONTEXT = `
ROLE: Forensic Archivist & Clerk for the "Pukaist Sovereignty & Dispossession" Project.
MANDATE: Extract facts. Do NOT offer opinions. Adhere to the "Clerk Standard".

--- 1. ENTITY NORMALIZATION (KEYWORD PLAYBOOK) ---
You MUST normalize entities to these CANONICAL NAMES:
- "Pukaist" (map from: Pokheitsk, Pokhaist, Pokeist, Toketic, Pekeyst, IR10)
- "Spatsum" (map from: Spaptsum, Toketi, Spatzum, IR11)
- "Tetlanetea" (map from: Tetlenitsa, Titlanetea, Tedlanetsa, John Titlanetza) -> Role: Chief (1878-1916)
- "Shemahallsee" (map from: Shumahaltse, Sumahalta) -> Role: Chief (Late 19th C)
- "Whistemnitsa" (map from: Yopalla) -> Role: Chief of Cook's Ferry
- "Peter O'Reilly" (Indian Reserve Commissioner)
- "G.M. Sproat" (Joint Reserve Commissioner)

--- 2. THE CLERK STANDARD (FORBIDDEN WORDS) ---
Your "legalOpinion" must be a dry, factual summary.
FORBIDDEN WORDS: suggests, implies, likely, possibly, appears to be, seems, opinion, speculates, indicates, probably.
VIOLATION: "This letter suggests fraud." 
CORRECT: "The letter states the funds were transferred without consent."

--- 3. KEY EVIDENCE EXTRACTION ---
You must extract the "Smoking Gun" quote verbatim from the text that supports your finding.
Field: keyEvidenceQuote.
Example: "I cannot administer a policy that discourages Indigenous self-governance."

--- 4. LEGAL THEMES (BREACH CATEGORIES) ---
Classify evidence into ONE primary theme:
1. Land_Reduction_Trespass (Acreage changes, pre-emptions, surveys)
2. Governance_Sovereignty (Distinct Chiefs, Petitions, Census lists)
3. Fiduciary_Duty_Negligence (Trust funds, failure to protect)
4. Water_Rights_Fishing (Ditches, licenses, priority rights)
5. Coercion_Duress (Forced surrenders, threats)

--- 5. RELIABILITY FLAGS ---
- Verified: Found in primary government record (MoD, Correspondence).
- Unverified: Secondary source (Newspaper, Academic).
`;

const SYNTHESIS_CONTEXT = `
ROLE: Lead Historical Author for the "Pukaist Sovereignty & Dispossession" Dossier.
OBJECTIVE: Synthesize verified evidence into a "Counter-Narrative" regarding Pukaist distinctness.

STRUCTURE:
1. Sovereignty Argument: Cite evidence of distinct Chiefs (Tetlanetea) and Census listings.
2. Dispossession Mechanism: Cite specific Minutes of Decision or O'Reilly adjustments.
3. Economic Suppression: Cite interference with farming/water.

CITATION RULE: Every claim must cite the StableID [DOC-XXXXXX].
TONE: Academic, forensic, assertive. Use terms "Paper Genocide", "Administrative Erasure".
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeEvidence = async (task: Task, contextStats: string[] = [], retries = 3): Promise<any> => {
  let attempts = 0;
  
  if (!process.env.API_KEY) {
      console.error("%c[Gemini] STOP: API Key Missing.", "color: white; background: red; font-size: 14px; padding: 4px;");
  }

  // Methodology v2.0: Diagnostic Logging
  console.groupCollapsed(`%c[Analyst] Processing: ${task.id}`, "color: #10b981; font-weight: bold;");
  console.log(`[Provenance]: ${task.provenance}`);
  console.log(`[Hash]: ${task.hash}`);

  while (attempts <= retries) {
    try {
      const ai = getAIClient();
      // UPGRADE: Using Gemini 3.0 Pro Preview for superior nuance and reasoning
      const modelId = "gemini-3-pro-preview"; 
      
      const MAX_CHARS = 60000; 
      let contentStr = JSON.stringify(task.jsonContent, null, 2);
      
      if (contentStr.length > MAX_CHARS) {
          console.warn(`[Analyst] Truncating record ${task.id} (${contentStr.length} chars).`);
          contentStr = contentStr.substring(0, MAX_CHARS) + "\n...[TRUNCATED]...";
      }

      const prompt = `
      STABLE ID: ${task.id}
      PROVENANCE: ${task.provenance}
      DATE: ${task.timestamp}
      
      *** RECORD CONTENT ***
      ${contentStr}
      *** END RECORD ***
      
      INSTRUCTIONS:
      1. Normalize all entity names (Tetlanetea, Pukaist, etc.).
      2. Extract facts strictly adhering to the Clerk Standard.
      3. Extract the verbatim Key Evidence Quote.
      4. Categorize the breach.
      5. Assign Reliability flag.
      `;

      console.log(`Attempt ${attempts + 1}/${retries + 1}. Sending to ${modelId}...`);

      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: FORENSIC_CONTEXT,
          maxOutputTokens: 8192, 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isRelevant: { type: Type.BOOLEAN },
              isPrivileged: { type: Type.BOOLEAN },
              recordType: { 
                  type: Type.STRING, 
                  enum: [
                      "Minutes_of_Decision", 
                      "Correspondence", 
                      "Sketch_Map", 
                      "IAAR", 
                      "Tribunal_or_Court", 
                      "Internal_Report", 
                      "Academic_Scholarship", 
                      "News_or_Media", 
                      "Petition",
                      "Other"
                  ] 
              },
              legalOpinion: { type: Type.STRING, description: "Factual summary. NO opinions." },
              keyEvidenceQuote: { type: Type.STRING, description: "Verbatim quote supporting the finding." },
              relevanceScore: { type: Type.INTEGER },
              issueTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              relevanceLevel: { type: Type.STRING, enum: ["Hot", "Relevant", "Background", "Not Relevant"] },
              reliability: { type: Type.STRING, enum: ["Verified", "Unverified", "Reconstructed"] },
              entities: {
                  type: Type.OBJECT,
                  properties: {
                      people: { type: Type.ARRAY, items: { type: Type.STRING } },
                      locations: { type: Type.ARRAY, items: { type: Type.STRING } },
                      organizations: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
              },
              breachCategory: { 
                  type: Type.STRING, 
                  enum: [
                      "Land_Reduction_Trespass", 
                      "Governance_Sovereignty", 
                      "Fiduciary_Duty_Negligence", 
                      "Water_Rights_Fishing", 
                      "Coercion_Duress", 
                      "None"
                  ]
              }
            },
            required: ["isRelevant", "legalOpinion", "relevanceScore", "relevanceLevel", "entities", "breachCategory", "recordType", "reliability", "keyEvidenceQuote"]
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No response text from AI model");
      
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
        // Post-processing filter for forbidden words (Client-side safety net)
        const forbidden = ["likely", "suggests", "appears", "seems", "probably"];
        if (forbidden.some(word => parsed.legalOpinion.toLowerCase().includes(word))) {
            console.warn("[Clerk Standard] Violation detected. Flagging for review.");
            parsed.legalOpinion += " [AUTO-FLAGGED: CONTAINS OPINION WORDS]";
        }
      } catch (parseError) {
        // Fallback parsing logic
         const cleanJson = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
         parsed = JSON.parse(cleanJson);
      }
      
      console.log("%c[Analyst] Verdict Recorded.", "color: green;", parsed.breachCategory);
      console.groupEnd();
      return {
          ...parsed,
          prompt,
          rawResponse: jsonText
      };

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('Canceled')) {
          console.warn(`[Analyst] Task ${task.id} canceled.`);
          console.groupEnd();
          throw error;
      }

      console.error(`[Gemini] Error:`, error);
      attempts++;
      if (attempts > retries) throw error;
      await sleep(2000);
    }
  }
  
  console.groupEnd();
  throw new Error("Max retries exceeded");
};

export const generateDossierNarrative = async (tasks: Task[]): Promise<string> => {
    const ai = getAIClient();
    const modelId = "gemini-3-pro-preview"; 

    const topEvidence = tasks
        .filter(t => t.isRelevant)
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 50);

    const evidenceDump = topEvidence.map(t => `
    STABLE ID: ${t.id}
    DATE: ${t.timestamp}
    TYPE: ${t.recordType}
    SOURCE: ${t.provenance}
    FACTUAL SUMMARY: ${t.legalOpinion}
    KEY QUOTE: ${t.keyEvidenceQuote || "N/A"}
    THEME: ${t.breachCategory}
    ENTITIES: ${t.entities?.people?.join(', ')}
    `).join('\n---\n');

    const prompt = `
    GENERATE EXECUTIVE DOSSIER: PUKAIST SOVEREIGNTY
    
    EVIDENCE POOL:
    ${evidenceDump}
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                systemInstruction: SYNTHESIS_CONTEXT,
                maxOutputTokens: 8192,
            }
        });
        return response.text || "Failed to generate narrative.";
    } catch (e: any) {
         if (e.name === 'AbortError' || e.message?.includes('Canceled')) {
            return "Generation canceled.";
        }
        throw e;
    }
};

export const generateOpposingCounselAnalysis = async (task: Task): Promise<string> => {
    const ai = getAIClient();
    const modelId = "gemini-3-pro-preview";
    
    const prompt = `
    DOCUMENT: ${JSON.stringify(task.jsonContent)}
    LEGAL OPINION: ${task.legalOpinion}
    
    ROLE: You are the Crown Solicitor (Opposing Counsel).
    TASK: Attack this evidence. 
    1. Identify weaknesses (hearsay, vagueness, lack of signature).
    2. Suggest alternative interpretations that favor the Crown (e.g., "The silence implies consent").
    3. Attack the Chain of Custody if weak.
    
    OUTPUT: A ruthless, bulleted critique.
    `;
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
    });
    return response.text || "Analysis failed.";
}

export const generateLegalArgument = async (bundleTitle: string, tasks: Task[]): Promise<string> => {
    const ai = getAIClient();
    const modelId = "gemini-3-pro-preview";
    
    const evidenceList = tasks.map(t => `
    [${t.id}] (${t.timestamp}): ${t.legalOpinion}
    QUOTE: "${t.keyEvidenceQuote}"
    `).join('\n');
    
    const prompt = `
    ROLE: Senior Legal Counsel for Pukaist.
    TASK: Draft a legal submission paragraph for the argument: "${bundleTitle}".
    
    EVIDENCE:
    ${evidenceList}
    
    FORMAT:
    1. ISSUE: State the legal issue.
    2. FACTS: Weave the evidence quotes into a narrative. Cite IDs [DOC-XXXX].
    3. SUBMISSION: Conclude that the Crown breached its duty.
    
    TONE: Formal, persuasive, rigorous.
    `;
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
    });
    return response.text || "Drafting failed.";
}

// NEW: RAG-style query over the document set
export const askTheArchive = async (question: string, tasks: Task[]): Promise<string> => {
    const ai = getAIClient();
    const modelId = "gemini-3-pro-preview";

    // 1. Simple Client-Side Retrieval (Keyword matching to find relevant context)
    // In a real app, this would use vector embeddings. Here, we use a scoring heuristic.
    const queryTerms = question.toLowerCase().split(' ').filter(w => w.length > 3);
    
    const scoredTasks = tasks.map(task => {
        let score = 0;
        const text = (JSON.stringify(task.jsonContent) + (task.legalOpinion || '')).toLowerCase();
        queryTerms.forEach(term => {
            if (text.includes(term)) score += 1;
        });
        // Boost if verified or relevant
        if (task.reliability === 'Verified') score += 2;
        if (task.isRelevant) score += 2;
        return { task, score };
    });

    const contextDocs = scoredTasks
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20) // Limit to top 20 relevant docs to fit context
        .map(item => `
        [${item.task.id}] (${item.task.timestamp}) - ${item.task.recordType}
        SUMMARY: ${item.task.legalOpinion}
        CONTENT EXCERPT: ${item.task.content.substring(0, 300)}...
        PROVENANCE: ${item.task.provenance}
        `);

    if (contextDocs.length === 0) {
        return "No documents found in the archive matching the keywords in your question.";
    }

    const prompt = `
    ROLE: Expert Legal Historian for the Pukaist Archive.
    
    QUESTION: "${question}"
    
    AVAILABLE ARCHIVE DOCUMENTS (Top Matches):
    ${contextDocs.join('\n---\n')}
    
    INSTRUCTIONS:
    Answer the question strictly based on the provided documents.
    Cite every fact with its StableID [DOC-XXXXXX].
    If the documents do not contain the answer, state that clearly.
    Synthesize the timeline if relevant.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt
        });
        return response.text || "No response generated.";
    } catch (e: any) {
        console.error("Ask Archive Error:", e);
        return "Failed to query the archive. Please try a simpler question.";
    }
};
