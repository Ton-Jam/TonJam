import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  Flame, 
  Heart, 
  MessageSquare, 
  Play, 
  ChevronRight, 
  Filter, 
  Search,
  ShoppingCart,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { NFTItem, Track } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { getPlaceholderImage } from '@/lib/utils';
import { MOCK_TRACKS, TON_LOGO } from '@/constants';
import { Button } from "@/components/ui/button";

const TrendingNFTs: React.FC = () => {
  const navigate = useNavigate();
  const { allNFTs, allTracks, playTrack } = useAudio();
  const [displayCount, setDisplayCount] = useState(15);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Trending Logic: (Offers * 100) + (PlayCount * 5) + (Likes * 10) + recency weight
  const trendingNfts = useMemo(() => {
    return [...allNFTs]
      .filter(nft => nft.listingType) // Only listed ones
      .map(nft => {
        const track = allTracks.find(t => t.id === nft.trackId) || MOCK_TRACKS.find(t => t.id === nft.trackId);
        const playCount = track?.playCount || 0;
        const likes = track?.likes || 0;
        const offersCount = nft.offers?.length || 0;
        
        // Calculate a score
        const score = (offersCount * 50) + (playCount * 2) + (likes * 5);
        
        return { ...nft, trendingScore: score, track };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore);
  }, [allNFTs, allTracks]);

  const displayedNfts = useMemo(() => {
    return trendingNfts.slice(0, displayCount);
  }, [trendingNfts, displayCount]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < trendingNfts.length) {
          setDisplayCount(prev => prev + 15);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [trendingNfts.length, displayCount]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-32">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                  Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 italic">Artifacts</span>
                </h1>
              </div>
              <p className="text-xs text-muted-foreground font-medium max-w-xl uppercase tracking-wider">
                Most engaged sonic protocols across TON.
              </p>
            </div>
          </div>
        </header>

        {/* Stats Summary - Miniaturized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
          {[
            { label: 'Active Collectors', value: '42.8K', icon: Zap, color: 'text-blue-400' },
            { label: 'Market Velocity', value: '+12.4%', icon: Activity, color: 'text-emerald-400' },
            { label: 'Neural Heatweight', value: '8.4/10', icon: Flame, color: 'text-blue-400' },
            { label: 'Total Minted', value: '1.2M', icon: Clock, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-[2px] p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-3 h-3 ${stat.color}`} />
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-lg font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Infinite List - Flattened Display */}
        <div className="space-y-1">
          <AnimatePresence>
            {displayedNfts.map((nft, idx) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (idx % 15) * 0.03 }}
              >
                <div className="group flex flex-col md:flex-row items-center gap-4 py-3 px-4 hover:bg-white/[0.03] transition-colors overflow-hidden relative rounded-[2px]">
                  {/* Ranking & Status */}
                  <div className="flex flex-col items-center justify-center w-8 flex-shrink-0">
                    <span className={`text-xs font-black italic tracking-tighter ${idx < 3 ? 'text-blue-500' : 'text-white/20'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {idx < 10 && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Flame className={`w-3 h-3 mt-0.5 ${idx === 0 ? 'text-blue-500' : idx < 3 ? 'text-blue-400' : 'text-zinc-700'}`} />
                      </motion.div>
                    )}
                  </div>

                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img 
                      src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} 
                      alt={nft.title}
                      className="w-full h-full object-cover rounded-[2px]"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <div className="absolute top-0 left-0 bg-blue-600 text-[6px] font-black text-white px-1 py-0.5 uppercase tracking-tighter rounded-br-[2px] flex items-center gap-0.5">
                        <Flame className="w-1.5 h-1.5 fill-white" />
                        HOT
                      </div>
                    )}
                    <button 
                      onClick={() => playTrack(nft.track as any)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px]"
                    >
                      <Play className="w-5 h-5 text-white fill-white" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-blue-500/60">
                        {nft.edition} Edition
                      </span>
                    </div>
                    <h3 
                      className="text-sm font-black uppercase tracking-tight truncate cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => navigate(`/nft/${nft.id}`)}
                    >
                      {nft.title}
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      BY <span className="hover:text-white transition-colors" onClick={() => navigate(`/artist/${nft.artistId}`)}>{nft.creator}</span>
                    </p>
                  </div>

                  {/* Telemetry Data */}
                  <div className="hidden lg:flex items-center gap-8 mr-8">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Energy</p>
                      <p className="text-xs font-black text-white/60">{Math.floor(nft.trendingScore)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Bids</p>
                      <p className="text-xs font-black text-white/60">{nft.offers?.length || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Collection</p>
                      <p className="text-xs font-black text-white/60">GENESIS</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 opacity-40">
                        <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                        <span className="text-[8px] font-black text-white italic">TRENDING</span>
                        <span className="text-[8px] font-bold text-green-400 ml-0.5">+{Math.floor(Math.random() * 20) + 1}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5" />
                        <p className="text-base font-black text-white leading-none">{nft.price}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/nft/${nft.id}`)}
                      variant="ghost"
                      className="h-10 px-6 rounded-[2px] border border-white/10 hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      COLLECT
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading Indicator for Infinite Scroll */}
        {displayCount < trendingNfts.length && (
          <div ref={loaderRef} className="py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Decrypting more artifacts...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrendingNFTs;
