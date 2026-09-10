import { describe, it, expect, beforeEach } from 'vitest';
import { getSettings, saveSettings, getHudPrefs, saveHudPrefs } from './settings';
import { DEFAULT_MODEL } from '@/shared/constants';

// No chrome global under jsdom, so these exercise the localStorage fallback.
beforeEach(() => localStorage.clear());

describe('settings', () => {
  it('returns defaults before anything is saved', async () => {
    const settings = await getSettings();

    expect(settings.apiKey).toBe('');
    expect(settings.model).toBe(DEFAULT_MODEL);
    expect(settings.extractionEnabled).toBe(true);
  });

  it('merges a patch over what is already stored', async () => {
    await saveSettings({ apiKey: 'sk-ant-test' });
    await saveSettings({ model: 'claude-haiku-4-5' });

    const settings = await getSettings();
    expect(settings.apiKey).toBe('sk-ant-test');
    expect(settings.model).toBe('claude-haiku-4-5');
  });

  it('backfills defaults for keys added after a settings blob was written', async () => {
    localStorage.setItem('cp_settings', JSON.stringify({ apiKey: 'sk-ant-old' }));

    const settings = await getSettings();
    expect(settings.apiKey).toBe('sk-ant-old');
    expect(settings.hudEnabled).toBe(true);
  });

  it('falls back to defaults on a corrupted blob rather than throwing', async () => {
    localStorage.setItem('cp_settings', '{not json');

    const settings = await getSettings();
    expect(settings.model).toBe(DEFAULT_MODEL);
    expect(settings.extractionEnabled).toBe(true);
  });
});

describe('hud prefs', () => {
  it('defaults to the camera-line position', async () => {
    const prefs = await getHudPrefs();

    expect(prefs.x).toBeNull();
    expect(prefs.y).toBeNull();
    expect(prefs.showHighlights).toBe(true);
  });

  it('keeps unrelated prefs when one changes', async () => {
    await saveHudPrefs({ x: 120, y: 40 });
    await saveHudPrefs({ opacity: 0.5 });

    const prefs = await getHudPrefs();
    expect(prefs).toMatchObject({ x: 120, y: 40, opacity: 0.5 });
  });
});
