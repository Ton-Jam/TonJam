import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POSTS, MOCK_ARTISTS, MOCK_USER, MOCK_TRACKS, APP_LOGO } from '../constants';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import TrackCard from '../components/TrackCard';
import PostModal from '../components/PostModal';
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

  const handleCreatePost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      content,
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
    <div className="animate-in fade-in duration-1000 pb-40 relative min-h-screen bg-black">
      
      {/* Top Header - Solid black, naked bell icon */}
      <header className="px-4 md:px-12 py-1 flex items-center justify-between gap-6 border-b border-white/5 bg-black sticky top-0 z-40">
        <div className="relative flex-1 max-w-2xl group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/20 text-[10px] group-focus-within:text-blue-500 transition-colors"></i>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals..."
            className="w-full bg-white/5 border border-white/10 py-2 pl-12 pr-6 rounded-full text-[11px] outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10 text-white italic"
          />
        </div>

        <button 
          onClick={() => navigate('/notifications')}
          className="w-14 h-14 flex items-center justify-center text-white hover:text-blue-500 transition-all relative active:scale-90 bg-transparent"
        >
          <i className="fas fa-bell text-xl"></i>
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full border-2 border-black"></div>
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-10 space-y-16">
        
        {/* Recommended Nodes - Horizontal Scroll */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">Recommended Nodes</h3>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-4">
            {MOCK_ARTISTS.map(artist => (
              <div key={artist.id} className="flex-shrink-0 w-28 md:w-32">
                <UserCard user={artist} variant="portrait" />
              </div>
            ))}
          </div>
        </section>

        {/* AI Recommendations - Horizontal Scroll */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <i className="fas fa-sparkles text-blue-500 text-[10px]"></i>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">AI Curated Frequencies</h3>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4">
            {aiRecommendedTracks.map(track => (
              <div key={track.id} className="flex-shrink-0 w-44 md:w-52">
                <TrackCard track={track} />
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex gap-2.5 mb-6 overflow-x-auto no-scrollbar">
              {['All', 'Following', 'Trending', 'Alpha'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${
                    activeTab === tab 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab} Signals
                </button>
              ))}
            </div>
            
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} onDelete={() => handleDeletePost(post.id)} />
              ))}
            </div>
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <section className="glass p-8 rounded-[2rem] border-white/5 border">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 italic">Trending Ledger</h3>
              <div className="space-y-6">
                {trendingTopics.map(topic => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer" onClick={() => setSearch(topic.tag)}>
                    <div>
                      <p className="text-sm font-black text-white/60 group-hover:text-blue-400 transition-colors italic tracking-tight">{topic.tag}</p>
                      <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-1">{topic.count} Interactions</p>
                    </div>
                    <i className="fas fa-chevron-right text-[8px] text-white/5 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
                  </div>
                ))}
              </div>
            </section>

            <div className="p-8 bg-blue-600/5 rounded-[2rem] border border-blue-500/10">
               <p className="text-[10px] text-white/40 italic leading-relaxed">
                 Signals are synchronized with the <span className="text-blue-400 font-black">TON Blockchain</span>. High interaction frequencies earn <span className="text-blue-400 font-black">TJ Coin</span> rewards.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating TonJam FAB */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all group bg-transparent outline-none border-none"
      >
        <img 
          src={APP_LOGO} 
          className="w-16 h-16 md:w-20 md:h-20 object-contain group-hover:rotate-12 transition-transform drop-shadow-[0_10px_20px_rgba(37,99,235,0.4)]" 
          alt="New Post" 
        />
        <div className="absolute top-2 right-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-4 border-black shadow-xl">
          <i className="fas fa-plus text-white text-[10px]"></i>
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