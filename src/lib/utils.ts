import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(id: string | number, width: number = 800, height: number = 800) {
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/m4a"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/plain"];

export function validateFile(file: File, allowedTypes: string[] | string, maxSizeMB: number = 10) {
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
  if (!types.includes(file.type)) {
    return { isValid: false, error: `Invalid file type. Allowed: ${types.join(", ")}` };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: `File too large. Max: ${maxSizeMB}MB` };
  }
  return { isValid: true };
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function shareContent(data: ShareData) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return { success: true, method: 'native' };
    } catch (error) {
      // Ignore AbortError (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'native', error: 'canceled' };
      }
      console.error('Error sharing:', error);
      return { success: false, method: 'native', error };
    }
  }
  
  // Fallback to clipboard if URL is present
  if (data.url) {
    try {
      await navigator.clipboard.writeText(data.url);
      return { success: true, method: 'clipboard' };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return { success: false, method: 'clipboard', error };
    }
  }

  return { success: false, method: 'none', error: 'no-share-api-or-url' };
}
