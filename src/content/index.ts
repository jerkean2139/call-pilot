/**
 * CallPilot Live — Content Script
 *
 * Injected into meeting pages (Google Meet, Zoom, Teams).
 * Responsible for:
 * - Detecting meeting state
 * - Observing captions/transcript DOM elements
 * - Forwarding transcript chunks to the background worker
 */

import type { TranscriptChunk } from '@/shared/types';

let callStartTime: number | null = null;
let observer: MutationObserver | null = null;
let chunkCounter = 0;

// ─── Meeting Detection ───

function detectMeetingPlatform(): string | null {
  const url = window.location.href;
  if (url.includes('meet.google.com')) return 'google-meet';
  if (url.includes('zoom.us')) return 'zoom';
  if (url.includes('teams.microsoft.com')) return 'teams';
  return null;
}

function init(): void {
  const platform = detectMeetingPlatform();
  if (!platform) return;

  console.log(`[CallPilot] Detected platform: ${platform}`);

  // Notify background that we're on a meeting page
  chrome.runtime.sendMessage({
    type: 'PING',
    payload: { platform },
  }).catch(() => {});

  // Start observing for captions based on platform
  if (platform === 'google-meet') {
    observeGoogleMeetCaptions();
  }
  // Zoom and Teams adapters to be added in v0.2
}

// ─── Google Meet Captions Observer ───

function observeGoogleMeetCaptions(): void {
  // Google Meet renders captions in elements with specific data attributes
  // We observe the document for caption container appearance
  const captionSelector = '[data-self-name], .a4cQT';

  const checkForCaptions = () => {
    const captionContainer = document.querySelector('.a4cQT')
      || document.querySelector('[jsname="tgaKEf"]');

    if (captionContainer && !observer) {
      startCaptionObserver(captionContainer);
    }
  };

  // Check periodically since captions may be toggled
  const interval = setInterval(checkForCaptions, 2000);

  // Also observe DOM for dynamic caption container
  const bodyObserver = new MutationObserver(() => {
    checkForCaptions();
  });

  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function startCaptionObserver(container: Element): void {
  if (!callStartTime) {
    callStartTime = Date.now();
  }

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          extractCaptionChunk(node);
        }
      }
      // Also check characterData changes for live updates
      if (mutation.type === 'characterData' && mutation.target.parentElement) {
        extractCaptionChunk(mutation.target.parentElement);
      }
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  console.log('[CallPilot] Caption observer started');
}

function extractCaptionChunk(element: HTMLElement): void {
  const text = element.textContent?.trim();
  if (!text || text.length < 2) return;

  // Try to extract speaker name from Google Meet caption structure
  const speakerEl = element.querySelector('[data-self-name]')
    || element.closest('[data-self-name]');
  const speaker = speakerEl?.getAttribute('data-self-name') || 'Unknown';

  const chunk: TranscriptChunk = {
    id: `chunk-${Date.now()}-${++chunkCounter}`,
    callId: '', // Set by background worker
    speaker,
    text,
    timestamp: callStartTime ? Date.now() - callStartTime : 0,
    createdAt: Date.now(),
  };

  chrome.runtime.sendMessage({
    type: 'TRANSCRIPT_CHUNK',
    payload: chunk,
  }).catch(() => {});
}

// ─── Cleanup ───

window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// ─── Initialize ───

init();
