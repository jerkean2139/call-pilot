// ─── Core Domain Entities ───

export interface Call {
  id: string;
  title: string;
  startedAt: number;
  endedAt?: number;
  status: 'active' | 'paused' | 'ended';
  source: string; // e.g., 'google-meet', 'zoom', 'manual'
  participantCount?: number;
}

export interface TranscriptChunk {
  id: string;
  callId: string;
  speaker: string;
  text: string;
  timestamp: number; // ms since call start
  createdAt: number; // wall clock
  confidence?: number;
}

export type MarkerType =
  | 'pain-point'
  | 'objection'
  | 'action-item'
  | 'buying-signal'
  | 'key-info'
  | 'custom';

export interface Marker {
  id: string;
  callId: string;
  type: MarkerType;
  label: string;
  note?: string;
  timestamp: number; // ms since call start
  chunkId?: string; // linked transcript chunk
  createdAt: number;
}

export type InsightCategory =
  | 'pain-point'
  | 'symptom'
  | 'desired-outcome'
  | 'objection'
  | 'current-tools'
  | 'urgency'
  | 'budget'
  | 'authority'
  | 'personal'
  | 'follow-up'
  | 'risk'
  | 'buying-signal';

export type InsightSource = 'direct' | 'inferred';

export interface Insight {
  id: string;
  callId: string;
  category: InsightCategory;
  text: string;
  confidence: number; // 0-1
  evidenceChunkIds: string[];
  evidenceQuote?: string;
  source: InsightSource;
  createdAt: number;
  updatedAt: number;
}

export interface Framework {
  id: string;
  name: string;
  type: 'pitch-deck' | 'discovery-framework' | 'objection-guide' | 'other';
  chunks: FrameworkChunk[];
  uploadedAt: number;
}

export interface FrameworkChunk {
  id: string;
  frameworkId: string;
  text: string;
  metadata?: Record<string, string>;
}

export interface CallOutput {
  id: string;
  callId: string;
  type: 'executive-summary' | 'categorized-notes' | 'follow-up-email' | 'crm-note';
  content: string;
  generatedAt: number;
}

// ─── Marker Shortcuts ───

export const MARKER_SHORTCUTS: Record<string, { type: MarkerType; label: string; key: string }> = {
  '1': { type: 'pain-point', label: 'Pain Point', key: '1' },
  '2': { type: 'objection', label: 'Objection', key: '2' },
  '3': { type: 'action-item', label: 'Action Item', key: '3' },
  '4': { type: 'buying-signal', label: 'Buying Signal', key: '4' },
  '5': { type: 'key-info', label: 'Key Info', key: '5' },
  '6': { type: 'custom', label: 'Custom', key: '6' },
};

// ─── Message Types (Extension Messaging) ───

export type MessageType =
  | 'CALL_START'
  | 'CALL_END'
  | 'CALL_PAUSE'
  | 'TRANSCRIPT_CHUNK'
  | 'ADD_MARKER'
  | 'DELETE_MARKER'
  | 'UPDATE_MARKER'
  | 'REQUEST_INSIGHTS'
  | 'INSIGHTS_UPDATE'
  | 'REQUEST_SUMMARY'
  | 'SUMMARY_READY'
  | 'SESSION_STATE'
  | 'PING';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

// ─── UI State ───

export type ViewTab = 'transcript' | 'insights' | 'output';

export interface SessionState {
  call: Call | null;
  chunks: TranscriptChunk[];
  markers: Marker[];
  insights: Insight[];
  outputs: CallOutput[];
}
