# Pukaist Automation & Indexing Agents

# Purpose
This repo uses a review-first workflow to tag, index, and extract evidence for the Pukaist forensic/sovereignty dossier. No automatic renames or moves; everything is curated and recorded.

# Core files
- `00_Taxonomy_And_Conventions.md`: Rulebook for source types, naming, entity normalization, reliability, OCR status, statuses, placement.
- `00_Index/Master_Index_Expanded.tsv`: Main index (StableID, Filename, Category, SourceType, Provenance, Jurisdiction, People_Entities, Geography, Time_Date, EvidenceType, Reliability, OCR_Status, Status, Notes, FilePath).
- `99_Working_Files/Proposed_Index_Entries.tsv`: Heuristic proposals from `99_Working_Files/auto_indexer.py` (review-only; never auto-apply).
- `99_Working_Files/auto_indexer.py`: Scans `07_Incoming_To_Process*` for heuristic tags; writes proposals; never renames/moves.

# Taxonomy (controlled)
- SourceType: Minutes_of_Decision; Correspondence; Sketch_Map; IAAR; Index; Tribunal_or_Court; Internal_Report_or_Draft; Academic_Scholarship; News_or_Media; Other.
- Category: PRIM (Primary_Govt_Record); INT (Internal); ACAD; NEWS; MISC; IMG.
- Reliability: Verified (seen in primary); Unverified (asserted/secondary); Reconstructed/Interpretive.
- OCR_Status: Yes; No (Needs OCR); Pending.
- Status: NotStarted; InProgress; Ready; Deferred; Superseded.
- Placement: 01_Originals_WORM; 01_AI_Generated_Reports; 02_Primary_Records; 05_Misc_Exhibits; 06_Images; 07_Incoming_To_Process (staging); 07_Incoming_To_Process_OCR (OCR staging).
- Naming: `[StableID]_[Category]_[ShortDescription]_[Year or YearSpan].[ext]`, ASCII, concise.
  - StableID: `DOC-XXXXXX` (e.g., DOC-000123) for new promotions.  
  - **Legacy StableIDs:** Existing archive items use IDs like `D01`, `D604`, `D1418` and matching filenames. These legacy IDs are permanent. **Do not rename or re-number them.** When citing or refining legacy files, keep the legacy ID verbatim. Cross‑references belong in Notes (`LegacyStableID=D1418`), not in renamed files.
  - **Legacy categories:** Older Master Index rows may include non‑controlled Category values (e.g., `KEY`). Do not rewrite legacy rows. For new entries, use only the controlled Category list unless a Manager directs otherwise.

# Keyword playbook (canonical/variants)
*Updated: Comprehensive entity normalization for quality control*

## Reserve Names (with IR numbers)
- **Pukaist (IR10):** Pokheitsk / Pokeist / Pokhaist / Toketic / Pekeyst / Pokyst / pekA-ysht / Po.klep (water) — canonical: "Pukaist"
- **Spatsum (IR11):** Spaptsum / Toketi (church) / Spatzum / Spatzzum — canonical: "Spatsum"
- **Pemynoos (IR9):** Pemynos — canonical: "Pemynoos"
- **Nicoelton (IR6):** Nicolton / Nicoelten — canonical: "Nicoelton"
- **Kloklowuck (IR7)** — canonical: "Kloklowuck"
- **Shawniken (IR3)** — canonical: "Shawniken"
- **Spences Bridge (IR4)** — canonical: "Spences Bridge"
- **Entlqwe (IR12)** — canonical: "Entlqwe"

## Bands (Administrative Entities)
- **Cook's Ferry Band:** Administrative entity encompassing multiple reserves (IR3-12).
- **Spatsum Band:** Distinct band documented in 1908 petition (D1418). Associated with IR11.
- **Nlaka'pamux Nation:** Broader nation encompassing Cook's Ferry, Lytton, and other bands.

## Chiefs & Leadership (with source citations)
*Note: Historical records have inconsistent spellings due to different recorders, OCR artifacts, and handwriting interpretation.*
- **Tetlanetea:** Tetlenitsa / TetlEnitsa / Titlanetea / Tetlenetza / Titlenitsa / Titlenic'e / Tedlanetsa / Tedlenitsa / Teetleneetsah / Titlanetza / John Tetlenitsa / John Tedlenitsa / John Titlanetza — *Documented as chief of Pukaist, Spatsum, and Spatsum Band across various sources (active 1878-1916). Attributions vary by recorder.*
- **Shemahallsee:** Smxellce' / Shumahaltse / Sumahalta / Shumahaliza / Timothy Shumahaliza — *Chief of Pukaist per D1138 (late 19th c.)*
- **Whistemnitsa:** alias Yopalla — *Chief of Cook's Ferry Band per D1418 (1908)*
- **Whitmetea** — Other documented chief.

## Officials
- O'Reilly; Sproat; McKenna; Ditchburn; McBride; Tate.

## Geography
- Thompson River; Nicola River; Spences Bridge; Pukaist Creek (= Po.klep stream).

# Factual Baseline (The "Truth" Anchor)
*Added Nov 24, 2025 - To prevent hallucination of basic facts*

## Strategic Context: The Cook's Ferry Suppression
*Added Dec 3, 2025 - The "Counter-Narrative" Mandate*

**The Conflict:** Cook's Ferry Band is actively using the Specific Claims process to claim compensation for Pukaist lands (IR 10), effectively erasing Pukaist's distinct title. They argue Pukaist is merely a "part" of Cook's Ferry.

**The Evidence We Need:** To refute this, we must find evidence of **Pukaist's Distinctness** during the critical **1880-1920** period (post-allocation, pre-amalgamation).
*   **Look For:** Separate Census listings, distinct Chiefs (Tetlanetea vs. Cook's Ferry Chiefs), separate agency reporting, or letters signed by Pukaist leadership independent of Cook's Ferry.
*   **The Goal:** Prove that Pukaist operated as a sovereign political entity *after* the supposed amalgamation date.

## Core Identities
*   **Pukaist:** Specifically **Reserve No. 10** (Pokheitsk). Located at the mouth of Pukaist Creek.
*   **Spatsum:** Specifically **Reserve No. 11**. Located on the left bank of the Thompson River.
*   **Spatsum Band:** Distinct political entity documented in 1908 petition (D1418) with its own Chief (Tetlanetea/Tetlenitsa). Associated with IR11.
*   **Cook's Ferry Band:** The administrative entity encompassing Pukaist, Spatsum, and other reserves (e.g., Pemynoos No. 9, Entlqwe No. 12).
*   **Reserve No. 9:** This is **Pemynoos** (or Pemynos), NOT Pukaist. Do not conflate them unless the document explicitly links them.

## Known Entities
*   **Chief Tetlanetea (Tetlenitsa):** Documented as chief of Pukaist, Spatsum, and Spatsum Band in various sources (active 1878-1916). Attributions vary by recorder and context. Key sources: D1418 (1908 petition), D900 (Ottawa 1916), D379 (orchardist), Sproat correspondence (1878).
*   **Chief Shemahallsee (Smxellce'):** Chief of Pukaist per genealogical records (D1138, late 19th c.).
*   **Chief Whistemnitsa (alias Yopalla):** Chief of Cook's Ferry Band per 1908 petition (D1418).
*   **Commissioner O'Reilly:** Responsible for the 1881 Minutes of Decision.
*   **Commissioner Sproat:** Preceded O'Reilly; his earlier decisions are often the basis for "Unlawful Reduction" claims.

# Relevance Filtering & False Positives (Strict Context)
*Added Nov 24, 2025 - The "Pukaist First" Rule*

## Purpose
To prevent the dossier from being flooded with irrelevant data from other provinces or unrelated bands, which often share generic keywords like "Reserve", "Chief", or "Land Sale".

## The Filter
**Rule:** Evidence must be geographically or legally linked to the **Pukaist / Nlaka'pamux / Cook's Ferry** context.

### 1. Geographic Bounds (The "Fence")
*   **INCLUDE:** British Columbia Interior, Kamloops Agency, Lytton Agency, Nicola Valley, Thompson River, Fraser Canyon.
*   **EXCLUDE:** Alberta (Saddle Lake, Blackfoot), Saskatchewan (Fishing Lake), Manitoba, Ontario, Nova Scotia (Micmacs), unless establishing a *direct* Federal policy precedent that was applied to Pukaist.

### 2. False Positive Traps
*   **"Reserve":** This keyword appears in every Indian Affairs report. Check the *Agency* or *Province* immediately. If it says "Sask." or "N.S.", ignore it unless it mentions a specific official (e.g., O'Reilly) known to operate in BC.
*   **"Chief":** Generic title. Must be linked to Tetlanetea, Whitmetea, or Nlaka'pamux leadership.
*   **"Land Sale":** Common across Canada. Only relevant if it pertains to BC Reserves or the specific "Cut-off" policy affecting Pukaist.

### 3. Handling Irrelevant Hits
*   **Action:** If a task contains *only* irrelevant data (e.g., "Micmacs of Nova Scotia"), mark the relevance as **Low** or **Junk** in the JSON analysis.
*   **Note:** Do NOT fabricate a connection. If the document is D72 (Auditor General's Report) and the specific page is about Nova Scotia, that specific page is *irrelevant*, even if the document itself is Primary.

# Workflow
1) Intake: land new files in `07_Incoming_To_Process` (or `_OCR` for OCR batching). Never auto-rename.
2) Propose: run `99_Working_Files/auto_indexer.py`; review/edit `Proposed_Index_Entries.tsv`; assign StableIDs only when promoting.
3) Approve: append curated rows to `00_Index/Master_Index_Expanded.tsv`; manually move/rename per naming convention; update `Incoming_Index.tsv` if used.
4) OCR/vision: tracked via OCR_Status. High-quality OCR (e.g., Adobe) for scans; vision OCR for handwriting. After OCR, search for targets, note page ranges, slice exhibits, register new D-IDs.
5) Extraction targets: use `OBI_Target_Pages.txt` and `Slice_Plan_Skeleton.tsv` to map index hits to MoD pages post-OCR.

# Codex CLI Environment & Version Notes
*Added Dec 11, 2025 - Codex CLI 0.71.0 operational reminders*

## Active Harness Settings (read from the session header)
- `approval_policy=never` + `sandbox_mode=danger-full-access` + `network_access=enabled` means Codex can run shell commands and edit files anywhere without asking.
- This does **not** override repo safety rules: no auto‑renames/moves, no StableID overwrites, no destructive actions (`rm`, bulk `mv`, `git reset`, mass edits) unless explicitly directed, and no script‑based shortcutting for JSON task analysis.
- Treat full access as higher‑risk: prefer minimal, reviewable patches and non‑destructive reads unless a task explicitly calls for broader changes.

## CLI Feature Reminders (what to use here)
- **Skills (`/skills` or `$SkillName`):** create/select role skills (Analyst/Indexer/OCR‑Vision/Clerk) so the Clerk stance, banned‑word list, and other protocol stay injected every turn.
- **Repo skills location:** this repo ships Codex skill files in `.codex/skills/**/SKILL.md`, auto‑discovered at startup. Current Pukaist skills: `manager-planner`, `large-report-editor`, `land-reduction-trespass`, `governance-sovereignty`, `fiduciary-duty-negligence`, `water-rights-fishing`, `coercion-duress`.
- **Clerk pipeline (unchanged):** `refinement_workflow.py get-task` → manually read JSON input → write `[Batch_ID]_Analysis.json` → `submit-task` or `flag-task`.
- **Manager review gate:** `submit-task` now sets queue status to `ManagerReview` (not final). A Manager must run `refinement_workflow.py manager-approve --theme <THEME> --content-file <BATCH_INPUT.json>` (or `--all`) to promote to `Complete`. Use `manager-reject` to revert for rework (manual evidence cleanup may be required).
- **Codex exec (non‑interactive batches):** use `99_Working_Files/Utilities/codex_exec_prompt_template.md` + `codex_exec_analysis_schema.json` to run one batch end‑to‑end with strict schema output.
- **Env‑driven model settings:** review `.env.example` for `PUKAIST_CODEX_MODEL/PROFILE/EXEC_FLAGS` (source it separately if you want), then run `bash 99_Working_Files/Utilities/codex_exec_runner.sh <THEME>` (also exposed in dashboard presets).
- **Web dashboard (local orchestration):** start via `99_Working_Files/Scripts/Queue_Management/web_dashboard/start_dashboard.sh` and open `http://127.0.0.1:8088` for queue/Review_Log/OCR/comms visibility and Live CLI.
- **Queue leases / timeouts:** `get-task` now stamps `LockedAt/LockedBy` on queue rows; long reads can refresh via `refinement_workflow.py renew-lock --content-file <BATCH_INPUT.json>`; clear stalled locks via `Scripts/Queue_Management/reap_stale_locks.py` or the dashboard “Reap Stale Locks” button.
- **Review‑first diffs:** rely on inspect‑then‑apply; detached review mode supports curated indexing and report edits.
- **Windows‑safe `apply_patch`:** CRLF preservation avoids line‑ending churn in `.md`/`.tsv` on this archive.
- **`/resume`:** use for long batches; still re‑read your `Agent_Instructions/*.md` after every 5 tasks.
- **Model visibility (0.71.0):** the picker shows the default model; confirm you are on the intended model before long runs.
- **Execpolicy safe prefixes:** Codex can whitelist command prefixes via `.rules` files in `~/.codex/rules/`.  
  Install the repo template by copying `99_Working_Files/Utilities/pukaist_execpolicy.rules.example` → `~/.codex/rules/pukaist.rules`, then restart Codex.  
  This allows core pipeline reads/runs without prompts while still prompting or blocking risky commands.

