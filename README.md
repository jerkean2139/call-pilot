# CallPilot Live

A live meeting copilot Chrome extension for browser-based meetings.

## Features (MVP)
- Real-time transcript panel with search
- Instant tagging via keyboard shortcuts (1-6, M)
- AI insights extraction (coming in v0.2)
- Post-call summary, categorized notes, follow-up email, CRM note
- Export to Markdown / JSON
- Framework document upload for call context
- Offline-first with IndexedDB storage

## Quick Start

```bash
npm install
npm run dev
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

## Keyboard Shortcuts (during active call)
| Key | Action |
|-----|--------|
| 1 | Tag: Pain Point |
| 2 | Tag: Objection |
| 3 | Tag: Action Item |
| 4 | Tag: Buying Signal |
| 5 | Tag: Key Info |
| 6 | Tag: Custom |
| M | Quick Note |

## Tech Stack
- Chrome Extension Manifest V3
- React 18 + TypeScript + Vite
- Tailwind CSS
- IndexedDB via `idb`
- CRXJS Vite Plugin
