import { describe, it, expect } from 'vitest';
import {
  isPlaceholderAudioUri,
  extractIpfsPath,
  normalizePlayableAudioUrl,
  buildAudioFallbackQueue,
} from '@/utils/audioSource';
import fs from 'fs';
import path from 'path';

describe('audioSource playback & fallback resolution', () => {
  it('filters placeholder and blank audio URIs', () => {
    expect(isPlaceholderAudioUri('')).toBe(true);
    expect(isPlaceholderAudioUri('   ')).toBe(true);
    expect(isPlaceholderAudioUri('ipfs://placeholder-audio')).toBe(true);
    expect(isPlaceholderAudioUri('ipfs://pending-audio-upload')).toBe(true);
    expect(isPlaceholderAudioUri('https://example.com/track.mp3')).toBe(false);
  });

  it('normalizes ipfs:// URLs to HTTPS gateway URLs and preserves valid URLs', () => {
    expect(extractIpfsPath('ipfs://QmTest12345')).toBe('QmTest12345');
    expect(extractIpfsPath('ipfs://ipfs/QmTest12345/audio.mp3')).toBe('QmTest12345/audio.mp3');
    expect(extractIpfsPath('https://gateway.pinata.cloud/ipfs/QmTest12345')).toBe('QmTest12345');

    expect(normalizePlayableAudioUrl('ipfs://QmTest12345')).toBe(
      'https://gateway.pinata.cloud/ipfs/QmTest12345'
    );
    expect(normalizePlayableAudioUrl('ipfs://placeholder-audio')).toBe('');
    expect(normalizePlayableAudioUrl('https://cdn.example.com/song.mp3')).toBe(
      'https://cdn.example.com/song.mp3'
    );
    expect(normalizePlayableAudioUrl('blob:https://app.example/123')).toBe(
      'blob:https://app.example/123'
    );
  });

  it('builds deduplicated fallback queue with alternate IPFS gateways and cached blob', () => {
    const queue = buildAudioFallbackQueue({
      primaryUrl: 'https://gateway.pinata.cloud/ipfs/QmAudioCid',
      trackAudioUrl: 'ipfs://QmAudioCid',
      audioIpfsUrl: 'ipfs://QmAudioCid',
      cachedUrl: 'blob:https://app.example/cached',
    });

    const urls = queue.map((q) => q.url);
    expect(urls).toEqual([
      'https://gateway.pinata.cloud/ipfs/QmAudioCid',
      'https://ipfs.io/ipfs/QmAudioCid',
      'https://dweb.link/ipfs/QmAudioCid',
      'blob:https://app.example/cached',
    ]);
  });

  it('ensures AudioContext attaches play().catch() before crossfade ramp and omits console.error fallback loops', () => {
    const src = fs.readFileSync(path.resolve('src/contexts/AudioContext.tsx'), 'utf-8');
    expect(src).not.toContain('[Audio] All fallbacks failed:');
    expect(src).toContain('playbackAttemptIdRef');
    expect(src).toContain('buildAudioFallbackQueue');
  });
});
