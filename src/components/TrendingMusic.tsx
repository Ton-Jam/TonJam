import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Flame, 
  TrendingUp, 
  Disc, 
  Zap, 
  ChevronRight,
  CheckCircle2,
  Headphones
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { Track, NFTItem } from '@/types';
import { TON_LOGO } from '@/constants';

interface TrendingTrackItem extends Track {
  rank: number;
  activityScore: number;
  realtimePlayCount: number;
  matchedNFT?: NFTItem;
  nftPriceDisplay?: string;
}

interface TrendingMusicProps {
  className?: string;
  onTrackSelect?: (track: Track) => void;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const formatPlayCount = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return count.toLocaleString();
};

export const TrendingMusic: React.FC<TrendingMusicProps> = ({
  className = '',
  onTrackSelect,
  title = 'Trending Music',
  limit = 5,
}) => {
  const navigate = useNavigate();
  const { allTracks = [], currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { nfts = [], getNFTByTrackId } = useNFT();

  const topTracks: TrendingTrackItem[] = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];

    const scoredTracks: TrendingTrackItem[] = allTracks.map((track, index) => {
      const matchedNFT = getNFTByTrackId?.(track.id) || nfts.find(
        (n) => n.trackId === track.id || (n.title && track.title && n.title.toLowerCase() === track.title.toLowerCase())
      );

      const nftViews = Number(matchedNFT?.views || 0);
      const basePlays = Number(track.playCount || track.streams || 0);
      const realtimePlayCount = basePlays + nftViews;
      const likesScore = Number(track.likes || 0) * 5;
      const activityScore = realtimePlayCount + likesScore + (matchedNFT ? 10 : 0);

      const nftPriceDisplay = matchedNFT?.price || track.nftPrice || undefined;

      return {
        ...track,
        rank: index + 1,
        activityScore,
        realtimePlayCount,
        matchedNFT,
        nftPriceDisplay,
      };
    });

    return scoredTracks
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, limit)
      .map((track, idx) => ({ ...track, rank: idx + 1 }));
  }, [allTracks, nfts, getNFTByTrackId, limit]);

  if (topTracks.length === 0) return null;

  const handleTrackClick = (track: TrendingTrackItem) => {
    if (onTrackSelect) {
      onTrackSelect(track);
      return;
    }

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20';
      case 2:
        return 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 shadow-lg shadow-slate-300/20';
      case 3:
        return 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 shadow-lg shadow-amber-800/20';
      default:
        return 'bg-[#151D45] text-slate-300';
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5B6BFF]/15 text-[#5B6BFF]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-white">
              {title}
            </h2>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              <Zap className="w-3 h-3" />
              Live Activity
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/explore/nfts?title=Trending+Music&filter=trending')}
          className="text-xs font-bold text-[#5B6BFF] hover:text-[#7A88FF] transition-colors flex items-center gap-0.5 outline-none cursor-pointer bg-transparent"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Tracks List */}
      <div className="space-y-2.5">
        {topTracks.map((track) => {
          const isCurrentActive = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isCurrentActive && isPlaying;

          return (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleTrackClick(track)}
              className={`group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                isCurrentActive 
                  ? 'bg-gradient-to-r from-[#182357] via-[#151D48] to-[#0D1537] shadow-xl shadow-[#5B6BFF]/10' 
                  : 'bg-[#0B112C]/80 hover:bg-[#11193D]'
              }`}
            >
              {/* Left Column: Rank + Artwork + Metadata */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Rank Badge */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${getRankBadgeStyle(track.rank)}`}>
                  {track.rank === 1 ? (
                    <Flame className="w-4 h-4 fill-current" />
                  ) : (
                    <span>{track.rank}</span>
                  )}
                </div>

                {/* Track Artwork with Play Overlay */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-md">
                  {track.coverUrl && (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  
                  {/* Play / Equalizer Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                    isCurrentActive ? 'bg-black/50' : 'bg-black/30 group-hover:bg-black/50'
                  }`}>
                    {isCurrentlyPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-[#5B6BFF] rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] h-3/4" />
                        <span className="w-1 bg-[#5B6BFF] rounded-full animate-bounce h-1/2" />
                      </div>
                    ) : (
                      <Play className={`w-4 h-4 text-white fill-white transition-transform duration-200 ${
                        isCurrentActive ? 'scale-110' : 'opacity-80 group-hover:scale-110 group-hover:opacity-100'
                      }`} />
                    )}
                  </div>
                </div>

                {/* Title & Artist Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className={`text-sm font-bold truncate leading-tight transition-colors ${
                      isCurrentActive ? 'text-[#5B6BFF]' : 'text-white group-hover:text-slate-100'
                    }`}>
                      {track.title}
                    </h3>
                    {track.isNFT && (
                      <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-[#5B6BFF]/20 text-[#7A88FF] shrink-0">
                        NFT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span className="truncate flex items-center gap-1 font-medium">
                      {track.artist}
                      {track.artistVerified && (
                        <CheckCircle2 className="w-3 h-3 text-[#5B6BFF] shrink-0 inline" />
                      )}
                    </span>
                    <span className="text-slate-600 font-bold">•</span>
                    
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-[#162046] px-1.5 py-0.5 rounded-md shrink-0 shadow-sm">
                      <Headphones className="w-3 h-3 text-[#5B6BFF]" />
                      <span>{formatPlayCount(track.realtimePlayCount)} plays</span>
                    </span>

                    {track.genre && (
                      <>
                        <span className="text-slate-600 font-bold hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-500 shrink-0 font-medium hidden sm:inline">
                          {track.genre}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: NFT & Stream Activity Stats */}
              <div className="flex items-center gap-3 shrink-0 pl-2 text-right">
                <div className="space-y-0.5">
                  {track.nftPriceDisplay ? (
                    <div className="flex items-center justify-end gap-1">
                      <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5 object-contain" />
                      <span className="text-xs font-black text-white">
                        {track.nftPriceDisplay}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-300">
                      {formatPlayCount(track.realtimePlayCount)} plays
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-400">
                    <span>{Number(track.likes || 0).toLocaleString()} likes</span>
                  </div>
                </div>

                {/* Quick Action / Details */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.matchedNFT?.id) {
                      navigate(`/nft/${track.matchedNFT.id}`);
                    } else if (track.id) {
                      navigate(`/track/${track.id}`);
                    }
                  }}
                  className="w-8 h-8 rounded-xl bg-[#182352] hover:bg-[#5B6BFF] text-slate-300 hover:text-white transition-all flex items-center justify-center outline-none cursor-pointer"
                  title="View Track Details"
                >
                  <Disc className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingMusic;
