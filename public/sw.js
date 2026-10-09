// TonJam Service Worker - Safe Retirement & Cache Purge
// Safely unregisters legacy service workers and purges stale HTTP caches
// Ensures the latest Vite JavaScript chunks and CSS bundles load cleanly without cache trapping

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Clear HTTP response caches; user data stored in IndexedDB is never touched
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Purging stale cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass all requests directly through to the network - do not intercept or cache
self.addEventListener('fetch', () => {
  return;
});
