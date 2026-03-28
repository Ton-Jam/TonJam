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
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/x-m4a', 'audio/mp4'];
export const ALLOWED_DOCUMENT_TYPES = ['text/plain', 'application/pdf'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export function validateFile(file: File, type: 'image' | 'audio' | 'document' | 'video' | 'image_or_video', maxSizeMB: number = 10): { isValid: boolean; error?: string } {
  let allowedTypes: string[] = [];
  
  if (type === 'image') allowedTypes = ALLOWED_IMAGE_TYPES;
  else if (type === 'audio') allowedTypes = ALLOWED_AUDIO_TYPES;
  else if (type === 'document') allowedTypes = ALLOWED_DOCUMENT_TYPES;
  else if (type === 'video') allowedTypes = ALLOWED_VIDEO_TYPES;
  else if (type === 'image_or_video') allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File is too large. Maximum size is ${maxSizeMB}MB.` 
    };
  }

  return { isValid: true };
}
