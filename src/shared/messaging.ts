import type { ExtensionMessage, MessageType } from './types';

/**
 * Send a message through chrome.runtime (works from sidepanel, content script, background).
 * Falls back to custom events for dev mode without extension context.
 */
export function sendMessage(type: MessageType, payload?: unknown): void {
  const msg: ExtensionMessage = { type, payload };

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(msg).catch(() => {
      // No listeners — safe to ignore
    });
  } else {
    // Dev mode fallback: use custom events on window
    window.dispatchEvent(new CustomEvent('callpilot-message', { detail: msg }));
  }
}

/**
 * Listen for extension messages. Returns a cleanup function.
 */
export function onMessage(
  handler: (msg: ExtensionMessage, sender?: chrome.runtime.MessageSender) => void,
): () => void {
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    const listener = (
      msg: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
    ) => {
      handler(msg, sender);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }

  // Dev mode fallback
  const listener = (e: Event) => {
    const ce = e as CustomEvent<ExtensionMessage>;
    handler(ce.detail);
  };
  window.addEventListener('callpilot-message', listener);
  return () => window.removeEventListener('callpilot-message', listener);
}

/**
 * Send message to a specific tab's content script.
 */
export function sendToTab(tabId: number, type: MessageType, payload?: unknown): void {
  if (typeof chrome !== 'undefined' && chrome.tabs?.sendMessage) {
    chrome.tabs.sendMessage(tabId, { type, payload } as ExtensionMessage).catch(() => {});
  }
}
