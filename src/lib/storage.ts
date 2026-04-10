import { openDB, type IDBPDatabase } from 'idb';
import type {
  Call,
  TranscriptChunk,
  Marker,
  Insight,
  CallOutput,
  Framework,
  SessionState,
} from '@/shared/types';

const DB_NAME = 'callpilot';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Calls
        if (!db.objectStoreNames.contains('calls')) {
          const callStore = db.createObjectStore('calls', { keyPath: 'id' });
          callStore.createIndex('status', 'status');
        }

        // Transcript chunks
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('callId', 'callId');
          chunkStore.createIndex('callId_timestamp', ['callId', 'timestamp']);
        }

        // Markers
        if (!db.objectStoreNames.contains('markers')) {
          const markerStore = db.createObjectStore('markers', { keyPath: 'id' });
          markerStore.createIndex('callId', 'callId');
        }

        // Insights
        if (!db.objectStoreNames.contains('insights')) {
          const insightStore = db.createObjectStore('insights', { keyPath: 'id' });
          insightStore.createIndex('callId', 'callId');
          insightStore.createIndex('callId_category', ['callId', 'category']);
        }

        // Outputs
        if (!db.objectStoreNames.contains('outputs')) {
          const outputStore = db.createObjectStore('outputs', { keyPath: 'id' });
          outputStore.createIndex('callId', 'callId');
        }

        // Frameworks
        if (!db.objectStoreNames.contains('frameworks')) {
          db.createObjectStore('frameworks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Call Operations ───

export async function saveCall(call: Call): Promise<void> {
  const db = await getDB();
  await db.put('calls', call);
}

export async function getCall(id: string): Promise<Call | undefined> {
  const db = await getDB();
  return db.get('calls', id);
}

export async function getActiveCall(): Promise<Call | undefined> {
  const db = await getDB();
  const calls = await db.getAllFromIndex('calls', 'status', 'active');
  return calls[0];
}

export async function getAllCalls(): Promise<Call[]> {
  const db = await getDB();
  const calls = await db.getAll('calls');
  return calls.sort((a, b) => b.startedAt - a.startedAt);
}

// ─── Chunk Operations ───

export async function saveChunk(chunk: TranscriptChunk): Promise<void> {
  const db = await getDB();
  await db.put('chunks', chunk);
}

export async function saveChunks(chunks: TranscriptChunk[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('chunks', 'readwrite');
  await Promise.all([...chunks.map((c) => tx.store.put(c)), tx.done]);
}

export async function getChunksByCall(callId: string): Promise<TranscriptChunk[]> {
  const db = await getDB();
  const chunks = await db.getAllFromIndex('chunks', 'callId', callId);
  return chunks.sort((a, b) => a.timestamp - b.timestamp);
}

// ─── Marker Operations ───

export async function saveMarker(marker: Marker): Promise<void> {
  const db = await getDB();
  await db.put('markers', marker);
}

export async function deleteMarker(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('markers', id);
}

export async function getMarkersByCall(callId: string): Promise<Marker[]> {
  const db = await getDB();
  const markers = await db.getAllFromIndex('markers', 'callId', callId);
  return markers.sort((a, b) => a.timestamp - b.timestamp);
}

// ─── Insight Operations ───

export async function saveInsight(insight: Insight): Promise<void> {
  const db = await getDB();
  await db.put('insights', insight);
}

export async function saveInsights(insights: Insight[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('insights', 'readwrite');
  await Promise.all([...insights.map((i) => tx.store.put(i)), tx.done]);
}

export async function getInsightsByCall(callId: string): Promise<Insight[]> {
  const db = await getDB();
  return db.getAllFromIndex('insights', 'callId', callId);
}

// ─── Output Operations ───

export async function saveOutput(output: CallOutput): Promise<void> {
  const db = await getDB();
  await db.put('outputs', output);
}

export async function getOutputsByCall(callId: string): Promise<CallOutput[]> {
  const db = await getDB();
  return db.getAllFromIndex('outputs', 'callId', callId);
}

// ─── Framework Operations ───

export async function saveFramework(framework: Framework): Promise<void> {
  const db = await getDB();
  await db.put('frameworks', framework);
}

export async function getAllFrameworks(): Promise<Framework[]> {
  const db = await getDB();
  return db.getAll('frameworks');
}

export async function deleteFramework(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('frameworks', id);
}

// ─── Session State (quick save/restore) ───

export async function saveSessionState(state: SessionState): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ cp_session: JSON.stringify(state) });
    } else {
      localStorage.setItem('cp_session', JSON.stringify(state));
    }
  } catch {
    // Fallback silently — data is still in IndexedDB
  }
}

export async function loadSessionState(): Promise<SessionState | null> {
  try {
    let raw: string | null = null;
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get('cp_session');
      raw = result.cp_session ?? null;
    } else {
      raw = localStorage.getItem('cp_session');
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Full Session Restore from IndexedDB ───

export async function restoreSession(callId: string): Promise<SessionState | null> {
  const call = await getCall(callId);
  if (!call) return null;

  const [chunks, markers, insights, outputs] = await Promise.all([
    getChunksByCall(callId),
    getMarkersByCall(callId),
    getInsightsByCall(callId),
    getOutputsByCall(callId),
  ]);

  return { call, chunks, markers, insights, outputs };
}
