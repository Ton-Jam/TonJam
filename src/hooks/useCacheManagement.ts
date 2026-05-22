import { useState, useEffect, useCallback } from 'react';
import { indexedDbService } from '@/services/indexedDbService';
import { audioCacheService } from '@/services/audioCacheService';

const CACHE_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB
const TARGET_CLEANUP_BYTES = 450 * 1024 * 1024; // Purge down to 450 MB for safety headroom

export const useCacheManagement = () => {
  const [totalSize, setTotalSize] = useState<number>(0);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  const checkAndPurgeCache = useCallback(async () => {
    if (isPurging) return { totalSize, cachedCount };

    try {
      // 1. Fetch metadata list of all cached audio
      const audioList = await indexedDbService.getAudioMetadataList();
      let currentTotal = audioList.reduce((sum, item) => sum + (item.size || 0), 0);
      
      setCachedCount(audioList.length);
      setTotalSize(currentTotal);

      // 2. Read limit and check if we are exceeding 500MB
      if (currentTotal > CACHE_LIMIT_BYTES) {
        setIsPurging(true);
        console.info(`Cache limit exceeded. Size: ${(currentTotal / (1024 * 1024)).toFixed(2)}MB / 500MB. Purging oldest tracks...`);

        // Sort items by cachedAt ASC (oldest first)
        const sortedOldestFirst = [...audioList].sort((a, b) => a.cachedAt - b.cachedAt);
        
        const purgedIds: string[] = [];
        
        for (const item of sortedOldestFirst) {
          if (currentTotal <= TARGET_CLEANUP_BYTES) {
            break;
          }

          console.info(`Purging track ${item.id} (Size: ${(item.size / (1024 * 1024)).toFixed(2)}MB, cached at ${new Date(item.cachedAt).toLocaleTimeString()})`);
          await audioCacheService.removeCachedTrack(item.id);
          currentTotal -= item.size;
          purgedIds.push(item.id);
        }

        // Refresh stats
        const updatedList = await indexedDbService.getAudioMetadataList();
        const updatedTotal = updatedList.reduce((sum, item) => sum + (item.size || 0), 0);
        
        setCachedCount(updatedList.length);
        setTotalSize(updatedTotal);
        setIsPurging(false);

        console.info(`Purge complete. New Size: ${(updatedTotal / (1024 * 1024)).toFixed(2)}MB. Purged ${purgedIds.length} tracks.`);
        return { totalSize: updatedTotal, cachedCount: updatedList.length };
      }

      return { totalSize: currentTotal, cachedCount: audioList.length };
    } catch (err) {
      console.error('Error during cache cleanup execution:', err);
      setIsPurging(false);
      return { totalSize, cachedCount };
    }
  }, [isPurging, totalSize, cachedCount]);

  const clearAllCache = useCallback(async () => {
    setIsPurging(true);
    try {
      const audioList = await indexedDbService.getAudioMetadataList();
      for (const item of audioList) {
        await audioCacheService.removeCachedTrack(item.id);
      }
      setTotalSize(0);
      setCachedCount(0);
      console.info('Full offline cache successfully cleared.');
    } catch (err) {
      console.error('Error clearing cache:', err);
    } finally {
      setIsPurging(false);
    }
  }, []);

  // Run validation checks on mount, and set up a periodic check every 30 seconds
  useEffect(() => {
    checkAndPurgeCache();

    const intervalId = setInterval(() => {
      checkAndPurgeCache();
    }, 30000); // 30 seconds interval

    return () => clearInterval(intervalId);
  }, [checkAndPurgeCache]);

  return {
    totalSize,
    cachedCount,
    isPurging,
    checkAndPurgeCache,
    clearAllCache,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
  };
};
