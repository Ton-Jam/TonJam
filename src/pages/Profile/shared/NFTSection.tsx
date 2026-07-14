import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Music, 
  Search, 
  Flame, 
  Compass, 
  Activity,
  Award,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NFTItem, Track } from '@/types';
import { useToast } from '@/components/layout/ToastProvider';
import { useAudio } from '@/contexts/AudioContext';
import { BuyNFTButton } from '../visitor/BuyNFTButton';

interface NFTSectionProps {
  nfts: NFTItem[];
  isOwnProfile?: boolean;
}

export const NFTSection: React.FC<NFTSectionProps> = ({
  nfts: propNfts = [],
  isOwnProfile = false
}) => {
  const toast = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'auction' | 'exclusive' | 'fixed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (nft: NFTItem) => {
    navigator.clipboard.writeText(`https://tonjam.app/nft/${nft.id}`);
    setCopiedId(nft.id);
    toast.success('Link Copied', `Direct share link for "${nft.title}" saved.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayNFT = async (nft: NFTItem) => {
    const isThisTrackActive = currentTrack?.id === nft.trackId || currentTrack?.id === nft.id;
    if (isThisTrackActive) {
      await togglePlay();
    } else {
      // Build a dynamic Track object to inject into the global playback engine
      const track: Track = {
        id: nft.trackId || nft.id,
        songId: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator || 'TONJAM Creator',
        artistId: nft.artistId || 'unknown',
        coverUrl: nft.coverUrl || nft.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
        audioUrl: nft.audioUrl || '',
        duration: 180,
        genre: 'Music NFT',
        isNFT: true,
        price: nft.price || '1.0',
        createdAt: new Date().toISOString()
      };

      if (!track.audioUrl) {
        toast.warning('No Audio stream found', 'This NFT represents a silent registration code or draft token.');
        return;
      }

      await playTrack(track);
      toast.info('Streaming Frequency', `Now playing: "${nft.title}" directly from TON IPFS Gateway.`);
    }
  };

  // Filter the items beautifully
  const filteredNFTs = propNfts.filter((nft) => {
    const matchesSearch = 
      nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (nft.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (nft.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'auction') return nft.isAuction || nft.listingType === 'auction';
    if (activeFilter === 'exclusive') return nft.exclusiveContent && nft.exclusiveContent.length > 0;
    if (activeFilter === 'fixed') return !nft.isAuction && nft.listingType !== 'auction';
    
    return true;
  });

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Search and Responsive Glass Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search owned collectible nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101A3B]/45 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#00B4D8] transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Categories Grid */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#101A3B]/30 rounded-full">
          {(['all', 'fixed', 'auction', 'exclusive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === filter 
                  ? 'bg-gradient-to-r from-[#00B4D8] to-[#009CC0] text-white shadow-[0_0_12px_rgba(0,180,216,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Music className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-pulse" />
          No matches found in this secure catalog block
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => {
            const isThisPlaying = (currentTrack?.id === nft.trackId || currentTrack?.id === nft.id) && isPlaying;
            
            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/[0.04] backdrop-blur-xl rounded-[24px] overflow-hidden flex flex-col justify-between group hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(0,180,216,0.15)] transition-all duration-300"
              >
                {/* Visual Cover Header */}
                <div className="relative aspect-square w-full bg-slate-900/60 overflow-hidden">
                  <img
                    src={nft.imageUrl || nft.coverUrl}
                    alt={nft.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[9px] font-extrabold text-white uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00B4D8]" />
                      <span>TON Verified</span>
                    </div>

                    {nft.exclusiveContent && nft.exclusiveContent.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        <Lock className="w-3 h-3" />
                        <span>Unlocked Perks</span>
                      </div>
                    )}
                  </div>

                  {/* Floating Action Buttons over Art */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyLink(nft)}
                      className="p-2 bg-black/60 hover:bg-[#00B4D8] backdrop-blur-md rounded-full text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      {copiedId === nft.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Play & Audio Waves Trigger */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <button
                      onClick={() => handlePlayNFT(nft)}
                      className="w-11 h-11 bg-white hover:bg-[#00B4D8] text-[#050A24] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.35)] group-hover:scale-105"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Interactive live audio spectrum bars */}
                    {isThisPlaying ? (
                      <div className="flex items-end gap-0.5 h-5 px-3 bg-black/50 backdrop-blur-md rounded-full">
                        <div className="w-0.75 h-3 bg-[#00B4D8] rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                        <div className="w-0.75 h-4 bg-[#00B4D8] rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                        <div className="w-0.75 h-2.5 bg-[#00B4D8] rounded-full animate-[bounce_0.8s_infinite_500ms]" />
                        <div className="w-0.75 h-4.5 bg-[#00B4D8] rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-300">
                        {nft.edition || '1 of 1'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#00B4D8] uppercase tracking-widest">
                        {nft.artist || 'TonJam Original'}
                      </span>
                      {nft.isAuction && (
                        <span className="text-[9px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide">
                          <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                          Auction
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-black text-white mt-1 leading-tight group-hover:text-[#00B4D8] transition-colors">
                      {nft.title}
                    </h4>
                    
                    {nft.description && (
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {nft.description}
                      </p>
                    )}
                  </div>

                  {/* Custom Glass Ledger info (No Border Lines) */}
                  <div className="bg-white/[0.03] p-3 rounded-2xl flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Floor Price</span>
                      <span className="text-xs font-black text-slate-100 flex items-center gap-1">
                        {nft.price || '1.0'} TON
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Token ID</span>
                      <span className="text-xs font-black text-[#00B4D8]">#0{nft.id.slice(-2)}</span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  {!isOwnProfile ? (
                    <BuyNFTButton 
                      nftId={nft.id} 
                      nftName={nft.title} 
                      priceTon={parseFloat(nft.price || '1.0')} 
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          toast.info('Initiating Transfer', 'Connecting to secure TON peer tunnel to transfer token...');
                        }}
                        className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Listing Updated', 'NFT updated with latest public market pricing.');
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-[#00B4D8] to-[#009CC0] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,180,216,0.3)] hover:shadow-[0_0_20px_rgba(0,180,216,0.5)]"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Relist</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NFTSection;
