import { Track } from '@/types';
import { indexedDbService } from './indexedDbService';

const AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', 
  '.opus', '.weba', '.wma', '.alac', '.aiff', '.aif',
  '.caf', '.m4b', '.webm', '.oga'
];

function isAudioFile(name: string, type?: string): boolean {
  if (type && type.toLowerCase().startsWith('audio/')) return true;
  const lower = name.toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function parseFilename(filename: string): { title: string; artist: string } {
  // Strip extension
  let baseName = filename.replace(/\.[^/.]+$/, '').trim();
  
  // Strip leading track numbers (e.g. "01 - ", "01. ", "01_")
  baseName = baseName.replace(/^(\d{1,3}[\.\-_\s]+)/, '').trim();

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
    title: baseName.replace(/_/g, ' ') || 'Untitled Track'
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAudioDuration(file: Blob, fileName = 'audio'): Promise<number> {
  return new Promise((resolve) => {
    let url: string | null = null;
    let timeout: any = null;

    try {
      url = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
        if (url) {
          try { URL.revokeObjectURL(url); } catch (e) {}
        }
        audio.onloadedmetadata = null;
        audio.onerror = null;
        audio.src = '';
      };

      timeout = setTimeout(() => {
        console.warn(`[LocalAudioService] Metadata probe timeout (3000ms) for "${fileName}". Defaulting to 180s.`);
        cleanup();
        resolve(180);
      }, 3000);

      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        const dur = audio.duration;
        cleanup();
        const finalDuration = dur && !isNaN(dur) && isFinite(dur) && dur > 0 ? Math.round(dur) : 180;
        console.log(`[LocalAudioService] Metadata parsed: "${fileName}", duration: ${finalDuration}s`);
        resolve(finalDuration);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        const errCode = audio.error?.code || 'unknown';
        console.warn(`[LocalAudioService] Audio metadata error for "${fileName}" (Code: ${errCode}): ${audio.error?.message || 'Unsupported format or decode error'}`);
        cleanup();
        resolve(180);
      };

      audio.src = url;
    } catch (err) {
      console.warn(`[LocalAudioService] Failed to create object URL for duration probe "${fileName}":`, err);
      if (url) {
        try { URL.revokeObjectURL(url); } catch (e) {}
      }
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
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    console.log('[LocalAudioService] scanDirectory initiated. Environment:', {
      isIframe,
      hasFileSystemAccess: this.isFileSystemAccessSupported()
    });

    if (!this.isFileSystemAccessSupported()) {
      console.warn('[LocalAudioService] showDirectoryPicker is not supported in this browser environment.');
      throw new Error('Directory picker is not supported in this browser. Please use the "Pick Audio Files" option.');
    }

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      const dirName = dirHandle.name || 'Local Folder';
      console.log(`[LocalAudioService] Directory handle acquired for: "${dirName}"`);

      // Permission check if available
      if (dirHandle.queryPermission) {
        try {
          const perm = await dirHandle.queryPermission({ mode: 'read' });
          console.log(`[LocalAudioService] Permission query status for "${dirName}": ${perm}`);
          if (perm !== 'granted' && dirHandle.requestPermission) {
            const reqPerm = await dirHandle.requestPermission({ mode: 'read' });
            console.log(`[LocalAudioService] Permission request status for "${dirName}": ${reqPerm}`);
          }
        } catch (permErr) {
          console.warn('[LocalAudioService] Permission check warning:', permErr);
        }
      }

      const fileList: File[] = [];

      async function scanEntries(handle: any, depth = 0) {
        if (depth > 6) return;
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            if (isAudioFile(entry.name)) {
              try {
                const file = await entry.getFile();
                fileList.push(file);
              } catch (e) {
                console.warn('[LocalAudioService] Could not read file handle:', entry.name, e);
              }
            }
          } else if (entry.kind === 'directory') {
            try {
              await scanEntries(entry, depth + 1);
            } catch (dirErr) {
              console.warn('[LocalAudioService] Subdirectory access restricted:', entry.name, dirErr);
            }
          }
        }
      }

      await scanEntries(dirHandle);
      console.log(`[LocalAudioService] Discovered ${fileList.length} audio files in "${dirName}".`);

      if (fileList.length === 0) {
        return { tracks: [], count: 0 };
      }

      const imported = await this.processFiles(fileList, dirName);
      return { tracks: imported, count: imported.length };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[LocalAudioService] User cancelled directory picker.');
        return { tracks: [], count: 0 };
      }
      if (err.name === 'SecurityError') {
        console.error('[LocalAudioService] SecurityError: Direct directory access is blocked in this iframe/sandbox.', err);
        throw new Error('Folder access is restricted inside iframe preview. Please use "Pick Audio Files" instead.');
      }
      if (err.name === 'NotAllowedError') {
        console.error('[LocalAudioService] NotAllowedError: Permission was denied by user or browser policy.', err);
        throw new Error('Permission to access directory was denied.');
      }
      console.error('[LocalAudioService] Scan directory error:', err);
      throw err;
    }
  },

  /**
   * Process a list of File objects (from directory picker or file inputs)
   */
  async processFiles(files: FileList | File[], albumName = 'Device Music'): Promise<Track[]> {
    const rawList = Array.from(files);
    const list = rawList.filter(f => isAudioFile(f.name, f.type));
    console.log(`[LocalAudioService] processFiles: Received ${rawList.length} files. Filtered ${list.length} audio candidates.`);
    const processedTracks: Track[] = [];

    for (const file of list) {
      try {
        const { title, artist } = parseFilename(file.name);
        const duration = await getAudioDuration(file, file.name);
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
