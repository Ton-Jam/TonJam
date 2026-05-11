import GetFreeTokensModal from '@/components/GetFreeTokensModal';
import CompleteProfilePrompt from '@/components/CompleteProfilePrompt';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search, X } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES } from '@/constants';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import SkeletonCard from '@/components/SkeletonCard';
import Leaderboard from '@/components/Leaderboard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import NFTAlphaCarousel from '@/components/NFTAlphaCarousel';
import SectionHeader from '@/components/SectionHeader';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import { SearchCommandDialog } from '@/components/SearchCommandDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import { generateAIPlaylist, GenerateAIPlaylistResult } from '@/services/aiPlaylistService';
import { Loader2, Brain, Sparkle } from 'lucide-react';

const HomeSection = ({ title, icon: Icon, link, children }: { title: string, icon: React.ElementType, link?: string, children: React.ReactNode }) => {
  return (
    <section className="section-container">
      <SectionHeader title={title} viewAllLink={link} />
      <div className="scroll-row">
        {children}
      </div>
    </section>
  );
};

const FEATURED_TRACKS_CAROUSEL: CarouselItem[] = MOCK_TRACKS.slice(0, 3).map(track => ({
  id: track.id,
  title: track.title,
  subtitle: track.artist,
  imageUrl: track.coverUrl,
  link: `/track/${track.id}`,
  cta: 'Play'
}));

