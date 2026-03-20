# Living Legacy - Baby Journal PWA

## Project Context
Living Legacy is a mobile-first Progressive Web App for parents to capture and cherish every moment of their baby's journey. It features journaling, milestone tracking, growth charts, and a beautiful timeline view.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (warm colors: rose, amber, violet palette)
- Framer Motion for animations
- Recharts for growth charts
- Lucide React for icons
- IndexedDB for offline-first local storage
- PWA with service worker for offline support
- Fonts: Montserrat (headings), Open Sans (body)

## Design Principles
- Mobile-first, thumb-zone friendly
- Warm, nurturing aesthetic (cream backgrounds, soft rounded cards)
- Offline-first — all data stored in IndexedDB
- No backend required — fully client-side
- PWA installable on home screen

## Key Routes
- `/` — Dashboard (baby overview, quick actions, recent entries)
- `/journal` — Journal entries list with search and category filter
- `/journal/new` — Create new journal entry
- `/journal/:id` — View journal entry detail
- `/milestones` — Milestone tracker with category tabs
- `/growth` — Growth charts (weight, height, head circumference)
- `/timeline` — Chronological timeline of all events
- `/settings` — Baby profile, export/import data

## Data Storage
All data is stored in IndexedDB with four object stores:
- `babies` — Baby profiles
- `journal` — Journal entries (with photo support via base64)
- `milestones` — Achieved milestones
- `growth` — Growth measurements

## Features
- Onboarding flow for first-time setup
- Journal with categories, moods, and photo attachments
- 50+ developmental milestone templates organized by category
- Growth tracking with interactive charts
- Timeline view grouping events by month
- Data export/import for backup
- PWA offline support
