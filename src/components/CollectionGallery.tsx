import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Volume2, Sparkles, Gem, BadgeCheck, Disc, 
  Search, Filter, ArrowUpDown, ExternalLink, Share2, Heart, 
  Layers, Flame, Check, ShieldCheck, Music, RefreshCw
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
import { NFTItem, Track } from '@/types';
import { getMusicNftRarity } from '@/lib/nftRarity';

// Default mock collection if none provided
const MOCK_USER_GALLERY_NFTS: NFTItem[] = [
  {
    id: 'gallery-nft-1',
    trackId: 'track-gen-1',
    title: 'TonJam Genesis Pass #001',
    owner: 'You (krusherkrupy@gmail.com)',
    creator: 'DJ Krupy',
    artist: 'DJ Krupy',
    price: '25.0',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    edition: '#001 / 250',
    supply: 250,
    minted: 1,
    artistVerified: true,
    description: 'First edition of the Genesis Master Anthem with embedded lossless stem rights and VIP backstage pass.',
    traits: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Audio Quality', value: 'FLAC 24-bit 96kHz' },
      { trait_type: 'Utility', value: 'VIP Staking 2.5x' }
    ]
  },
  {
    id: 'gallery-nft-2',
    trackId: 'track-cyb-2',
    title: 'Neural Beat Matrix #012',
    owner: 'You (krusherkrupy@gmail.com)',
    creator: 'ElectroX Lab',
    artist: 'ElectroX',
    price: '15.0',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    edition: '#012 / 100',
    supply: 100,
    minted: 12,
    artistVerified: true,
    description: 'Glitch hop beats crafted for festival sound systems with interactive visualizer tokens.',
    traits: [
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Genre', value: 'Glitch Hop' },
      { trait_type: 'BPM', value: 128 }
    ]
  },
  {
    id: 'gallery-nft-3',
    trackId: 'track-abs-1',
    title: 'Binaural Drift Artifact #005',
    owner: 'You (krusherkrupy@gmail.com)',
    creator: 'Luna Vibes',
    artist: 'Luna Vibes',
    price: '8.5',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    edition: '#005 / 075',
    supply: 75,
    minted: 5,
    artistVerified: false,
    description: 'Relaxing binaural beat designed for focus and deep work sessions with 432Hz tuning.',
    traits: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Frequency', value: '432 Hz' }
    ]
  },
  {
    id: 'gallery-nft-4',
    trackId: 'track-gen-4',
    title: 'Sonic Quantum Echo #088',
    owner: 'You (krusherkrupy@gmail.com)',
    creator: 'DJ Krupy',
    artist: 'DJ Krupy',
    price: '35.0',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    edition: '#088 / 250',
    supply: 250,
    minted: 88,
    artistVerified: true,
    description: 'Ultra rare quantum echo frequency composition with 1% perpetual revenue share.',
    traits: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'BPM', value: 140 }
    ]
  }
];

export interface CollectionGalleryProps {
  userId?: string;
  items?: NFTItem[];
  title?: string;
  subtitle?: string;
  onNftClick?: (nft: NFTItem) => void;
  className?: string;
}

