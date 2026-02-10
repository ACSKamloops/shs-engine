# AGENTS.md — SHS Engine

## Memory Recall (CRITICAL)
Before starting any task:
1. Run `memory_search` with keywords from the task.
2. Read `MEMORY.md` for high-level context.

---

## Purpose
Operational hub for the **Secwépemc Hunting Society (SHS)** — cultural preservation, land stewardship, and Secwépemc language revitalization.

The agent assists with:
- **Website** — React/Vite public site (25 pages, 50 components)
- **Cultural materials** — organizing, digitizing, searching the SCES archive
- **Grant writing** — FPCC, Outdoor Recreation Fund, etc.
- **Events** — planning, documentation, communications
- **Language** — Secwépemctsin vocabulary, lessons, phrase books
- **LMS** — Elearniv learning platform (not yet deployed)
- **Research** — historical and cultural research

## Key Directories
| Purpose | Location |
|---------|----------|
| Frontend (React/Vite) | `frontend/` |
| Cultural data JSON | `frontend/src/data/` (gitignored) |
| Source materials | `materials/` (gitignored, 5 GB) |
| SCES Archive | `materials/archive/` |
| Handouts | `materials/handouts/` |
| Grants | `materials/grants/` |
| Events | `materials/events/` |
| Logos | `materials/logos/` |
| Research | `research/` |
| LMS source | `lms/` → `~/shs-lms` |

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind + Framer Motion + Leaflet
- **Deployment**: Hostinger (auto-deploy on push to `master`)
- **URL**: secwepemchuntingsociety.ca

## Guardrails
- `materials/` and `frontend/src/data/` are gitignored — sensitive cultural data stays local
- No auto-renaming or moving of source files
- Ask before any external-facing action (emails, submissions, deployments)
- Respect cultural sensitivity of Secwépemc materials
- **This is SHS only** — Pukaist is a separate organization with its own repos and agents
