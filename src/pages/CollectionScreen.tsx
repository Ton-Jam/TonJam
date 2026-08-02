import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Disc, Gem, Sparkles, ShieldCheck, TrendingUp, Users, Music, 
  Search, Filter, ArrowUpDown, Play, Pause, Share2, Check, Copy, 
  ExternalLink, Layers, LayoutGrid, List, BarChart2, Clock, Coins, 
  Flame, ChevronRight, Info, BadgeCheck, Heart, ArrowRight
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
import { Collection, NFTItem, Track } from '@/types';
import { getMusicNftRarity } from '@/lib/nftRarity';

// Mock collections dataset for complete interactive browsing
const MOCK_COLLECTIONS: (Collection & { 
  volume: string; 
  floorPrice: string; 
  ownersCount: number; 
  totalSupply: number; 
  creatorName: string; 
  verified: boolean;
  contractAddress: string;
  royaltyFee: string;
  bannerUrl: string;
  items: NFTItem[];
})[] = [
  {
    id: 'genesis-pass',
    artistId: 'dj-krupy',
    name: 'TonJam Genesis Audio Pass',
    description: 'Exclusive founding audio pass granting lifetime access to high-fidelity master stems, VIP staking multipliers, governance voting weight, and private backstage jam rooms on the GRAM Blockchain.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600',
    nftIds: ['gen-1', 'gen-2', 'gen-3', 'gen-4'],
    createdAt: '2026-01-15T00:00:00Z',
    volume: '42,500',
    floorPrice: '25.0',
    ownersCount: 142,
    totalSupply: 250,
    creatorName: 'DJ Krupy & TonJam Labs',
    verified: true,
    contractAddress: 'EQBvW_3k7_pP3_TonJamGenesisPassMainnet',
    royaltyFee: '5.0%',
    items: [
      {
        id: 'gen-1',
        trackId: 'track-gen-1',
        title: 'Genesis Master Anthem #001',
        owner: 'krusherkrupy@gmail.com',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '25.0',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        edition: '#001 / 250',
        supply: 250,
        minted: 1,
        artistVerified: true,
        description: 'First edition of the Genesis Master Anthem with embedded lossless stem rights.',
        traits: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'BPM', value: 128 },
          { trait_type: 'Utility', value: 'VIP Backstage' },
          { trait_type: 'Audio Quality', value: '24-bit 96kHz Lossless' }
        ]
      },
      {
        id: 'gen-2',
        trackId: 'track-gen-2',
        title: 'Cyber Resonance Wave #014',
        owner: 'UQAs9vW_3k7_pP3...',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '28.5',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        edition: '#014 / 250',
        supply: 250,
        minted: 14,
        artistVerified: true,
        description: 'Atmospheric cybernetic synthwave audio NFT with exclusive remixing rights.',
        traits: [
          { trait_type: 'Rarity', value: 'Epic' },
          { trait_type: 'BPM', value: 120 },
          { trait_type: 'Utility', value: 'Staking Multiplier 2x' },
          { trait_type: 'Audio Quality', value: 'Spatial 3D Audio' }
        ]
      },
      {
        id: 'gen-3',
        trackId: 'track-gen-3',
        title: 'GRAM Decentralized Pulse #045',
        owner: 'UQCa_9vX_7m8_kQ2...',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '30.0',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        edition: '#045 / 250',
        supply: 250,
        minted: 45,
        artistVerified: true,
        description: 'Deep house rhythm artifact connected to automated GRAM protocol liquidity pools.',
        traits: [
          { trait_type: 'Rarity', value: 'Epic' },
          { trait_type: 'BPM', value: 124 },
          { trait_type: 'Utility', value: 'Governance Vote +200' },
          { trait_type: 'Audio Quality', value: 'FLAC Master' }
        ]
      },
      {
        id: 'gen-4',
        trackId: 'track-gen-4',
        title: 'Sonic Quantum Echo #088',
        owner: 'UQDr_1aY_8k9_mN4...',
        creator: 'DJ Krupy',
        artist: 'DJ Krupy',
        price: '35.0',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        edition: '#088 / 250',
        supply: 250,
        minted: 88,
        artistVerified: true,
        description: 'Ultra rare quantum echo frequency composition.',
        traits: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'BPM', value: 140 },
          { trait_type: 'Utility', value: 'Royalties Share 1%' },
          { trait_type: 'Audio Quality', value: 'Hi-Fi Master' }
        ]
      }
    ]
  },
  {
    id: 'cybernetic-melodies',
    artistId: 'artist-electro-x',
    name: 'Cybernetic Melodies Vol. 1',
    description: 'A futuristic collection of generative electronic music NFTs created by AI synthesis and live synthesizer jams on the GRAM Blockchain network.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600',
    nftIds: ['cyb-1', 'cyb-2', 'cyb-3'],
    createdAt: '2026-02-01T00:00:00Z',
    volume: '18,200',
    floorPrice: '12.5',
    ownersCount: 88,
    totalSupply: 100,
    creatorName: 'ElectroX Sound Lab',
    verified: true,
    contractAddress: 'EQC9vX_7m8_kQ2_CyberneticMelodiesV1',
    royaltyFee: '7.5%',
    items: [
      {
        id: 'cyb-1',
        trackId: 'track-cyb-1',
        title: 'Neon Horizon Synthesis',
        owner: 'UQAs9vW_3k7...',
        creator: 'ElectroX',
        artist: 'ElectroX',
        price: '12.5',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        edition: '#003 / 100',
        supply: 100,
        artistVerified: true,
        description: 'Synthesizer waves with high dynamic audio range.',
        traits: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Genre', value: 'Synthwave' }
        ]
      },
      {
        id: 'cyb-2',
        trackId: 'track-cyb-2',
        title: 'Neural Beat Matrix',
        owner: 'UQDr_1aY...',
        creator: 'ElectroX',
        artist: 'ElectroX',
        price: '15.0',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        edition: '#012 / 100',
        supply: 100,
        artistVerified: true,
        description: 'Glitch hop beats crafted for festival sound systems.',
        traits: [
          { trait_type: 'Rarity', value: 'Epic' },
          { trait_type: 'Genre', value: 'Glitch Hop' }
        ]
      },
      {
        id: 'cyb-3',
        trackId: 'track-cyb-3',
        title: 'Orbital Nightscape',
        owner: 'UQCa_9vX...',
        creator: 'ElectroX',
        artist: 'ElectroX',
        price: '18.0',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        edition: '#025 / 100',
        supply: 100,
        artistVerified: true,
        description: 'Ambient chillout soundscape with soothing harmonic pads.',
        traits: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Genre', value: 'Ambient Chill' }
        ]
      }
    ]
  },
  {
    id: 'abstract-rhythm-artifacts',
    artistId: 'artist-luna-vibes',
    name: 'Abstract Rhythm Artifacts',
    description: 'Experimental binaural rhythm artifacts with visual generative cover art encoded directly into decentralized smart contracts.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600',
    nftIds: ['abs-1', 'abs-2'],
    createdAt: '2026-02-10T00:00:00Z',
    volume: '9,400',
    floorPrice: '8.0',
    ownersCount: 54,
    totalSupply: 75,
    creatorName: 'Luna Vibes',
    verified: false,
    contractAddress: 'EQA8_mN4_AbstractRhythmArtifacts',
    royaltyFee: '6.0%',
    items: [
      {
        id: 'abs-1',
        trackId: 'track-abs-1',
        title: 'Binaural Drift Artifact',
        owner: 'UQAs9vW_3k7...',
        creator: 'Luna Vibes',
        artist: 'Luna Vibes',
        price: '8.0',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        edition: '#005 / 075',
        supply: 75,
        artistVerified: false,
        description: 'Relaxing binaural beat designed for focus and deep work sessions.',
        traits: [
          { trait_type: 'Rarity', value: 'Common' },
          { trait_type: 'Frequency', value: '432 Hz' }
        ]
      },
      {
        id: 'abs-2',
        trackId: 'track-abs-2',
        title: 'Ethereal Harmony Shift',
        owner: 'UQDr_1aY...',
        creator: 'Luna Vibes',
        artist: 'Luna Vibes',
        price: '10.5',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        edition: '#018 / 075',
        supply: 75,
        artistVerified: false,
        description: 'Floating synth vocal textures.',
        traits: [
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Frequency', value: '528 Hz' }
        ]
      }
    ]
  }
];

