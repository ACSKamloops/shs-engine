# TOOLS.md - Local Notes

## Project Stack
- **Frontend**: React 19 / TypeScript / Vite in `frontend/`
- **Styling**: Tailwind CSS
- **Maps**: Leaflet
- **Animations**: Framer Motion
- **State**: Zustand + React Query
- **Deployment**: Hostinger (GitHub integration, auto-deploy on push to `master`)
- **URL**: secwepemchuntingsociety.ca

## Dev Commands
- `cd frontend && npm run dev` — Dev server (localhost:5173)
- `cd frontend && npm run build` — Production build (type-check + Vite bundle, ~2.7s)
- `cd frontend && npm run test:unit` — Vitest unit tests
- `cd frontend && npx playwright test` — E2E tests

## Data
- Cultural content JSON: `frontend/src/data/` (48 files, gitignored)
- Source: `~/shs-lms/elearniv-react-next/public/data/` + `prisma/seed-data/`
- 5 stub files need real content (see MEMORY.md)

## Key Paths
- Repo: `~/shs-engine` (ACSKamloops/shs-engine)
- LMS: `~/shs-lms` (ACSKamloops/pukaist-lms) — symlinked at `shs-lms-source/`
- Materials: `SHS_Materials/` (5 GB, gitignored)
- Obsidian: `~/Obsidian/General/Projects/SHS-Engine/` (9 notes)

## Deploy
Push to `master` → Hostinger auto-builds:
- Root: `frontend`
- Build: `npm run build`
- Output: `dist/`
- Node: 20.x
