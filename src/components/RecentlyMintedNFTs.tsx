import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  CheckCircle, 
  Flame, 
  ArrowUpRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNFT } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { TON_LOGO, MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { NFTItem, Track } from '@/types';

interface RecentlyMintedNFTsProps {
  title?: string;
  className?: string;
}

const RecentlyMintedNFTs: React.FC<RecentlyMintedNFTsProps> = ({ 
  title = "Recently Added", 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { nfts, mintingStatus } = useNFT();
  const { currentTrack, isPlaying, playTrack, togglePlay, allTracks, artists } = useAudio();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Combine NFTs from NFTProvider and completed mints
  const recentNFTs = useMemo(() => {
    const list: NFTItem[] = [...(nfts || [])];

    // Check if any in-progress or freshly completed mints from mintingStatus can be included
    Object.values(mintingStatus || {}).forEach((status) => {
      if (status.step === 'completed' && status.trackId) {
        const existing = list.find(n => n.trackId === status.trackId);
        if (!existing) {
          list.unshift({
            id: `mint-${status.trackId}-${status.timestamp || Date.now()}`,
            trackId: status.trackId,
            title: status.title || 'Newly Minted Track',
            artist: status.artist || 'TonJam Creator',
            creator: status.artist || 'TonJam Creator',
            owner: 'Current User',
            price: status.price || '2.5 TON',
            imageUrl: status.coverUrl || 'https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20genesis%20beats%20neon%20orange?width=400&height=400&nologo=true',
            edition: status.editions ? `1 of ${status.editions}` : 'Genesis',
            rarity: 'Rare',
            artistVerified: true,
            createdAt: new Date(status.timestamp || Date.now()).toISOString()
          });
        }
      }
    });

    // Sort by createdAt descending or id order to show freshest first
    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [nfts, mintingStatus]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handlePlayPreview = (e: React.MouseEvent, nft: NFTItem) => {
    e.stopPropagation();
    
    // Check if currently playing this track
    const isThisPlaying = currentTrack?.id === nft.trackId && isPlaying;
    if (isThisPlaying) {
      togglePlay();
      return;
    }

    // Match track from audio context or create lightweight track
    const trackPool = (allTracks && allTracks.length > 0) ? allTracks : MOCK_TRACKS;
    const matchedTrack = trackPool.find(t => t.id === nft.trackId);

    if (matchedTrack) {
      playTrack(matchedTrack);
    } else {
      const fallbackTrack: Partial<Track> & Track = {
        id: nft.trackId || nft.id,
        songId: nft.trackId || nft.id,
        title: nft.title,
        artist: nft.artist || nft.creator || 'TonJam Artist',
        artistId: nft.artistId || 'artist-1',
        audioUrl: nft.audioUrl || (trackPool[0]?.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
        coverUrl: nft.imageUrl || nft.coverUrl || '',
        duration: 195,
        playCount: 1200,
        streams: 1200,
        likes: 340,
        genre: 'Electronic',
        isNFT: true,
        nftId: nft.id
      } as Track;
      playTrack(fallbackTrack);
    }
  };

  const getCreatorDetails = (nft: NFTItem) => {
    const creatorName = nft.artist || nft.creator || 'TonJam Artist';
    const artistList = artists && artists.length > 0 ? artists : MOCK_ARTISTS;
    const matchedArtist = artistList.find(
      (a) =>
        (nft.artistId && a.uid === nft.artistId) ||
        a.name.toLowerCase() === creatorName.toLowerCase() ||
        a.username?.toLowerCase() === creatorName.toLowerCase()
    );

    const artistUid = nft.artistId || matchedArtist?.uid || 'dj-krupy';
    const avatarUrl =
      (nft as any).creatorAvatar ||
      (nft as any).artistAvatar ||
      matchedArtist?.avatarUrl ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creatorName)}`;
    const isVerified =
      matchedArtist?.isVerifiedArtist ??
      matchedArtist?.verified ??
      nft.artistVerified ??
      true;

    return {
      name: creatorName,
      uid: artistUid,
      avatarUrl,
      isVerified,
    };
  };

  const handleCreatorClick = (e: React.MouseEvent, artistUid: string) => {
    e.stopPropagation();
    navigate(`/artist/${artistUid}`);
  };

  if (!recentNFTs || recentNFTs.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white">{title}</h2>
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[165px] max-w-[165px] h-[220px] bg-[#0A113A]/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* SECTION HEADER WITH SCROLL CONTROLS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-ping" />
          <h2 className="text-base sm:text-lg font-black text-white">{title}</h2>
          <span className="text-[10px] font-black text-[#00B4D8] uppercase tracking-wider bg-[#00B4D8]/10 px-2 py-0.5 rounded-full">
            Live Mints
          </span>
        </div>

        {/* Scroll action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-0.5 scroll-smooth snap-x snap-mandatory"
      >
        {recentNFTs.map((nft, idx) => {
          const isThisTrackPlaying = currentTrack?.id === nft.trackId && isPlaying;
          const displayPrice = nft.price.toLowerCase().includes('ton') 
            ? nft.price 
            : `${nft.price} TON`;
          const creator = getCreatorDetails(nft);

          return (
            <motion.div
              key={nft.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.24), ease: 'easeOut' }}
              onClick={() => navigate(`/nft/${nft.id}`)}
              className="min-w-[165px] max-w-[165px] sm:min-w-[180px] sm:max-w-[180px] snap-start shrink-0 bg-[#0A113A]/60 hover:bg-[#0E1644] p-3 rounded-2xl cursor-pointer group flex flex-col justify-between space-y-2.5 transition-colors select-none"
            >
              {/* ARTWORK & PLAY OVERLAY */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 shadow-lg">
                <img
                  src={nft.imageUrl || nft.coverUrl}
                  alt={nft.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Live Tag / Rarity Tag */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/65 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                  <Flame className="w-2.5 h-2.5 text-[#FF3A5C]" />
                  <span>{nft.rarity || 'New'}</span>
                </div>

                {/* Edition Tag */}
                {nft.edition && (
                  <div className="absolute top-2 right-2 bg-black/65 backdrop-blur-xs px-1.5 py-0.5 rounded-sm text-[8px] font-black text-slate-300">
                    {nft.edition}
                  </div>
                )}

                {/* Quick Play Preview Button Overlay */}
                <button
                  onClick={(e) => handlePlayPreview(e, nft)}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#5B6BFF] hover:bg-[#4a58eb] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                  aria-label={isThisTrackPlaying ? "Pause audio preview" : "Play audio preview"}
                >
                  {isThisTrackPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* CARD INFO & PRICE */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white truncate group-hover:text-[#5B6BFF] transition-colors">
                  {nft.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                  <div className="flex items-center gap-1 text-slate-200">
                    <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                    <span className="text-white font-black">{displayPrice}</span>
                  </div>
                  <div className="text-[#5B6BFF] group-hover:translate-x-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* CREATOR FOOTER AREA */}
              <div
                onClick={(e) => handleCreatorClick(e, creator.uid)}
                className="flex items-center gap-2 pt-1 mt-0.5 group/creator cursor-pointer hover:opacity-90 transition-opacity"
                title={`View ${creator.name}'s profile`}
              >
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  loading="lazy"
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/10 group-hover/creator:ring-[#5B6BFF]/60 transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creator.name)}`;
                  }}
                />
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-[#9AA0AE] group-hover/creator:text-[#5B6BFF] truncate transition-colors">
                    {creator.name}
                  </span>
                  {creator.isVerified && (
                    <CheckCircle className="w-2.5 h-2.5 text-blue-400 fill-current shrink-0" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyMintedNFTs;

