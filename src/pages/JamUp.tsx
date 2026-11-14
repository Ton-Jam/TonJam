import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  Flame, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Zap,
  LayoutGrid,
  Play,
  ShoppingBag as ShoppingBagIcon
} from 'lucide-react';
import { HorizontalSection } from '@/components/layout/HorizontalSection';
import { MusicCard } from '@/components/cards/MusicCard';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { NFTCard } from '@/components/cards/NFTCard';
import { CollectionCard } from '@/components/cards/CollectionCard';
import { Hero, PageTitle, SectionTitle, Label } from '@/components/ui/typography/Typography';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TJ_COIN_ICON } from '@/constants';
import confetti from 'canvas-confetti';

// --- New Premium Home Components ---
import { HomeQuickAccess } from '@/components/home/HomeQuickAccess';
import { HomeVibeTicker } from '@/components/home/HomeVibeTicker';
import { TrendingNFTVolumeChart } from '@/components/home/TrendingNFTVolumeChart';
import ContinueListeningCard from '@/components/ContinueListeningCard';
import MoodPlaylist from '@/components/MoodPlaylist';
import { Moon, Target, Smile, Frown } from 'lucide-react';
import { Track } from '@/types';
import RecentlyMintedNFTs from '@/components/RecentlyMintedNFTs';

interface LiveSpaceItem {
  id: string;
  title: string;
  host: string;
  listeners: string;
  nowPlaying: string;
  imageUrl: string;
  status: string;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'spaces', label: 'Spaces' }
] as const;

// --- Sub-components for customized UI items ---

const FeedCard = ({ space }: { space: LiveSpaceItem }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-[calc(100vw-32px)] sm:w-[380px] aspect-[16/10] rounded-[32px] overflow-hidden cursor-pointer flex-shrink-0 snap-start bg-slate-900 shadow-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300"
      onClick={() => navigate('/jamspace')}
    >
      {space.imageUrl && <img src={space.imageUrl} alt={space.title} className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-4" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {space.status}
        </span>
        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {space.listeners} listening
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">{space.host}</p>
        <h4 className="text-base font-black text-white leading-tight uppercase tracking-tight">{space.title}</h4>
        <p className="text-[11px] text-white/70 truncate mt-1">Spinning: {space.nowPlaying}</p>
      </div>
    </motion.div>
  );
};

