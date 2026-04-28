import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RadioIcon, 
  SpeakerWaveIcon, 
  RssIcon, 
  FireIcon, 
  UsersIcon, 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ChevronRightIcon,
  HomeIcon,
  HashtagIcon,
  BellIcon,
  EnvelopeIcon,
  BookmarkIcon,
  UserIcon,
  PhotoIcon,
  GifIcon,
  ListBulletIcon,
  FaceSmileIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroupInput } from '@/components/ButtonGroupInput';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MOCK_POSTS, MOCK_ARTISTS, MOCK_USER, MOCK_TRACKS, APP_LOGO, TJ_COIN_ICON } from '@/constants';
import UserCard from '@/components/UserCard';
import TrackCard from '@/components/TrackCard';
import SocialFeed from '@/components/SocialFeed';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import JamChat from '@/components/JamChat';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { Post, Track } from '@/types';
import { generateAIPlaylist, GenerateAIPlaylistResult } from '@/services/aiPlaylistService';
import { Loader2 } from 'lucide-react';

const JamSpace: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, followedUserIds, artists, posts, createPost, deletePost, activeJamRoom, joinJamRoom, leaveJamRoom, searchQuery: search, setSearchQuery: setSearch, jamspaceFilters, userProfile, playAll, allTracks } = useAudio();
  const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<GenerateAIPlaylistResult | null>(null);

  const handleAIPlaylist = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAIPlaylist();
      setAiResult(result);
      addNotification('Neural mix generated', 'success');
    } catch (e) {
      addNotification('Synthesis failed', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    // Simulate API call
    setTimeout(() => {
      createPost({
        content: postContent,
        userId: userProfile.uid,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        timestamp: new Date().toISOString(),
        likes: 0,
        reposts: 0,
        comments: 0,
        isVerified: true
      });
      setPostContent('');
      setIsPosting(false);
      addNotification('Post shared successfully', 'success');
    }, 1000);
  };

  const carouselItems: CarouselItem[] = [
    {
      id: '1',
      title: 'Genesis Mint Event',
      subtitle: 'Exclusive NFTs dropping from Neon Voyager',
      imageUrl: getPlaceholderImage('jam-1', 1200, 400),
      link: '/explore/nfts',
      cta: 'View Drop'
    },
    {
      id: '2',
      title: 'Neural Beats Live',
      subtitle: 'Join the global jam session in the Genesis Node',
      imageUrl: getPlaceholderImage('jam-2', 1200, 400),
      link: '/jamspace',
      cta: 'Join Room'
    },
    {
      id: '3',
      title: 'TON Ecosystem Growth',
      subtitle: 'Discover the future of decentralized music',
      imageUrl: getPlaceholderImage('jam-3', 1200, 400),
      link: '/explore',
      cta: 'Explore'
    }
  ];

  /* Trending topic mocks */
  const trendingTopics = [
    { tag: '#TONGenesis', count: '12.4k' },
    { tag: '#SynthSummer', count: '8.2k' },
    { tag: '#NeuralBeats', count: '5.1k' },
    { tag: '#MarketSpike', count: '3.9k' }
  ];

  /* AI Recommendations mock */
  const aiRecommendedTracks = useMemo(() => MOCK_TRACKS.slice(0, 5), []);

  const filteredPosts = useMemo(() => {
    let basePosts = [...posts];

    // 1. Tab Filtering
    if (activeTab === 'Following') {
      basePosts = basePosts.filter(p => followedUserIds.includes(p.userId));
    }

    // 2. Type Filtering
    if (filterType === 'Tracks') {
      basePosts = basePosts.filter(p => p.trackId);
    } else if (filterType === 'NFTs') {
      basePosts = basePosts.filter(p => {
        if (!p.trackId) return false;
        const track = MOCK_TRACKS.find(t => t.id === p.trackId);
        return track?.isNFT;
      });
    }

    // 3. Search Filtering
    if (search) {
      basePosts = basePosts.filter(p => p.content.toLowerCase().includes(search.toLowerCase()) || p.userName.toLowerCase().includes(search.toLowerCase()));
    }

    // 4. Sorting (Date)
    if (jamspaceFilters.sortOrder === 'Oldest') {
      basePosts.reverse();
    }

    return basePosts;
  }, [posts, search, activeTab, followedUserIds, filterType, jamspaceFilters.sortOrder]);

  // Auto-switch view mode based on filter type
  // Note: viewMode is now managed in global state, so we might not want to auto-switch it here,
  // or we need to call setJamspaceFilters from useAudio. For now, let's remove the auto-switch
  // since viewMode is controlled globally.

  const handleDeletePost = (id: string) => {
    deletePost(id);
  };

  return (
    <div className="min-h-screen w-full bg-background pb-4 relative overflow-x-hidden">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Live Signal Ticker */}
      <div className="bg-background py-4 px-4 overflow-hidden whitespace-nowrap relative z-50">
        <div className="flex items-center gap-4 animate-marquee">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.4em]">Signal {i}: Genesis Minted by @NeonVoyager</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full"></div>
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-[0.4em]">Relay {i}: 42.5 TON Transferred to @ByteBeat</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mt-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          {/* Left Column: X-style Navigation */}
          <aside className="hidden lg:block lg:col-span-3 space-y-2 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar pr-4">
            <div className="flex flex-col gap-1">
              {[
                { id: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
                { id: 'explore', label: 'Explore', icon: HashtagIcon, path: '/discover' },
                { id: 'notifications', label: 'Notifications', icon: BellIcon, path: '/notifications' },
                { id: 'messages', label: 'Messages', icon: EnvelopeIcon, path: '/messages' },
                { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon, path: '/bookmarks' },
                { id: 'genesis', label: 'Genesis', icon: SparklesIcon, path: '/genesis-forge' },
                { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-foreground/10 transition-all group w-fit"
                >
                  <item.icon className="h-7 w-7 text-foreground stroke-[2px]" />
                  <span className="text-xl font-bold pr-4">{item.label}</span>
                </button>
              ))}
              <Button className="mt-4 w-full rounded-full py-7 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-none">
                Post
              </Button>
            </div>

            {/* Live Jam Rooms - Refined */}
            <div className="mt-8 bg-muted/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-foreground">Live Jam Rooms</h3>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'genesis', name: 'Genesis Node', listeners: 124, icon: RadioIcon },
                  { id: 'drift', name: 'Cyber Drift', listeners: 89, icon: SpeakerWaveIcon }
                ].map(room => (
                  <div 
                    key={room.id}
                    onClick={() => activeJamRoom?.id === room.id ? leaveJamRoom() : joinJamRoom(room.id)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <room.icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{room.listeners} listening</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Column: Main Feed (X-style) */}
          <main className="lg:col-span-6 min-h-screen">
            {/* Featured Carousel */}
            <div className="px-2 pt-2 md:px-0 mb-4 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/10">
              <AutoCarousel items={carouselItems} />
            </div>

            {/* Header Tabs & Filters */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
              <div className="flex">
                {['For You', 'Following'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className="flex-1 py-3 text-center hover:bg-foreground/5 transition-all relative"
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      activeTab === tab ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {tab}
                    </span>
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
                {['All', 'Tracks', 'NFTs', 'Trending'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      filterType === filter ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="p-2 sm:p-3 flex gap-2 sm:gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder="What is happening?!" 
                  className="border-none bg-transparent text-sm resize-none focus-visible:ring-0 p-0 min-h-[40px] placeholder:text-muted-foreground/60 font-medium"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between pt-1 sm:pt-2 mt-1">
                  <div className="flex items-center gap-0.5 sm:gap-1 text-blue-500">
                    <button className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-full transition-all"><PhotoIcon className="h-4 w-4 stroke-[2px]" /></button>
                    <button className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-full transition-all"><GifIcon className="h-4 w-4 stroke-[2px]" /></button>
                    <button className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-full transition-all"><ListBulletIcon className="h-4 w-4 stroke-[2px]" /></button>
                    <button className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-full transition-all"><FaceSmileIcon className="h-4 w-4 stroke-[2px]" /></button>
                  </div>
                  <Button 
                    disabled={!postContent.trim() || isPosting}
                    onClick={handleCreatePost}
                    className="rounded-full px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold h-7 sm:h-8 text-[10px] sm:text-xs border-none"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="">
              <SocialFeed posts={filteredPosts} onDeletePost={handleDeletePost} emptyMessage="No signals found in this sector." />
            </div>
          </main>

          {/* Right Column: Search & Trending */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20 h-fit pl-4">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <SparklesIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-blue-500" />
              </div>
              <input 
                type="text"
                placeholder="Search JamSpace"
                className="w-full bg-muted/50 border-none rounded-full py-3 pl-12 pr-4 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* AI Curator Section */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-5 border border-blue-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CpuChipIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">Neural Discovery</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sonic Intelligence v4.0</p>
                </div>
              </div>

              {aiResult ? (
                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <img src={aiResult.playlist.coverUrl} className="h-14 w-14 rounded shadow-xl" alt="" />
                    <div className="min-w-0">
                      <p className="text-xs font-black italic uppercase truncate">{aiResult.playlist.title}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-2">{aiResult.explanation}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white h-9 text-[10px] font-bold uppercase tracking-widest border-none"
                    onClick={() => {
                      const tracks = (aiResult.playlist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                      playAll(tracks);
                    }}
                  >
                    Play Mix Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">Let Gemini analyze your neural footprint on-chain and synthesize a custom frequencies stream.</p>
                  <Button 
                    disabled={isGeneratingAI}
                    onClick={handleAIPlaylist}
                    className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white h-9 text-[10px] font-bold uppercase tracking-widest border-none"
                  >
                    {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <SparklesIcon className="h-3 w-3 mr-2" />}
                    Synthesize Mix
                  </Button>
                </div>
              )}
            </div>

            {/* Trending Section */}
            <div className="bg-muted/30 rounded-2xl overflow-hidden">
              <h3 className="text-xl font-bold p-4 text-zinc-800 dark:text-foreground">What's happening</h3>
              <div className="">
                {trendingTopics.map((topic) => (
                  <div key={topic.tag} className="p-4 hover:bg-foreground/5 cursor-pointer transition-all">
                    <p className="text-xs text-muted-foreground">Trending in Music</p>
                    <p className="text-base font-bold">{topic.tag}</p>
                    <p className="text-xs text-muted-foreground">{topic.count} posts</p>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-left text-blue-600 dark:text-blue-500 hover:bg-foreground/5 transition-all text-sm">
                Show more
              </button>
            </div>

            {/* Who to follow */}
            <div className="bg-muted/30 rounded-2xl overflow-hidden">
              <h3 className="text-xl font-bold p-4 text-zinc-800 dark:text-foreground">Who to follow</h3>
              <div className="">
                {artists.slice(0, 3).map(artist => (
                  <div key={artist.uid} className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artist.avatarUrl} />
                        <AvatarFallback>{artist.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{artist.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{ (artist.name || 'user').toLowerCase().replace(/\s+/g, '')}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-full bg-foreground text-background hover:bg-foreground/90 border-none px-4 py-1 h-8 text-xs font-bold">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-left text-blue-600 dark:text-blue-500 hover:bg-foreground/5 transition-all text-sm">
                Show more
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* JamRoom Chat Overlay */}
       <AnimatePresence>
         {activeJamRoom && <JamChat />}
       </AnimatePresence>
    </div>
  );
};

export default JamSpace;
