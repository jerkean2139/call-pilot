import type { ExtensionMessage, SessionState, TranscriptChunk, Marker, Call } from '@/shared/types';

/**
 * CallPilot Live — Background Service Worker
 *
 * Responsibilities:
 * - Manage call session lifecycle (auto-start when content script detects a meeting)
 * - Relay messages between content script and side panel
 * - Stamp transcript chunks with the active callId
 * - Coordinate storage flushes
 */

let sessionState: SessionState = {
  call: null,
  chunks: [],
  markers: [],
  insights: [],
  outputs: [],
};

// ─── Side Panel: open automatically when extension icon is clicked ───

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// ─── Message Router ───

chrome.runtime.onMessage.addListener(
  (msg: ExtensionMessage, sender, sendResponse) => {
    switch (msg.type) {

      // Content script detected a meeting — auto-start a session if none active
      case 'MEETING_DETECTED': {
        const { platform, title, tabId } = msg.payload as {
          platform: string;
          title: string;
          tabId: number;
        };

        if (!sessionState.call || sessionState.call.status === 'ended') {
          const call: Call = {
            id: `call-${Date.now()}`,
            title: title || `${platform} call`,
            startedAt: Date.now(),
            status: 'active',
            source: platform,
          };
          sessionState = {
            call,
            chunks: [],
            markers: [],
            insights: [],
            outputs: [],
          };
          console.log(`[CallPilot BG] Auto-started session: ${call.id} (${platform})`);
        }

        // Reply with current callId so content script can stamp chunks
        sendResponse({ callId: sessionState.call?.id ?? null });
        broadcastState();
        return true; // async response
      }

      // Side panel manually started a call
      case 'CALL_START': {
        const call = msg.payload as Call;
        sessionState = {
          call,
          chunks: [],
          markers: [],
          insights: [],
          outputs: [],
        };
        broadcastState();
        // Reply with callId for any listening content scripts
        sendResponse({ callId: call.id });
        return true;
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

      case 'CALL_PAUSE': {
        if (sessionState.call) {
          sessionState.call = { ...sessionState.call, status: 'paused' };
          broadcastState();
        }
        break;
      }

      // Transcript chunk from content script — stamp with active callId
      case 'TRANSCRIPT_CHUNK': {
        const chunk = msg.payload as TranscriptChunk;

        if (!sessionState.call || sessionState.call.status === 'ended') {
          // No active session — drop silently (content script will re-request)
          break;
        }

        const stamped: TranscriptChunk = {
          ...chunk,
          callId: sessionState.call.id,
        };

        // Deduplicate: skip if same text as the last chunk from same speaker
        const last = sessionState.chunks[sessionState.chunks.length - 1];
        if (last && last.speaker === stamped.speaker && last.text === stamped.text) {
          break;
        }

        sessionState.chunks.push(stamped);
        broadcastState();
        break;
      }

      case 'ADD_MARKER': {
        const marker = msg.payload as Marker;
        if (sessionState.call) {
          const stamped = { ...marker, callId: sessionState.call.id };
          sessionState.markers.push(stamped);
          broadcastState();
        }
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
        sendResponse(sessionState);
        return true;
      }

      case 'PING': {
        sendResponse({ status: 'alive', hasActiveCall: !!sessionState.call });
        return true;
      }
    }
  },
);

function broadcastState(): void {
  // Silently ignore "Could not establish connection" — side panel may not be open yet
  chrome.runtime.sendMessage({
    type: 'SESSION_STATE',
    payload: sessionState,
  }).catch((_err) => {
    // No active receivers — this is expected when side panel is closed
  });
}


// ─── Keep-alive for MV3 service worker ───

chrome.alarms.create('keep-alive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    // Intentional no-op — just keeping the worker alive
  }
});
