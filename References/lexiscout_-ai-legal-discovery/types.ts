
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED';

// Methodology v2.0: Source Classifications
export type RecordType = 
  | 'Minutes_of_Decision' // MoD
  | 'Correspondence'      // CORR
  | 'Sketch_Map'          // MAP
  | 'IAAR'                // IAAR
  | 'Tribunal_or_Court'   // TRIB
  | 'Internal_Report'     // INT (Not evidence)
  | 'Academic_Scholarship'// ACAD
  | 'News_or_Media'       // NEWS
  | 'Petition'            // Critical for Sovereignty
  | 'Other';

export type RelevanceLevel = 'Hot' | 'Relevant' | 'Background' | 'Not Relevant' | 'Privileged';

// Methodology v2.0: Thematic Sharding Categories
export type BreachCategory = 
  | 'Land_Reduction_Trespass' 
  | 'Governance_Sovereignty' 
  | 'Fiduciary_Duty_Negligence' 
  | 'Water_Rights_Fishing' 
  | 'Coercion_Duress' 
  | 'None';

export type ReliabilityFlag = 'Verified' | 'Unverified' | 'Reconstructed';

export interface HistoricalEntities {
  people: string[];
  locations: string[];
  organizations: string[];
}

export interface Task {
  id: string; // StableID: DOC-XXXXXX
  path: string; // Filename
  status: Status;
  
  // Chain of Custody / Metadata
  provenance: string; // Archive Source (e.g., "LAC RG10 Vol 3664")
  hash: string; // SHA-256 Hash
  
  // Input Data
  content: string; 
  jsonContent: any; 
  timestamp: string; // ISO format (YYYY-MM-DD)
  originalDateString?: string; // The "Time Anchor"
  
  // Forensic Analysis Results
  isRelevant?: boolean; 
  isPrivileged?: boolean; 
  privilegeBasis?: string; 
  recordType?: RecordType;
  legalOpinion?: string; // "Clerk Standard" Factual Summary
  keyEvidenceQuote?: string; // The "Smoking Gun" verbatim quote
  relevanceScore?: number; 
  issueTags?: string[]; 
  relevanceLevel?: RelevanceLevel;
  reliability?: ReliabilityFlag;
  
  // Forensic Additions
  entities?: HistoricalEntities;
  breachCategory?: BreachCategory;

  // Metadata
  reviewedBy?: string;
  processTime?: number;
  
  // Human Verification & Workflow
  isHumanVerified?: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  isPinned?: boolean; // New Pinning Feature
}

export interface CaseBundle {
    id: string;
    title: string;
    description: string;
    evidenceIds: string[];
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentName: string;
  status: 'GREEN' | 'YELLOW' | 'RED' | 'BLUE';
  message: string;
  details?: string;
  promptUsed?: string;
  rawResponse?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  relevant: number;
  privileged: number;
  verified: number;
  pinned: number;
}
