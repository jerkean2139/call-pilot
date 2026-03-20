// Custom service worker additions for Living Legacy
// This file augments the next-pwa generated service worker

const OFFLINE_QUEUE_CHANNEL = 'offline-queue-sync';

// Listen for sync events to process offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-entries') {
    event.waitUntil(syncOfflineEntries());
  }
});

async function syncOfflineEntries() {
  try {
    const cache = await caches.open('offline-entries');
    const keys = await cache.keys();

    for (const request of keys) {
      try {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          const data = await cachedResponse.json();
          const response = await fetch('/api/entries/quick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            await cache.delete(request);
          }
        }
      } catch (err) {
        // Will retry on next sync
        console.log('Failed to sync entry, will retry:', err);
      }
    }
  } catch (err) {
    console.log('Sync failed:', err);
  }
}

// Cache quick log requests when offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/entries/quick') && event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        const data = await event.request.json();
        const cache = await caches.open('offline-entries');
        const cacheKey = new Request(`/offline-entry/${Date.now()}`);
        await cache.put(cacheKey, new Response(JSON.stringify(data)));

        // Register for background sync
        if (self.registration.sync) {
          await self.registration.sync.register('sync-offline-entries');
        }

        return new Response(JSON.stringify({ queued: true, offline: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
  }
});
