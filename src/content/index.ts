/**
 * CallPilot Live — Content Script
 *
 * Injected into Google Meet, Zoom (web), and Teams (web).
 *
 * Workflow:
 * 1. Detect meeting platform from URL
 * 2. Wait for meeting to become active (in-call state)
 * 3. Notify background → get callId back
 * 4. Observe captions DOM and forward chunks with callId stamped
 *
 * Captions MUST be enabled by the user in the meeting app.
 * Google Meet: CC button (bottom bar)
 * Zoom web:    CC / Live Transcript button
 * Teams:       More → Language and speech → Turn on live captions
 */

import type {
  TranscriptChunk,
  Marker,
  MarkerType,
  Call,
  Insight,
  ExtensionMessage,
} from '@/shared/types';
import { mountHud, type HudHandle } from './hud';
import {
  classifyCaptions,
  findCaptionToggle,
  type CaptionPhase,
} from './captionHealth';
import { CaptionAttacher } from './captionObserver';
import { getSettings, saveSettings } from '@/lib/settings';
import { generateId } from '@/lib/utils';

const HEALTH_INTERVAL_MS = 5_000;

let platform: string | null = null;
let activeCallId: string | null = null;
let callStartTime: number | null = null;
let bodyObserver: MutationObserver | null = null;
let attacher: CaptionAttacher | null = null;
let healthTimer: ReturnType<typeof setInterval> | undefined;
let lastCaptionPhase: CaptionPhase | null = null;
let chunksSeen = 0;
let chunkCounter = 0;
let lastChunkText = '';
let lastChunkSpeaker = '';
let hud: HudHandle | null = null;

// ─── Platform Detection ───

function detectPlatform(): string | null {
  const url = window.location.href;
  if (url.includes('meet.google.com')) return 'google-meet';
  if (url.includes('zoom.us/wc') || url.includes('zoom.us/j')) return 'zoom';
  if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'teams';
  return null;
}

// ─── In-call State Detection ───

function isInCall(): boolean {
  switch (platform) {
    case 'google-meet':
      // In-call: main video grid or leave button is present
      return !!(
        document.querySelector('[data-call-ended="false"]') ||
        document.querySelector('[aria-label="Leave call"]') ||
        document.querySelector('[jsname="CQylAd"]') // leave button jsname
      );
    case 'zoom':
      // Zoom web client renders a meeting container
      return !!(
        document.querySelector('.meeting-client-inner') ||
        document.querySelector('#wc-container-left') ||
        document.querySelector('[class*="meeting-app"]')
      );
    case 'teams':
      return !!(
        document.querySelector('[data-tid="call-status-container"]') ||
        document.querySelector('.ts-calling-screen') ||
        document.querySelector('[class*="calling-unified-bar"]')
      );
    default:
      return false;
  }
}

// ─── Notify Background & Get CallId ───

function notifyMeetingDetected(): void {
  const title = document.title || `${platform} call`;

  chrome.runtime.sendMessage({
    type: 'MEETING_DETECTED',
    payload: {
      platform,
      title,
      tabId: null, // background infers from sender
    },
  }).then((response: { callId: string | null }) => {
    if (response?.callId) {
      activeCallId = response.callId;
      callStartTime = Date.now();
      console.log(`[CallPilot] Session active: ${activeCallId}`);
      startCaptionObserver();
      void ensureHud();
    }
  }).catch(() => {
    // Background not ready yet — retry in a moment
    setTimeout(notifyMeetingDetected, 2000);
  });
}

// ─── Heads-Up Display ───

async function ensureHud(): Promise<void> {
  if (hud) return;

  const settings = await getSettings();
  if (!settings.hudEnabled) return;

  hud = await mountHud({
    onTag: (type, label) => addMarker(type, label),
    onClose: () => {
      hud?.destroy();
      hud = null;
      void saveSettings({ hudEnabled: false });
    },
  });

  if (activeCallId && callStartTime) {
    hud.setCall({
      id: activeCallId,
      title: document.title,
      startedAt: callStartTime,
      status: 'active',
      source: platform ?? 'unknown',
    });
    // Mounting is async, so the HUD missed any health report already made.
    reportCaptionHealth();
  }
}

