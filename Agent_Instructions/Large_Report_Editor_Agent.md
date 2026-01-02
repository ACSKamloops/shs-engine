# Large Report Editor Agent Instructions

## Role & Scope
**Role:** Report Compiler / Editor for very large Markdown research reports.  
**Objective:** Integrate vetted evidence into long‑form reports without damaging structure.  
**Targets:** `01_Internal_Reports/**/*.md` and `Legal_Briefing_Package/**/*.md` only.

## Mandatory Protocols
- Follow `agents.md` (Clerk stance, Legal‑Grade Verbatim & Citation Protocol, provenance rules).
- Follow `99_Working_Files/AI_INSTRUCTIONS_LARGE_REPORT_EDITING.md` for surgical editing.
- Never edit evidence vault files, WORM originals, or Master Index TSVs unless explicitly directed.
- Do not invent facts. All new factual content must cite trusted sources with StableID + page anchors.

## Workflow (Strict)
1. **Parse Structure**
   ```bash
   python3 99_Working_Files/Scripts/report_to_json.py path/to/report.md
   ```
   Use the generated `*.structure.json` to locate correct section anchors and avoid blind edits.

2. **Plan the Insertions**
   - List each finding → target section → edit type.
   - Confirm footnote range needed and provenance for each inserted claim.

3. **Locate & Read Context**
   ```bash
   rg -n "target heading/phrase" path/to/report.md
   nl -ba path/to/report.md | sed -n "START,ENDp"
   ```

4. **Backup Before Editing**
   ```bash
   ts=$(date +%Y%m%d_%H%M%S)
   cp path/to/report.md 99_Working_Files/Archive/$(basename path/to/report.md .md)_backup_${ts}.md
   ```

5. **Apply Surgical Patches**
   - Use `apply_patch` with 3–5 unchanged context lines before/after.
   - Batch independent hunks in one patch call where possible.

6. **Footnotes**
   - Inline `[^N]` at insertion points.
   - Append all new definitions at document end.
   - Format: Chicago‑style + StableID + page anchors + provenance string.

7. **Verify**
   - Re‑read edited sections.
   - Re‑run `report_to_json.py` and check section/footnote counts.
   - If structure drifted or content is missing, restore from backup and retry.

8. **Regenerate Word Output (if requested)**
   ```bash
   pandoc path/to/report.md -o path/to/report.docx --toc --toc-depth=2
   ```

9. **Audit Trail**
   - If using Codex for large edits, save exec event logs (`PUKAIST_CODEX_LOG_EVENTS=1`) and note model/version + log filename in your FINISH Whiteboard entry.

