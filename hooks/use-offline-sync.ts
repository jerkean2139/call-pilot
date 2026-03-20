'use client';
import { useState, useEffect, useCallback } from 'react';
import { getOfflineQueue, addToOfflineQueue, markSynced, clearSyncedFromQueue, getPendingCount, type OfflineEntry } from '@/lib/offline/types';
import { generateId } from '@/lib/utils';

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setPendingCount(getPendingCount());

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addQuickLog = useCallback((babyId: string, metadata: Record<string, unknown>) => {
    const entry: Omit<OfflineEntry, 'synced'> = {
      id: generateId(),
      type: 'LOG',
      babyId,
      metadata,
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    addToOfflineQueue(entry);
    setPendingCount(getPendingCount());

    if (navigator.onLine) {
      syncQueue();
    }
    return entry;
  }, []);

  const syncQueue = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const queue = getOfflineQueue().filter((e) => !e.synced);
    for (const entry of queue) {
      try {
        const res = await fetch('/api/entries/quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (res.ok) {
          markSynced(entry.id);
        }
      } catch {
        // Will retry next time
      }
    }

    clearSyncedFromQueue();
    setPendingCount(getPendingCount());
    setIsSyncing(false);
  }, [isSyncing]);

  return { pendingCount, isOnline, isSyncing, addQuickLog, syncQueue };
}
