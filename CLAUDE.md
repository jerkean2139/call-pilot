# CallPilot Live — Repository Operating Instructions

## Product
A live meeting copilot Chrome extension that shows near-real-time transcript,
lets users tag important moments instantly, continuously extracts sales
intelligence, and generates structured post-call notes.

## Tech Stack
- Chrome Extension (Manifest V3)
- React 18 + TypeScript + Vite
- Tailwind CSS (dark theme, Indigo accent)
- Framer Motion for subtle animations
- Lucide React for icons
- IndexedDB (via `idb`) for local-first storage
- CRXJS Vite Plugin for extension dev/build
- Font: Inter

## Architecture
- `src/background/` — MV3 service worker (session state, message relay)
- `src/content/` — Content script (meeting detection, caption observation)
- `src/sidepanel/` — React app rendered in Chrome side panel
- `src/components/` — UI components (TranscriptPanel, TagBar, InsightsPanel, OutputPanel)
- `src/hooks/` — React hooks (useSession, useKeyboardShortcuts)
- `src/lib/` — Storage, utilities, output generation
- `src/shared/` — Types, constants, messaging utilities

## Working Rules
- Stay inside MVP scope (transcript, tags, insights, output, export)
- Do not add backend/API until Phase 2
- Respect file ownership boundaries
- Prefer small, verifiable changes
- Keyboard-first UX (keys 1-6 for tags, M for note)
- No blocking modals during active calls
- All data stored locally in IndexedDB

## Key Routes / Views
Side panel tabs:
- **Transcript** — Live transcript with search, auto-scroll, marker highlights
- **Insights** — AI-extracted intelligence grouped by category
- **Output** — Post-call summary generation and export
- **Docs** — Framework document upload for context

## Data Model
Core entities in IndexedDB:
- `calls` — Call sessions
- `chunks` — Transcript chunks (timestamped, speaker-labeled)
- `markers` — User tags (pain-point, objection, action-item, buying-signal, key-info, custom)
- `insights` — AI-extracted intelligence with evidence references
- `outputs` — Generated summaries, emails, CRM notes
- `frameworks` — Uploaded context documents

## Commands
- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Build extension to `dist/`
- `npm test` — Run tests with Vitest
- `npm run lint` — Lint with ESLint
