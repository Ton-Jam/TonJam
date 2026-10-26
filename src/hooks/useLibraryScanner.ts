import { useState, useCallback, useEffect, useRef } from 'react';
import { Track } from '@/types';
import { indexedDbService } from '@/services/indexedDbService';
import { localAudioService } from '@/services/localAudioService';

/**
 * Recognized audio extensions and MIME types
 */
const AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', 
  '.opus', '.weba', '.wma', '.alac', '.aiff', '.aif',
  '.caf', '.m4b', '.webm', '.oga'
];

const MEDIA_ERROR_MAP: Record<number, string> = {
  1: 'MEDIA_ERR_ABORTED - Audio loading was aborted by user or agent',
  2: 'MEDIA_ERR_NETWORK - Network or I/O error occurred during audio fetch',
  3: 'MEDIA_ERR_DECODE - Audio decoding failed (corrupted file or invalid format stream)',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Audio codec / container format not supported by this browser engine'
};

export interface ScannerDiagnostics {
  isIframe: boolean;
  hasFileSystemAccess: boolean;
  hasIndexedDB: boolean;
  hasStorageEstimate: boolean;
  storageEstimate?: { usage: number; quota: number; formattedUsage: string; formattedQuota: string };
  permissionStatus: 'unknown' | 'granted' | 'prompt' | 'denied' | 'restricted-iframe';
  lastScanTimestamp?: string;
  totalFilesEncountered: number;
  audioFilesFound: number;
  parsedSuccessfully: number;
  parsingErrors: number;
  errorDetails: Array<{ filename: string; reason: string; timestamp: string }>;
}

