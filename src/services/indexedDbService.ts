import { Track } from '../types';

const DB_NAME = 'tonjam-offline-db';
const DB_VERSION = 2;
const TRACKS_STORE = 'tracks';
const AUDIO_STORE = 'audio';
const LOCAL_TRACKS_STORE = 'local_tracks';
const LOCAL_AUDIO_STORE = 'local_audio';

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store for track metadata
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
      }

      // Store for audio files (Blobs)
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }

      // Store for user local device audio metadata
      if (!db.objectStoreNames.contains(LOCAL_TRACKS_STORE)) {
        db.createObjectStore(LOCAL_TRACKS_STORE, { keyPath: 'id' });
      }

      // Store for user local device audio files (Blobs)
      if (!db.objectStoreNames.contains(LOCAL_AUDIO_STORE)) {
        db.createObjectStore(LOCAL_AUDIO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Failed to open offline IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const indexedDbService = {
  /**
   * Save all available tracks to IndexedDB metadata store.
   * Helps show the list of tracks when offline.
   */
  async saveTracks(tracks: Track[]): Promise<void> {
    try {
      const db = await initDB();
      const transaction = db.transaction(TRACKS_STORE, 'readwrite');
      const store = transaction.objectStore(TRACKS_STORE);

      for (const track of tracks) {
        // Essential fields to ensure playing
        store.put(track);
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (err) {
      console.warn('Error saving track metadata to IndexedDB:', err);
    }
  },

  /**
   * Retrieve all saved tracks metadata.
   */
  async getTracks(): Promise<Track[]> {
    try {
      const db = await initDB();
      const transaction = db.transaction(TRACKS_STORE, 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Error loading track metadata from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Save an audio blob or arraybuffer offline for a track.
   */
  async saveAudioBlob(trackId: string, blob: Blob): Promise<void> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);

      store.put({ id: trackId, blob, cachedAt: Date.now(), size: blob.size });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (err) {
      console.warn(`Error storing audio blob for ${trackId} in IndexedDB:`, err);
    }
  },

  /**
   * Retrieve cached audio Blob for a track.
   */
  async getAudioBlob(trackId: string): Promise<Blob | null> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(trackId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.blob : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`Error loading audio blob for ${trackId} from IndexedDB:`, err);
      return null;
    }
  },

  /**
   * Check if a track has its audio cached in IndexedDB.
   */
  async hasAudioBlob(trackId: string): Promise<boolean> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.getKey(trackId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result !== undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`Error checking audio cache for ${trackId} in IndexedDB:`, err);
      return false;
    }
  },

  /**
   * Delete cached audio Blob.
   */
  async deleteAudioBlob(trackId: string): Promise<void> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);

      store.delete(trackId);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (err) {
      console.warn(`Error deleting audio blob for ${trackId} from IndexedDB:`, err);
    }
  },

  /**
   * Get all cached track IDs.
   */
  async getAllCachedTrackIds(): Promise<string[]> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.getAllKeys();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const keys = request.result || [];
          resolve(keys.map(k => String(k)));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Error loading cached track IDs from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Get metadata details (id, size, cachedAt) for all cached audio tracks.
   */
  async getAudioMetadataList(): Promise<{ id: string; size: number; cachedAt: number }[]> {
    try {
      const db = await initDB();
      const transaction = db.transaction(AUDIO_STORE, 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const results: { id: string; size: number; cachedAt: number }[] = [];

      return new Promise((resolve, reject) => {
        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            const value = cursor.value;
            results.push({
              id: cursor.key as string,
              size: value.size || (value.blob ? value.blob.size : 0),
              cachedAt: value.cachedAt || Date.now()
            });
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    } catch (err) {
      console.warn('Error reading audio cache list from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Save a local device track metadata and audio blob to IndexedDB
   */
  async saveLocalTrack(track: Track, blob: Blob): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction([LOCAL_TRACKS_STORE, LOCAL_AUDIO_STORE], 'readwrite');
      const trackStore = tx.objectStore(LOCAL_TRACKS_STORE);
      const audioStore = tx.objectStore(LOCAL_AUDIO_STORE);

      trackStore.put(track);
      audioStore.put({ id: track.id, blob, size: blob.size, addedAt: Date.now() });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`Error saving local track ${track.id} to IndexedDB:`, err);
    }
  },

  /**
   * Batch save multiple local device tracks
   */
  async saveLocalTracks(items: { track: Track; blob: Blob }[]): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction([LOCAL_TRACKS_STORE, LOCAL_AUDIO_STORE], 'readwrite');
      const trackStore = tx.objectStore(LOCAL_TRACKS_STORE);
      const audioStore = tx.objectStore(LOCAL_AUDIO_STORE);

      for (const item of items) {
        trackStore.put(item.track);
        audioStore.put({ id: item.track.id, blob: item.blob, size: item.blob.size, addedAt: Date.now() });
      }

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Error saving local tracks batch to IndexedDB:', err);
    }
  },

  /**
   * Get all local device tracks metadata stored in IndexedDB
   */
  async getLocalTracks(): Promise<Track[]> {
    try {
      const db = await initDB();
      const tx = db.transaction(LOCAL_TRACKS_STORE, 'readonly');
      const store = tx.objectStore(LOCAL_TRACKS_STORE);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Error loading local tracks from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Get the audio blob for a local device track
   */
  async getLocalAudioBlob(trackId: string): Promise<Blob | null> {
    try {
      const db = await initDB();
      const tx = db.transaction(LOCAL_AUDIO_STORE, 'readonly');
      const store = tx.objectStore(LOCAL_AUDIO_STORE);
      const request = store.get(trackId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const res = request.result;
          resolve(res ? res.blob : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`Error loading local audio blob for ${trackId}:`, err);
      return null;
    }
  },

  /**
   * Check if a local track audio blob exists in IndexedDB
   */
  async hasLocalAudioBlob(trackId: string): Promise<boolean> {
    try {
      const db = await initDB();
      const tx = db.transaction(LOCAL_AUDIO_STORE, 'readonly');
      const store = tx.objectStore(LOCAL_AUDIO_STORE);
      const request = store.getKey(trackId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result !== undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      return false;
    }
  },

  /**
   * Delete a local device track and its audio blob from IndexedDB
   */
  async deleteLocalTrack(trackId: string): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction([LOCAL_TRACKS_STORE, LOCAL_AUDIO_STORE], 'readwrite');
      tx.objectStore(LOCAL_TRACKS_STORE).delete(trackId);
      tx.objectStore(LOCAL_AUDIO_STORE).delete(trackId);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`Error deleting local track ${trackId}:`, err);
    }
  },

  /**
   * Clear all local device tracks and audio from IndexedDB
   */
  async clearLocalTracks(): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction([LOCAL_TRACKS_STORE, LOCAL_AUDIO_STORE], 'readwrite');
      tx.objectStore(LOCAL_TRACKS_STORE).clear();
      tx.objectStore(LOCAL_AUDIO_STORE).clear();

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Error clearing local tracks in IndexedDB:', err);
    }
  }
};
