import React from 'react';
import { Download, HardDrive, Settings, Trash2 } from 'lucide-react';
import { LibraryTrack, LibraryAlbum } from '../types';

interface DownloadsManagerProps {
  tracks: LibraryTrack[];
  albums: LibraryAlbum[];
  totalDownloadedSize: string;
  downloadQuality: 'High' | 'Lossless' | 'Dolby Atmos';
  onChangeQuality: (quality: 'High' | 'Lossless' | 'Dolby Atmos') => void;
  onRemoveDownload: (id: string) => void;
  onPlay?: (track: LibraryTrack) => void;
}

export const DownloadsManager: React.FC<DownloadsManagerProps> = ({
  tracks,
  albums,
  totalDownloadedSize,
  downloadQuality,
  onChangeQuality,
  onRemoveDownload,
  onPlay
}) => {
  const downloadedTracks = tracks.filter(t => t.isDownloaded);
  const downloadedAlbums = albums.filter(a => a.isDownloaded);

  const [storageEstimate, setStorageEstimate] = React.useState<{ quotaGb: number; usageGb: number }>({
    quotaGb: 0,
    usageGb: 0,
  });

  React.useEffect(() => {
    let active = true;
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
      navigator.storage
        .estimate()
        .then((est) => {
          if (!active) return;
          const quotaGb = est.quota ? est.quota / (1024 * 1024 * 1024) : 0;
          const usageGb = est.usage ? est.usage / (1024 * 1024 * 1024) : 0;
          setStorageEstimate({ quotaGb, usageGb });
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, []);

  const hasQuota = storageEstimate.quotaGb > 0;
  const totalDeviceGb = hasQuota ? storageEstimate.quotaGb : 1;
  const usedDeviceGb = storageEstimate.usageGb;
  const systemTonJamGb = parseFloat(totalDownloadedSize) || 0;
  const freeGb = hasQuota ? Math.max(0, totalDeviceGb - usedDeviceGb) : 0;

  const tonjamPercentage = hasQuota ? Math.min(100, (systemTonJamGb / totalDeviceGb) * 100) : 0;
  const otherPercentage = hasQuota ? Math.min(100 - tonjamPercentage, (usedDeviceGb / totalDeviceGb) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Device Storage Status Bar */}
      <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-4 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5 text-[var(--tj-color-text-primary,#F8FAFC)]">
            <HardDrive className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold">Offline Storage</h3>
              <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
                Cached audio footprint on this device
              </p>
            </div>
          </div>

          <div className="text-right space-y-0.5 font-mono shrink-0">
            <p className="text-xs font-bold text-[var(--tj-color-text-primary,#F8FAFC)]">
              {systemTonJamGb.toFixed(2)} GB
            </p>
            <p className="text-[11px] text-[var(--tj-color-text-muted,#7F91AA)] uppercase font-semibold tracking-wider">
              TonJam Cache
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-[var(--tj-color-bg-secondary,#0B1424)] rounded-full flex overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-l-full"
              style={{ width: `${systemTonJamGb > 0 ? Math.max(2, tonjamPercentage) : 0}%` }}
              title={`TonJam Storage: ${systemTonJamGb.toFixed(2)} GB`}
            />
            <div
              className="bg-slate-500/35 h-full"
              style={{ width: `${otherPercentage}%` }}
              title={`Other Apps: ${usedDeviceGb.toFixed(2)} GB`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-[var(--tj-color-text-secondary,#A8B7CC)] font-medium">
            <span>{systemTonJamGb.toFixed(2)} GB TonJam</span>
            <span>
              {hasQuota
                ? `${freeGb.toFixed(1)} GB Free of ${totalDeviceGb.toFixed(1)} GB`
                : `${downloadedTracks.length} track${downloadedTracks.length === 1 ? '' : 's'} cached`}
            </span>
          </div>
        </div>
      </div>

      {/* Download Quality Configuration */}
      <div className="bg-[var(--tj-color-surface-elevated,#111C30)] rounded-[var(--tj-radius-lg,10px)] p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[var(--tj-color-text-primary,#F8FAFC)]">
            <Settings className="w-4 h-4 text-emerald-400 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Download Quality</h4>
          </div>
          <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)]">
            Preferred fidelity for offline cached streams
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['High', 'Lossless', 'Dolby Atmos'] as const).map((q) => (
            <button
              type="button"
              key={q}
              onClick={() => onChangeQuality(q)}
              className={`min-h-[36px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-[var(--tj-radius-md,8px)] cursor-pointer transition-colors border-0 ${
                downloadQuality === q
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-[var(--tj-color-chip-background,#102943)] text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-[var(--tj-color-text-primary,#F8FAFC)] hover:bg-[var(--tj-color-surface-hover,#132B49)]'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Downloaded Content */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 px-1">
          Downloaded Tracks & Albums
        </h4>

        {downloadedTracks.length === 0 && downloadedAlbums.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-[var(--tj-radius-lg,10px)] bg-[var(--tj-color-surface-elevated,#111C30)]/60">
            <Download className="w-6 h-6 text-[var(--tj-color-text-muted,#7F91AA)] mx-auto mb-2 opacity-70" />
            <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] font-semibold">
              No downloaded tracks yet
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {downloadedAlbums.map((album) => (
              <div
                key={album.id}
                className="flex items-center gap-3 p-2.5 bg-[var(--tj-color-surface-elevated,#111C30)]/60 hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] group transition-colors"
              >
                <div className="relative w-10 h-10 rounded-[var(--tj-radius-md,8px)] overflow-hidden shrink-0 bg-[var(--tj-color-bg-secondary,#0B1424)]">
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Album
                  </span>
                  <h5 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
                    {album.title}
                  </h5>
                  <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                    {album.artist} • {album.tracksCount} tracks
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[var(--tj-color-text-secondary,#A8B7CC)] mr-1 shrink-0">
                  {album.downloadSize || '54 MB'}
                </span>
              </div>
            ))}

            {downloadedTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => onPlay && onPlay(track)}
                className="flex items-center gap-3 p-2.5 bg-[var(--tj-color-surface-elevated,#111C30)]/60 hover:bg-[var(--tj-color-surface-hover,#132B49)] rounded-[var(--tj-radius-lg,10px)] group cursor-pointer select-none transition-colors"
              >
                <div className="relative w-10 h-10 rounded-[var(--tj-radius-md,8px)] overflow-hidden shrink-0 bg-[var(--tj-color-bg-secondary,#0B1424)]">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs sm:text-sm font-semibold text-[var(--tj-color-text-primary,#F8FAFC)] truncate">
                    {track.title}
                  </h5>
                  <p className="text-xs text-[var(--tj-color-text-secondary,#A8B7CC)] truncate">
                    {track.artist}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-[var(--tj-color-text-secondary,#A8B7CC)] shrink-0">
                  <span className="hidden sm:inline">{track.downloadQuality || downloadQuality}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{track.downloadSize || '5.8 MB'}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDownload(track.id);
                    }}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[var(--tj-radius-md,8px)] hover:bg-rose-500/15 text-[var(--tj-color-text-secondary,#A8B7CC)] hover:text-rose-400 cursor-pointer transition-colors border-0 bg-transparent"
                    title="Remove Download"
                    aria-label={`Remove ${track.title} from downloads`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
