import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(seed: string, width: number = 400, height: number = 400) {
  // Using picsum.photos for reliable placeholder images as recommended in guidelines
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/x-m4a', 'audio/mp4'];
export const ALLOWED_DOCUMENT_TYPES = ['text/plain', 'application/pdf'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export function validateFile(file: File, type: 'image' | 'audio' | 'document' | 'video' | 'image_or_video', maxSizeMB: number = 10): { isValid: boolean; error?: string } {
  let allowedTypes: string[] = [];
  let allowedExtensions: string[] = [];
  
  if (type === 'image') {
    allowedTypes = ALLOWED_IMAGE_TYPES;
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  } else if (type === 'audio') {
    allowedTypes = ALLOWED_AUDIO_TYPES;
    allowedExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
  } else if (type === 'document') {
    allowedTypes = ALLOWED_DOCUMENT_TYPES;
    allowedExtensions = ['.txt', '.pdf'];
  } else if (type === 'video') {
    allowedTypes = ALLOWED_VIDEO_TYPES;
    allowedExtensions = ['.mp4', '.webm', '.ogg'];
  } else if (type === 'image_or_video') {
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.ogg'];
  }
  
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const hasValidType = allowedTypes.includes(fileType);
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidType && !hasValidExtension) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ').toUpperCase()}` 
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.` 
    };
  }

  return { isValid: true };
}
