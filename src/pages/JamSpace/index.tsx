import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Radio,
  TrendingUp,
  Users,
  Loader2,
  ArrowRight,
  ArrowUp,
  X,
  Search,
  UserPlus,
  UserCheck,
  Headphones
} from 'lucide-react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useJamSpaceFeed } from '@/hooks/useJamSpaceFeed';
import { usePostActions } from '@/hooks/usePostActions';
import { JamFeedHeader, FeedContentFilter } from '@/components/jamspace/JamFeedHeader';
import { JamComposer } from '@/components/jamspace/JamComposer';
import { JamPostCard } from '@/components/jamspace/JamPostCard';
import { CreateJamSpaceModal } from './components/CreateJamSpaceModal';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FeedSkeleton } from './components/Skeletons';
import { SocialPost } from '@/types/social';
import { Space, User } from './types';
import { createSpaceInFirestore } from '@/services/spaceService';
import { jamSpaceService } from '@/services/jamSpaceService';
import { getPlaceholderImage } from '@/lib/utils';
import VerifiedBadge from '@/components/VerifiedBadge';

export const JamSpaceMain: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const { addNotification, artists = [], followedUserIds = [] } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<FeedContentFilter>('all');
  const [activeQuotePost, setActiveQuotePost] = useState<SocialPost | null>(null);
  const [activeReplyPost, setActiveReplyPost] = useState<SocialPost | null>(null);
  const [isMobileComposeOpen, setIsMobileComposeOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [liveSpaces, setLiveSpaces] = useState<Space[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  const [localFollowedIds, setLocalFollowedIds] = useState<Record<string, boolean>>({});
  const [followPendingIds, setFollowPendingIds] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Core feed hook
  const {
    activeTab,
    setActiveTab,
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    hasNewPosts,
    error,
    refreshFeed,
    loadMore,
    prependPost,
    incrementReplyCount,
    removePostFromFeed,
    updatePostInFeed
  } = useJamSpaceFeed('for-you');

  // Core actions hook
  const {
    handleToggleLike,
    handleToggleRepost,
    handleToggleBookmark,
    handleShare,
    handleDelete,
    handleReport,
    currentUserAuthor
  } = usePostActions(updatePostInFeed);

  // Track scroll position for floating Back to Top button
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Subscribe to real-time live audio spaces from Firestore 'liveStreams'
  useEffect(() => {
    setIsLoadingSpaces(true);
    const streamsQuery = query(
      collection(db, 'liveStreams'),
      orderBy('createdAt', 'desc'),
      limit(12)
    );

    const unsubscribe = onSnapshot(
      streamsQuery,
      (snapshot) => {
        const rooms: Space[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data() as any;
            const isLive = d.isLive === true || d.status === 'live';
            return {
              id: docSnap.id,
              title: d.title || d.name || 'Live Audio Space',
              name: d.name || d.title || 'Live Audio Space',
              description: d.description || '',
              ownerId: d.ownerId || d.artistId || '',
              listenerCount: Number(d.listenerCount ?? d.viewersCount ?? d.viewerCount ?? 0),
              speakerAvatars: Array.isArray(d.speakerAvatars)
                ? d.speakerAvatars
                : d.artistAvatar
                  ? [d.artistAvatar]
                  : [],
              speakers: Array.isArray(d.speakers) ? d.speakers : [],
              isLive,
              visibility: d.visibility || 'public',
              coverUrl: d.coverUrl || d.thumbnailUrl || '',
              host: {
                id: d.host?.id || d.ownerId || d.artistId || 'host',
                name: d.host?.name || d.artistName || 'TonJam Host',
                username: d.host?.username || d.artistHandle || '@host',
                avatar: d.host?.avatar || d.artistAvatar || getPlaceholderImage('artist'),
                isVerified: Boolean(d.host?.isVerified ?? d.artistVerified),
                contributionPoints: 0,
                badges: [],
                role: (d.host?.role || 'artist') as User['role']
              }
            };
          })
          .filter((room) => room.visibility !== 'private' && room.isLive);

        setLiveSpaces(rooms.slice(0, 5));
        setIsLoadingSpaces(false);
      },
      () => {
        setIsLoadingSpaces(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Combined search + content-type filter
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return posts.filter((p) => {
      if (contentFilter === 'tracks') {
        if (!p.attachments?.some((a) => a.type === 'track')) return false;
      } else if (contentFilter === 'nfts') {
        if (!p.attachments?.some((a) => a.type === 'nft')) return false;
      } else if (contentFilter === 'media') {
        if (!p.attachments?.some((a) => a.type === 'image' || a.type === 'video')) return false;
      } else if (contentFilter === 'quotes') {
        if (!p.quotePost) return false;
      }

      if (!q) return true;
      return (
        p.text.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery, contentFilter]);

  const isFiltered = searchQuery.trim().length > 0 || contentFilter !== 'all';

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setContentFilter('all');
  }, []);

  const handlePostCreated = useCallback(
    (newPost: SocialPost) => {
      if (newPost.replyToPostId) {
        incrementReplyCount(newPost.replyToPostId);
      } else {
        prependPost(newPost);
      }
      setActiveQuotePost(null);
      setActiveReplyPost(null);
      setIsMobileComposeOpen(false);
    },
    [incrementReplyCount, prependPost]
  );

  const handleInitiateQuote = useCallback((post: SocialPost) => {
    setActiveQuotePost(post);
    setActiveReplyPost(null);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileComposeOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleInitiateReply = useCallback((post: SocialPost) => {
    setActiveReplyPost(post);
    setActiveQuotePost(null);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileComposeOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleDeleteAndSync = useCallback(
    async (postId: string, authorId: string) => {
      await handleDelete(postId, authorId);
      removePostFromFeed(postId);
    },
    [handleDelete, removePostFromFeed]
  );

  const handleOpenCreateSpace = useCallback(() => {
    if (!user) {
      addNotification('Please sign in to host a live JamSpace room', 'info');
      return;
    }
    setIsCreateSpaceOpen(true);
  }, [user, addNotification]);

  const handleCreateSpaceSubmit = useCallback(
    async (data: {
      name: string;
      description: string;
      visibility: 'public' | 'private';
      coverUrl?: string;
    }) => {
      if (!user) {
        addNotification('Please sign in to host a live JamSpace room', 'info');
        return;
      }

      const hostUser: User = {
        id: user.uid,
        name: userProfile?.name || user.displayName || 'TonJam Creator',
        username: userProfile?.username || '@creator',
        avatar: userProfile?.avatar || user.photoURL || getPlaceholderImage('artist'),
        isVerified: Boolean(userProfile?.verified || userProfile?.isVerifiedArtist),
        contributionPoints: 0,
        badges: [],
        role: (userProfile?.role as User['role']) || 'artist'
      };

      const created = await createSpaceInFirestore({
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        coverUrl: data.coverUrl,
        ownerId: user.uid,
        host: hostUser
      });

      if (created?.id) {
        addNotification(`Live room "${data.name}" is now on air!`, 'success');
        navigate(`/space/${created.id}`);
      } else {
        throw new Error('Could not launch JamSpace room');
      }
    },
    [user, userProfile, addNotification, navigate]
  );

  const handleQuickFollowCreator = useCallback(
    async (e: React.MouseEvent, targetUid: string, targetName: string) => {
      e.stopPropagation();
      if (!user) {
        addNotification('Please connect your account to follow creators', 'info');
        return;
      }
      if (targetUid === user.uid || followPendingIds[targetUid]) return;

      const currentlyFollowing =
        localFollowedIds[targetUid] !== undefined
          ? localFollowedIds[targetUid]
          : followedUserIds.includes(targetUid);

      setFollowPendingIds((prev) => ({ ...prev, [targetUid]: true }));
      setLocalFollowedIds((prev) => ({ ...prev, [targetUid]: !currentlyFollowing }));

      try {
        const res = await jamSpaceService.toggleFollow(currentUserAuthor, targetUid);
        setLocalFollowedIds((prev) => ({ ...prev, [targetUid]: res.isFollowing }));
        addNotification(
          res.isFollowing ? `Following ${targetName}` : `Unfollowed ${targetName}`,
          'success'
        );
      } catch {
        setLocalFollowedIds((prev) => ({ ...prev, [targetUid]: currentlyFollowing }));
        addNotification('Unable to update follow status', 'error');
      } finally {
        setFollowPendingIds((prev) => ({ ...prev, [targetUid]: false }));
      }
    },
    [user, followPendingIds, localFollowedIds, followedUserIds, currentUserAuthor, addNotification]
  );

  // Trending hashtags derived from live feed
  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => {
      const matches = String(p.text || '').match(/#[a-zA-Z0-9_]+/g) || [];
      matches.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [posts]);

  const suggestedArtists = useMemo(() => {
    return artists.filter((a) => a.uid !== user?.uid).slice(0, 4);
  }, [artists, user?.uid]);

  return (
    <div className="min-h-screen bg-transparent text-white pb-32">
      {/* Transparent Global Page Header */}
      <PageHeader
        title="JamSpace"
        showBack={false}
        transparent={true}
        className="bg-transparent backdrop-blur-none backdrop-filter-none border-none"
        rightContent={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateSpace}
              className="min-h-[38px] px-3.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-none"
              aria-label="Host Live JamSpace"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Go Live</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveReplyPost(null);
                setActiveQuotePost(null);
                setIsMobileComposeOpen(true);
              }}
              className="md:hidden min-h-[38px] min-w-[38px] p-2 rounded-full text-[#00B4D8] bg-[#0088CC]/15 hover:bg-[#0088CC]/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none"
              aria-label="New Post"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        }
      />

      <PageLayout containerClassName="w-full max-w-full px-2 sm:px-4 relative pt-2" topSpacing="none">
        {/* Sticky For You / Following & Filter Header */}
        <JamFeedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          contentFilter={contentFilter}
          onContentFilterChange={setContentFilter}
          onRefresh={refreshFeed}
          isRefreshing={isRefreshing}
          hasNewPosts={hasNewPosts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Mobile Live Audio Spaces Strip (< lg) */}
        {(liveSpaces.length > 0 || !isLoadingSpaces) && (
          <section className="lg:hidden pt-2 pb-1">
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Audio Rooms</span>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateSpace}
                className="text-xs font-bold text-[#00B4D8] hover:underline bg-transparent border-none cursor-pointer"
              >
                + Host Room
              </button>
            </div>
            {liveSpaces.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
                {liveSpaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => navigate(`/space/${space.id}`)}
                    className="shrink-0 w-60 p-3 rounded-2xl bg-[var(--tj-color-surface-card,#0A1628)]/80 hover:bg-[var(--tj-color-surface-card,#0A1628)] text-left transition-all cursor-pointer border-none flex items-center gap-3"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={space.host.avatar || getPlaceholderImage('artist')}
                        alt={space.host.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('artist');
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <p className="text-xs font-bold text-white truncate">{space.title}</p>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {space.host.name} · {space.listenerCount} listening
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-3">
          {/* Main Feed Column (Span 8) */}
          <main className="lg:col-span-8 space-y-4">
            {/* Inline Desktop & Tablet Composer */}
            <div className="hidden md:block">
              <JamComposer
                onPostCreated={handlePostCreated}
                replyToPost={activeReplyPost}
                quotePost={activeQuotePost}
                onCancelReplyOrQuote={() => {
                  setActiveReplyPost(null);
                  setActiveQuotePost(null);
                }}
              />
            </div>

            {/* Mobile Composer Modal / Drawer */}
            {isMobileComposeOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center md:hidden"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsMobileComposeOpen(false);
                  }
                }}
              >
                <div className="w-full max-w-lg bg-[var(--tj-color-surface-card,#0A1628)] rounded-2xl p-4 space-y-3 relative shadow-2xl">
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-sm font-bold text-white">
                      {activeReplyPost
                        ? 'Reply to Transmission'
                        : activeQuotePost
                          ? 'Quote Transmission'
                          : 'Broadcast Transmission'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsMobileComposeOpen(false)}
                      aria-label="Close composer"
                      className="p-1.5 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <JamComposer
                    onPostCreated={handlePostCreated}
                    replyToPost={activeReplyPost}
                    quotePost={activeQuotePost}
                    onCancelReplyOrQuote={() => {
                      setActiveReplyPost(null);
                      setActiveQuotePost(null);
                    }}
                    isModal={true}
                  />
                </div>
              </div>
            )}

            {/* Feed Loading Skeletons */}
            {isLoading ? (
              <FeedSkeleton />
            ) : error ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.03] space-y-3">
                <p className="text-sm font-semibold text-rose-400">{error}</p>
                <button
                  type="button"
                  onClick={refreshFeed}
                  className="px-4 py-2 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#0077B5] border-none"
                >
                  Retry Signal
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              isFiltered ? (
                /* Empty Search / Content Filter State */
                <div className="p-12 text-center rounded-2xl bg-white/[0.03] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto text-[#00B4D8]">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Matching Transmissions</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    No posts matched your active search or filter criteria. Try clearing filters or exploring another category.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-5 py-2 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#0077B5] border-none"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                /* Empty Feed State */
                <div className="p-12 text-center rounded-2xl bg-white/[0.03] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto text-[#00B4D8]">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {activeTab === 'following' ? 'No Transmissions from Followed Accounts' : 'No Posts Yet in JamSpace'}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {activeTab === 'following'
                      ? 'Follow your favorite music producers, artists, and NFT collectors to see their broadcasts here.'
                      : 'Be the first to share an audio clip, music track, or sonic thought with the TonJam community!'}
                  </p>
                  {activeTab === 'following' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('for-you')}
                      className="px-5 py-2 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#0077B5] border-none"
                    >
                      Explore For You Feed
                    </button>
                  )}
                </div>
              )
            ) : (
              /* Post Stream */
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <JamPostCard
                    key={post.id}
                    post={post}
                    onLike={handleToggleLike}
                    onRepost={handleToggleRepost}
                    onBookmark={handleToggleBookmark}
                    onShare={handleShare}
                    onDelete={handleDeleteAndSync}
                    onReport={handleReport}
                    onReply={handleInitiateReply}
                    onQuote={handleInitiateQuote}
                    onHashtagClick={(tag) => setSearchQuery(tag)}
                  />
                ))}

                {/* Cursor Pagination Trigger */}
                {hasMore && (
                  <div className="pt-4 pb-6 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="min-h-[44px] px-6 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:scale-95 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-50 border-none"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#00B4D8]" />
                          <span>Retrieving Transmissions...</span>
                        </>
                      ) : (
                        <span>Load More Posts</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Desktop Right Rail (Col Span 4) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5">
            {/* Live Audio Spaces Card */}
            <div className="p-4 rounded-2xl bg-[var(--tj-color-surface-card,#0A1628)]/75 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Live JamSpaces</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateSpace}
                  className="text-xs font-bold text-[#00B4D8] hover:underline cursor-pointer bg-transparent border-none"
                >
                  + Host Space
                </button>
              </div>

              {isLoadingSpaces ? (
                <div className="space-y-2 py-1">
                  <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                </div>
              ) : liveSpaces.length > 0 ? (
                <div className="space-y-2">
                  {liveSpaces.map((space) => (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => navigate(`/space/${space.id}`)}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer border-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          <img
                            src={space.host.avatar || getPlaceholderImage('artist')}
                            alt={space.host.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('artist');
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{space.title}</p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {space.host.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold shrink-0">
                        <Headphones className="w-3 h-3" />
                        <span>{space.listenerCount}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No live rooms right now. Launch a live audio hangout for your listeners and collectors.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate('/space-room')}
                className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-bold text-white transition-all flex items-center justify-between cursor-pointer border-none"
              >
                <span>Open Space Stage</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00B4D8]" />
              </button>
            </div>

            {/* Suggested Artists to Follow */}
            {suggestedArtists.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--tj-color-surface-card,#0A1628)]/75 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Users className="w-4 h-4 text-[#00B4D8]" />
                  <span>Suggested Creators</span>
                </div>
                <div className="space-y-2">
                  {suggestedArtists.map((artist) => {
                    const isFollowed =
                      localFollowedIds[artist.uid] !== undefined
                        ? localFollowedIds[artist.uid]
                        : followedUserIds.includes(artist.uid);
                    const isPending = !!followPendingIds[artist.uid];

                    return (
                      <div
                        key={artist.uid}
                        onClick={() => navigate(`/artist/${artist.uid}`)}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 shrink-0">
                            <img
                              src={artist.avatarUrl || (artist as any).avatar || getPlaceholderImage('artist')}
                              alt={artist.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getPlaceholderImage('artist');
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-white truncate">{artist.name}</span>
                              {artist.verified && (
                                <VerifiedBadge isVerified={true} size="sm" className="shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">{artist.genre || 'Music Creator'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={(e) => handleQuickFollowCreator(e, artist.uid, artist.name)}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border-none flex items-center gap-1 disabled:opacity-50 ${
                            isFollowed
                              ? 'bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]'
                              : 'bg-[var(--tj-color-accent-primary,#0088CC)] text-white hover:bg-[#0077B5]'
                          }`}
                        >
                          {isFollowed ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending Sonic Topics */}
            <div className="p-4 rounded-2xl bg-[var(--tj-color-surface-card,#0A1628)]/75 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Trending in Music</span>
              </div>
              {trendingTopics.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Hashtags shared in community posts will trend here.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {trendingTopics.map(([tag, count]) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="w-full p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer text-left border-none bg-transparent"
                    >
                      <p className="text-xs font-bold text-white hover:text-[#00B4D8] transition-colors">{tag}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{count} {count === 1 ? 'post' : 'posts'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </PageLayout>

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full bg-[var(--tj-color-accent-primary,#0088CC)] text-white shadow-xl flex items-center justify-center hover:opacity-95 active:scale-95 transition-all cursor-pointer border-none"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Host Live JamSpace Modal */}
      <CreateJamSpaceModal
        isOpen={isCreateSpaceOpen}
        onClose={() => setIsCreateSpaceOpen(false)}
        onSubmit={handleCreateSpaceSubmit}
      />
    </div>
  );
};

export default JamSpaceMain;

