# MEMORY.md - SHS Engine

## Project Overview
**Secwépemc Hunting Society — cultural archive, website, and community resource platform.**

- **Repo**: ACSKamloops/shs-engine
- **Stack**: React/TypeScript (Vite) — frontend only
- **Deploy**: Hostinger (auto-deploy on push to `master`)
- **URL**: secwepemchuntingsociety.ca
- **Obsidian**: `~/Obsidian/General/Projects/SHS-Engine/` (9 notes, fully documented)

## Repo Cleanup (Feb 9, 2026)
- Removed entire Pukaist backend (FastAPI, Python, OCR pipeline, tests, scripts, SDK, Docker)
- Removed all Pukaist docs, agent instructions, codex skills, geo planning
- Pukaist content moved to `~/pukaist-engine/` (reference docs only)
- Fixed 15+ TypeScript errors, recovered 48 data files from LMS
- Build passes clean: `npm run build` (2.7s, 574 modules)

## Frontend
- 25 public pages, 50 components (React 19 + Vite + Tailwind + Framer Motion + Leaflet)
- Dev: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`

## Cultural Data (48 JSON files, gitignored)
- **Source**: `~/shs-lms/elearniv-react-next/public/data/` + `prisma/seed-data/`
- **Location**: `frontend/src/data/` (copied Feb 9, 2026)
- 6 curriculum modules, 7 gold standard cultural series, 12 language resources, 4 plant databases
- 5 stub files needing content: `all_sptekwles.json`, `setsatsinas.json`, `chapter_highlights.json`, `sces_content.json`, `themed_vocabulary.json`

## Source Materials (gitignored)
- **`SHS_Materials/`** (5.0 GB):
  - `SCES_Archive/` (4.9 GB) — 49 PDFs, 31 cultural series, 21 collection, 11 secwepemcology papers (1890-2008)
  - `Grants/` — FPCC guidelines + Outdoor Recreation Fund 2026 (application, budget, form responses)
  - `winter_handouts/` — 8 handouts (moons, vocabulary, protocols, stories, games, homes, foods)
  - `winter_source_images/` — 77 scanned images from 4 SCES 1986 publications
  - `Events/` — 4 photo archives (Community Gathering, Directors, FPCC, ISPARC)
  - `Logos/` — 6 branding files
- **`shs-lms-source/`** → `~/shs-lms` — Elearniv LMS (Next.js 16, not yet deployed)
