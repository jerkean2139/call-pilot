import type { FrameSettings } from '../types';

const STORAGE_KEY = 'living-legacy-frame-settings';

const defaultSettings: FrameSettings = {
  enabled: false,
  frameType: 'aura',
  frameEmail: '',
  frameName: '',
};

export function getFrameSettings(): FrameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultSettings;
}

export function saveFrameSettings(settings: FrameSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getFrameEmailDomain(frameType: string): string {
  switch (frameType) {
    case 'aura':
      return '@send.auraframes.com';
    case 'skylight':
      return '@ourskylight.com';
    case 'nixplay':
      return '@nixplay.com';
    default:
      return '';
  }
}

export function getFrameTypeName(frameType: string): string {
  switch (frameType) {
    case 'aura': return 'Aura';
    case 'skylight': return 'Skylight';
    case 'nixplay': return 'Nixplay';
    case 'custom': return 'Custom';
    default: return frameType;
  }
}

export async function sharePhotosViaWebShare(photos: string[], title?: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const files: File[] = await Promise.all(
      photos.map(async (base64, i) => {
        const res = await fetch(base64);
        const blob = await res.blob();
        return new File([blob], `${title || 'photo'}-${i + 1}.jpg`, { type: blob.type || 'image/jpeg' });
      })
    );

    await navigator.share({
      title: title || 'Baby Photos',
      text: title ? `${title} - Living Legacy` : 'Photos from Living Legacy',
      files,
    });
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') return false;
    throw err;
  }
}

export function openEmailToFrame(frameEmail: string, photos: string[], title?: string): void {
  const subject = encodeURIComponent(title || 'Photos from Living Legacy');
  const body = encodeURIComponent(
    `${title || 'Baby photos'}\n\nSent from Living Legacy baby journal.\n\nNote: Please attach the downloaded photos to this email before sending.`
  );
  window.open(`mailto:${frameEmail}?subject=${subject}&body=${body}`, '_blank');
}

export async function downloadPhoto(base64: string, filename: string): Promise<void> {
  const a = document.createElement('a');
  a.href = base64;
  a.download = filename;
  a.click();
}
