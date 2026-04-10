export const EXTRACTION_INTERVAL_MS = 20_000; // 20 seconds
export const FLUSH_INTERVAL_MS = 5_000; // flush to storage every 5s
export const MAX_CHUNKS_PER_EXTRACTION = 50;
export const MARKER_RESPONSE_TARGET_MS = 100;

export const APP_NAME = 'CallPilot Live';
export const APP_VERSION = '0.1.0';

export const STORAGE_KEYS = {
  ACTIVE_CALL: 'cp_active_call',
  SESSION_STATE: 'cp_session_state',
  FRAMEWORKS: 'cp_frameworks',
  SETTINGS: 'cp_settings',
} as const;
