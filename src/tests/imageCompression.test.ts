import { describe, it, expect, vi } from 'vitest';
import { compressImageForNFT } from '@/lib/utils';

describe('Image Compression Engine for NFT Artwork', () => {
  it('should return original file if file is non-image or small audio/document', async () => {
    const textFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const result = await compressImageForNFT(textFile);
    expect(result).toBe(textFile);
  });

  it('should return original file if image is under 300KB threshold', async () => {
    const smallFile = new File(['a'.repeat(100 * 1024)], 'small_cover.png', { type: 'image/png' });
    const result = await compressImageForNFT(smallFile);
    expect(result).toBe(smallFile);
  });

  it('should return original file for animated GIF files to preserve animation', async () => {
    const gifFile = new File(['a'.repeat(500 * 1024)], 'animated.gif', { type: 'image/gif' });
    const result = await compressImageForNFT(gifFile);
    expect(result).toBe(gifFile);
  });
});
