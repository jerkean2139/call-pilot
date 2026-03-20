import type { Baby, JournalEntry, Milestone, GrowthRecord } from '../types';

const DB_NAME = 'living-legacy';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('babies')) {
        db.createObjectStore('babies', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('journal')) {
        const journalStore = db.createObjectStore('journal', { keyPath: 'id' });
        journalStore.createIndex('babyId', 'babyId', { unique: false });
        journalStore.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('milestones')) {
        const msStore = db.createObjectStore('milestones', { keyPath: 'id' });
        msStore.createIndex('babyId', 'babyId', { unique: false });
      }
      if (!db.objectStoreNames.contains('growth')) {
        const growthStore = db.createObjectStore('growth', { keyPath: 'id' });
        growthStore.createIndex('babyId', 'babyId', { unique: false });
        growthStore.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Baby operations
export const babyDB = {
  getAll: () => getAll<Baby>('babies'),
  getById: (id: string) => getById<Baby>('babies', id),
  save: (baby: Baby) => put('babies', baby),
  delete: (id: string) => remove('babies', id),
};

// Journal operations
export const journalDB = {
  getAll: () => getAll<JournalEntry>('journal'),
  getById: (id: string) => getById<JournalEntry>('journal', id),
  getByBaby: (babyId: string) => getAllByIndex<JournalEntry>('journal', 'babyId', babyId),
  save: (entry: JournalEntry) => put('journal', entry),
  delete: (id: string) => remove('journal', id),
};

// Milestone operations
export const milestoneDB = {
  getAll: () => getAll<Milestone>('milestones'),
  getById: (id: string) => getById<Milestone>('milestones', id),
  getByBaby: (babyId: string) => getAllByIndex<Milestone>('milestones', 'babyId', babyId),
  save: (milestone: Milestone) => put('milestones', milestone),
  delete: (id: string) => remove('milestones', id),
};

// Growth operations
export const growthDB = {
  getAll: () => getAll<GrowthRecord>('growth'),
  getById: (id: string) => getById<GrowthRecord>('growth', id),
  getByBaby: (babyId: string) => getAllByIndex<GrowthRecord>('growth', 'babyId', babyId),
  save: (record: GrowthRecord) => put('growth', record),
  delete: (id: string) => remove('growth', id),
};
