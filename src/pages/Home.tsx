import GetFreeTokensModal from '@/components/GetFreeTokensModal';
import CompleteProfilePrompt from '@/components/CompleteProfilePrompt';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search, X } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES } from '@/constants';
import { Track } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
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

    return [...approvedSponsorships, ...FEATURED_TRACKS_CAROUSEL];
  }, [sponsoredPosts]);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('tonjam_has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('tonjam_has_visited', 'true');
  };

  const handleCtaClick = (item: CarouselItem) => {
    const track = MOCK_TRACKS.find(t => t.id === item.id);
    if (track) {
      playTrack(track);
      return;
    }

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

    if (item.link) {
      navigate(item.link);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const trendingTracks = useMemo(() => getTrendingTracks(), [getTrendingTracks]);
  
  const { recommendedTracks } = useMemo(() => {
    const { recommendedTracks: tracks } = getRecommendations();
    return { recommendedTracks: tracks };
  }, [getRecommendations]);

  const newReleases = useMemo(() => {
    return [...MOCK_TRACKS].sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0, 10);
  }, []);

  const quickAccessItems = useMemo(() => {
    const items = [...recentlyPlayed.slice(0, 6)];
    if (items.length < 6) {
      const extra = allPlaylists.slice(0, 6 - items.length);
      return [...items.map(t => ({ ...t, type: 'track' })), ...extra.map(p => ({ ...p, type: 'playlist' }))];
    }
    return items.map(t => ({ ...t, type: 'track' }));
  }, [recentlyPlayed, allPlaylists]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <GetFreeTokensModal isOpen={isTokensModalOpen} onClose={() => setIsTokensModalOpen(false)} />
      
      <div className="px-4 lg:px-8 py-8 space-y-12">
        {/* Spotify-style Greeting */}
        <section>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-8">{greeting}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessItems.map((item: any, idx) => (
              <motion.div
                key={`quick-${idx}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.type === 'track' ? `/player/${item.id}` : `/playlist/${item.id}`)}
                className="flex items-center bg-card hover:bg-accent/50 rounded-lg overflow-hidden cursor-pointer transition-all group shadow-sm"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={item.coverUrl || getPlaceholderImage(item.title)} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 px-4 flex items-center justify-between min-w-0">
                  <span className="text-sm font-bold truncate pr-2">{item.title}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'track') playTrack(item);
                    }}
                    className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Welcome Banner */}
        <AnimatePresence>
          {showWelcome && (
            <WelcomeBanner onDismiss={dismissWelcome} onGetTokens={() => setIsTokensModalOpen(true)} />
          )}
        </AnimatePresence>

        {/* Featured Carousel */}
        <section>
          <AutoCarousel items={carouselItems} onCtaClick={handleCtaClick} />
        </section>

        {/* Home Sections */}
        <div className="space-y-10">
          <HomeSection title="Made For You" icon={Sparkles} link="/explore/tracks?title=Recommended&filter=recommended">
            {recommendedTracks.map((track, idx) => (
              <div key={`rec-${track.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <TrackCard track={track} />
              </div>
            ))}
          </HomeSection>

          {recentlyPlayed.length > 0 && (
            <HomeSection title="Recently Played" icon={Clock} link="/explore/tracks?title=Recently Played&filter=recent">
              {recentlyPlayed.map((track, idx) => (
                <div key={`recent-${track.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                  <TrackCard track={track} />
                </div>
              ))}
            </HomeSection>
          )}

          <HomeSection title="Trending Now" icon={Flame} link="/explore/tracks?title=Trending&filter=trending">
            {trendingTracks.map((track, idx) => (
              <div key={`trend-${track.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <TrackCard track={track} />
              </div>
            ))}
          </HomeSection>

          <HomeSection title="Trending NFTs" icon={Activity} link="/marketplace">
            {allNFTs.slice(0, 5).map((nft, idx) => (
              <div key={`nft-trend-${nft.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <NFTCard nft={nft} />
              </div>
            ))}
          </HomeSection>

          <HomeSection title="Trending Artists" icon={UserCheck} link="/artists">
            {artists.slice(0, 5).map((artist, idx) => (
              <div key={`artist-trend-${artist.uid}-${idx}`} className="flex-shrink-0 w-48 lg:w-56 snap-start">
                <ArtistCard artist={artist} />
              </div>
            ))}
          </HomeSection>

          <HomeSection title="Top Chart NFTs" icon={Gavel} link="/marketplace">
            {allNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).slice(0, 5).map((nft, idx) => (
              <div key={`nft-top-${nft.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <NFTCard nft={nft} />
              </div>
            ))}
          </HomeSection>

          <HomeSection title="New Releases" icon={Zap} link="/explore/tracks?title=New Releases&filter=new">
            {newReleases.map((track, idx) => (
              <div key={`new-${track.id}-${idx}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <TrackCard track={track} />
              </div>
            ))}
          </HomeSection>

          <HomeSection title="Your Playlists" icon={ListMusic} link="/library">
            {allPlaylists.slice(0, 8).map(playlist => (
              <div key={`playlist-${playlist.id}`} className="flex-shrink-0 w-56 lg:w-64 snap-start">
                <PlaylistCard playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
              </div>
            ))}
          </HomeSection>
        </div>

        {/* Genres */}
        <section>
          <SectionHeader title="Explore Genres" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {GENRES.map(genre => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        </section>

        {/* Decentralized Footer Info */}
        <section className="pt-8 flex flex-col items-center text-center space-y-2 border-none">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <Globe className="h-3 w-3" />
            Secured by TON Blockchain
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            TonJam v2.6.4 • Decentralized Music Protocol
          </p>
        </section>
      </div>
    </div>
  );
};

export default Home;
