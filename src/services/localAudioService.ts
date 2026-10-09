import { Track } from '@/types';
import { indexedDbService } from './indexedDbService';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus', '.weba'];

function isAudioFile(name: string, type?: string): boolean {
  if (type && type.startsWith('audio/')) return true;
  const lower = name.toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function parseFilename(filename: string): { title: string; artist: string } {
  // Strip extension
  const baseName = filename.replace(/\.[^/.]+$/, '');
  
  // Check if filename is "Artist - Title" or "Artist - Track - Title"
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        artist: parts[0] || 'Local Artist',
        title: parts.slice(1).join(' - ') || baseName
      };
    }
  }

  // Check if filename is "Artist_-_Title"
  if (baseName.includes('_-_')) {
    const parts = baseName.split('_-_').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        artist: parts[0].replace(/_/g, ' ') || 'Local Artist',
        title: parts.slice(1).join(' - ').replace(/_/g, ' ') || baseName
      };
    }
  }

  return {
    artist: 'Device Audio',
    title: baseName.replace(/_/g, ' ')
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const cleanup = () => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(180);
      }, 3000);

      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        cleanup();
        const dur = audio.duration;
        resolve(dur && !isNaN(dur) && isFinite(dur) ? Math.round(dur) : 180);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        resolve(180);
      };

      audio.src = url;
    } catch (err) {
      resolve(180);
    }
  });
}

export const localAudioService = {
  isFileSystemAccessSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  },

  /**
   * Access local directory via the File System Access API
   */
  async scanDirectory(): Promise<{ tracks: Track[]; count: number }> {
    if (!this.isFileSystemAccessSupported()) {
      throw new Error('Directory picker is not supported in this browser. Please use the File Import option.');
    }

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      const dirName = dirHandle.name || 'Local Folder';
      const fileList: File[] = [];

      async function scanEntries(handle: any) {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            if (isAudioFile(entry.name)) {
              try {
                const file = await entry.getFile();
                fileList.push(file);
              } catch (e) {
                console.warn('Could not read file:', entry.name, e);
              }
            }
          } else if (entry.kind === 'directory') {
            try {
              await scanEntries(entry);
            } catch (dirErr) {
              // Ignore protected subfolders
            }
          }
        }
      }

      await scanEntries(dirHandle);

      if (fileList.length === 0) {
        return { tracks: [], count: 0 };
      }

      const imported = await this.processFiles(fileList, dirName);
      return { tracks: imported, count: imported.length };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { tracks: [], count: 0 };
      }
      throw err;
    }
  },

  /**
   * Process a list of File objects (from directory picker or file inputs)
   */
  async processFiles(files: FileList | File[], albumName = 'Device Music'): Promise<Track[]> {
    const list = Array.from(files).filter(f => isAudioFile(f.name, f.type));
    const processedTracks: Track[] = [];

    for (const file of list) {
      try {
        const { title, artist } = parseFilename(file.name);
        const duration = await getAudioDuration(file);
        const trackId = `local-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}-${file.size}-${file.lastModified}`;
        const objectUrl = URL.createObjectURL(file);

        const newTrack: Track = {
          id: trackId,
          songId: trackId,
          title,
          artist,
          artistId: 'local-device',
          album: albumName,
          duration,
          streams: 0,
          playCount: 0,
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
          audioUrl: objectUrl,
          genre: 'Local Audio',
          isNFT: false,
          isLocal: true,
          isDownloaded: true,
          fileSize: formatBytes(file.size),
          createdAt: new Date(file.lastModified).toISOString()
        } as Track;

        // Persist to IndexedDB
        await indexedDbService.saveLocalTrack(newTrack, file);
        processedTracks.push(newTrack);
      } catch (fileErr) {
        console.warn(`Failed to process audio file: ${file.name}`, fileErr);
      }
    }

    return processedTracks;
  },

  /**
   * Retrieve all saved local tracks from IndexedDB and attach live object URLs
   */
  async getSavedLocalTracks(): Promise<Track[]> {
    try {
      const records = await indexedDbService.getLocalTracks();
      const hydrated: Track[] = [];

      for (const track of records) {
        const blob = await indexedDbService.getLocalAudioBlob(track.id);
        if (blob) {
          const liveUrl = URL.createObjectURL(blob);
          hydrated.push({
            ...track,
            audioUrl: liveUrl,
            isLocal: true,
            isDownloaded: true
          });
        } else {
          hydrated.push({
            ...track,
            isLocal: true,
            isDownloaded: true
          });
        }
      }

      return hydrated;
    } catch (err) {
      console.warn('Error loading saved local tracks:', err);
      return [];
    }
  },

  /**
   * Delete a single local track from IndexedDB
   */
  async removeLocalTrack(trackId: string): Promise<void> {
    await indexedDbService.deleteLocalTrack(trackId);
  },

  /**
   * Clear all local tracks from IndexedDB
   */
  async clearAllLocalTracks(): Promise<void> {
    await indexedDbService.clearLocalTracks();
  }
};
