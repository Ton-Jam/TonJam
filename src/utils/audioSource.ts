export interface AudioSourceCandidate {
  url: string;
  crossOrigin: boolean;
}

const PLACEHOLDER_URIS = new Set([
  'ipfs://placeholder-audio',
  'ipfs://pending-audio-upload',
  'about:blank',
]);

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
];

export function isPlaceholderAudioUri(url?: string | null): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (PLACEHOLDER_URIS.has(trimmed.toLowerCase())) return true;
  return false;
}

export function extractIpfsPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.toLowerCase().startsWith('ipfs://')) {
    let rest = trimmed.slice('ipfs://'.length).replace(/^\/+/, '');
    if (rest.toLowerCase().startsWith('ipfs/')) {
      rest = rest.slice('ipfs/'.length);
    }
    return rest || null;
  }

  const gatewayMatch = trimmed.match(/^https?:\/\/[^/]+\/ipfs\/(.+)$/i);
  if (gatewayMatch && gatewayMatch[1]) {
    return gatewayMatch[1].replace(/^\/+/, '') || null;
  }

  return null;
}

export function normalizePlayableAudioUrl(url?: string | null): string {
  if (isPlaceholderAudioUri(url)) return '';
  const trimmed = url!.trim();

  if (trimmed.toLowerCase().startsWith('ipfs://')) {
    const ipfsPath = extractIpfsPath(trimmed);
    if (!ipfsPath) return '';
    return `${IPFS_GATEWAYS[0]}${ipfsPath}`;
  }

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:audio/') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return '';
}

export function buildAudioFallbackQueue(options: {
  primaryUrl?: string | null;
  trackAudioUrl?: string | null;
  audioIpfsUrl?: string | null;
  cachedUrl?: string | null;
  localBlobUrl?: string | null;
}): AudioSourceCandidate[] {
  const seen = new Set<string>();
  const candidates: AudioSourceCandidate[] = [];

  const pushCandidate = (rawUrl?: string | null, crossOrigin = false) => {
    const normalized = normalizePlayableAudioUrl(rawUrl);
    if (!normalized) return;
    const key = `${normalized}|${crossOrigin ? '1' : '0'}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ url: normalized, crossOrigin });
  };

  if (options.localBlobUrl) {
    pushCandidate(options.localBlobUrl, false);
  }

  pushCandidate(options.primaryUrl, false);
  pushCandidate(options.trackAudioUrl, false);
  pushCandidate(options.audioIpfsUrl, false);

  // Add alternate IPFS gateways if any input points to IPFS
  const rawSources = [options.primaryUrl, options.trackAudioUrl, options.audioIpfsUrl];
  for (const raw of rawSources) {
    if (!raw || isPlaceholderAudioUri(raw)) continue;
    const ipfsPath = extractIpfsPath(raw);
    if (ipfsPath) {
      for (const gateway of IPFS_GATEWAYS) {
        pushCandidate(`${gateway}${ipfsPath}`, false);
      }
    }
  }

  if (options.cachedUrl) {
    pushCandidate(options.cachedUrl, false);
  }

  return candidates;
}