export const CollectionGallery: React.FC<CollectionGalleryProps> = ({
  items,
  title = "Music NFT Collection Gallery",
  subtitle = "Explore verified audio NFTs, lossless master stems, and decentralized digital vinyls",
  onNftClick,
  className = ""
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // State
  const [galleryItems, setGalleryItems] = useState<NFTItem[]>(items || MOCK_USER_GALLERY_NFTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rarity'>('newest');
  const [hoveredNftId, setHoveredNftId] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);

  // Audio preview element for hover-to-play
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoverAudioPlayingId, setHoverAudioPlayingId] = useState<string | null>(null);

  // Update items if prop changes
  useEffect(() => {
    if (items) {
      setGalleryItems(items);
    }
  }, [items]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle hover-to-play audio preview
  const handleMouseEnterCard = (nft: NFTItem) => {
    setHoveredNftId(nft.id);

    // Debounce hover play slightly (150ms) so rapid scrolling doesn't trigger audio spam
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (nft.audioUrl) {
        if (!audioPreviewRef.current) {
          audioPreviewRef.current = new Audio();
          audioPreviewRef.current.volume = 0.6;
        }

        // If audio isn't already playing this NFT preview
        if (hoverAudioPlayingId !== nft.id) {
          audioPreviewRef.current.src = nft.audioUrl;
          audioPreviewRef.current.currentTime = 0;
          audioPreviewRef.current.play().then(() => {
            setHoverAudioPlayingId(nft.id);
          }).catch(() => {
            // Autoplay policy fallback
          });
        }
      }
    }, 200);
  };

  const handleMouseLeaveCard = () => {
    setHoveredNftId(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setHoverAudioPlayingId(null);
    }
  };

  // Filter & sort logic
  const filteredItems = useMemo(() => {
    let result = [...galleryItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.artist && item.artist.toLowerCase().includes(q)) ||
        (item.creator && item.creator.toLowerCase().includes(q)) ||
        item.edition.toLowerCase().includes(q)
      );
    }

    if (rarityFilter !== 'all') {
      result = result.filter(item => {
        const rarityTrait = item.traits?.find(t => t.trait_type.toLowerCase() === 'rarity');
        return rarityTrait && String(rarityTrait.value).toLowerCase() === rarityFilter.toLowerCase();
      });
    }

    result.sort((a, b) => {
      const priceA = parseFloat(a.price || '0');
      const priceB = parseFloat(b.price || '0');
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return 0;
    });

    return result;
  }, [galleryItems, searchQuery, rarityFilter, sortBy]);

  // Handle Full Track Play in AudioContext
  const handlePlayFullTrack = (item: NFTItem, e: React.MouseEvent) => {
    e.stopPropagation();

    // Stop hover audio preview
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setHoverAudioPlayingId(null);
    }

    const trackObj: Track = {
      id: item.id,
      songId: item.trackId || item.id,
      title: item.title,
      artist: item.artist || item.creator || 'TonJam Artist',
      coverUrl: item.imageUrl,
      audioUrl: item.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 210,
      genre: 'Music NFT',
      isNFT: true,
      nftPrice: item.price,
      artistId: item.artistId || 'dj-krupy',
      createdAt: Date.now()
    };

    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      playTrack(trackObj);
      toast.success(`Playing full track: ${item.title}`);
    }
  };

  const getRarityBadgeColor = (rarityVal?: string) => {
    const r = (rarityVal || '').toLowerCase();
    if (r === 'legendary') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (r === 'epic') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (r === 'rare') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full space-y-6 ${className}`}
    >
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Gem className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              NFT Collection Gallery
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {subtitle}
          </p>
        </div>

        <button
          onClick={() => navigate('/collections')}
          className="self-start md:self-end inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
        >
          <Disc className="w-3.5 h-3.5 text-cyan-400" />
          <span>Browse All Collections</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e163d]/50 p-3 rounded-2xl border border-white/5">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, artist, edition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050A24] text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#050A24] p-1 rounded-xl">
            {['all', 'Legendary', 'Epic', 'Rare'].map((rarity) => (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  rarityFilter === rarity
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#050A24] text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer border border-white/5"
          >
            <option value="newest" className="bg-[#0e163d]">Newest Added</option>
            <option value="price-asc" className="bg-[#0e163d]">Price: Low to High</option>
            <option value="price-desc" className="bg-[#0e163d]">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((nft, index) => {
          const isHovered = hoveredNftId === nft.id;
          const isAudioPreviewing = hoverAudioPlayingId === nft.id;
          const isFullTrackPlaying = currentTrack?.id === nft.id && isPlaying;
          const rarityMeta = getMusicNftRarity(nft);

          return (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ 
                duration: 0.45, 
                delay: Math.min((index % 4) * 0.08, 0.32), 
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => handleMouseEnterCard(nft)}
              onMouseLeave={handleMouseLeaveCard}
              onClick={() => {
                if (onNftClick) onNftClick(nft);
                else setSelectedNft(nft);
              }}
              className="group bg-transparent rounded-[16px] overflow-hidden transition-all cursor-pointer flex flex-col justify-between relative"
            >
              <div>
                {/* Artwork + Hover Audio Indicator */}
                <div className="relative aspect-square rounded-[16px] overflow-hidden bg-slate-900/40">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Dark overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
                    isHovered || isFullTrackPlaying ? 'opacity-100' : 'opacity-0'
                  }`} />

                  {/* Center Hover-to-Play Indicator Button */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${
                    isHovered || isFullTrackPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}>
                    
                    {/* Play Button Icon */}
                    <button
                      onClick={(e) => handlePlayFullTrack(nft, e)}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border border-white/20"
                    >
                      {isFullTrackPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="pt-3 pb-1 space-y-1 text-center flex flex-col items-center">
                  <h3 className="text-[13px] font-bold text-white tracking-normal leading-normal truncate w-full px-1 text-center">
                    {nft.title}
                  </h3>
                </div>
              </div>

              {/* Price Tag & Outline Triangle Icon */}
              <div className="pb-2 pt-0.5 flex items-center justify-center gap-1.5 text-[#9AA0AE]">
                {/* Minimalist Downward Triangle Outline Icon (▽) to exactly match the uploaded user image */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  className="w-3.5 h-3.5 opacity-70 text-[#9AA0AE] select-none shrink-0"
                >
                  <polygon points="12,21 3,5 21,5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold text-[#9AA0AE] font-mono tracking-tight">
                  {nft.price} GRAM
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center bg-[#0e163d]/30 rounded-2xl border border-white/5">
          <Disc className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            No music NFTs found in this collection gallery.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting your search query or rarity filter.
          </p>
        </div>
      )}

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNft && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a113a] text-white rounded-3xl max-w-md w-full overflow-hidden border border-white/10 shadow-2xl space-y-4 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Music NFT Details
                </span>
                <button
                  onClick={() => setSelectedNft(null)}
                  className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900">
                <img src={selectedNft.imageUrl} alt={selectedNft.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-3 right-3 text-xs font-mono font-black text-cyan-300 bg-black/80 px-3 py-1 rounded-full border border-white/10">
                  {selectedNft.edition}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{selectedNft.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedNft.description}</p>
              </div>

              {selectedNft.traits && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedNft.traits.map((t, idx) => (
                    <div key={idx} className="bg-[#050A24] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 uppercase block">{t.trait_type}</span>
                      <span className="text-xs font-bold text-white">{t.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Price</span>
                  <span className="text-lg font-mono font-black text-cyan-400">{selectedNft.price} GRAM</span>
                </div>

                <button
                  onClick={(e) => {
                    handlePlayFullTrack(selectedNft, e);
                    setSelectedNft(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Stream Track
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CollectionGallery;
