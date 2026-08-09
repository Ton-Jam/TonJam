import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Play, 
  Pause, 
  Flame, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  Disc, 
  ArrowUpRight, 
  BarChart3, 
  Layers, 
  Zap, 
  CheckCircle,
  Crown,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '@/contexts/AudioContext';
import { useNFT } from '@/contexts/NFTContext';
import { TON_LOGO, MOCK_TRACKS } from '@/constants';
import { Track, NFTItem } from '@/types';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface TopCollection {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  floorPrice: string;
  volume24h: string;
  growth: number;
  mintedCount: number;
  totalLimit: number;
  verified?: boolean;
}

export const TrendingMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks, currentTrack, isPlaying, playTrack } = useAudio();
  const { nfts } = useNFT();

  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'collections'>('all');
  const [liveVolumeCounter, setLiveVolumeCounter] = useState(148290);

  // Real-time live volume ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVolumeCounter((prev) => prev + Math.floor(Math.random() * 15) + 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute Most Popular Tracks from NFT marketplace & track playback metrics
  const popularTracks = useMemo(() => {
    const sourceTracks = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    
    return sourceTracks.slice(0, 10).map((track, index) => {
      // Find matching NFT if available in NFT Context
      const matchingNFT = nfts?.find((n) => n.trackId === track.id || n.title.toLowerCase() === track.title.toLowerCase());
      
      const price = matchingNFT?.price || track.nftPrice || `${(1.5 + (index * 0.8)).toFixed(1)} TON`;
      const volume = matchingNFT ? (parseFloat(matchingNFT.price) * 120 + 450) : (1200 + (index * 340));
      const salesCount = 45 + (index * 18);
      const isHot = index < 3;

      return {
        ...track,
        nftPrice: price,
        nftVolume: volume,
        salesCount,
        isHot,
        nftId: matchingNFT?.id || track.nftId || `nft-popular-${track.id}`
      };
    });
  }, [allTracks, nfts]);

  // Top-selling NFT collections derived from marketplace data & curated entries
  const topCollections: TopCollection[] = useMemo(() => {
    return [
      {
        id: 'col-genesis',
        name: 'Genesis Beats Vol. 1',
        artist: 'DJ Krupy',
        coverUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20genesis%20beats%20neon%20orange?width=300&height=300&nologo=true',
        floorPrice: '12.5 TON',
        volume24h: '480 TON',
        growth: 24.5,
        mintedCount: 420,
        totalLimit: 500,
        verified: true,
      },
      {
        id: 'col-neon',
        name: 'Neon Nights Dubstep',
        artist: 'Byte Beat',
        coverUrl: 'https://image.pollinations.ai/prompt/dubstep%20music%20album%20cover%20neon%20green%20laser%20retro?width=300&height=300&nologo=true',
        floorPrice: '4.8 TON',
        volume24h: '210 TON',
        growth: 12.8,
        mintedCount: 280,
        totalLimit: 300,
        verified: true,
      },
      {
        id: 'col-abyssal',
        name: 'Deep Abyssal Audio',
        artist: 'Echo Phase',
        coverUrl: 'https://image.pollinations.ai/prompt/deep%20underwater%20abyss%20glowing%20ocean%20album%20art?width=300&height=300&nologo=true',
        floorPrice: '8.0 TON',
        volume24h: '195 TON',
        growth: 8.4,
        mintedCount: 95,
        totalLimit: 120,
        verified: false,
      },
      {
        id: 'col-velvet',
        name: 'Dreamweaver Velvet',
        artist: 'Luna Ray',
        coverUrl: 'https://image.pollinations.ai/prompt/dreamy%20pink%20clouds%20golden%20moon%20synthesizer%20art?width=300&height=300&nologo=true',
        floorPrice: '15.0 TON',
        volume24h: '610 TON',
        growth: 31.2,
        mintedCount: 245,
        totalLimit: 250,
        verified: true,
      },
      {
        id: 'col-amapiano',
        name: 'Decentralized Amapiano',
        artist: 'Major Sound',
        coverUrl: 'https://image.pollinations.ai/prompt/african%20tribal%20future%20amapiano%20gold%20pattern%20cover?width=300&height=300&nologo=true',
        floorPrice: '9.5 TON',
        volume24h: '340 TON',
        growth: 19.0,
        mintedCount: 88,
        totalLimit: 100,
        verified: true,
      },
      {
        id: 'col-cyberpunk',
        name: 'Cyber Punk Rap Vault',
        artist: 'Lil Crypto',
        coverUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20rapper%20gold%20teeth%20hologram%20neon%20art?width=300&height=300&nologo=true',
        floorPrice: '24.0 TON',
        volume24h: '890 TON',
        growth: 42.1,
        mintedCount: 48,
        totalLimit: 50,
        verified: true,
      }
    ];
  }, []);

  const handleBuyNFTClick = (e: React.MouseEvent, trackTitle: string, price: string) => {
    e.stopPropagation();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    toast.success(`Redirecting to Marketplace`, {
      description: `Viewing NFT listing for "${trackTitle}" (${price})`
    });
    navigate('/marketplace');
  };

  return (
    <div className="space-y-5 text-left my-2">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-0.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              <Activity className="w-3 h-3 animate-pulse" /> Marketplace Live Data
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold">
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              {liveVolumeCounter.toLocaleString()} TON Vol
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            Trending Music
          </h2>
          <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
            Top popular audio artifacts & top-selling collections on TON Protocol
          </p>
        </div>

        {/* Tab Selector Buttons without border lines */}
        <div className="flex bg-[#0A113A]/60 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none outline-none ${
              activeTab === 'all'
                ? 'bg-primary text-background shadow-md'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            All Trending
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none outline-none ${
              activeTab === 'tracks'
                ? 'bg-primary text-background shadow-md'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            Popular Tracks
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none outline-none ${
              activeTab === 'collections'
                ? 'bg-primary text-background shadow-md'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            Top Collections
          </button>
        </div>
      </div>

      {/* 1. MOST POPULAR TRACKS (Scrollable Horizontal List) */}
      {(activeTab === 'all' || activeTab === 'tracks') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">
                Most Popular Music NFTs
              </h3>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 cursor-pointer border-none bg-transparent outline-none"
            >
              Explore All Marketplace <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {popularTracks.map((track, idx) => {
              const rank = idx + 1;
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="w-[180px] shrink-0 bg-[#0A113A]/60 hover:bg-[#121B4C]/80 backdrop-blur-md p-3 rounded-2xl space-y-2.5 transition-all shadow-md group relative cursor-pointer"
                  onClick={() => playTrack(track)}
                >
                  {/* Image & Overlay Rank Badge */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40">
                    <img
                      src={track.coverUrl || (track as any).imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-black text-white">
                      {rank === 1 ? (
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ) : (
                        <span className="text-amber-400">#{rank}</span>
                      )}
                    </div>

                    {/* Hot Badge */}
                    {track.isHot && (
                      <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                        HOT
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                        className="w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer border-none outline-none"
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-black text-white truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[10px] font-medium text-zinc-400 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* NFT Price & Volume Stats */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-black text-amber-400">
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3 object-contain" />
                      <span>{track.nftPrice}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">
                      {track.salesCount} sold
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => handleBuyNFTClick(e, track.title, track.nftPrice || '1.5 TON')}
                    className="w-full py-1.5 bg-white/5 hover:bg-primary hover:text-background text-zinc-200 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none outline-none mt-1"
                  >
                    <ShoppingBag className="w-3 h-3" /> Buy NFT
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TOP-SELLING COLLECTIONS (Scrollable Horizontal List) */}
      {(activeTab === 'all' || activeTab === 'collections') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">
                Top-Selling NFT Collections
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Volume Leaders
            </span>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto no-scrollbar pb-3 px-4">
            {topCollections.map((col) => (
              <motion.div
                key={col.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate('/marketplace')}
                className="w-[220px] shrink-0 bg-[#0A113A]/60 hover:bg-[#121B4C]/80 backdrop-blur-md p-3.5 rounded-2xl space-y-3 transition-all shadow-md group relative cursor-pointer"
              >
                {/* Collection Cover Image */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40">
                  <img
                    src={col.coverUrl}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Growth Badge */}
                  <div className="absolute top-2 right-2 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{col.growth}%
                  </div>

                  {/* Artist Tag */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-black text-white truncate drop-shadow-md">
                      {col.artist}
                    </span>
                    {col.verified && (
                      <CheckCircle className="w-3 h-3 text-blue-400 fill-current shrink-0" />
                    )}
                  </div>
                </div>

                {/* Collection Title & Mint Stats */}
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white truncate group-hover:text-primary transition-colors">
                    {col.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                    <span>Minted</span>
                    <span className="font-mono text-zinc-300 font-bold">
                      {col.mintedCount} / {col.totalLimit}
                    </span>
                  </div>
                </div>

                {/* Floor Price & 24h Volume */}
                <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Floor Price
                    </span>
                    <span className="font-mono font-black text-amber-400 flex items-center gap-0.5">
                      <img src={TON_LOGO} alt="TON" className="w-2.5 h-2.5 object-contain" />
                      {col.floorPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">
                      24h Vol
                    </span>
                    <span className="font-mono font-bold text-zinc-200">
                      {col.volume24h}
                    </span>
                  </div>
                </div>

                {/* Explore Collection Action */}
                <div className="flex items-center justify-between text-[10px] font-black text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>View Collection</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingMusicSection;