# Codex Multi‑Agent Collaboration (Conceptual Alignment)
*Added Dec 12, 2025 - Based on Codex PR #7526 design notes*

Codex is adding a native multi‑agent layer (`collaboration.*` tools). This repo’s human/AI agent system is already compatible with that model. When the tools land in the CLI, follow these mappings:

## 1. Logical agents ↔ Pukaist roles
- **Main agent (AgentId 0):** `manager-planner` skill. Owns the user prompt, plans, and delegations.
- **Child agents:** theme clerks (`land-reduction-trespass`, `governance-sovereignty`, etc.) and utility specialists (OCR/Vision, Gatekeeper, Archivist).
- Use one child agent per batch/theme to keep histories clean and audit trails simple.

## 2. ContextStrategy usage
- `New`: start a specialist with an empty history when you need a fresh read (e.g., OCR/Vision triage or a narrow provenance check).
- `Fork`: clone main context for a child that must see the same planning state and prior decisions (default for thematic clerks).
- `Replace`: reserved for re‑hydrating an agent from saved logs; Managers only.

## 3. Coordination and timeouts
- `collaboration.send` delegates a specific batch or audit task to a child agent.
- `collaboration.wait` blocks until a child completes enough work; treat this as a **timeout/queue‑wait primitive** for long reads.
- `collaboration.get_state` reports child lifecycle (`Idle`, `Running`, `Error`, `Closed`, `WaitingForApproval`).
- `collaboration.close` ends a child after it has posted its FINISH Whiteboard entry.

## 4. Per‑agent budgets (“juice”)
- Set `max_juice` on child agents to cap cost per batch. Main agent stays uncapped unless the user directs otherwise.
- Record any non‑default juice limits in the FINISH entry for audit.

# Agent Communication Protocol
*Added Nov 21, 2025 - The "Whiteboard" System*
*Updated Nov 21, 2025 - The "Orchestrator" Update*
*Updated Dec 2, 2025 - Enhanced Communication System (v2)*

## Purpose
To ensure seamless collaboration between multiple agents (human and AI) working asynchronously.

## The Communication Log
*   **File:** `99_Working_Files/Agent_Communication_Log.md`
*   **Archive:** `99_Working_Files/Communication_Archives/` (monthly archives)
*   **Tool (Legacy):** `99_Working_Files/manage_communication_log.py`
*   **Tool (v2 - Recommended):** `99_Working_Files/manage_communication_log_v2.py`
*   **Handoffs:** `99_Working_Files/Agent_Handoffs.json`
*   **Rule:** This file is the "Shift Change" board. It is kept short (max 20 entries) to preserve context.

## Enhanced Features (v2)
*   **Dashboard:** `python 99_Working_Files/manage_communication_log_v2.py dashboard`
*   **Search:** `python 99_Working_Files/manage_communication_log_v2.py search --query "text" --date-from YYYY-MM-DD`
*   **Handoff Tracking:** Use `--handoff AGENT` when writing to create formal handoff records
*   **System Status:** `python 99_Working_Files/system_status_report.py` for unified health view

## MANDATORY PROTOCOL (HARD REQUIREMENT)
**ALL AGENTS MUST FOLLOW THIS SEQUENCE FOR EVERY SESSION:**

1.  **START (Read):** Before taking ANY action, you **MUST** run:
    `python 99_Working_Files/manage_communication_log_v2.py dashboard`
    *   *Why:* To check for blockers, handoffs, or system state changes.

2.  **EXECUTE:** Perform your assigned task (Analyst, Scribe, etc.).

3.  **FINISH (Write):** Before exiting or asking for user input, you **MUST** run:
    `python 99_Working_Files/manage_communication_log_v2.py write --agent "Name" --status "CODE" --message "Msg" --next "Steps"`
    *   *Why:* To inform the next agent (or user) of exactly what was done and what is pending.
    *   *Note:* The system now automatically assigns a **Unique ID** to every entry for reference.
    *   *Handoff (Optional):* Add `--handoff "AgentName"` if you need another agent to pick up your work.

**Manual Edits:** If editing manually, ensure you do not delete the header. The script will handle rotation automatically on the next write.

## Status Codes
*   **GREEN:** All good, proceeding.
*   **YELLOW:** Encountered issues but continued (e.g., "Skipped 2 corrupt files").
*   **RED:** Stopped due to error (e.g., "API limit reached", "Script crashed").
*   **BLUE:** Information/Handoff (e.g., "Batch D500-D600 complete. Ready for Chronology update.").

# Safety
- No auto-renames/moves. Delete/ignore untrusted scripts.
- Do not overwrite existing StableIDs.
- Internal reports (01_AI_Generated_Reports) are AI/derivative and should be ignored for evidentiary work.
- Legal integrity: use verbatim quotations and exact information only; no summaries or paraphrasing; no fabricated content. When in doubt, extract the exact text and cite the file/path.
- Coordination / claiming (multi-agent):
  - Status values in `00_Index/Master_Index_Expanded.tsv`: NotStarted / InProgress / Ready / Deferred / Superseded.
  - To claim: set Status=InProgress and add “Claimed by <agent> on <date>” in Notes.
  - To release/finish: set Status=Ready and note what was done (e.g., “Verbatim quotes extracted; page spans noted”); include handoff notes if any.
  - Log activities in `99_Working_Files/Worklog.txt` (timestamp, agent, file, action).
  - Do not use internal reports for evidence.

# Anti-Laziness & No Shortcuts Protocol (Strict Enforcement)
*Added Nov 25, 2025 - The "No Scripts" Rule*
*Updated Nov 26, 2025 - Zero Tolerance Policy*

## Purpose
To prevent AI agents from bypassing the "Deep Read" requirement by writing scripts to scan for keywords instead of reading the text themselves.

## The "No Shortcuts" Rule (ZERO TOLERANCE)
1.  **MANUAL EVALUATION ONLY:** You are an **Analyst**, not a Script Runner. You must read the text provided in the JSON task file.
2.  **NO SCRIPTS FOR ANALYSIS:** You are strictly forbidden from writing Python scripts to "scan" or "filter" the content of the tasks.
    *   *Forbidden:* Writing a script to regex search for "Pukaist" in the JSON file.
    *   *Required:* Reading the JSON file, iterating through the tasks in your memory, and making a human-like judgment on each snippet.
3.  **CONTEXT REFRESH:** You must re-read your specific `Agent_Instructions/*.md` file after every **5 tasks** to ensure you do not drift into "lazy" behaviors.
4.  **PENALTY:** Any attempt to automate the *analysis* phase (Step 2 of the workflow) will be considered a failure of the "Clerk" standard.
5.  **STRICT INSTRUCTION ADHERENCE:** You must follow the `system_instructions` injected into every JSON task file. These are not suggestions; they are constraints.

# Language & Liability Protocol
*Added Nov 24, 2025 - Neutrality Standard*
*Updated Nov 25, 2025 - The "Clerk" Standard*

## The "Clerk" Stance (Strict Adherence)
We are **Clerks and Archivists**, not Analysts or Judges. Our job is to **transcribe and index**, not to interpret or opine.

## Language Rules (ABSOLUTE PROHIBITIONS)
*   **NO Opinions:** Do not use words like "suggests", "indicates", "implies", "appears to be", "likely", "possibly".
*   **NO Conclusions:** Do not say "This is evidence of fraud" or "This supports the claim."
*   **NO Placeholders:** Do not write "OCR is illegible" or "Needs Vision". Flag the task instead.
*   **Verbatim Only:** If a document says "The Reserve is 20 acres", you write: "Document states: 'The Reserve is 20 acres'."
*   **Strict Transcription:** Your summary must be a dry, factual description of the document's contents (e.g., "Letter from O'Reilly to Powell regarding survey instructions").
*   **Bias Check:** If you find yourself writing a sentence that isn't a direct quote or a dry description of the file type, **DELETE IT**.

# Legal-Grade Verbatim & Citation Protocol
*Added Dec 11, 2025 - Court‑grade evidence hard rules*

## A. Verbatim Quotation Rules (NON‑NEGOTIABLE)
1. **Copy exactly** as written in the source (spelling, capitalization, punctuation, line breaks, units).
2. **Do not correct OCR/handwriting/grammar.** If the source contains an error, preserve it; add `[sic]` only to mark that the error is original.
3. **Clarifiers only in brackets:** Any agent‑added clarification must be in square brackets `[...]` and only to disambiguate (e.g., `[Tetlanetea]`). Do not add new facts.
4. **Ellipses are for omission only:** Use `…` only to remove clearly irrelevant text. Never omit words that change meaning or splice sentences.
5. **Unreadable/partial text:** If any part of a needed passage is unreadable or context is missing, **do not guess**. Flag for source‑check or Vision; do not include it in Refined Evidence.
6. **Tables/forms:** Preserve column order, headers, and units; quote the minimum block that retains meaning.

## B. Citation & Page Anchoring
*   Every verbatim extract must include a page reference.
*   If doc page and PDF page differ, record both as `doc p.X / pdf p.Y`.
*   If the page cannot be determined from the snippet, set `page="?"` and flag for verification before marking `Ready`.
*   **Opinion‑word bans apply only to agent‑written text, not to verbatim extracts.** Do not alter quotes to avoid banned words.

## C. Provenance & Chain of Custody
*   Provenance must come from trusted metadata: input JSON `provenance`, `00_Index/Master_Index_Expanded.tsv`, or the file’s `.json` sidecar in `02_Primary_Records`.
*   If provenance is “Incoming”/“Unknown” and no trusted source exists, flag `Provenance_Failure`.
*   Never alter files in `01_Originals_WORM`; work only on copies.

## D. Reliability & OCR Status (required fields)
*   Populate `reliability` and `ocr_status` in every analysis result.
*   Reliability values: `Verified` / `Unverified` / `Reconstructed/Interpretive`.
*   OCR_Status values: `Yes` / `No (Needs OCR)` / `Pending`.

## E. Verification Before “Ready”
Before setting any task or Master Index row to `Ready`, perform a second‑pass check:
1. Quotes match the original source exactly.
2. Page anchors are correct and complete.
3. Provenance string matches trusted metadata.
4. No banned opinion language appears in agent‑written fields (`summary`, `forensic_conclusion`, `significance`).
If any item fails, keep status `InProgress` or flag for follow‑up.

## F. Contradictions Register (durable log)
*   Log unresolved conflicts to `99_Working_Files/Queues/Contradictions_Register.tsv` with both statements verbatim and page anchors.
*   Do not reconcile by guessing; record both and note follow‑up required.

## G. AI Run Metadata (audit trail)
For every Codex‑assisted batch, preserve a minimal, court‑auditable record of the AI run:
1. **Event log:** Run Codex with JSON event streaming and save the raw log to  
   `99_Working_Files/Logs/codex_exec_events_<timestamp>.jsonl` (read‑only after creation).  
   Example pattern:  
   `... codex exec --json ... | tee 99_Working_Files/Logs/codex_exec_events_YYYYMMDD_HHMMSS.jsonl`
