import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Gem, 
  Headphones, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { toast } from 'sonner';

export interface TrendingTrackItem {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  audioUrl?: string;
  price: string;
  currency?: string;
  streams: number;
  likes: number;
  edition?: string;
  isAuction?: boolean;
  genre?: string;
  rank?: number;
  artistVerified?: boolean;
  trackObj?: Track;
}

interface TrendingTracksSectionProps {
  title?: string;
  subtitle?: string;
}

export const TrendingTracksSection: React.FC<TrendingTracksSectionProps> = ({
  title = "Trending NFT Tracks",
}) => {
  const navigate = useNavigate();
  const { allTracks = [], allNFTs = [], playTrack, togglePlay, currentTrack, isPlaying } = useAudio();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollRef: scrollContainerRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  useEffect(() => {
    let isMounted = true;

    const fetchHighPerformingNFTs = async () => {
      setLoading(true);
      try {
        const nftsRef = collection(db, 'nfts');
        const q = query(nftsRef, limit(12));
        const snapshot = await getDocs(q);

        const fetchedItems: TrendingTrackItem[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const nftId = docSnap.id;
          const matchedTrack = allTracks.find(
            (t) => t.id === data.trackId || t.nftId === nftId || (t.title && data.title && t.title.toLowerCase() === data.title.toLowerCase())
          );

          fetchedItems.push({
            id: nftId,
            trackId: data.trackId || matchedTrack?.id || nftId,
            title: data.title || matchedTrack?.title || 'Untitled Track',
            artist: data.artist || data.creator || matchedTrack?.artist || 'Artist',
            artistId: data.artistId || matchedTrack?.artistId,
            coverUrl: data.imageUrl || data.coverUrl || matchedTrack?.coverUrl || '',
            audioUrl: data.audioUrl || matchedTrack?.audioUrl,
            price: String(data.price || matchedTrack?.nftPrice || matchedTrack?.price || '0'),
            currency: data.currency || 'TON',
            streams: Number(data.streams || matchedTrack?.playCount || matchedTrack?.streams || 0),
            likes: Number(data.likes || matchedTrack?.likes || 0),
            edition: data.edition || matchedTrack?.editions || '1/1',
            isAuction: Boolean(data.isAuction),
            genre: data.genre || matchedTrack?.genre || 'Music',
            artistVerified: Boolean(data.artistVerified ?? matchedTrack?.artistVerified),
            trackObj: matchedTrack
          });
        });

        if (fetchedItems.length === 0 && allNFTs.length > 0) {
          allNFTs.forEach((nft) => {
            if (!fetchedItems.some((f) => f.id === nft.id)) {
              const matchedTrack = allTracks.find((t) => t.id === nft.trackId || t.nftId === nft.id);
              fetchedItems.push({
                id: nft.id,
                trackId: nft.trackId || matchedTrack?.id || nft.id,
                title: nft.title || matchedTrack?.title || 'NFT Track',
                artist: nft.artist || nft.creator || matchedTrack?.artist || 'Artist',
                artistId: nft.artistId || matchedTrack?.artistId,
                coverUrl: nft.imageUrl || nft.coverUrl || matchedTrack?.coverUrl || '',
                audioUrl: nft.audioUrl || matchedTrack?.audioUrl,
                price: String(nft.price || '0'),
                currency: 'TON',
                streams: Number(matchedTrack?.playCount || matchedTrack?.streams || 0),
                likes: Number(matchedTrack?.likes || 0),
                edition: nft.edition || '1/1',
                genre: matchedTrack?.genre || 'Music',
                artistVerified: Boolean(nft.artistVerified ?? matchedTrack?.artistVerified),
                trackObj: matchedTrack
              });
            }
          });
        }

        fetchedItems.sort((a, b) => b.streams - a.streams);

        const rankedItems = fetchedItems.map((item, idx) => ({
          ...item,
          rank: idx + 1
        }));

        if (isMounted) {
          setTrendingTracks(rankedItems);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'nfts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHighPerformingNFTs();

    return () => {
      isMounted = false;
    };
  }, [allTracks, allNFTs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePlayToggle = (e: React.MouseEvent, item: TrendingTrackItem) => {
    e.stopPropagation();

    const audioUrl = item.trackObj?.audioUrl || item.audioUrl;
    if (!audioUrl) {
      toast.info('Audio preview unavailable');
      return;
    }

    const trackToPlay: Track = item.trackObj || ({
      id: item.trackId,
      songId: item.trackId,
      title: item.title,
      artist: item.artist,
      artistId: item.artistId || '',
      coverUrl: item.coverUrl,
      audioUrl,
      duration: 180,
      genre: item.genre || 'Music',
      isNFT: true,
      nftId: item.id,
      nftPrice: item.price,
      price: item.price,
      playCount: item.streams,
      streams: item.streams,
      likes: item.likes,
      createdAt: Date.now()
    } as Track);

    const isCurrent = currentTrack?.id === trackToPlay.id;
    if (isCurrent && isPlaying) {
      togglePlay();
    } else {
      playTrack(trackToPlay);
    }
  };

  if (!loading && trendingTracks.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 my-2"
    >
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              TOP PERFORMING NFT DATABASE
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        {...handlers}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 select-none w-full snap-x snap-mandatory overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`trending-skeleton-${i}`}
              className="min-w-[240px] max-w-[240px] bg-[#0c133a] rounded-2xl p-3.5 space-y-3 animate-pulse shrink-0"
            >
              <div className="w-full aspect-square bg-slate-800 rounded-xl" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
              <div className="h-2.5 bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-800 rounded-xl w-full" />
            </div>
          ))
        ) : (
          trendingTracks.map((item, idx) => {
            const isCurrentPlaying = currentTrack?.id === item.trackId && isPlaying;

            return (
              <motion.div
                key={`trending-track-${item.id}`}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ 
                  duration: 0.45, 
                  delay: Math.min(idx * 0.05, 0.35), 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/nft/${item.id}`)}
                className={`group relative min-w-[240px] max-w-[240px] bg-[#0c133a] hover:bg-[#10194a] rounded-2xl p-3.5 flex flex-col justify-between shrink-0 cursor-pointer transition-all duration-300 ${
                  isCurrentPlaying ? 'ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/10' : ''
                }`}
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-950">
                  <LazyArtworkImage
                    src={item.coverUrl || getPlaceholderImage(item.title)}
                    fallbackSrc={getPlaceholderImage(item.title)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow">
                    <span className="text-cyan-400">#{item.rank}</span>
                    <span className="text-[7.5px] text-slate-400 uppercase tracking-tighter">NFT</span>
                  </div>

                  {Number(item.price) > 0 && (
                    <div className="absolute top-2 right-2 bg-cyan-600/90 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-lg shadow flex items-center gap-1">
                      <Gem className="w-2.5 h-2.5 text-cyan-200" />
                      <span>{item.price} {item.currency}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => handlePlayToggle(e, item)}
                    className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isCurrentPlaying
                        ? 'bg-cyan-500 text-black scale-100 opacity-100'
                        : 'bg-black/60 hover:bg-cyan-500 text-white hover:text-black opacity-0 group-hover:opacity-100 group-hover:scale-105 backdrop-blur-sm'
                    }`}
                    aria-label={isCurrentPlaying ? "Pause Track" : "Play Track"}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] font-mono font-bold text-white/90 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Headphones className="w-2.5 h-2.5 text-cyan-400" />
                      {item.streams.toLocaleString()}
                    </span>
                    <span className="text-cyan-300 uppercase">{item.genre}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-xs font-black text-white truncate group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                    <span className="truncate">{item.artist}</span>
                    {item.artistVerified && (
                      <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0 inline" />
                    )}
                  </div>

                  <div className="pt-2 mt-2 flex items-center justify-between">
                    <div className="text-[8px] font-mono text-slate-400">
                      Edition <span className="text-slate-200 font-bold">{item.edition}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nft/${item.id}`);
                      }}
                      className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Collect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default TrendingTracksSection;
