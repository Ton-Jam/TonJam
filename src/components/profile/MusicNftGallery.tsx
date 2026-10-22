import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gem, Search, SlidersHorizontal, Play, Sparkles, 
  Disc, Layers, Filter, Zap, ArrowUpDown, Volume2
} from 'lucide-react';
import { NFTItem, Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { MusicNftCard } from './MusicNftCard';
import { useNftColorPalette } from '@/hooks/useNftColorPalette';

interface MusicNftGalleryProps {
  nfts: NFTItem[];
  isOwnProfile?: boolean;
  userName?: string;
  className?: string;
}

export const MusicNftGallery: React.FC<MusicNftGalleryProps> = ({
  nfts = [],
  isOwnProfile = false,
  userName = 'Collector',
  className = '',
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, playAll, allTracks } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<'all' | 'rare' | 'stems' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-desc' | 'price-asc' | 'title'>('newest');
  const [hoveredNft, setHoveredNft] = useState<NFTItem | null>(null);

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (nft) =>
          nft.title?.toLowerCase().includes(q) ||
          nft.artist?.toLowerCase().includes(q) ||
          nft.creator?.toLowerCase().includes(q)
      );
    }

    // Rarity / filter
    if (filterRarity === 'rare') {
      result = result.filter((nft) => {
        const r = (nft.rarity || '').toLowerCase();
        return r.includes('rare') || r.includes('epic') || r.includes('legendary') || r.includes('mythic');
      });
    } else if (filterRarity === 'legendary') {
      result = result.filter((nft) => {
        const r = (nft.rarity || '').toLowerCase();
        return r.includes('legendary') || r.includes('mythic');
      });
    } else if (filterRarity === 'stems') {
      result = result.filter((nft) => nft.stems_available);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-desc') {
        const pA = parseFloat(a.price || '0');
        const pB = parseFloat(b.price || '0');
        return pB - pA;
      }
      if (sortBy === 'price-asc') {
        const pA = parseFloat(a.price || '0');
        const pB = parseFloat(b.price || '0');
        return pA - pB;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0; // Default order
    });

    return result;
  }, [nfts, searchQuery, filterRarity, sortBy]);

  // Play all purchased NFTs through global player
  const handlePlayAll = () => {
    if (filteredNFTs.length === 0) return;

    const tracksToPlay: Track[] = filteredNFTs.map((nft) => {
      const matched = allTracks.find((t) => t.id === nft.trackId || t.songId === nft.trackId);
      return {
        id: nft.id,
        songId: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator || 'TonJam Artist',
        artistId: nft.artistId || '',
        audioUrl:
          nft.audioUrl ||
          matched?.audioUrl ||
          'https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3',
        coverUrl: nft.imageUrl || nft.coverUrl || '',
        duration: 210,
        isNFT: true,
        nftId: nft.id,
        price: nft.price || '2.5',
        genre: 'Electronic',
        rarity: nft.rarity || 'Rare',
      } as Track;
    });

    playAll(tracksToPlay);
  };

  // Currently viewed NFT: actively hovered, currently playing track, or featured first NFT
  const currentlyViewedNft = useMemo(() => {
    if (hoveredNft) return hoveredNft;
    if (currentTrack?.isNFT) {
      const match = nfts.find(
        (n) => n.id === currentTrack.id || n.trackId === currentTrack.id || n.trackId === currentTrack.songId
      );
      if (match) return match;
    }
    return filteredNFTs[0] || nfts[0] || null;
  }, [hoveredNft, currentTrack, nfts, filteredNFTs]);

  const { primaryColor, secondaryColor, accentColor, radialGradient } = useNftColorPalette(currentlyViewedNft);

  return (
    <div className={`relative w-full space-y-6 rounded-3xl p-1 transition-all duration-1000 ease-out ${className}`}>
      {/* Seamless Shifting Ambient Backdrop based on viewed music NFT (Zero border lines) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
        {/* Shifting radial ambient spotlight */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[480px] rounded-full blur-[140px] transition-all duration-1000 ease-out"
          style={{
            backgroundColor: primaryColor,
            opacity: 0.18,
          }}
        />
        {/* Secondary ambient aura */}
        <div
          className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full blur-[150px] transition-all duration-1000 ease-out"
          style={{
            backgroundColor: secondaryColor,
            opacity: 0.12,
          }}
        />
        {/* Bottom accent glow */}
        <div
          className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-1000 ease-out"
          style={{
            backgroundColor: accentColor,
            opacity: 0.10,
          }}
        />
        {/* Gradient backdrop mesh */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            background: radialGradient,
          }}
        />
      </div>

      {/* 1. Header Toolbar with Filter, Search, and Action Buttons (No border lines) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#090F26] shadow-xl shadow-black/30 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              Music NFT Gallery
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10">
                {filteredNFTs.length}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Hover over any album art for quick D3 waveform preview and scrub</span>
          </p>
        </div>

        {/* Action Controls: Search, Filters, Play All */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[210px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter collection..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl">
            <button
              onClick={() => setFilterRarity('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black transition-all cursor-pointer ${
                filterRarity === 'all'
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRarity('stems')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black transition-all cursor-pointer ${
                filterRarity === 'stems'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Stems
            </button>
            <button
              onClick={() => setFilterRarity('rare')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black transition-all cursor-pointer ${
                filterRarity === 'rare'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Rare
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs text-slate-300 focus:outline-none transition-all cursor-pointer shadow-inner"
          >
            <option value="newest" className="bg-[#090F26] text-white">Latest Added</option>
            <option value="price-desc" className="bg-[#090F26] text-white">Price: High to Low</option>
            <option value="price-asc" className="bg-[#090F26] text-white">Price: Low to High</option>
            <option value="title" className="bg-[#090F26] text-white">Title (A-Z)</option>
          </select>

          {/* Play All Button */}
          {filteredNFTs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Responsive Grid of Purchased Music NFTs with D3 Hover Previews */}
      {filteredNFTs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredNFTs.map((nft) => {
            const isPlayingThisNFT =
              isPlaying && (currentTrack?.id === nft.id || currentTrack?.songId === nft.trackId);

            return (
              <MusicNftCard
                key={nft.id}
                nft={nft}
                isCurrentlyPlayingGlobal={isPlayingThisNFT}
                onHoverNft={setHoveredNft}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#090F26] text-center flex flex-col items-center justify-center space-y-4 shadow-xl shadow-black/30">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Disc className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-base font-black text-white uppercase tracking-wider">
              {searchQuery ? 'No Matching Music NFTs' : 'No Purchased Music NFTs Yet'}
            </h4>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? 'Try adjusting your search terms or filter tags to discover other collectible tracks.'
                : `${userName} hasn't collected any music NFTs on TON yet. Explore new drops to build your on-chain discography.`}
            </p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-2.5 rounded-full bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            Explore Music Marketplace
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicNftGallery;
