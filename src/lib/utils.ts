import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

type PlaceholderType = 'artist' | 'track' | 'album' | 'playlist' | 'nft' | string;

const PLACEHOLDERS: Record<string, string> = {
  artist: '/placeholders/artist-placeholder.webp',
  track: '/placeholders/track-placeholder.webp',
  album: '/placeholders/album-placeholder.webp',
  playlist: '/placeholders/playlist-placeholder.webp',
  nft: '/placeholders/nft-placeholder.webp',
};

export const getPlaceholderImage = (type: PlaceholderType, _width?: number, _height?: number): string => {
  if (type in PLACEHOLDERS) {
    return PLACEHOLDERS[type];
  }

  const lowerType = String(type || '').toLowerCase();
  
  if (lowerType.includes('banner')) {
    return '/default_tonjam_banner.jpg';
  }
  if (lowerType.includes('artist') || lowerType.includes('creator') || lowerType.includes('user') || lowerType.includes('avatar')) {
    return PLACEHOLDERS.artist;
  }
  if (lowerType.includes('track') || lowerType.includes('song')) {
    return PLACEHOLDERS.track;
  }
  if (lowerType.includes('album') || lowerType.includes('cover')) {
    return PLACEHOLDERS.album;
  }
  if (lowerType.includes('playlist') || lowerType.includes('jam') || lowerType.includes('collection')) {
    return PLACEHOLDERS.playlist;
  }
  if (lowerType.includes('nft')) {
    return PLACEHOLDERS.nft;
  }

  // Backwards compatibility fallback if a fully custom tag was passed
  const cleanId = (type || "tonjam").replace(/[^a-zA-Z0-9\s-_]/g, "").split("-").join(" ");
  return `https://placehold.co/400x400/18181b/9ca3af?text=${encodeURIComponent(cleanId)}`;
};

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

/**
 * Canvas-based image compression utility for NFT artwork before IPFS upload.
 * Optimizes artwork into WebP / High-Quality JPEG (max 1440x1440, quality 0.88),
 * reducing IPFS upload payload and mobile rendering overhead while preserving visual fidelity.
 */
export async function compressImageForNFT(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  }
): Promise<File> {
  const maxWidth = options?.maxWidth || 1440;
  const maxHeight = options?.maxHeight || 1440;
  const quality = options?.quality ?? 0.88;
  const mimeType = options?.mimeType || 'image/webp';

  // If non-image, small already (<300KB), or GIF (to preserve animation), return original file
  if (!file || !file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file); // Fallback to original
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compression did not reduce file size, keep original
            return resolve(file);
          }
          const extension = mimeType === 'image/webp' ? '.webp' : '.jpg';
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${cleanName}_compressed${extension}`, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback on error
    };

    img.src = objectUrl;
  });
}

