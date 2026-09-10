import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyCaptions,
  findCaptionToggle,
  SEARCH_GRACE_MS,
  type CaptionObservation,
} from './captionHealth';

function observe(over: Partial<CaptionObservation> = {}): CaptionObservation {
  return {
    platform: 'google-meet',
    containerAttached: false,
    chunksSeen: 0,
    msInCall: SEARCH_GRACE_MS + 1000,
    toggleFound: false,
    ...over,
  };
}

describe('classifyCaptions', () => {
  it('says nothing while text is arriving', () => {
    const status = classifyCaptions(observe({ containerAttached: true, chunksSeen: 12 }));

    expect(status.phase).toBe('flowing');
    expect(status.severity).toBe('ok');
    expect(status.message).toBe('');
  });

  it('treats an attached but silent panel as fine, not broken', () => {
    const status = classifyCaptions(
      observe({ containerAttached: true, chunksSeen: 0, msInCall: 10 * 60_000 }),
    );

    expect(status.phase).toBe('listening');
    expect(status.severity).toBe('ok');
  });

  it('holds off during the grace period while the panel is still mounting', () => {
    const status = classifyCaptions(observe({ msInCall: SEARCH_GRACE_MS - 1 }));

    expect(status.phase).toBe('searching');
    expect(status.severity).not.toBe('warn');
  });

  it('tells the user to switch captions on when the app has a control for it', () => {
    const status = classifyCaptions(observe({ toggleFound: true }));

    expect(status.phase).toBe('captions-off');
    expect(status.severity).toBe('warn');
    expect(status.message).toContain('CC button');
  });

  it('gives the right instructions per platform', () => {
    expect(classifyCaptions(observe({ toggleFound: true, platform: 'zoom' })).message).toContain(
      'Show Captions',
    );
    expect(classifyCaptions(observe({ toggleFound: true, platform: 'teams' })).message).toContain(
      'Language and speech',
    );
  });

  it('blames itself, not the user, when no captions UI can be found at all', () => {
    const status = classifyCaptions(observe({ toggleFound: false }));

    expect(status.phase).toBe('no-adapter');
    expect(status.severity).toBe('warn');
    expect(status.message).toMatch(/can't find/i);
    expect(status.message).toMatch(/Google Meet/);
  });

  it('falls back to generic copy on an unrecognised platform', () => {
    const status = classifyCaptions(observe({ toggleFound: true, platform: 'webex' }));

    expect(status.message).toContain('Turn on live captions in the meeting app.');
  });

  it('prefers the attached panel over any toggle state', () => {
    // A visible CC button while we are already reading captions is not a problem.
    const status = classifyCaptions(
      observe({ containerAttached: true, chunksSeen: 3, toggleFound: true }),
    );

    expect(status.phase).toBe('flowing');
  });
});

describe('findCaptionToggle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('finds a captions button regardless of label casing', () => {
    document.body.innerHTML = '<button aria-label="Turn on Captions">CC</button>';
    expect(findCaptionToggle()).toBe(true);
  });

  it('finds role=button and Teams-style controls', () => {
    document.body.innerHTML = '<div role="button" aria-label="subtitles"></div>';
    expect(findCaptionToggle()).toBe(true);

    document.body.innerHTML = '<button data-tid="toggle-captions"></button>';
    expect(findCaptionToggle()).toBe(true);
  });

  it('ignores the caption panel itself, which also mentions captions', () => {
    // The panel is the thing we failed to attach to — counting it as a toggle
    // would report a healthy adapter when there is none.
    document.body.innerHTML = '<div aria-label="Captions" class="a4cQT"></div>';
    expect(findCaptionToggle()).toBe(false);
  });

  it('returns false on a page with no captions UI', () => {
    document.body.innerHTML = '<button aria-label="Leave call"></button>';
    expect(findCaptionToggle()).toBe(false);
  });
});
