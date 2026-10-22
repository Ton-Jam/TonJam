import { useMemo } from 'react';
import { useCoverColor, DEFAULT_FALLBACK_COLOR } from '@/lib/color-utils';
import { NFTItem } from '@/types';

export interface NftColorPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ambientGlowColor: string;
  radialGradient: string;
  linearGradient: string;
}

// Convert Hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  const normH = ((h % 360) + 360) % 360;
  const normS = Math.max(0, Math.min(100, s)) / 100;
  const normL = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * normL - 1)) * normS;
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
  const m = normL - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= normH && normH < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= normH && normH < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= normH && normH < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= normH && normH < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= normH && normH < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= normH && normH < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val: number) => {
    const hexVal = Math.round((val + m) * 255).toString(16);
    return hexVal.length === 1 ? '0' + hexVal : hexVal;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Returns a fallback harmonic palette derived from NFT attributes when image isn't available
 */
function getRarityPalette(rarity?: string): { primary: string; secondary: string; accent: string } {
  const r = (rarity || '').toLowerCase();
  if (r.includes('mythic')) {
    return { primary: '#F59E0B', secondary: '#D97706', accent: '#EF4444' };
  }
  if (r.includes('legendary')) {
    return { primary: '#8B5CF6', secondary: '#EC4899', accent: '#3B82F6' };
  }
  if (r.includes('epic')) {
    return { primary: '#D946EF', secondary: '#8B5CF6', accent: '#06B6D4' };
  }
  if (r.includes('rare')) {
    return { primary: '#00F0FF', secondary: '#0088CC', accent: '#7B2CBF' };
  }
  return { primary: '#0098EA', secondary: '#0052FF', accent: '#38BDF8' };
}

/**
 * Custom React hook that derives a seamless color palette for the music NFT currently being viewed.
 * Automatically computes harmonious secondary and accent tones and pre-computed gradient strings.
 */
export function useNftColorPalette(nft?: NFTItem | null): NftColorPalette {
  const imageUrl = nft?.imageUrl || nft?.coverUrl || '';
  const extractedPrimary = useCoverColor(imageUrl);

  return useMemo(() => {
    let primary = extractedPrimary;

    // If using fallback default, check if NFT rarity offers a more characteristic tone
    if (primary === DEFAULT_FALLBACK_COLOR && nft?.rarity) {
      const rarityPalette = getRarityPalette(nft.rarity);
      primary = rarityPalette.primary;
    }

    // Derive complementary harmonious secondary and accent colors
    const [h, s, l] = hexToHsl(primary);
    
    // Secondary: Shift hue by +35deg for smooth analogous blending, boost saturation
    const secondary = hslToHex(h + 35, Math.min(100, s + 10), Math.max(25, Math.min(65, l - 5)));
    
    // Accent: Shift hue by +140deg for glowing accent points
    const accent = hslToHex(h + 140, Math.min(100, s + 15), Math.max(30, Math.min(70, l)));

    const ambientGlowColor = `${primary}20`; // 12% opacity
    
    const radialGradient = `radial-gradient(ellipse 90% 60% at 50% -10%, ${primary}30 0%, ${secondary}15 45%, transparent 75%)`;
    const linearGradient = `linear-gradient(135deg, ${primary}20 0%, ${secondary}10 50%, transparent 100%)`;

    return {
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      ambientGlowColor,
      radialGradient,
      linearGradient,
    };
  }, [extractedPrimary, nft?.rarity]);
}

export default useNftColorPalette;