const WelcomeBanner = ({ onDismiss, onGetTokens }: { onDismiss: () => void, onGetTokens: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    >
      <Card className="relative overflow-hidden border-none bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/20">
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Welcome to TonJam</h2>
                <Badge variant="outline" className="w-fit mx-auto md:mx-0 bg-white/10 border-white/20 text-white uppercase text-[8px] tracking-[0.2em]">v2.1_CORE</Badge>
              </div>
              <p className="text-white/80 font-medium max-w-xl text-sm leading-relaxed">
                You've just entered the future of music. Discover decentralized sounds, collect rare NFTs, and connect with your favorite artists on the TON blockchain.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <button 
                  onClick={onDismiss}
                  className="px-6 py-2 bg-white text-blue-600 font-black uppercase tracking-widest rounded-full text-[10px] hover:bg-neutral-100 transition-all shadow-lg active:scale-95"
                >
                  Start Exploring
                </button>
                <button 
                  onClick={onGetTokens}
                  className="px-6 py-2 bg-white/20 text-white font-black uppercase tracking-widest rounded-full text-[10px] hover:bg-white/30 transition-all shadow-lg active:scale-95"
                >
                  Get Free Tokens
                </button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playTrack, 
    playAll, 
    artists, 
    userProfile, 
    recentlyPlayed, 
    getTrendingTracks, 
    getTopNFTTracks, 
    allPlaylists, 
    featuredPlaylist,
    allTracks,
    isLoading,
    searchQuery, 
    setSearchQuery, 
    generateDiscoverWeekly, 
    getRecommendations, 
    allNFTs,
    sponsoredPosts
  } = useAudio();
  
  const carouselItems = useMemo(() => {
    const approvedSponsorships = sponsoredPosts
      .filter(post => post.status === 'approved')
      .map(post => ({
        id: post.id,
        title: post.title,
        subtitle: post.artistName,
        imageUrl: post.imageUrl,
        link: post.link,
        cta: post.type === 'track' ? 'Play' : 'View'
      }));

    // Combine with default featured tracks, ensuring uniqueness if needed (though IDs might differ)
    return [...approvedSponsorships, ...FEATURED_TRACKS_CAROUSEL];
  }, [sponsoredPosts]);
  
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery'>('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);
  const [visibleNFTCount, setVisibleNFTCount] = useState(4);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<GenerateAIPlaylistResult | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIPlaylist = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAIPlaylist();
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    generateDiscoverWeekly();
    
    const hasVisited = localStorage.getItem('tonjam_has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleNFTCount((prev) => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('tonjam_has_visited', 'true');
  };

  const handleCtaClick = (item: CarouselItem) => {
    // Check if it's a mock track
    const track = MOCK_TRACKS.find(t => t.id === item.id);
    if (track) {
      playTrack(track);
      return;
    }

    // Check if it's a sponsored post
    const sponsoredPost = sponsoredPosts.find(p => p.id === item.id);
    if (sponsoredPost) {
      if (sponsoredPost.type === 'track') {
        const trackToPlay = MOCK_TRACKS.find(t => t.id === sponsoredPost.targetId);
        if (trackToPlay) {
          playTrack(trackToPlay);
        } else {
          navigate(sponsoredPost.link);
        }
      } else {
        navigate(sponsoredPost.link);
      }
      return;
    }

    // Fallback to link navigation
    if (item.link) {
      navigate(item.link);
    }
  };

  const trendingTracks = useMemo(() => {
    let tracks = getTrendingTracks();
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    return tracks;
  }, [getTrendingTracks, selectedGenre]);

  const trendingArtists = useMemo(() => {
    let filteredArtists = [...artists];
    if (selectedGenre) {
      filteredArtists = filteredArtists.filter(a => a.genre === selectedGenre);
    }
    return filteredArtists.sort((a, b) => Number(b.earnings?.total || 0) - Number(a.earnings?.total || 0)).slice(0, 3);
  }, [artists, selectedGenre]);

  const trendingNFTs = useMemo(() => {
    let filteredNFTs = [...allNFTs];
    if (selectedGenre) {
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      filteredNFTs = filteredNFTs.filter(n => genreTrackIds.includes(n.trackId));
    }
    return filteredNFTs.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
  }, [allNFTs, selectedGenre]);

  const topNFTsForCarousel = useMemo(() => trendingNFTs.slice(0, 10), [trendingNFTs]);

  const topNFTTracks = useMemo(() => {
    let tracks = getTopNFTTracks();
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    return tracks;
  }, [getTopNFTTracks, selectedGenre]);
  
  const { recommendedTracks, recommendedNFTs } = useMemo(() => {
    const { recommendedTracks: tracks, recommendedNFTs: nfts } = getRecommendations();
    
    let filteredTracks = tracks;
    let filteredNFTs = nfts;

    if (selectedGenre) {
      filteredTracks = tracks.filter(t => t.genre === selectedGenre);
      
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      filteredNFTs = nfts.filter(n => genreTrackIds.includes(n.trackId));
    }

    return {
      recommendedTracks: filteredTracks,
      recommendedNFTs: filteredNFTs.slice(0, 5)
    };
  }, [getRecommendations, selectedGenre]);

  const filteredRecentlyPlayed = useMemo(() => {
    if (!selectedGenre) return recentlyPlayed;
    return recentlyPlayed.filter(t => t.genre === selectedGenre);
  }, [recentlyPlayed, selectedGenre]);

  const newReleases = useMemo(() => {
    let tracks = [...MOCK_TRACKS];
    if (selectedGenre) {
      tracks = tracks.filter(t => t.genre === selectedGenre);
    }
    // Sort by release date descending (mocking new releases)
    return tracks.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0, 5);
  }, [selectedGenre]);

  const curatedPlaylists = useMemo(() => {
    const basePlaylists = allPlaylists.filter(p => p.creator === 'TonJam AI' || CURATED_PLAYLISTS.find(cp => cp.id === p.id));
    if (!selectedGenre) return basePlaylists;
    
    const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
    return basePlaylists.filter(p => p.trackIds?.some(id => genreTrackIds.includes(id)));
  }, [allPlaylists, selectedGenre]);

  const recommendedArtists = useMemo(() => {
    let recArtists = artists;
    if (selectedGenre) {
      recArtists = recArtists.filter(a => a.genre === selectedGenre);
    }
    return recArtists.slice(0, 5);
  }, [artists, selectedGenre]);

  const newlyMintedNFTs = useMemo(() => {
    let nfts = [...allNFTs];
    if (selectedGenre) {
      const genreTrackIds = MOCK_TRACKS.filter(t => t.genre === selectedGenre).map(t => t.id);
      nfts = nfts.filter(n => genreTrackIds.includes(n.trackId));
    }
    return nfts.slice(2, 7);
  }, [allNFTs, selectedGenre]);

  const discoverWeekly = useMemo(() => 
    allPlaylists.find(p => p.title === 'Discover Weekly'),
    [allPlaylists]
  );

  return (
    <div className="page-container w-full pt-8 sm:pt-12 bg-white text-neutral-950 min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-100 border-b border-zinc-200 flex items-center overflow-hidden pointer-events-none z-50">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 px-12"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i}>TONJAM_PROTOCOL v2.6.4 // DECENTRALIZED_AUDIO_STREAMING // NEURAL_SYNC_ACTIVE // GLOBAL_PULSE_99.9%</span>
          ))}
        </motion.div>
      </div>
      
      <GetFreeTokensModal isOpen={isTokensModalOpen} onClose={() => setIsTokensModalOpen(false)} />
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50 mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent backdrop-blur-xl p-8 lg:p-12 shadow-2xl"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <button 
              onClick={dismissWelcome}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Dismiss welcome message"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to the Future
              </div>
              
              <h2 className="text-[40px] lg:text-[72px] font-black uppercase tracking-tighter leading-[0.85] text-foreground">
                Welcome to <span className="text-blue-500">TonJam</span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                Experience the first decentralized music protocol on TON. Stream, collect, and connect directly with your favorite artists.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => {
                    dismissWelcome();
                    navigate('/marketplace');
                  }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group/btn text-sm"
                >
                  <ShoppingBag className="h-5 w-5 text-white group-hover/btn:scale-110 transition-transform" />
                  Explore Marketplace
                </button>
                <button 
                  onClick={() => setIsTokensModalOpen(true)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-zinc-800 dark:text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-3 text-sm"
                >
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Get Free Tokens
                </button>
                <button 
                  onClick={dismissWelcome}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group/btn text-sm"
                >
                  <Play className="h-5 w-5 fill-white group-hover/btn:scale-110 transition-transform" />
                  Start Playing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'overview' | 'discovery')}
        className="max-w-4xl mx-auto w-full relative z-20 mb-6 sm:mb-10"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <TabsList variant="line" className="bg-transparent gap-4 sm:gap-8">
            <TabsTrigger 
              value="overview"
              className="text-base sm:text-lg font-bold uppercase tracking-tight transition-all relative group focus:outline-none data-[state=active]:text-foreground text-foreground/30 hover:text-foreground/50 h-auto p-0 border-none bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent"
            >
              <span className="relative z-10">Overview</span>
              {activeTab === 'overview' && (
                <motion.div layoutId="homeTabLine" className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="discovery"
              className="text-base sm:text-lg font-bold uppercase tracking-tight transition-all relative flex items-center gap-2 group focus:outline-none data-[state=active]:text-foreground text-foreground/30 hover:text-foreground/50 h-auto p-0 border-none bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent"
            >
              <span className="relative z-10">Discovery</span>
              <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${activeTab === 'discovery' ? 'text-primary' : 'text-foreground/20'}`} />
              {activeTab === 'discovery' && (
                <motion.div layoutId="homeTabLine" className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Network.Online</span>
          </div>
        </div>

        <TabsContent value="overview" className="focus-visible:ring-0 p-0 outline-none">
          <div className="flex overflow-x-auto no-scrollbar space-x-2 py-2 -mx-2 px-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className="flex-shrink-0 group relative"
            >
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${
                selectedGenre === null 
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'bg-secondary border-border text-foreground/40 hover:border-foreground/30 hover:text-foreground'
              }`}>
                ALL_FREQUENCIES
              </div>
            </button>
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre.name;
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.name)}
                  className="flex-shrink-0 group relative"
                >
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-foreground text-background border-foreground shadow-lg' 
                      : 'bg-secondary border-border text-foreground/40 hover:border-foreground/30 hover:text-foreground'
                  }`}>
                    <genre.icon className="h-3 w-3" />
                    {genre.name.replace(' ', '_')}
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="discovery" className="focus-visible:ring-0 p-0 mt-4 outline-none">
          <DiscoveryFeed />
        </TabsContent>
      </Tabs>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 pb-20"
          >
            {/* Welcome Banner */}
            <CompleteProfilePrompt />
            <AnimatePresence>
              {showWelcome && (
                <WelcomeBanner onDismiss={dismissWelcome} onGetTokens={() => setIsTokensModalOpen(true)} />
              )}
            </AnimatePresence>

            {/* Discover Weekly Banner - High Fidelity */}
            {auth.currentUser && discoverWeekly && (
              <section className="mb-8">
                <div 
                  onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
                  className="relative h-40 sm:h-72 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
                >
                  <img 
                    src={discoverWeekly.coverUrl} 
                    alt="Discover Weekly" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Neural Grid Overlay */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

                  <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                      <div className="space-y-2 sm:space-y-4 max-w-xl">
                        <div className="flex items-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] rounded-md text-white shadow-lg shadow-blue-600/40 px-3 py-1 border-none cursor-help">
                                Neural.Protocol_07
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-950 border-white/10 text-[9px] font-bold uppercase tracking-widest p-2">
                              Proprietary AI synthesis algorithm v7.2.4
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.2em] hidden sm:block">Update_Synced.2024</span>
                        </div>
                        <h2 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter text-white leading-[0.8] drop-shadow-2xl">
                          Discover<br />Weekly
                        </h2>
                        <p className="text-xs sm:text-lg text-white/60 font-medium leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                          Personalized frequency stream synthesized from your unique neural listening patterns and collection data.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Active Relay</span>
                          <span className="text-[10px] font-bold text-white/80">324 Artists Synced</span>
                        </div>
                        <button className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 group/play">
                          <Play className="h-6 w-6 sm:h-10 sm:w-10 fill-black translate-x-0.5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-600/30 w-full overflow-hidden">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/3 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Featured Sponsored Posts Carousel */}
            <div className="mt-4">
              <AutoCarousel items={carouselItems} onCtaClick={handleCtaClick} />
            </div>

            {/* Hero Section - Neural Protocol Aesthetic */}
            <section className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-blue-900/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              
              <div className="relative z-10 p-5 sm:p-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                        Neural_Sync.Active
                      </Badge>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Lat: 0.12ms</div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-white">
                        FORGE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-gradient-x">LEGACY</span>
                      </h1>
                      <div className="h-px w-20 sm:w-24 bg-blue-500/50"></div>
                    </div>
                  
                  <p className="text-base sm:text-2xl text-blue-100/60 leading-relaxed font-medium max-w-lg font-display">
                    Welcome to the nexus of decentralized sound. Forge rare artifacts and engage in global community frequencies via the TON blockchain.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <button 
                      onClick={() => playAll(MOCK_TRACKS)}
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 group active:scale-95 text-[11px] sm:text-base"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-black group-hover:scale-110 transition-transform" />
                      Initiate
                    </button>
                    <Link 
                      to="/marketplace"
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-white font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 group active:scale-95 backdrop-blur-md text-[11px] sm:text-base"
                    >
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                      Market
                    </Link>
                  </div>
                </div>

                <div className="hidden lg:block space-y-6">
                  <NetworkStatus className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-1 scale-105" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Network Hash', value: '42.8 GB/s', icon: Activity, color: 'text-blue-500' },
                      { label: 'Node Status', value: 'Optimal', icon: UserCheck, color: 'text-emerald-500' }
                    ].map((stat, i) => (
                      <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-white/5 border border-white/5 p-5 rounded-2xl backdrop-blur-md group hover:border-blue-500/30 transition-colors"
                      >
                        <stat.icon className={`h-5 w-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-black text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Neural Leaderboard Section */}
            <section className="section-container mt-6 mb-6 px-2 sm:px-0">
              <Leaderboard artists={artists} limit={5} />
            </section>

            {/* AI Dj Krupy Section - Neural Synthesis Interface */}
            <section className="mb-12 relative">
              <div className="flex items-center justify-between mb-6 px-2">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                      <img src="https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png" alt="DJ Krupy" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900 dark:text-zinc-50 leading-none">DJ_KRUPY</h2>
                      <p className="text-neutral-500 dark:text-zinc-400/50 text-[9px] font-bold uppercase tracking-widest mt-1">Neural_Relay_Active</p>
                    </div>
                  </div>
                </div>
                {!aiResult && (
                  <button 
                    onClick={handleGenerateAIPlaylist}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_5px_15px_rgba(37,99,235,0.3)] active:scale-95 group sm:px-6 sm:py-3 sm:text-[10px]"
                  >
                    {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" /> : <Sparkles className="h-3 w-3 text-white group-hover:rotate-12 transition-transform sm:h-4 sm:w-4" />}
                    {isGeneratingAI ? "CALIBRATING..." : "KRUPYVIBEZ"}
                  </button>
                )}
              </div>

              {aiResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-600/10 via-black/40 to-transparent rounded-[2.5rem] p-6 sm:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative overflow-hidden"
                >
                  {/* Digital particles effect */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
                  
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 group">
                    <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img 
                      src={aiResult.playlist.coverUrl} 
                      alt={aiResult.playlist.title}
                      className="w-full h-full object-cover rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                      <button 
                        onClick={() => {
                          const tracks = (aiResult.playlist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                          playAll(tracks);
                        }}
                        className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                      >
                        <Play className="h-7 w-7 fill-black translate-x-1" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
                    <div className="space-y-3 lg:space-y-4">
                      <div className="inline-flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                          <Sparkle className="h-3 w-3 animate-pulse" />
                          SYNTHESIS_MAPPING
                        </Badge>
                      </div>
                      <h3 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">{aiResult.playlist.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-base leading-relaxed max-w-2xl font-medium">
                        {aiResult.explanation}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                      <button 
                        onClick={() => {
                          const tracks = (aiResult.playlist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                          playAll(tracks);
                        }}
                        className="px-8 py-3 sm:px-10 sm:py-4 bg-white text-black font-black uppercase tracking-widest rounded-full text-[10px] sm:text-[11px] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 active:scale-95"
                      >
                        <Play className="h-4 w-4 fill-black" />
                        Initiate
                      </button>
                      <button 
                        onClick={() => setAiResult(null)}
                        className="px-6 py-3 sm:px-8 sm:py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-full text-[10px] sm:text-[11px] transition-all hover:bg-white/10 active:scale-95"
                      >
                        Recalibrate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-neutral-900/40 dark:bg-slate-900/50 backdrop-blur-xl border border-blue-500/10 rounded-[2.5rem] p-6 sm:p-12 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 blur-[100px] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 blur-[100px] rounded-full opacity-50"></div>
                    
                    <div className="h-20 w-20 rounded-[2rem] overflow-hidden border border-blue-500/40 relative shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:border-blue-400 transition-colors">
                      <img src="https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png" alt="DJ Krupy" className="w-full h-full object-cover" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0a0a0a] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    
                    <div className="space-y-3 relative z-10">
                      <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">KRUPY_SYNTHESIS</h4>
                      <p className="text-neutral-600 dark:text-blue-100/40 text-xs sm:text-lg max-w-sm font-medium mx-auto leading-relaxed">Analyze your sonic identity and generate high-fidelity frequency streams instantly.</p>
                    </div>
                    
                    <button 
                      onClick={handleGenerateAIPlaylist}
                      disabled={isGeneratingAI}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95 sm:px-10 sm:py-4 sm:text-[11px] relative z-10"
                    >
                      {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin text-white sm:h-4 sm:w-4" /> : <Sparkles className="h-3 w-3 text-white sm:h-4 sm:w-4" />}
                      {isGeneratingAI ? "SYNTHESIZING..." : "KRUPYVIBEZ"}
                    </button>
                  </div>

                  <div className="hidden lg:flex flex-col gap-6">
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col justify-center gap-4 group hover:bg-blue-600/10 transition-colors">
                      <Activity className="h-8 w-8 text-blue-500/40 group-hover:scale-110 transition-transform" />
                      <p className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Neural_Relay</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-relaxed">Multimodal BPM parsing and genre density calibration.</p>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col justify-center gap-4 group hover:bg-purple-600/10 transition-colors">
                      <Globe className="h-8 w-8 text-purple-500/40 group-hover:scale-110 transition-transform" />
                      <p className="text-[12px] font-black text-white uppercase tracking-[0.2em]">TON_Nexus</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-relaxed">Decentralized trend mapping across the entire protocol.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Featured Tracks Dynamic Playlist */}
            <section className="mb-8">
              <SectionHeader 
                title="Featured_Streams" 
                subtitle="Hand-picked frequency clusters based on network trajectory"
                viewAllLink={`/playlist/${featuredPlaylist.id}`} 
              />
              
              <Card className="relative overflow-hidden border-none bg-[#0a192f] shadow-2xl group">
                <CardContent className="p-4 sm:p-8 flex flex-col md:flex-row items-center gap-5 sm:gap-8 relative overflow-hidden">
                  {/* Background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent z-0"></div>
                  
                  <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group/cover border border-white/10">
                    <img 
                      src={featuredPlaylist.coverUrl} 
                      alt={featuredPlaylist.title}
                      className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const tracks = (featuredPlaylist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                          playAll(tracks); 
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform active:scale-95"
                      >
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black ml-1.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-6 relative z-10">
                    <div className="space-y-2 sm:space-y-4">
                      <div className="inline-flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Live_Relay
                        </Badge>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Protocol_ID: #TJ-882</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white leading-none">{featuredPlaylist.title}</h3>
                      <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                        {featuredPlaylist.description || "Synthesizing global network trends into a cohesive sonic stream for elite node participants."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                      <button 
                         onClick={() => { 
                          const tracks = (featuredPlaylist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                          playAll(tracks); 
                        }}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-full text-[10px] transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95"
                      >
                        <Play className="h-4 w-4 fill-white" />
                        Initiate Stream
                      </button>
                      <button 
                        onClick={() => navigate(`/playlist/${featuredPlaylist.id}`)}
                        className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-full text-[10px] transition-all active:scale-95"
                      >
                        Data Details
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Trending Now Section - Global Pulse */}
            <section className="section-container mt-10 mb-10 px-2 sm:px-0">
              <Tabs defaultValue="tracks" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Global.Pulse</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Trending_Pulse</h2>
                  </div>
                  
                  <TabsList className="bg-zinc-100 dark:bg-white/5 p-1 rounded-full">
                    <TabsTrigger value="tracks" className="rounded-full text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary shadow-sm transition-all h-auto">Tracks</TabsTrigger>
                    <TabsTrigger value="artists" className="rounded-full text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary shadow-sm transition-all h-auto">Artists</TabsTrigger>
                    <TabsTrigger value="nfts" className="rounded-full text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary shadow-sm transition-all h-auto">NFTs</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="tracks" className="focus-visible:ring-0 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-zinc-50 dark:bg-white/[0.02] rounded-3xl p-2 sm:p-4 shadow-none border-none">
                       <div className="flex flex-col">
                        {trendingTracks.slice(0, 5).map((track, idx) => (
                          <TrackCard key={`trend-track-${track.id}`} track={track} variant="row" index={idx} />
                        ))}
                      </div>
                    </div>
                    <div className="hidden lg:block space-y-6">
                       <div className="bg-primary/5 rounded-3xl p-8 flex flex-col justify-center items-center text-center gap-4">
                          <Activity className="h-10 w-10 text-primary opacity-40" />
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Neural_Trajectory</h4>
                          <p className="text-[11px] font-medium text-primary/60 leading-relaxed">Streaming velocity in this segment has increased by 18.4% in the last 2 nodes.</p>
                       </div>
                       <Card className="bg-zinc-950 rounded-3xl p-6 overflow-hidden relative border-none">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl" />
                         <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Node_Status: Optimal</p>
                         <h5 className="text-white font-black uppercase tracking-tight mb-2">Network Hub</h5>
                         <p className="text-zinc-500 text-[10px] leading-relaxed">Participate in global frequencies and earn JAM rewards for every neural sync.</p>
                       </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="artists" className="focus-visible:ring-0 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingArtists.map((artist) => (
                      <Card 
                        key={`trend-artist-${artist.uid}`} 
                        className="group cursor-pointer bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all active:scale-[0.98] rounded-3xl shadow-none border-none" 
                        onClick={() => navigate(`/artist/${artist.uid}`)}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl" alt={artist.name} />
                            <div className="absolute -bottom-1 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-lg">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-black text-foreground uppercase tracking-tight">{artist.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{artist.genre}</p>
                          </div>
                          <button className="mt-2 w-full py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all">
                             View Node
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="nfts" className="focus-visible:ring-0 mt-0">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trendingNFTs.slice(0, 4).map((nft) => (
                      <div 
                        key={`trend-nft-${nft.id}`} 
                        className="flex flex-col gap-4 group cursor-pointer" 
                        onClick={() => navigate(`/nft/${nft.id}`)}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-3xl shadow-xl">
                          <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={nft.title} />
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-emerald-400 border border-emerald-500/30">
                            {nft.price} TON
                          </div>
                        </div>
                        <div className="px-2 space-y-1">
                          <p className="text-sm font-black truncate text-foreground uppercase tracking-tight leading-tight">{nft.title}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{nft.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            {/* Protocol Mechanics Accordion */}
            <section className="section-container mt-12 mb-12">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="px-4 py-1 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/40 text-[9px] font-black uppercase tracking-[0.3em] rounded-full">
                    Protocol_Documentation
                  </Badge>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Synthesis Mechanics</h2>
                  <p className="text-muted-foreground text-sm font-medium">Understanding the decentralized frequency protocol.</p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-2">
                  {[
                    { id: 'item-1', q: 'How does Neural Play work?', a: 'TonJam uses a proprietary BPM-sync relay that rewards both artists and listeners through the TON blockchain. Every stream triggers a micro-transaction, ensuring immediate artist compensation.' },
                    { id: 'item-2', q: 'What are Artifact Collectibles?', a: 'Artifacts are rare NFT fragments linked to specific audio wave stems. Collecting full sets allows node participants to unlock exclusive stems, alternative mixes, and digital royalties.' },
                    { id: 'item-3', q: 'Is it completely decentralized?', a: 'The metadata and audio assets are stored across TON Storage and IPFS. This ensures that your music collection remains accessible even if the central interface node is offline.' },
                    { id: 'item-4', q: 'How can I become a Verified Node?', a: 'Artists can apply for node verification by linking their TON wallet and uploading original genesis tracks. Once verified, you gain access to the Artist Nexus and minting permissions.' }
                  ].map((item) => (
                    <AccordionItem 
                      key={item.id} 
                      value={item.id} 
                      className="bg-secondary/20 rounded-2xl px-6 transition-all data-[state=open]:bg-secondary/40 overflow-hidden"
                    >
                      <AccordionTrigger className="text-sm font-bold uppercase tracking-tight hover:no-underline py-5 text-foreground leading-none">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm font-medium leading-relaxed pb-6 pr-8 border-t border-border/10 pt-4">
                         <div className="flex gap-4">
                           <div className="w-1 h-full bg-primary/20 rounded-full mt-1 flex-shrink-0" />
                           {item.a}
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            {/* Recently Played */}
            {isLoading ? (
              <HomeSection title="Jump Back In" icon={Clock}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`recent-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : filteredRecentlyPlayed.length > 0 && (
              <HomeSection title="Jump Back In" icon={Clock} link="/explore/tracks?title=Recently Played&filter=recent">
                {filteredRecentlyPlayed.map(track => (
                  <div key={`recent-${track.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Recommended Tracks */}
            {isLoading ? (
              <HomeSection title="Recommended for You" icon={Sparkles}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`rec-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : recommendedTracks.length > 0 && (
              <HomeSection title="Recommended for You" icon={Sparkles} link="/explore/tracks?title=Recommended for You&filter=recommended">
                {recommendedTracks.map(track => (
                  <div key={`rec-track-${track.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Trending Tracks */}
            {isLoading ? (
              <HomeSection title="Trending Signals" icon={Flame}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`trend-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : (
              <HomeSection title="Trending Signals" icon={Flame} link="/explore/tracks?title=Trending Signals&filter=trending">
                {trendingTracks.map(track => (
                  <div key={`trend-${track.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Top Charts - Tactical Grid Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 mb-10">
              <div className="lg:col-span-2 space-y-6">
                <SectionHeader title="Global_Data_Stream" viewAllLink="/explore/tracks?title=Global Top 10&filter=trending" />
                <div className="bg-secondary/30 border border-border rounded-3xl overflow-hidden p-1 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col">
                    {trendingTracks.slice(0, 10).map((track, idx) => (
                      <TrackCard key={`chart-${track.id}`} track={track} variant="row" index={idx} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <SectionHeader title="Latest_Releases" viewAllLink="/explore/tracks?title=New Releases&filter=new" />
                <div className="bg-secondary/30 border border-border rounded-3xl overflow-hidden p-1 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col">
                    {newReleases.map((track, index) => (
                      <TrackCard 
                        key={`new-${track.id}`} 
                        track={track} 
                        variant="row"
                        index={index}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Decorative Stats Box */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 border border-border rounded-3xl p-6 text-center sm:text-left space-y-3">
                  <Activity className="h-6 w-6 text-primary mx-auto sm:mx-0" />
                  <h4 className="text-base font-bold uppercase tracking-tight text-foreground">Protocol_Analytics</h4>
                  <p className="text-muted-foreground text-[10px] font-medium">Streaming velocity is up 24.8% this cycle. Active node participation at peak efficiency.</p>
                  <Link to="/jamspace" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors">
                    View Network Map <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Curated Playlists */}
            {isLoading ? (
              <HomeSection title="Curated for You" icon={Sparkles}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`curated-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : curatedPlaylists.length > 0 && (
              <HomeSection title="Curated for You" icon={Sparkles} link="/explore/playlists?title=Curated Playlists&filter=curated">
                {curatedPlaylists.map(playlist => (
                  <div key={`playlist-${playlist.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <PlaylistCard playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Genre Grid - Quick Access */}
            <HomeSection title="Explore Genres" icon={Sparkles}>
              {GENRES.map(genre => (
                <div key={genre.id} className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start">
                  <GenreCard genre={genre} />
                </div>
              ))}
            </HomeSection>

            {/* Top NFT Sales */}
            <section className="section-container">
              <SectionHeader title="NFT Alpha" viewAllLink="/explore/nfts?title=NFT Alpha&filter=top_nfts" />
              {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map(i => (
                    <div key={`nft-alpha-loading-${i}`} className="w-full">
                       <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : (
                <NFTAlphaCarousel nfts={topNFTsForCarousel} />
              )}
            </section>

            {/* Recommended Artists */}
            {isLoading ? (
              <HomeSection title="Rising Stars" icon={UserCheck}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`artists-loading-${i}`} className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start">
                    <div className="animate-pulse bg-muted/20 p-6 rounded-[10px] space-y-4">
                      <div className="w-24 h-24 rounded-full bg-muted mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </HomeSection>
            ) : (
              <HomeSection title="Rising Stars" icon={UserCheck} link="/explore/artists?title=Rising Stars&filter=rising">
                {recommendedArtists.map(artist => (
                  <div key={`artist-${artist.uid}`} className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start">
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Recommended NFTs */}
            {isLoading ? (
               <HomeSection title="Curated Collectibles" icon={Sparkles}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`rec-nfts-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : recommendedNFTs.length > 0 && (
              <HomeSection title="Curated Collectibles" icon={Sparkles} link="/explore/nfts?title=Curated Collectibles&filter=recommended">
                {recommendedNFTs.map(nft => (
                  <div key={`rec-nft-${nft.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Marketplace Highlights */}
            {isLoading ? (
               <HomeSection title="New in Marketplace" icon={PlusCircle}>
                {[1, 2, 3, 4].map(i => (
                  <div key={`new-nfts-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <SkeletonCard />
                  </div>
                ))}
              </HomeSection>
            ) : (
              <HomeSection title="New in Marketplace" icon={PlusCircle} link="/explore/nfts?title=New in Marketplace&filter=new_nfts">
                {newlyMintedNFTs.map(nft => (
                  <div key={`minted-${nft.id}`} className="flex-shrink-0 w-[150px] sm:w-[200px] snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Community & Artist CTA Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-10 px-4 sm:px-0">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-2xl bg-secondary/50 dark:bg-black/30 border border-border p-6 sm:p-8 shadow-xl group cursor-pointer"
                onClick={() => navigate('/jamspace')}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Radio className="h-32 w-32 text-primary" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <Music2 className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-1 leading-tight">Join the JamSpace</h3>
                    <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed max-w-xs font-medium">
                      The core neural relay for music enthusiasts. Synced community feed, real-time reactions, and collaborative frequency streams.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Link to="/jamspace" className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary text-[10px] font-black text-primary-foreground uppercase tracking-[0.2em] rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group/link">
                      Initiate Sync <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden rounded-2xl bg-secondary/50 dark:bg-black/30 border border-border p-6 sm:p-8 shadow-xl group cursor-pointer"
                onClick={() => navigate(userProfile.isVerifiedArtist ? '/artist-dashboard' : '/artist-onboarding')}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  <Disc className="h-32 w-32 text-purple-500" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-inner">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-1 leading-tight">
                      {userProfile.isVerifiedArtist ? 'Artist Nexus' : 'Mint Your Legacy'}
                    </h3>
                    <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed max-w-xs font-medium">
                      {userProfile.isVerifiedArtist 
                        ? 'Your command center for NFT monetization, streaming metrics, and audience engagement protocol. Maximize your neural reach.'
                        : 'Forge your decentralized identity. Upload original waves, mint genesis artifacts, and claim your share of the TON music economy.'}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Link 
                      to={userProfile.isVerifiedArtist ? '/artist-dashboard' : '/artist-onboarding'} 
                      className="inline-flex items-center gap-3 px-6 py-2.5 bg-purple-600 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-full hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 group/link"
                    >
                      {userProfile.isVerifiedArtist ? 'Open Dashboard' : 'Begin Onboarding'} <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decentralized Footer Info */}
      <section className="py-4 flex flex-col items-center text-center space-y-1">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">
          <Globe className="h-3 w-3" />
          Secured by TON Blockchain
        </div>
        <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
          TonJam v2.6.4 • Decentralized Music Protocol
        </p>
      </section>
      <SearchCommandDialog />
    </div>
  );
};

export default Home;
