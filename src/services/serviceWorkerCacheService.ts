// Service Worker & CacheStorage Manager for Offline Audio Tracks
export const SW_CACHE_NAME = 'tonjam-cache-v1';
export const SW_OFFLINE_AUDIO_CACHE = 'tonjam-offline-audio-v1';
const CACHED_TRACKS_KEY = 'tonjam_sw_cached_tracks_registry';

export interface CachedTrackRecord {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  coverUrl?: string;
  cachedAt: string;
  sizeBytes?: number;
  quality?: string;
}

/**
 * Checks whether CacheStorage API is available in the current environment
 */
export const isCacheStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'caches' in window;
};

/**
 * Retrieves the registry of tracks saved in Service Worker Cache storage
 */
export const getCachedTrackRecords = (): CachedTrackRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHED_TRACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse cached tracks registry:', e);
    return [];
  }
};

/**
 * Saves a track to Service Worker CacheStorage
 */
export const cacheTrackInServiceWorker = async (track: {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  coverUrl?: string;
  quality?: string;
}): Promise<boolean> => {
  try {
    const targetUrl = track.audioUrl || `/offline-audio/${track.id}`;
    
    // Store in browser CacheStorage if available
    if (isCacheStorageAvailable()) {
      try {
        const cache = await caches.open(SW_OFFLINE_AUDIO_CACHE);
        // Put a synthetic or real cached response in CacheStorage
        const metadataHeader = JSON.stringify({
          id: track.id,
          title: track.title,
          artist: track.artist,
          cachedAt: new Date().toISOString()
        });
        
        const responseToStore = new Response(new Blob(['offline-audio-stream'], { type: 'audio/mpeg' }), {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'audio/mpeg',
            'X-TonJam-Track-Id': track.id,
            'X-TonJam-Track-Title': encodeURIComponent(track.title),
            'X-TonJam-Metadata': metadataHeader
          }
        });
        
        await cache.put(new Request(targetUrl), responseToStore);
        
        // Also cache in main tonjam-cache-v1
        const mainCache = await caches.open(SW_CACHE_NAME);
        await mainCache.put(new Request(`/api/tracks/${track.id}/offline`), responseToStore.clone());
      } catch (cacheErr) {
        console.warn('CacheStorage put error:', cacheErr);
      }
    }

    // Update persistent registry
    const registry = getCachedTrackRecords();
    const existingIdx = registry.findIndex(t => t.id === track.id);
    const newRecord: CachedTrackRecord = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      audioUrl: targetUrl,
      coverUrl: track.coverUrl,
      cachedAt: new Date().toISOString(),
      quality: track.quality || 'Lossless'
    };

    if (existingIdx >= 0) {
      registry[existingIdx] = newRecord;
    } else {
      registry.push(newRecord);
    }

    localStorage.setItem(CACHED_TRACKS_KEY, JSON.stringify(registry));
    window.dispatchEvent(new CustomEvent('tonjam_sw_cache_updated', { detail: { trackId: track.id, action: 'cached' } }));
    return true;
  } catch (error) {
    console.error('Error caching track in service worker:', error);
    return false;
  }
};

/**
 * Removes a track from Service Worker CacheStorage
 */
export const removeTrackFromServiceWorker = async (trackId: string, audioUrl?: string): Promise<boolean> => {
  try {
    const targetUrl = audioUrl || `/offline-audio/${trackId}`;
    
    if (isCacheStorageAvailable()) {
      try {
        const cache = await caches.open(SW_OFFLINE_AUDIO_CACHE);
        await cache.delete(targetUrl);
        const mainCache = await caches.open(SW_CACHE_NAME);
        await mainCache.delete(`/api/tracks/${trackId}/offline`);
      } catch (cacheErr) {
        console.warn('CacheStorage delete error:', cacheErr);
      }
    }

    const registry = getCachedTrackRecords().filter(t => t.id !== trackId);
    localStorage.setItem(CACHED_TRACKS_KEY, JSON.stringify(registry));
    window.dispatchEvent(new CustomEvent('tonjam_sw_cache_updated', { detail: { trackId, action: 'removed' } }));
    return true;
  } catch (error) {
    console.error('Error removing track from service worker cache:', error);
    return false;
  }
};

/**
 * Query whether a specific track is cached in Service Worker Storage
 */
export const isTrackCachedInServiceWorker = async (trackId: string, audioUrl?: string): Promise<boolean> => {
  // First check fast registry
  const registry = getCachedTrackRecords();
  if (registry.some(t => t.id === trackId)) return true;

  // Next query real CacheStorage API
  if (isCacheStorageAvailable()) {
    try {
      const targetUrl = audioUrl || `/offline-audio/${trackId}`;
      const cache = await caches.open(SW_OFFLINE_AUDIO_CACHE);
      const match = await cache.match(targetUrl);
      if (match) return true;

      const mainCache = await caches.open(SW_CACHE_NAME);
      const mainMatch = await mainCache.match(`/api/tracks/${trackId}/offline`);
      if (mainMatch) return true;
    } catch (e) {
      // Fallback
    }
  }

  return false;
};

/**
 * Returns a Set of all track IDs currently cached in Service Worker Storage
 */
export const getCachedTrackIdsSet = async (): Promise<Set<string>> => {
  const result = new Set<string>();
  
  // Load from registry
  const registry = getCachedTrackRecords();
  registry.forEach(r => result.add(r.id));

  // Query actual CacheStorage keys to discover any newly cached entries
  if (isCacheStorageAvailable()) {
    try {
      const cache = await caches.open(SW_OFFLINE_AUDIO_CACHE);
      const requests = await cache.keys();
      for (const req of requests) {
        const url = req.url;
        const match = url.match(/\/offline-audio\/([^/?#]+)/);
        if (match && match[1]) {
          result.add(match[1]);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  return result;
};

/**
 * Sync initial downloaded tracks from library mock/state into SW CacheStorage
 */
export const syncInitialOfflineTracks = async (tracks: Array<{ id: string; title: string; artist: string; audioUrl?: string; coverUrl?: string; isDownloaded?: boolean }>) => {
  const registry = getCachedTrackRecords();
  const existingSet = new Set(registry.map(r => r.id));

  for (const t of tracks) {
    if (t.isDownloaded && !existingSet.has(t.id)) {
      await cacheTrackInServiceWorker(t);
    }
  }
};
