import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  Plus, 
  Globe, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';

// Import our custom JamSpace modules
import { useJamSpaceData } from './hooks/useJamSpaceData';
import { CommunityHero } from './sections/CommunityHero';
import { QuickActions } from './sections/QuickActions';
import { CategoryChips } from './sections/CategoryChips';
import { LiveSpaces } from './sections/LiveSpaces';
import { TrendingDiscussions } from './sections/TrendingDiscussions';
import { FeaturedPosts } from './sections/FeaturedPosts';
import { FanFeed } from './sections/FanFeed';
import { ArtistPosts } from './sections/ArtistPosts';
import { NFTCommunity } from './sections/NFTCommunity';
import { MusicNews } from './sections/MusicNews';
import { UpcomingEvents } from './sections/UpcomingEvents';
import { SuggestedCommunities } from './sections/SuggestedCommunities';
import { Leaderboard } from './sections/Leaderboard';

// Import our shared components
import { CreatePostModal } from './components/CreatePostModal';
import { NotificationsPanel } from './components/NotificationsPanel';
import { PostCard } from './components/PostCard';
import { JamSpaceHeader } from './components/JamSpaceHeader';
import { JamSpaceQuickCompose } from './components/JamSpaceQuickCompose';
import { 
  HeroSkeleton, 
  LiveSpacesSkeleton, 
  FeedSkeleton, 
  LeaderboardSkeleton 
} from './components/Skeletons';

