import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Twitter, Instagram, Globe, Send, Disc, Sparkles, MapPin, 
  Users, Music, Gem, BadgeCheck, Check, ArrowRight, Share2,
  Play, Pause, Headphones, Clock, Radio, ArrowUpDown
} from 'lucide-react';
import { useArtist } from '@/contexts/ArtistContext';
import { useAudio } from '@/contexts/AudioContext';
import { Artist, NFTItem, Track } from '@/types';
import NFTCard from '@/components/NFTCard';
import { toast } from 'sonner';
import { ArtistProfileSkeleton } from '@/pages/Library/components/Skeletons';
import { ArtistVerificationBadge } from '@/components/ArtistVerificationBadge';
import ArtistHeader from '@/components/ArtistHeader';

interface ArtistProfileProps {
  artistId?: string;
  onArtistChange?: (id: string) => void;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ 
  artistId, 
  onArtistChange 
}) => {
  const { artists, getArtistById, getArtistNFTs } = useArtist();
  const { allTracks = [], playTrack, togglePlay, currentTrack, isPlaying } = useAudio();
  
  // Use either the provided artistId, or default to the first artist's ID
  const activeId = artistId || (artists.length > 0 ? artists[0].uid : 'dj-krupy');
  
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [artistNfts, setArtistNfts] = useState<NFTItem[]>([]);
  const [discographyTracks, setDiscographyTracks] = useState<Track[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popularity' | 'price'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  const sortedDiscographyTracks = useMemo(() => {
    return [...discographyTracks].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      }
      if (sortBy === 'popularity') {
        const popA = a.streams || a.playCount || 0;
        const popB = b.streams || b.playCount || 0;
        return popB - popA;
      }
      if (sortBy === 'price') {
        const priceA = parseFloat(a.nftPrice || '0');
        const priceB = parseFloat(b.nftPrice || '0');
        return priceB - priceA;
      }
      return 0;
    });
  }, [discographyTracks, sortBy]);

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

      // Filter or generate discography tracks for this artist
      const artistName = art?.name || artists[0]?.name || '';
      const matchedTracks = allTracks.filter(
        t => t.artistId === activeId || 
             (artistName && t.artist?.toLowerCase() === artistName.toLowerCase())
      );

      if (matchedTracks.length > 0) {
        setDiscographyTracks(matchedTracks);
      } else {
        // High quality fallback discography items if no tracks in global context match
        const fallbackDiscography: Track[] = [
          {
            id: `disc-${activeId}-1`,
            songId: `disc-${activeId}-1`,
            title: `${art?.name || 'Artist'} - Genesis Master Anthem`,
            artist: art?.name || 'Verified Artist',
            artistId: activeId,
            coverUrl: art?.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: 215,
            genre: art?.genre || 'Electronic Synth',
            playCount: 18450,
            streams: 18450,
            likes: 1240,
            isNFT: true,
            nftPrice: '15',
            createdAt: Date.now()
          },
          {
            id: `disc-${activeId}-2`,
            songId: `disc-${activeId}-2`,
            title: `${art?.name || 'Artist'} - Cyber Resonance Wave`,
            artist: art?.name || 'Verified Artist',
            artistId: activeId,
            coverUrl: art?.bannerUrl || art?.avatarUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            duration: 198,
            genre: art?.genre || 'Ambient Future',
            playCount: 12300,
            streams: 12300,
            likes: 980,
            isNFT: true,
            nftPrice: '20',
            createdAt: Date.now() - 86400000
          },
          {
            id: `disc-${activeId}-3`,
            songId: `disc-${activeId}-3`,
            title: `${art?.name || 'Artist'} - TON Decentralized Pulse`,
            artist: art?.name || 'Verified Artist',
            artistId: activeId,
            coverUrl: art?.avatarUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            duration: 240,
            genre: art?.genre || 'Deep House',
            playCount: 9600,
            streams: 9600,
            likes: 710,
            isNFT: false,
            createdAt: Date.now() - 172800000
          }
        ];
        setDiscographyTracks(fallbackDiscography);
      }

      setIsLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [activeId, artists, getArtistById, getArtistNFTs, allTracks]);

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

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const formatDuration = (secs: number = 0) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (isLoading) {
    return <ArtistProfileSkeleton />;
  }

  if (!currentArtist) {
    return (
      <div className="w-full py-16 text-center bg-[#0a113a]/20 rounded-2xl p-8">
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
            ARTIST PROFILE HUB
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Select an artist node to view their discography, biography, follower network and music NFTs.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={activeId}
            onChange={(e) => onArtistChange?.(e.target.value)}
            className="bg-[#050A24] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
          >
            {artists.map(a => (
              <option key={a.uid} value={a.uid}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dedicated Artist Header */}
      <ArtistHeader
        name={currentArtist.name}
        avatarUrl={currentArtist.avatarUrl}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
        verified={Boolean(currentArtist.verified || currentArtist.isVerifiedArtist)}
        username={currentArtist.username}
        genre={currentArtist.genre}
      />

      {/* Main Profile Card */}
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
                  <ArtistVerificationBadge
                    isVerified={Boolean(currentArtist.verified || currentArtist.isVerifiedArtist)}
                    artistName={currentArtist.name}
                    artistUid={currentArtist.uid}
                    size="md"
                  />
                </div>
                {currentArtist.username && (
                  <span className="text-xs text-blue-400 font-mono font-semibold block">
                    {currentArtist.username}
                  </span>
                )}
                {currentArtist.genre && (
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold bg-white/5 rounded-full text-slate-300 uppercase tracking-wider">
                    {currentArtist.genre}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics & Follow Action */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 self-center md:self-end">
              <div className="flex items-center gap-4 bg-black/30 px-4 py-2 rounded-xl">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Followers</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {((currentArtist.followers || 0) + (isFollowing ? 1 : 0)).toLocaleString()}
                  </span>
                </div>
                {currentArtist.monthlyListeners && (
                  <>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Monthly Listeners</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {currentArtist.monthlyListeners?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Follow Action Button */}
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
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white cursor-pointer"
                title="Copy profile link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Biography & Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-6 bg-white/5 p-5 rounded-2xl">
            
            {/* Biography */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Biography
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {currentArtist.bio || `${currentArtist.name} is a pioneer on the decentralized Web3 music horizon, creating high-fidelity audio artifacts and custom soundscapes minted directly on the GRAM Blockchain.`}
              </p>
            </div>

            {/* Social Links & Location */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
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
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all"
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

      {/* Discography Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              Artist Discography
            </h3>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">
              Official catalog, master audio releases and original soundscapes
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#0e163d]/80 rounded-xl px-2.5 py-1 text-slate-300 text-xs shadow-inner">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popularity' | 'price')}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-[#0e163d] text-white">Newest</option>
                <option value="popularity" className="bg-[#0e163d] text-white">Popularity</option>
                <option value="price" className="bg-[#0e163d] text-white">Price</option>
              </select>
            </div>

            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full font-bold shrink-0">
              {sortedDiscographyTracks.length} Releases
            </span>
          </div>
        </div>

        {/* Discography Track List */}
        <div className="space-y-2">
          {sortedDiscographyTracks.map((track, idx) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className={`group flex items-center justify-between p-3 rounded-xl bg-[#0e163d]/40 hover:bg-[#121c4e] transition-all cursor-pointer ${
                  isCurrentPlaying ? 'bg-[#121c4e] ring-1 ring-cyan-500/40' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5 text-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                      isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 text-cyan-400 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-black truncate ${isCurrentPlaying ? 'text-cyan-400' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{track.genre || 'Electronic'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Headphones className="w-2.5 h-2.5 text-slate-500" />
                        {(track.streams || track.playCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  {track.isNFT && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      <Gem className="w-2.5 h-2.5" />
                      NFT {track.nftPrice} GRAM
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500 hidden sm:inline" />
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}

          {discographyTracks.length === 0 && (
            <div className="py-12 text-center bg-[#121833]/10 rounded-2xl">
              <Music className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                No discography releases uploaded yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Listed Music NFTs Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Gem className="w-4 h-4 text-purple-400" />
            Listed Music NFTs
          </h3>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
            Decentralized audio collectibles and exclusive master rights listed on the GRAM Blockchain
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
            <div className="col-span-full py-16 text-center bg-[#121833]/10 rounded-2xl">
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

