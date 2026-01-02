
import { Task, AgentLog } from './types';

export const MOCK_TASKS: Task[] = [
  {
    id: 'DOC-001536',
    path: 'admin_corresp/sproat_resignation_1880.json',
    status: 'COMPLETED',
    provenance: 'LAC RG10 Vol 3664 File 9882',
    hash: 'a1b2c3d4e5f6...',
    content: JSON.stringify({
      sender: "Gilbert Malcolm Sproat",
      recipient: "Superintendent General",
      date: "1880-03-15",
      subject: "Resignation",
      excerpt: "I cannot administer a policy that discourages Indigenous self-governance."
    }, null, 2),
    jsonContent: {
      sender: "Gilbert Malcolm Sproat",
      recipient: "Superintendent General",
      date: "1880-03-15",
      subject: "Resignation",
      excerpt: "I cannot administer a policy that discourages Indigenous self-governance."
    },
    timestamp: '1880-03-15 00:00:00',
    isRelevant: true,
    isPrivileged: false,
    recordType: 'Correspondence',
    legalOpinion: 'Letter from Sproat resigning in protest of restrictive policies. Marks end of liberal policy era.',
    relevanceScore: 98,
    relevanceLevel: 'Hot',
    reliability: 'Verified',
    reviewedBy: 'LexiScout AI',
    issueTags: ['Administrative Negligence', 'Policy Shift', 'Sproat Era'],
    entities: {
        people: ["G.M. Sproat", "Superintendent General"],
        locations: ["British Columbia"],
        organizations: ["Joint Reserve Commission"]
    },
    breachCategory: 'Fiduciary_Duty_Negligence'
  },
  {
    id: 'DOC-001249',
    path: 'land_registry/minute_decision_pukaist_1880.json',
    status: 'COMPLETED',
    provenance: 'BC Archives GR-2982 Box 4',
    hash: 'f6e5d4c3b2a1...',
    content: JSON.stringify({
      authority: "Joint Reserve Commission",
      commissioner: "G.M. Sproat",
      location: "Reserve No. 10 (Pokheitsk)",
      allocation: "30 inches of water",
      priority: "Absolute prior right"
    }, null, 2),
    jsonContent: {
      authority: "Joint Reserve Commission",
      commissioner: "G.M. Sproat",
      location: "Reserve No. 10 (Pokheitsk)",
      allocation: "30 inches of water",
      priority: "Absolute prior right"
    },
    timestamp: '1880-06-01 00:00:00',
    isRelevant: true,
    isPrivileged: false,
    recordType: 'Minutes_of_Decision',
    legalOpinion: 'Minute of Decision assigning Pukaist absolute prior water rights. Later cancelled/ignored.',
    relevanceScore: 100,
    relevanceLevel: 'Hot',
    reliability: 'Verified',
    reviewedBy: 'LexiScout AI',
    issueTags: ['Water Rights', 'Original Title'],
    entities: {
        people: ["G.M. Sproat"],
        locations: ["Reserve No. 10", "Pokheitsk"],
        organizations: ["Joint Reserve Commission", "Pukaist"]
    },
    breachCategory: 'Water_Rights_Fishing'
  },
  {
    id: 'DOC-001418',
    path: 'petitions/chiefs_petition_1908.json',
    status: 'PENDING',
    provenance: 'LAC RG10 Vol 1123',
    hash: 'pending_hash...',
    content: JSON.stringify({
      type: "Petition",
      signatories: ["Chief Tetlanetea (Pukaist)", "Chief Whistemnitsa (Cook's Ferry)"],
      demands: ["Removal of Agent Irwin", "Water rights"]
    }, null, 2),
    jsonContent: {
      type: "Petition",
      signatories: ["Chief Tetlanetea (Pukaist)", "Chief Whistemnitsa (Cook's Ferry)"],
      demands: ["Removal of Agent Irwin", "Water rights"]
    },
    timestamp: '1908-05-12 00:00:00',
  }
];

export const MOCK_LOGS: AgentLog[] = [
  {
    id: 'log1',
    timestamp: '1920-01-01 09:00:00',
    agentName: 'System',
    status: 'GREEN',
    message: 'Forensic System Initialized',
    details: 'Methodology v2.0 Active. WORM Storage Ready.'
  }
];
