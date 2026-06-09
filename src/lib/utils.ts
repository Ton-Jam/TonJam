import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export function getPlaceholderImage(type: string, width = 400, height = 400): string {
  const placeholders: Record<string, string> = {
    artist: '/placeholders/artist-placeholder.webp',
    track: '/placeholders/track-placeholder.webp',
    album: '/placeholders/album-placeholder.webp',
    playlist: '/placeholders/playlist-placeholder.webp',
    nft: '/placeholders/nft-placeholder.webp',
  };

  const lowerType = (type || '').toLowerCase();
  
  // Try string match directly or exact look-ups
  if (lowerType in placeholders) {
    return placeholders[lowerType];
  }
  
  // Try prefix and fuzzy matching to preserve existing dynamic placeholders
  if (lowerType.includes('artist') || lowerType.includes('creator') || lowerType.includes('user') || lowerType.includes('avatar')) {
    return placeholders.artist;
  }
  if (lowerType.includes('track') || lowerType.includes('song')) {
    return placeholders.track;
  }
  if (lowerType.includes('album') || lowerType.includes('cover')) {
    return placeholders.album;
  }
  if (lowerType.includes('playlist') || lowerType.includes('jam') || lowerType.includes('collection')) {
    return placeholders.playlist;
  }
  if (lowerType.includes('nft')) {
    return placeholders.nft;
  }

  // Backwards compatibility fallback if a fully custom tag was passed
  const cleanId = (type || "tonjam").replace(/[^a-zA-Z0-9\s-_]/g, "").split("-").join(" ");
  return `https://placehold.co/${width}x${height}/18181b/9ca3af?text=${encodeURIComponent(cleanId)}`;
}

export async function shareContent(options: { title?: string; text?: string; url?: string }) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      });
      return { success: true, method: "native" };
    } catch (err) {
      // User cancelled or share failed, fall back
    }
  }

  // Fallback to copy link
  if (options.url) {
    try {
      await navigator.clipboard.writeText(options.url);
      return { success: true, method: "clipboard" };
    } catch (err) {
      return { success: false };
    }
  }
  return { success: false };
}

export function validateFile(
  file: File,
  type: 'image' | 'video' | 'audio' | 'document' | 'image_or_video',
  maxSizeInMB: number
): { isValid: boolean; error?: string } {
  const sizeInBytes = file.size;
  const maxBytes = maxSizeInMB * 1024 * 1024;
  
  if (sizeInBytes > maxBytes) {
    return {
      isValid: false,
      error: `File size exceeds the limit of ${maxSizeInMB}MB.`
    };
  }
  
  const fileType = file.type;
  
  if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'
    };
  }
  
  if (type === 'video' && !ALLOWED_VIDEO_TYPES.includes(fileType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only MP4, WEBM, and MOV videos are allowed.'
    };
  }
  
  if (type === 'audio' && !ALLOWED_AUDIO_TYPES.includes(fileType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only MP3, WAV, OGG, FLAC, and M4A audio files are allowed.'
    };
  }
  
  if (type === 'document' && !ALLOWED_DOCUMENT_TYPES.includes(fileType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT documents are allowed.'
    };
  }
  
  if (type === 'image_or_video' && !ALLOWED_IMAGE_TYPES.includes(fileType) && !ALLOWED_VIDEO_TYPES.includes(fileType)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only image or video files are allowed.'
    };
  }
  
  return { isValid: true };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
