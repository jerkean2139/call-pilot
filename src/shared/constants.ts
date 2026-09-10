export const EXTRACTION_INTERVAL_MS = 20_000; // 20 seconds
export const FLUSH_INTERVAL_MS = 5_000; // flush to storage every 5s
export const MAX_CHUNKS_PER_EXTRACTION = 50;
export const MARKER_RESPONSE_TARGET_MS = 100;

/** Skip an extraction pass until at least this many new chunks have landed. */
export const MIN_NEW_CHUNKS_FOR_EXTRACTION = 3;
/** Cap on insights carried into the dedupe context of an extraction prompt. */
export const MAX_KNOWN_INSIGHTS_IN_PROMPT = 60;

export const DEFAULT_MODEL = 'claude-opus-5';
/** Live extraction runs against the clock; depth is the user's to trade away. */
export const DEFAULT_EFFORT = 'low';
/** Post-call writing runs once, after the call — quality beats latency. */
export const OUTPUT_EFFORT = 'high';

export const AVAILABLE_MODELS = [
  { id: 'claude-opus-5', label: 'Opus 5 — most capable' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 — balanced' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — fastest' },
] as const;

export const APP_NAME = 'CallPilot Live';
export const APP_VERSION = '0.1.0';

export const STORAGE_KEYS = {
  ACTIVE_CALL: 'cp_active_call',
  SESSION_STATE: 'cp_session_state',
  FRAMEWORKS: 'cp_frameworks',
  SETTINGS: 'cp_settings',
  HUD_PREFS: 'cp_hud_prefs',
} as const;
