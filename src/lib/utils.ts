import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function getPlaceholderImage(seed: string, width = 600, height = 400) {
  return `https://image.pollinations.ai/prompt/music%20art%20${encodeURIComponent(seed)}%20abstract%20digital?width=${width}&height=${height}&nologo=true`;
}

export async function shareContent(data: { title: string; text: string; url: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return { success: true, method: 'native' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') return { success: false, method: 'native' };
    }
  }
  
  try {
    await navigator.clipboard.writeText(data.url);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return { success: false, method: 'none' };
  }
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 
  'audio/wav', 
  'audio/x-wav', 
  'audio/flac', 
  'audio/x-flac', 
  'audio/ogg', 
  'audio/vorbis',
  'audio/aac', 
  'audio/x-aac', 
  'audio/mp4', 
  'audio/x-m4a',
  'audio/m4a'
];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export function validateFile(file: File, type: 'image' | 'video' | 'audio' | 'document' | 'image_or_video', maxMb: number) {
  const allowedTypes = 
    type === 'image' ? ALLOWED_IMAGE_TYPES :
    type === 'video' ? ALLOWED_VIDEO_TYPES :
    type === 'audio' ? ALLOWED_AUDIO_TYPES :
    type === 'document' ? ALLOWED_DOCUMENT_TYPES :
    [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Invalid file type. Supported: ${allowedTypes.join(', ')}` };
  }
  
  if (file.size > maxMb * 1024 * 1024) {
    return { isValid: false, error: `File size exceeds ${maxMb}MB limit.` };
  }
  
  return { isValid: true };
}
