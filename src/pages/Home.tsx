import GetFreeTokensModal from '@/components/GetFreeTokensModal';
import BuyTJModal from '@/components/BuyTJModal';
import BuyNFTModal from '@/components/BuyNFTModal';
import CompleteProfilePrompt from '@/components/CompleteProfilePrompt';
import { CardSmall } from '@/components/CardSmall';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button as MTButton } from "@material-tailwind/react";
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search, X, ArrowRight } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES, TON_LOGO, TJ_COIN_ICON } from '@/constants';
import TiltedCoverflow, { CoverflowItem } from '@/components/aicanvas/tilted-coverflow';
import { Track, Task, NFTItem } from '@/types';
import { getTasks, updateTaskProgress, completeTask, claimTaskReward } from '@/services/taskService';
import { getPlaceholderImage } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import TrendingNFTCard from '@/components/TrendingNFTCard';
import ArtistCard from '@/components/ArtistCard';
import TaskCard from '@/components/TaskCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import SkeletonCard from '@/components/SkeletonCard';
import Leaderboard from '@/components/Leaderboard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import NFTAlphaCarousel from '@/components/NFTAlphaCarousel';
import SectionHeader from '@/components/SectionHeader';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import ArtistSlider from '@/components/ArtistSlider';
import TrendingBannerCarousel from '@/components/TrendingBannerCarousel';
import { FanLeaderboard } from '@/components/FanLeaderboard';
import { SearchCommandDialog } from '@/components/SearchCommandDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import { generateAIPlaylist, GenerateAIPlaylistResult } from '@/services/aiPlaylistService';
import { Loader2, Brain, Sparkle } from 'lucide-react';
import {
  Carousel as MissionCarousel,
  CarouselContent as MissionCarouselContent,
  CarouselItem as MissionCarouselItem,
  CarouselNext as MissionCarouselNext,
  CarouselPrevious as MissionCarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

import HomeSection from '@/components/HomeSection';
import WelcomeBanner from '@/components/WelcomeBanner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playTrack, 
    playAll, 
    artists, 
    userProfile, 
    recentlyPlayed, 
    likedTrackIds,
    followedUserIds,
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
    sponsoredPosts,
    tasks: globalTasks,
    claimTaskReward: globalClaimTaskReward
  } = useAudio();
  
  
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery'>('overview');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);
  const [isBuyTJModalOpen, setIsBuyTJModalOpen] = useState(false);
  const [selectedCoverflowNFT, setSelectedCoverflowNFT] = useState<NFTItem | null>(null);
  const [showBuyModalForCoverflow, setShowBuyModalForCoverflow] = useState(false);
  const [visibleNFTCount, setVisibleNFTCount] = useState(4);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<GenerateAIPlaylistResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const missionAutoplayRef = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const FEATURED_TRACKS_CAROUSEL: CarouselItem[] = useMemo(() => MOCK_TRACKS.slice(0, 3).map(track => ({
    id: track.id,
    title: track.title,
    subtitle: track.artist,
    imageUrl: track.coverUrl,
    link: `/track/${track.id}`,
    cta: 'Play'
  })), []);

  const combinedMissions = useMemo(() => {
    const aiTask = globalTasks.find(t => t.id === '11');
    const list = [...tasks];
    if (aiTask && !list.some(t => t.id === aiTask.id)) {
      list.unshift(aiTask);
    }
    return list;
  }, [tasks, globalTasks]);

  const handleGenerateAIPlaylist = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAIPlaylist({
        likedTracks: likedTrackIds,
        recentlyPlayed,
        followedArtistIds: followedUserIds
      });
      setAiResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const rewardAmount = parseInt(task.reward.replace(/[^0-9]/g, '')) || 0;
    try {
      await claimTaskReward(taskId, rewardAmount, task.points);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, claimed: true } : t));
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, claimed: true } : t));
    }
  };

  const handleTaskToggle = async (taskId: string, progress: number) => {
    try {
      await updateTaskProgress(taskId, progress);
      const task = tasks.find(t => t.id === taskId);
      if (task && progress >= task.total) {
        await completeTask(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress, completed: true } : t));
      } else {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress } : t));
      }
    } catch (e) {
      const task = tasks.find(t => t.id === taskId);
      if (task && progress >= task.total) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress, completed: true } : t));
      } else {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress } : t));
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate('/tasks');
  };

  useEffect(() => {
    generateDiscoverWeekly();
    
    const hasVisited = localStorage.getItem('tonjam_has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }

    const fetchHomeTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        if (fetchedTasks && fetchedTasks.length > 0) {
          setTasks(fetchedTasks.slice(0, 3));
        } else {
          setTasks([
            {
              id: '1',
              title: 'Stream 5 Tracks',
              description: 'Listen to at least 5 songs today',
              reward: "40",
              points: 10,
              progress: 3,
              total: 5,
              type: 'daily',
              completed: false,
              claimed: false,
            },
            {
              id: '2',
              title: 'Follow TonJam on X',
              description: 'Stay updated with TonJam news',
              reward: "25",
              points: 5,
              progress: 0,
              total: 1,
              type: 'achievement',
              completed: false,
              claimed: false,
            },
            {
              id: '3',
              title: 'Buy Your First NFT',
              description: 'Own a music collectible',
              reward: "120",
              points: 50,
              progress: 0,
              total: 1,
              type: 'onchain',
              completed: false,
              claimed: false,
            }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHomeTasks();
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

  const trendingCarouselItems = useMemo(() => {
    const trackItems = trendingTracks.slice(0, 5).map(track => ({
      id: `track-${track.id}`,
      title: track.title,
      subtitle: `${track.artist} (Track)`,
      imageUrl: track.coverUrl,
      link: `/track/${track.id}`,
      cta: 'Listen'
    }));
    const nftItems = trendingNFTs.slice(0, 5).map(nft => ({
      id: `nft-${nft.id}`,
      title: nft.title,
      subtitle: `${nft.artist} (NFT - ${nft.price} TON)`,
      imageUrl: nft.imageUrl,
      link: `/nft/${nft.id}`,
      cta: 'View'
    }));
    return [...trackItems, ...nftItems];
  }, [trendingTracks, trendingNFTs]);

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

  const trackCoverflowItems = useMemo<CoverflowItem[]>(() => {
    return trendingTracks.slice(0, 7).map(track => ({
      id: track.id,
      title: track.title,
      subtitle: track.artist,
      imageUrl: track.coverUrl,
      onClick: () => playTrack(track)
    }));
  }, [trendingTracks, playTrack]);

  const nftCoverflowItems = useMemo<CoverflowItem[]>(() => {
    return trendingNFTs.slice(0, 7).map(nft => ({
      id: nft.id,
      title: nft.title,
      subtitle: `${nft.artist} • ${nft.price} TON`,
      imageUrl: nft.imageUrl,
      onClick: () => setSelectedCoverflowNFT(nft)
    }));
  }, [trendingNFTs]);

  /* Removed local discoverWeekly memo as it is now in useAudio() */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="page-container home-page w-full pt-2 bg-background text-foreground min-h-screen"
    >
      <GetFreeTokensModal isOpen={isTokensModalOpen} onClose={() => setIsTokensModalOpen(false)} />
      {isBuyTJModalOpen && <BuyTJModal onClose={() => setIsBuyTJModalOpen(false)} onSuccess={() => setIsBuyTJModalOpen(false)} />}
      
      {/* Coverflow NFT Custom Interactive Modal Overlay */}
      <AnimatePresence>
        {selectedCoverflowNFT && (
          <div key="coverflow-nft-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            {/* Click backdrop to close */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setSelectedCoverflowNFT(null)} 
            />
            
            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl md:max-w-3xl rounded-3xl bg-slate-950 p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row gap-6 md:gap-8 items-stretch max-h-[90vh]"
            >
              {/* Absolutes for Glows (no borders!) */}
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

              {/* Close Button */}
              <button 
                onClick={() => setSelectedCoverflowNFT(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Enlarged Artwork */}
              <div className="relative flex-1 flex flex-col justify-center min-w-0">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black/40">
                  <img 
                    src={selectedCoverflowNFT.imageUrl || getPlaceholderImage(`nft-${selectedCoverflowNFT.id}`)} 
                    alt={selectedCoverflowNFT.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Floating Edition Tag */}
                  {selectedCoverflowNFT.edition && (
                    <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase text-blue-400 shadow-lg">
                      {selectedCoverflowNFT.edition} EDITION
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Details & Pricing Block */}
              <div className="flex-1 flex flex-col justify-between space-y-5 min-w-0 z-10 text-left">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full inline-block leading-none">
                      Sonic Artifact
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mt-2.5">
                      {selectedCoverflowNFT.title}
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 mt-1">
                      by <span className="text-blue-400">{selectedCoverflowNFT.artist || selectedCoverflowNFT.creator}</span>
                    </p>
                  </div>

                  {selectedCoverflowNFT.description && (
                    <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                      {selectedCoverflowNFT.description}
                    </p>
                  )}

                  {/* Pricing Breakdown Card (No border lines, only shadow & background contrasts) */}
                  <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block leading-none">
                      Financial Protocol
                    </span>
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Listing Price</span>
                      <div className="flex items-center gap-1.5 text-white">
                        <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
                        <span>{parseFloat(selectedCoverflowNFT.price).toFixed(2)} TON</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Sync Fee (5%)</span>
                      <div className="flex items-center gap-1.5 text-white">
                        <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
                        <span>{(parseFloat(selectedCoverflowNFT.price) * 0.05).toFixed(2)} TON</span>
                      </div>
                    </div>
                    <div className="h-px bg-white/5 my-1" />
                    <div className="flex items-center justify-between text-sm font-black text-white">
                      <span>TOTAL DEPOSIT</span>
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <img src={TON_LOGO} alt="TON" className="w-4.5 h-4.5 object-contain" />
                        <span>{(parseFloat(selectedCoverflowNFT.price) * 1.05).toFixed(2)} TON</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowBuyModalForCoverflow(true)}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] active:scale-95 transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer border border-[#C0C0C0]/50"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCoverflowNFT(null);
                      navigate(`/nft/${selectedCoverflowNFT.id}`);
                    }}
                    className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] active:scale-95 transition-all cursor-pointer"
                  >
                    More Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showBuyModalForCoverflow && selectedCoverflowNFT && (
        <BuyNFTModal 
          nft={selectedCoverflowNFT} 
          onClose={() => setShowBuyModalForCoverflow(false)} 
        />
      )}
      
      <section className="section-container w-full relative z-20 mb-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.25em] mb-1">User Console</p>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
              Hello, {userProfile?.name || 'Jamie'}!
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Balance</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5" />
              <p className="text-xs font-black text-foreground">{userProfile?.tonBalance ? `${userProfile.tonBalance.toFixed(2)} TON` : '0.00 TON'}</p>
            </div>
          </div>
        </div>
      </section>

      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'overview' | 'discovery')}
        className="section-container w-full relative z-20 mb-4 sm:mb-6"
      >
        <div className="flex items-center justify-between mb-4 px-0">
          <TabsList variant="line" className="bg-transparent gap-4 sm:gap-8">
            <TabsTrigger 
              value="overview"
              className="text-base sm:text-lg font-bold uppercase tracking-tight transition-all relative group focus:outline-none data-[state=active]:text-foreground text-foreground/30 hover:text-foreground/50 h-auto p-0 border-none bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent"
            >
              <span className="relative z-10">Overview</span>
              {activeTab === 'overview' && (
                <motion.div layoutId="homeTabLine" className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="discovery"
              className="text-base sm:text-lg font-bold uppercase tracking-tight transition-all relative flex items-center gap-2 group focus:outline-none data-[state=active]:text-foreground text-foreground/30 hover:text-foreground/50 h-auto p-0 border-none bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent"
            >
              <span className="relative z-10">Discovery</span>
              <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${activeTab === 'discovery' ? 'text-blue-500' : 'text-foreground/20'}`} />
              {activeTab === 'discovery' && (
                <motion.div layoutId="homeTabLine" className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Network.Online</span>
          </div>
        </div>

        <TabsContent value="overview" className="focus-visible:ring-0 p-0 outline-none">
          <div className="scroll-row gap-2 py-2 select-none">
            <MTButton
              onClick={() => setSelectedGenre(null)}
              variant={selectedGenre === null ? "filled" : "outlined"}
              color="blue"
              className="rounded-full px-6 py-2 text-[10px] h-auto font-bold tracking-widest transition-all whitespace-nowrap shrink-0 uppercase"
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              All
            </MTButton>
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre.name;
              return (
                <MTButton
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.name)}
                  variant={isSelected ? "filled" : "outlined"}
                  color="blue"
                  className="rounded-full px-6 py-2 text-[10px] h-auto font-bold tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 uppercase"
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  <genre.icon className="h-3.5 w-3.5" />
                  {genre.name}
                </MTButton>
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
            className="w-full space-y-0 pb-12 px-0"
          >
            {/* Welcome Banner */}
            <CompleteProfilePrompt />
            <AnimatePresence>
              {showWelcome && (
                <WelcomeBanner onDismiss={dismissWelcome} onGetTokens={() => setIsTokensModalOpen(true)} />
              )}
            </AnimatePresence>

            {/* Feature Showcase Grid */}
            <section className="section-container w-full overflow-hidden">
              <SectionHeader 
                title="NFTs for you" 
              />
              <div className="flex overflow-x-auto gap-4 px-4 sm:px-0 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={`foryou-loading-${i}`} className="w-[60vw] sm:w-[calc(33.33%-8px)] md:w-[calc(25%-10.66px)] lg:w-[calc(20%-12px)] snap-start shrink-0">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  recommendedNFTs.map(nft => (
                    <div key={`foryou-${nft.id}`} className="w-[60vw] sm:w-[calc(33.33%-8px)] md:w-[calc(25%-10.66px)] lg:w-[calc(20%-12px)] snap-start shrink-0">
                      <NFTCard nft={nft} />
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Trending NFTs Section */}
            <section className="section-container w-full bg-[#060c1f] p-4 rounded-3xl">
              <SectionHeader 
                title="Trending NFTs" 
                viewAllLink="/marketplace" 
              />
              <div className="-mx-4 md:-mx-8 lg:-mx-12">
                <TiltedCoverflow items={nftCoverflowItems} />
              </div>
            </section>

            {/* Edge-to-Edge Token Forge Section */}
            <section className="section-container relative overflow-hidden bg-[#09132e] dark:bg-[#09132e] p-6 sm:p-8 transition-all flex flex-col xl:flex-row items-center justify-between gap-6 border-none rounded-2xl">
              {/* Background Glow */}
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

              <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center lg:items-start gap-4 text-center lg:text-left">
                <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <motion.img 
                    src={TJ_COIN_ICON} 
                    alt="TJ Coin" 
                    className="w-20 h-20 object-contain pointer-events-none drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">Token Forge</h2>
                  </div>
                  <p className="text-blue-100/70 font-medium text-xs sm:text-sm max-w-xl leading-relaxed">
                    Instantly forge TON into JAM tokens. Participate in decentralized staking, access premium creator contracts, and acquire exclusive limited audio NFTs.
                  </p>
                </div>
              </div>

              {/* Balances and Rate Block */}
              <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-auto">
                {/* Rate conversion display */}
                <div className="bg-[#060c1f]/80 dark:bg-[#060c1f]/80 px-4 py-3 rounded-2xl flex items-center justify-between gap-6 min-w-full sm:min-w-[200px] border border-blue-500/10 shadow-lg shadow-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center p-1.5 border border-white/5">
                      <img src={TON_LOGO} alt="TON" className="w-5 h-5 object-contain" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Rate</p>
                      <p className="text-xs font-black text-white">1 TON</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-500/60" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center p-1.5 border border-blue-500/20">
                      <img src={TJ_COIN_ICON} alt="JAM" className="w-5 h-5 object-contain" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Yield</p>
                      <p className="text-xs font-black text-blue-400">100 JAM</p>
                    </div>
                  </div>
                </div>

                {/* Balances */}
                <div className="bg-[#060c1f]/80 dark:bg-[#060c1f]/80 px-5 py-3 rounded-2xl flex items-center justify-around gap-6 min-w-full sm:min-w-[200px] border-none">
                  <div className="text-center sm:text-left">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">TON Balance</span>
                    <span className="text-sm font-black text-white">{userProfile.tonBalance?.toFixed(2) || '0.00'} TON</span>
                  </div>
                  <div className="h-8 w-px bg-white/5" />
                  <div className="text-center sm:text-left">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">JAM Balance</span>
                    <span className="text-sm font-black text-blue-400">{userProfile.jamBalance || '0'} JAM</span>
                  </div>
                </div>

                {/* Forge Button */}
                <button
                  onClick={() => setIsBuyTJModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest rounded-2xl text-xs active:scale-95 transition-all shadow-lg hover:shadow-blue-500/20 min-w-full sm:min-w-[150px] cursor-pointer border border-[#C0C0C0]/50"
                >
                  Forge JAM Now
                </button>
              </div>
            </section>

            {/* Hero Section - Neural Protocol Aesthetic */}
            <section className="section-container relative overflow-hidden bg-transparent dark:bg-black rounded-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              
              <div className="relative z-10 p-5 sm:p-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                        Neural_Sync.Active
                      </Badge>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Lat: 0.12ms</div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <h1 className="text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-foreground">
                        FORGE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-gradient-x">LEGACY</span>
                      </h1>
                      <div className="h-px w-20 sm:w-24 bg-blue-500/50"></div>
                    </div>
                  
                  <p className="text-base sm:text-2xl text-muted-foreground leading-relaxed font-medium max-w-lg font-display">
                    Welcome to the nexus of decentralized sound. Forge rare artifacts and engage in global community frequencies via the TON blockchain.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <button 
                      onClick={() => playAll(MOCK_TRACKS)}
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-foreground text-background font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 group active:scale-95 text-[11px] sm:text-base cursor-pointer"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current group-hover:scale-110 transition-transform" />
                      Initiate
                    </button>
                    <Link 
                      to="/marketplace"
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 group active:scale-95 text-[11px] sm:text-base"
                    >
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:rotate-12 transition-transform" />
                      Market
                    </Link>
                    <button 
                      onClick={() => setIsBuyTJModalOpen(true)}
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-secondary hover:bg-secondary/80 text-foreground font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 group active:scale-95 text-[11px] sm:text-base cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 group-hover:rotate-12 transition-transform" />
                      Buy Jam Token
                    </button>
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
                        className="bg-blue-950/20 border border-blue-900/20 p-5 rounded-2xl backdrop-blur-md group hover:border-blue-500/30 transition-colors"
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
            <section className="section-container w-full bg-[#060c1f] p-4 rounded-3xl">
              <Leaderboard artists={artists} limit={5} />
            </section>

            {/* Global Top Fan Leaderboard */}
            <section className="section-container w-full bg-[#060c1f] p-4 rounded-3xl">
              <FanLeaderboard />
            </section>

            {/* AI Dj Krupy Section - Neural Synthesis Interface */}
            <section className="section-container relative">
              {aiResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-transparent dark:bg-black p-6 sm:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative overflow-hidden shadow-2xl rounded-2xl"
                >
                  {/* Digital particles effect */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  
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
                        className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="h-7 w-7 fill-black translate-x-1" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
                    <div className="space-y-3 lg:space-y-4">
                      <div className="inline-flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
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
                        className="px-8 py-3 sm:px-10 sm:py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-full text-[10px] sm:text-[11px] transition-all hover:bg-primary/90 shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Initiate
                      </button>
                      <button 
                        onClick={() => setAiResult(null)}
                        className="px-6 py-3 sm:px-8 sm:py-4 bg-secondary text-foreground font-black uppercase tracking-widest rounded-full text-[10px] sm:text-[11px] transition-all hover:bg-secondary/80 border border-border active:scale-95 cursor-pointer"
                      >
                        Recalibrate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-blue-950 dark:bg-blue-950 p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group shadow-2xl rounded-2xl">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[100px] opacity-30 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    
                    <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-blue-500/30 relative shadow-[0_0_30px_rgba(37,99,235,0.3)] group-hover:border-blue-400 transition-all flex-shrink-0">
                      <img src="https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png" alt="DJ Krupy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-black animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    </div>
                    
                    <div className="space-y-4 relative z-10 flex-1 text-center sm:text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Neural.Relay_Active</h4>
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-foreground">KRUPY_CO_PILOT</h3>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs font-medium leading-relaxed max-w-sm uppercase tracking-wider">Your personal generative host. Synching vibes, parsing lyrics, and forging custom frequency streams.</p>
                      
                      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                        <button 
                          onClick={handleGenerateAIPlaylist}
                          disabled={isGeneratingAI}
                          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isGeneratingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {isGeneratingAI ? "SYNTHESIZING..." : "GENERATE_VIBE"}
                        </button>
                        <Link 
                          to="/dj-krupy"
                          className="px-6 py-3 bg-secondary border border-border text-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center gap-2 group"
                        >
                          <Brain className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                          Launch DJ Krupy
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col gap-4">
                    <div className="flex-1 bg-transparent dark:bg-black/50 border border-border rounded-3xl p-6 flex flex-col justify-center gap-3 group hover:border-blue-500/30 transition-all shadow-xl">
                      <Activity className="h-6 w-6 text-blue-500/40 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Neural_Relay</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">Multimodal BPM parsing and genre density calibration.</p>
                    </div>
                    <div className="flex-1 bg-transparent dark:bg-black/50 border border-border rounded-3xl p-6 flex flex-col justify-center gap-3 group hover:border-purple-500/30 transition-all shadow-xl">
                      <Globe className="h-6 w-6 text-purple-500/40 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">TON_Nexus</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">Decentralized trend mapping across the entire protocol.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Featured Tracks Dynamic Playlist */}
            <section className="section-container">
              <SectionHeader 
                title="Featured_Streams" 
                viewAllLink={`/playlist/${featuredPlaylist.id}`} 
              />
              
              <Card className="relative overflow-hidden border-none bg-blue-950 dark:bg-blue-950 shadow-2xl group rounded-2xl">
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
                        className="px-6 py-3 bg-blue-950/20 border border-blue-900/10 hover:bg-blue-900/40 text-white font-black uppercase tracking-widest rounded-full text-[10px] transition-all active:scale-95"
                      >
                        Data Details
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* Protocol Mechanics Accordion */}
            <section className="section-container">
              <div className="w-full space-y-3">
                <div className="text-center space-y-1">
                  <Badge variant="outline" className="px-4 py-1 bg-blue-950/20 dark:bg-blue-950/20 border-zinc-700 dark:border-blue-900/30 text-zinc-400 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full">
                    Protocol_Documentation
                  </Badge>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Synthesis Mechanics</h2>
                  <p className="text-muted-foreground text-xs font-medium">Understanding the decentralized frequency protocol.</p>
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
                      className="bg-zinc-100 dark:bg-black border border-border/40 rounded-2xl px-6 transition-all data-[state=open]:bg-zinc-200/50 dark:data-[state=open]:bg-zinc-950/50 overflow-hidden"
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

            {/* Tasks */}
            <section className="section-container">
               <SectionHeader title="Daily Missions" viewAllLink="/tasks" />
               <div className="relative w-full">
                 {combinedMissions.length > 0 ? (
                   <MissionCarousel
                     plugins={[missionAutoplayRef.current]}
                     className="w-full"
                     onMouseEnter={missionAutoplayRef.current.stop}
                     onMouseLeave={missionAutoplayRef.current.reset}
                     opts={{
                       align: "start",
                       loop: true,
                     }}
                   >
                     <MissionCarouselContent className="-ml-4">
                       {combinedMissions.map((task) => (
                         <MissionCarouselItem 
                           key={task.id} 
                           className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                         >
                           <div className="h-full">
                             <TaskCard 
                               task={task} 
                               onClaim={handleTaskClaim} 
                               onToggle={handleTaskToggle} 
                               onClick={handleTaskClick} 
                             />
                           </div>
                         </MissionCarouselItem>
                       ))}
                     </MissionCarouselContent>
                   </MissionCarousel>
                 ) : (
                   <div className="bg-secondary/15 backdrop-blur-md rounded-2xl p-6 text-center border border-border/10">
                     <p className="text-muted-foreground text-xs font-medium">All telemetry tasks fully completed. Check back in the next epoch.</p>
                   </div>
                 )}
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
            <section className="section-container">
              <SectionHeader 
                title="Trending Signals" 
                viewAllLink="/explore/tracks?title=Trending Signals&filter=trending" 
              />
              {isLoading ? (
                <div className="scroll-row">
                  {[1, 2, 3, 4].map(i => (
                    <div key={`trend-loading-${i}`} className="flex-shrink-0 w-[150px] sm:w-[200px]">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <TiltedCoverflow items={trackCoverflowItems} />
                </div>
              )}
            </section>

            {/* Top Charts - Tactical Grid Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <SectionHeader title="Global_Streaming" viewAllLink="/explore/tracks?title=Global Top 10&filter=trending" />
                <div className="-mx-4 sm:mx-0">
                  <div className="flex flex-col">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => <SkeletonCard key={`chart-loading-${i}`} variant="row" className="!mx-0 rounded-none border-none mb-1" />)
                    ) : (
                      trendingTracks.slice(0, 10).map((track, idx) => (
                        <TrackCard key={`chart-${track.id}`} track={track} variant="row" index={idx} className="!mx-0 rounded-none border-none" />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <SectionHeader title="Latest_Releases" viewAllLink="/explore/tracks?title=New Releases&filter=new" />
                <div className="-mx-4 sm:mx-0">
                  <div className="flex flex-col">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => <SkeletonCard key={`new-loading-${i}`} variant="row" className="!mx-0 rounded-none border-none mb-1" />)
                    ) : (
                      newReleases.map((track, index) => (
                        <TrackCard 
                          key={`new-${track.id}`} 
                          track={track} 
                          variant="row"
                          index={index}
                          className="!mx-0 rounded-none border-none"
                        />
                      ))
                    )}
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
                    <div className="animate-pulse bg-muted/20 p-6 rounded-[4px] space-y-4">
                      <div className="w-24 h-24 rounded-full bg-muted mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </HomeSection>
            ) : (
              <section className="section-container">
                <SectionHeader title="Rising Stars" viewAllLink="/explore/artists?title=Rising Stars&filter=rising" />
                <ArtistSlider artists={recommendedArtists} />
              </section>
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
            <section className="section-container grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </motion.div>
  );
};

export default Home;
