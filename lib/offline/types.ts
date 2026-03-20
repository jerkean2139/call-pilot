export interface OfflineEntry {
  id: string;
  type: 'LOG';
  babyId: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
  synced: boolean;
}

export const OFFLINE_STORE_KEY = 'living-legacy-offline-queue';

export function getOfflineQueue(): OfflineEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(entry: Omit<OfflineEntry, 'synced'>): void {
  const queue = getOfflineQueue();
  queue.push({ ...entry, synced: false });
  localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(queue));
}

export function markSynced(id: string): void {
  const queue = getOfflineQueue();
  const updated = queue.map((e) => (e.id === id ? { ...e, synced: true } : e));
  localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(updated));
}

export function clearSyncedFromQueue(): void {
  const queue = getOfflineQueue();
  const unsent = queue.filter((e) => !e.synced);
  localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(unsent));
}

export function getPendingCount(): number {
  return getOfflineQueue().filter((e) => !e.synced).length;
}
