// TonJam Service Worker - Offline Caching & Metadata Storage
const CACHE_NAME = 'tonjam-cache-v1';
const AUDIO_CACHE_NAME = 'tonjam-offline-audio-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/tonjam-icon.png',
  '/manifest.json',
  '/default_tonjam_banner.jpg',
  '/tonconnect-manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Non-fatal SW cache prefetch warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== AUDIO_CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass non-GET and internal or dev websocket/HMR requests
  if (request.method !== 'GET' || url.protocol === 'ws:' || url.protocol === 'wss:' || url.pathname.startsWith('/@') || url.pathname.includes('__aistudio')) {
    return;
  }

  // Handle static assets & navigation requests with Stale-While-Revalidate / Cache-First
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      // Check offline audio cache
      try {
        const audioCache = await caches.open(AUDIO_CACHE_NAME);
        const audioMatch = await audioCache.match(request);
        if (audioMatch) return audioMatch;
      } catch (e) {}

      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached version or offline fallback if network fails
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
