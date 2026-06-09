import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Volume2, 
  Rss, 
  Flame, 
  Users, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  Home,
  Hash,
  Bell,
  Mail,
  Bookmark,
  User,
  Image as ImageIcon,
  Gift,
  List,
  Smile,
  Calendar,
  MapPin,
  Plus,
  Cpu,
  Search,
  MessageSquare,
  Zap,
  MoreHorizontal,
  Share2,
  Trash2,
  History,
  Disc,
  Play,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MOCK_POSTS, MOCK_ARTISTS, MOCK_USER, MOCK_TRACKS } from '@/constants';
import SocialFeed from '@/components/SocialFeed';
import AutoCarousel, { CarouselItem } from '@/components/AutoCarousel';
import JamChat from '@/components/JamChat';
import { useAudio } from '@/context/AudioContext';
import { getPlaceholderImage, cn } from '@/lib/utils';
import { Track } from '@/types';
import { generateAIPlaylist, GenerateAIPlaylistResult } from '@/services/aiPlaylistService';
import { Loader2 } from 'lucide-react';
import GlassAiCompose from '@/components/aicanvas/glass-ai-compose';

const JamSpace: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addNotification, 
    followedUserIds, 
    likedTrackIds,
    recentlyPlayed,
    artists, 
    posts, 
    createPost, 
    deletePost, 
    activeJamRoom, 
    joinJamRoom, 
    leaveJamRoom, 
    searchQuery: search, 
    jamspaceFilters, 
    userProfile, 
    playAll, 
    allTracks 
  } = useAudio();
  
  const [activeTab, setActiveTab] = useState('for-you');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<GenerateAIPlaylistResult | null>(null);
  const [isAiComposeOpen, setIsAiComposeOpen] = useState(false);

  const handleAiSubmit = (content: string, model: string, images: string[], webSearch: boolean) => {
    createPost({
      content: content,
      userId: userProfile.uid,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      timestamp: new Date().toISOString(),
      likes: 0,
      reposts: 0,
      comments: 0,
      isVerified: true
    });
    addNotification(`Broadcast synthesized from neural node using ${model}`, 'success');
  };

  const handleAIPlaylist = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAIPlaylist({
        likedTracks: likedTrackIds,
        recentlyPlayed: recentlyPlayed,
        followedArtistIds: followedUserIds
      });
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
    }
  ];

  const trendingTopics = [
    { tag: '#TONGenesis', count: '12.4k' },
    { tag: '#SynthSummer', count: '8.2k' },
    { tag: '#NeuralBeats', count: '5.1k' },
    { tag: '#MarketSpike', count: '3.9k' }
  ];

  const filteredPosts = useMemo(() => {
    let basePosts = [...posts];

    if (activeTab === 'following') {
      basePosts = basePosts.filter(p => followedUserIds.includes(p.userId));
    }

    if (filterType === 'Tracks') {
      basePosts = basePosts.filter(p => p.trackId);
    } else if (filterType === 'NFTs') {
      basePosts = basePosts.filter(p => {
        if (!p.trackId) return false;
        const track = MOCK_TRACKS.find(t => t.id === p.trackId);
        return track?.isNFT;
      });
    }

    if (search) {
      basePosts = basePosts.filter(p => 
        (p.content || '').toLowerCase().includes(search.toLowerCase()) || 
        (p.userName || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (jamspaceFilters.sortOrder === 'Oldest') {
      basePosts.reverse();
    }

    return basePosts;
  }, [posts, search, activeTab, followedUserIds, filterType, jamspaceFilters.sortOrder]);

  const handleDeletePost = (id: string) => {
    deletePost(id);
  };

  return (
    <div className="min-h-screen w-full bg-background pb-20 lg:pb-4 relative overflow-x-hidden">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/[0.03] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/[0.03] blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          
          {/* Left Column: Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 h-[calc(100vh-100px)]">
            <ScrollArea className="h-full pr-4">
              <div className="flex flex-col gap-1">
                {[
                  { id: 'home', label: 'Dashboard', icon: Home, path: '/' },
                  { id: 'explore', label: 'Explore Signals', icon: Hash, path: '/discover' },
                  { id: 'notifications', label: 'Logs', icon: Bell, path: '/notifications' },
                  { id: 'library', label: 'Library', icon: Bookmark, path: '/library' },
                  { id: 'genesis', label: 'Genesis Forge', icon: Sparkles, path: '/genesis-forge' },
                  { id: 'profile', label: 'Neural Profile', icon: User, path: '/profile' },
                ].map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className="justify-start h-14 rounded-full px-6 gap-5 group hover:bg-white/[0.05]"
                  >
                    <item.icon className="h-6 w-6 text-foreground group-hover:text-blue-500 transition-colors" strokeWidth={2.5} />
                    <span className="text-lg font-black uppercase tracking-tighter">{item.label}</span>
                  </Button>
                ))}
                
                <Button 
                  onClick={() => setIsAiComposeOpen(true)}
                  className="mt-6 w-full rounded-full py-7 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Post Signal
                </Button>
              </div>

              {/* Live Status */}
              <Card className="mt-8 bg-zinc-900/40 border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-sm">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">Live Nodes</CardTitle>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-1">
                    {[
                      { id: 'genesis', name: 'Genesis Node', listeners: 124, icon: Radio },
                      { id: 'drift', name: 'Cyber Drift', listeners: 89, icon: Volume2 }
                    ].map(room => (
                      <Button
                        key={room.id}
                        variant="ghost"
                        onClick={() => activeJamRoom?.id === room.id ? leaveJamRoom() : joinJamRoom(room.id)}
                        className={cn(
                          "w-full justify-start h-14 rounded-2xl gap-3 px-3",
                          activeJamRoom?.id === room.id ? "bg-blue-600/10 text-blue-400" : "hover:bg-white/[0.03]"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          activeJamRoom?.id === room.id ? "bg-blue-600 text-white" : "bg-white/[0.05]"
                        )}>
                          <room.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight truncate">{room.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{room.listeners} Active</p>
                        </div>
                        {activeJamRoom?.id === room.id && <Zap className="h-3 w-3 fill-current text-blue-500" />}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </aside>

          {/* Center Column: Main Content */}
          <main className="lg:col-span-6 border-x border-white/[0.05] min-h-screen">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/[0.05]">
              <Tabs defaultValue="for-you" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-14 bg-transparent p-0 rounded-none">
                  <TabsTrigger 
                    value="for-you" 
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-xs font-black uppercase tracking-widest transition-all"
                  >
                    For You
                  </TabsTrigger>
                  <TabsTrigger 
                    value="following" 
                    className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Following
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Composer */}
            <div className="m-4 p-4 flex gap-4 bg-black border border-white/10 rounded-2xl shadow-md">
              <Avatar className="h-10 w-10 border border-blue-500/20 ring-2 ring-blue-500/10">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea 
                  placeholder="Broadcast your frequency..." 
                  className="border-none bg-transparent text-sm text-white resize-none min-h-[60px] focus-visible:ring-0 p-0 placeholder:text-zinc-500 font-bold tracking-tight"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[
                      { icon: ImageIcon, color: 'text-blue-400 hover:bg-white/5' },
                      { icon: Gift, color: 'text-rose-400 hover:bg-white/5' },
                      { icon: List, color: 'text-amber-400 hover:bg-white/5' },
                      { icon: Smile, color: 'text-yellow-400 hover:bg-white/5' },
                      { icon: Calendar, color: 'text-emerald-400 hover:bg-white/5' },
                    ].map((tool, i) => (
                      <Button key={i} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", tool.color)}>
                        <tool.icon className={cn("h-4 w-4", tool.color)} />
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsAiComposeOpen(true)}
                      variant="outline"
                      className="rounded-lg px-3 bg-zinc-900 hover:bg-purple-600/10 text-purple-400 hover:text-purple-300 font-black uppercase tracking-widest h-7 text-[9px] border border-purple-500/20 transition-all duration-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Neural AI
                    </Button>
                    <Button 
                      disabled={!postContent.trim() || isPosting}
                      onClick={handleCreatePost}
                      className="rounded-lg px-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-7 text-[9px] border-none shadow-lg shadow-blue-600/15 transition-all duration-200 cursor-pointer"
                    >
                      {isPosting ? 'Broadcasting...' : 'Signal'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Filters - Sticky & Atmospheric matching Marketplace */}
            <div className="sticky top-14 z-[37] bg-background/80 backdrop-blur-md py-4 w-full mb-4 border-b border-white/[0.05]">
              <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
                <div className="overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12">
                  <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap gap-2 justify-start">
                    {[
                      { name: 'All', icon: Sparkles },
                      { name: 'Tracks', icon: Disc },
                      { name: 'NFTs', icon: Zap },
                      { name: 'Trending', icon: Flame }
                    ].map((filter) => {
                      const Icon = filter.icon;
                      const isActive = filterType === filter.name;
                      return (
                        <TabsTrigger
                          key={filter.name}
                          value={filter.name}
                          className={cn(
                            "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer h-auto flex items-center gap-1.5",
                            isActive 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                              : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {filter.name}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Main Feed */}
            <SocialFeed 
              posts={filteredPosts} 
              onDeletePost={handleDeletePost} 
              emptyMessage="Static silence... no signals identified in this sector." 
            />
          </main>

          {/* Right Column: Intelligence & Trending */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 pt-4 sticky top-20 h-[calc(100vh-100px)]">
            <ScrollArea className="h-full pr-1">
              <div className="space-y-6">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Scan JamSpace"
                    className="w-full bg-zinc-900/50 border border-white/5 hover:border-white/10 rounded-2xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-blue-500/30 transition-all outline-none text-sm placeholder:text-zinc-600"
                  />
                </div>

                {/* AI Curator - Neural Discovery */}
                <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20 rounded-[4px] overflow-hidden group/ai relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 group-hover/ai:scale-150 transition-all duration-700" />
                  <CardHeader className="p-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600/20 rounded-xl">
                        <Cpu className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tighter">Neural Pulse</CardTitle>
                        <CardDescription className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] mt-1">SI-v4 Engine</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    {aiResult ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex gap-4 items-center bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                          <img src={aiResult.playlist.coverUrl} className="h-12 w-12 rounded-lg shadow-2xl" alt="" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase truncate text-blue-400">{aiResult.playlist.title}</p>
                            <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{aiResult.explanation}</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white h-10 text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-blue-600/20"
                          onClick={() => {
                            const tracks = (aiResult.playlist.trackIds || []).map(id => allTracks.find(t => t.id === id)).filter(Boolean) as Track[];
                            playAll(tracks);
                          }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 mr-2" />
                          Execute Frequency
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Gemini is ready to synthesize a frequencies stream based on your neural footprint.</p>
                        <Button 
                          disabled={isGeneratingAI}
                          onClick={handleAIPlaylist}
                          className="w-full rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white h-10 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all font-black uppercase tracking-tighter"
                        >
                          {isGeneratingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                          Synthesize Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trending */}
                <Card className="bg-zinc-900/40 border-white/[0.05] rounded-[4px] overflow-hidden">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Hyper-Trending</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/[0.03]">
                      {trendingTopics.map((topic) => (
                        <div key={topic.tag} className="p-4 px-5 hover:bg-white/[0.03] cursor-pointer transition-all group">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Global Sector</p>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm font-black uppercase tracking-tight mt-1">{topic.tag}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-0.5 opacity-60">{topic.count} Signals Broadcaster</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full h-12 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:bg-white/[0.03] rounded-none border-t border-white/[0.03]">
                      Expand Sector
                    </Button>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-zinc-900/40 border-white/[0.05] rounded-[4px] overflow-hidden">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Echo Recs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {artists.slice(0, 3).map(artist => (
                      <div key={artist.uid} className="flex items-center justify-between p-2 pl-3 rounded-2xl hover:bg-white/[0.03] transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 border border-white/5">
                            <AvatarImage src={artist.avatarUrl} />
                            <AvatarFallback className="bg-zinc-800">{artist.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight truncate">{artist.name}</p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 truncate">@{ (artist.name || 'user').toLowerCase().replace(/\s+/g, '')}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-full bg-white text-black hover:bg-blue-600 hover:text-white border-none px-4 h-7 text-[9px] font-black uppercase tracking-widest shrink-0 transition-all">
                          Sync
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 hover:bg-white/[0.03] rounded-none mt-2">
                      View More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>

      {/* JamRoom Chat Overlay */}
       <AnimatePresence>
         {activeJamRoom && <JamChat />}
       </AnimatePresence>

      {/* Glass AI Compose Modal Overlay */}
      <AnimatePresence>
        {isAiComposeOpen && (
          <GlassAiCompose 
            isOpen={isAiComposeOpen}
            onClose={() => setIsAiComposeOpen(false)}
            onSubmit={handleAiSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JamSpace;

