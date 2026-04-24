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
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import NFTAlphaCarousel from '@/components/NFTAlphaCarousel';
import SectionHeader from '@/components/SectionHeader';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

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
      className="relative overflow-hidden rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-2xl shadow-blue-500/20"
    >
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Welcome to TonJam</h2>
          <p className="text-white/80 font-medium max-w-xl">
            You've just entered the future of music. Discover decentralized sounds, collect rare NFTs, and connect with your favorite artists on the TON blockchain.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <button 
              onClick={onDismiss}
              className="px-6 py-2 bg-white text-blue-600 font-bold uppercase tracking-widest rounded-full text-[10px] hover:bg-neutral-100 transition-all shadow-lg"
            >
              Start Exploring
            </button>
            <button 
              onClick={onGetTokens}
              className="px-6 py-2 bg-white/20 text-white font-bold uppercase tracking-widest rounded-full text-[10px] hover:bg-white/30 transition-all shadow-lg"
            >
              Get Free Tokens
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
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
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    <div className="page-container w-full">
      <GetFreeTokensModal isOpen={isTokensModalOpen} onClose={() => setIsTokensModalOpen(false)} />
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50 mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent border border-blue-500/20 backdrop-blur-xl p-8 lg:p-12 shadow-2xl"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[11px] font-bold uppercase tracking-[0.2em]">
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
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group/btn text-sm"
                >
                  <ShoppingBag className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                  Explore Marketplace
                </button>
                <button 
                  onClick={() => setIsTokensModalOpen(true)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-3 text-sm"
                >
                  <Sparkles className="h-5 w-5" />
                  Get Free Tokens
                </button>
                <button 
                  onClick={dismissWelcome}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-foreground font-bold uppercase tracking-widest rounded-full border border-white/10 transition-all text-sm"
                >
                  Start Listening
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Section */}
      <div className="max-w-3xl mx-auto w-full relative z-20">
        <div className="flex items-center justify-between mb-4 pb-1">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-xl font-bold uppercase tracking-tighter transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${activeTab === 'overview' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
            >
              Overview
              {activeTab === 'overview' && (
                <motion.div layoutId="homeTab" className="absolute -bottom-3 left-0 right-0 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('discovery')}
              className={`text-xl font-bold uppercase tracking-tighter transition-all relative flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${activeTab === 'discovery' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-400'}`}
            >
              Discovery
              <Sparkles className={`h-4 w-4 ${activeTab === 'discovery' ? 'text-blue-400' : 'text-muted-foreground/50'}`} />
              {activeTab === 'discovery' && (
                <motion.div layoutId="homeTab" className="absolute -bottom-3 left-0 right-0 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="scroll-row py-1 mt-[2px]">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
                selectedGenre === null 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                  : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-transparent hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted/10 inactive-pill'
              }`}
            >
              All Vibes
            </button>
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre.name;
              const Icon = genre.icon;
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.name)}
                  className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all snap-start overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                      : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-transparent hover:text-blue-600 dark:hover:text-neutral-400 hover:bg-muted/10 inactive-pill'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-80`}></div>
                  )}
                  {!isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                  )}
                  <Icon className={`relative z-10 h-3 w-3 ${isSelected ? 'text-white' : 'text-blue-500 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-neutral-400'}`} />
                  <span className="relative z-10">{genre.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'discovery' ? (
          <motion.div
            key="discovery-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <DiscoveryFeed />
          </motion.div>
        ) : (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Welcome Banner */}
            <CompleteProfilePrompt />
            <AnimatePresence>
              {showWelcome && (
                <WelcomeBanner onDismiss={dismissWelcome} onGetTokens={() => setIsTokensModalOpen(true)} />
              )}
            </AnimatePresence>

            {/* Discover Weekly Banner */}
            {auth.currentUser && discoverWeekly && (
              <section className="mb-10">
                <div 
                  onClick={() => navigate(`/playlist/${discoverWeekly.id}`)}
                  className="relative h-48 md:h-64 rounded-[10px] overflow-hidden cursor-pointer group"
                >
                  <img 
                    src={discoverWeekly.coverUrl} 
                    alt="Discover Weekly" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-[8px] font-black uppercase tracking-widest rounded-sm text-white">Algorithmic Protocol</span>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Update-07</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Discover Weekly</h2>
                      <p className="text-xs text-white/60 font-medium max-w-md mt-2 line-clamp-1">Personalized frequency stream based on your unique neural listening patterns.</p>
                    </div>
                    <button className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/50 hover:scale-110 active:scale-95 transition-all">
                      <Play className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Featured Sponsored Posts Carousel */}
            <div className="mt-8">
              <AutoCarousel items={carouselItems} onCtaClick={handleCtaClick} />
            </div>

            {/* Hero Section */}
            <section className="relative rounded-[10px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent z-0"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 p-4 lg:p-6 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-neutral-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Zap className="h-3 w-3" />
                  Live on TON Blockchain
                </div>
                
                <h1 className="text-[32px] lg:text-[60px] font-black uppercase tracking-tighter leading-[0.85] text-foreground">
                  The Future of <span className="text-blue-500">Music</span> is Here
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium max-w-xl">
                  Stream high-fidelity music, collect rare artifacts, and join the decentralized revolution on the TON blockchain.
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => playAll(MOCK_TRACKS)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group/btn text-xs"
                  >
                    <Play className="h-4 w-4 fill-white group-hover/btn:scale-110 transition-transform" />
                    Start Listening
                  </button>
                  <Link 
                    to="/marketplace"
                    className="px-4 py-2 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 text-xs"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Explore NFTs
                  </Link>
                </div>
              </div>
            </section>

            {/* Featured Tracks Dynamic Playlist */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Featured Tracks</h2>
                  <p className="text-muted-foreground text-sm">Hand-picked by TonJam AI based on network trends</p>
                </div>
                <Link 
                  to={`/playlist/${featuredPlaylist.id}`}
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[10px] p-8 border border-muted/20 flex flex-col md:flex-row items-center gap-8 group"
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent z-0"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                
                <div className="relative z-10 w-48 h-48 rounded-[10px] overflow-hidden shadow-2xl flex-shrink-0 group/cover">
                  <img 
                    src={featuredPlaylist.coverUrl} 
                    alt={featuredPlaylist.title}
                    className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-background/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const tracks = (featuredPlaylist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                        playAll(tracks); 
                      }}
                      className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-foreground shadow-xl hover:scale-110 transition-transform"
                    >
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </button>
                  </div>
                </div>
                
                <div className="relative z-10 flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/30">
                      AI Curated
                    </span>
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">• {featuredPlaylist.trackCount} Tracks</span>
                  </div>
                  <h3 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase leading-none">{featuredPlaylist.title}</h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-2xl leading-relaxed font-medium">
                    {featuredPlaylist.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                    <button 
                      onClick={() => {
                        const tracks = (featuredPlaylist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                        playAll(tracks);
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-foreground font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group/btn text-xs"
                    >
                      <Play className="h-5 w-5 fill-white group-hover/btn:scale-110 transition-transform" />
                      Play Now
                    </button>
                    <Link 
                      to={`/playlist/${featuredPlaylist.id}`}
                      className="px-8 py-3 bg-muted/50 hover:bg-muted text-foreground font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 text-xs"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Trending Now Section */}
            <section className="section-container">
              <SectionHeader title="Trending Now" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 5 Songs</h4>
                  {trendingTracks.slice(0, 5).map((track, idx) => (
                    <div key={`trend-track-${track.id}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/track/${track.id}`)}>
                      <span className="text-lg font-black italic text-muted-foreground/30 w-6">{idx + 1}</span>
                      <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-full h-full object-cover" alt={track.title} />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{track.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 3 Artists</h4>
                  {trendingArtists.map((artist) => (
                    <div key={`trend-artist-${artist.uid}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/artist/${artist.uid}`)}>
                      <img src={artist.avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} className="w-12 h-12 rounded-full object-cover" alt={artist.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{artist.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{artist.genre}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trending NFTs</h4>
                  {trendingNFTs.slice(0, visibleNFTCount).map((nft) => (
                    <div key={`trend-nft-${nft.id}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/nft/${nft.id}`)}>
                      <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`)} className="w-12 h-12 rounded-[5px] object-cover" alt={nft.title} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{nft.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{nft.price} TON</p>
                      </div>
                    </div>
                  ))}
                  {visibleNFTCount < trendingNFTs.length && (
                    <div ref={loadMoreRef} className="py-2 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                      Loading more...
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recently Played */}
            {filteredRecentlyPlayed.length > 0 && (
              <HomeSection title="Jump Back In" icon={Clock} link="/explore/tracks?title=Recently Played&filter=recent">
                {filteredRecentlyPlayed.map(track => (
                  <div key={`recent-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Recommended Tracks */}
            {recommendedTracks.length > 0 && (
              <HomeSection title="Recommended for You" icon={Sparkles} link="/explore/tracks?title=Recommended for You&filter=recommended">
                {recommendedTracks.map(track => (
                  <div key={`rec-track-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <TrackCard track={track} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Trending Tracks */}
            <HomeSection title="Trending Signals" icon={Flame} link="/explore/tracks?title=Trending Signals&filter=trending">
              {trendingTracks.map(track => (
                <div key={`trend-${track.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                  <TrackCard track={track} />
                </div>
              ))}
            </HomeSection>

            {/* Top Charts - List View */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader title="Global Top 10" viewAllLink="/explore/tracks?title=Global Top 10&filter=trending" />
                <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar">
                  {trendingTracks.slice(0, 10).map((track, idx) => (
                    <div 
                      key={`chart-${track.id}`} 
                      onClick={() => navigate(`/track/${track.id}`)}
                      className="flex items-center gap-4 group cursor-pointer p-2 rounded-[5px] hover:bg-muted/50 transition-all w-[85vw] sm:w-[300px] snap-start"
                    >
                      <span className="text-[20px] font-black italic text-muted-foreground/30 group-hover:text-blue-500/40 transition-colors w-8 text-center">
                        {idx + 1}
                      </span>
                      <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold uppercase tracking-tight text-foreground truncate group-hover:text-blue-400 transition-colors">{track.title}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1">
                        {Math.random() > 0.5 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        {(track.playCount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="New Releases" viewAllLink="/explore/tracks?title=New Releases&filter=new" />
                <div className="space-y-4">
                  {newReleases.map(track => (
                    <div 
                      key={`new-${track.id}`} 
                      onClick={() => navigate(`/track/${track.id}`)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="relative w-16 h-16 rounded-[5px] overflow-hidden flex-shrink-0">
                        <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.stopPropagation(); playTrack(track); }}>
                          <Play className="h-4 w-4 text-foreground fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight text-foreground truncate">{track.title}</h4>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[7px] font-bold px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground uppercase tracking-widest">
                            {track.genre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Curated Playlists */}
            {curatedPlaylists.length > 0 && (
              <HomeSection title="Curated for You" icon={Sparkles} link="/explore/playlists?title=Curated Playlists&filter=curated">
                {curatedPlaylists.map(playlist => (
                  <div key={`playlist-${playlist.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <PlaylistCard playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Genre Grid - Quick Access */}
            <section className="section-container">
              <SectionHeader title="Explore Genres" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {GENRES.map(genre => (
                  <GenreCard key={genre.id} genre={genre} />
                ))}
              </div>
            </section>

            {/* Top NFT Sales */}
            <section className="section-container">
              <SectionHeader title="NFT Alpha" viewAllLink="/explore/nfts?title=NFT Alpha&filter=top_nfts" />
              <NFTAlphaCarousel nfts={topNFTsForCarousel} />
            </section>

            {/* Recommended Artists */}
            <HomeSection title="Rising Stars" icon={UserCheck} link="/explore/artists?title=Rising Stars&filter=rising">
              {recommendedArtists.map(artist => (
                <div key={`artist-${artist.uid}`} className="flex-shrink-0 w-48 sm:w-56 snap-start">
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </HomeSection>

            {/* Recommended NFTs */}
            {recommendedNFTs.length > 0 && (
              <HomeSection title="Curated Collectibles" icon={Sparkles} link="/explore/nfts?title=Curated Collectibles&filter=recommended">
                {recommendedNFTs.map(nft => (
                  <div key={`rec-nft-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </HomeSection>
            )}

            {/* Marketplace Highlights */}
            <HomeSection title="New in Marketplace" icon={PlusCircle} link="/explore/nfts?title=New in Marketplace&filter=new_nfts">
              {newlyMintedNFTs.map(nft => (
                <div key={`minted-${nft.id}`} className="flex-shrink-0 w-40 sm:w-48 snap-start">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </HomeSection>

            {/* Community & Artist CTA Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass bg-card/50 p-6 rounded-[10px] space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Radio className="h-32 w-32 text-blue-500" />
                </div>
                <div className="w-12 h-12 rounded-[5px] bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <Music2 className="h-6 w-6" />
                </div>
                <h3 className="text-[26px] font-bold uppercase tracking-tighter text-foreground">Join the JamSpace</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Connect with other music lovers, share your favorite tracks, and discover new sounds in our community-driven social feed.
                </p>
                <Link to="/jamspace" className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors group/link">
                  Enter JamSpace <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="glass bg-card/50 p-6 rounded-[10px] space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Disc className="h-32 w-32 text-purple-500" />
                </div>
                <div className="w-12 h-12 rounded-[5px] bg-purple-600/10 flex items-center justify-center text-purple-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-[26px] font-bold uppercase tracking-tighter text-foreground">
                  {userProfile.isVerifiedArtist ? 'Artist Hub' : 'Mint Your Legacy'}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  {userProfile.isVerifiedArtist 
                    ? 'Manage your music, track your earnings, and connect with your fans through our powerful artist tools.'
                    : 'Join the revolution. Upload your music, mint limited edition NFTs, and start earning royalties directly on TON.'}
                </p>
                <Link 
                  to={userProfile.isVerifiedArtist ? '/artist-dashboard' : '/artist-onboarding'} 
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 transition-colors group/link"
                >
                  {userProfile.isVerifiedArtist ? 'Go to Dashboard' : 'Start Onboarding'} <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
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
    </div>
  );
};

export default Home;