export const CollectionScreen: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  // Selected collection state
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    id || 'genesis-pass'
  );

  useEffect(() => {
    if (id) {
      setSelectedCollectionId(id);
    }
  }, [id]);

  const activeCollection = useMemo(() => {
    return MOCK_COLLECTIONS.find(c => c.id === selectedCollectionId) || MOCK_COLLECTIONS[0];
  }, [selectedCollectionId]);

  // UI state
  const [activeTab, setActiveTab] = useState<'items' | 'analytics' | 'about'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rarity'>('price-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copied, setCopied] = useState(false);
  const [selectedNftForBuy, setSelectedNftForBuy] = useState<NFTItem | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = [...activeCollection.items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.edition.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
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
  }, [activeCollection, searchQuery, rarityFilter, sortBy]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(activeCollection.contractAddress);
    setCopied(true);
    toast.success('Contract address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activeCollection.name,
        text: activeCollection.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Collection link copied!');
    }
  };

  const handlePlayNftTrack = (item: NFTItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const trackObj: Track = {
      id: item.id,
      songId: item.trackId || item.id,
      title: item.title,
      artist: item.artist || item.creator || activeCollection.creatorName,
      artistId: activeCollection.artistId,
      coverUrl: item.imageUrl,
      audioUrl: item.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 210,
      genre: 'Music NFT',
      isNFT: true,
      nftPrice: item.price,
      createdAt: Date.now()
    };

    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      playTrack(trackObj);
      toast.success(`Now streaming: ${item.title}`);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedNftForBuy) return;
    setIsBuying(true);

    setTimeout(() => {
      setIsBuying(false);
      toast.success(`Successfully acquired ${selectedNftForBuy.title} for ${selectedNftForBuy.price} GRAM!`);
      setSelectedNftForBuy(null);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#050A24] text-white pt-2 pb-24 px-3 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Selector / Collection Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 px-1">
          Collections:
        </span>
        {MOCK_COLLECTIONS.map(c => {
          const isSelected = c.id === activeCollection.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCollectionId(c.id);
                navigate(`/collection/${c.id}`);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-[#0e163d]/70 text-slate-300 hover:bg-[#121c4e] hover:text-white'
              }`}
            >
              <img src={c.coverUrl} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
              <span className="truncate max-w-[140px]">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Banner & Collection Summary Header */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0e163d]/50">
        
        {/* Banner Cover Image */}
        <div className="h-44 sm:h-60 w-full relative">
          <img 
            src={activeCollection.bannerUrl} 
            alt={activeCollection.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d2d] via-[#080d2d]/60 to-transparent" />
        </div>

        {/* Collection Identity Row */}
        <div className="relative px-4 sm:px-6 pb-6 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            
            {/* Avatar Cover */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl shrink-0">
              <img 
                src={activeCollection.coverUrl} 
                alt={activeCollection.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Titles & Creator Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 rounded-full">
                  GRAM Audio NFT Collection
                </span>
                {activeCollection.verified && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold text-cyan-300 bg-cyan-500/10 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                    Verified Creator
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeCollection.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <span>Created by <strong className="text-white">{activeCollection.creatorName}</strong></span>
                <span>•</span>
                <span className="text-slate-400">Created Jan 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Copy Smart Contract Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono text-[10px] hidden sm:inline">
                {activeCollection.contractAddress.substring(0, 8)}...
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Share Collection"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description Text */}
        <div className="px-4 sm:px-6 pb-6">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {activeCollection.description}
          </p>
        </div>

        {/* Collection Stats Cards Row */}
        <div className="px-4 sm:px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#050A24]/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Floor Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-mono font-black text-cyan-400">
                {activeCollection.floorPrice}
              </span>
              <span className="text-xs font-bold text-slate-300">GRAM</span>
            </div>
          </div>

          <div className="bg-[#050A24]/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Total Volume
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-mono font-black text-white">
                {activeCollection.volume}
              </span>
              <span className="text-xs font-bold text-slate-300">GRAM</span>
            </div>
          </div>

          <div className="bg-[#050A24]/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Items Supply
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-white">
              {activeCollection.items.length} <span className="text-xs font-normal text-slate-400">/ {activeCollection.totalSupply}</span>
            </div>
          </div>

          <div className="bg-[#050A24]/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Unique Owners
            </span>
            <div className="text-lg sm:text-xl font-mono font-black text-purple-400">
              {activeCollection.ownersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between gap-4 bg-[#0e163d]/40 p-2 rounded-2xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Items ({activeCollection.items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Contract Specs</span>
          </button>
        </div>

        {activeTab === 'items' && (
          <div className="hidden sm:flex items-center gap-1 bg-[#050A24] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Collection Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Rarity Filter, Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e163d]/30 p-3 rounded-2xl">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search collection items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050A24] text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Rarity Selector */}
              <div className="flex items-center gap-1 bg-[#050A24] p-1 rounded-xl">
                {['all', 'Legendary', 'Epic', 'Rare', 'Common'].map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setRarityFilter(rarity)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                      rarityFilter === rarity 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#050A24] text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="price-asc" className="bg-[#0e163d]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0e163d]">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isCurrentPlaying = currentTrack?.id === item.id && isPlaying;
                const rarityMeta = getMusicNftRarity(item);

                return (
                  <div
                    key={item.id}
                    className={`bg-[#0e163d]/50 hover:bg-[#121c4e] rounded-2xl overflow-hidden transition-all group flex flex-col justify-between border ${rarityMeta.glowClass}`}
                  >
                    <div>
                      {/* Image Preview & Play Overlay */}
                      <div className="relative aspect-square overflow-hidden bg-slate-900">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => handlePlayNftTrack(item, e)}
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${
                            isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                            {isCurrentPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </div>
                        </button>

                        {/* Top Badges: Rarity & Edition */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${rarityMeta.badgeClass}`}>
                            {rarityMeta.rarity === 'Legendary' && <Flame className="w-2.5 h-2.5 text-amber-400" />}
                            {rarityMeta.rarity === 'Epic' && <Sparkles className="w-2.5 h-2.5 text-purple-300" />}
                            {rarityMeta.rarity === 'Rare' && <Disc className="w-2.5 h-2.5 text-cyan-300" />}
                            {rarityMeta.rarity === 'Common' && <Music className="w-2.5 h-2.5 text-slate-300" />}
                            {rarityMeta.rarity}
                          </span>

                          <span className="text-[9px] font-mono font-black text-cyan-300 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                            {item.edition}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-black text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Ownership & Supply Info Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[9px] font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                            {rarityMeta.ownershipText}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                            {rarityMeta.supplyText}
                          </span>
                        </div>

                        {/* Additional Traits */}
                        {item.traits && item.traits.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {item.traits.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[9px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                                {t.trait_type}: {t.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Price</span>
                        <span className="text-sm font-mono font-black text-cyan-400">
                          {item.price} GRAM
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedNftForBuy(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredItems.map((item, idx) => {
                const isCurrentPlaying = currentTrack?.id === item.id && isPlaying;
                const rarityMeta = getMusicNftRarity(item);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl bg-[#0e163d]/40 hover:bg-[#121c4e] transition-all gap-4 border ${rarityMeta.glowClass}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => handlePlayNftTrack(item, e)}
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer ${
                            isCurrentPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 text-cyan-400 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white truncate">{item.title}</h4>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityMeta.badgeClass}`}>
                            {rarityMeta.rarity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{item.edition}</span>
                          <span>•</span>
                          <span>{rarityMeta.ownershipText}</span>
                          <span>•</span>
                          <span className="text-cyan-300">{rarityMeta.supplyText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase">Price</span>
                        <span className="text-xs font-mono font-black text-cyan-400">{item.price} GRAM</span>
                      </div>

                      <button
                        onClick={() => setSelectedNftForBuy(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center bg-[#0e163d]/20 rounded-2xl">
              <Disc className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                No collection items matched your filter query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Analytics & Floor History */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-[#0e163d]/40 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Floor Price Trend & Volume Activity
            </h3>

            {/* Visual SVG Sparkline Chart */}
            <div className="h-44 w-full bg-[#050A24]/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>30-Day Peak: 35.0 GRAM</span>
                <span className="text-emerald-400 font-bold">+18.4% Volume</span>
              </div>

              <svg className="w-full h-24 stroke-cyan-400 fill-cyan-400/10 overflow-visible" viewBox="0 0 100 40">
                <path
                  d="M0 30 Q15 25, 30 20 T60 15 T80 10 T100 5 L100 40 L0 40 Z"
                  strokeWidth="0"
                />
                <path
                  d="M0 30 Q15 25, 30 20 T60 15 T80 10 T100 5"
                  fill="none"
                  strokeWidth="2.5"
                />
              </svg>

              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Jan 01</span>
                <span>Jan 10</span>
                <span>Jan 20</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0e163d]/40 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Rarity Breakdown</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                    <span>Legendary Items</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[15%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                    <span>Epic Items</span>
                    <span>35%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[35%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                    <span>Rare & Common</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[50%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0e163d]/40 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Recent Sales</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="font-bold text-white">Anthem #001</span>
                  <span className="font-mono text-cyan-400 font-bold">25.0 GRAM</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className="font-bold text-white">Wave #014</span>
                  <span className="font-mono text-cyan-400 font-bold">28.5 GRAM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contract Specs */}
      {activeTab === 'about' && (
        <div className="bg-[#0e163d]/40 p-6 rounded-2xl space-y-4 text-xs">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Smart Contract Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="bg-[#050A24] p-3 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase block">Contract Standard</span>
              <span className="text-white font-bold">TON-NFT / GRAM Audio Protocol</span>
            </div>

            <div className="bg-[#050A24] p-3 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase block">Creator Royalty Fee</span>
              <span className="text-cyan-400 font-bold">{activeCollection.royaltyFee}</span>
            </div>

            <div className="bg-[#050A24] p-3 rounded-xl col-span-full">
              <span className="text-[9px] text-slate-400 uppercase block">Smart Contract Address</span>
              <span className="text-slate-200 text-[10px] break-all">{activeCollection.contractAddress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      <AnimatePresence>
        {selectedNftForBuy && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a113a] text-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-black uppercase tracking-wider">Acquire Music NFT</h3>

              <div className="flex items-center gap-3 bg-[#0e163d] p-3 rounded-xl">
                <img src={selectedNftForBuy.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h4 className="text-xs font-bold">{selectedNftForBuy.title}</h4>
                  <span className="text-[10px] text-slate-400">{selectedNftForBuy.edition}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono bg-[#050A24] p-3 rounded-xl">
                <span>Total Amount:</span>
                <span className="font-bold text-cyan-400">{selectedNftForBuy.price} GRAM</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedNftForBuy(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isBuying}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isBuying ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionScreen;
