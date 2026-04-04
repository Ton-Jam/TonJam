import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';

export interface StorageUploadResponse {
  downloadUrl: string;
  path: string;
}

/**
 * Generic upload function to Firebase Storage
 */
export const uploadFile = async (file: File | Blob, path: string, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload Error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadUrl, path });
      }
    );
  });
};

/**
 * Uploads an audio file to Firebase Storage at /audio/{userId}/track.mp3
 */
export const uploadAudio = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be authenticated to upload files');

  const storagePath = `audio/${userId}/track.mp3`;
  return uploadFile(file, storagePath, onProgress);
};

/**
 * Uploads a cover image to Firebase Storage at /covers/{userId}/cover.png
 */
export const uploadCover = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be authenticated to upload files');

  const storagePath = `covers/${userId}/cover.png`;
  return uploadFile(file, storagePath, onProgress);
};

/**
 * Uploads NFT metadata to Firebase Storage at /nft/{userId}/metadata.json
 */
export const uploadMetadata = async (metadata: any): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be authenticated to upload files');

  const storagePath = `nft/${userId}/metadata.json`;
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  return uploadFile(blob, storagePath);
};
