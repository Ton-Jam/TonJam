import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Rss, Flame, Zap, Users, Plus, Sparkles, Filter, LayoutGrid, List, Radio, Headphones, TrendingUp, ChevronRight } from 'lucide-react';
import { MOCK_POSTS, MOCK_ARTISTS, MOCK_USER, MOCK_TRACKS, APP_LOGO, TJ_COIN_ICON } from '@/constants';
import UserCard from '@/components/UserCard';
import TrackCard from '@/components/TrackCard';
import PostModal from '@/components/PostModal';
import SocialFeed from '@/components/SocialFeed';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import { useAudio } from '@/context/AudioContext';
import { Post, Track } from '@/types';

const JamSpace: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, followedUserIds, artists, posts, createPost, deletePost, activeJamRoom, joinJamRoom, leaveJamRoom, searchQuery: search, setSearchQuery: setSearch } = useAudio();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Following' | 'Trending'>('All');
  const [filterType, setFilterType] = useState<'All' | 'Tracks' | 'NFTs'>('All');
  const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const carouselItems: CarouselItem[] = [
    {
      id: '1',
      title: 'Genesis Mint Event',
      subtitle: 'Exclusive NFTs dropping from Neon Voyager',
      imageUrl: 'https://picsum.photos/1200/400?random=101',
      link: '/explore/nfts',
      cta: 'View Drop'
    },
    {
      id: '2',
      title: 'Neural Beats Live',
      subtitle: 'Join the global jam session in the Genesis Node',
      imageUrl: 'https://picsum.photos/1200/400?random=102',
      link: '/jamspace',
      cta: 'Join Room'
    },
    {
      id: '3',
      title: 'TON Ecosystem Growth',
      subtitle: 'Discover the future of decentralized music',
      imageUrl: 'https://picsum.photos/1200/400?random=103',
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
    } else if (activeTab === 'Trending') {
      basePosts = basePosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
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
    if (sortOrder === 'Oldest') {
      basePosts.reverse();
    }

    return basePosts;
  }, [posts, search, activeTab, followedUserIds, filterType, sortOrder]);

  // Auto-switch view mode based on filter type
  useEffect(() => {
    if (filterType === 'Tracks' || filterType === 'NFTs') {
      setViewMode('grid');
    } else {
      setViewMode('list');
    }
  }, [filterType]);

  const handleCreatePost = (content: string, mediaUrl?: string, trackId?: string) => {
    createPost({
      content,
      imageUrl: mediaUrl,
      trackId
    });
  };

  const handleDeletePost = (id: string) => {
    deletePost(id);
  };

  return (
    <div className="min-h-screen w-full bg-background pb-40 relative overflow-x-hidden">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Live Signal Ticker */}
      <div className="bg-background border-b border-blue-500/30 py-2 px-4 overflow-hidden whitespace-nowrap relative z-50">
        <div className="flex items-center gap-12 animate-marquee">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.4em]">Signal {i}: Genesis Minted by @NeonVoyager</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-[0.4em]">Relay {i}: 42.5 TON Transferred to @ByteBeat</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-0 sm:px-4 md:px-12 mt-6 relative z-10">
        <header className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-foreground uppercase tracking-widest">JamSpace</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-muted text-blue-500/70 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-foreground transition-all">
              <Bell className="h-5 w-5" />
            </button>
            <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-10 h-10 rounded-full border border-blue-500/30" />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Navigation & Trending */}
          <aside className="hidden lg:block lg:col-span-3 space-y-10 sticky top-32 h-fit">
            {/* Live Jam Rooms - Hardware Style */}
            <div className="bg-background border border-border rounded-[12px] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12"><Radio className="h-24 w-24" /></div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.5em]">Live Jam Rooms</h3>
                  <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">Active Audio Relays</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-[7px] font-bold text-orange-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                {[
                  { id: 'genesis', name: 'Genesis Node', listeners: 124, icon: Radio, freq: '44.1kHz' },
                  { id: 'drift', name: 'Cyber Drift', listeners: 89, icon: Headphones, freq: '48.0kHz' }
                ].map(room => (
                  <button 
                    key={room.id}
                    onClick={() => activeJamRoom?.id === room.id ? leaveJamRoom() : joinJamRoom(room.id)}
                    className={`w-full p-5 rounded-[8px] border transition-all text-left group relative overflow-hidden ${activeJamRoom?.id === room.id ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-500/20' : 'bg-foreground/[0.02] border-blue-500/30 hover:border-blue-500/50 hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={`w-12 h-12 rounded-[6px] flex items-center justify-center transition-all ${activeJamRoom?.id === room.id ? 'bg-muted/80 scale-105' : 'bg-muted/50 group-hover:bg-orange-500/20'}`}>
                        <room.icon className={`h-5 w-5 ${activeJamRoom?.id === room.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-orange-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-[11px] font-bold uppercase tracking-tight truncate ${activeJamRoom?.id === room.id ? 'text-foreground' : 'text-muted-foreground/90'}`}>{room.name}</p>
                          <span className={`text-[7px] font-mono ${activeJamRoom?.id === room.id ? 'text-muted-foreground/80' : 'text-muted-foreground/50'}`}>{room.freq}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex gap-0.5 ${activeJamRoom?.id === room.id ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>
                            {[1,2,3,4].map(i => <div key={i} className={`w-0.5 h-2 rounded-full bg-current ${activeJamRoom?.id === room.id ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 100}ms` }}></div>)}
                          </div>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${activeJamRoom?.id === room.id ? 'text-muted-foreground/80' : 'text-muted-foreground/50'}`}>{room.listeners} Listening</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-background border border-border rounded-[12px] p-8">
              <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em] mb-10">Navigation</h3>
              <nav className="space-y-3">
                {[
                  { id: 'All', label: 'Global Feed', icon: Rss },
                  { id: 'Following', label: 'Following', icon: Users },
                  { id: 'Trending', label: 'Trending', icon: Flame }
                ].map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-5 px-5 py-4 rounded-[10px] transition-all group ${activeTab === item.id ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : 'text-neutral-500 hover:text-neutral-400 hover:bg-muted/50 border border-transparent'}`} 
                  >
                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-blue-500' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-background border border-border rounded-[12px] p-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em]">Trending Ledger</h3>
                <TrendingUp className="h-3 w-3 text-muted-foreground/30" />
              </div>
              <div className="space-y-8">
                {trendingTopics.map((topic, idx) => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer" onClick={() => setSearch(topic.tag)}>
                    <div className="flex items-center gap-5">
                      <span className="text-[11px] font-mono text-blue-500/40 w-5 italic">0{idx + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-muted-foreground/90 group-hover:text-blue-400 transition-colors tracking-tight font-mono">{topic.tag}</p>
                        <p className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-1.5">{topic.count} Signals</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-foreground/5 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Column: Main Feed */}
          <main className="lg:col-span-6 space-y-10">
            {/* Auto Carousel at the top */}
            <AutoCarousel items={carouselItems} />

            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search live nodes and sessions..."
                className="w-full bg-muted/50 border border-blue-500/30 rounded-xl py-4 pl-12 pr-4 text-sm text-blue-600 dark:text-foreground placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/10 transition-all"
              />
            </div>

            {/* Sticky Filters */}
            <div className="sticky top-[var(--header-height,64px)] z-30 backdrop-blur-2xl py-4 w-full bg-background/40 px-4 transition-all duration-300">
              <div className="flex flex-col gap-4">
                {/* Tab Filters */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {['All', 'Following', 'Trending'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex-shrink-0 border ${ activeTab === tab ? 'bg-blue-500 text-white border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-border hover:text-blue-600 dark:hover:text-neutral-400 inactive-pill' }`} >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Type and Sort/View Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                    {['All', 'Tracks', 'NFTs'].map(type => (
                      <button 
                        key={type} 
                        onClick={() => setFilterType(type as any)}
                        className={`px-3 py-1.5 rounded-[8px] text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${filterType === type ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'bg-white dark:bg-transparent text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-transparent hover:text-blue-600 dark:hover:text-neutral-400 inactive-pill'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={() => setSortOrder(prev => prev === 'Newest' ? 'Oldest' : 'Newest')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-muted/50 hover:bg-muted border border-blue-500/30 hover:border-blue-500/50 transition-all group"
                    >
                      <span className="text-[9px] font-bold text-blue-500/80 dark:text-muted-foreground/80 uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-foreground">{sortOrder}</span>
                      <div className="flex flex-col -space-y-0.5">
                        <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] ${sortOrder === 'Oldest' ? 'border-b-blue-500' : 'border-b-blue-500/20 dark:border-b-white/20'}`}></div>
                        <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] ${sortOrder === 'Newest' ? 'border-t-blue-500' : 'border-t-blue-500/20 dark:border-t-white/20'}`}></div>
                      </div>
                    </button>

                    <div className="flex items-center bg-muted/50 rounded-[8px] p-0.5 border border-blue-500/30">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-[6px] transition-all ${viewMode === 'list' ? 'bg-blue-500/10 text-blue-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-400'}`}
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-[6px] transition-all ${viewMode === 'grid' ? 'bg-blue-500/10 text-blue-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-400'}`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="bg-transparent space-y-8">
              <SocialFeed posts={filteredPosts} onDeletePost={handleDeletePost} emptyMessage="No signals found in this sector." layout={viewMode} />
            </div>
          </main>

          {/* Right Column: Recommendations & Live */}
          <aside className="hidden lg:block lg:col-span-3 space-y-12 sticky top-32 h-fit">
            {/* Live Now Nodes */}
            <section className="bg-background border border-border rounded-[12px] p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-[0.5em]">Live Nodes</h3>
                  <span className="text-[7px] font-bold text-green-500 uppercase tracking-widest mt-1">Active Broadcasts</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {artists.slice(0, 8).map(artist => (
                  <div key={artist.id} className="relative group cursor-pointer flex-shrink-0 w-16" onClick={() => navigate(`/artist/${artist.id}`)} title={artist.name} >
                    <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full scale-0 group-hover:scale-125 transition-transform duration-500"></div>
                    <img src={artist.avatarUrl} className="w-full aspect-square rounded-full transition-all relative z-10 grayscale group-hover:grayscale-0 object-cover border border-blue-500/30 group-hover:border-blue-500/50" alt="" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full z-20 border-2 border-background"></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Nodes */}
            <section className="bg-background border border-border rounded-[12px] p-8">
              <h3 className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-[0.5em] mb-10">Recommended Nodes</h3>
              <div className="space-y-6">
                {artists.slice(0, 3).map(artist => (
                  <UserCard key={artist.id} user={artist} variant="compact" />
                ))}
              </div>
              <button onClick={() => navigate('/explore/artists?title=Recommended Nodes&filter=recommended')} className="w-full mt-10 py-4 text-[9px] font-bold uppercase text-blue-500 tracking-[0.2em] hover:text-blue-600 dark:hover:text-foreground hover:bg-blue-600/10 border border-blue-500/30 rounded-[8px] transition-all active:scale-95"> Discover More Nodes </button>
            </section>

            {/* AI Curated Frequencies */}
            <section className="bg-background border border-border rounded-[12px] p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-[0.5em]">AI Frequencies</h3>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500/20"></div>)}
                </div>
              </div>
              <div className="space-y-5">
                {aiRecommendedTracks.slice(0, 3).map(track => (
                  <TrackCard key={track.id} track={track} variant="row" />
                ))}
              </div>
              <button onClick={() => navigate('/explore/tracks?title=AI Frequencies&filter=recommended')} className="w-full mt-8 py-3 text-[8px] font-bold uppercase text-blue-500/50 dark:text-muted-foreground/50 tracking-widest hover:text-blue-600 dark:hover:text-foreground transition-colors"> View All </button>
            </section>
          </aside>
        </div>
      </div>

      {/* Mobile FAB */}
      <button onClick={() => setIsPostModalOpen(true)} className="lg:hidden fixed bottom-28 right-6 w-16 h-16 flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group bg-transparent" >
        <div className="absolute inset-0 bg-muted/40 blur-2xl rounded-full"></div>
        <div className="w-full h-full bg-muted rounded-[10px] flex items-center justify-center shadow-2xl shadow-muted/40 relative z-10 p-3">
          <img src={APP_LOGO} className="w-full h-full object-contain" alt="Add Post" />
        </div>
      </button>

      {/* Post Modal */}
      {isPostModalOpen && (
        <PostModal onClose={() => setIsPostModalOpen(false)} onSubmit={handleCreatePost} />
      )}
    </div>
  );
};

export default JamSpace;
