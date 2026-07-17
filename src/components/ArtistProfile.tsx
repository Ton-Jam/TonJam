import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Twitter, Instagram, Globe, Send, Disc, Sparkles, MapPin, 
  Users, Music, Gem, BadgeCheck, Check, ArrowRight, Share2 
} from 'lucide-react';
import { useArtist } from '@/contexts/ArtistContext';
import { Artist, NFTItem } from '@/types';
import NFTCard from '@/components/NFTCard';
import { toast } from 'sonner';
import { ArtistProfileSkeleton } from '@/pages/Library/components/Skeletons';

interface ArtistProfileProps {
  artistId?: string;
  onArtistChange?: (id: string) => void;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ 
  artistId, 
  onArtistChange 
}) => {
  const { artists, getArtistById, getArtistNFTs } = useArtist();
  
  // Use either the provided artistId, or default to the first artist's ID
  const activeId = artistId || (artists.length > 0 ? artists[0].uid : 'dj-krupy');
  
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [artistNfts, setArtistNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [followedArtists, setFollowedArtists] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('followed_artists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isFollowing = followedArtists.includes(activeId);

  const toggleFollow = () => {
    if (!currentArtist) return;
    
    let updated: string[];
    if (isFollowing) {
      updated = followedArtists.filter(id => id !== activeId);
      toast.success(`Unfollowed ${currentArtist.name}`);
    } else {
      updated = [...followedArtists, activeId];
      toast.success(`Followed ${currentArtist.name}!`, {
        description: `You will now receive notifications about ${currentArtist.name}'s new music and NFT drops.`
      });
    }
    setFollowedArtists(updated);
    localStorage.setItem('followed_artists', JSON.stringify(updated));
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const art = getArtistById(activeId);
      if (art) {
        setCurrentArtist(art);
        setArtistNfts(getArtistNFTs(activeId));
      } else if (artists.length > 0) {
        // Fallback to first artist if not found
        setCurrentArtist(artists[0]);
        setArtistNfts(getArtistNFTs(artists[0].uid));
      }
      setIsLoading(false);
    }, 450); // Small realistic delay for smooth transition

    return () => clearTimeout(timer);
  }, [activeId, artists, getArtistById, getArtistNFTs]);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        return Twitter;
      case 'instagram':
        return Instagram;
      case 'website':
      case 'link':
        return Globe;
      case 'telegram':
        return Send;
      case 'spotify':
        return Disc;
      default:
        return Globe;
    }
  };

  const handleShare = () => {
    if (currentArtist) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', {
        description: `Successfully copied the profile link for ${currentArtist.name} to clipboard.`
      });
    }
  };

  if (isLoading) {
    return <ArtistProfileSkeleton />;
  }

  if (!currentArtist) {
    return (
      <div className="w-full py-16 text-center bg-[#0a113a]/20 rounded-2xl p-8 border border-white/5">
        <p className="text-sm text-slate-400">No artist data found.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 text-left font-sans text-white"
    >
      {/* Selector Dropdown to showcase reuse & switcher capability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0e163d]/50">
        <div>
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">
            AISTUDIO REUSABLE COMPONENT
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Select an active network artist to view their bio, links, and TON music NFTs.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={activeId}
            onChange={(e) => onArtistChange?.(e.target.value)}
            className="bg-[#050A24] border border-white/10 hover:border-white/25 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
          >
            {artists.map(a => (
              <option key={a.uid} value={a.uid}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#121833]/30 rounded-2xl overflow-hidden">
        
        {/* Banner Section */}
        <div className="h-44 sm:h-52 w-full relative bg-gradient-to-r from-blue-900 via-[#0a113a] to-purple-900 overflow-hidden">
          {currentArtist.bannerUrl || currentArtist.bannerImageUrl ? (
            <img 
              src={currentArtist.bannerUrl || currentArtist.bannerImageUrl} 
              alt={`${currentArtist.name} Banner`} 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          )}
          {/* Cover gradient mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A24] to-transparent" />
        </div>

        {/* Profile Content Details */}
        <div className="px-6 pb-6 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Avatar and Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group shrink-0">
                <img 
                  src={currentArtist.avatarUrl} 
                  alt={currentArtist.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#050A24] shadow-2xl bg-slate-900"
                  referrerPolicy="no-referrer"
                />
                {currentArtist.isLive && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md animate-pulse">
                    Live
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-2 sm:pt-0">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{currentArtist.name}</h2>
                  {(currentArtist.verified || currentArtist.isVerifiedArtist) && (
                    <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-400/10 shrink-0" />
                  )}
                </div>
                {currentArtist.username && (
                  <span className="text-xs text-blue-400 font-mono font-semibold block">
                    {currentArtist.username}
                  </span>
                )}
                {currentArtist.genre && (
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold bg-white/5 border border-white/10 rounded-full text-slate-300 uppercase tracking-wider">
                    {currentArtist.genre}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 self-center md:self-end">
              <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl">
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Followers</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {((currentArtist.followers || 0) + (isFollowing ? 1 : 0)).toLocaleString()}
                  </span>
                </div>
                {currentArtist.monthlyListeners && (
                  <>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Monthly</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {currentArtist.monthlyListeners?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={toggleFollow}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-white ${
                  isFollowing 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleShare}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Copy profile link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Bio & Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
            
            {/* Left Col: Biography */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Biography
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {currentArtist.bio || `${currentArtist.name} is a pioneer on the decentralized Web3 music horizon, creating high-fidelity audio artifacts and custom soundscapes minted directly on the TON Blockchain.`}
              </p>
            </div>

            {/* Right Col: Social & Meta */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Social Signals
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {currentArtist.socials && Object.entries(currentArtist.socials).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = getSocialIcon(platform);
                  return (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{platform}</span>
                    </a>
                  );
                })}
                {(!currentArtist.socials || Object.values(currentArtist.socials || {}).filter(Boolean).length === 0) && (
                  <div className="text-[10px] text-slate-500 italic uppercase">
                    No connected links available
                  </div>
                )}
              </div>

              {currentArtist.location && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{currentArtist.location}</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Listed Music NFTs Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Gem className="w-4 h-4 text-purple-400" />
            Listed Music NFTs
          </h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
            Decentralized audio collectibles and exclusive master rights listed on the TON Blockchain
          </p>
        </div>

        {/* NFT Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistNfts.map((nft) => (
            <div key={nft.id} className="w-full">
              <NFTCard nft={nft} />
            </div>
          ))}

          {artistNfts.length === 0 && (
            <div className="col-span-full py-16 text-center bg-[#121833]/10 border border-white/5 rounded-2xl">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                No active NFT listings found
              </p>
              <p className="text-[9px] text-slate-500 mt-1">
                This node hasn't listed any creative audio editions on the secondary market yet.
              </p>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};
