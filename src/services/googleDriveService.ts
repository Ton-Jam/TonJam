import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
}

// Memory cache for active access token during the session
let cachedDriveToken: string | null = null;

/**
 * Trigger pop-up authentication with Google Drive scope
 */
export async function authenticateGoogleDrive(): Promise<string> {
  const provider = new GoogleAuthProvider();
  // Request full drive access as configured in metadata/OAuth
  provider.addScope('https://www.googleapis.com/auth/drive');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.accessToken) {
      throw new Error('Could not retrieve access token from Google identity provider.');
    }
    cachedDriveToken = credential.accessToken;
    return cachedDriveToken;
  } catch (error: any) {
    console.error('Error during Google Drive authentication:', error);
    throw error;
  }
}

/**
 * Set a manual token or check if already cached
 */
export function getCachedDriveToken(): string | null {
  return cachedDriveToken;
}

/**
 * Clear drive token on logout
 */
export function clearDriveToken(): void {
  cachedDriveToken = null;
}

/**
 * List files and sub-folders inside a specific parent folder in Google Drive.
 */
export async function listDriveFolder(
  token: string,
  folderId: string = 'root'
): Promise<DriveItem[]> {
  try {
    // We want folders or standard files (excluding shortcut maps if any)
    const q = `'${folderId}' in parents and trashed = false`;
    const fields = 'files(id, name, mimeType, size, thumbnailLink)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent(fields)}&orderBy=folder%2Cname&pageSize=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(
        errBody.error?.message || `Google Drive list failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Drive contents:', error);
    throw error;
  }
}

/**
 * Search all audio and image files globally across user request
 */
export async function searchDriveFiles(
  token: string,
  queryText: string
): Promise<DriveItem[]> {
  try {
    const q = `name contains '${queryText.replace(/'/g, "\\'")}' and trashed = false`;
    const fields = 'files(id, name, mimeType, size, thumbnailLink)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent(fields)}&orderBy=folder%2Cname&pageSize=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(
        errBody.error?.message || `Google Drive query failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error searching Drive:', error);
    throw error;
  }
}

/**
 * Download a file from Google Drive and return as a File object in-memory
 */
export async function downloadDriveFile(
  token: string,
  fileId: string,
  fileName: string,
  mimeType: string
): Promise<File> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve file payload from Google Drive: ${response.statusText}`);
    }

    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Error downloading from Drive:', error);
    throw error;
  }
}

/**
 * Check if a file mimeType is audio
 */
export function isAudioMime(mimeType: string): boolean {
  return (
    mimeType.startsWith('audio/') ||
    mimeType === 'application/ogg' ||
    mimeType === 'application/octet-stream' // sometimes returned for generic files
  );
}

/**
 * Check if a file mimeType is image
 */
export function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a file mimeType is folder
 */
export function isFolderMime(mimeType: string): boolean {
  return mimeType === 'application/vnd.google-apps.folder';
}
