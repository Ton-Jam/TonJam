import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Heart, MoreVertical, CheckCircle2, Headphones, Sparkles, 
  Volume2, Disc3, Music, Download, Users, Lock, Globe, ListMusic, 
  TrendingUp, Clock, History, Shuffle, SkipBack, SkipForward, Repeat 
} from 'lucide-react';
import { TrackPlaceholder } from '../../placeholders/TrackPlaceholder';
import { AlbumPlaceholder } from '../../placeholders/AlbumPlaceholder';
import { PlaylistPlaceholder } from '../../placeholders/PlaylistPlaceholder';

// --- TS INTERFACES ---

export interface TrackData {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  isVerified?: boolean;
  coverUrl: string;
  duration: string;
  genre?: string;
  isExplicit?: boolean;
  isNFT?: boolean;
  streams?: number;
  playCount?: number;
  isLiked?: boolean;
  trendRank?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  playedAt?: string;
  listenPercentage?: number;
  recommendationReason?: string;
}

export interface AlbumData {
  id: string;
  title: string;
  artist: string;
  isArtistVerified?: boolean;
  coverUrl: string;
  releaseYear?: number | string;
  trackCount: number;
  duration?: string;
  genre?: string;
  isNFTCollection?: boolean;
  isDolbyAtmos?: boolean;
  isLiked?: boolean;
}

export interface PlaylistData {
  id: string;
  title: string;
  creator: string;
  isCreatorVerified?: boolean;
  coverUrl: string;
  trackCount: number;
  duration?: string;
  followersCount?: number;
  isCollaborative?: boolean;
  isPrivate?: boolean;
  isLiked?: boolean;
}

