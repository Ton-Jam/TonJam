const CACHE_NAME = 'tonjam-audio-cache-v1';

export const audioCacheService = {
  async cacheTrack(trackId: string, url: string): Promise<string | null> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to cache track ${trackId}: HTTP ${response.status}`);
        return null;
      }
      
      await cache.put(trackId, response.clone());
      return trackId;
    } catch (err) {
      console.warn(`Failed to fetch audio for caching: ${url}`, err);
      return null;
    }
  },

  async getCachedTrack(trackId: string): Promise<string | null> {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(trackId);
    if (!response) return null;
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  async isTrackCached(trackId: string): Promise<boolean> {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(trackId);
    return !!response;
  }
};
