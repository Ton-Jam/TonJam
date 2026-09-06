import { useState, useEffect, useMemo } from 'react';
import { getColor } from 'colorthief';

export const DEFAULT_FALLBACK_COLOR = '#1D4ED8';

// Module-level caches: completed results and in-flight promises
const colorCache = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

/**
 * Deterministic harmonic color generator based on URL string hash for offline/fallback resilience
 */
function getDeterministicFallback(seedString: string): string {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash % 360);
  const [r, g, b] = hslToRgb(hue / 360, 0.7, 0.45);
  return rgbToHex(r, g, b);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let normalized = t;
    if (normalized < 0) normalized += 1;
    if (normalized > 1) normalized -= 1;
    if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
    if (normalized < 1 / 2) return q;
    if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Extracts dominant theme color as a hex string from a given image URL using colorthief.
 * Utilizes in-memory caching and in-flight promise deduplication.
 */
export async function extractDominantThemeColor(imageUrl?: string | null): Promise<string> {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return DEFAULT_FALLBACK_COLOR;
  }

  const trimmedUrl = imageUrl.trim();

  // 1. Check completed cache
  if (colorCache.has(trimmedUrl)) {
    return colorCache.get(trimmedUrl)!;
  }

  // 2. Check and reuse in-flight extraction promise
  if (inFlightRequests.has(trimmedUrl)) {
    return inFlightRequests.get(trimmedUrl)!;
  }

  if (typeof window === 'undefined') {
    return DEFAULT_FALLBACK_COLOR;
  }

  const extractionPromise = (async (): Promise<string> => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        let isDone = false;
        const timeoutId = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            reject(new Error('Image load timeout'));
          }
        }, 3500);

        img.onload = () => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timeoutId);
            resolve();
          }
        };

        img.onerror = (err) => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timeoutId);
            reject(err);
          }
        };

        img.src = trimmedUrl;
      });

      // Extract dominant color using Color Thief
      const extracted = await getColor(img, { quality: 5 });

      if (extracted) {
        const hex = extracted.hex().toUpperCase();
        colorCache.set(trimmedUrl, hex);
        return hex;
      }

      const fallback = getDeterministicFallback(trimmedUrl);
      colorCache.set(trimmedUrl, fallback);
      return fallback;
    } catch {
      // CORS, network error, or invalid image source: fallback gracefully
      const fallback = getDeterministicFallback(trimmedUrl);
      colorCache.set(trimmedUrl, fallback);
      return fallback;
    } finally {
      inFlightRequests.delete(trimmedUrl);
    }
  })();

  inFlightRequests.set(trimmedUrl, extractionPromise);
  return extractionPromise;
}

/**
 * Custom React hook that returns the dominant color (hex string) of the given cover artwork.
 * Handles lifecycle unmounting safely and avoids duplicate processing.
 */
export function useCoverColor(imageUrl?: string | null): string {
  const initialColor = useMemo(() => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return DEFAULT_FALLBACK_COLOR;
    }
    const trimmed = imageUrl.trim();
    if (colorCache.has(trimmed)) {
      return colorCache.get(trimmed)!;
    }
    return DEFAULT_FALLBACK_COLOR;
  }, [imageUrl]);

  const [color, setColor] = useState<string>(initialColor);

  useEffect(() => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      setColor(DEFAULT_FALLBACK_COLOR);
      return;
    }

    const trimmed = imageUrl.trim();

    if (colorCache.has(trimmed)) {
      setColor(colorCache.get(trimmed)!);
      return;
    }

    let isMounted = true;

    extractDominantThemeColor(trimmed).then((extractedColor) => {
      if (isMounted) {
        setColor(extractedColor);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return color;
}

export default extractDominantThemeColor;
