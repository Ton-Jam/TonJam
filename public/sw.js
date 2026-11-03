// TonJam Service Worker - Offline Asset Precaching & Production Cache Management
// Consolidated caching strategy compatible with Vite's content-hashed asset management.

const CACHE_NAME = 'tonjam-cache-v5';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-tonjam.png',
  '/tonjam-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/default_tonjam_banner.jpg',
  '/tonjam-offline-audio.mp3'
];

function getAssetType(urlStr) {
  const lower = urlStr.toLowerCase();
  if (lower.endsWith('.css')) return 'CSS Stylesheet';
  if (lower.endsWith('.js')) return 'JavaScript Module';
  if (lower.includes('icon') || lower.includes('logo') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'Logo / Icon Asset';
  if (lower.endsWith('.mp3') || lower.endsWith('.wav')) return 'Audio Asset';
  if (lower.endsWith('/') || lower.endsWith('.html')) return 'Application Shell (HTML)';
  return 'Static Resource';
}

function notifyClients(payload) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage(payload));
  }).catch(() => {});
}

// Installation phase: Precache core shell assets gracefully
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          CORE_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activation phase: Purge obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[TonJam SW] Purging obsolete cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// PostMessage communication interface
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_CACHE_STRATEGY' && Array.isArray(event.data.assets)) {
    caches.open(CACHE_NAME).then((cache) => {
      Promise.allSettled(
        event.data.assets.map((assetUrl) => cache.add(new Request(assetUrl, { cache: 'reload' })))
      ).catch(() => {});
    });
  }
});

// Fetch phase: Strategic caching tailored for Vite hashed assets & HTML shell
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or non-http/https protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip cross-origin APIs, Firebase, TON RPC, or Vite dev server internals
  if (
    url.origin !== location.origin ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('firestore') ||
    url.pathname.includes('firebase') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('@vite') ||
    url.pathname.includes('@id') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.includes('.vite/deps')
  ) {
    return;
  }

  const assetType = getAssetType(request.url);

  // 1. Navigation / Application Shell Requests (HTML): Network-First
  // Ensures user always gets latest index.html referencing latest Vite asset hashes when online
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'miss', cacheName: CACHE_NAME, assetType });
          return networkResponse;
        })
        .catch(() => {
          console.warn('[TonJam SW] Network offline: serving cached application shell.');
          notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'hit', cacheName: CACHE_NAME, assetType });
          return caches.match(request).then((res) => res || caches.match('/index.html'));
        })
    );
    return;
  }

  // 2. Vite Production Hashed Assets (/assets/*.js, /assets/*.css): Cache-First
  // Since Vite asset filenames contain content hashes, they are immutable once built
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'hit', cacheName: CACHE_NAME, assetType });
          return cachedResponse;
        }
        notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'miss', cacheName: CACHE_NAME, assetType });
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. General Static Public Assets (icons, images, audio): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'hit', cacheName: CACHE_NAME, assetType });
        return cachedResponse;
      }

      notifyClients({ type: 'CACHE_STATUS_LOG', url: request.url, status: 'miss', cacheName: CACHE_NAME, assetType });
      return fetchPromise.then((netRes) => netRes || caches.match('/index.html'));
    })
  );
});

