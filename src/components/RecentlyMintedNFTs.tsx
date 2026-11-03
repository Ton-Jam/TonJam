import React, { useMemo } from 'react';
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
import { getPlaceholderImage } from '@/lib/utils';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { NFTCard } from '@/components/music';

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
  const { scrollRef: scrollContainerRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

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
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full">
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
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B4D8] animate-ping" />
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
          <span className="text-[10px] font-semibold text-[#00B4D8] uppercase tracking-wider bg-[#00B4D8]/10 px-2 py-0.5 rounded-full">
            Live Mints
          </span>
        </div>

        {/* Scroll action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#0A113A]/80 hover:bg-[#121c54] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div
        ref={scrollContainerRef}
        {...handlers}
        className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-0.5 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full scroll-smooth snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        {recentNFTs.map((nft, idx) => {
          const displayPrice = nft.price.toLowerCase().includes('ton') 
            ? nft.price.replace(/ton/i, '').trim() 
            : nft.price;

          return (
            <motion.div
              key={nft.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.24), ease: 'easeOut' }}
              className="w-[175px] sm:w-[195px] shrink-0 snap-start"
            >
              <NFTCard
                nft={{
                  ...nft,
                  price: displayPrice,
                }}
                variant="sale"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyMintedNFTs;

