# SHS Engine — Secwépemc Hunting Society Website

The public website and cultural learning platform for the **Secwépemc Hunting Society**.

## 🌲 Overview

A React/TypeScript site built with Vite featuring:

- **Cultural Curriculum** — 6 learning pathways (Food Sovereignty, Land Stewardship, Cultural Preservation, Healing & Wellness, Youth Mentorship, Legal Traditions)
- **Language Resources** — Secwépemctsin dictionary, phrase browser, lessons, vocabulary
- **Territory Map** — Interactive Leaflet map of Secwepemcúl'ecw
- **Cultural Knowledge** — Plants database, seasonal calendar, place names, stewardship practices
- **Stories** — Traditional teaching stories (sptékwles)
- **Community** — Events, gallery, membership, donate

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```
shs-engine/
├── frontend/               # React + Vite website
│   ├── src/
│   │   ├── pages/public/   # 25 public pages
│   │   ├── components/     # UI components (public, cultural, curriculum, admin)
│   │   ├── data/           # Cultural content JSON (gitignored)
│   │   ├── hooks/          # useLanguageData, useProgress
│   │   └── store/          # Zustand (map markers)
│   └── public/             # Static assets
├── SHS_Materials/          # Source documents (gitignored)
│   ├── SCES_Archive/       # 4.9GB cultural archive PDFs
│   ├── Grants/             # FPCC, Outdoor Recreation Fund
│   ├── winter_handouts/    # 8 Secwépemctsin handouts
│   └── Logos/              # SHS branding
├── shs-lms-source/         # LMS (Elearniv Next.js)
├── docs/                   # OCR documentation
└── AGENTS.md               # Agent instructions
```

## 🌐 Deployment

Deployed to **Hostinger** via GitHub integration:
- Push to `master` → automatic build & deploy
- Build: `cd frontend && npm run build`
- Output: `frontend/dist/`

## 🧪 Testing

```bash
cd frontend
npm run build          # Type-check + production build
npm run test:unit      # Unit tests (Vitest)
npx playwright test    # E2E tests
```

## 📜 License

[License details TBD]

---

*Dedicated to strengthening Secwépemc cultural practices through technology.*
