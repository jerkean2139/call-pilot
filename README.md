# CallPilot Live

A live meeting copilot Chrome extension for browser-based meetings.

## Features
- Real-time transcript panel with search
- **In-meeting HUD** — a draggable, resizable overlay on the meeting tab itself,
  so you can scroll back through what was said without leaving the call
- **Live AI insight extraction** — the transcript is analysed every ~20 seconds
  and highlights surface on the HUD as the conversation happens
- Instant tagging via keyboard shortcuts (1-6, M), from the HUD or the side panel
- Post-call summary, categorized notes, follow-up email, CRM note
- Export to Markdown / JSON
- Framework document upload for call context
- Local-first: transcripts and insights live in IndexedDB, never on a server

## Quick Start

```bash
npm install
npm run build
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

`npm run dev` runs the same build with HMR for side-panel work.

## Setting up insights

Insight extraction calls the Anthropic API directly from the extension — there
is no CallPilot server in the loop.

1. Create a key at [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Open the side panel, click the gear, paste the key
3. Pick a model — Opus 5 by default; Haiku 4.5 is cheaper and faster per pass

The key is stored in `chrome.storage.local`, unencrypted, like any browser
extension credential. Anyone with access to the browser profile can read it, so
scope the key to this tool and revoke it if the machine is shared.

## Post-call documents

When a call ends, the Output tab writes four documents from the transcript, your
tags, and the extracted insights: an executive summary, categorized notes, a
follow-up email, and a structured CRM note.

These are written by the model, not assembled from a template. The prompt holds
it to what was actually said — no invented commitments, numbers, or names, and
`[bracketed]` placeholders where a detail is genuinely missing rather than a
plausible guess. Uploaded framework docs shape what it considers important and
match your vocabulary, but are explicitly fenced off from being reported as
things said on the call.

The CRM note's factual fields (date, duration, participants) are filled in
locally rather than asked of the model.

**Without an API key** the old local templates still run, so the tab keeps
working — the output is badged `local` and tells you why it fell back. Adding a
key and pressing rewrite regenerates it properly.

## The HUD

The overlay mounts on Meet, Zoom, and Teams once a call is detected.

| Control | What it does |
|---------|--------------|
| Title bar | Drag to reposition |
| Bottom-right corner | Resize |
| Camera icon | Snap back to the "camera line" — centred at the top of the screen, so reading the transcript keeps your eyes near the webcam |
| Bulb icon | Show/hide the live highlights list |
| Slider | Opacity, for when it sits over someone's face |
| `−` | Collapse to just the title bar |
| `×` | Hide the HUD (re-enable it in side panel settings) |

Scroll up in the transcript and a **jump to live** pill appears with a count of
what you missed; click it to snap back to the bottom.

### When captions don't show up

CallPilot reads the meeting app's own captions, which means it depends on
selectors that can stop matching when Meet, Zoom, or Teams change their markup.
Rather than sitting there empty, the HUD says which of the two things went
wrong:

| Banner | Meaning |
|--------|---------|
| *"Turn on captions with…"* | The app has a captions control and it isn't on — the fix is yours, and the banner names the exact button for your platform |
| *"CallPilot can't find the caption controls…"* | No caption panel **and** no captions control — the fix is ours, and the adapter selectors likely need updating |
| *"Captions connected. Waiting for someone to speak."* | Working; the room is just quiet |

CallPilot also re-attaches on its own when a meeting app re-renders and replaces
the caption panel mid-call, which otherwise stops the transcript dead with no
error anywhere.

Tag hotkeys work while the meeting tab has focus — except when you're typing in
a chat box or search field, where the keys go where you'd expect.

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
