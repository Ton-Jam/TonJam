import { indexedDbService } from './indexedDbService';

const CACHE_NAME = 'tonjam-audio-cache-v1';

export const audioCacheService = {
  async cacheTrack(trackId: string, url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to cache track ${trackId}: HTTP ${response.status}`);
        return null;
      }
      
      const cachedResponse = response.clone();
      const blobResponse = response.clone();

      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(trackId, cachedResponse);
      } catch (cacheErr) {
        console.warn('Cache API storage failed, continuing to IndexedDB...', cacheErr);
      }

      try {
        const blob = await blobResponse.blob();
        await indexedDbService.saveAudioBlob(trackId, blob);
      } catch (idbErr) {
        console.warn('IndexedDB audio storage failed:', idbErr);
      }

      return trackId;
    } catch (err) {
      console.warn(`Failed to fetch audio for caching: ${url}`, err);
      return null;
    }
  },

  async getCachedTrack(trackId: string): Promise<string | null> {
    try {
      const dbBlob = await indexedDbService.getAudioBlob(trackId);
      if (dbBlob) {
        return URL.createObjectURL(dbBlob);
      }
    } catch (idbErr) {
      console.warn('Failed to retrieve audio from IndexedDB:', idbErr);
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(trackId);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
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
    } catch (err) {
      console.warn('Error checking IndexedDB status:', err);
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(trackId);
      return !!response;
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
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(trackId);
    } catch (err) {
      console.warn('Failed to remove track from Cache Storage:', err);
    }
  }
};

