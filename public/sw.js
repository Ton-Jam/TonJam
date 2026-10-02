// TonJam Service Worker - Cache Purge & Self-Destruct
// Ensures clients unregister stale service workers and completely clear cached JavaScript chunks
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass all requests directly through to the network
self.addEventListener('fetch', (event) => {
  return;
});
