import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  UploadTask, 
  UploadMetadata 
} from 'firebase/storage';
import { storage, auth } from '../lib/firebase';
import axios from 'axios';

export interface StorageUploadResponse {
  downloadUrl: string;
  path: string;
  fullPath?: string;
  size?: number;
  contentType?: string;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  metadata?: Record<string, string>;
  maxRetries?: number;
  retryDelayMs?: number;
  onTaskCreated?: (task: UploadTask) => void;
}

// Supported audio formats & constraints
export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'audio/aac',
  'audio/x-m4a',
  'audio/mp4',
  'audio/m4a'
];

export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'];
export const MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// Supported artwork formats & constraints
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates audio or artwork file format, mime type, and byte size
 */
export function validateStorageFile(
  file: File | Blob, 
  type: 'audio' | 'image' | 'any'
): { isValid: boolean; error?: string } {
  const size = file.size;

  if (type === 'audio') {
    if (size > MAX_AUDIO_SIZE_BYTES) {
      const sizeMb = (size / (1024 * 1024)).toFixed(1);
      return { 
        isValid: false, 
        error: `Audio file exceeds maximum size limit of 50 MB (Current: ${sizeMb} MB).` 
      };
    }

    if (file instanceof File) {
      const fileName = file.name.toLowerCase();
      const hasValidExt = ALLOWED_AUDIO_EXTENSIONS.some(ext => fileName.endsWith(ext));
      const hasValidMime = file.type ? ALLOWED_AUDIO_MIMES.includes(file.type.toLowerCase()) : true;
      if (!hasValidExt && !hasValidMime) {
        return { 
          isValid: false, 
          error: `Unsupported audio format. Allowed: MP3, WAV, FLAC, OGG, AAC, M4A.` 
        };
      }
    }
  }

  if (type === 'image') {
    if (size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (size / (1024 * 1024)).toFixed(1);
      return { 
        isValid: false, 
        error: `Artwork file exceeds maximum size limit of 10 MB (Current: ${sizeMb} MB).` 
      };
    }

    if (file instanceof File) {
      const fileName = file.name.toLowerCase();
      const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
      const hasValidMime = file.type ? ALLOWED_IMAGE_MIMES.includes(file.type.toLowerCase()) : true;
      if (!hasValidExt && !hasValidMime) {
        return { 
          isValid: false, 
          error: `Unsupported artwork format. Allowed: JPG, JPEG, PNG, WEBP, GIF.` 
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Sanitize filename to prevent directory traversal or invalid storage keys
 */
export function sanitizeStorageFileName(rawName: string): string {
  const base = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${Date.now()}_${base}`;
}

/**
 * Genuine Firebase Storage upload with uploadBytesResumable, 
 * real progress tracking, retries on network drops, and permanent download URLs.
 */
export const uploadFile = async (
  file: File | Blob, 
  path: string, 
  onProgress?: (progress: number) => void,
  options?: UploadOptions
): Promise<StorageUploadResponse> => {
  const maxRetries = options?.maxRetries ?? 2;
  const retryDelayMs = options?.retryDelayMs ?? 1000;
  
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await new Promise<StorageUploadResponse>((resolve, reject) => {
        const storageRef = ref(storage, path);
        
        const metadata: UploadMetadata = {
          contentType: file.type || 'application/octet-stream',
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            uploaderUid: auth.currentUser?.uid || 'anonymous',
            ...(options?.metadata || {})
          }
        };

        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        if (options?.onTaskCreated) {
          options.onTaskCreated(uploadTask);
        }

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const total = snapshot.totalBytes;
            const transferred = snapshot.bytesTransferred;
            if (total > 0) {
              const percent = Math.min(100, Math.round((transferred / total) * 100));
              if (onProgress) {
                onProgress(percent);
              }
              if (options?.onProgress) {
                options.onProgress(percent);
              }
            }
          },
          (error) => {
            console.error(`[Firebase Storage] Upload error at attempt ${attempt + 1}:`, error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                downloadUrl,
                path,
                fullPath: uploadTask.snapshot.ref.fullPath,
                size: uploadTask.snapshot.totalBytes,
                contentType: file.type
              });
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries) {
        throw new Error(`Firebase Storage upload failed permanently after ${maxRetries + 1} attempts: ${err?.message || err}`);
      }
      console.warn(`[Firebase Storage] Transient upload failure, retrying in ${retryDelayMs * attempt}ms...`);
      await new Promise(r => setTimeout(r, retryDelayMs * attempt));
    }
  }

  throw new Error("Firebase Storage upload failed: maximum retry limit reached");
};

/**
 * Uploads an audio master file to Firebase Storage at audio/{userId}/{sanitizedFileName}
 */
export const uploadAudio = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const validation = validateStorageFile(file, 'audio');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const userId = auth.currentUser?.uid || 'anonymous';
  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `audio/${userId}/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'audio_master'
    }
  });
};

/**
 * Uploads a cover artwork image to Firebase Storage at images/{userId}/{sanitizedFileName}
 */
export const uploadCover = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const validation = validateStorageFile(file, 'image');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const userId = auth.currentUser?.uid || 'anonymous';
  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `images/${userId}/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'track_cover'
    }
  });
};

/**
 * Uploads an avatar image to Firebase Storage at users/{userId}/avatars/{sanitizedFileName}
 */
export const uploadAvatar = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const validation = validateStorageFile(file, 'image');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('Authentication required to upload user profile avatar.');
  }

  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `users/${userId}/avatars/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'user_avatar'
    }
  });
};

