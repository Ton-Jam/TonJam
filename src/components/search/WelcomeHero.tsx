import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Play, 
  Pause, 
  UserPlus, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft, 
  Headphones, 
  Flame, 
  Disc, 
  ArrowUpRight,
  BarChart2,
  Radio
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

export const WelcomeHero: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    recentlyPlayed, 
    artists, 
    allTracks, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay,
    followedUserIds, 
    toggleFollowUser,
    userProfile 
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'artists' | 'collections' | 'habits'>('artists');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const firstName = user?.displayName?.split(" ")[0] || "Voyager";

  // Analyze listening habits dynamically
  const listeningHabits = useMemo(() => {
    if (!recentlyPlayed || recentlyPlayed.length === 0) {
      const userFavs = userProfile?.favoriteGenres || [];
      const topGenre = userFavs[0] || 'Afrobeats';
      return {
        hasHistory: false,
        topGenre,
        genreCounts: { [topGenre]: 1 },
        totalPlays: 0,
        recentTracks: [],
        reasonText: `Tailored for your sound profile • ${topGenre}`,
        matchScore: '92%'
      };
    }

    const genreCounts: Record<string, number> = {};
    const artistCounts: Record<string, number> = {};

    recentlyPlayed.forEach((track) => {
      if (track.genre) {
        genreCounts[track.genre] = (genreCounts[track.genre] || 0) + 1;
      }
      if (track.artist) {
        artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
      }
    });

    let topGenre = 'Afrobeats';
    let maxGenreCount = 0;
    Object.entries(genreCounts).forEach(([g, count]) => {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        topGenre = g;
      }
    });

    let topArtistName = '';
    let maxArtistCount = 0;
    Object.entries(artistCounts).forEach(([art, count]) => {
      if (count > maxArtistCount) {
        maxArtistCount = count;
        topArtistName = art;
      }
    });

    const reasonText = topArtistName 
      ? `Based on your recent listening to ${topArtistName}`
      : `Calculated from your preference for ${topGenre}`;

    const matchPercentage = Math.min(99, 84 + Math.min(15, recentlyPlayed.length * 2));

    return {
      hasHistory: true,
      topGenre,
      topArtistName,
      lastTrackTitle: recentlyPlayed[0]?.title,
      genreCounts,
      totalPlays: recentlyPlayed.length,
      recentTracks: recentlyPlayed.slice(0, 5),
      reasonText,
      matchScore: `${matchPercentage}% Match`
    };
  }, [recentlyPlayed, userProfile]);

  // Recommended Artists based on listening habits
  const recommendedArtists = useMemo(() => {
    if (!artists || artists.length === 0) return [];

    const topG = listeningHabits.topGenre.toLowerCase();
    
    let matching = artists.filter(a => {
      const aGenre = (a.genre || '').toLowerCase();
      return aGenre.includes(topG) || topG.includes(aGenre);
    });

    if (matching.length === 0) {
      matching = [...artists];
    }

    return matching.slice(0, 4).map((artist, idx) => {
      const artistId = (artist as any).id || artist.uid || `art-${idx}`;
      const artistName = artist.name;
      const topTrack = allTracks.find(t => 
        t.artistId === artistId || 
        (t.artist && t.artist.toLowerCase() === artistName?.toLowerCase())
      ) || allTracks.find(t => t.genre?.toLowerCase().includes(topG)) || allTracks[0];

      return {
        artist,
        artistId,
        topTrack,
        isFollowed: followedUserIds.includes(artistId),
        genre: artist.genre || listeningHabits.topGenre,
        listeners: artist.monthlyListeners 
          ? `${(artist.monthlyListeners / 1000).toFixed(1)}K` 
          : '18.5K',
        matchScore: listeningHabits.hasHistory ? `${98 - idx * 3}% Affinity` : '89% Affinity',
        reason: listeningHabits.hasHistory 
          ? `Matches your ${listeningHabits.topGenre} frequency` 
          : 'Trending TON Web3 Creator'
      };
    });
  }, [artists, allTracks, listeningHabits, followedUserIds]);

  // Recommended Collections based on listening habits
  const recommendedCollections = useMemo(() => {
    const topG = listeningHabits.topGenre;

    return [
      {
        id: 'col-rec-1',
        title: `${topG} Sovereign Master Stems`,
        creator: 'TON Audio Protocol',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
        genre: topG,
        floorPrice: '2.8 TON',
        totalVolume: '520 TON',
        itemsCount: 150,
        description: `Exclusive limited-edition master audio stems optimized for ${topG} producers and collectors.`,
        matchScore: '98% Synergy',
        badge: `Top ${topG} Pick`
      },
      {
        id: 'col-rec-2',
        title: 'Vibe Alchemist Genesis Vault',
        creator: 'Alchemist Wave',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
        genre: 'Electronic',
        floorPrice: '1.5 TON',
        totalVolume: '380 TON',
        itemsCount: 88,
        description: 'Generative sonic frequencies minted directly on the TON blockchain with royalty split contracts.',
        matchScore: '91% Synergy',
        badge: 'Genesis Drop'
      },
      {
        id: 'col-rec-3',
        title: 'TON Cyber Resonance Gold',
        creator: 'DJ Krupy',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
        genre: 'Phonk & Synth',
        floorPrice: '4.2 TON',
        totalVolume: '1.2K TON',
        itemsCount: 50,
        description: 'High-fidelity audio NFTs unlocking exclusive backstage live spaces and studio stems.',
        matchScore: '89% Synergy',
        badge: 'VIP Collectible'
      }
    ];
  }, [listeningHabits]);

  // Current item in slide
  const currentArtistItem = recommendedArtists[currentSlideIndex % Math.max(1, recommendedArtists.length)];
  const currentCollectionItem = recommendedCollections[currentSlideIndex % recommendedCollections.length];

  const handleNextSlide = () => {
    const maxSlides = activeTab === 'artists' ? recommendedArtists.length : recommendedCollections.length;
    if (maxSlides > 0) {
      setCurrentSlideIndex((prev) => (prev + 1) % maxSlides);
    }
  };

  const handlePrevSlide = () => {
    const maxSlides = activeTab === 'artists' ? recommendedArtists.length : recommendedCollections.length;
    if (maxSlides > 0) {
      setCurrentSlideIndex((prev) => (prev - 1 + maxSlides) % maxSlides);
    }
  };

  // Play track handler
  const handlePlayRecommendedTrack = (track: any) => {
    if (!track) return;
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
      toast.success(`Playing ${track.title} by ${track.artist}`);
    }
  };

  const isCurrentTrackPlaying = currentTrack && currentArtistItem?.topTrack && currentTrack.id === currentArtistItem.topTrack.id && isPlaying;

  return (
    <div className="relative px-4 py-6 md:py-8 mb-4 overflow-hidden rounded-2xl bg-[#0c133a] text-white shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B4D8]/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-[#00B4D8]/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#00B4D8] fill-[#00B4D8]" />
                <span className="text-[9px] font-black text-[#00B4D8] uppercase tracking-[0.15em]">
                  System Synced
                </span>
              </div>
              <div className="bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Headphones className="w-3 h-3 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.12em]">
                  {listeningHabits.hasHistory 
                    ? `${listeningHabits.totalPlays} Streams • Top: ${listeningHabits.topGenre}` 
                    : `Listening Profile Active`}
                </span>
              </div>
              <div className="bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                  {listeningHabits.matchScore}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight mt-1">
              Welcome back, <span className="text-[#00B4D8]">{firstName}</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium max-w-lg">
              {listeningHabits.reasonText}
            </p>
          </div>

          {/* Navigation Tab Selector */}
          <div className="flex items-center gap-1 bg-[#070c27] p-1 rounded-xl shrink-0 self-start sm:self-center">
            <button
              onClick={() => { setActiveTab('artists'); setCurrentSlideIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'artists'
                  ? 'bg-[#00B4D8] text-[#050A24] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Recommended Artists</span>
            </button>
            <button
              onClick={() => { setActiveTab('collections'); setCurrentSlideIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'collections'
                  ? 'bg-[#00B4D8] text-[#050A24] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-3 h-3" />
              <span>Collections</span>
            </button>
            <button
              onClick={() => { setActiveTab('habits'); setCurrentSlideIndex(0); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'habits'
                  ? 'bg-[#00B4D8] text-[#050A24] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              <span className="hidden md:inline">Listening Habits</span>
              <span className="md:hidden">Habits</span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'artists' && currentArtistItem && (
            <motion.div
              key={`artist-${currentArtistItem.artistId}-${currentSlideIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="relative bg-[#070d2b]/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch gap-5"
            >
              {/* Left Column: Artist Profile & Artwork */}
              <div className="flex items-center gap-4 md:w-1/2">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-900 shadow-md">
                  <img
                    src={currentArtistItem.artist.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={currentArtistItem.artist.name}
                    className="w-full h-full object-cover"
                  />
                  {currentArtistItem.artist.verified && (
                    <div className="absolute top-1.5 right-1.5 bg-[#00B4D8] text-black p-1 rounded-full shadow">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-0.5 rounded">
                      {currentArtistItem.reason}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white truncate">
                    {currentArtistItem.artist.name}
                  </h3>

                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                    {currentArtistItem.artist.bio || `Creating high-vibe ${currentArtistItem.genre} soundscapes on TON.`}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                    <span>{currentArtistItem.listeners} Monthly Listeners</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{currentArtistItem.matchScore}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Featured Track Preview & Quick Actions */}
              <div className="flex flex-col justify-between md:w-1/2 bg-[#0d1645] p-3.5 sm:p-4 rounded-xl gap-3">
                {currentArtistItem.topTrack ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={currentArtistItem.topTrack.coverUrl}
                        alt={currentArtistItem.topTrack.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 shadow"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Top Recommended Track
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {currentArtistItem.topTrack.title}
                        </h4>
                        <p className="text-[10px] text-[#00B4D8] font-mono">
                          {currentArtistItem.topTrack.genre}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayRecommendedTrack(currentArtistItem.topTrack)}
                      className="w-10 h-10 rounded-full bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-[#050A24] flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
                      title={isCurrentTrackPlaying ? "Pause Track" : "Play Track"}
                    >
                      {isCurrentTrackPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No track preview available</div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      toggleFollowUser(currentArtistItem.artistId);
                      toast.success(
                        currentArtistItem.isFollowed 
                          ? `Unfollowed ${currentArtistItem.artist.name}` 
                          : `Following ${currentArtistItem.artist.name}!`
                      );
                    }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                      currentArtistItem.isFollowed
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-[#00B4D8] text-[#050A24] hover:bg-[#00B4D8]/90'
                    }`}
                  >
                    {currentArtistItem.isFollowed ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow Artist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/artist/${currentArtistItem.artistId}`)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <span>Profile</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'collections' && currentCollectionItem && (
            <motion.div
              key={`collection-${currentCollectionItem.id}-${currentSlideIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="relative bg-[#070d2b]/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch gap-5"
            >
              {/* Collection Artwork */}
              <div className="relative w-full md:w-44 h-36 md:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-900 shadow-md">
                <img
                  src={currentCollectionItem.coverUrl}
                  alt={currentCollectionItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-[#00B4D8] uppercase tracking-wider">
                  {currentCollectionItem.badge}
                </div>
              </div>

              {/* Collection Details */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#00B4D8]">
                      {currentCollectionItem.matchScore}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {currentCollectionItem.genre}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                    {currentCollectionItem.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {currentCollectionItem.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#0d1645] p-2.5 rounded-xl text-center">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">Floor Price</span>
                    <span className="text-xs font-black text-[#00B4D8]">{currentCollectionItem.floorPrice}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">Volume</span>
                    <span className="text-xs font-black text-white">{currentCollectionItem.totalVolume}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">Items</span>
                    <span className="text-xs font-black text-slate-300">{currentCollectionItem.itemsCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="flex-1 py-2.5 rounded-lg bg-[#00B4D8] text-[#050A24] font-black text-[10px] uppercase tracking-wider hover:bg-[#00B4D8]/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Marketplace Collection</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div
              key="listening-habits-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="relative bg-[#070d2b]/80 rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Your Sound Frequency Analytics
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Real-time listening statistics driving your personal AI recommendations.
                  </p>
                </div>

                <div className="bg-[#00B4D8]/10 text-[#00B4D8] px-3 py-1 rounded-lg text-[10px] font-mono font-bold">
                  {listeningHabits.totalPlays} Streams Analyzed
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#0d1645] p-3 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                    Top Genre Frequency
                  </span>
                  <div className="text-base font-black text-[#00B4D8]">
                    {listeningHabits.topGenre}
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Highest streaming affinity in your session history.
                  </p>
                </div>

                <div className="bg-[#0d1645] p-3 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                    Recommendation Match Engine
                  </span>
                  <div className="text-base font-black text-emerald-400">
                    {listeningHabits.matchScore}
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Confidence score calculated from audio feature vectors.
                  </p>
                </div>

                <div className="bg-[#0d1645] p-3 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                    Top Played Creator
                  </span>
                  <div className="text-base font-black text-white truncate">
                    {listeningHabits.topArtistName || 'Explored Artists'}
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Most repeated creator in your active queue.
                  </p>
                </div>
              </div>

              {/* Recent Tracks List */}
              {listeningHabits.recentTracks.length > 0 && (
                <div className="pt-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-2">
                    Recent Frequency Signals
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {listeningHabits.recentTracks.map((tr) => (
                      <button
                        key={`recent-signal-${tr.id}`}
                        onClick={() => playTrack(tr)}
                        className="flex items-center gap-2 bg-[#0d1645] hover:bg-[#121d5c] px-2.5 py-1.5 rounded-lg shrink-0 transition-colors text-left"
                      >
                        <img src={tr.coverUrl} alt={tr.title} className="w-6 h-6 rounded object-cover" />
                        <div className="min-w-0 max-w-[120px]">
                          <span className="text-[10px] font-bold text-white truncate block">{tr.title}</span>
                          <span className="text-[8px] text-slate-400 truncate block">{tr.artist}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Slide Indicators & Controls (For Artists and Collections) */}
        {activeTab !== 'habits' && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {(activeTab === 'artists' ? recommendedArtists : recommendedCollections).map((_, idx) => (
                <button
                  key={`slide-dot-${idx}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlideIndex % (activeTab === 'artists' ? recommendedArtists.length : recommendedCollections.length) === idx
                      ? 'w-6 bg-[#00B4D8]'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevSlide}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Previous recommendation"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Next recommendation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