function addMarker(type: MarkerType, label: string): void {
  if (!activeCallId || !callStartTime) return;

  const marker: Marker = {
    id: generateId(),
    callId: activeCallId,
    type,
    label,
    timestamp: Date.now() - callStartTime,
    createdAt: Date.now(),
  };

  chrome.runtime.sendMessage({ type: 'ADD_MARKER', payload: marker }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg: ExtensionMessage) => {
  if (msg.type === 'HUD_SYNC') {
    const { call, insights } = msg.payload as { call: Call | null; insights: Insight[] };
    hud?.setCall(call);
    hud?.setInsights(insights);
  }

  if (msg.type === 'TOGGLE_HUD') {
    if (hud) {
      hud.destroy();
      hud = null;
    } else {
      void ensureHud();
    }
  }

  if (msg.type === 'SETTINGS_CHANGED') {
    const settings = msg.payload as { hudEnabled: boolean };
    if (settings.hudEnabled && !hud) void ensureHud();
    if (!settings.hudEnabled && hud) {
      hud.destroy();
      hud = null;
    }
  }
});

// ─── Caption Adapters ───
// One entry per meeting app: where its caption panel lives, and how to pull a
// speaker and a line out of the nodes that appear inside it.

interface CaptionAdapter {
  findContainer: () => Element | null;
  extract: (node: HTMLElement) => void;
}

const ADAPTERS: Record<string, CaptionAdapter> = {
  'google-meet': {
    // Enable captions: the CC button in the bottom bar of the call
    findContainer: () =>
      document.querySelector('[jsname="tgaKEf"]') ||
      document.querySelector('.a4cQT') ||
      document.querySelector('[class*="VbkSUe"]') ||
      document.querySelector('[aria-label*="caption" i]'),
    extract: extractGoogleMeetChunk,
  },
  zoom: {
    // Enable: the "CC" / "Show Captions" button in the Zoom toolbar
    findContainer: () =>
      document.querySelector('.live-transcription') ||
      document.querySelector('[class*="transcript-panel"]') ||
      document.querySelector('.captions-box') ||
      document.querySelector('[aria-label*="Transcript" i]') ||
      document.querySelector('[id*="live-transcript"]'),
    extract: extractZoomChunk,
  },
  teams: {
    // Enable: More (…) → Language and speech → Turn on live captions
    findContainer: () =>
      document.querySelector('[data-tid="transcript-container"]') ||
      document.querySelector('[class*="transcript"]') ||
      document.querySelector('[id*="closed-captions"]') ||
      document.querySelector('.caption-container') ||
      document.querySelector('[aria-label*="captions" i]'),
    extract: extractTeamsChunk,
  },
};

// ─── Caption Observer ───

function startCaptionObserver(): void {
  // Reconnecting to a restarted background calls this again; without the guard
  // each pass would leak another body observer and health timer.
  if (attacher) return;

  const adapter = platform ? ADAPTERS[platform] : undefined;
  if (!adapter) return;

  attacher = new CaptionAttacher(adapter.findContainer, adapter.extract);
  syncAttachment();

  // The caption panel appears when captions are switched on, and meeting apps
  // re-render it out from under us, so keep watching the page for both.
  bodyObserver = new MutationObserver(syncAttachment);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  // A backstop for a panel swapped in without a body mutation we saw.
  healthTimer = setInterval(() => {
    syncAttachment();
    reportCaptionHealth();
  }, HEALTH_INTERVAL_MS);

  reportCaptionHealth();
}

function syncAttachment(): void {
  // 'unchanged' is the overwhelmingly common case — the body observer fires on
  // every mutation the meeting app makes — so it must stay silent and cheap.
  const outcome = attacher?.sync().outcome;
  if (outcome === undefined || outcome === 'unchanged' || outcome === 'not-found') return;

  console.log(
    outcome === 'reattached'
      ? '[CallPilot] Caption panel was replaced — reattached'
      : `[CallPilot] Caption observer attached (${platform})`,
  );
  reportCaptionHealth();
}

// ─── Caption Health ───
// Without this the failure mode is silence: an empty transcript looks the same
// whether captions are off or our selectors stopped matching.

