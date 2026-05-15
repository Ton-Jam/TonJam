const CACHE_NAME = 'tonjam-audio-cache-v1';

export const audioCacheService = {
  async cacheTrack(trackId: string, url: string): Promise<string> {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch audio');
    
    await cache.put(trackId, response);
    return trackId;
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