// --- Viewport Entrance Motion Wrapper ---

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function JamUp() {
  const navigate = useNavigate();
  const { allTracks, artists, allNFTs, getRecommendations, playTrack, playAll } = useAudio();
  const { user, userProfile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'music' | 'nfts' | 'spaces'>('all');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sponsoredItems, setSponsoredItems] = useState<CarouselItem[]>([]);
  const [liveSpaces, setLiveSpaces] = useState<LiveSpaceItem[]>([]);

  useEffect(() => {
    const qSponsored = query(collection(db, 'sponsoredContent'), where('status', '==', 'active'));
    const unsubSponsored = onSnapshot(qSponsored, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title || 'Sponsored',
          subtitle: data.description || data.subtitle || '',
          imageUrl: data.imageUrl || data.bannerUrl || '',
          link: data.targetUrl || data.link || '/marketplace',
          cta: data.cta || 'Explore',
        } as CarouselItem;
      }).filter((item) => item.imageUrl);
      setSponsoredItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sponsoredContent');
    });

    const qStreams = query(collection(db, 'liveStreams'), where('status', '==', 'live'));
    const unsubStreams = onSnapshot(qStreams, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title || 'Live Jam Session',
          host: data.artistName || data.hostName || 'Artist',
          listeners: String(data.viewersCount || 0),
          nowPlaying: data.currentTrackTitle || data.genre || 'Live Stream',
          imageUrl: data.thumbnailUrl || data.coverUrl || '',
          status: 'Live',
        } as LiveSpaceItem;
      });
      setLiveSpaces(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'liveStreams');
    });

    return () => {
      unsubSponsored();
      unsubStreams();
    };
  }, []);

  const MOOD_GENRES_MAP = useMemo<Record<string, string[]>>(() => ({
    chill: ['lofi', 'ambient', 'jazz', 'r&b', 'classical', 'synthwave'],
    energetic: ['electronic', 'techno', 'house', 'rock', 'afrobeats', 'pop', 'synthwave', 'amapiano'],
    focus: ['lofi', 'ambient', 'classical', 'synthwave'],
    happy: ['pop', 'funk', 'reggae', 'afrobeats', 'amapiano'],
    melancholic: ['lofi', 'r&b', 'jazz', 'rock', 'ambient']
  }), []);

  const curatedMoodTracks = useMemo(() => {
    if (!selectedMood) return [];
    
    const mappedGenres = MOOD_GENRES_MAP[selectedMood] || [];
    
    return allTracks.filter((track) => {
      const trackMoodLower = (track as any).mood?.toLowerCase() || '';
      const isMoodMatch = trackMoodLower === selectedMood || trackMoodLower.includes(selectedMood);
      
      const trackGenreLower = track.genre?.toLowerCase() || '';
      const isGenreMatch = mappedGenres.some(g => trackGenreLower.includes(g) || g.includes(trackGenreLower));
      
      return isMoodMatch || isGenreMatch;
    });
  }, [selectedMood, allTracks, MOOD_GENRES_MAP]);

  const { recommendedTracks, recommendedNFTs } = getRecommendations();

  const trendingTracks = useMemo(() => {
    return [...allTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  }, [allTracks]);

  const newDrops = useMemo(() => {
    return [...allTracks].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 10);
  }, [allTracks]);

  const trendingArtists = useMemo(() => {
    return [...artists].sort((a, b) => (b.followers || 0) - (a.followers || 0)).slice(0, 8);
  }, [artists]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const showSponsored = activeFilter === 'all';
  const showSpaces = activeFilter === 'all' || activeFilter === 'spaces';
  const showMusic = activeFilter === 'all' || activeFilter === 'music';
  const showNFTs = activeFilter === 'all' || activeFilter === 'nfts';

  return (
    <div className="pb-[160px] pt-4 bg-background text-foreground min-h-screen">
      
      {/* Personalized Header & Stats */}
      <div className="px-4 mb-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">
            {greeting}
          </span>
          <Hero className="text-3xl sm:text-4xl leading-tight">
            {userProfile?.username || user?.displayName?.split(' ')[0] || 'Jammer'}
          </Hero>
        </motion.div>

        {user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
            onClick={() => navigate('/wallet')}
          >
            <div className="flex flex-col items-end cursor-pointer">
              <div className="flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors">
                <img src={TJ_COIN_ICON} alt="JAM" className="w-4 h-4 object-contain" />
                <span className="text-sm font-black font-mono text-blue-400">
                  {parseFloat(String(userProfile?.jamBalance || '0')).toLocaleString()}
                </span>
                <span className="text-[9px] font-black uppercase opacity-60 text-blue-400">JAM</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Live Vibe Ticker */}
      <HomeVibeTicker />

      {/* Quick Access Grid */}
      <HomeQuickAccess />

      {/* Mood Alignment Selector */}
      <SectionWrapper>
        <div className="px-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Choose Your Vibe</h2>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {[
              { id: 'chill', name: 'Chill', icon: Moon, color: 'from-[#00F2FE] to-[#4FACFE]', textAccent: 'text-[#00F2FE]' },
              { id: 'energetic', name: 'Hype', icon: Zap, color: 'from-[#FF0844] to-[#FFB199]', textAccent: 'text-[#FF0844]' },
              { id: 'focus', name: 'Focus', icon: Target, color: 'from-[#00CDAC] to-[#8DDAD3]', textAccent: 'text-[#00CDAC]' },
              { id: 'happy', name: 'Happy', icon: Smile, color: 'from-[#FAD961] to-[#F76B1C]', textAccent: 'text-[#FAD961]' },
              { id: 'melancholic', name: 'Deep', icon: Frown, color: 'from-[#B352E4] to-[#761AC2]', textAccent: 'text-[#B352E4]' },
            ].map((mood) => {
              const MoodIcon = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={mood.id}
                  onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl w-[88px] shrink-0 transition-all duration-300 outline-none cursor-pointer border-none text-center ${
                    isSelected 
                      ? `bg-gradient-to-br ${mood.color} text-slate-950 shadow-lg shadow-indigo-500/10` 
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <MoodIcon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-slate-950' : mood.textAccent}`} />
                  <span className={`text-[10px] font-black tracking-tight uppercase ${isSelected ? 'text-slate-950' : 'text-slate-200'}`}>
                    {mood.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4">
            <MoodPlaylist
              selectedMood={selectedMood}
              onClear={() => setSelectedMood(null)}
              tracks={curatedMoodTracks}
              onPlayTrack={playTrack}
              onPlayAll={playAll}
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Filter Chips */}
      <div className="px-4 mb-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={isActive}
                className={`relative px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border ${
                  isActive 
                    ? 'text-white border-[#c0c0c0]/40' 
                    : 'text-muted-foreground hover:text-foreground bg-muted/20 border-[#c0c0c0]/25'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    className="absolute inset-0 bg-[#0088CC] rounded-xl -z-10 shadow-lg shadow-[#0088CC]/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-[48px]">

        {/* Jump Back In / Recently Played */}
        {showMusic && (allTracks.length > 0) && (
          <SectionWrapper>
            <div className="px-4 space-y-4">
              <SectionTitle className="text-xl">Jump Back In</SectionTitle>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {allTracks.slice(0, 5).map((track) => (
                  <div key={track.id} className="w-[280px] shrink-0">
                    <ContinueListeningCard
                      title={track.title}
                      artist={track.artist}
                      coverUrl={track.coverUrl || (track as any).imageUrl || ""}
                      onPlay={() => playTrack(track)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* Spotlight Bento Section */}
        {showSponsored && (
          <SectionWrapper>
            <div className="px-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              {sponsoredItems.length > 0 && (
                <div className="md:col-span-8">
                  <AutoCarousel items={sponsoredItems} interval={5500} />
                </div>
              )}
              <div className={sponsoredItems.length > 0 ? "md:col-span-4 hidden md:flex flex-col gap-4" : "md:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                <div className="flex-1 rounded-[32px] bg-gradient-to-br from-indigo-600 to-blue-700 p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={() => navigate('/tasks')}>
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-32 h-32" />
                  </div>
                  <div>
                    <Badge className="bg-white/20 text-white border-none mb-4 uppercase text-[10px] tracking-widest font-black">Missions</Badge>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Daily<br/>Rewards</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/80">Earn TJ Tokens</span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 rounded-[32px] bg-zinc-900 border border-white/5 p-6 flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/marketplace')}>
                  <div>
                    <Badge className="bg-amber-500/10 text-amber-500 border-none mb-4 uppercase text-[10px] tracking-widest font-black">Marketplace</Badge>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">New<br/>Drops</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-500">Collect NFTs</span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                      <ShoppingBagIcon className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        )}

        {/* Trending Tracks */}
        {showMusic && trendingTracks.length > 0 && (
          <SectionWrapper>
            <HorizontalSection 
              title="Trending Tracks" 
              onViewAll={() => navigate('/discover')}
            >
              {trendingTracks.map((track) => (
                <MusicCard 
                  key={track.id} 
                  id={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl || (track as any).imageUrl || ""}
                  onClick={() => playTrack(track)}
                />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* Live Spaces */}
        {showSpaces && liveSpaces.length > 0 && (
          <SectionWrapper>
            <HorizontalSection title="Live Now">
              {liveSpaces.map((space) => (
                <FeedCard key={space.id} space={space} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* Trending Artists */}
        {showMusic && trendingArtists.length > 0 && (
          <SectionWrapper>
            <HorizontalSection 
              title="Top Artists" 
            >
              {trendingArtists.map((artist) => (
                <ArtistCard 
                  key={artist.uid} 
                  name={artist.name}
                  avatarUrl={artist.avatarUrl}
                  followers={artist.followers?.toString()}
                />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* New Releases */}
        {showMusic && newDrops.length > 0 && (
          <SectionWrapper>
            <HorizontalSection 
              title="Fresh Releases" 
            >
              {newDrops.map((track) => (
                <MusicCard 
                  key={track.id} 
                  id={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl || (track as any).imageUrl || ""}
                  onClick={() => playTrack(track)}
                />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* Trending NFTs */}
        {showNFTs && (
          <SectionWrapper>
            <TrendingNFTVolumeChart />
          </SectionWrapper>
        )}

        {/* Digital Collectibles */}
        {showNFTs && allNFTs.length > 0 && (
          <SectionWrapper>
            <HorizontalSection 
              title="Digital Collectibles" 
              onViewAll={() => navigate('/marketplace')}
            >
              {allNFTs.slice(0, 8).map((nft) => (
                <NFTCard 
                  key={nft.id} 
                  nft={{
                    id: nft.id,
                    title: nft.title,
                    creator: nft.creator || nft.artist || "",
                    imageUrl: nft.imageUrl || nft.coverUrl || "",
                    price: nft.price
                  }}
                />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* Recently Minted NFTs */}
        {showNFTs && (
          <SectionWrapper>
            <RecentlyMintedNFTs />
          </SectionWrapper>
        )}

        {/* Recommended Tracks */}
        {showMusic && recommendedTracks.length > 0 && (
          <SectionWrapper>
            <HorizontalSection 
              title="Picked For You" 
            >
              {recommendedTracks.map((track) => (
                <MusicCard 
                  key={track.id} 
                  id={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl || (track as any).imageUrl || ""}
                  onClick={() => playTrack(track)}
                />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

      </div>
    </div>
  );
}
