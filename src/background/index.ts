import type { ExtensionMessage, SessionState, TranscriptChunk, Marker } from '@/shared/types';

/**
 * CallPilot Live — Background Service Worker
 *
 * Responsibilities:
 * - Manage call session lifecycle
 * - Relay messages between content script and side panel
 * - Buffer transcript chunks for extraction
 * - Coordinate storage flushes
 */

let sessionState: SessionState = {
  call: null,
  chunks: [],
  markers: [],
  insights: [],
  outputs: [],
};

// ─── Side Panel Setup ───

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// ─── Message Router ───

chrome.runtime.onMessage.addListener(
  (msg: ExtensionMessage, sender, sendResponse) => {
    switch (msg.type) {
      case 'CALL_START': {
        const call = msg.payload as SessionState['call'];
        sessionState = {
          call,
          chunks: [],
          markers: [],
          insights: [],
          outputs: [],
        };
        broadcastState();
        break;
      }

      case 'CALL_END': {
        if (sessionState.call) {
          sessionState.call = {
            ...sessionState.call,
            status: 'ended',
            endedAt: Date.now(),
          };
          broadcastState();
        }
        break;
      }

      case 'TRANSCRIPT_CHUNK': {
        const chunk = msg.payload as TranscriptChunk;
        sessionState.chunks.push(chunk);
        broadcastState();
        break;
      }

      case 'ADD_MARKER': {
        const marker = msg.payload as Marker;
        sessionState.markers.push(marker);
        broadcastState();
        break;
      }

      case 'DELETE_MARKER': {
        const markerId = msg.payload as string;
        sessionState.markers = sessionState.markers.filter((m) => m.id !== markerId);
        broadcastState();
        break;
      }

      case 'UPDATE_MARKER': {
        const updated = msg.payload as Marker;
        sessionState.markers = sessionState.markers.map((m) =>
          m.id === updated.id ? updated : m,
        );
        broadcastState();
        break;
      }

      case 'SESSION_STATE': {
        // Request for current state
        sendResponse(sessionState);
        return true; // async response
      }

      case 'PING': {
        sendResponse({ status: 'alive', hasActiveCall: !!sessionState.call });
        return true;
      }
    }
  },
);

function broadcastState(): void {
  // Broadcast to all extension views (side panel, popup, etc.)
  chrome.runtime.sendMessage({
    type: 'SESSION_STATE',
    payload: sessionState,
  }).catch(() => {});
}

// ─── Keep-alive for MV3 service worker ───

chrome.alarms.create('keep-alive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    // Just keeping the service worker alive during active calls
  }
});
