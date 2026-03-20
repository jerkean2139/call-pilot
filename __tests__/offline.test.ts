import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import {
  getOfflineQueue,
  addToOfflineQueue,
  markSynced,
  clearSyncedFromQueue,
  getPendingCount,
  OFFLINE_STORE_KEY,
} from '@/lib/offline/types';

describe('Offline Queue', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('starts with empty queue', () => {
    expect(getOfflineQueue()).toEqual([]);
    expect(getPendingCount()).toBe(0);
  });

  it('adds entries to queue', () => {
    addToOfflineQueue({
      id: 'test-1',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: { logType: 'diaper', subType: 'wet' },
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    const queue = getOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('test-1');
    expect(queue[0].synced).toBe(false);
  });

  it('tracks pending count correctly', () => {
    addToOfflineQueue({
      id: 'test-1',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: {},
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    addToOfflineQueue({
      id: 'test-2',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: {},
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(getPendingCount()).toBe(2);
  });

  it('marks entries as synced', () => {
    addToOfflineQueue({
      id: 'test-1',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: {},
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    markSynced('test-1');
    expect(getPendingCount()).toBe(0);

    const queue = getOfflineQueue();
    expect(queue[0].synced).toBe(true);
  });

  it('clears synced entries from queue', () => {
    addToOfflineQueue({
      id: 'test-1',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: {},
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    addToOfflineQueue({
      id: 'test-2',
      type: 'LOG',
      babyId: 'baby-1',
      metadata: {},
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    markSynced('test-1');
    clearSyncedFromQueue();

    const queue = getOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('test-2');
  });
});
