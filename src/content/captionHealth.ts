/**
 * Caption health.
 *
 * Scraping live captions depends on selectors we guessed from someone else's
 * markup, and when they stop matching nothing throws — the transcript just
 * stays empty forever. That silence is indistinguishable, from the user's side,
 * from "I forgot to turn captions on."
 *
 * This module separates those two cases and says which one it is.
 */

export type CaptionPhase =
  | 'searching' // in a call, still looking — normal for the first few seconds
  | 'captions-off' // the app has a captions control and it isn't producing text
  | 'no-adapter' // no caption panel and no captions control: our selectors are likely stale
  | 'listening' // attached to a caption panel, nobody has spoken yet
  | 'flowing'; // text is arriving

export type CaptionSeverity = 'ok' | 'info' | 'warn';

export interface CaptionStatus {
  phase: CaptionPhase;
  severity: CaptionSeverity;
  /** Shown verbatim in the HUD. Says what to do, not what went wrong. */
  message: string;
}

export interface CaptionObservation {
  platform: string;
  /** A caption panel is attached and still in the document. */
  containerAttached: boolean;
  chunksSeen: number;
  msInCall: number;
  /** A captions on/off control was found in the meeting UI. */
  toggleFound: boolean;
}

/** Meeting apps mount their caption panel lazily; don't cry wolf before this. */
export const SEARCH_GRACE_MS = 8_000;

interface PlatformCopy {
  name: string;
  enableHint: string;
}

const PLATFORMS: Record<string, PlatformCopy> = {
  'google-meet': {
    name: 'Google Meet',
    enableHint: 'Turn on captions with the CC button in the bottom bar.',
  },
  zoom: {
    name: 'Zoom',
    enableHint: 'Turn on captions with Show Captions in the meeting toolbar.',
  },
  teams: {
    name: 'Microsoft Teams',
    enableHint: 'Turn on captions under More (…) → Language and speech → Turn on live captions.',
  },
};

function copyFor(platform: string): PlatformCopy {
  return (
    PLATFORMS[platform] ?? {
      name: 'This meeting',
      enableHint: 'Turn on live captions in the meeting app.',
    }
  );
}

export function classifyCaptions(observation: CaptionObservation): CaptionStatus {
  const { containerAttached, chunksSeen, msInCall, toggleFound, platform } = observation;

  if (containerAttached) {
    return chunksSeen > 0
      ? { phase: 'flowing', severity: 'ok', message: '' }
      : {
          phase: 'listening',
          severity: 'ok',
          message: 'Captions connected. Waiting for someone to speak.',
        };
  }

  if (msInCall < SEARCH_GRACE_MS) {
    return { phase: 'searching', severity: 'info', message: 'Looking for captions…' };
  }

  // A captions control exists, so we understand this page — the captions
  // themselves just aren't on.
  if (toggleFound) {
    return {
      phase: 'captions-off',
      severity: 'warn',
      message: `No captions yet. ${copyFor(platform).enableHint}`,
    };
  }

  // No panel and no control. Either this isn't really a call, or the app
  // changed its markup and our selectors need updating — say so plainly rather
  // than leaving the user to wonder.
  return {
    phase: 'no-adapter',
    severity: 'warn',
    message: `CallPilot can't find the caption controls in ${copyFor(platform).name}. The app's layout may have changed — check for an extension update.`,
  };
}

/**
 * Look for the meeting app's captions on/off control.
 *
 * Deliberately narrowed to button-like elements: the caption panel itself often
 * carries a "captions" label too, and counting it here would report a working
 * adapter when we in fact never attached to anything.
 */
export function findCaptionToggle(root: ParentNode = document): boolean {
  const selectors = [
    'button[aria-label*="caption" i]',
    'button[aria-label*="subtitle" i]',
    'button[aria-label*="transcript" i]',
    '[role="button"][aria-label*="caption" i]',
    '[role="button"][aria-label*="subtitle" i]',
    '[role="menuitemcheckbox"][aria-label*="caption" i]',
    'button[data-tid*="caption" i]',
    'button[title*="caption" i]',
  ];

  return selectors.some((selector) => root.querySelector(selector) !== null);
}
