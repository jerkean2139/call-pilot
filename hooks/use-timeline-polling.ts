'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { EntryWithRelations } from '@/types';

export function useTimelinePolling(babyId: string | null, intervalMs = 10000) {
  const [entries, setEntries] = useState<EntryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchRef = useRef<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!babyId) return;
    try {
      const res = await fetch(`/api/entries?babyId=${babyId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
        setIsLoading(false);
      }
    } catch {
      // Silently fail on network error
    }
  }, [babyId]);

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, intervalMs);
    return () => clearInterval(interval);
  }, [fetchEntries, intervalMs]);

  const addOptimistic = useCallback((entry: EntryWithRelations) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  return { entries, isLoading, refetch: fetchEntries, addOptimistic };
}
