import type {
  ExtensionMessage,
  SessionState,
  TranscriptChunk,
  Marker,
  Call,
  ExtractionStatus,
  Framework,
} from '@/shared/types';
import {
  EXTRACTION_INTERVAL_MS,
  MIN_NEW_CHUNKS_FOR_EXTRACTION,
  MAX_CHUNKS_PER_EXTRACTION,
  STORAGE_KEYS,
} from '@/shared/constants';
import { extractInsights, mergeInsights } from '@/lib/insightExtractor';
import { getSettings } from '@/lib/settings';
import * as storage from '@/lib/storage';

/**
 * CallPilot Live — Background Service Worker
 *
 * Owns the call session, runs the insight extraction loop, and fans state out
 * to the side panel and the in-meeting HUD.
 *
 * MV3 kills this worker when idle, so session state is mirrored into
 * chrome.storage.session and rehydrated on every wake-up. Nothing here may
 * assume module scope survived.
 */

const EMPTY_STATE: SessionState = {
  call: null,
  chunks: [],
  markers: [],
  insights: [],
  outputs: [],
};

let sessionState: SessionState = EMPTY_STATE;
let meetingTabId: number | null = null;
/** Chunk ids that have landed but not yet been through an extraction pass. */
let pendingChunkIds: string[] = [];
let extraction: ExtractionStatus = { phase: 'idle', insightCount: 0 };
let extractionInFlight = false;
let lastExtractionAt = 0;

const ready = rehydrate();

async function rehydrate(): Promise<void> {
  try {
    const stored = await chrome.storage.session.get(STORAGE_KEYS.SESSION_STATE);
    const saved = stored[STORAGE_KEYS.SESSION_STATE] as
      | { state: SessionState; meetingTabId: number | null; pendingChunkIds: string[] }
      | undefined;

    if (saved?.state) {
      sessionState = saved.state;
      meetingTabId = saved.meetingTabId ?? null;
      pendingChunkIds = saved.pendingChunkIds ?? [];
      extraction = { ...extraction, insightCount: sessionState.insights.length };
      console.log('[CallPilot BG] Rehydrated session:', sessionState.call?.id ?? 'none');
    }
  } catch (err) {
    console.warn('[CallPilot BG] Rehydrate failed:', err);
  }
}

async function persistSession(): Promise<void> {
  try {
    await chrome.storage.session.set({
      [STORAGE_KEYS.SESSION_STATE]: {
        state: sessionState,
        meetingTabId,
        pendingChunkIds,
      },
    });
  } catch (err) {
    console.warn('[CallPilot BG] Session persist failed:', err);
  }
}

// ─── Side Panel: open automatically when extension icon is clicked ───

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// ─── Message Router ───

chrome.runtime.onMessage.addListener((msg: ExtensionMessage, sender, sendResponse) => {
  handleMessage(msg, sender)
    .then(sendResponse)
    .catch((err) => {
      console.error('[CallPilot BG] Handler error:', err);
      sendResponse({ error: String(err) });
    });
  return true; // responses are always async
});

async function handleMessage(
  msg: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  await ready;

  switch (msg.type) {
    // Content script detected a meeting — auto-start a session if none active
    case 'MEETING_DETECTED': {
      const { platform, title } = msg.payload as { platform: string; title: string };
      meetingTabId = sender.tab?.id ?? meetingTabId;

      if (!sessionState.call || sessionState.call.status === 'ended') {
        const call: Call = {
          id: `call-${Date.now()}`,
          title: title || `${platform} call`,
          startedAt: Date.now(),
          status: 'active',
          source: platform,
        };
        sessionState = { ...EMPTY_STATE, call };
        pendingChunkIds = [];
        extraction = { phase: 'idle', insightCount: 0 };
        await storage.saveCall(call);
        console.log(`[CallPilot BG] Auto-started session: ${call.id} (${platform})`);
      }

      await persistSession();
      broadcastState();
      return { callId: sessionState.call?.id ?? null };
    }

    // Side panel manually started a call
    case 'CALL_START': {
      const call = msg.payload as Call;
      sessionState = { ...EMPTY_STATE, call };
      pendingChunkIds = [];
      extraction = { phase: 'idle', insightCount: 0 };
      await persistSession();
      broadcastState();
      return { callId: call.id };
    }

    case 'CALL_END': {
      if (sessionState.call) {
        sessionState.call = {
          ...sessionState.call,
          status: 'ended',
          endedAt: Date.now(),
        };
        await flushToDisk();
        await persistSession();
        broadcastState();
      }
      return { ok: true };
    }

    case 'CALL_PAUSE': {
      if (sessionState.call) {
        sessionState.call = { ...sessionState.call, status: 'paused' };
        await persistSession();
        broadcastState();
      }
      return { ok: true };
    }

    // Transcript chunk from content script — stamp with active callId
    case 'TRANSCRIPT_CHUNK': {
      const chunk = msg.payload as TranscriptChunk;

      if (!sessionState.call || sessionState.call.status !== 'active') {
        // No active session — drop silently (content script will re-register)
        return { accepted: false };
      }

      const stamped: TranscriptChunk = { ...chunk, callId: sessionState.call.id };

      const last = sessionState.chunks[sessionState.chunks.length - 1];
      if (last && last.speaker === stamped.speaker && last.text === stamped.text) {
        return { accepted: false };
      }

      sessionState.chunks.push(stamped);
      pendingChunkIds.push(stamped.id);
      await persistSession();
      broadcastState();
      void maybeExtract();
      return { accepted: true };
    }

    case 'ADD_MARKER': {
      const marker = msg.payload as Marker;
      if (sessionState.call) {
        const stamped = { ...marker, callId: sessionState.call.id };
        sessionState.markers.push(stamped);
        await storage.saveMarker(stamped);
        await persistSession();
        broadcastState();
      }
      return { ok: true };
    }

    case 'DELETE_MARKER': {
      const markerId = msg.payload as string;
      sessionState.markers = sessionState.markers.filter((m) => m.id !== markerId);
      await storage.deleteMarker(markerId);
      await persistSession();
      broadcastState();
      return { ok: true };
    }

    case 'UPDATE_MARKER': {
      const updated = msg.payload as Marker;
      sessionState.markers = sessionState.markers.map((m) =>
        m.id === updated.id ? updated : m,
      );
      await storage.saveMarker(updated);
      await persistSession();
      broadcastState();
      return { ok: true };
    }

    case 'REQUEST_INSIGHTS': {
      await maybeExtract(true);
      return { ok: true };
    }

    case 'SETTINGS_CHANGED': {
      broadcastState();
      return { ok: true };
    }

    case 'SESSION_STATE':
      return sessionState;

    case 'EXTRACTION_STATUS':
      return extraction;

    case 'PING':
      return { status: 'alive', hasActiveCall: !!sessionState.call };

    default:
      return { ok: true };
  }
}

