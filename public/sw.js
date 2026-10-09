// TonJam Progressive Web App (PWA) Service Worker
// Enables offline application shell, audio caching, and seamless offline navigation

const CACHE_VERSION = 'tonjam-v2';
const STATIC_CACHE = `tonjam-static-${CACHE_VERSION}`;
const AUDIO_CACHE = `tonjam-audio-${CACHE_VERSION}`;
const DATA_CACHE = `tonjam-data-${CACHE_VERSION}`;

// Core assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/tonjam-icon.png',
  '/tonconnect-manifest.json',
  '/tonjam-offline-audio.mp3',
  '/tonjam-offline-audio.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Some precache assets could not be cached immediately:', err);
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, AUDIO_CACHE, DATA_CACHE].includes(key)) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Handle API & Firestore requests gracefully
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ offline: true, error: 'Offline mode active' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Audio stream or offline audio endpoints
  if (
    url.pathname.includes('/offline-audio/') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.endsWith('.flac') ||
    request.headers.get('accept')?.includes('audio')
  ) {
    event.respondWith(
      (async () => {
        // Try audio cache first
        const audioCache = await caches.open(AUDIO_CACHE);
        const cachedAudio = await audioCache.match(request);
        if (cachedAudio) {
          return cachedAudio;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            audioCache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Fallback to offline audio sound asset if available
          const fallback = await caches.match('/tonjam-offline-audio.mp3') || await caches.match('/tonjam-offline-audio.wav');
          if (fallback) return fallback;
          return new Response(new Blob(['offline-audio'], { type: 'audio/mpeg' }), { status: 200 });
        }
      })()
    );
    return;
  }

  // Navigation requests (HTML pages) -> Network-first with cache fallback to /index.html (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(request);
          if (cachedNavigate) return cachedNavigate;
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          return new Response('<h1>TonJam Offline</h1><p>Offline mode is ready.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
