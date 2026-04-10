import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Call,
  TranscriptChunk,
  Marker,
  Insight,
  CallOutput,
  MarkerType,
  SessionState,
} from '@/shared/types';
import { onMessage, sendMessage } from '@/shared/messaging';
import { generateId } from '@/lib/utils';
import * as storage from '@/lib/storage';
import { FLUSH_INTERVAL_MS } from '@/shared/constants';

export function useSession() {
  const [call, setCall] = useState<Call | null>(null);
  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [outputs, setOutputs] = useState<CallOutput[]>([]);
  const flushTimer = useRef<ReturnType<typeof setInterval>>();

  // ─── Listen for state broadcasts from background ───

  useEffect(() => {
    const cleanup = onMessage((msg) => {
      if (msg.type === 'SESSION_STATE' && msg.payload) {
        const state = msg.payload as SessionState;
        setCall(state.call);
        setChunks(state.chunks);
        setMarkers(state.markers);
        setInsights(state.insights);
        setOutputs(state.outputs);
      }
    });

    // Request initial state
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SESSION_STATE' }).then((state: SessionState) => {
        if (state?.call) {
          setCall(state.call);
          setChunks(state.chunks);
          setMarkers(state.markers);
          setInsights(state.insights);
          setOutputs(state.outputs);
        }
      }).catch(() => {});
    }

    return cleanup;
  }, []);

  // ─── Periodic flush to IndexedDB ───

  useEffect(() => {
    flushTimer.current = setInterval(() => {
      if (call) {
        storage.saveCall(call);
        if (chunks.length) storage.saveChunks(chunks);
        markers.forEach((m) => storage.saveMarker(m));
      }
    }, FLUSH_INTERVAL_MS);

    return () => clearInterval(flushTimer.current);
  }, [call, chunks, markers]);

  // ─── Actions ───

  const startCall = useCallback((title: string, source = 'manual') => {
    const newCall: Call = {
      id: generateId(),
      title,
      startedAt: Date.now(),
      status: 'active',
      source,
    };
    setCall(newCall);
    sendMessage('CALL_START', newCall);
    storage.saveCall(newCall);
  }, []);

  const endCall = useCallback(() => {
    if (!call) return;
    const ended = { ...call, status: 'ended' as const, endedAt: Date.now() };
    setCall(ended);
    sendMessage('CALL_END', ended);
    storage.saveCall(ended);
  }, [call]);

  const addChunk = useCallback(
    (speaker: string, text: string) => {
      if (!call) return;
      const chunk: TranscriptChunk = {
        id: generateId(),
        callId: call.id,
        speaker,
        text,
        timestamp: Date.now() - call.startedAt,
        createdAt: Date.now(),
      };
      setChunks((prev) => [...prev, chunk]);
      sendMessage('TRANSCRIPT_CHUNK', chunk);
    },
    [call],
  );

  const addMarker = useCallback(
    (type: MarkerType, label: string, note?: string) => {
      if (!call) return;
      const marker: Marker = {
        id: generateId(),
        callId: call.id,
        type,
        label,
        note,
        timestamp: Date.now() - call.startedAt,
        chunkId: chunks.length > 0 ? chunks[chunks.length - 1].id : undefined,
        createdAt: Date.now(),
      };
      setMarkers((prev) => [...prev, marker]);
      sendMessage('ADD_MARKER', marker);
      storage.saveMarker(marker);
      return marker;
    },
    [call, chunks],
  );

  const removeMarker = useCallback((markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
    sendMessage('DELETE_MARKER', markerId);
    storage.deleteMarker(markerId);
  }, []);

  const addOutput = useCallback(
    (type: CallOutput['type'], content: string) => {
      if (!call) return;
      const output: CallOutput = {
        id: generateId(),
        callId: call.id,
        type,
        content,
        generatedAt: Date.now(),
      };
      setOutputs((prev) => [...prev, output]);
      storage.saveOutput(output);
      return output;
    },
    [call],
  );

  // ─── Session restore ───

  const restoreFromStorage = useCallback(async (callId: string) => {
    const state = await storage.restoreSession(callId);
    if (state) {
      setCall(state.call);
      setChunks(state.chunks);
      setMarkers(state.markers);
      setInsights(state.insights);
      setOutputs(state.outputs);
    }
  }, []);

  return {
    // State
    call,
    chunks,
    markers,
    insights,
    outputs,
    isActive: call?.status === 'active',

    // Actions
    startCall,
    endCall,
    addChunk,
    addMarker,
    removeMarker,
    addOutput,
    restoreFromStorage,
    setInsights,
  };
}