2. **Run disclosure:** In your Whiteboard FINISH entry, include:
   - `BATCH_ID`
   - model name (e.g., `gpt-5.2`)
   - Codex CLI version (from `codex --version`)
   - profile/flags used (`PUKAIST_CODEX_PROFILE`, `PUKAIST_CODEX_EXEC_FLAGS`)
   - the saved event‑log filename
3. **No post‑hoc edits:** Do not edit event logs or analysis JSON after Manager approval. If a correction is required, create a new batch note and record the reason in `Review_Log.tsv` Notes.

# Contradiction Protocol
*Added Nov 24, 2025 - Handling Conflicting Data*

## The Rule of Primacy
If two sources contradict each other (e.g., one report says 50 acres, another says 20 acres):
1.  **Do Not Guess:** Do not pick one arbitrarily.
2.  **Trace to Source:** Check the original document (PDF/Image) if possible.
3.  **Report Both:** If unresolved, note the contradiction explicitly in the analysis.
    *   *Example:* "1913 Report states 243 members; 1914 Report states 135 members. This significant drop requires verification of the original census rolls."
4.  **Prioritize Primary:** A signed Minute of Decision or Survey Plan outweighs a summary in an Annual Report.

# Temporal Integrity Protocol (The "Time Anchor")
*Added Nov 28, 2025 - To prevent "Unknown Date" disconnects*

## Purpose
To ensure every piece of evidence is anchored in time, allowing for accurate chronological sorting. "Unknown" is not an acceptable date.

## Hierarchy of Date Extraction
1.  **Explicit Date:** The date written on the document (e.g., "June 14, 1885").
2.  **Contextual Date:** Derived from the content (e.g., "Report for the Fiscal Year ending 1913").
3.  **Archival Date:** Derived from the filename or parent folder (e.g., `.../1880_Sproat/...`).
4.  **Inferred Date:** Based on known events mentioned (e.g., "McKenna-McBride Commission" = ~1913-1916).
5.  **Undated (Last Resort):** Only use `Undated` if absolutely no temporal markers exist. **NEVER use "Unknown".**

## Validation Rule
*   Agents must populate the `date` field in the JSON output with a 4-digit Year (YYYY) or "Undated".
*   Submissions with "Unknown" or missing dates will be **automatically rejected** by the workflow script.

# Automated Validation Gates (Hard Constraints)
*Added Nov 28, 2025 - Technical Enforcement*

## Purpose
To prevent "lazy" or non-compliant submissions from polluting the evidence base, the `refinement_workflow.py` script now enforces strict validation rules. Submissions failing these checks are **automatically rejected**.

## The Gates
1.  **Metadata Integrity:**
    *   **Rule:** Fields `doc_id`, `title`, and `provenance` must be populated.
    *   **Error:** "CRITICAL: 'Unknown ID' detected."
2.  **Temporal Integrity:**
    *   **Rule:** Dates must be `YYYY` or `Undated`.
    *   **Error:** "CRITICAL: 'Unknown Date' is FORBIDDEN."
3.  **Clerk Standard (Forbidden Words):**
    *   **Rule:** No opinionated language.
    *   **Banned:** `suggests`, `implies`, `likely`, `possibly`, `appears to be`, `seems`, `opinion`, `speculates`.
    *   **Error:** "VIOLATION: Forbidden opinion word detected."
4.  **Content Quality:**
    *   **Rule:** Analysis must be substantial (> 100 characters).
    *   **Error:** "VIOLATION: Submission is too short."

## Recovery
If your submission is rejected:
1.  Read the error message in the terminal.
2.  Edit your JSON output file to fix the violation.
3.  Resubmit using `submit-task`.

# Current staging
- OCR staging: `07_Incoming_To_Process_OCR` (Volumes, Indexes, IAAR_Snippets).
- Internal drafts staged in `07_Incoming_To_Process/InternalDrafts`.
- Non-OCR promoted items in `05_Misc_Exhibits/Incoming_Aux` (D624–D626).

# Forensic Extraction Methodology (Technical Protocol)
*Added Nov 20, 2025 - Validated for Pukaist Sovereignty Dossier*
*Revised Nov 21, 2025 - Legal Integrity Standard*
*Revised Nov 22, 2025 - Preservation & Verification Protocols*
*Revised Nov 23, 2025 - Quality Assurance & Metadata Standards*
*Revised Nov 26, 2025 - PESS Architecture (WORM & Hashing)*

## Core Concept: The "Legal Standard"
To ensure this dossier is admissible and effective in a Canadian legal context (Specific Claims Tribunal or BC Supreme Court), we must adhere to strict **Chain of Custody** and **Provenance** rules.
*   **Principle 1: No Orphaned Evidence.** Every document in `02_Primary_Records` MUST have a traceable origin (e.g., "LAC RG10 Vol 3664", "BC Archives GR-2982"). "Incoming" or "Unknown" is NOT a valid provenance for evidence.
*   **Principle 2: Targeted Processing.** We do NOT OCR every file. We only process files that have been authenticated as relevant and originating from a trusted source.
*   **Principle 3: Verbatim Integrity.** AI summaries are "Work Product" (Privileged). Only verbatim extracts with page citations are "Evidence".
*   **Principle 4: Source Preservation (WORM).** When a file is processed, the original source file is NEVER deleted. It is moved to `01_Originals_WORM` (Write-Once-Read-Many) to maintain the ability to audit the transformation.
*   **Principle 5: Quality & Metadata.** All processed files must pass a "Noisy Text" audit. Every file must have a SHA-256 hash recorded in its metadata sidecar (`.json`) to prove it has not been tampered with.

# Enhanced Search Methodology (Smart Queue & File-First)
*Added Nov 21, 2025 - The "Deep Read" Advantage*
*Updated Nov 25, 2025 - Smart Queue Implementation*

## Core Concept
Unlike standard keyword scraping (which yields high false positives/negatives), this methodology employs **Semantic Narrative Analysis** on targeted text snippets. We do not just look for names; we look for *events* and *relationships*.

## The "Smart Queue" Protocol (File-First Discovery)
1.  **File-First Discovery:** We do not rely solely on the `Master_Index` (which may point to PDFs). Instead, the `smart_queue_builder.py` scans the `02_Primary_Records` directory directly for processed text files (`.txt`).
2.  **Smart Context Extraction (The "Anchor"):**
    *   **Concept:** We do not read linearly from page 1 to 100. We "anchor" on high-value keywords (e.g., "Pukaist", "Spatsum", "Reserve No. 10").
    *   **Expansion:** For every hit, we extract a **4000-character window** centered on the keyword (2000 characters before, 2000 characters after).
    *   **Merging:** Overlapping windows are merged into a single continuous block to prevent fragmented reading.
    *   **Result:** This creates a "Smart Task" containing *only* the relevant narrative context, drastically reducing token usage while preserving the "before and after" context needed for legal interpretation.
3.  **Narrative Pattern Matching:** We scan for "Concept Clusters" rather than single words.
    *   *Example:* Instead of just "Spatsum", we detect "Spatsum" + "Intrusion" + "Sproat" + "Wrong".
    *   *Result:* Identifies "The Spatsum Flat wrong" (a specific legal grievance) rather than just a geographic mention.
4.  **Legal Significance Scoring:**
    *   **High:** Admissions of liability ("redress", "wrong", "mistake"), specific acreage reductions, denials of title.
    *   **Medium:** Administrative context (census, crop reports).
    *   **Low:** General correspondence without specific claims.
5.  **Chain of Custody:** Every hit is immediately formatted into the `Master_Evidence_Dossier.md` standard (Source Path + Verbatim Quote + Page Number), ensuring forensic integrity.

## 1. Protocol: Non-Destructive Discovery
**Rule:** Never delete or move files during the discovery phase. All scripts must operate in `read-only` mode or write to separate output logs.
*   **Tooling:** Python (`os.walk`, `pypdf`).
*   **Target Directories:** `05_Misc_Exhibits`, `07_Incoming_To_Process`, `02_Primary_Records`.
*   **Action:** Scan files for text content. If text is found, scan for keywords. If no text (image-only), log for OCR queue.

## 2. Taxonomy & Keyword Heuristics
The following controlled vocabulary is used to identify high-value targets within unindexed PDF dumps.

### A. Primary Entities (The "Must-Haves")
*   `Pukaist`, `Pokheitsk`, `Pokeist`, `Pokhaist` (The distinct entity).
*   `Tetlenitsa`, `Tetlenetza`, `Teetleneetsah` (The distinct Chief).
*   `Sproat`, `O'Reilly` (The Commissioners responsible for the land reduction).
*   `Reserve No. 10`, `IR 10`, `IR10` (The specific land base).

### B. Legal Indicators (The "Key Evidence")
*   `Specific Claim`, `Tribunal`, `SCT-` (Indicates active legal filings).
*   `Amalgamation`, `Encroachment`, `Pre-emption` (Indicates the mechanism of erasure).
*   `Ah Chung`, `Ah Yep` (Specific settlers named in the 1880-1890 land reduction).

## 3. Extraction Workflow (Python)
1.  **Scan:** Iterate through all PDFs in target folder.
2.  **Decrypt/Read:** Handle encrypted PDFs (common in legal filings) using `pypdf` with exception handling.
3.  **Hit Scoring:** Count occurrences of Primary Entities per page.
4.  **Extract:** If a page contains >2 hits or a "Legal Indicator", extract the full text of that page to `Extracted_Evidence_Misc.txt`.
5.  **Context:** Capture the filename and page number for every extraction to ensure citation integrity.

## 4. Evidence Synthesis & Dossier Update
*   **Input:** Raw text from `Extracted_Evidence_Misc.txt`.
*   **Analysis:** Compare extracted dates/acres against the "Theory of the Case".
    *   *Example:* Compare 1885 Survey (79.9 acres) vs. 1907 Survey (22 acres).
*   **Output:** Update `Preliminary_Evidence_Report.md` with:
    *   **Source:** `[StableID] (Filename)`
    *   **Fact:** Verbatim quote or specific metric.
    *   **Significance:** How it supports the argument of improper amalgamation.

## 5. Preservation & Indexing (The "Safe Harbor")
*   **Handling Duplicates:** If a file appears to be a duplicate, **do not delete**. Instead, verify its content. If it is a critical "original" (e.g., LAC download), index it in `Master_Index_Expanded.tsv` even if it is currently image-only.
*   **OCR Queue (Revised):** Files identified as "Image Only" are added to `Files_To_OCR.txt` ONLY if they meet the Provenance Standard. Random images are ignored.
*   **Master Index Entry:**
    *   **StableID:** Assigned sequentially (e.g., D627).
    *   **Category:** `PRIM` (Primary) or `MISC` (Miscellaneous).
    *   **Status:** `NotStarted` -> `InProgress` (during OCR) -> `Ready` (after text extraction).

## 6. Evidence Consolidation & Dossier Management
*Added Nov 20, 2025 - Protocol for Verbatim Evidence Log*

### Purpose
To maintain a single, immutable reference point for all evidentiary hits found across the archive, preventing the need for repeated file scanning.

### The Master Dossier
*   **File:** `00_Index/Master_Evidence_Dossier.md`
*   **Content:** Verbatim text blocks extracted from source files, organized by Source ID and Page Number.
*   **Format:** Markdown with code blocks for raw text to preserve formatting.

### Update Methodology
1.  **Run Extraction Scripts:** Execute the individual extraction scripts (`extract_html_evidence.py`, `extract_pdf_evidence.py`, etc.) to generate raw hit reports in `99_Working_Files/`.
2.  **Run Consolidation Script:** Execute `99_Working_Files/update_master_dossier.py`.
    *   *Action:* This script reads all `Extracted_Evidence_*.txt` files.
    *   *Action:* It parses them into structured data.
    *   *Action:* It overwrites `Master_Evidence_Dossier.md` with the consolidated, sorted collection.
3.  **Review:** Manually check the Dossier for new hits and update the `Preliminary_Evidence_Report.md` synthesis if new "Key Evidence" are found.

**Rule:** Do not manually edit the text blocks in `Master_Evidence_Dossier.md`. Always update the source extraction logic or the consolidation script to fix issues.

## 7. OCR Pipeline & Vision Downgrade Protocol
*Added Nov 21, 2025 - Quality Control for OCR*
*Updated Nov 22, 2025 - Verification & Post-Processing*

### Purpose
To prevent AI agents from hallucinating meaning from garbled OCR text and to avoid unnecessary processing of files that already contain text.

