# Pukaist Forensic Evidence System: Comprehensive Technical Methodology
**Version:** 2.0 (Refined Project Brief)  
**Date:** December 2025  
**Status:** Ground-Up Reprocessing Phase  
**Purpose:** Technical specification for legal-grade evidence management system

---

## 1. PROJECT OVERVIEW

### 1.1 Mission Statement
The Pukaist Evidence System (PESS) is a forensic document management and evidence synthesis platform designed to compile, authenticate, and present historical evidence for:
1. **Specific Claims Tribunal proceedings** (SCT-7001-20: Cook's Ferry Indian Band)
2. **Aboriginal Title assertions** for Pukaist (IR 10) and Spatsum (IR 11) reserves
3. **Duty to Consult litigation** related to infrastructure projects (e.g., Highland Valley Copper Mine)

### 1.2 Legal Context
- **Claimant:** Pukaist descendants (distinct from Cook's Ferry Band administrative entity)
- **Defendant:** Crown (Federal/Provincial)
- **Core Allegation:** Systematic land reduction, administrative erasure, and failure of fiduciary duty from 1878-present
- **Critical Period:** 1878-1916 (Commissioner transitions: Sproat → O'Reilly → McKenna-McBride)

### 1.3 The Counter-Narrative Mandate
Cook's Ferry Band's Specific Claim treats Pukaist as merely a "part" of Cook's Ferry. **Our mandate is to prove Pukaist operated as a distinct political entity** with separate:
- Chiefs (Tetlanetea documented at Pukaist, Spatsum, AND as "Spatsum Band" chief)
- Census listings
- Administrative correspondence
- Land allocations

---

## 2. LEGAL-GRADE STANDARDS

### 2.1 Admissibility Framework
To ensure evidence is admissible under the *Canada Evidence Act* and BC evidence rules, every document must satisfy:

| Test | Requirement | PESS Implementation |
|------|-------------|---------------------|
| **Authenticity** | Document is what it claims to be | SHA-256 hash at intake; original preserved in WORM storage |
| **System Integrity** | No grounds to doubt system reliability | Immutable originals; audit logs; documented chain of custody |
| **Best Evidence Rule** | Original or certified copy | WORM storage preserves byte-exact original |
| **Hearsay Exceptions** | Business/Government records | Source provenance recorded at intake (LAC RG10, BC Archives, etc.) |

### 2.2 The PESS Promise
> "This file came from [Source], was collected on [Date], has not been altered since (Hash: [SHA256]), and is stored in a logged, write-protected system. Here is the original, and here is how we use it."

### 2.3 Chain of Custody Mechanics
1. **Hashing:** SHA-256 computed at intake, stored in `.json` metadata sidecar
2. **WORM Storage:** `/01_Originals_WORM` is read-only; source files never modified
3. **Audit Logging:** All file moves, status changes, and metadata edits logged
4. **Provenance Fields:** Every file must have:
   - `Source_Archive` (e.g., "LAC RG10 Vol 3664")
   - `Acquired_On` (Date of download/receipt)
   - `Acquired_By` (Person/Agent responsible)

---

## 3. PROVENANCE ARCHITECTURE

### 3.1 The "No Orphaned Evidence" Rule
**CRITICAL:** Every document in `/02_Primary_Records` MUST have a traceable origin.

| Valid Provenance | Invalid Provenance |
|------------------|-------------------|
| "LAC RG10 Vol 3664 File 9882" | "Incoming" |
| "BC Archives GR-2982 Box 4" | "Unknown" |
| "CER Filing A92351-1" | "Found on disk" |
| "APS Database Record #121304" | "Downloaded sometime" |

### 3.2 Source Classification
| Source Type | Code | Definition | Reliability |
|-------------|------|------------|-------------|
| Minutes of Decision | `MoD` | Original allocation/reduction orders | **Verified** |
| Correspondence | `CORR` | Letters between officials | **Verified** |
| Sketch Map | `MAP` | Survey/boundary documents | **Verified** |
| IAAR | `IAAR` | Indian Affairs Annual Reports | **Verified** |
| Tribunal/Court | `TRIB` | Legal filings, judgments | **Verified** |
| Internal Report | `INT` | AI-generated analysis | **Derivative** (not evidence) |
| Academic | `ACAD` | Scholarly secondary sources | **Unverified** |
| News/Media | `NEWS` | Journalistic coverage | **Unverified** |

### 3.3 Reliability Flags
- **Verified:** Seen in primary government record; authenticated
- **Unverified:** Asserted in secondary source; requires verification
- **Reconstructed/Interpretive:** Inferred from multiple sources; use with caution

---

## 4. DATA ARCHITECTURE

### 4.1 Folder Hierarchy (Physical Layout)
```
/00_Index/                    # Master indexes, TSV databases
/00_Staging_Area/             # Temporary intake (short-term only)
/01_Originals_WORM/           # WRITE-ONCE READ-MANY (immutable)
/01_Internal_Reports/         # AI analysis (NOT evidence)
/02_Primary_Records/          # Clean working copies (text-readable)
/03_Academic_Scholarship/     # Secondary sources
/04_News_Media/               # Journalistic sources
/05_Misc_Exhibits/            # Auxiliary materials
/06_Images/                   # Visual evidence (maps, photos)
/07_Incoming_To_Process/      # Main intake queue
/07_Incoming_To_Process_OCR/  # OCR staging queue
/99_Working_Files/            # Scripts, queues, logs
/Agent_Instructions/          # Role-specific agent protocols
```

### 4.2 Naming Convention
**Format:** `[StableID]_[Category]_[ShortDescription]_[Year].[ext]`

| Component | Format | Example |
|-----------|--------|---------|
| StableID | `DOC-XXXXXX` | `DOC-000123` |
| Category | `PRIM`, `INT`, `ACAD`, `NEWS`, `MISC`, `IMG` | `PRIM` |
| Description | ASCII, no spaces, underscores | `OReilly_MoD_Pukaist` |
| Year | `YYYY` or `YYYY-YYYY` | `1881` |

**Full Example:** `DOC-000123_PRIM_OReilly_MoD_Pukaist_1881.pdf`

### 4.3 Metadata Schema (Master Index)
Every document must have these fields populated:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `StableID` | String | **Yes** | Unique identifier (DOC-XXXXXX) |
| `Filename` | String | **Yes** | Current filename |
| `Category` | Enum | **Yes** | PRIM/INT/ACAD/NEWS/MISC/IMG |
| `SourceType` | Enum | **Yes** | Minutes_of_Decision, Correspondence, etc. |
| `Provenance` | String | **Yes** | Archive reference (LAC RG10, BC Archives, etc.) |
| `Jurisdiction` | String | **Yes** | BC/Federal/Provincial |
| `People_Entities` | List | **Yes** | Normalized names (Tetlanetea, O'Reilly, etc.) |
| `Geography` | List | No | Places mentioned |
| `Time_Date` | String | **Yes** | YYYY or YYYY-YYYY (never "Unknown") |
| `EvidenceType` | String | No | Legal theme classification |
| `Reliability` | Enum | **Yes** | Verified/Unverified/Reconstructed |
| `OCR_Status` | Enum | **Yes** | Yes/No/Pending |
| `Status` | Enum | **Yes** | NotStarted/InProgress/Ready/Deferred/Superseded |
| `Hash_SHA256` | String | **Yes** | Computed at intake |
| `FilePath` | String | **Yes** | Absolute path |

---

## 5. ENTITY NORMALIZATION (KEYWORD PLAYBOOK)

### 5.1 The Problem
Historical documents use inconsistent spellings due to:
- Different recorders/clerks
- OCR artifacts from handwriting
- Phonetic interpretation of Indigenous names

### 5.2 Reserve Names (with IR Numbers)
| Canonical | IR# | Variants |
|-----------|-----|----------|
| **Pukaist** | IR10 | Pokheitsk, Pokeist, Pokhaist, Toketic, Pekeyst, Pokyst, pekA-ysht, Po.klep (water) |
| **Spatsum** | IR11 | Spaptsum, Toketi (church), Spatzum, Spatzzum |
| **Pemynoos** | IR9 | Pemynos |
| **Nicoelton** | IR6 | Nicolton, Nicoelten |
| **Kloklowuck** | IR7 | — |
| **Shawniken** | IR3 | — |
| **Spences Bridge** | IR4 | — |
| **Entlqwe** | IR12 | — |

### 5.3 Administrative Entities (Bands)
| Entity | Definition |
|--------|------------|
| **Cook's Ferry Band** | Administrative entity encompassing IR3-12 |
| **Spatsum Band** | Distinct band documented in 1908 petition (D1418), associated with IR11 |
| **Nlaka'pamux Nation** | Broader nation encompassing Cook's Ferry, Lytton, and other bands |

### 5.4 Chiefs & Leadership (Critical Disambiguation)
| Canonical | Variants | Role | Key Sources |
|-----------|----------|------|-------------|
| **Tetlanetea** | Tetlenitsa, TetlEnitsa, Titlanetea, Tetlenetza, Titlenitsa, Titlenic'e, Tedlanetsa, Tedlenitsa, Teetleneetsah, Titlanetza, John Tetlenitsa, John Tedlenitsa, John Titlanetza | Chief of Pukaist, Spatsum, AND Spatsum Band (1878-1916) | D1418 (1908 petition), D900 (Ottawa 1916), D379 (orchardist), Sproat (1878) |
| **Shemahallsee** | Smxellce', Shumahaltse, Sumahalta, Shumahaliza, Timothy Shumahaliza | Chief of Pukaist (late 19th c.) | D1138 genealogical records |
| **Whistemnitsa** | alias Yopalla | Chief of Cook's Ferry Band | D1418 (1908) |

### 5.5 Officials
| Name | Role |
|------|------|
| **Peter O'Reilly** | Indian Reserve Commissioner (1881-1898); responsible for reserve reductions |
| **Gilbert Malcolm Sproat** | Joint Reserve Commissioner (1878-1880); made initial allotments |
| **J.A.J. McKenna** | Chair, McKenna-McBride Commission (1913-1916) |
| **W.E. Ditchburn** | Chief Inspector of Indian Agencies |
| **Richard McBride** | BC Premier; opposed Indigenous land claims |

---

## 6. QUALITY CONTROL PIPELINE

### 6.1 The 4-Layer Filter Stack
Documents must pass each gate before entering the evidence queue:

#### Layer 1: SNR Gate (Signal-to-Noise)
**Purpose:** Reject garbled OCR immediately
**Thresholds:**
- Stop word density < 5% → REJECT
- Non-alphanumeric ratio > 40% → REJECT
- Text length < 50 chars on multi-page file → REJECT

**Action:** Failures move to `/07_Incoming_To_Process_OCR/Vision_Required`

#### Layer 2: Relevance Filter ("Pukaist First")
**Purpose:** Eliminate geographic false positives

**Include (Must have 1+):**
- Primary Keys: Pukaist, Pokheitsk, Spatsum, Reserve No. 10, Cook's Ferry, Tetlanetea
- Contextual: "Kamloops Agency" AND (O'Reilly OR Sproat OR McKenna)

**Exclude (Poison Pills):**
- Nova Scotia, Manitoba, Saddle Lake, Treaty No. 6 (unless establishing Federal policy precedent)

#### Layer 3: Smart Window Extraction
**Purpose:** Solve context drift in large documents
**Method:**
1. Locate Primary Key in text
2. Extract 4,000-char window (2,000 before, 2,000 after)
3. Merge overlapping windows
4. Snap to sentence/paragraph boundaries

#### Layer 4: Thematic Sharding
**Purpose:** Route evidence to specialized agents/queues

| Theme | Keywords | Queue |
|-------|----------|-------|
| Land Reduction & Trespass | Survey, Acre, Boundary, Pre-emption, Encroachment | `Land_Reduction_Trespass` |
| Governance & Sovereignty | Chief, Council, Title, Election, Self-government | `Governance_Sovereignty` |
| Fiduciary Duty & Negligence | Trust, Fund, Mismanagement, Failure, Protection | `Fiduciary_Duty_Negligence` |
| Water Rights & Fishing | Ditch, Irrigation, Water License, Fishing | `Water_Rights_Fishing` |
| Coercion & Duress | Surrender, Consent, Forced, Threat | `Coercion_Duress` |

---

## 7. TEMPORAL INTEGRITY PROTOCOL

### 7.1 The "Time Anchor" Rule
Every piece of evidence must be anchored in time. **"Unknown" is forbidden.**

### 7.2 Date Extraction Hierarchy
1. **Explicit Date:** Written on document ("June 14, 1885")
2. **Contextual Date:** Derived from content ("Fiscal Year ending 1913")
3. **Archival Date:** From filename/folder (`1880_Sproat/...`)
4. **Inferred Date:** Based on known events ("McKenna-McBride" = ~1913-1916)
5. **Undated:** Last resort (only if no temporal markers exist)

### 7.3 Validation Rule
- Date field must be `YYYY` or `Undated`
- Submissions with "Unknown" or missing dates are **automatically rejected**

---

## 8. LEGAL THEMES & EVIDENCE CATEGORIES

### 8.1 Theme 1: Land Reduction & Trespass
**Legal Basis:** Unlawful reduction of reserve lands; failure to prevent encroachment
**Key Events:**
- 1878: Sproat allots reserves (original configuration)
- 1881: O'Reilly "reduces" allocations (no documented consent)
- 1880s-1890s: Ah Chung, Ah Yep pre-emptions on reserve lands
- 1913-1916: McKenna-McBride "cut-off" lands
- Post-1916: Railway right-of-way takings

**Evidence Targets:**
- Minutes of Decision (MoD) showing acreage changes
- Survey plans with conflicting boundaries
- Correspondence re: encroachment complaints
- Pre-emption records

### 8.2 Theme 2: Governance & Sovereignty
**Legal Basis:** Recognition of Pukaist as distinct political entity; unextinguished Aboriginal title
**Key Evidence:**
- Separate chief signatories (Tetlanetea distinct from Cook's Ferry chiefs)
- Census records listing Pukaist separately
- 1908 petition signed by "Spatsum Band" leadership
- 1916 Ottawa delegation records

**Evidence Targets:**
- Petitions and deputations
- Agency correspondence mentioning distinct leadership
- Census/population reports

### 8.3 Theme 3: Fiduciary Duty & Negligence
**Legal Basis:** Crown's failure to protect Indigenous interests; mismanagement of trust funds
**Key Evidence:**
- Failure to prevent settler encroachment
- Mishandling of right-of-way compensation
- Water license denials while approving settler applications
- Highland Valley mine impacts on ancestral territory

### 8.4 Theme 4: Water Rights & Fishing
**Legal Basis:** Aboriginal water rights; interference with traditional food sources
**Key Evidence:**
- Irrigation ditch disputes
- Water license applications (denied to Indigenous, granted to settlers)
- Fishing restrictions

### 8.5 Theme 5: Coercion & Duress
**Legal Basis:** Invalid surrenders obtained through threats or lack of informed consent
**Key Evidence:**
- Correspondence showing pressure tactics
- Absence of proper consent documentation
- "Cut-off" procedures without band votes

---

## 9. AGENT PROTOCOL & WORKFLOW

### 9.1 The "Clerk" Standard
**CRITICAL:** Agents are **Clerks and Archivists**, not Analysts or Judges.

**FORBIDDEN:**
- Opinion words: suggests, implies, likely, possibly, appears to be
- Conclusions: "This is evidence of fraud"
- Placeholders: "OCR is illegible" (flag instead)

**REQUIRED:**
- Verbatim quotations with page citations
- Dry factual descriptions ("Letter from O'Reilly to Powell regarding survey instructions")
- Direct quotes when extracting evidence

### 9.2 Agent Roles
| Role | Responsibility | Output Location |
|------|----------------|-----------------|
| **Gatekeeper** | Intake, hashing, StableID assignment | `/02_Primary_Records`, Index |
| **Analyst** | Thematic review, evidence extraction | JSON analysis files |
| **Scribe** | OCR processing, Vision queue | `/02_Primary_Records` |
| **Archivist** | Consolidation, timeline maintenance | Master Dossier |
| **Historian** | Chronological integration | Master Chronology |
| **Author** | Report synthesis | Preliminary Evidence Report |
| **Barrister** | Legal instrument assembly | Thematic Briefs, Draft Claims |

### 9.3 Workflow Cycle
```
1. INTAKE → Gatekeeper assigns StableID, computes hash, moves to WORM
2. TRIAGE → SNR Gate filters garbage; Relevance Filter removes false positives
3. QUEUE → Smart Window extraction; Thematic sharding
4. REVIEW → Analyst processes queue; produces JSON analysis
5. CONSOLIDATE → Archivist merges to Master Dossier
6. SYNTHESIZE → Author updates Preliminary Evidence Report
7. PRODUCE → Barrister assembles legal instruments
```

---

## 10. OUTPUT STANDARDS

### 10.1 JSON Analysis Format
```json
{
  "batch_id": "[Batch_ID]",
  "results": [
    {
      "task_id": "[Task_ID]",
      "doc_id": "[StableID]",
      "title": "[Document Title]",
      "date": "[YYYY]",
      "provenance": "[Archive Reference]",
      "relevance": "High/Medium/Low",
      "summary": "Factual description (no opinions)",
      "key_evidence": [
        {
          "quote": "Verbatim text...",
          "page": "Page Number",
          "significance": "Legal theme connection"
        }
      ]
    }
  ]
}
```

### 10.2 Evidence Citation Format
Every claim must cite: `[StableID] (Source, Page)`

**Example:**
> "The Reserve contains 79.9 acres as surveyed." [DOC-000456] (LAC RG10 Vol 3664, p. 23)

### 10.3 Machine-Readable Footer
Every analysis block must end with:
```markdown
> **Batch ID:** [Batch_ID] | **Task ID:** [Task_ID]
---
```

---

## 11. CURRENT STATE (RESET STATUS)

### 11.1 File Inventory (Post-Reset)
| Location | Count | Status |
|----------|-------|--------|
| `/07_Incoming_To_Process` | **5,031** | Queued for fresh processing |
| `/07_Incoming_To_Process_OCR` | **3,007** | Awaiting OCR/Vision |
| `/02_Primary_Records` | **0** | Emptied for reprocessing |
| `/01_Originals_WORM` | ~900 | Preserved chain-of-custody copies |

### 11.2 Why Reset Was Necessary
1. **Citation Errors:** Tetlanetea incorrectly attributed to single band
2. **Entity Normalization Gaps:** Missing OCR spelling variants
3. **Provenance Drift:** Files processed without proper source tracking
4. **Quality Control Gaps:** Noisy OCR text propagated into evidence

### 11.3 Reprocessing Priority
1. **Phase 1:** Re-ingest with updated entity normalization
2. **Phase 2:** Apply strict provenance validation
3. **Phase 3:** Route through 4-Layer Filter Stack
4. **Phase 4:** Thematic analysis with updated keyword playbook

---

## 12. SUMMARY: THE LEGAL-GRADE PIPELINE

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTAKE (07_Incoming_To_Process)              │
│  • Assign StableID (DOC-XXXXXX)                                 │
│  • Compute SHA-256 hash                                         │
│  • Record provenance (archive source, date, collector)          │
│  • Copy original to WORM storage (01_Originals_WORM)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: SNR GATE                            │
│  • Stop word density check (≥5% required)                       │
│  • Alphanumeric ratio check (≥60% required)                     │
│  • FAIL → Vision_Required queue                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 2: RELEVANCE FILTER                    │
│  • Primary Key match (Pukaist, Tetlanetea, IR 10, etc.)         │
│  • Geographic validation (BC Interior context)                  │
│  • Poison pill exclusion (Nova Scotia, Treaty 6, etc.)          │
│  • FAIL → Low_Relevance archive                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 3: SMART WINDOW                        │
│  • Anchor on Primary Key                                        │
│  • Extract 4,000-char context window                            │
│  • Merge overlapping windows                                    │
│  • Snap to sentence boundaries                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 4: THEMATIC SHARDING                   │
│  • Land Reduction & Trespass queue                              │
│  • Governance & Sovereignty queue                               │
│  • Fiduciary Duty & Negligence queue                            │
│  • Water Rights & Fishing queue                                 │
│  • Coercion & Duress queue                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSIS & EXTRACTION                        │
│  • Analyst reviews (Clerk Standard: verbatim only)              │
│  • JSON output with quotes + page citations                     │
│  • Validation gates (no "Unknown", no opinions)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONSOLIDATION & OUTPUT                       │
│  • Master Evidence Dossier (verbatim quotes)                    │
│  • Thematic Briefs (legal argument support)                     │
│  • Preliminary Evidence Report (narrative synthesis)            │
│  • Production Sets (court-ready bundles)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## APPENDIX A: VALIDATION GATES (AUTOMATED REJECTION)

| Gate | Rule | Error Message |
|------|------|---------------|
| Metadata Integrity | `doc_id`, `title`, `provenance` must exist | "CRITICAL: 'Unknown ID' detected" |
| Temporal Integrity | Date must be YYYY or Undated | "CRITICAL: 'Unknown Date' is FORBIDDEN" |
| Clerk Standard | No opinion words | "VIOLATION: Forbidden opinion word detected" |
| Content Quality | Analysis > 100 characters | "VIOLATION: Submission is too short" |

---

## APPENDIX B: FORBIDDEN WORDS LIST

```
suggests, implies, likely, possibly, appears to be, seems, 
opinion, speculates, indicates, probably, might, could be,
potentially, presumably
```

---

## APPENDIX C: GEOGRAPHIC FENCE

**INCLUDE:**
- British Columbia Interior
- Kamloops Agency / Lytton Agency
- Nicola Valley
- Thompson River corridor
- Fraser Canyon

**EXCLUDE (unless Federal policy precedent):**
- Alberta (Saddle Lake, Blackfoot)
- Saskatchewan (Fishing Lake)
- Manitoba
- Ontario
- Nova Scotia (Micmacs)
- Treaty territories (Treaty 6, 7, 8)

---

*Document generated for project refinement purposes. This methodology is designed to produce legally defensible evidence compilations suitable for Specific Claims Tribunal and court proceedings.*
