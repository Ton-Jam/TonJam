import { Track } from '../types';

const DB_NAME = 'tonjam-offline-db';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const AUDIO_STORE = 'audio';

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
  }
};
