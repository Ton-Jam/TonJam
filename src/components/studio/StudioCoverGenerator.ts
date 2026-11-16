export interface PinnedAssetRecord {
  cid: string;
  gatewayUrl: string;
  ipfsUri: string;
  fileName?: string;
  sizeBytes?: number;
}

export function extractCidFromUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('ipfs://')) {
    return trimmed.replace('ipfs://', '').split('/')[0] || '';
  }
  const ipfsIdx = trimmed.indexOf('/ipfs/');
  if (ipfsIdx !== -1) {
    return trimmed.slice(ipfsIdx + 6).split(/[/?#]/)[0] || '';
  }
  return trimmed;
}

export function toPinataAssetRecord(
  gatewayUrl: string,
  fileName?: string,
  sizeBytes?: number
): PinnedAssetRecord {
  const cid = extractCidFromUrl(gatewayUrl);
  return {
    cid,
    gatewayUrl,
    ipfsUri: cid ? `ipfs://${cid}` : gatewayUrl,
    fileName,
    sizeBytes,
  };
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || !Number.isFinite(bytes)) return '0 MB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function shortAddress(address: string, head = 6, tail = 4): string {
  if (!address) return 'Not connected';
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

/**
 * Generates deterministic high-contrast vinyl & acoustic frequency cover art on a local Canvas
 * when an artist wants studio artwork directly without leaving the studio.
 */
export async function generateStudioCoverFile(
  title: string,
  artist: string,
  genre: string
): Promise<File> {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for artwork generation');
  }

  // Deterministic seed from title + artist
  const seedStr = `${title}:${artist}:${genre}`;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const huePrimary = Math.abs(hash) % 360;
  const hueSecondary = (huePrimary + 48) % 360;

  // Deep studio gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#070B14');
  bgGrad.addColorStop(0.55, `hsl(${huePrimary}, 58%, 14%)`);
  bgGrad.addColorStop(1, `hsl(${hueSecondary}, 62%, 10%)`);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Ambient glow orb
  const orbGrad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.44,
    30,
    size * 0.5,
    size * 0.44,
    size * 0.46
  );
  orbGrad.addColorStop(0, `hsla(${hueSecondary}, 90%, 60%, 0.42)`);
  orbGrad.addColorStop(0.6, `hsla(${huePrimary}, 80%, 45%, 0.14)`);
  orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orbGrad;
  ctx.fillRect(0, 0, size, size);

  // Concentric sonic rings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  for (let r = 130; r <= 370; r += 38) {
    ctx.lineWidth = r === 244 ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.45, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Harmonic waveform bars around center
  const bars = 48;
  const centerX = size / 2;
  const centerY = size * 0.45;
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const amp = 24 + (Math.abs((hash >> (i % 24)) ^ (i * 31)) % 76);
    const innerR = 128;
    const outerR = innerR + amp;
    ctx.strokeStyle = i % 3 === 0 ? '#38BDF8' : 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
    ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
    ctx.stroke();
  }

  // Center disc label
  ctx.fillStyle = '#0B1220';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 82, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
  ctx.fill();

  // Editorial bottom typography block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`TONJAM MASTER // ${genre.toUpperCase()}`, 68, size - 152);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 54px "Poppins", sans-serif';
  const safeTitle = (title || 'Untitled Master').slice(0, 24);
  ctx.fillText(safeTitle, 68, size - 90);

  ctx.fillStyle = '#7DD3FC';
  ctx.font = '600 28px "Poppins", sans-serif';
  const safeArtist = (artist || 'TonJam Artist').slice(0, 32);
  ctx.fillText(safeArtist, 68, size - 48);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode studio artwork'));
          return;
        }
        const safeSlug = (title || 'studio-cover').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        resolve(new File([blob], `${safeSlug}-cover.png`, { type: 'image/png' }));
      },
      'image/png',
      0.95
    );
  });
}
