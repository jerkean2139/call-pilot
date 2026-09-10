import { STORAGE_KEYS, DEFAULT_MODEL, DEFAULT_EFFORT } from '@/shared/constants';
import type { Settings, HudPrefs } from '@/shared/types';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: DEFAULT_MODEL,
  effort: DEFAULT_EFFORT,
  extractionEnabled: true,
  hudEnabled: true,
};

const DEFAULT_HUD_PREFS: HudPrefs = {
  x: null,
  y: null,
  width: 380,
  height: 420,
  opacity: 0.92,
  collapsed: false,
  showHighlights: true,
};

export async function getSettings(): Promise<Settings> {
  const stored = await readKey<Partial<Settings>>(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await writeKey(STORAGE_KEYS.SETTINGS, next);
  return next;
}

export async function getHudPrefs(): Promise<HudPrefs> {
  const stored = await readKey<Partial<HudPrefs>>(STORAGE_KEYS.HUD_PREFS);
  return { ...DEFAULT_HUD_PREFS, ...stored };
}

export async function saveHudPrefs(patch: Partial<HudPrefs>): Promise<HudPrefs> {
  const next = { ...(await getHudPrefs()), ...patch };
  await writeKey(STORAGE_KEYS.HUD_PREFS, next);
  return next;
}

async function readKey<T>(key: string): Promise<T | undefined> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(key);
    return result[key] as T | undefined;
  }
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : undefined;
}

async function writeKey(key: string, value: unknown): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}