### Phase 1: Pre-OCR Verification
Before any OCR is attempted, the `verify_ocr_needs.py` script scans the file.
1.  **Text Check:** If the file contains extractable text (and passes the "Noisy Text" check), it is immediately promoted to `02_Primary_Records` with Status `Pending`.
2.  **Redundancy Check:** If an OCR version already exists in Primary, the source file is moved to `02_Primary_Records/Source_Files_Preserved`.
3.  **Queueing:** Only confirmed image-only files remain in `07_Incoming_To_Process_OCR/Batch_Pending_OCR`.

### Phase 2: The "Noisy Text" Heuristic (Post-OCR Check)
A document is considered noisy if:
1.  It contains fewer than 3 common English stop words (e.g., "the", "and", "of") in the first 1000 characters.
2.  It is excessively short (< 50 chars) but is a multi-page file.
3.  It has a low alphanumeric ratio (< 50%).

### Phase 3: Protocol
1.  **Detection:** The processing script (Analyst or OCR Agent) runs `is_noisy_text()` on the content.
2.  **Action:**
    *   If Noisy: The file is **moved** to `07_Incoming_To_Process_OCR/Vision_Required`.
    *   **Log Status:** Updated to `Deferred` with note "Moved to Vision Required (Noisy Text)".
    *   If Clean: The text file is saved to `02_Primary_Records` and the source PDF is moved to `02_Primary_Records/Source_Files_Preserved`.
    *   **Log Status:** Updated to `Pending` with note "OCR Complete".
3.  **Recovery:** A separate Vision Agent (using GPT-4o or similar) will process files in `Vision_Required` using image-based analysis instead of text parsing.
    *   **Post-Processing:** Once processed, files are moved to `02_Primary_Records` (or `Complete` if staging is needed).
    *   **Log Update:** The `Review_Log.tsv` status must be updated from `Deferred` to `Reviewed` (or `Ready` if further review is needed).

## 8. OCR Quality Assurance Protocol (MANDATORY)
*Added Dec 24, 2025 - Zero AI Contamination Standard*

### Purpose
To verify that OCR output contains only verbatim transcription with ZERO AI-generated preambles, analysis, or hallucinations. This is critical for legal research documents.

### Phase 1: Automated Pattern Detection
Scan all `.txt` files for AI contamination patterns:
*   **Text descriptions:** "the text shows", "the document contains"
*   **First-person preambles:** "I can see", "I'll analyze", "let me transcribe"
*   **Appearance phrases:** "this appears to be", "this seems to be"
*   **Markdown formatting:** `###`, `**Bold**` headers

**Script:** `python -m scripts.ocr_qa_test`
**Expected Result:** 0% contamination rate

### Phase 2: Deep Content Review
For each file, examine three sections:
1.  **First 500 chars** - Check for AI preambles at start
2.  **Middle section (lines 20-30)** - Check for analysis insertion
3.  **Last 300 chars** - Check for AI summaries at end

### Phase 3: Visual Verification (CRITICAL)
Convert PDFs to images and compare against OCR output:
1.  `pdftoppm -png -r 150 -l 1 input.pdf output_prefix`
2.  View the image and compare against the `.txt` file
3.  Verify verbatim match of header, body, and signature

**Checklist:**
*   [ ] Header text matches exactly
*   [ ] Body text is verbatim (not paraphrased)
*   [ ] Spelling/punctuation preserved from original
*   [ ] No AI-generated descriptions or analysis
*   [ ] `[illegible]` used appropriately for unclear text

### Quality Criteria (HARD REQUIREMENTS)
| Criteria | Pass | Fail |
|----------|------|------|
| AI preambles | 0 | Any |
| Markdown formatting | 0 | Any ### or ** patterns |
| "I can see" phrases | 0 | Any |
| Visual match | Verbatim | Paraphrased |

### Sample Size Requirements
*   **Automated scan:** 100% of files
*   **Deep review:** Minimum 5 random files per 100 processed
*   **Visual verification:** At least 3 files per batch

### OCR QA Tools
*   **Protocol Doc:** `docs/ocr_quality_assurance_protocol.md`
*   **Test Script:** `scripts/ocr_qa_test.py`
*   **Quality Images:** `99_Working_Files/quality_check_images/`

## 9. Smart OCR Pipeline Setup (From Scratch)
*Added Dec 24, 2025 - Complete replication guide*

### Purpose
To provide a complete, step-by-step guide for setting up and running the Hunyuan VLM OCR pipeline on a new machine. This pipeline processes legal research PDFs with verbatim transcription quality.

### Prerequisites

#### Hardware Requirements
*   **GPU:** NVIDIA RTX 5090 or equivalent with 32GB+ VRAM (24GB minimum)
*   **RAM:** 48GB+ system RAM recommended
*   **Storage:** SSD with ~50GB free for model weights

#### Software Requirements
*   WSL2 with NVIDIA GPU passthrough (if on Windows)
*   CUDA 12.x with cuda-compat-12-9 installed
*   Python 3.11+ with venv
*   PyMuPDF (fitz), aiohttp, tqdm, poppler-utils (for pdftoppm)

#### WSL Configuration (`.wslconfig`)
```ini
[wsl2]
memory=48GB
swap=32GB
processors=12
```

### Pipeline Architecture

The Smart OCR pipeline uses **multi-signal classification** to route documents optimally:

| Classification | Extraction Method | Speed | Use Case |
|----------------|-------------------|-------|----------|
| DIGITAL | PyMuPDF direct | ~0.1s/file | Native text PDFs |
| SCANNED | Hunyuan VLM | ~10-30s/file | Image-only PDFs |
| HANDWRITTEN | Hunyuan VLM | ~15-45s/file | Historical archives |
| MIXED/HYBRID | VLM + Direct | Variable | Multi-type documents |

### Step-by-Step Setup

#### Step 1: Environment Setup
```bash
cd /home/astraithious/pukaist-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install PyMuPDF aiohttp tqdm vllm
```

#### Step 2: Put PDFs in Place
*   **Source directory:** `Pukaist/` (place all PDFs here)
*   **Output directory:** `99_Working_Files/Evidence_Staging/`

#### Step 3: Run PDF Analysis (Classification)
```bash
source .venv/bin/activate
python -m scripts.analyze_pdfs
```

This analyzes each PDF with **5-signal detection**:
1. Text extraction character count
2. Image area vs page area ratio
3. Garbled unicode detection (chr(0xFFFD))
4. Embedded font count
5. High vector drawing count (simulated text)

**Output:** `data/pdf_analysis.json` with classification for each PDF.

**Sample output:**
```
📈 Classification Summary:
   DIGITAL: 420 (54.5%)
   HANDWRITTEN: 320 (41.5%)
   SCANNED: 25 (3.2%)
   MIXED: 5 (0.6%)

🔧 Extraction Methods:
   DIRECT: 420 (54.5%)
   VLM_OCR: 350 (45.5%)
```

#### Step 4: Start the vLLM Hunyuan Server
```bash
# Option A: Using start-stack.sh (recommended)
./scripts/start-stack.sh

# Option B: Manual start
source .venv/bin/activate
vllm serve tencent/HunyuanOCR \
  --port 8001 \
  --gpu-memory-utilization 0.85 \
  --max-model-len 18000 \
  --max-num-batched-tokens 4096 \
  --dtype bfloat16 \
  --no-enable-prefix-caching
```

Wait for the server to show "Uvicorn running on http://0.0.0.0:8001".

**Health check:**
```bash
curl http://127.0.0.1:8001/v1/models
```

#### Step 5: Run the OCR Pipeline
```bash
source .venv/bin/activate

# Option A: Process ONLY scanned/handwritten (VLM OCR)
python -m scripts.smart_ocr_parallel --ocr-only

# Option B: Process ONLY digital (fast direct extraction)
python -m scripts.smart_ocr_parallel --digital-only

# Option C: Process ALL
python -m scripts.smart_ocr_parallel
```

#### Step 6: Monitor Progress
```bash
# Watch GPU usage
nvidia-smi -l 2

# Queue progress (if using queue system)
python scripts/queue_progress.py --watch 2

# Tail logs
tail -f /tmp/pukaist/*.log
```

#### Step 7: Quality Assurance Check
```bash
# Automated QA test
python -m scripts.ocr_qa_test --sample 10

# Visual verification (creates PNG for comparison)
python -m scripts.ocr_qa_test --visual --sample 3
```

### Key Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/analyze_pdfs.py` | Classify PDFs by extraction method | `python -m scripts.analyze_pdfs` |
| `scripts/smart_ocr_parallel.py` | Run OCR with parallel batching | `python -m scripts.smart_ocr_parallel --ocr-only` |
| `scripts/ocr_qa_test.py` | Quality assurance testing | `python -m scripts.ocr_qa_test` |
| `scripts/start-stack.sh` | Start complete stack (vLLM + workers) | `./scripts/start-stack.sh` |
| `scripts/stop-stack.sh` | Stop all services | `./scripts/stop-stack.sh` |
| `scripts/queue_progress.py` | Monitor queue status | `python scripts/queue_progress.py --watch 2` |

### OCR Configuration (Critical Settings)

The verbatim prompt is **essential** for legal research quality:

```python
VERBATIM_PROMPT = (
    "OUTPUT ONLY THE RAW TEXT. DO NOT ANALYZE OR DESCRIBE.\n\n"
    "Rules:\n"
    "1. Transcribe ONLY the exact visible text, character by character\n"
    "2. Preserve ALL original spelling, punctuation, line breaks, errors\n"
    "3. DO NOT add any of your own words or analysis\n"
    "4. DO NOT start with 'The text shows', 'This appears to be', etc.\n"
    "5. DO NOT describe the document format, layout, or handwriting style\n"
    "6. If text is unclear, write [illegible]\n"
    "7. Start your response directly with the first word of the document\n\n"
    "BEGIN TRANSCRIPTION:"
)
```

**API settings for verbatim output:**
```python
{
    "temperature": 0.0,      # Deterministic output
    "top_k": 1,              # Single most likely token
    "repetition_penalty": 1.0,  # No penalty (preserves valid repetitions)
    "max_tokens": 8192,      # Per-page limit
}
```

### Parallel Processing Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `MAX_CONCURRENT_PAGES` | 4 | Concurrent OCR requests per PDF |
| `GPU_MEMORY_UTILIZATION` | 0.85 | VRAM usage (adjust for your GPU) |
| `MAX_NUM_BATCHED_TOKENS` | 4096 | vLLM continuous batching size |
| `MAX_MODEL_LEN` | 18000 | Maximum output tokens |

**Expected throughput:** ~5 files/minute on RTX 5090

### Directory Structure

```
pukaist-engine/
├── Pukaist/                          # Source PDFs
├── data/
│   └── pdf_analysis.json             # Classification results
├── 99_Working_Files/
│   ├── Evidence_Staging/             # OCR output (.txt files)
│   └── quality_check_images/         # Visual verification PNGs
├── scripts/
│   ├── analyze_pdfs.py               # PDF classifier
│   ├── smart_ocr_parallel.py         # Main OCR pipeline
│   ├── ocr_qa_test.py                # Quality assurance
│   ├── start-stack.sh                # Stack startup
│   └── stop-stack.sh                 # Stack shutdown
└── /tmp/pukaist/                     # Runtime logs
```

### Troubleshooting

#### OOM (Out of Memory) Errors
*   Reduce `GPU_MEMORY_UTILIZATION` to 0.75
*   Reduce `MAX_NUM_BATCHED_TOKENS` to 2048
*   Kill and restart vLLM

#### Stuck Tasks
```bash
# Reset stuck tasks in queue
python -c "
import sqlite3
from src.config import Settings
settings = Settings.load()
conn = sqlite3.connect(settings.queue_db)
conn.execute(\"UPDATE tasks SET status='pending' WHERE status IN ('processing','leased')\")
conn.commit()
"
```

#### Connection Refused
*   vLLM not ready yet - wait for health check
*   Check logs: `tail -f /tmp/pukaist/hunyuan_vllm.log`

#### Large Files Failing
*   Files \>100 pages may exceed memory
*   Flag as "file too large" and process separately
*   Consider splitting large PDFs first

### Post-OCR Steps

1. **Quality Check:** Run `python -m scripts.ocr_qa_test` to verify 100% clean output
2. **Stop Hunyuan:** `systemctl --user stop pukaist-hunyuan`
3. **Start KaLM:** Switch to embedding server for re-embedding
4. **Re-embed:** Run embedding pipeline on OCR'd files
5. **Final Review:** Sample-check embeddings and search quality

