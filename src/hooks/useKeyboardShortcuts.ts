import { useEffect } from 'react';
import { MARKER_SHORTCUTS, type MarkerType } from '@/shared/types';

interface UseKeyboardShortcutsOptions {
  onMarker: (type: MarkerType, label: string) => void;
  onCustomMarker: () => void;
  enabled: boolean;
}

export function useKeyboardShortcuts({
  onMarker,
  onCustomMarker,
  enabled,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // M key = quick note / custom marker
      if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onCustomMarker();
        return;
      }

      // Number keys 1-6 for marker shortcuts
      const shortcut = MARKER_SHORTCUTS[e.key];
      if (shortcut && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onMarker(shortcut.type, shortcut.label);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onMarker, onCustomMarker, enabled]);
}
