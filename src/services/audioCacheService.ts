import { indexedDbService } from './indexedDbService';

const CACHE_NAME = 'tonjam-audio-cache-v1';
const OFFLINE_AUDIO_CACHE = 'tonjam-offline-audio-v1';

export const audioCacheService = {
  async cacheTrack(trackId: string, url?: string): Promise<string | null> {
    try {
      let targetUrl = url || `/tonjam-offline-audio.mp3`;
      let blob: Blob | null = null;

      try {
        const response = await fetch(targetUrl);
        if (response.ok) {
          blob = await response.blob();
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(trackId, new Response(blob.slice(), {
              headers: { 'Content-Type': blob.type || 'audio/mpeg' }
            }));
          } catch (cacheErr) {
            console.warn('Cache API storage failed, continuing to IndexedDB...', cacheErr);
          }
        }
      } catch (fetchErr) {
        console.warn(`Direct fetch failed for ${targetUrl}, trying local fallback asset:`, fetchErr);
      }

      // If initial fetch failed, fallback to local offline asset
      if (!blob) {
        try {
          const fallbackRes = await fetch('/tonjam-offline-audio.mp3');
          if (fallbackRes.ok) {
            blob = await fallbackRes.blob();
          }
        } catch (fbErr) {
          console.warn('Fallback offline audio fetch error:', fbErr);
        }
      }

      if (blob) {
        await indexedDbService.saveAudioBlob(trackId, blob);
        return trackId;
      }

      return null;
    } catch (err) {
      console.warn(`Failed to cache track audio for: ${trackId}`, err);
      return null;
    }
  },

  async getCachedTrack(trackId: string): Promise<string | null> {
    try {
      // 1. Check downloaded track audio in IndexedDB
      const dbBlob = await indexedDbService.getAudioBlob(trackId);
      if (dbBlob && dbBlob.size > 0) {
        return URL.createObjectURL(dbBlob);
      }
    } catch (idbErr) {
      console.warn('Failed to retrieve audio from IndexedDB:', idbErr);
    }

    try {
      // 2. Check local device imported audio in IndexedDB
      const localBlob = await indexedDbService.getLocalAudioBlob(trackId);
      if (localBlob && localBlob.size > 0) {
        return URL.createObjectURL(localBlob);
      }
    } catch (localErr) {
      console.warn('Failed to retrieve local audio from IndexedDB:', localErr);
    }

    try {
      // 3. Check Cache API
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(trackId);
        if (response) {
          const blob = await response.blob();
          if (blob && blob.size > 0) {
            return URL.createObjectURL(blob);
          }
        }

        const offlineCache = await caches.open(OFFLINE_AUDIO_CACHE);
        const offlineMatch = await offlineCache.match(`/offline-audio/${trackId}`);
        if (offlineMatch) {
          const blob = await offlineMatch.blob();
          if (blob && blob.size > 0) {
            return URL.createObjectURL(blob);
          }
        }
      }
    } catch (cacheErr) {
      console.warn('Failed to retrieve audio from Cache API:', cacheErr);
    }

    return null;
  },

  async isTrackCached(trackId: string): Promise<boolean> {
    try {
      const inIdb = await indexedDbService.hasAudioBlob(trackId);
      if (inIdb) return true;
      const inLocal = await indexedDbService.hasLocalAudioBlob(trackId);
      if (inLocal) return true;
    } catch (err) {
      console.warn('Error checking IndexedDB status:', err);
    }

    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(trackId);
        if (response) return true;

        const offlineCache = await caches.open(OFFLINE_AUDIO_CACHE);
        const offlineMatch = await offlineCache.match(`/offline-audio/${trackId}`);
        if (offlineMatch) return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  async removeCachedTrack(trackId: string): Promise<void> {
    try {
      await indexedDbService.deleteAudioBlob(trackId);
    } catch (err) {
      console.warn('Failed to remove track from IndexedDB:', err);
    }

    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(trackId);
        const offlineCache = await caches.open(OFFLINE_AUDIO_CACHE);
        await offlineCache.delete(`/offline-audio/${trackId}`);
      }
    } catch (err) {
      console.warn('Failed to remove track from Cache Storage:', err);
    }
  }
};