# Script Management & Hygiene
*Added Nov 21, 2025*
*Updated Nov 29, 2025 - Strict Directory Map*
*Updated Dec 2, 2025 - Scripts/ Subfolder Organization*

## Purpose
To prevent the `99_Working_Files` directory from becoming a dumping ground for temporary scripts and to ensure future agents know exactly where to find tools.

## Directory Map (Strict Enforcement)
*   **Root (`99_Working_Files/`):** **CORE INFRASTRUCTURE ONLY.**
    *   *Allowed:* `pukaist_config.py`, `refinement_workflow.py`, `system_consolidator.py`, `smart_queue_builder.py`, `gatekeeper_automation.py`, `audit_evidence_quality.py`, `manage_communication_log.py`, `manage_communication_log_v2.py`, `system_status_report.py`, `auto_indexer.py`.
    *   *Forbidden:* One-off scripts, debug tools, temp files.
*   **Scripts (`99_Working_Files/Scripts/`):** **ORGANIZED AUXILIARY SCRIPTS.**
    *   `Scripts/Agents/`: Agent-specific scripts (author_agent.py, barrister_agent.py, etc.)
    *   `Scripts/OCR_Vision/`: OCR processing and vision queue scripts
    *   `Scripts/Queue_Management/`: Queue building, filtering, and maintenance
    *   `Scripts/Data_Cleanup/`: Log cleaning, workspace organization
    *   `Scripts/Analysis/`: Evidence analysis and synthesis tools
    *   `Scripts/Deprecated/`: Retired one-off scripts (preserved for reference)
    *   `Scripts/report_to_json.py`: **Report structure parser** - converts Markdown to JSON for comparison
    *   `Scripts/docx_extractor.py`: **Word document extractor** - extracts DOCX structure to JSON
*   **Utilities (`99_Working_Files/Utilities/`):** **SYSTEM MAINTENANCE SCRIPTS.**
    *   *Allowed:* Test suites, health checks, one-time fixes (e.g., `run_system_tests.py`, `repo_health_check.py`).
*   **Queues (`99_Working_Files/Queues/`):** Active work queues (TSV).
*   **Logs (`99_Working_Files/Logs/`):** Rotated logs and audit reports.
*   **Communication_Archives (`99_Working_Files/Communication_Archives/`):** Monthly archives of Agent_Communication_Log.md.
*   **Archive (`99_Working_Files/Archive/`):** Retired scripts and superseded data.

## Protocol
1.  **Placement:** When creating a new script, ask: "Is this a permanent part of the core pipeline?"
    *   **Yes (Core):** Save to Root.
    *   **Yes (Auxiliary):** Save to appropriate `Scripts/` subfolder.
    *   **No (One-off):** Save to `Utilities` or `Archive`.
2.  **Cleanup:** Agents must delete their own temporary data files (e.g., `temp_analysis.json`) immediately after successful submission.
3.  **Documentation:** If you add a new Core Script, you **MUST** update `99_Working_Files/README.md` to explain its purpose.
4.  **Logs:** Keep `Review_Log.tsv` and `Worklog.txt` at the root of `99_Working_Files`. Move older logs to `99_Working_Files/Logs/`.
5.  **Evidence Staging:** Raw extraction outputs (`Extracted_Evidence_*.txt`) are stored in `99_Working_Files/Evidence_Staging/`.

# Report Compilation & JSON Structure Protocol
*Added Dec 11, 2025 - Structured Document Management*

## Purpose
To prevent "messy insertions" where edits accidentally remove or corrupt content, this protocol uses **JSON-based structure parsing** to enable controlled, verifiable document modifications.

## The Problem Solved
1. **Context limitations** - AI agents cannot hold 4000+ line documents in memory
2. **Blind edits** - Making changes without full awareness of document structure
3. **Version drift** - Multiple Word doc versions becoming out of sync
4. **Lost content** - Insertions accidentally overwriting adjacent sections

## Core Tools

### 1. Markdown → JSON Parser
*   **Script:** `99_Working_Files/Scripts/report_to_json.py`
*   **Input:** Markdown file (e.g., `01_MAIN_REPORT_LEGAL_GRADE.md`)
*   **Output:** `*.structure.json` file with:
    *   Hierarchical section structure (Parts → Sections → Subsections)
    *   Section word counts
    *   Footnote references per section
    *   Content hashes for change detection
    *   Extracted quotes

**Usage:**
```bash
python 99_Working_Files/Scripts/report_to_json.py "01_Internal_Reports/Word_Doc_Package/01_MAIN_REPORT_LEGAL_GRADE.md"
```

### 2. Word Doc → JSON Extractor
*   **Script:** `99_Working_Files/Scripts/docx_extractor.py`
*   **Input:** Word document (`.docx`)
*   **Output:** `*.structure.json` + comparison report

**Usage (Compare Two Versions):**
```bash
python 99_Working_Files/Scripts/docx_extractor.py "Legal_Briefing_Package/File1.docx" "Legal_Briefing_Package/File2.docx"
```

## Markdown Formatting Standards

### PART Headers (Level 1)
PART headers must be proper `#` markdown headers with anchors:
```markdown
# PART I: THE PLACE AND ITS PEOPLE {#part-i}
# PART II: COLONIAL RECOGNITION AS A DISTINCT BAND {#part-ii}
```
**NOT** plain text like:
```markdown
PART I: THE PLACE AND ITS PEOPLE
```

### Section Numbering
*   Level 1: `# PART I:` (document structure)
*   Level 2: `## 1.1 Title` (main sections)
*   Level 3: `### 1.1.1 Subtitle` (subsections)
*   Level 4: `#### Subheading` (detail sections)

### Table of Contents
The markdown includes a manual TOC table. Pandoc auto-generates TOC with `--toc` flag:
```bash
pandoc input.md -o output.docx --toc --toc-depth=2
```

## Word Document Generation

### Standard Command
```powershell
cd "C:\Users\Astra\Documents\Pukaist\Reference Material"
& "C:\Users\Astra\AppData\Local\Pandoc\pandoc.exe" `
  "01_Internal_Reports\Word_Doc_Package\01_MAIN_REPORT_LEGAL_GRADE.md" `
  -o "Legal_Briefing_Package\Pukaist_Report_VERIFIED.docx" `
  --from markdown --to docx `
  --reference-doc="01_Internal_Reports\Word_Doc_Package\custom-reference.docx" `
  --toc --toc-depth=2