// --- 1. STANDARD TRACK CARD ---
export const TrackCard: React.FC<{
  track?: TrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (track: TrackData) => void;
  onLike?: (track: TrackData) => void;
  onMore?: (track: TrackData) => void;
  className?: string;
}> = ({ track, isLoading, isPlaying, onPlay, onLike, onMore, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(track?.isLiked || false);

  if (isLoading || !track) {
    return (
      <div className={`flex items-center p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-full ${className}`}>
        <div className="w-12 h-12 bg-white/10 rounded-lg shrink-0" />
        <div className="ml-3 flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
        <div className="w-12 h-4 bg-white/10 rounded shrink-0" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: '#101A3B' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay?.(track)}
      className={`flex items-center p-3 rounded-[10px] bg-[#0A113A] transition-colors cursor-pointer w-full group relative select-none ${className}`}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950">
        {imgFailed ? (
          <TrackPlaceholder size={20} />
        ) : (
          <img
            src={track.coverUrl}
            alt={track.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Play Count Badge on Corner */}
        {((track.streams !== undefined ? track.streams : track.playCount) || 0) > 0 && (
          <div className="absolute top-0.5 right-0.5 bg-black/70 backdrop-blur-[2px] text-[7px] font-bold text-white px-1 py-0.2 rounded flex items-center gap-0.5 z-10 select-none">
            <Headphones className="w-2 h-2 text-blue-400" />
            <span>
              {(() => {
                const count = track.streams !== undefined ? track.streams : (track.playCount || 0);
                return count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count;
              })()}
            </span>
          </div>
        )}

        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isPlaying ? <Pause className="w-5 h-5 text-blue-400 fill-blue-400" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
        </div>
      </div>

      <div className="ml-3 flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4 className={`text-[14px] font-bold truncate ${isPlaying ? 'text-blue-400' : 'text-white'}`}>
            {track.title}
          </h4>
          {track.isExplicit && <span className="text-[9px] font-black bg-white/10 text-white/60 px-1 rounded uppercase tracking-wider scale-90">E</span>}
          {track.isNFT && (
            <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider shrink-0 flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" /> NFT
            </span>
          )}
        </div>
        <p className="text-[#9AA0AE] text-[11px] truncate mt-0.5 flex items-center gap-1">
          <span>{track.artist}</span>
          {track.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 fill-current" />}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-3.5 px-2">
            <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
            <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
            <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-0.5 bg-blue-400" />
          </div>
        ) : (
          track.streams !== undefined && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#9AA0AE] font-mono">
              <Headphones className="w-3 h-3" />
              <span>{track.streams >= 1000000 ? `${(track.streams / 1000000).toFixed(1)}M` : track.streams >= 1000 ? `${(track.streams / 1000).toFixed(0)}K` : track.streams}</span>
            </div>
          )
        )}
        <span className="text-[11px] text-[#9AA0AE] font-mono">{track.duration}</span>
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => { setLiked(!liked); onLike?.(track); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-red-500' : 'text-white/60 hover:text-white'}`} />
          </button>
          <button onClick={() => onMore?.(track)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- 2. COMPACT TRACK CARD (170px Width) ---
export const CompactTrackCard: React.FC<{
  track?: TrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (track: TrackData) => void;
  className?: string;
}> = ({ track, isLoading, isPlaying, onPlay, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading || !track) {
    return (
      <div className={`w-[170px] shrink-0 p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse ${className}`}>
        <div className="w-full aspect-square bg-white/10 rounded-lg mb-2" />
        <div className="h-3.5 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay?.(track)}
      className={`w-[170px] shrink-0 p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer select-none group relative ${className}`}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2 bg-slate-950">
        {imgFailed ? (
          <TrackPlaceholder size={24} />
        ) : (
          <img
            src={track.coverUrl}
            alt={track.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Play Count Badge on Corner */}
        {((track.streams !== undefined ? track.streams : track.playCount) || 0) > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-[2px] text-[8px] font-bold text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 z-10 select-none shadow-md">
            <Headphones className="w-2.5 h-2.5 text-blue-400" />
            <span>
              {(() => {
                const count = track.streams !== undefined ? track.streams : (track.playCount || 0);
                return count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count;
              })()}
            </span>
          </div>
        )}

        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="p-2 bg-blue-600 rounded-full text-white">
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </div>
        </div>
      </div>
      <h4 className={`text-[13px] font-bold truncate ${isPlaying ? 'text-blue-400' : 'text-white'}`}>{track.title}</h4>
      <p className="text-[11px] text-[#9AA0AE] truncate mt-0.5">{track.artist}</p>
    </motion.div>
  );
};

// --- 3. LARGE TRACK CARD ---
export const LargeTrackCard: React.FC<{
  track?: TrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (track: TrackData) => void;
  className?: string;
}> = ({ track, isLoading, isPlaying, onPlay, className = '' }) => {
  return <TrackCard track={track} isLoading={isLoading} isPlaying={isPlaying} onPlay={onPlay} className={className} />;
};

// --- 4. NOW PLAYING CARD ---
export const NowPlayingCard: React.FC<{
  track?: TrackData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}> = ({ track, isLoading, isPlaying = false, onTogglePlay, onNext, onPrev, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(track?.isLiked || false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);
  const [progress, setProgress] = useState(35); // simulated active play progress

  if (isLoading || !track) {
    return (
      <div className={`p-5 rounded-[10px] bg-gradient-to-b from-[#0E1B4B] to-[#0A113A] animate-pulse w-full max-w-[360px] aspect-[3/4] ${className}`}>
        <div className="w-full aspect-square bg-white/10 rounded-xl mb-4" />
        <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
        <div className="h-4 bg-white/10 rounded w-1/3" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[10px] bg-gradient-to-b from-[#0F1D5A] to-[#050A24] text-white w-full max-w-[360px] select-none shadow-2xl relative ${className}`}
    >
      {/* Artwork */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-slate-950 shadow-lg">
        {imgFailed ? (
          <AlbumPlaceholder size={48} />
        ) : (
          <img
            src={track.coverUrl}
            alt={track.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        )}
        {track.isNFT && (
          <span className="absolute top-3 left-3 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-1 shadow-md">
            <Sparkles className="w-2.5 h-2.5" /> Premium NFT Track
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black tracking-tight truncate">{track.title}</h3>
          <p className="text-sm text-[#9AA0AE] truncate mt-0.5 flex items-center gap-1">
            <span>{track.artist}</span>
            {track.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-current shrink-0" />}
          </p>
        </div>
        <button onClick={() => setLiked(!liked)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0">
          <Heart className={`w-6 h-6 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-white/60'}`} />
        </button>
      </div>

      {/* Progress slider bar */}
      <div className="mt-6">
        <div className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer relative" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          setProgress(Math.round((clickX / rect.width) * 100));
        }}>
          <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#9AA0AE] font-mono mt-1.5">
          <span>1:12</span>
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex justify-between items-center mt-6 px-2">
        <button onClick={() => setShuffleActive(!shuffleActive)} className={`p-2 transition-colors ${shuffleActive ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}>
          <Shuffle className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-6">
          <button onClick={onPrev} className="p-2 text-white/80 hover:text-white active:scale-90 transition-transform">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button onClick={onTogglePlay} className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-95 transition-all">
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
          <button onClick={onNext} className="p-2 text-white/80 hover:text-white active:scale-90 transition-transform">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        <button onClick={() => setRepeatActive(!repeatActive)} className={`p-2 transition-colors ${repeatActive ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}>
          <Repeat className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// --- 5. QUEUE CARD ---
export const QueueCard: React.FC<{
  track: TrackData;
  index: number;
  isPlaying?: boolean;
  onPlay?: () => void;
  onRemove?: () => void;
  className?: string;
}> = ({ track, index, isPlaying = false, onPlay, onRemove, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: '#101A3B' }}
      className={`flex items-center p-2 rounded-[10px] bg-[#0A113A]/50 hover:bg-[#0A113A] select-none ${className}`}
    >
      <span className="w-6 font-mono text-[12px] text-center text-[#9AA0AE] font-bold shrink-0">
        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-blue-400 mx-auto animate-pulse" />
        ) : (
          index + 1
        )}
      </span>
      <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-950 ml-1 cursor-pointer" onClick={onPlay}>
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
      </div>
      <div className="ml-3 flex-1 min-w-0" onClick={onPlay}>
        <h4 className={`text-[13px] font-bold truncate cursor-pointer ${isPlaying ? 'text-blue-400' : 'text-white'}`}>{track.title}</h4>
        <p className="text-[11px] text-[#9AA0AE] truncate">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 px-2">
        <span className="text-[11px] text-[#9AA0AE] font-mono mr-2">{track.duration}</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-red-400 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// --- 6. RECOMMENDED TRACK CARD ---
export const RecommendedTrackCard: React.FC<{
  track: TrackData;
  onPlay?: () => void;
  onLike?: () => void;
  className?: string;
}> = ({ track, onPlay, onLike, className = '' }) => {
  return (
    <div className={`p-3 bg-[#0A113A] rounded-[10px] space-y-2 select-none relative ${className}`}>
      {track.recommendationReason && (
        <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block">
          💡 {track.recommendationReason}
        </span>
      )}
      <TrackCard track={track} onPlay={onPlay} onLike={onLike} className="bg-transparent p-0 hover:bg-transparent" />
    </div>
  );
};

// --- 7. TRENDING TRACK CARD ---
export const TrendingTrackCard: React.FC<{
  track: TrackData;
  onPlay?: () => void;
  className?: string;
}> = ({ track, onPlay, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      {track.trendRank !== undefined && (
        <div className="w-8 shrink-0 flex flex-col items-center">
          <span className="font-mono text-base font-black text-white">{track.trendRank}</span>
          <span className={`text-[8px] font-bold ${track.trendDirection === 'up' ? 'text-emerald-400' : track.trendDirection === 'down' ? 'text-red-400' : 'text-[#9AA0AE]'}`}>
            {track.trendDirection === 'up' ? '▲' : track.trendDirection === 'down' ? '▼' : '●'}
          </span>
        </div>
      )}
      <div className="flex-1">
        <TrackCard track={track} onPlay={onPlay} />
      </div>
    </div>
  );
};

// --- 8. RECENTLY PLAYED CARD ---
export const RecentlyPlayedCard: React.FC<{
  track: TrackData;
  onPlay?: () => void;
  className?: string;
}> = ({ track, onPlay, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 w-full p-2 bg-[#0A113A]/30 rounded-[10px] ${className}`}>
      <TrackCard track={track} onPlay={onPlay} className="bg-transparent p-1 hover:bg-transparent" />
      {track.playedAt && (
        <div className="flex items-center gap-1 text-[9px] text-[#9AA0AE] font-mono pl-14">
          <Clock className="w-3 h-3" />
          <span>Played {track.playedAt}</span>
        </div>
      )}
    </div>
  );
};

// --- 9. MUSIC HISTORY CARD ---
export const MusicHistoryCard: React.FC<{
  track: TrackData;
  onPlay?: () => void;
  className?: string;
}> = ({ track, onPlay, className = '' }) => {
  const percent = track.listenPercentage || 100;
  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-[10px] bg-[#0A113A] ${className}`}>
      <TrackCard track={track} onPlay={onPlay} className="bg-transparent p-0 hover:bg-transparent" />
      <div className="pl-14 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[10px] text-[#9AA0AE] font-mono">
          <span className="flex items-center gap-1">
            <History className="w-3 h-3" /> Duration listened
          </span>
          <span className="font-bold text-white">{percent}%</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
};

// --- 10. ALBUM CARD ---
export const AlbumCard: React.FC<{
  album?: AlbumData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (album: AlbumData) => void;
  onLike?: (album: AlbumData) => void;
  onClick?: (album: AlbumData) => void;
  className?: string;
}> = ({ album, isLoading, isPlaying, onPlay, onLike, onClick, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(album?.isLiked || false);

  if (isLoading || !album) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-[170px] shrink-0 ${className}`}>
        <div className="w-full aspect-square bg-white/10 rounded-lg mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(album)}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] shrink-0 snap-start select-none group relative ${className}`}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed ? (
          <AlbumPlaceholder size={32} />
        ) : (
          <img
            src={album.coverUrl}
            alt={album.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {album.isNFTCollection && (
            <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-0.5 shadow-md">
              <Sparkles className="w-2.5 h-2.5 fill-current" /> Series
            </span>
          )}
          {album.isDolbyAtmos && (
            <span className="bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Volume2 className="w-3 h-3 fill-current" /> Dolby
            </span>
          )}
        </div>
        <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); onPlay?.(album); }} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg">
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold text-white truncate">{album.title}</h3>
        <p className="text-[#9AA0AE] text-[11px] truncate mt-0.5 flex items-center gap-1">
          <span>{album.artist}</span>
          {album.isArtistVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" />}
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#9AA0AE] font-mono">
        <span className="flex items-center gap-1"><Disc3 className="w-3 h-3 text-white/40" /> {album.trackCount} tracks</span>
        {album.releaseYear && <span className="opacity-75">{album.releaseYear}</span>}
      </div>
    </motion.div>
  );
};

// --- 11. PLAYLIST CARD ---
export const PlaylistCard: React.FC<{
  playlist?: PlaylistData;
  isLoading?: boolean;
  isPlaying?: boolean;
  onPlay?: (playlist: PlaylistData) => void;
  onLike?: (playlist: PlaylistData) => void;
  onClick?: (playlist: PlaylistData) => void;
  className?: string;
}> = ({ playlist, isLoading, isPlaying, onPlay, onLike, onClick, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(playlist?.isLiked || false);

  if (isLoading || !playlist) {
    return (
      <div className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A]/60 animate-pulse w-[170px] shrink-0 ${className}`}>
        <div className="w-full aspect-square bg-white/10 rounded-lg mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(playlist)}
      className={`flex flex-col p-3 rounded-[10px] bg-[#0A113A] hover:bg-[#101A3B] transition-colors cursor-pointer w-[170px] shrink-0 snap-start select-none group relative ${className}`}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
        {imgFailed ? (
          <PlaylistPlaceholder size={28} />
        ) : (
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {playlist.isCollaborative && (
            <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wider uppercase flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" /> Co-Op
            </span>
          )}
          {playlist.isPrivate ? (
            <span className="bg-black/60 text-white/80 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Private</span>
          ) : (
            <span className="bg-black/20 text-white/60 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> Public</span>
          )}
        </div>
        <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={(e) => { e.stopPropagation(); onPlay?.(playlist); }} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg">
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-[13px] font-bold text-white truncate">{playlist.title}</h4>
        <p className="text-[11px] text-[#9AA0AE] truncate mt-0.5">by {playlist.creator}</p>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#9AA0AE] font-mono">
        <span className="flex items-center gap-1"><ListMusic className="w-3.5 h-3.5" /> {playlist.trackCount} tracks</span>
        {playlist.duration && <span className="opacity-75">{playlist.duration}</span>}
      </div>
    </motion.div>
  );
};

// --- 12. FAVORITE PLAYLIST CARD (Premium Gradient Layout) ---
export const FavoritePlaylistCard: React.FC<{
  playlist: PlaylistData;
  onPlay?: (playlist: PlaylistData) => void;
  className?: string;
}> = ({ playlist, onPlay, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-[10px] bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between select-none cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950 shadow-md">
          <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase">My Favorite</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
          </div>
          <h4 className="text-sm font-black truncate">{playlist.title}</h4>
          <p className="text-[11px] text-white/60 font-mono mt-0.5">{playlist.trackCount} Sync Tracks</p>
        </div>
      </div>
      <button onClick={() => onPlay?.(playlist)} className="p-3 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-lg active:scale-95 shrink-0 ml-2">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </button>
    </motion.div>
  );
};
