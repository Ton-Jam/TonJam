import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Radio, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Music2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { useJamSpaceFeed } from '@/hooks/useJamSpaceFeed';
import { usePostActions } from '@/hooks/usePostActions';
import { JamFeedHeader } from '@/components/jamspace/JamFeedHeader';
import { JamComposer } from '@/components/jamspace/JamComposer';
import { JamPostCard } from '@/components/jamspace/JamPostCard';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FeedSkeleton } from './components/Skeletons';
import { SocialPost } from '@/types/social';
import VerifiedBadge from '@/components/VerifiedBadge';

export const JamSpaceMain: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const { addNotification, artists } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuotePost, setActiveQuotePost] = useState<SocialPost | null>(null);
  const [activeReplyPost, setActiveReplyPost] = useState<SocialPost | null>(null);
  const [isMobileComposeOpen, setIsMobileComposeOpen] = useState(false);

  // Core feed hook
  const {
    activeTab,
    setActiveTab,
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refreshFeed,
    loadMore,
    prependPost,
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
    handleReport
  } = usePostActions(updatePostInFeed);

  // Search filter
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter((p) => 
      p.text.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.author.username.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const handlePostCreated = (newPost: SocialPost) => {
    prependPost(newPost);
    setActiveQuotePost(null);
    setActiveReplyPost(null);
    setIsMobileComposeOpen(false);
  };

  const handleInitiateQuote = (post: SocialPost) => {
    setActiveQuotePost(post);
    setActiveReplyPost(null);
    // Scroll smoothly to composer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiateReply = (post: SocialPost) => {
    setActiveReplyPost(post);
    setActiveQuotePost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030B17] text-white pb-32">
      {/* Global Page Header */}
      <PageHeader 
        title="JamSpace" 
        showBack={false}
        rightContent={
          <button 
            type="button"
            onClick={() => setIsMobileComposeOpen(true)}
            className="md:hidden p-2 rounded-full text-[#00B4D8] bg-[#0088CC]/10 hover:bg-[#0088CC]/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="New Post"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        }
      />

      <PageLayout containerClassName="max-w-6xl mx-auto px-3 sm:px-6 relative pt-2" topSpacing="none">
        {/* Sticky For You / Following Header */}
        <JamFeedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={refreshFeed}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

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
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center md:hidden">
                <div className="w-full max-w-lg bg-[#0A1628] rounded-2xl p-4 space-y-3 relative shadow-2xl">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-sm font-bold text-white">Broadcast Transmission</h3>
                    <button
                      type="button"
                      onClick={() => setIsMobileComposeOpen(false)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
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
              <div className="p-8 text-center rounded-2xl bg-white/[0.02] space-y-3">
                <p className="text-sm font-semibold text-rose-400">{error}</p>
                <button
                  type="button"
                  onClick={refreshFeed}
                  className="px-4 py-2 rounded-full bg-[#0088CC] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#0077B5]"
                >
                  Retry Signal
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              /* Empty Feed State */
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto text-[#00B4D8]">
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
                    className="px-4 py-2 rounded-full bg-[#0088CC] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#0077B5]"
                  >
                    Explore For You Feed
                  </button>
                )}
              </div>
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
                    onDelete={handleDelete}
                    onReport={handleReport}
                    onReply={handleInitiateReply}
                    onQuote={handleInitiateQuote}
                  />
                ))}

                {/* Cursor Pagination Trigger */}
                {hasMore && (
                  <div className="pt-4 pb-6 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="min-h-[44px] px-6 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-50"
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
            <div className="p-4 rounded-2xl bg-[#0A1628]/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Live JamSpaces</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/space-room')}
                  className="text-xs font-semibold text-[#00B4D8] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Join live audio hangouts hosted by verified music artists and producers.
              </p>
              <button
                type="button"
                onClick={() => navigate('/space-room')}
                className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Browse Live Rooms</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00B4D8]" />
              </button>
            </div>

            {/* Suggested Artists to Follow */}
            {artists && artists.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0A1628]/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Users className="w-4 h-4 text-[#00B4D8]" />
                  <span>Suggested Creators</span>
                </div>
                <div className="space-y-2.5">
                  {artists.slice(0, 4).map((artist) => (
                    <div 
                      key={artist.uid || artist.id}
                      onClick={() => navigate(`/artist/${artist.uid || artist.id}`)}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate">{artist.name}</span>
                            <VerifiedBadge isVerified={true} size={12} className="shrink-0" />
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{artist.genre || 'Electronic'}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#00B4D8] shrink-0">View</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Sonic Topics */}
            <div className="p-4 rounded-2xl bg-[#0A1628]/70 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Trending in Music</span>
              </div>
              <div className="space-y-2">
                {[
                  { tag: '#TONGenesis', subtitle: '1.4k broadcasts' },
                  { tag: '#AmapianoVibes', subtitle: '890 broadcasts' },
                  { tag: '#SonicNFTs', subtitle: '620 broadcasts' },
                  { tag: '#Web3Audio', subtitle: '450 broadcasts' }
                ].map((topic, i) => (
                  <div
                    key={i}
                    onClick={() => setSearchQuery(topic.tag)}
                    className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <p className="text-xs font-bold text-white hover:text-[#00B4D8] transition-colors">{topic.tag}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{topic.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </PageLayout>
    </div>
  );
};

export default JamSpaceMain;