```

### Reference Document
*   **File:** `01_Internal_Reports/Word_Doc_Package/custom-reference.docx`
*   **Purpose:** Defines Word styles (Heading 1, Heading 2, etc.) for consistent formatting
*   **Note:** Edit this file in Word to change fonts, colors, spacing

## Pre-Edit Protocol (MANDATORY)

Before making any edits to `01_MAIN_REPORT_LEGAL_GRADE.md`:

1.  **Parse Structure:**
    ```bash
    python 99_Working_Files/Scripts/report_to_json.py "01_Internal_Reports/Word_Doc_Package/01_MAIN_REPORT_LEGAL_GRADE.md"
    ```
2.  **Review JSON:** Open `01_MAIN_REPORT_LEGAL_GRADE.structure.json` to understand:
    *   Which sections exist
    *   Word counts per section
    *   Content hashes (to detect unintended changes)
3.  **Identify Target:** Find exact section number/title for the edit
4.  **Make Targeted Edit:** Use `replace_string_in_file` with sufficient context
5.  **Verify:** Re-run parser to confirm only intended section changed

## Post-Edit Protocol

After making edits:

1.  **Re-parse:** Generate new JSON structure
2.  **Compare:** Check word counts—unexpected drops indicate lost content
3.  **Regenerate Word:** Run pandoc command
4.  **Cross-check:** Use `docx_extractor.py` to verify Word output matches markdown

## Current Report Statistics (Dec 11, 2025)

| Metric | Value |
|--------|-------|
| Total Sections | 205 |
| Total Words | 24,277 |
| Total Footnotes | 304 |
| PART Headers | 8 |
| Has TOC | ✅ Yes |

## JSON Structure Output Example

```json
{
  "title": "PUKAIST FIRST NATION",
  "total_sections": 205,
  "total_words": 24277,
  "total_footnotes": 304,
  "parts": [
    {
      "level": 1,
      "number": "",
      "title": "PART I: THE PLACE AND ITS PEOPLE",
      "word_count": 1234,
      "content_hash": "a1b2c3d4e5f6",
      "children": [...]
    }
  ]
}
```

# System Integrity & Health Protocol
*Added Nov 29, 2025 - Automated Verification*

## Purpose
To ensure that the codebase remains stable, clean, and functional as it evolves. Manual checks are no longer sufficient.

## Mandatory Testing Suite
Before any major system update or at the start of a new "Manager" session, the following tests MUST be run.

### 1. Functional Integrity Test
*   **Script:** `99_Working_Files/Utilities/run_system_tests.py`
*   **Purpose:** Verifies that core scripts (Gatekeeper, Workflow, OCR) can import the config, access logs, and perform basic operations without crashing.
*   **Command:** `python 99_Working_Files/Utilities/run_system_tests.py`
*   **Pass Criteria:** All tests must return `OK`. Any `FAIL` or `ERROR` is a blocker.

### 2. Repository Health Check
*   **Script:** `99_Working_Files/Utilities/repo_health_check.py`
*   **Purpose:** Scans for "clutter" (misplaced scripts, temp files) and "zombie tasks" (stuck queues).
*   **Command:** `python 99_Working_Files/Utilities/repo_health_check.py`
*   **Action:** If clutter is found, run `99_Working_Files/Utilities/run_cleanup.py`.

## Protocol
1.  **Pre-Flight:** The Manager Agent must run `run_system_tests.py` before authorizing any complex multi-agent operation.
2.  **Post-Op:** After a significant batch of work, run `repo_health_check.py` to ensure no temp files were left behind.
3.  **Maintenance:** If `repo_health_check.py` reports > 10 unorganized files, the `run_cleanup.py` script must be executed immediately.

# Refinement & Review Protocol (The "Smart Queue")
*Updated Nov 24, 2025 - Thematic Sharding & Async Architecture*
*Updated Nov 25, 2025 - Smart Queue Integration*

## Purpose
To systematically process evidence chunks from the thematic queues, analyze them for legal and historical significance, and append the refined analysis to the appropriate Thematic Brief. This replaces the legacy "Single-Threaded" protocol.

## Core Principles (Strict Adherence)
1.  **Super Tasks (Aggregated Context):** You will receive a **"Super Task"** (up to 40,000 characters) which aggregates multiple sequential hits from the same document. This provides you with 10-15 pages of continuous context.
    *   *Action:* Read the entire block. Do not treat it as fragmented snippets. It is a coherent narrative chunk.
2.  **Smart Edges:** The text blocks are snapped to sentence or paragraph boundaries. If a sentence seems cut off, check the very end of the block, but it should be rare.
3.  **No Keyword Reliance:** Automated keyword hits are *hints*, not evidence. You must read the surrounding text to verify context.
4.  **Manual Read Required:** The Agent must read the full text chunk provided. Do not rely solely on the summary or the "Hits" list.
5.  **Contextual Verification:** Ensure the "Reserve" or "Land" mentioned is actually relevant to Pukaist/Nlaka'pamux. (e.g., "Reserve" in a military context is irrelevant).
6.  **Thematic Isolation:** Agents must stick to their assigned theme queue to prevent race conditions.

## Core Tools
*   **Workflow Script:** `99_Working_Files/refinement_workflow.py`
*   **Queue Builder:** `99_Working_Files/smart_queue_builder.py`
*   **Queues Directory:** `99_Working_Files/Queues/` (Contains `Queue_[Theme].tsv`)
*   **Flagged Log:** `99_Working_Files/Flagged_Tasks.tsv`

## Workflow Cycle

### 1. Fetch Batch (Thematic)
**Command:**
```powershell
python 99_Working_Files/refinement_workflow.py get-task --theme [Theme_Name]
```
*Available Themes:* `Land_Reduction_Trespass`, `Governance_Sovereignty`, `Fiduciary_Duty_Negligence`, `Water_Rights_Fishing`, `Coercion_Duress`.

**Output:**
*   `BATCH_ID`: Unique identifier for the batch.
*   `TASK_COUNT`: Number of tasks in the batch.
*   `CONTENT_FILE`: Path to a JSON file containing an array of tasks.
    *   **Limit:** The system automatically batches tasks up to **40,000 Characters** (Super Task Limit) to maximize context usage.

### 2. Analyze & Draft (JSON Format)
Read the `CONTENT_FILE` (JSON). It contains a `tasks` array. You must process **ALL** tasks in the array and produce a single output JSON file (e.g., `99_Working_Files/[Batch_ID]_Analysis.json`).

**Input Structure:**
```json
{
  "batch_id": "...",
  "tasks": [
    { "task_id": "...", "doc_id": "...", "content": "[4000 char snippet...]" },
    ...
  ]
}
```

**Output Structure:**
```json
{
  "batch_id": "[Batch_ID]",
  "results": [
    {
      "task_id": "[Task_ID]",
      "doc_id": "[Doc_ID]",
      "title": "[Title]",
      "date": "[YYYY]",
      "provenance": "[Source]",
      "relevance": "High/Medium/Low",
      "summary": "Concise summary...",
      "forensic_conclusion": "Legal significance...",
      "key_evidence": [
        {
          "quote": "Verbatim quote...",
          "page": "Page Number",
          "significance": "Context"
        }
      ]
    },
    ...
  ]
}
```
**CRITICAL WARNING:** If you omit fields like `doc_id`, `title`, or `date`, the system will generate "Unknown ID" errors. This is considered a **FAILED TASK**. You must extract this metadata from the document content or the task header.

### 3. Submit Batch
**Command:**
```powershell
python 99_Working_Files/refinement_workflow.py submit-task --json-file [PATH_TO_OUTPUT_JSON] --theme [Theme_Name]
```
**Action:**
*   The script reads the JSON file.
*   It updates the status of **ALL** processed tasks to `Complete`.
*   It appends the formatted analysis to `01_Internal_Reports/Refined_Evidence/Refined_[Theme].md`.

### 4. Synchronization Rule (Mandatory)
**Rule:** If you update any of the 5 Thematic Briefs (`Refined_*.md`), you **MUST** also update the `Preliminary_Evidence_Report.md`.
*   **Action:** Extract the high-level summary and "Key Evidence" from your analysis.
*   **Target:** Insert it chronologically into the corresponding section of `Preliminary_Evidence_Report.md`.
*   **Why:** To ensure the narrative report stays in sync with the raw evidence briefs.

## Flagging & Exception Handling
**Purpose:** To handle "messy" tasks (noise, corrupt files, wrong format) without blocking the queue.

**Command:**
```powershell
python 99_Working_Files/refinement_workflow.py flag-task --id [TASK_ID] --theme [Theme_Name] --reason "[Reason]"
```
**Action:**
*   Moves the task to `Flagged` status in the queue.
*   Logs the issue in `99_Working_Files/Flagged_Tasks.tsv`.

### Analyst OCR Rejection Protocol
**Rule:** If an Analyst encounters text that is garbled, "noisy" (random characters), or clearly a bad OCR job:
1.  **Do Not Attempt to Read:** Do not try to guess the meaning.
2.  **Flag as OCR Failure:** Use the specific reason code `"OCR_Failure"`.
    *   *Command:* `python 99_Working_Files/refinement_workflow.py flag-task --id [TASK_ID] --theme [Theme] --reason "OCR_Failure"`
3.  **Automated Response:** The system will detect this code and **automatically move the source file** to `07_Incoming_To_Process_OCR/Vision_Required` for re-processing by the Vision Agent.

**STRICT PROHIBITION:**
*   **NEVER** submit a "Summary" that says "OCR is illegible" or "Requires Vision".
*   **NEVER** include an illegible document in the Refined Evidence or Preliminary Report.
*   **ACTION:** If it is illegible, you **MUST** flag it and skip it. It does not belong in the report until it is fixed.

## Flagged Task Resolution Protocol (The "Investigator")
*Added Nov 24, 2025 - Audit Trail*

**Purpose:** To ensure that files flagged as "Corrupt" or "Irrelevant" are not just ignored but investigated to determine the root cause.

**Log File:** `99_Working_Files/Flagged_Tasks.tsv`
*   **Columns:** `TaskID`, `DocumentID`, `Theme`, `Reason`, `Timestamp`, `OriginalSource`.

**Procedure for Investigator Agent:**
1.  **Read Log:** Scan `Flagged_Tasks.tsv` for new entries.
2.  **Trace Source:** Use the `OriginalSource` path to locate the actual file.
3.  **Diagnose & Resolve:**
    *   **If "Irrelevant":** Open the file. Verify it has NO connection to Pukaist/Nlaka'pamux.
        *   *Action:* Move to `05_Misc_Exhibits/Irrelevant` (Create if needed).
    *   **If "Corrupt":** Attempt to open with a different tool.
        *   *Action:* If truly dead, move to `99_Working_Files/Archive/Corrupt`.
    *   **If "OCR_Failure":** Verify it was moved to `Vision_Required`.
        *   *Action:* If not, manually move it.

## Tracking
*   **Queues:** `99_Working_Files/Queues/Queue_[Theme].tsv`
*   **Flagged File:** `99_Working_Files/Flagged_Tasks.tsv`
*   **Output Dir:** `01_Internal_Reports/Refined_Evidence/`

# Autonomous Agent Workflow (Portable)
*Added Nov 21, 2025 - Standard Operating Procedure for AI Agents*
*Updated Nov 24, 2025 - Unified I/O Protocol*

## Purpose
To allow any AI agent to autonomously pick up tasks from the review queue, process them, and log the results without needing complex environment setup.

## Unified I/O Protocol (Strict Enforcement)
**CRITICAL:** To prevent data loss and divergence, all agents must adhere to this exact Input/Output standard.
1.  **Input:** You ONLY read the JSON file provided by `get-task`. You do NOT read the original PDFs or text files directly unless explicitly instructed by the `flag-task` protocol.
2.  **Output:** You ONLY produce a JSON file. You do NOT write to Markdown files directly. The system handles the conversion.
3.  **Storage:** All refined evidence is automatically appended to `01_Internal_Reports/Refined_Evidence/Refined_[Theme].md`.
4.  **Auto-Sync:** The `refinement_workflow.py` script now automatically synchronizes status changes (Complete/Flagged) from the thematic shards back to the Master Queue (`Refinement_Queue_Smart.tsv`). Agents do not need to manually update the master file.
5.  **Forbidden:**
    *   Do NOT create temporary text files (e.g., `temp.txt`).
    *   Do NOT use `pypdf` or other libraries to re-read the source. Trust the content in the JSON input.
    *   Do NOT write to `Preliminary_Evidence_Report.md` directly.

## System Instruction Injection (Technical Enforcement)
*Added Nov 25, 2025*
To enforce the "Clerk" standard, the `refinement_workflow.py` script now automatically injects a `system_instructions` block into every JSON task file generated by `get-task`.
*   **Content:** Contains the core rules (Neutrality, Verbatim Only, Context Refresh).
*   **Effect:** Ensures the agent sees the rules immediately before processing the content, preventing context drift.

## Tooling
*   **Script:** `99_Working_Files/refinement_workflow.py`
*   **Dependencies:** Python 3 (Standard Library only).

## Procedure

### Step 1: Get a Batch
Run the script in "get-task" mode to claim the next available batch of files.

```bash
python 99_Working_Files/refinement_workflow.py get-task --theme [Theme]
```

**Output:**
*   `BATCH_ID`: The unique ID for this batch.
*   `CONTENT_FILE`: A JSON file containing an array of tasks.
*   `[Content]`: The JSON content (read this file to get the text of the documents).

### Step 2: Analyze (The "Thinking" Phase)
The Agent must read the `CONTENT_FILE` using Python's `json` module.
**Command:**
```bash
python -c "import json; f=open(r'[CONTENT_FILE]', 'r', encoding='utf-8'); data=json.load(f); print(json.dumps(data, indent=2))"
```

Iterate through the `tasks` array. For **EACH** task:
1.  **Relevance:** Is this document relevant?
2.  **Summary:** A concise description.
3.  **Quotes:** Verbatim evidence.

### Step 3: Submit Results
Create a JSON file with your results and submit it.

```bash
python 99_Working_Files/refinement_workflow.py submit-task --json-file [Your_Output.json] --theme [Theme]
```

## Error Handling
*   If `get-task` returns `NO_TASKS_PENDING`, the queue is empty. Stop.
*   If `get-task` returns an error about OCR, the file is automatically deferred. Try `get-task` again to get the next valid file.
*   If `get-task` detects **Noisy Text** (garbled OCR), it will automatically move the file to `Vision_Required` and defer it. You should then proceed to the next task.

# System Consolidator Role & Data Integrity
*Added Nov 21, 2025 - The "Foundation" Protocol*

## Purpose
To ensure that the narrative evidence presented in `Preliminary_Evidence_Report.md` is fully backed by structured data in `Review_Log.tsv`. This prevents "hallucinated citations" where the report claims a source exists but the log shows it as unreviewed.

## Tooling
*   **Script:** `99_Working_Files/system_consolidator.py`
*   **Outputs:**
    *   `Provenance_Report.md`: Audit log showing status mismatches.
    *   `Consolidated_Evidence.json`: Machine-readable database of all findings.
    *   `Project_Timeline.md`: Chronological view of all evidence.

## Protocol
1.  **Run Audit:** Execute `python 99_Working_Files/system_consolidator.py` at the end of every review session.
2.  **Check Provenance:** Open `Provenance_Report.md`.
    *   **Goal:** All items should show Status `Reviewed`.
    *   **Action:** If an item shows `Ready` or `MISSING`, the Consolidator must locate the file in `Review_Log.tsv` and update its status/summary to match the report.
3.  **Fix Duplicates:**
    *   **Rule:** `Review_Log.tsv` must have **unique FileIDs**.
    *   **Action:** If duplicates exist (e.g., one `Ready` and one `Reviewed`), delete the `Ready` entry. The `Reviewed` entry is the source of truth.

## Data Integrity Rules
1.  **Single Source of Truth:** `Review_Log.tsv` is the master record for file status.
2.  **Status Flow:** `Pending` -> `InProgress` -> `Reviewed`.
    *   *Note:* `Ready` is a legacy state for automated indexing. Once a human/agent reviews a file, it MUST become `Reviewed`.
3.  **No Ghost Entries:** If a file is cited in the Report, it MUST exist in the Log.

# Multi-Agent Concurrency & Role Specialization
*Added Nov 21, 2025 - Strategy for Parallel Execution*

## Purpose
To allow multiple AI agents to work simultaneously without overwriting data or creating race conditions. This strategy relies on a "Claim-Process-Release" (CPR) protocol and strict role separation.

## The "Claim-Process-Release" (CPR) Protocol
The `Review_Log.tsv` acts as the central state machine.
1.  **Claim:** An agent finds a `Pending` item and marks it `InProgress`. This "locks" the file.
2.  **Process:** The agent performs its work (reading, analyzing, OCRing) in isolation.
3.  **Release:** The agent updates the status to `Reviewed` (or `Ready` for OCR) and writes its output.

## Role Definitions

### 0. The Manager (Planner & Orchestrator)
*   **Responsibility:** Strategy, Planning, and Quality Control. The "Chief of Staff" for the user.
*   **Trigger:** User request for high-level planning, complex multi-agent coordination, or "What do I do next?" queries.
*   **Instruction File:** `Agent_Instructions/00_Manager_Planner_Agent.md`
*   **Actions:**
    *   **Plan First:** ALWAYS drafts a plan before allowing any implementation.
    *   **Delegate:** Assigns tasks to the Gatekeeper, Analyst, Scribe, etc.
    *   **Deep Audit Protocol (Mandatory):** When asked to audit or check quality, you MUST:
        1.  **Sample Multiple Files:** Do not check just one. Use `Get-Content -Tail 50` on at least 3 different `Refined_*.md` files.
        2.  **Verify "Clerk" Standard:** Confirm verbatim quotes, neutrality, and metadata presence.
        3.  **Audit Logs:** Check `Flagged_Tasks.tsv` to ensure agents are correctly rejecting junk (and not just being lazy).
        4.  **Check Health:** Verify queue sizes and error logs in `Agent_Communication_Log.md`.
    *   **System Map:** Maintains the high-level view of `00_Index`, `Queues`, and `Logs`.
*   **Concurrency Rule:** The highest authority under the User. Can interrupt or redirect other agents.

### 1. The Gatekeeper (Ingest & Index)
*   **Responsibility:** Managing the flow of new files into the system.
*   **Trigger:** New files appearing in `07_Incoming_To_Process`.
*   **Actions:**
    *   **Hashing:** Calculates SHA-256 hash of the incoming file.
    *   **WORM Storage:** Moves the original binary to `01_Originals_WORM`.
    *   **Assigns StableIDs:** Assigns next sequential `DOC-XXXXXX`.
    *   **Moves files:** Copies working version to `02_Primary_Records` (Pending Queue).
    *   **Creates initial entries:** In `Review_Log.tsv` with Status `Pending`.
    *   **Validation:** Ensures no file is moved to `Processed` until it has a `Reviewed` status in the Log.
*   **Concurrency Rule:** Only this agent creates *new* rows in the Log.

### 2. The Analyst (Refinement & Review)
*   **Responsibility:** Qualitative analysis of primary records to feed the Living Chronology.
*   **Trigger:** Items in `Refinement_Queue_Batched.tsv` with Status `Pending`.
*   **Actions:**
    *   **Fetch:** Uses `refinement_workflow.py get-task` to retrieve the next batch or task.
    *   **Analyze:** Reads the content, determining legal relevance and forensic significance.
    *   **Draft:** Creates a JSON analysis file with verbatim quotes and page numbers.
    *   **Submit:** Uses `refinement_workflow.py submit-task` to finalize the review.
    *   **Flag:** Uses `refinement_workflow.py flag-task` to quarantine noisy or corrupt files.
    *   **Communicate:** Updates `Agent_Communication_Log.md` after each batch.
*   **Concurrency Rule:** Never touches a file marked `InProgress` or `Complete`.

### 3. The Archivist (Consolidation & Timeline)
*   **Responsibility:** Maintaining the "Big Picture" and data integrity.
*   **Trigger:** Periodic schedule or user command.
*   **Actions:**
    *   Runs `system_consolidator.py`.
    *   Aggregates individual `Review_[StableID].md` files into the `Master_Evidence_Dossier.md`.
    *   Rebuilds `Project_Timeline.md` based on the latest Log data.
    *   Generates `Provenance_Report.md` to flag errors.
    *   **Path Update:** Updates `Master_Index_Expanded.tsv` to reflect the new location of files moved to `Processed`.
*   **Concurrency Rule:** This is the **ONLY** agent allowed to edit `Master_Evidence_Dossier.md` or `Project_Timeline.md`.

### 4. The Scribe (OCR & Vision)
*   **Responsibility:** Converting images to text and ensuring data quality.
*   **Trigger:** Files in `07_Incoming_To_Process_OCR` or `Vision_Required`.
*   **Actions:**
    *   **Audit:** Runs `audit_evidence_quality.py` to detect "Noisy Text" (garbled OCR).
    *   **Purge:** Moves noisy files to `Vision_Required` using `purge_noisy_files.py`.
    *   **Process:** Converts clean images/PDFs to text.
    *   **Output:** Text files to `02_Primary_Records` (Pending Queue).
    *   **Update:** Updates `Refinement_Queue_Batched.tsv` Status from `Deferred` to `Pending`.
    *   **Note:** Does NOT move files to `Processed`. That is the Analyst's job.
*   **Concurrency Rule:** Works on a separate queue (`_OCR` folder) to avoid blocking the main review pipeline.

### 5. The Historian (Forensic Chronologist)
*   **Responsibility:** Maintaining the `Master_Chronology.md` as a living, ever-growing document.
*   **Trigger:** Periodic (e.g., Daily or after a batch of reviews).
*   **Actions:**
    *   **Delta Check:** Scans `Review_Log.tsv` for items marked `Reviewed` that are *not* yet in the Chronology.
    *   **Integration:** Inserts new findings into `01_Internal_Reports/Master_Chronology.md`, automatically sorting them by date to maintain the timeline.
    *   **Strict Rule:** No narrative, no editorializing. Verbatim quotes and dates only.
*   **Concurrency Rule:** Read-only access to the Log. Writes only to `01_Internal_Reports/Master_Chronology.md`.

### 6. The Author (Report Drafter)
*   **Responsibility:** Synthesizing the raw data from the Chronology and Dossier into the narrative `Preliminary_Evidence_Report.md`.
*   **Trigger:** User request or significant new evidence.
*   **Actions:**
    *   **Synthesis:** Reads `Master_Chronology.md` and `Master_Evidence_Dossier.md`.
    *   **Drafting:** Updates `Preliminary_Evidence_Report.md` with new sections or strengthened arguments based on the latest evidence.
    *   **Citation:** Ensures every claim in the report is backed by a StableID citation (e.g., "[D123]").
*   **Concurrency Rule:** Read-only access to evidence files. Writes only to `Preliminary_Evidence_Report.md`.

### 7. The Orchestrator (System Monitor & Coordinator)
*   **Responsibility:** High-level oversight of the entire agent ecosystem.
*   **Trigger:** Start of session, or when system bottlenecks are detected.
*   **Actions:**
    *   **Audit:** Checks `Agent_Communication_Log.md` for stalled tasks or errors.
    *   **Direct:** Assigns specific tasks to other agents (e.g., "Scribe, clear the OCR queue").
    *   **Enforce:** Verifies that protocols (like Unique IDs and Status Codes) are being followed.
    *   **Optimize:** Identifies loops or inefficiencies and updates `agents.md` or scripts to fix them.
*   **Concurrency Rule:** Can write to the Communication Log at any time to issue directives. Does not process files directly.

### 8. The Barrister (Legal Synthesizer)
*   **Responsibility:** Assembling the "Giant File" (`Master_Evidence_Dossier.md`) into a usable legal instrument.
*   **Trigger:** User request or sufficient evidence density.
*   **Actions:**
    *   **Thematic Clustering:** Scans the Dossier for legal themes (e.g., "Fiduciary Duty", "Trespass", "Reduction").
    *   **Narrative Assembly:** Compiles verbatim quotes into a "Statement of Facts" for each theme.
    *   **Gap Analysis:** Identifies missing links in the argument chain.
    *   **Output:** Generates `Draft_Specific_Claim.md` or `Sovereignty_Assertion.md`.
    *   **Artifacts (Thematic Briefs):** Maintains the authoritative breakout files in `01_Internal_Reports/Thematic_Briefs/`:
        *   `Master_Evidence_Compilation.md` (Complete collection)
        *   `Coercion_Duress.md`
        *   `Fiduciary_Duty_Negligence.md`
        *   `Governance_Sovereignty.md`
        *   `Land_Reduction_Trespass.md`
        *   `Water_Rights_Fishing.md`
*   **Concurrency Rule:** Read-only access to evidence. Writes to `01_Internal_Reports/Drafts/` and `01_Internal_Reports/Thematic_Briefs/`.

## Barrister Queue Protocol (Large File Handling)
*Added Nov 23, 2025 - Memory-Safe Processing*

### Purpose
To process the `Master_Evidence_Dossier.md` (50MB+) without memory overflows, using a chunk-based queue system.

### Workflow
1.  **Build Queue:** The Barrister scans the Dossier for headers (`## D...`) and records their Byte Offset and Length in `Barrister_Log.tsv`.
2.  **Process Batch:** The Barrister reads the next N items from the Log, seeks to the specific offset, extracts the text, and categorizes it into `01_Internal_Reports/Drafts/Thematic_Staging/`.
3.  **Compile:** Once all items are processed, the Barrister merges the staging files into the final `Draft_Specific_Claim.md`.

