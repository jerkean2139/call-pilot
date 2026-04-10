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

import type { TranscriptChunk } from '@/shared/types';

let platform: string | null = null;
let activeCallId: string | null = null;
let callStartTime: number | null = null;
let captionObserver: MutationObserver | null = null;
let bodyObserver: MutationObserver | null = null;
let chunkCounter = 0;
let lastChunkText = '';
let lastChunkSpeaker = '';

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
    }
  }).catch(() => {
    // Background not ready yet — retry in a moment
    setTimeout(notifyMeetingDetected, 2000);
  });
}

// ─── Caption Observer Dispatch ───

function startCaptionObserver(): void {
  if (captionObserver) return; // already watching

  switch (platform) {
    case 'google-meet':
      startGoogleMeetObserver();
      break;
    case 'zoom':
      startZoomObserver();
      break;
    case 'teams':
      startTeamsObserver();
      break;
  }
}

// ─── Google Meet Caption Observer ───
// Enable captions: click the CC button in the bottom bar of the call

function startGoogleMeetObserver(): void {
  const findContainer = () =>
    // Meet uses various class names — try multiple selectors
    document.querySelector('[jsname="tgaKEf"]') ||
    document.querySelector('.a4cQT') ||
    document.querySelector('[class*="VbkSUe"]') ||
    // Fallback: any element that looks like a captions panel
    document.querySelector('[aria-label*="caption"]') ||
    document.querySelector('[aria-label*="Caption"]');

  const attach = () => {
    const container = findContainer();
    if (container) {
      attachObserver(container, extractGoogleMeetChunk);
      console.log('[CallPilot] Google Meet caption observer attached');
    }
  };

  // Try immediately
  attach();

  // Also watch body for the container appearing (captions toggled mid-call)
  bodyObserver = new MutationObserver(attach);
  bodyObserver.observe(document.body, { childList: true, subtree: true });
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

// ─── Zoom Web Caption Observer ───
// Enable: click "CC" or "Live Transcript" button in the Zoom toolbar

function startZoomObserver(): void {
  const findContainer = () =>
    document.querySelector('.live-transcription') ||
    document.querySelector('[class*="transcript-panel"]') ||
    document.querySelector('.captions-box') ||
    document.querySelector('[aria-label*="Transcript"]') ||
    document.querySelector('[id*="live-transcript"]');

  const attach = () => {
    const container = findContainer();
    if (container) {
      attachObserver(container, extractZoomChunk);
      console.log('[CallPilot] Zoom caption observer attached');
    }
  };

  attach();
  bodyObserver = new MutationObserver(attach);
  bodyObserver.observe(document.body, { childList: true, subtree: true });
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

// ─── Microsoft Teams Caption Observer ───
// Enable: click ... More → Language and speech → Turn on live captions

function startTeamsObserver(): void {
  const findContainer = () =>
    document.querySelector('[data-tid="transcript-container"]') ||
    document.querySelector('[class*="transcript"]') ||
    document.querySelector('[id*="closed-captions"]') ||
    document.querySelector('.caption-container') ||
    document.querySelector('[aria-label*="captions"]');

  const attach = () => {
    const container = findContainer();
    if (container) {
      attachObserver(container, extractTeamsChunk);
      console.log('[CallPilot] Teams caption observer attached');
    }
  };

  attach();
  bodyObserver = new MutationObserver(attach);
  bodyObserver.observe(document.body, { childList: true, subtree: true });
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

// ─── Shared Observer Attach ───

function attachObserver(
  container: Element,
  extractor: (node: HTMLElement) => void,
): void {
  if (captionObserver) captionObserver.disconnect();

  captionObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLElement) extractor(node);
      }
      if (m.type === 'characterData' && m.target.parentElement) {
        extractor(m.target.parentElement);
      }
    }
  });

  captionObserver.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
  });
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
  captionObserver?.disconnect();
  bodyObserver?.disconnect();

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