const JamSpaceMain: React.FC = () => {
  const { userProfile } = useAuth();
  const { addNotification } = useAudio();
  const [isOnline, setIsOnline] = useState(true);

  // Core state from custom hook
  const jamData = useJamSpaceData(userProfile || undefined);

  // Modal & Drawer triggers
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  const categories = [
    'All', 'Following', 'Artists', 'Fans', 'Spaces', 'NFTs', 
    'Afrobeats', 'Hip-Hop', 'Amapiano', 'Pop', 'Rock', 'Electronic'
  ];

  const handleCreatePostSubmit = (content: string, attachments?: any[], pollOptions?: string[]) => {
    jamData.handleCreatePost(content, attachments, pollOptions);
    addNotification('Post shared with the community!', 'success');
  };

  const toggleConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      addNotification('Signal restored. Reconnected to TonJam nodes.', 'success');
    } else {
      addNotification('Offline mode. Browsing local cached transmissions.', 'warning');
    }
  };

  return (
    <div className={`w-full min-h-screen ${jamData.isDarkMode ? 'bg-blue-950' : 'bg-slate-50'} text-white pb-24 font-sans`}>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-8 relative">
        {/* Top Header Controls (Integrated Ribbon functions) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {isOnline ? 'Network Synchronized' : 'Offline Mode'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => jamData.setIsDarkMode(!jamData.isDarkMode)}
              className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {jamData.isDarkMode ? <Sparkles className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button 
              onClick={toggleConnection}
              className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={isOnline ? "Go Offline" : "Go Online"}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Skeletons vs Normal view loading toggle */}
        {jamData.isLoading ? (
          <div className="space-y-8">
            <HeroSkeleton />
            <div className="h-20 bg-slate-900 border border-white/[0.03] rounded-[10px] animate-pulse" />
            <LiveSpacesSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <FeedSkeleton />
              </div>
              <div className="lg:col-span-4">
                <LeaderboardSkeleton />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. COMMUNITY HERO */}
            <CommunityHero 
              user={jamData.user}
              activeMembers={2450}
              liveSpacesCount={jamData.spaces.filter(s => s.isLive).length}
              trendingHashtag="#TONGenesis"
            />

            {/* 2. QUICK ACTIONS */}
            <QuickActions 
              onStartPost={() => setIsComposeOpen(true)}
              onCreateSpace={() => {
                jamData.handleCreateSpace(
                  'Community Soundstage #' + Math.floor(Math.random() * 900 + 100),
                  'An impromptu listening session Hosted by Direct Creator'
                );
                addNotification('Live voice room established!', 'success');
              }}
              onJoinSpace={() => {
                const live = jamData.spaces.find(s => s.isLive);
                if (live) jamData.handleJoinSpace(live.id);
              }}
              onCreateCommunity={() => addNotification('Lounge created. Invite friends to populate!', 'success')}
              onDiscoverArtists={() => addNotification('Searching verified artists node...', 'info')}
              onInviteFriends={() => addNotification('Referral code copied to clipboard!', 'success')}
            />

            {/* Offline Mode Banner */}
            {!isOnline && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/15 border border-red-500/20 text-red-400 p-4 rounded-[10px] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Currently navigating offline cached transmissions. New posts won't sync until online state is toggled.</span>
                </div>
                <button 
                  onClick={() => setIsOnline(true)}
                  className="px-3 py-1 bg-red-500/20 text-red-300 font-bold uppercase rounded-[10px] hover:bg-red-500/30 cursor-pointer"
                >
                  Connect
                </button>
              </motion.div>
            )}

            {/* 3. FILTER CHIPS & SEARCH CONTROLLER */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <JamSpaceHeader 
                  searchQuery={jamData.searchQuery}
                  setSearchQuery={jamData.setSearchQuery}
                  onJoinCommunity={jamData.handleToggleCommunity}
                  joinedCommunityIds={jamData.communities.filter(c => c.joined).map(c => c.id)}
                  activeCategory={jamData.activeCategory}
                  setActiveCategory={jamData.setActiveCategory}
                />

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => jamData.setShowNotifications(true)}
                    className="relative p-3 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-[#0052FF] transition-colors cursor-pointer rounded-[10px]"
                  >
                    <Bell className="w-4 h-4" />
                    {jamData.notifications.some(n => !n.read) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Horizontally Scrolling Category Chips */}
              <CategoryChips 
                categories={categories}
                activeCategory={jamData.activeCategory}
                onSelectCategory={jamData.setActiveCategory}
              />
            </div>

            {/* MAIN CONTENT BLOCK - TWO COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT MAIN GRID STREAM (Col span 8) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 4. QUICK COMPOSE */}
                <JamSpaceQuickCompose onSubmit={handleCreatePostSubmit} />

                {/* 5. LIVE SPACES */}
                <LiveSpaces 
                  spaces={jamData.spaces}
                  activeSpace={jamData.activeSpace}
                  onJoinSpace={jamData.handleJoinSpace}
                />

                {/* 5. TRENDING DISCUSSIONS */}
                <TrendingDiscussions />

                {/* Dynamic Posts Stream with custom empty states */}
                <div className="space-y-6">
                  {jamData.posts.length === 0 ? (
                    <div className="bg-slate-900 border border-white/[0.03] rounded-[10px] p-12 text-center text-slate-500">
                      <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">No matching signals</h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                        The spectrum in this filter looks quiet. Clear your search parameters or start a new broadcast.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Pinned/Featured posts (Large cards) */}
                      {jamData.activeCategory === 'All' && (
                        <FeaturedPosts 
                          posts={jamData.posts}
                          currentUserId={jamData.user.id}
                          onLike={jamData.handleLikePost}
                          onRepost={jamData.handleRepostPost}
                          onBookmark={jamData.handleBookmarkPost}
                          onVote={jamData.handleVotePoll}
                        />
                      )}

                      {/* Chronological Fan Feed (When filtered or in normal feed) */}
                      {(jamData.activeCategory === 'All' || jamData.activeCategory === 'Fans') && (
                        <FanFeed 
                          posts={jamData.posts}
                          currentUserId={jamData.user.id}
                          onLike={jamData.handleLikePost}
                          onRepost={jamData.handleRepostPost}
                          onBookmark={jamData.handleBookmarkPost}
                          onVote={jamData.handleVotePoll}
                        />
                      )}

                      {/* Verified Creator announcements (Artist Posts) */}
                      {(jamData.activeCategory === 'All' || jamData.activeCategory === 'Artists' || jamData.activeCategory === 'Following') && (
                        <ArtistPosts 
                          posts={jamData.posts}
                          currentUserId={jamData.user.id}
                          onLike={jamData.handleLikePost}
                          onRepost={jamData.handleRepostPost}
                          onBookmark={jamData.handleBookmarkPost}
                          onVote={jamData.handleVotePoll}
                        />
                      )}

                      {/* Standard Post Card Rendering for specific category streams (e.g. Genre feeds) */}
                      {jamData.activeCategory !== 'All' && jamData.activeCategory !== 'Artists' && jamData.activeCategory !== 'Fans' && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                            #{jamData.activeCategory} Transmission Stream
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            {jamData.posts.map((post) => (
                              <PostCard 
                                key={post.id}
                                post={post}
                                currentUserId={jamData.user.id}
                                onLike={jamData.handleLikePost}
                                onRepost={jamData.handleRepostPost}
                                onBookmark={jamData.handleBookmarkPost}
                                onVote={jamData.handleVotePoll}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 9. NFT COMMUNITY */}
                <NFTCommunity />

                {/* 10. MUSIC NEWS */}
                <MusicNews />

              </div>

              {/* RIGHT SIDEBAR COLUMN (Col span 4) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* 11. UPCOMING EVENTS */}
                <UpcomingEvents 
                  events={jamData.events}
                  onToggleEvent={jamData.handleToggleEvent}
                />

                {/* 12. SUGGESTED COMMUNITIES */}
                <SuggestedCommunities 
                  communities={jamData.communities}
                  onToggleCommunity={jamData.handleToggleCommunity}
                />

                {/* 13. LEADERBOARD */}
                <Leaderboard />

              </div>
            </div>

            {/* 14. BOTTOM SPACER / FOOTER */}
            <div className="pt-8 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              <span>TonJam Music Client • JamSpace Hub Center</span>
              <span className="flex items-center gap-1">
                <span>Node Sync • SECURE ledgers</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>v2.1.0 • Android Target SDK 34</span>
            </div>

          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON (FAB) FOR COMPOSING */}
      <motion.button
        id="floating-create-post-btn"
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-6 right-6 px-5 py-3.5 bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-[#0052FF] text-white rounded-full shadow-[0_8px_30px_rgb(0,82,255,0.4)] hover:shadow-[0_8px_35px_rgb(0,82,255,0.6)] z-40 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-wider border-none"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4 stroke-[3px]" />
        <span>Create Post</span>
      </motion.button>

      {/* CREATE POST MODAL OVERLAY */}
      <AnimatePresence>
        {isComposeOpen && (
          <CreatePostModal 
            isOpen={isComposeOpen}
            onClose={() => setIsComposeOpen(false)}
            onSubmit={handleCreatePostSubmit}
          />
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS DRAWERS */}
      <AnimatePresence>
        {jamData.showNotifications && (
          <NotificationsPanel 
            isOpen={jamData.showNotifications}
            onClose={() => jamData.setShowNotifications(false)}
            notifications={jamData.notifications}
            onMarkRead={jamData.handleMarkNotificationRead}
            onMarkAllRead={jamData.handleMarkAllNotificationsRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JamSpaceMain;
