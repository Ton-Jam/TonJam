import React from 'react';
import { Download, HardDrive, Settings, Trash2, ArrowRight, CheckCircle, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryTrack, LibraryAlbum } from '../types';

interface DownloadsManagerProps {
  tracks: LibraryTrack[];
  albums: LibraryAlbum[];
  totalDownloadedSize: string;
  downloadQuality: 'High' | 'Lossless' | 'Dolby Atmos';
  onChangeQuality: (quality: 'High' | 'Lossless' | 'Dolby Atmos') => void;
  onRemoveDownload: (id: string) => void;
}

export const DownloadsManager: React.FC<DownloadsManagerProps> = ({
  tracks,
  albums,
  totalDownloadedSize,
  downloadQuality,
  onChangeQuality,
  onRemoveDownload
}) => {
  const downloadedTracks = tracks.filter(t => t.isDownloaded);
  const downloadedAlbums = albums.filter(a => a.isDownloaded);

  // Hardcoded device storage mock values
  const totalDeviceGb = 128;
  const usedDeviceGb = 42.6;
  const systemTonJamGb = parseFloat(totalDownloadedSize) || 0.45;

  const tonjamPercentage = (systemTonJamGb / totalDeviceGb) * 100;
  const otherPercentage = (usedDeviceGb / totalDeviceGb) * 100;

  return (
    <div className="space-y-4">
      {/* Device Storage Status Bar */}
      <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 text-foreground">
            <HardDrive className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="space-y-0.5">
              <h2 className="section-title">Offline Node Storage</h2>
              <p className="text-[10px] text-muted-foreground">Cached storage footprint on this device</p>
            </div>
          </div>

          <div className="text-right space-y-0.5 font-mono">
            <p className="text-xs font-bold text-foreground">{systemTonJamGb.toFixed(2)} GB</p>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">TonJam Footprint</p>
          </div>
        </div>

        {/* Triple progress bar style */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-black/10 dark:bg-white/5 rounded-full flex overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-l-full" 
              style={{ width: `${Math.max(2, tonjamPercentage)}%` }} 
              title={`TonJam Storage: ${systemTonJamGb} GB`}
            />
            <div 
              className="bg-slate-500/30 h-full" 
              style={{ width: `${otherPercentage}%` }} 
              title={`Other Apps: ${usedDeviceGb} GB`}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
            <span>{systemTonJamGb.toFixed(2)} GB TonJam</span>
            <span>{(totalDeviceGb - usedDeviceGb - systemTonJamGb).toFixed(1)} GB Free of {totalDeviceGb} GB</span>
          </div>
        </div>
      </div>

      {/* Downloader configurations */}
      <div className="bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 rounded-[10px] p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-foreground">
            <Settings className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Download Configurations</h4>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal">Configure fidelity settings and stream quality</p>
        </div>

        <div className="flex gap-2">
          {(['High', 'Lossless', 'Dolby Atmos'] as const).map((q) => (
            <button
              key={q}
              onClick={() => onChangeQuality(q)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md cursor-pointer border transition-all ${
                downloadQuality === q 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Download list titles */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 px-1">Downloaded Content Nodes</h4>
        
        {downloadedTracks.length === 0 && downloadedAlbums.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-black/10 dark:border-white/10 rounded-[10px]">
            <Download className="w-6 h-6 text-muted-foreground mx-auto mb-1.5 opacity-50" />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">No downloaded tracks found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Downloaded albums */}
            {downloadedAlbums.map((album) => (
              <div 
                key={album.id}
                className="flex items-center gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-[10px] border border-black/5 dark:border-white/5 group"
              >
                <div className="relative w-10 h-10 rounded-[10px] overflow-hidden shrink-0 bg-slate-800">
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-widest font-mono">Album Node</span>
                  <h5 className="text-xs font-bold text-foreground truncate">{album.title}</h5>
                  <p className="text-[9px] text-muted-foreground truncate">{album.artist} • {album.tracksCount} tracks</p>
                </div>
                <span className="text-[9px] font-mono font-bold text-muted-foreground mr-1">
                  {album.downloadSize || '54 MB'}
                </span>
              </div>
            ))}

            {/* Downloaded tracks */}
            {downloadedTracks.map((track) => (
              <div 
                key={track.id}
                className="flex items-center gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-[10px] border border-black/5 dark:border-white/5 group"
              >
                <div className="relative w-10 h-10 rounded-[10px] overflow-hidden shrink-0 bg-slate-800">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Single Track</span>
                  <h5 className="text-xs font-bold text-foreground truncate">{track.title}</h5>
                  <p className="text-[9px] text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[9px] font-bold text-muted-foreground">
                  <span>{track.downloadQuality || downloadQuality}</span>
                  <span>•</span>
                  <span>{track.downloadSize || '5.2 MB'}</span>
                  <button
                    onClick={() => onRemoveDownload(track.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
                    title="Delete Download"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