export interface ScanProgress {
  current: number;
  total: number;
  percent: number;
  currentFileName: string;
  status: 'idle' | 'checking-environment' | 'requesting-permission' | 'reading-directory' | 'parsing-metadata' | 'storing' | 'completed' | 'error';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function cleanFilenameMetadata(filename: string): { title: string; artist: string } {
  // Strip extension
  let baseName = filename.replace(/\.[^/.]+$/, '').trim();
  
  // Remove leading track numbers (e.g., "01 - ", "01. ", "01_")
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

  // Check if filename is "Artist - Title" separated by underscore
  return {
    artist: 'Device Audio',
    title: baseName.replace(/_/g, ' ') || 'Untitled Track'
  };
}

function isAudioCandidate(filename: string, mimeType?: string): boolean {
  if (mimeType && mimeType.toLowerCase().startsWith('audio/')) {
    return true;
  }
  const lower = filename.toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Diagnostic logger utility
 */
function logScanner(level: 'info' | 'warn' | 'error' | 'success', message: string, data?: any) {
  const time = new Date().toLocaleTimeString();
  const prefix = `[LibraryScanner ${time}]`;
  
  switch (level) {
    case 'info':
      console.log(`%c${prefix} ℹ️ ${message}`, 'color: #00B4D8; font-weight: bold;', data !== undefined ? data : '');
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`, data !== undefined ? data : '');
      break;
    case 'error':
      console.error(`${prefix} ❌ ${message}`, data !== undefined ? data : '');
      break;
    case 'success':
      console.log(`%c${prefix} ✅ ${message}`, 'color: #10B981; font-weight: bold;', data !== undefined ? data : '');
      break;
  }
}

/**
 * Probes audio metadata with HTML5 Audio element and detailed diagnostic logging
 */
function probeAudioFileMetadata(file: File): Promise<{ duration: number; error?: string }> {
  return new Promise((resolve) => {
    let objectUrl: string | null = null;
    let timeoutId: any = null;

    try {
      objectUrl = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // Safe ignore
          }
          objectUrl = null;
        }
        audio.onloadedmetadata = null;
        audio.onerror = null;
        audio.onabort = null;
        audio.src = '';
      };

      // Set a resilient 3.5s timeout to prevent freezing the UI on obscure codecs
      timeoutId = setTimeout(() => {
        logScanner('warn', `Metadata probe timed out after 3500ms for file: "${file.name}" (${formatBytes(file.size)}). Falling back to default duration.`);
        cleanup();
        resolve({ duration: 180, error: 'Metadata extraction timed out (browser audio decoder did not respond in 3500ms)' });
      }, 3500);

      audio.onloadedmetadata = () => {
        const rawDur = audio.duration;
        const validDuration = (rawDur && !isNaN(rawDur) && isFinite(rawDur) && rawDur > 0)
          ? Math.round(rawDur)
          : 180;
        
        logScanner('success', `Audio metadata loaded for "${file.name}": duration=${validDuration}s, channels=${(audio as any).channelCount || 'unknown'}`);
        cleanup();
        resolve({ duration: validDuration });
      };

      audio.onerror = (e) => {
        const mediaErr = audio.error;
        const code = mediaErr ? mediaErr.code : 0;
        const reason = MEDIA_ERROR_MAP[code] || mediaErr?.message || 'Unknown media element error';
        
        logScanner('warn', `Audio element encountered error for "${file.name}" [code ${code}]: ${reason}`);
        cleanup();
        resolve({ duration: 180, error: `Media error [code ${code}]: ${reason}` });
      };

      audio.onabort = () => {
        logScanner('warn', `Audio metadata load aborted for "${file.name}"`);
        cleanup();
        resolve({ duration: 180, error: 'Metadata load aborted' });
      };

      audio.src = objectUrl;
    } catch (err: any) {
      logScanner('error', `Exception creating ObjectURL or probing "${file.name}":`, err);
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch {}
      }
      resolve({ duration: 180, error: err?.message || 'Object URL creation error' });
    }
  });
}

/**
 * Custom React Hook: useLibraryScanner
 * 
 * Manages scanning, permissions verification, audio metadata extraction,
 * and IndexedDB synchronization for local device music.
 */
export function useLibraryScanner() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<ScanProgress>({
    current: 0,
    total: 0,
    percent: 0,
    currentFileName: '',
    status: 'idle'
  });

  const [diagnostics, setDiagnostics] = useState<ScannerDiagnostics>(() => {
    const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
    const hasFSA = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    const hasIDB = typeof window !== 'undefined' && 'indexedDB' in window;
    const hasStorage = typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage;

    return {
      isIframe,
      hasFileSystemAccess: hasFSA,
      hasIndexedDB: hasIDB,
      hasStorageEstimate: hasStorage,
      permissionStatus: isIframe ? 'restricted-iframe' : 'unknown',
      totalFilesEncountered: 0,
      audioFilesFound: 0,
      parsedSuccessfully: 0,
      parsingErrors: 0,
      errorDetails: []
    };
  });

  const appendLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  /**
   * Diagnostic environment verification
   */
  const checkEnvironment = useCallback(async (): Promise<ScannerDiagnostics> => {
    const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
    const hasFSA = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    const hasIDB = typeof window !== 'undefined' && 'indexedDB' in window;
    const hasStorage = typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage;

    let storageEstimateData: any = undefined;
    if (hasStorage) {
      try {
        const est = await navigator.storage.estimate();
        storageEstimateData = {
          usage: est.usage || 0,
          quota: est.quota || 0,
          formattedUsage: formatBytes(est.usage || 0),
          formattedQuota: formatBytes(est.quota || 0)
        };
      } catch (e) {
        logScanner('warn', 'Failed to read storage estimate:', e);
      }
    }

    logScanner('info', '--- Checking Browser Environment Diagnostics ---');
    logScanner('info', `Running in Iframe / Sandbox: ${isIframe}`);
    logScanner('info', `File System Access API supported: ${hasFSA}`);
    logScanner('info', `IndexedDB supported: ${hasIDB}`);
    if (storageEstimateData) {
      logScanner('info', `Browser Storage Quota: ${storageEstimateData.formattedUsage} used of ${storageEstimateData.formattedQuota}`);
    }

    if (isIframe) {
      logScanner('warn', 'Sandbox Note: Window is running inside an iframe. Chrome/Edge may block window.showDirectoryPicker() with SecurityError ("Cross-origin subframe is not allowed to call showDirectoryPicker"). HTML5 Folder/File input fallback is recommended.');
    }

    const updated: ScannerDiagnostics = {
      isIframe,
      hasFileSystemAccess: hasFSA,
      hasIndexedDB: hasIDB,
      hasStorageEstimate: hasStorage,
      storageEstimate: storageEstimateData,
      permissionStatus: isIframe ? 'restricted-iframe' : 'unknown',
      totalFilesEncountered: 0,
      audioFilesFound: 0,
      parsedSuccessfully: 0,
      parsingErrors: 0,
      errorDetails: []
    };

    setDiagnostics(prev => ({ ...prev, ...updated }));
    return updated;
  }, []);

  /**
   * Hydrate tracks from IndexedDB with live Object URLs
   */
  const loadSavedTracks = useCallback(async (): Promise<Track[]> => {
    try {
      logScanner('info', 'Hydrating saved tracks from IndexedDB local storage...');
      const savedTracks = await localAudioService.getSavedLocalTracks();
      logScanner('success', `Hydrated ${savedTracks.length} local tracks from IndexedDB.`);
      setTracks(savedTracks);
      return savedTracks;
    } catch (err: any) {
      logScanner('error', 'Error reading saved tracks from IndexedDB:', err);
      appendLog(`Error reading IndexedDB: ${err?.message || 'Storage error'}`);
      return [];
    }
  }, [appendLog]);

  useEffect(() => {
    checkEnvironment();
    loadSavedTracks();
  }, [checkEnvironment, loadSavedTracks]);

  /**
   * Process a list of File objects with diagnostic logging and metadata extraction
   */
  const scanFiles = useCallback(async (
    files: FileList | File[],
    folderLabel = 'Device Audio'
  ): Promise<Track[]> => {
    setIsScanning(true);
    setScanError(null);
    const env = await checkEnvironment();

    const rawList = Array.from(files);
    logScanner('info', `Received ${rawList.length} files from folder / file picker.`);
    appendLog(`Scanning ${rawList.length} raw files from "${folderLabel}"...`);

    setProgress({
      current: 0,
      total: rawList.length,
      percent: 0,
      currentFileName: 'Filtering audio files...',
      status: 'reading-directory'
    });

    // Filter audio candidates with logging
    const audioFiles: File[] = [];
    const skippedFiles: Array<{ name: string; type: string }> = [];

    for (const f of rawList) {
      if (isAudioCandidate(f.name, f.type)) {
        audioFiles.push(f);
      } else {
        skippedFiles.push({ name: f.name, type: f.type || 'unknown' });
      }
    }

    if (skippedFiles.length > 0) {
      logScanner('info', `Filtered out ${skippedFiles.length} non-audio files (e.g., .DS_Store, artwork, text files). First few skipped:`, skippedFiles.slice(0, 5));
    }

    logScanner('info', `Detected ${audioFiles.length} valid audio file candidates to process.`);

    if (audioFiles.length === 0) {
      logScanner('warn', 'No compatible audio files found in selection.');
      appendLog('No compatible audio files found.');
      setProgress({
        current: 0,
        total: 0,
        percent: 100,
        currentFileName: '',
        status: 'completed'
      });
      setIsScanning(false);
      return [];
    }

    const processedTracks: Track[] = [];
    const errorDetails: Array<{ filename: string; reason: string; timestamp: string }> = [];
    let processedCount = 0;

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      processedCount++;

      setProgress({
        current: processedCount,
        total: audioFiles.length,
        percent: Math.round((processedCount / audioFiles.length) * 100),
        currentFileName: file.name,
        status: 'parsing-metadata'
      });

      logScanner('info', `[${processedCount}/${audioFiles.length}] Processing "${file.name}" (${formatBytes(file.size)}, type: "${file.type || 'empty'}")`);

      try {
        // Clean and parse filename metadata
        const { title, artist } = cleanFilenameMetadata(file.name);
        
        // Probe duration and media decoding
        const { duration, error: probeError } = await probeAudioFileMetadata(file);

        if (probeError) {
          errorDetails.push({
            filename: file.name,
            reason: probeError,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        const trackId = `local-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}-${file.size}-${file.lastModified}`;
        const objectUrl = URL.createObjectURL(file);

        const newTrack: Track = {
          id: trackId,
          songId: trackId,
          title,
          artist,
          artistId: 'local-device',
          album: folderLabel,
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
        try {
          await indexedDbService.saveLocalTrack(newTrack, file);
          logScanner('success', `Saved track "${newTrack.title}" (${newTrack.id}) to IndexedDB.`);
        } catch (storageErr: any) {
          logScanner('error', `Failed to persist track "${file.name}" to IndexedDB:`, storageErr);
          errorDetails.push({
            filename: file.name,
            reason: `IndexedDB Save Failed: ${storageErr?.message || 'Storage error'}`,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        processedTracks.push(newTrack);
      } catch (err: any) {
        logScanner('error', `Failed to parse audio file "${file.name}":`, err);
        errorDetails.push({
          filename: file.name,
          reason: err?.message || 'Unexpected parsing error',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }

    setDiagnostics(prev => ({
      ...prev,
      lastScanTimestamp: new Date().toLocaleTimeString(),
      totalFilesEncountered: rawList.length,
      audioFilesFound: audioFiles.length,
      parsedSuccessfully: processedTracks.length,
      parsingErrors: errorDetails.length,
      errorDetails
    }));

    logScanner('success', `Scan complete! Successfully processed ${processedTracks.length} of ${audioFiles.length} audio tracks.`);
    appendLog(`Scan finished: ${processedTracks.length} tracks added to local library.`);

    setProgress({
      current: audioFiles.length,
      total: audioFiles.length,
      percent: 100,
      currentFileName: '',
      status: 'completed'
    });

    setIsScanning(false);
    await loadSavedTracks();
    return processedTracks;
  }, [checkEnvironment, appendLog, loadSavedTracks]);

  /**
   * Scans a directory using the File System Access API with permission validation
   */
  const scanDirectory = useCallback(async (): Promise<{ tracks: Track[]; permissionError?: string }> => {
    setIsScanning(true);
    setScanError(null);
    appendLog('Initiating directory picker scan...');

    const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
    const hasFSA = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (!hasFSA) {
      const err = 'File System Access API (showDirectoryPicker) is not supported in this browser.';
      logScanner('warn', err);
      setScanError(err);
      appendLog(err);
      setIsScanning(false);
      return { tracks: [], permissionError: 'unsupported' };
    }

    if (isIframe) {
      logScanner('warn', 'Direct showDirectoryPicker() called inside an iframe. May trigger SecurityError.');
    }

    try {
      setProgress(prev => ({ ...prev, status: 'requesting-permission', currentFileName: 'Waiting for folder permission...' }));

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      const dirName = dirHandle.name || 'Local Music Folder';
      logScanner('success', `User selected directory: "${dirName}"`);
      appendLog(`Directory selected: "${dirName}"`);

      // Check permission
      let permStatus = 'granted';
      if (dirHandle.queryPermission) {
        try {
          permStatus = await dirHandle.queryPermission({ mode: 'read' });
          logScanner('info', `Directory queryPermission status: "${permStatus}"`);
          if (permStatus !== 'granted' && dirHandle.requestPermission) {
            permStatus = await dirHandle.requestPermission({ mode: 'read' });
            logScanner('info', `Directory requestPermission status: "${permStatus}"`);
          }
        } catch (permErr: any) {
          logScanner('warn', 'Permission query/request error:', permErr);
        }
      }

      setDiagnostics(prev => ({ ...prev, permissionStatus: permStatus as any }));

      if (permStatus === 'denied') {
        const msg = `Permission to read directory "${dirName}" was denied by user or browser policy.`;
        logScanner('error', msg);
        setScanError(msg);
        appendLog(msg);
        setIsScanning(false);
        return { tracks: [], permissionError: 'denied' };
      }

      // Collect files recursively
      setProgress(prev => ({ ...prev, status: 'reading-directory', currentFileName: `Reading ${dirName}...` }));
      const fileList: File[] = [];

      async function readHandleEntries(handle: any, depth = 0) {
        if (depth > 5) return; // Prevent infinite folder recursion
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            if (isAudioCandidate(entry.name)) {
              try {
                const file = await entry.getFile();
                fileList.push(file);
              } catch (fileAccessErr: any) {
                logScanner('warn', `Failed to get File from handle "${entry.name}":`, fileAccessErr);
              }
            }
          } else if (entry.kind === 'directory') {
            try {
              await readHandleEntries(entry, depth + 1);
            } catch (dirErr: any) {
              logScanner('warn', `Could not access subfolder "${entry.name}" (may be restricted or protected):`, dirErr);
            }
          }
        }
      }

      await readHandleEntries(dirHandle);
      logScanner('info', `Found ${fileList.length} audio files in directory "${dirName}".`);

      if (fileList.length === 0) {
        logScanner('warn', `Directory "${dirName}" contains 0 audio files.`);
        appendLog(`No audio files found in "${dirName}".`);
        setIsScanning(false);
        return { tracks: [] };
      }

      const imported = await scanFiles(fileList, dirName);
      return { tracks: imported };
    } catch (err: any) {
      setIsScanning(false);
      if (err.name === 'AbortError') {
        logScanner('info', 'User canceled folder selection dialog.');
        appendLog('Folder selection canceled.');
        return { tracks: [] };
      }

      if (err.name === 'SecurityError') {
        const securityMsg = 'Security Error: Direct folder access is restricted inside this iframe sandbox. Please use the "Pick Audio Files" or file input button.';
        logScanner('error', securityMsg, err);
        setScanError(securityMsg);
        appendLog(securityMsg);
        return { tracks: [], permissionError: 'security-iframe' };
      }

      if (err.name === 'NotAllowedError') {
        const notAllowedMsg = 'Not Allowed: Browser blocked folder access or permission was rejected.';
        logScanner('error', notAllowedMsg, err);
        setScanError(notAllowedMsg);
        appendLog(notAllowedMsg);
        return { tracks: [], permissionError: 'not-allowed' };
      }

      logScanner('error', `Unexpected folder scanner error: ${err?.message || err}`, err);
      setScanError(err?.message || 'Failed to scan directory');
      appendLog(`Error: ${err?.message || 'Directory access error'}`);
      return { tracks: [], permissionError: err?.message || 'unknown' };
    }
  }, [appendLog, scanFiles]);

  /**
   * Remove a single track
   */
  const removeTrack = useCallback(async (trackId: string) => {
    try {
      logScanner('info', `Removing track from device storage: ${trackId}`);
      await localAudioService.removeLocalTrack(trackId);
      setTracks(prev => prev.filter(t => t.id !== trackId));
      logScanner('success', `Removed track ${trackId}`);
    } catch (err: any) {
      logScanner('error', `Failed to remove track ${trackId}:`, err);
    }
  }, []);

  /**
   * Clear all tracks
   */
  const clearLibrary = useCallback(async () => {
    try {
      logScanner('info', 'Clearing all tracks from local device storage...');
      await localAudioService.clearAllLocalTracks();
      setTracks([]);
      logScanner('success', 'Cleared all local tracks from IndexedDB.');
      appendLog('Cleared all local tracks.');
    } catch (err: any) {
      logScanner('error', 'Failed to clear local library:', err);
    }
  }, [appendLog]);

  return {
    tracks,
    isScanning,
    scanProgress: progress,
    scanError,
    diagnostics,
    logs,
    scanDirectory,
    scanFiles,
    loadSavedTracks,
    removeTrack,
    clearLibrary,
    checkEnvironment
  };
}
