import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  Crown,
  ChevronRight,
  UserCheck,
  Users
} from 'lucide-react';
import { Artist } from '@/types';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getPlaceholderImage } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TrendingArtistLeaderboardProps {
  limit?: number;
  className?: string;
  artists?: Artist[];
}

export const TrendingArtistLeaderboard: React.FC<TrendingArtistLeaderboardProps> = ({
  limit = 5,
  className = '',
  artists: propArtists
}) => {
  const navigate = useNavigate();
  const { artists: contextArtists, allTracks } = useAudio();
  const [metricTab, setMetricTab] = useState<'plays' | 'nft-sales'>('plays');

  const sourceArtists = propArtists ?? contextArtists;

  const processedArtists = useMemo(() => {
    return (sourceArtists || []).map(artist => {
      const creatorTracks = allTracks.filter(t => t.artistId === artist.uid || t.artist === artist.name);
      const trackPlays = creatorTracks.reduce((sum, t) => sum + (t.playCount || t.streams || 0), 0);
      const currentPlays = trackPlays || artist.playCount || artist.monthlyListeners || 0;
      const currentSales = typeof artist.earnings === 'number'
        ? artist.earnings
        : (artist.earnings?.nftSales || 0);

      return {
        ...artist,
        currentPlays,
        currentSales,
        followersCount: artist.followers || 0,
      };
    });
  }, [sourceArtists, allTracks]);

  const rankedArtists = useMemo(() => {
    const list = [...processedArtists];
    if (metricTab === 'plays') {
      return list.sort((a, b) => b.currentPlays - a.currentPlays).slice(0, limit);
    }
    return list.sort((a, b) => b.currentSales - a.currentSales).slice(0, limit);
  }, [processedArtists, metricTab, limit]);

  const formatPlays = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const formatSales = (val: number) => {
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (rankedArtists.length === 0) {
    return null;
  }

  return (
    <div className={`w-full py-2 bg-transparent ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white">
              Vibe Velocity Leaderboard
            </h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Live stream & NFT volume rankings from Firestore
          </p>
        </div>

        <div className="flex bg-white/[0.03] p-1 rounded-full w-fit gap-2">
          <button
            type="button"
            onClick={() => setMetricTab('plays')}
            className={`rounded-full px-6 py-2 text-[10px] lowercase font-medium tracking-widest transition-all whitespace-nowrap cursor-pointer ${metricTab === 'plays' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Track Plays
          </button>
          <button
            type="button"
            onClick={() => setMetricTab('nft-sales')}
            className={`rounded-full px-6 py-2 text-[10px] lowercase font-medium tracking-widest transition-all whitespace-nowrap cursor-pointer ${metricTab === 'nft-sales' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Sales Volume
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {rankedArtists.map((artist, idx) => {
            const rank = idx + 1;

            return (
              <motion.div
                key={`${artist.uid}-${metricTab}`}
                layoutId={`row-${artist.uid}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="group flex items-center justify-between p-4 bg-white/[0.015] hover:bg-white/[0.045] transition-all duration-300 rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-6 flex-shrink-0 flex items-center justify-center font-mono">
                    {rank === 1 ? (
                      <Crown className="h-4.5 w-4.5 text-yellow-500" />
                    ) : (
                      <span className="text-xs font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {rank}
                      </span>
                    )}
                  </div>

                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-none shadow-md">
                      <AvatarImage 
                        src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
                        className="object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="bg-zinc-800 text-white font-extrabold text-xs rounded-full">
                        {artist.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {artist.isVerifiedArtist && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-md">
                        <UserCheck className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-blue-400 transition-all font-display truncate">
                      {artist.name}
                    </h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                      {artist.genre || 'Sound Architect'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-right flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-zinc-300 metric">
                      <Users className="h-3 w-3 text-blue-400" />
                      {artist.followersCount.toLocaleString()}
                    </div>
                    <p className="text-[7.5px] font-bold text-zinc-600 uppercase tracking-widest">
                      Followers
                    </p>
                  </div>

                  <div className="min-w-[65px] flex flex-col items-end justify-center">
                    <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1 metric">
                      {metricTab === 'plays' ? (
                        <>
                          <Play className="h-3 w-3 text-blue-500 fill-current opacity-70" />
                          {formatPlays(artist.currentPlays)}
                        </>
                      ) : (
                        <>
                          <img src={TON_LOGO} alt="TON" className="h-3 w-3 saturate-100 inline" />
                          {formatSales(artist.currentSales)}
                        </>
                      )}
                    </span>
                    <p className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">
                      {metricTab === 'plays' ? 'Plays' : 'Volume'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pt-4 flex justify-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/discover')}
          className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white transition-all gap-2 cursor-pointer h-10 px-6 rounded-full"
        >
          <span>Explore Artists</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TrendingArtistLeaderboard;
