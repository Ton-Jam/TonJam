import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Crown, CheckCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAudio } from "@/contexts/AudioContext";
import { TON_LOGO, MOCK_ARTISTS } from "@/constants";
import { getPlaceholderImage } from "@/lib/utils";
import { Artist } from "@/types";

export const TrendingArtistsLeaderboardSection: React.FC = () => {
  const navigate = useNavigate();
  const { artists: globalArtists, followedUserIds, toggleFollowUser } = useAudio();
  const [trendingMetric, setTrendingMetric] = useState<'sales' | 'growth'>('sales');

  const getIsFollowing = (artId: string) => {
    if (!followedUserIds) return ["art-1", "art-4", "art-9"].includes(artId);
    if (followedUserIds.length === 0 && ["art-1", "art-4", "art-9"].includes(artId)) {
      return true;
    }
    return followedUserIds.includes(artId);
  };

  const toggleFollow = (artId: string) => {
    if (toggleFollowUser) {
      toggleFollowUser(artId);
    }
    confetti({
      particleCount: 15,
      spread: 30,
      origin: { y: 0.8 },
      colors: ["#00B4D8", "#2BE08C"]
    });
  };

  const rankedTrendingCreators = useMemo(() => {
    const baseArtists = globalArtists && globalArtists.length > 0 ? globalArtists : MOCK_ARTISTS;
    
    const enriched = baseArtists.map((artist) => {
      const nftSales = artist.earnings?.nftSales || Math.round((artist.followers * 0.015) + (artist.uid.charCodeAt(0) % 250));
      
      let hash = 0;
      for (let i = 0; i < artist.name.length; i++) {
        hash = artist.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const seed = Math.abs(hash);
      const growthPercent = (seed % 14) + 4.2;
      const followersGained = Math.round(artist.followers * (growthPercent / 100));
      
      return {
        ...artist,
        nftSales,
        growthPercent,
        followersGained,
      };
    });

    if (trendingMetric === 'sales') {
      return [...enriched].sort((a, b) => b.nftSales - a.nftSales).slice(0, 5);
    } else {
      return [...enriched].sort((a, b) => b.followersGained - a.followersGained).slice(0, 5);
    }
  }, [globalArtists, trendingMetric]);

  return (
    <section className="space-y-4 text-left w-full">
      <div className="flex flex-col gap-3 px-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              Trending Artists Leaderboard
            </h2>
          </div>
          <button 
            onClick={() => navigate("/explore/artists?title=Trending+Artists&filter=rising")} 
            className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
          >
            More <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Metric Toggle Buttons */}
        <div className="flex bg-white/[0.04] p-1 rounded-xl w-full">
          <button
            onClick={() => setTrendingMetric('sales')}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-lg transition-all cursor-pointer border-none outline-none ${
              trendingMetric === 'sales'
                ? "bg-primary text-black"
                : "text-zinc-400 hover:text-white bg-transparent"
            }`}
          >
            NFT Sales Volume
          </button>
          <button
            onClick={() => setTrendingMetric('growth')}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-lg transition-all cursor-pointer border-none outline-none ${
              trendingMetric === 'growth'
                ? "bg-primary text-black"
                : "text-zinc-400 hover:text-white bg-transparent"
            }`}
          >
            Follower Growth
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {rankedTrendingCreators.map((artist, idx) => {
            const rank = idx + 1;
            const isFollowing = getIsFollowing(artist.uid);

            return (
              <motion.div
                key={`${artist.uid}-${trendingMetric}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/artist/${artist.uid}`)}
                className="group flex items-center justify-between py-2.5 px-2 bg-transparent hover:bg-white/[0.03] transition-all duration-200 rounded-xl cursor-pointer"
              >
                {/* Left: Rank, Avatar, Name & Handle */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                      <img 
                        src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
                        alt={artist.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = getPlaceholderImage(`artist-${artist.uid}`); }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {artist.isVerifiedArtist && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
                        <CheckCircle className="h-2.5 w-2.5 text-black fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 text-left">
                    <h4 className="text-[12px] font-black text-white group-hover:text-primary transition-colors truncate">
                      {artist.name}
                    </h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                      {artist.genre || 'Creator'}
                    </p>
                  </div>
                </div>

                {/* Right: Metric Value & Action */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 text-right">
                  <div className="flex flex-col items-end justify-center min-w-[70px]">
                    {trendingMetric === 'sales' ? (
                      <div className="flex items-center gap-1 text-[11px] font-black text-white font-mono">
                        <img src={TON_LOGO} alt="TON" className="h-3 w-3 saturate-100 object-contain inline" />
                        <span>{artist.nftSales.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400 font-mono">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span>+{artist.followersGained.toLocaleString()}</span>
                      </div>
                    )}
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">
                      {trendingMetric === 'sales' ? 'TON Sales' : `${artist.growthPercent.toFixed(1)}% Growth`}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(artist.uid);
                    }}
                    className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer border-none outline-none ${
                      isFollowing
                        ? "bg-white/10 text-white hover:bg-white/15"
                        : "bg-primary text-black hover:bg-primary/90"
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TrendingArtistsLeaderboardSection;