function reportCaptionHealth(): void {
  if (!callStartTime) return;

  const status = classifyCaptions({
    platform: platform ?? 'unknown',
    containerAttached: attacher?.attached ?? false,
    chunksSeen,
    msInCall: Date.now() - callStartTime,
    toggleFound: findCaptionToggle(),
  });

  hud?.setCaptionStatus(status);

  if (status.phase !== lastCaptionPhase) {
    lastCaptionPhase = status.phase;
    console.log(`[CallPilot] Caption health: ${status.phase}`);
  }
}

function extractGoogleMeetChunk(node: HTMLElement): void {
  // Google Meet caption structure:
  // <div jsname="tgaKEf">
  //   <span data-sender-name="Name">
  //     <span>transcript text</span>
  //   </span>
  // </div>

  const text = node.textContent?.trim();
  if (!text || text.length < 3) return;

  // Speaker: look for data-sender-name or nearby speaker label
  const speakerEl =
    node.querySelector('[data-sender-name]') ||
    node.closest('[data-sender-name]') ||
    node.querySelector('[class*="zs7s8d"]'); // Meet speaker name class

  const speaker =
    speakerEl?.getAttribute('data-sender-name') ||
    speakerEl?.textContent?.trim() ||
    'Unknown';

  emitChunk(speaker, text);
}

function extractZoomChunk(node: HTMLElement): void {
  const text = node.textContent?.trim();
  if (!text || text.length < 3) return;

  // Zoom transcript format: "Speaker Name: text"
  const colonIdx = text.indexOf(':');
  let speaker = 'Unknown';
  let body = text;

  if (colonIdx > 0 && colonIdx < 40) {
    speaker = text.slice(0, colonIdx).trim();
    body = text.slice(colonIdx + 1).trim();
  }

  if (body.length < 2) return;
  emitChunk(speaker, body);
}

function extractTeamsChunk(node: HTMLElement): void {
  const text = node.textContent?.trim();
  if (!text || text.length < 3) return;

  // Teams caption structure typically has speaker in a separate child
  const speakerEl =
    node.querySelector('[class*="speaker"]') ||
    node.querySelector('[class*="displayName"]') ||
    node.querySelector('[data-tid*="participant"]');

  const speaker = speakerEl?.textContent?.trim() || 'Unknown';
  const body = text.replace(speaker, '').replace(/^[:\s]+/, '').trim();

  emitChunk(speaker, body || text);
}

// ─── Emit Chunk to Background ───

function emitChunk(speaker: string, text: string): void {
  if (!activeCallId) return;

  // Debounce: skip exact duplicate from same speaker
  if (text === lastChunkText && speaker === lastChunkSpeaker) return;
  lastChunkText = text;
  lastChunkSpeaker = speaker;

  const chunk: TranscriptChunk = {
    id: `chunk-${Date.now()}-${++chunkCounter}`,
    callId: activeCallId,
    speaker,
    text,
    timestamp: callStartTime ? Date.now() - callStartTime : 0,
    createdAt: Date.now(),
  };

  // Render locally first — the HUD should never wait on a round trip.
  hud?.addLine(chunk);

  if (++chunksSeen === 1) reportCaptionHealth(); // listening → flowing

  chrome.runtime.sendMessage({
    type: 'TRANSCRIPT_CHUNK',
    payload: chunk,
  }).catch(() => {
    console.warn('[CallPilot] Failed to send chunk — background may have restarted');
    // Re-register with background on next chunk
    activeCallId = null;
    setTimeout(notifyMeetingDetected, 1000);
  });
}

// ─── In-call Poller ───
// Polls until we detect an active meeting, then notifies background

function pollForMeeting(): void {
  if (activeCallId) return; // already active

  if (isInCall()) {
    notifyMeetingDetected();
  } else {
    setTimeout(pollForMeeting, 3000);
  }
}

// ─── Cleanup ───

window.addEventListener('beforeunload', () => {
  attacher?.disconnect();
  bodyObserver?.disconnect();
  clearInterval(healthTimer);
  hud?.destroy();

  if (activeCallId) {
    chrome.runtime.sendMessage({ type: 'CALL_END' }).catch(() => {});
  }
});

// ─── Init ───

platform = detectPlatform();
if (platform) {
  console.log(`[CallPilot] Platform detected: ${platform}`);
  pollForMeeting();
}