// ─── Insight Extraction Loop ───

async function maybeExtract(force = false): Promise<void> {
  if (extractionInFlight) return;

  const call = sessionState.call;
  if (!call || call.status !== 'active') return;

  if (!force) {
    if (pendingChunkIds.length < MIN_NEW_CHUNKS_FOR_EXTRACTION) return;
    if (Date.now() - lastExtractionAt < EXTRACTION_INTERVAL_MS) return;
  }
  if (pendingChunkIds.length === 0) return;

  const settings = await getSettings();
  if (!settings.extractionEnabled) {
    setExtractionStatus({ phase: 'disabled' });
    return;
  }
  if (!settings.apiKey) {
    setExtractionStatus({
      phase: 'error',
      lastError: 'Add your Anthropic API key in CallPilot settings to enable insights.',
    });
    return;
  }

  extractionInFlight = true;
  lastExtractionAt = Date.now();
  setExtractionStatus({ phase: 'running' });

  // Claim the pending ids now so chunks arriving mid-flight aren't skipped.
  // Repeated failures re-queue them, so cap the backlog at what one prompt can
  // carry rather than letting a long outage grow it without bound.
  const claimedIds = pendingChunkIds.slice(-MAX_CHUNKS_PER_EXTRACTION);
  pendingChunkIds = [];

  try {
    const frameworks = await loadFrameworks();
    const extracted = await extractInsights({
      callId: call.id,
      chunks: sessionState.chunks,
      newChunkIds: claimedIds,
      knownInsights: sessionState.insights,
      frameworks,
      settings,
    });

    if (extracted.length > 0) {
      sessionState.insights = mergeInsights(sessionState.insights, extracted);
      await storage.saveInsights(sessionState.insights);
      await persistSession();
      broadcastState();
    }

    setExtractionStatus({
      phase: 'idle',
      lastRunAt: Date.now(),
      lastError: undefined,
    });
  } catch (err) {
    // Put the chunks back so the next pass still sees them.
    pendingChunkIds = [...claimedIds, ...pendingChunkIds];
    console.error('[CallPilot BG] Extraction failed:', err);
    setExtractionStatus({
      phase: 'error',
      lastRunAt: Date.now(),
      lastError: err instanceof Error ? err.message : String(err),
    });
  } finally {
    extractionInFlight = false;
  }
}

function setExtractionStatus(patch: Partial<ExtractionStatus>): void {
  extraction = {
    ...extraction,
    ...patch,
    insightCount: sessionState.insights.length,
  };
  chrome.runtime
    .sendMessage({ type: 'EXTRACTION_STATUS', payload: extraction })
    .catch(() => {});
}

async function loadFrameworks(): Promise<Framework[]> {
  try {
    return await storage.getAllFrameworks();
  } catch {
    return [];
  }
}

async function flushToDisk(): Promise<void> {
  if (!sessionState.call) return;
  try {
    await storage.saveCall(sessionState.call);
    if (sessionState.chunks.length) await storage.saveChunks(sessionState.chunks);
    if (sessionState.insights.length) await storage.saveInsights(sessionState.insights);
  } catch (err) {
    console.warn('[CallPilot BG] Disk flush failed:', err);
  }
}

// ─── Fan-out ───

function broadcastState(): void {
  // Side panel — silently ignored when the panel isn't open.
  chrome.runtime
    .sendMessage({ type: 'SESSION_STATE', payload: sessionState })
    .catch(() => {});

  // In-meeting HUD — only the parts it renders, to keep the channel quiet.
  if (meetingTabId !== null) {
    chrome.tabs
      .sendMessage(meetingTabId, {
        type: 'HUD_SYNC',
        payload: {
          call: sessionState.call,
          insights: sessionState.insights,
          markers: sessionState.markers,
        },
      })
      .catch(() => {
        // Tab closed or content script not injected yet.
      });
  }
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId !== meetingTabId) return;

  meetingTabId = null;
  await ready;
  if (sessionState.call && sessionState.call.status === 'active') {
    sessionState.call = { ...sessionState.call, status: 'ended', endedAt: Date.now() };
    await flushToDisk();
    await persistSession();
    broadcastState();
  }
});

// ─── Extraction backstop ───
// The 20s timer lives in maybeExtract(); this alarm is what wakes a worker that
// MV3 has already shut down, so a quiet stretch of call still gets a pass.

chrome.alarms.create('extraction-tick', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'extraction-tick') return;
  await ready;
  await maybeExtract();
});