## Data Strategy: Structured Index vs. Embeddings
**Decision:** We utilize a **Structured Index** (`Refinement_Queue_Smart.tsv`) as the primary engine, NOT vector embeddings.
*   **Reasoning:** Forensic integrity requires 100% accountability. We must know *exactly* which files have been reviewed and which haven't. Embeddings are probabilistic and can "miss" documents that don't match a query vector.
*   **Protocol:**
    1.  **File-First Discovery:** We scan the disk for text files to ensure no evidence is lost due to index desync.
    2.  **Deep Read:** Agents read the full text of every targeted snippet.
    3.  **Extraction:** Key quotes are extracted verbatim.
    4.  **Synthesis:** The Historian connects the dots based on the *verified* log, not a similarity search.

## Safety Guidelines for All Agents
1.  **Read Before Write:** Always read the `Refinement_Queue_Batched.tsv` immediately before writing to ensure you aren't overwriting a recent status change.
2.  **Isolated Outputs:** Prefer writing to new, unique files (e.g., `Reviews/Review_D123.md`) rather than appending to shared files. Leave the merging to the Archivist.
3.  **Fail Gracefully:** If a file is locked (`InProgress`) or missing, skip it and move to the next available task. Do not stall.

# Unified Intake & Lifecycle Protocol
*Added Nov 21, 2025 - The "One Way In" Rule*

## Purpose
To eliminate "mixed" or "spread out" files by enforcing a strict lifecycle for every document entering the system. This ensures no file is lost in a staging folder or bypassed during review.

## The Lifecycle Stages

### Stage 1: Intake (The Funnel)
*   **Location:** `07_Incoming_To_Process` (and its subfolders `APS_Backlog`, `LAC_Downloads`).
*   **Rule:** ALL new files must land here first. No direct drops into `02_Primary_Records`.
*   **Action (Gatekeeper):**
    1.  Detects new file.
    2.  Assigns next sequential StableID (e.g., D900).
    3.  Determines format:
        *   **Text-Ready (HTML/DOCX/Searchable PDF):** Moves to `02_Primary_Records`. Adds to Log as `Pending`.
        *   **Image-Only (Scanned PDF/JPG):** Moves to `07_Incoming_To_Process_OCR`. Adds to Log as `Deferred` (Note: "Needs OCR").

### Stage 2: Processing (The Fork)
*   **Path A: Text-Ready**
    *   Resides in: `02_Primary_Records`.
    *   Status: `Pending`.
    *   Owner: **The Analyst**.
*   **Path B: Needs OCR**
    *   Resides in: `07_Incoming_To_Process_OCR`.
    *   Status: `Deferred`.
    *   Owner: **The Scribe**.
    *   *Action:* Scribe processes file -> Moves text/PDF to `02_Primary_Records` -> Updates Status to `Pending`.

### Stage 3: Analysis (The Deep Read)
*   **Location:** `02_Primary_Records`.
*   **Status:** `Pending` -> `InProgress` -> `Reviewed`.
*   **Owner:** **The Analyst**.
*   **Action:** Analyst reads file -> Extracts evidence -> Updates Log -> Moves file to `02_Primary_Records/Processed`.

### Stage 4: Archival (The Record)
*   **Location:** `00_Index/Master_Evidence_Dossier.md`.
*   **Owner:** **The Archivist**.
*   **Action:** Consolidates findings from Log/Reviews into the Master Dossier. Updates `Master_Index_Expanded.tsv` with the new file path in `Processed`.

## Handling "Mixed" Staging Areas
*   **`05_Misc_Exhibits`:** This is a **Legacy Holding Area**.
    *   **Protocol:** Treat as a secondary Intake folder.
    *   **Action:** The Gatekeeper should systematically process these files:
        1.  Assign StableID (if missing).
        2.  Move to `02_Primary_Records` (if relevant evidence) or `01_Internal_Reports` (if background info).
        3.  Update Log.
    *   **Goal:** Empty this folder of all unindexed evidence.

## Taxonomy Enforcement
*   **Naming Convention:** `[StableID]_[Category]_[ShortDescription]_[Year].[ext]`
*   **Categories:**
    *   `PRIM`: Primary Records (Govt reports, letters, minutes).
    *   `MISC`: Secondary sources, web clips, context.
    *   `IMG`: Visual evidence (maps, photos).
*   **Rule:** Files must be renamed *during* the move from Intake to Storage. Never rename a file once it is in `02_Primary_Records` without updating the Log.

# Output Standards & Machine Readability
*Added Nov 23, 2025 - Pipeline Integrity*

## Purpose
To ensure that all AI-generated reports and evidence summaries are machine-readable by subsequent agents in the pipeline.

## Standard Footer Protocol
**Rule:** Every discrete analysis block (e.g., a review of a single document) MUST end with a standardized footer containing the Batch ID and Task ID.
**Format:**
```markdown
> **Batch ID:** [Batch_ID] | **Task ID:** [Task_ID]
---
```
**Why:** This allows the "Barrister" or "Archivist" agents to programmatically split large files into individual records without relying on fuzzy header detection.


