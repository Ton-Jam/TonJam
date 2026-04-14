import GetFreeTokensModal from '@/components/GetFreeTokensModal';
import CompleteProfilePrompt from '@/components/CompleteProfilePrompt';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Zap, TrendingUp, TrendingDown, Music2, ShoppingBag, Sparkles, Activity, Flame, Clock, Gavel, PlusCircle, UserCheck, ListMusic, Globe, Radio, Disc, Search, X, CheckCircle2, Disc3, Heart, ArrowRight } from 'lucide-react';
import { MOCK_TRACKS, MOCK_NFTS, CURATED_PLAYLISTS, GENRES, MOODS } from '@/constants';
import { Track, Post, UserProfile, Playlist, SponsoredContent, NFTItem } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import TrackCard from '@/components/TrackCard';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import AlbumCard from '@/components/AlbumCard';
import PlaylistCard from '@/components/PlaylistCard';
import GenreCard from '@/components/GenreCard';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import SectionHeader from '@/components/SectionHeader';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, orderBy, query, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TopChartNFTs from "@/components/TopChartNFTs";
import TopChartArtists from "@/components/TopChartArtists";

const HomeSection = ({ title, link, children }: { title: string, link?: string, children: React.ReactNode }) => {
  return (
    <section className="mb-16">
      <SectionHeader title={title} viewAllLink={link} />
      {children}
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
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="relative overflow-hidden rounded-sm bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-2xl shadow-blue-500/20"
    >
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="w-48 h-32 md:w-64 md:h-40 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xl">
          <img 
            src="https://i.postimg.cc/rmpGP6GC/file-00000000cbe071f4baf73be350672754-1.jpg" 
            alt="TonJam Coins High Five" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to Sparkles icon if the image is not yet uploaded
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>';
            }}
          />
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
              onClick={() => navigate('/tasks')}
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

