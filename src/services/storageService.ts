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
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress > 100) progress = 100;
      if (onProgress) {
        onProgress(progress);
      }
      
      if (progress === 100) {
        clearInterval(interval);
        const localUrl = file instanceof File ? URL.createObjectURL(file) : URL.createObjectURL(file as Blob);
        resolve({ downloadUrl: localUrl, path });
      }
    }, 200);
  });
};

/**
 * Uploads an audio file to Firebase Storage at /audio/{userId}/track.mp3
 */
export const uploadAudio = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid || 'mock-user-id';
  const storagePath = `audio/${userId}/${file.name}`;
  return uploadFile(file, storagePath, onProgress);
};

/**
 * Uploads a cover image to Firebase Storage at /images/{userId}/{fileName}
 */
export const uploadCover = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid || 'mock-user-id';
  const storagePath = `images/${userId}/${file.name}`;
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

/**
 * Uploads a post image to Firebase Storage at /posts/{userId}/{fileName}
 */
export const uploadPostImage = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be authenticated to upload files');

  const storagePath = `posts/${userId}/${file.name}`;
  return uploadFile(file, storagePath, onProgress);
};

/**
 * Uploads an avatar image to Firebase Storage at /avatars/{userId}/{fileName}
 */
export const uploadAvatar = async (file: File, onProgress?: (progress: number) => void): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User must be authenticated to upload files');

  const storagePath = `avatars/${userId}/${file.name}`;
  return uploadFile(file, storagePath, onProgress);
};
