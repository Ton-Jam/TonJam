import React from 'react';
import { Play, Heart, Download, Share2, MoreVertical, ShieldCheck, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryTrack } from '../types';

interface LikedSongsProps {
  tracks: LibraryTrack[];
  onPlay: (track: LibraryTrack) => void;
  onToggleLike: (id: string) => void;
  onToggleDownload: (id: string) => void;
}

export const LikedSongs: React.FC<LikedSongsProps> = ({ 
  tracks, 
  onPlay, 
  onToggleLike, 
  onToggleDownload 
}) => {
  const handleShare = (track: LibraryTrack) => {
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Check out ${track.title} by ${track.artist} on TonJam!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      // Fallback
      navigator.clipboard.writeText(`Check out ${track.title} by ${track.artist} on TonJam: ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-full">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="section-title">Liked Songs</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold tracking-wider">{tracks.length} tracks saved on device</p>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-[10px] bg-black/[0.01] dark:bg-white/[0.01]">
          <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h4 className="text-xs font-bold text-foreground">No Liked Songs</h4>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto mt-1">Tap the heart icon on any track while streaming to collect them here.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-2 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:bg-black/[0.02] border border-transparent hover:border-black/5 dark:hover:border-white/5 rounded-[10px] transition-all group"
            >
              <div className="relative w-12 h-12 shrink-0 rounded-[10px] overflow-hidden bg-slate-800">
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => onPlay(track)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Play className="w-5 h-5 text-white fill-current" />
                </button>
              </div>

              <div className="flex-1 min-w-0" onClick={() => onPlay(track)}>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                  {track.isOfflineAvailable && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-mono font-bold mr-2">
                  {formatDuration(track.duration)}
                </span>

                <button
                  onClick={() => onToggleLike(track.id)}
                  className="p-2 text-pink-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Unlike track"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => onToggleDownload(track.id)}
                  className={`p-2 hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                    track.isDownloaded ? 'text-emerald-500' : 'text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                  title={track.isDownloaded ? 'Remove Download' : 'Download Offline'}
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleShare(track)}
                  className="p-2 text-muted-foreground opacity-50 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Share Track"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