const FeedCard = ({ post, index }: { post: Post; index: number }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/post/${post.id}`)}
      className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] bg-white/[0.02] rounded-xl p-5 hover:bg-white/[0.04] transition-all cursor-pointer border border-white/5 hover:border-white/10 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.userAvatar || 'https://picsum.photos/seed/user/100/100'}
          className="w-10 h-10 rounded-full object-cover"
          alt={post.userName}
        />
        <div>
          <p className="text-white text-sm font-semibold flex items-center gap-1">
            {post.userName}
            {post.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
          </p>
          <p className="text-[10px] text-white/40">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
          </p>
        </div>
      </div>
      <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-4">
        {post.content}
      </p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          className="w-full h-40 object-cover rounded-sm"
          alt="Post media"
        />
      )}
    </motion.div>
  );
};

// ... (rest of the file)

const SponsoredCarousel: React.FC<{ items: SponsoredContent[] }> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full h-[180px] sm:h-[220px] rounded-sm overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src={items[currentIndex].imageUrl} 
            className="w-full h-full object-cover" 
            alt={items[currentIndex].title}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          
          <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20">
                Sponsored
              </div>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                {items[currentIndex].type}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              {items[currentIndex].title}
            </h2>
            {items[currentIndex].description && (
              <p className="text-sm text-white/60 line-clamp-2 mb-6 max-w-sm">
                {items[currentIndex].description}
              </p>
            )}
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
                Explore Now
              </button>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                By {items[currentIndex].artistName}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-6 right-8 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const CarouselBanner = ({ posts }: { posts: Post[] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (!posts || posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden group shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => navigate(`/post/${currentPost.id}`)}
        >
          <img 
            src={currentPost.imageUrl || 'https://picsum.photos/seed/announcement/800/400'} 
            alt="Announcement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
                {currentIndex % 2 === 0 ? 'Featured' : 'Update'}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-3xl font-black text-white mb-3 tracking-tight line-clamp-2 leading-tight">
              {currentPost.content}
            </h1>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${currentPost.id}`);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
            >
              Read More <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Indicators */}
      <div className="absolute top-6 right-6 flex gap-1.5 z-10">
        {posts.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, playTrack, sponsoredPosts } = useAudio();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [artists, setArtists] = useState<UserProfile[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const unsubTracks = onSnapshot(
      query(collection(db, "tracks"), orderBy("createdAt", "desc"), limit(20)),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Track);
        setTracks(data);
      }
    );

    const unsubNfts = onSnapshot(
      query(collection(db, "nfts"), limit(20)),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as NFTItem);
        setNfts(data);
      }
    );

    const unsubPosts = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10)),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post);
        setPosts(data);
      }
    );

    const unsubArtists = onSnapshot(
      query(collection(db, "users"), where("isVerifiedArtist", "==", true), limit(10)),
      (snap) => {
        const data = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }) as UserProfile);
        setArtists(data);
      }
    );

    const unsubPlaylists = onSnapshot(
      query(collection(db, "playlists"), where("isPrivate", "==", false), limit(10)),
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Playlist);
        setPlaylists(data);
      }
    );

    return () => {
      unsubTracks();
      unsubNfts();
      unsubPosts();
      unsubArtists();
      unsubPlaylists();
    };
  }, []);

  const [activeGenre, setActiveGenre] = useState("All");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFreeTokens, setShowFreeTokens] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sponsoredPosts.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sponsoredPosts]);

  const filteredTracks = useMemo(() => {
    if (activeGenre === "All") return tracks;
    return tracks.filter(t => t.genre === activeGenre);
  }, [tracks, activeGenre]);

  const aiRecommendations = useMemo(() => filteredTracks.slice(2, 10), [filteredTracks]);
  const trendingTracks = useMemo(() => filteredTracks.slice(0, 8), [filteredTracks]);
  const recentlyMinted = useMemo(() => filteredTracks.filter((t) => t.isNFT).slice(4, 12), [filteredTracks]);
  
  const topChartNFTsData = useMemo(() => nfts.map(n => ({
    id: n.id,
    trackId: n.trackId,
    title: n.title,
    owner: n.owner,
    creator: n.creator,
    price: n.price,
    imageUrl: n.imageUrl,
    edition: n.edition
  })).slice(0, 4), [nfts]);

  const genres = ["All", "Electronic", "Hip Hop", "Pop", "Rock", "R&B", "Jazz", "Classical", "Lo-Fi", "Synthwave"];

  const carouselPosts = useMemo(() => {
    const withImages = posts.filter(p => p.imageUrl);
    return withImages.length > 0 ? withImages.slice(0, 5) : posts.slice(0, 5);
  }, [posts]);

  const newReleases = useMemo(() => {
    return [...filteredTracks].sort((a, b) => {
      const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt;
      const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt;
      return (dateB || 0) - (dateA || 0);
    }).slice(0, 8);
  }, [filteredTracks]);

  const sponsoredCarouselItems: CarouselItem[] = useMemo(() => {
    if (!sponsoredPosts) return [];
    return sponsoredPosts.map(post => ({
      id: post.id,
      title: post.title,
      subtitle: `By ${post.artistName}`,
      imageUrl: post.imageUrl,
      link: post.link || (post.type === 'track' ? `/track/${post.targetId}` : post.type === 'nft' ? `/nft/${post.targetId}` : '#'),
      cta: 'Explore Now'
    }));
  }, [sponsoredPosts]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32 font-sans selection:bg-blue-500/30">
      <main className="px-4 sm:px-6 pt-6 space-y-12 max-w-7xl mx-auto">
        
        {/* WELCOME BANNER */}
        <AnimatePresence>
          {showWelcome && (
            <WelcomeBanner 
              onDismiss={() => setShowWelcome(false)} 
              onGetTokens={() => setShowFreeTokens(true)} 
            />
          )}
        </AnimatePresence>

        {/* HORIZONTAL GENRE SCROLL FILTER PILL */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeGenre === genre 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* TOP CHARTS SECTION */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16">
          {artists.length > 0 && (
            <div className="flex-1 min-w-0">
              <SectionHeader title="Top Chart Artists" link="/discover" />
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                <div className="min-w-[300px] sm:min-w-[350px]">
                  <TopChartArtists artists={artists.map(a => ({ ...a, avatarUrl: a.avatar || '', verified: !!a.isVerifiedArtist }))} title="Global Top Artists" />
                </div>
                <div className="min-w-[300px] sm:min-w-[350px]">
                  <TopChartArtists artists={[...artists].reverse().map(a => ({ ...a, avatarUrl: a.avatar || '', verified: !!a.isVerifiedArtist }))} title="Rising Stars" />
                </div>
              </div>
            </div>
          )}
          
          {topChartNFTsData.length > 0 && (
            <div className="flex-1 min-w-0">
              <SectionHeader title="Top Chart NFTs" link="/marketplace" />
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                <div className="min-w-[300px] sm:min-w-[350px]">
                  <TopChartNFTs nfts={topChartNFTsData} title="Global Top 50 NFTs" />
                </div>
                <div className="min-w-[300px] sm:min-w-[350px]">
                  <TopChartNFTs nfts={[...topChartNFTsData].reverse()} title="Trending Now" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FEATURED TRACKS CAROUSEL */}
        <section>
          <AutoCarousel items={FEATURED_TRACKS_CAROUSEL} />
        </section>

        {/* DISCOVERY FEED (AI RECOMMENDATIONS & INSIGHTS) */}
        <DiscoveryFeed />

        {/* QUICK PILLS */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => navigate("/marketplace?filter=trending")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-semibold whitespace-nowrap transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Trending NFTs
          </button>
          <button
            onClick={() => navigate("/marketplace?filter=recommended")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-semibold whitespace-nowrap transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            AI Recommendations
          </button>
          <button
            onClick={() => navigate("/jamspace")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-semibold whitespace-nowrap transition-colors"
          >
            <Music2 className="w-4 h-4 text-green-400" />
            Jam Space
          </button>
        </div>

        {/* NEW RELEASES */}
        {newReleases.length > 0 && (
          <HomeSection title="New Releases" link="/discover">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x">
              {newReleases.map((track) => (
                <div key={track.id} className="snap-start hover:scale-[1.02] transition-transform duration-300">
                  <TrackCard track={track} />
                </div>
              ))}
            </div>
          </HomeSection>
        )}

        {/* TOP TRENDING NFT SECTION */}
        {nfts.length > 0 && (
          <HomeSection title="Top Trending NFTs" link="/marketplace">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x">
              {nfts.map((nft) => (
                <div key={nft.id} className="snap-start hover:scale-[1.02] transition-transform duration-300">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          </HomeSection>
        )}



        {/* LIVE NOW SECTION */}
        <HomeSection title="Live Now" link="/jamspace">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
            {artists.slice(0, 4).map((artist, i) => (
              <div key={artist.uid} className="relative min-w-[280px] sm:min-w-[320px] aspect-video rounded-sm overflow-hidden group cursor-pointer snap-start">
                <img 
                  src={artist.bannerUrl || getPlaceholderImage(`live-${i}`, 400, 225)} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Live stream"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Live
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3" /> {Math.floor(Math.random() * 500) + 100} Watching
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <img src={artist.avatar || getPlaceholderImage(`artist-${i}`)} className="w-8 h-8 rounded-full" alt="" />
                    <div>
                      <p className="text-white text-xs font-bold truncate">{artist.name}</p>
                      <p className="text-white/60 text-[10px] truncate">Sonic Session #{i + 1}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HomeSection>

        {/* EXPLORE BY GENRE */}
        <HomeSection title="Explore by Genre" link="/discover">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {GENRES.map((genre) => (
              <div key={genre.id} className="min-w-[160px] sm:min-w-[180px]">
                <GenreCard 
                  genre={genre} 
                  onClick={() => navigate(`/discover?genre=${genre.name}`)} 
                />
              </div>
            ))}
          </div>
        </HomeSection>

        {/* EXPLORE BY MOOD */}
        <HomeSection title="Explore by Mood" link="/discover">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => navigate(`/discover?mood=${mood.name}`)}
                className="relative group aspect-[16/9] min-w-[160px] sm:min-w-[200px] rounded-sm overflow-hidden bg-white/5 hover:border-blue-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black uppercase tracking-widest text-white drop-shadow-md">{mood.name}</span>
                </div>
              </button>
            ))}
          </div>
        </HomeSection>

        {/* TRENDING PLAYLIST SECTION */}
        {playlists.length > 0 && (
          <HomeSection title="Trending Playlists" link="/library">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4">
              {playlists.map((playlist, i) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </HomeSection>
        )}



        {/* TRENDING TRACKS SECTION */}
        {trendingTracks.length > 0 && (
          <HomeSection title="Trending Tracks" link="/discover">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4">
              {trendingTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </HomeSection>
        )}

        {/* TRENDING ALBUMS SECTION */}
        {playlists.length > 0 && (
          <HomeSection title="Trending Albums" link="/discover">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x">
              {playlists.map((playlist, i) => (
                <div key={playlist.id} className="snap-start hover:scale-[1.02] transition-transform duration-300">
                  <AlbumCard playlist={playlist} index={i} />
                </div>
              ))}
            </div>
          </HomeSection>
        )}

        {/* FAVORITE ARTIST SECTION */}
        {artists.length > 0 && (
          <HomeSection title="Favorite Artists" link="/discover">
            <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-4">
              {artists.map((artist, i) => (
                <ArtistCard key={artist.uid} artist={{ ...artist, avatarUrl: artist.avatar || '', verified: !!artist.isVerifiedArtist, earnings: { streaming: 0, nftSales: 0, total: artist.earnings || 0 } }} />
              ))}
            </div>
          </HomeSection>
        )}

        {/* RECENTLY MINTED TRACKS SECTION */}
        {recentlyMinted.length > 0 && (
          <HomeSection title="Recently Minted Tracks" link="/marketplace">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4">
              {recentlyMinted.map((track, i) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </HomeSection>
        )}

        {/* JAM FEED */}
        {posts.length > 0 && (
          <HomeSection title="Community Feed" link="/social">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4">
              {posts.map((post, i) => (
                <FeedCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </HomeSection>
        )}
      </main>

      <GetFreeTokensModal 
        isOpen={showFreeTokens} 
        onClose={() => setShowFreeTokens(false)} 
      />
    </div>
  );
};

export default Home;
