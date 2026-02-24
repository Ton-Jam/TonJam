import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POSTS, MOCK_ARTISTS, MOCK_USER, MOCK_TRACKS, APP_LOGO } from '../constants';
import UserCard from '../components/UserCard';
import TrackCard from '../components/TrackCard';
import PostModal from '../components/PostModal';
import SocialFeed from '../components/SocialFeed';
import { useAudio } from '../context/AudioContext';
import { Post, Track } from '../types';

const JamSpace: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, followedUserIds } = useAudio();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [search, setSearch] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Following' | 'Trending' | 'Alpha'>('All');

  // Trending topic mocks
  const trendingTopics = [
    { tag: '#TONGenesis', count: '12.4k' },
    { tag: '#SynthSummer', count: '8.2k' },
    { tag: '#NeuralBeats', count: '5.1k' },
    { tag: '#MarketSpike', count: '3.9k' }
  ];

  // AI Recommendations mock
  const aiRecommendedTracks = useMemo(() => MOCK_TRACKS.slice(0, 5), []);

  const filteredPosts = useMemo(() => {
    let basePosts = [...posts];
    
    if (activeTab === 'Following') {
      basePosts = basePosts.filter(p => followedUserIds.includes(p.userId));
    } else if (activeTab === 'Trending') {
      basePosts = basePosts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    } else if (activeTab === 'Alpha') {
      basePosts = basePosts.filter(p => p.trackId); // Posts with tracks are "Alpha"
    }

    if (search) {
      basePosts = basePosts.filter(p => p.content.toLowerCase().includes(search.toLowerCase()) || p.userName.toLowerCase().includes(search.toLowerCase()));
    }

    return basePosts;
  }, [posts, search, activeTab, followedUserIds]);

  const handleCreatePost = (content: string, mediaUrl?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      content,
      imageUrl: mediaUrl,
      likes: 0,
      comments: 0,
      timestamp: 'Just now'
    };
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2a] to-black pb-40 relative overflow-x-hidden">
      
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Live Signal Ticker - Refined */}
      <div className="bg-blue-600/10 backdrop-blur-md py-1.5 px-4 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-50">
        <div className="flex items-center gap-12 animate-marquee">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.4em]">Signal {i}: Genesis Minted by @NeonVoyager</span>
              </div>
              <div className="w-1 h-1 bg-white/10 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-[0.4em]">Relay {i}: 42.5 TON Transferred to @ByteBeat</span>
              </div>
              <div className="w-1 h-1 bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Premium Header */}
      <header className="px-4 md:px-12 py-4 flex items-center justify-between gap-8 border-b border-white/5 bg-[#0a0a2a] sticky top-0 z-40">
        <div className="flex items-center gap-8 flex-1">
          <div className="relative flex-1 max-w-2xl group">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-[10px] group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Scan network for signals..."
              className="w-full bg-white/[0.08] border border-white/5 py-3 pl-12 pr-6 rounded-2xl text-[11px] outline-none focus:border-blue-500/30 transition-all placeholder:text-white/30 text-white font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/notifications')}
            className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-blue-500 transition-all relative active:scale-90 rounded-full hover:bg-white/5"
          >
            <i className="fas fa-bell text-lg"></i>
            <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-black"></div>
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Navigation & Trending (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-28 h-fit">
            <div className="glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-8">Navigation</h3>
              <nav className="space-y-2">
                {[
                  { id: 'feed', label: 'Global Feed', icon: 'fa-rss', active: true },
                  { id: 'trending', label: 'Trending', icon: 'fa-fire' },
                  { id: 'alpha', label: 'Alpha Signals', icon: 'fa-bolt' },
                  { id: 'nodes', label: 'Active Nodes', icon: 'fa-users' }
                ].map(item => (
                  <button 
                    key={item.id}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${item.active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  >
                    <i className={`fas ${item.icon} text-xs ${item.active ? 'text-blue-400' : 'text-white/20 group-hover:text-white'}`}></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-8">Trending Ledger</h3>
              <div className="space-y-6">
                {trendingTopics.map((topic, idx) => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer" onClick={() => setSearch(topic.tag)}>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-blue-500/40 w-4">0{idx + 1}</span>
                      <div>
                        <p className="text-xs font-black text-white/60 group-hover:text-blue-400 transition-colors tracking-tight font-mono">{topic.tag}</p>
                        <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">{topic.count} Signals</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[2rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
               <h4 className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Network Status</h4>
               <p className="text-[10px] text-white/40 leading-relaxed relative z-10">
                 Neural sync frequency is currently at <span className="text-blue-400 font-black">98.4%</span>. Broadcast high-fidelity signals to earn <span className="text-blue-400 font-black">TJ Coin</span>.
               </p>
            </div>
          </aside>

          {/* Center Column: Main Feed */}
          <main className="lg:col-span-6 space-y-8">
            
            {/* Immersive Hero / Quick Post */}
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#080808] p-10 shadow-2xl group/hero">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.6em]">Neural Relay Space</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none mb-8">
                  Broadcast your <br /> <span className="text-blue-500">Frequency</span>
                </h1>

                <div className="flex items-center gap-4 p-2 bg-white/[0.03] border border-white/5 rounded-2xl focus-within:border-blue-500/30 transition-all">
                  <img src={MOCK_USER.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="flex-1 text-left px-4 py-3 text-[11px] text-white/20 font-medium uppercase tracking-widest hover:text-white/40 transition-colors"
                  >
                    What's resonating today?
                  </button>
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
                  >
                    <i className="fas fa-plus text-xs"></i>
                  </button>
                </div>
              </div>
            </section>

            {/* Sticky Filters - Refined */}
            <div className="sticky top-[88px] z-30 bg-black/40 backdrop-blur-2xl py-3 border-y border-white/5 w-full">
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                {['All', 'Following', 'Trending', 'Alpha'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border flex-shrink-0 ${
                      activeTab === tab 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Feed */}
            <SocialFeed posts={filteredPosts} onDeletePost={handleDeletePost} emptyMessage="No signals found in this sector." />
          </main>

          {/* Right Column: Recommendations & Live (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-10 sticky top-28 h-fit">
            
            {/* Live Now Nodes */}
            <section className="glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Live Nodes</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {MOCK_ARTISTS.slice(0, 8).map(artist => (
                  <div 
                    key={artist.id} 
                    className="relative group cursor-pointer" 
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    title={artist.name}
                  >
                    <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full scale-0 group-hover:scale-110 transition-transform"></div>
                    <img src={artist.avatarUrl} className="w-full aspect-square rounded-full border border-white/10 group-hover:border-blue-500 transition-all relative z-10 grayscale group-hover:grayscale-0 object-cover" alt="" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black z-20"></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Nodes */}
            <section className="glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-8">Recommended Nodes</h3>
              <div className="space-y-4">
                {MOCK_ARTISTS.slice(0, 3).map(artist => (
                  <UserCard key={artist.id} user={artist} variant="compact" />
                ))}
              </div>
              <button className="w-full mt-6 py-3 text-[8px] font-black uppercase text-blue-500 tracking-widest hover:text-white transition-colors">
                Discover More Nodes
              </button>
            </section>

            {/* AI Curated Frequencies */}
            <section className="glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-8">
                <i className="fas fa-sparkles text-blue-500 text-[10px]"></i>
                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">AI Frequencies</h3>
              </div>
              <div className="space-y-3">
                {aiRecommendedTracks.slice(0, 3).map(track => (
                  <TrackCard key={track.id} track={track} variant="row" />
                ))}
              </div>
            </section>

          </aside>
        </div>
      </div>

      {/* Mobile FAB - Refined */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        className="lg:hidden fixed bottom-28 right-6 w-16 h-16 flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group bg-transparent"
      >
        <div className="absolute inset-0 bg-blue-600/40 blur-2xl rounded-full"></div>
        <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40 relative z-10 border border-white/20 p-4">
          <img src={APP_LOGO} className="w-full h-full object-contain brightness-0 invert" alt="Add Post" />
        </div>
      </button>

      {/* Post Modal */}
      {isPostModalOpen && (
        <PostModal 
          onClose={() => setIsPostModalOpen(false)} 
          onSubmit={handleCreatePost} 
        />
      )}
    </div>
  );
};

export default JamSpace;