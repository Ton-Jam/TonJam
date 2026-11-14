import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Crown, CheckCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAudio } from "@/contexts/AudioContext";
import { TON_LOGO } from "@/constants";
import { getPlaceholderImage } from "@/lib/utils";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";

export const TrendingArtistsLeaderboardSection: React.FC = () => {
  const navigate = useNavigate();
  const { artists: globalArtists, followedUserIds, toggleFollowUser } = useAudio();
  const [trendingMetric, setTrendingMetric] = useState<'sales' | 'followers'>('sales');

  const getIsFollowing = (artId: string) => {
    return Array.isArray(followedUserIds) && followedUserIds.includes(artId);
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
    if (!globalArtists || globalArtists.length === 0) return [];

    const enriched = globalArtists.map((artist) => {
      const nftSales = typeof artist.earnings === 'number'
        ? artist.earnings
        : (artist.earnings?.nftSales || 0);
      const followersCount = artist.followers || 0;

      return {
        ...artist,
        nftSales,
        followersCount,
      };
    });

    if (trendingMetric === 'sales') {
      return [...enriched].sort((a, b) => b.nftSales - a.nftSales).slice(0, 5);
    }
    return [...enriched].sort((a, b) => b.followersCount - a.followersCount).slice(0, 5);
  }, [globalArtists, trendingMetric]);

  if (rankedTrendingCreators.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 text-left w-full">
      <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
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
        
        <div className="flex bg-white/[0.04] p-1 rounded-xl w-full gap-1">
          <button
            onClick={() => setTrendingMetric('sales')}
            aria-pressed={trendingMetric === 'sales'}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer outline-none border ${
              trendingMetric === 'sales'
                ? "bg-primary text-black border-[#c0c0c0]/40"
                : "text-zinc-400 hover:text-white bg-transparent border-[#c0c0c0]/25"
            }`}
          >
            NFT Sales Volume
          </button>
          <button
            onClick={() => setTrendingMetric('followers')}
            aria-pressed={trendingMetric === 'followers'}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer outline-none border ${
              trendingMetric === 'followers'
                ? "bg-primary text-black border-[#c0c0c0]/40"
                : "text-zinc-400 hover:text-white bg-transparent border-[#c0c0c0]/25"
            }`}
          >
            Followers
          </button>
        </div>
      </div>

      <div className="space-y-1 px-4 sm:px-6 lg:px-8 w-full">
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
                      <LazyArtworkImage 
                        src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} 
                        fallbackSrc={getPlaceholderImage(`artist-${artist.uid}`)}
                        alt={artist.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {artist.isVerifiedArtist && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
                        <CheckCircle className="h-2.5 w-2.5 text-black fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 text-left">
                    <h4 className="text-[12px] font-semibold text-white group-hover:text-primary transition-colors truncate">
                      {artist.name}
                    </h4>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest truncate">
                      {artist.genre || 'Creator'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 text-right">
                  <div className="flex flex-col items-end justify-center min-w-[70px]">
                    {trendingMetric === 'sales' ? (
                      <div className="flex items-center gap-1 text-[11px] font-black text-white font-mono">
                        <img src={TON_LOGO} alt="TON" className="h-3 w-3 saturate-100 object-contain inline" />
                        <span>{artist.nftSales.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400 font-mono">
                        <Users className="h-3 w-3 text-emerald-400" />
                        <span>{artist.followersCount.toLocaleString()}</span>
                      </div>
                    )}
                    <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">
                      {trendingMetric === 'sales' ? 'TON Sales' : 'Followers'}
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