/**
 * Uploads a profile cover banner image to Firebase Storage at users/{userId}/covers/{sanitizedFileName}
 */
export const uploadProfileCover = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const validation = validateStorageFile(file, 'image');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('Authentication required to upload user profile cover banner.');
  }

  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `users/${userId}/covers/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'user_profile_cover'
    }
  });
};

/**
 * Uploads an NFT media asset to Firebase Storage at nfts/{userId}/{sanitizedFileName}
 */
export const uploadNFTArtwork = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const validation = validateStorageFile(file, 'image');
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const userId = auth.currentUser?.uid || 'anonymous';
  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `nfts/${userId}/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'nft_artwork'
    }
  });
};

/**
 * Uploads JamSpace community post media to Firebase Storage at posts/{userId}/{sanitizedFileName}
 */
export const uploadPostMedia = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid || 'anonymous';
  const cleanName = sanitizeStorageFileName(file.name);
  const storagePath = `posts/${userId}/${cleanName}`;
  
  return uploadFile(file, storagePath, onProgress, {
    metadata: {
      originalName: file.name,
      fileCategory: 'jamspace_post'
    }
  });
};

export const uploadPostImage = uploadPostMedia;

/**
 * Uploads NFT metadata JSON to Firebase Storage
 */
export const uploadMetadata = async (metadata: any): Promise<StorageUploadResponse> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User must be authenticated to upload metadata');
  }

  const storagePath = `nft/${userId}/${Date.now()}_metadata.json`;
  const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  return uploadFile(blob, storagePath);
};

/**
 * Helper to obtain Firebase ID token for authenticated server proxy requests
 */
async function getAuthTokenHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
  } catch (err) {
    console.warn("[storageService] Failed to get user auth token for server proxy:", err);
  }
  return {};
}

/**
 * Uploads a file to Pinata IPFS via secure authenticated server proxy.
 * Rejects with a clear error if Pinata is unconfigured or returns an error.
 */
export const uploadToPinata = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  const authHeaders = await getAuthTokenHeader();
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post('/api/pinata/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...authHeaders
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    if (response.data?.success && (response.data.ipfsUrl || response.data.ipfsHash)) {
      if (response.data.ipfsUrl && !response.data.simulated) {
        return response.data.ipfsUrl;
      }
      if (response.data.ipfsHash && !response.data.simulated) {
        return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
      }
    }

    if (response.data?.error) {
      throw new Error(`Pinata upload error: ${response.data.error}`);
    }

    throw new Error('Pinata response missing valid IPFS CID.');
  } catch (err: any) {
    const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
    throw new Error(`IPFS Upload failed: ${serverMessage}`);
  }
};

/**
 * Uploads JSON metadata to Pinata IPFS via secure authenticated server proxy.
 * Rejects with a clear error if Pinata is unconfigured or returns an error.
 */
export const uploadJSONToPinata = async (
  json: any, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (onProgress) onProgress(30);
  const authHeaders = await getAuthTokenHeader();
  
  try {
    const response = await axios.post('/api/pinata/upload-json', json, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    if (onProgress) onProgress(100);

    if (response.data?.success && (response.data.ipfsUrl || response.data.ipfsHash)) {
      if (response.data.ipfsUrl && !response.data.simulated) {
        return response.data.ipfsUrl;
      }
      if (response.data.ipfsHash && !response.data.simulated) {
        return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
      }
    }

    if (response.data?.error) {
      throw new Error(`Pinata metadata upload error: ${response.data.error}`);
    }

    throw new Error('Pinata metadata response missing valid IPFS CID.');
  } catch (err: any) {
    const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
    throw new Error(`IPFS Metadata Upload failed: ${serverMessage}`);
  }
};