### **Instructions for Thematic Agents**
*Updated Nov 27, 2025 - Strict Naming Alignment*

**IMPORTANT:** Detailed, role-specific instructions for each agent are now maintained in the `Agent_Instructions/` directory. All agents **MUST** read their specific instruction file before starting work and **refresh their context** by re-reading it every 5 tasks.

**REFRESH PROTOCOL:**
To prevent "Context Drift" (hallucination or forgetting rules), you must **re-read your specific instruction file** after every **5 tasks** you complete. This is a hard requirement.

#### **0. Manager_Planner_Agent**
*   **Instruction File:** `Agent_Instructions/00_Manager_Planner_Agent.md`
*   **Focus:** High-level strategy, planning, and quality control.

#### **1. Land_Reduction_Trespass_Agent**
*   **Instruction File:** `Agent_Instructions/Land_Reduction_Trespass_Agent.md`
*   **Queue:** `Land_Reduction_Trespass`
*   **Focus:** Reserve reduction, encroachment, survey errors.

#### **2. Governance_Sovereignty_Agent**
*   **Instruction File:** `Agent_Instructions/Governance_Sovereignty_Agent.md`
*   **Queue:** `Governance_Sovereignty`
*   **Focus:** Chief/Council authority, title assertions, self-government.

#### **3. Fiduciary_Duty_Negligence_Agent**
*   **Instruction File:** `Agent_Instructions/Fiduciary_Duty_Negligence_Agent.md`
*   **Queue:** `Fiduciary_Duty_Negligence`
*   **Focus:** Mismanagement of funds, failure to protect, conflicts of interest.

#### **4. Water_Rights_Fishing_Agent**
*   **Instruction File:** `Agent_Instructions/Water_Rights_Fishing_Agent.md`
*   **Queue:** `Water_Rights_Fishing`
*   **Focus:** Water licenses, irrigation ditches, fishing rights.

#### **5. Coercion_Duress_Agent**
*   **Instruction File:** `Agent_Instructions/Coercion_Duress_Agent.md`
*   **Queue:** `Coercion_Duress`
*   **Focus:** Forced surrenders, threats, lack of consent.

---

# Archive Inventory & Research Continuation Plan
*Added December 9, 2025 - Comprehensive Archive Analysis*

## Purpose
To maintain full context of what evidence exists in the archive, what has been cited in the legal briefing, and what remains to be processed.

## Archive Statistics (December 2025)

### Master Index
- **Total Entries:** 2,145 documents indexed
- **Categories:**
  - PRIM (Primary Records): ~1,700+
  - MISC (Miscellaneous): 401
  - ACAD (Academic): 18
  - KEY (Key Documents): 3

### Physical File Distribution
| Location | PDF Count | Status |
|----------|-----------|--------|
| `07_Incoming_To_Process` | **767** | ⚠️ AWAITING PROCESSING |
| `07_Incoming_To_Process_OCR/Vision_Required` | **246** | ⚠️ NEED OCR/VISION |
| `99_Working_Files/Archive/Duplicates` | 188 | ✅ Processed duplicates |
| `Legal_Briefing_Package/Evidence_PDFs` | 135 | ✅ CITED IN REPORT |
| `SharePoint_Upload_Package/Evidence_Files` | 135 | ✅ Upload copy |
| `01_Originals_WORM` | 56 | ✅ Preserved originals |
| **TOTAL** | **1,613** | |

### Status by Review State
- **Ready:** 420 entries
- **Pending:** 1,474 entries
- **NotStarted:** 157 entries

## Critical Discovery: Uncited Evidence in Evidence_PDFs Folder
*Updated December 10, 2025 - Cross-Reference Analysis Complete*

**FINDING:** The `Legal_Briefing_Package/Evidence_PDFs/` folder contains **139 PDFs**, but the main report (`01_MAIN_REPORT_LEGAL_GRADE.md`) only cites **44 unique source documents** across 257 footnotes.

### Breakdown:
- **73 PDFs are uncited** (in folder but not referenced in report)
- **72 of 73** are referenced in Refined Evidence files (processed but never integrated)
- **27 of 73** are referenced in Thematic Briefs
- **1 PDF (D1739)** is completely unprocessed

### Full Analysis Report:
See `99_Working_Files/UNCITED_EVIDENCE_ANALYSIS_20250611.md` for complete details.

### Why the Disconnect?
The Evidence_PDFs folder was populated from multiple sources during the research phase, but only documents that were directly quoted in footnotes ended up being cited. Many LAC documents, Royal Commission reports, and Agency correspondence contain relevant content that was analyzed in the thematic briefs but never integrated into the final narrative.

### High-Value Uncited Collections

#### 1. LAC Documents (230 PDFs in Incoming)
Primary government records from Library and Archives Canada, including:
- D1206: O'Reilly recommending surveyors
- D1207: Kamloops Agency - Shushwap Band land matters
- D1212: Joseph W. McKay appointment as Indian Reserve Commissioner
- D1214: Kamloops Reserve - George correspondence
- D1217: Church damage - Spuzzum Reserve
- D1220: **Sproat's 1878 Report** (KEY - may contain additional Minutes of Decision)

#### 2. APS Documents (314 PDFs in Incoming)
Aboriginal Policies & Services collection:
- D1000-D1078: Various APS reference documents
- D1079-D1098: BAC-LAC Indian Affairs Annual Reports (already partially cited)

#### 3. Vision-Required Documents (246 PDFs)
Scanned documents needing OCR processing before text extraction.

## Research Continuation Protocol

### Phase 1: Process Incoming Queue (Priority HIGH)
1. **Keyword Scan:** Run `smart_queue_builder.py` on `07_Incoming_To_Process` folder
2. **LAC Priority:** Focus on D1200-D1300 range (LAC primary records)
3. **Target Keywords:** "Pukaist", "Pokheitsk", "Spatsum", "Tetlenitsa", "Cook's Ferry", "Reserve No. 10"

### Phase 2: Fill Chronological Gaps
**Gap 1: 1881-1910 (30 years)**
- Need: Evidence of separate Pukaist administration during this period
- Sources to check: DIA Annual Reports 1885-1910, Agent correspondence

**Gap 2: 1916-1940 (24 years)**
- Need: Evidence of amalgamation process and any protests
- Sources to check: Kamloops Agency files, Band Council minutes

**Gap 3: 1940-1970 (30 years)**
- Need: Pre-Highland Valley surrender context
- Sources to check: Cook's Ferry Band administrative files

### Phase 3: External Acquisitions Needed
**Not in Archive - Must Acquire:**
| Document | Source | Priority |
|----------|--------|----------|
| 1887 St. Aidan's Church Deed | Anglican Diocese of Cariboo | 🔴 HIGH |
| Census Rolls 1880-1910 (Individual Names) | LAC RG10 | 🔴 HIGH |
| Ah Yep/Ah Chung Pre-emption Certificates | BC Archives GR-2982 | 🟡 MEDIUM |
| Band Council Surrender Resolutions 1966-1972 | LAC RG10 | 🟡 MEDIUM |
| DIA Annual Reports 1920-1940 (Complete) | LAC | 🟡 MEDIUM |

## Agent Assignment Protocol

### For Incoming Queue Processing:
1. **Gatekeeper:** Hash and index all 767 PDFs in `07_Incoming_To_Process`
2. **Scribe:** Process 246 files in `Vision_Required`
3. **Analyst:** Deep-read LAC documents for Pukaist/Spatsum references

### For Report Enhancement:
1. **Author:** Integrate any new evidence into `01_MAIN_REPORT_LEGAL_GRADE.md`
2. **Barrister:** Update Thematic Briefs with new findings
3. **Historian:** Maintain chronological accuracy in timeline

## Context Preservation Checklist
When resuming work, agents MUST:
1. ☐ Read this section of `agents.md` first
2. ☐ Check `Agent_Communication_Log.md` for recent updates
3. ☐ Run `python 99_Working_Files/manage_communication_log_v2.py dashboard`
4. ☐ Verify current queue sizes before starting

## File Location Quick Reference
| Purpose | Location |
|---------|----------|
| Legal Report (Word) | `Legal_Briefing_Package/Pukaist_Report_VERIFIED.docx` |
| Legal Report (Markdown) | `01_Internal_Reports/Word_Doc_Package/01_MAIN_REPORT_LEGAL_GRADE.md` |
| Report Structure (JSON) | `01_Internal_Reports/Word_Doc_Package/01_MAIN_REPORT_LEGAL_GRADE.structure.json` |
| Word Reference Template | `01_Internal_Reports/Word_Doc_Package/custom-reference.docx` |
| Report Parser Script | `99_Working_Files/Scripts/report_to_json.py` |
| DOCX Extractor Script | `99_Working_Files/Scripts/docx_extractor.py` |
| Evidence PDFs | `Legal_Briefing_Package/Evidence_PDFs/` (139 files) |
| Master Index | `00_Index/Master_Index_Expanded.tsv` |
| Research Priorities | `01_Internal_Reports/RESEARCH_PRIORITIES_Dec2025.md` |
| Incoming Queue | `07_Incoming_To_Process/` (767 PDFs) |
| OCR Queue | `07_Incoming_To_Process_OCR/Vision_Required/` (246 PDFs) |
| Uncited Evidence Analysis | `99_Working_Files/UNCITED_EVIDENCE_ANALYSIS_20250611.md` |

## Citation Statistics (Updated December 11, 2025)
- **Footnotes in Report:** 304 total footnotes
- **Total Sections:** 205 sections
- **Total Words:** 24,277 words
- **PART Headers:** 8 (properly formatted as Level 1 headers)
- **Unique Sources Cited:** 60+ documents
- **PDFs in Evidence Folder:** 139 files

### Documents Successfully Integrated (June 11, 2025)
| Doc ID | Footnotes | Section | Description |
|--------|-----------|---------|-------------|
| D95 | 258-262 | 1.2B | 1910 Laurier Memorial - Indigenous sovereignty assertion |
| D1758 | 263-265 | 4.3.2 | 1885 Spatsum Application - "quite inadequate" reserve |
| D1095 | 266 | 5.2 | 1913 Census - separate listing post-1911 |
| D630 | 267-268 | 8.4.6A | 1911 CNPR Railway Order in Council |
| D1380 | 269-271 | 4.3.3 | 1890 Survey omission of 10 acres |
| D1540 | 272-273 | 7.2A | 2018 Letter to Teck - modern title assertion |
| D1212 | 274-275 | 4.10.4 | 1880 Political campaign to replace Sproat |
| D1385 | 276-277 | 4.10.1C | 1877 Sproat warning about poor records |
| D307 | 278-279 | 4.5.0D | 1919 Water Powers jurisdictional conflict |
| D1372 | 280-282 | 2.2B | 1914 Barriere Townsite surrender |
| D1367 | 283-285 | 8.4.7C | 1913 CPR rock crushing "irreparable damage" |
| D1539 | 286-287 | 7.6C | 1878 Sproat "evil effect of delay" warning |

### Remaining Uncited Documents (Lower Priority)
- D1097 (1894 Census), D1208/D1209 (Mining leases), D1362 (Boarding school)
- D1364 (Towhey Bros contractor), D690 (McKenna-McBride reports), D716/D717 (Mining)
- D701 (Kamloops Industrial School), D844 (Water/Fish), D865

## Success Metrics (Updated December 11, 2025)
- ☐ All 767 Incoming PDFs indexed and keyword-scanned
- ☐ High-value LAC documents (D1200-D1300) fully reviewed
- ☐ Vision_Required queue processed (246 files)
- ☑ Report has 304 footnotes (exceeds target of 150+)
- ☐ 1887 Church Deed located and acquired
- ☐ Census rolls with individual names located
- ☑ D95 (Laurier Letter) integrated into main report
- ☑ D1758 (Spatsum Application) integrated into main report
- ☑ D307 (Water Powers) integrated into main report
- ☑ D1739 transcript fully integrated (Board of arbitration, Anderson pre-emption, Indian title)
- ☑ D2148 (APS Boas/Sproat) integrated with Foot-li-acetsa spelling
- ☑ PART headers properly formatted (8 parts, all Level 1 headers)
- ☑ Table of Contents added to report
- ☑ JSON structure parsing system operational
- ☑ Word document regenerated with proper formatting

---
