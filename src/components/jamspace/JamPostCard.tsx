import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Trash2, 
  Flag, 
  ExternalLink,
  Quote
} from 'lucide-react';
import { SocialPost } from '@/types/social';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import VerifiedBadge from '@/components/VerifiedBadge';

interface JamPostCardProps {
  post: SocialPost;
  onLike: (post: SocialPost) => void;
  onRepost: (post: SocialPost) => void;
  onBookmark: (post: SocialPost) => void;
  onShare: (post: SocialPost) => void;
  onDelete?: (postId: string, authorId: string) => void;
  onReport?: (postId: string, reason: 'spam' | 'harassment' | 'copyright' | 'inappropriate' | 'other') => void;
  onReply?: (post: SocialPost) => void;
  onQuote?: (post: SocialPost) => void;
  isDetailView?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recent';
  }
}

export const JamPostCard: React.FC<JamPostCardProps> = ({
  post,
  onLike,
  onRepost,
  onBookmark,
  onShare,
  onDelete,
  onReport,
  onReply,
  onQuote,
  isDetailView = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);

  const isAuthor = user?.uid === post.authorId;
  const timeString = formatRelativeTime(post.createdAt);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if interacting with buttons, links, media, or menus
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('video') || target.closest('.no-card-nav')) {
      return;
    }
    if (!isDetailView) {
      navigate(`/post/${post.id}`);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author.role === 'artist' || post.author.isVerified) {
      navigate(`/artist/${post.authorId}`);
    } else {
      navigate(`/user/${post.authorId}`);
    }
  };

  // Check if any attached track is currently playing
  const attachedTrack = post.attachments?.find((a) => a.type === 'track');
  const isThisTrackPlaying = attachedTrack && currentTrack?.id === attachedTrack.id && isPlaying;

  const handlePlayAttachedTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!attachedTrack) return;

    if (currentTrack?.id === attachedTrack.id) {
      togglePlay();
    } else {
      playTrack({
        id: attachedTrack.id || `track-${post.id}`,
        songId: attachedTrack.id || `track-${post.id}`,
        title: attachedTrack.title || 'Attached Track',
        artist: attachedTrack.artist || post.author.name,
        artistId: attachedTrack.artistId || post.authorId,
        audioUrl: attachedTrack.url,
        coverUrl: attachedTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80',
        duration: attachedTrack.duration || 180,
        streams: 0,
        playCount: 0,
        createdAt: new Date().toISOString()
      } as any);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group w-full text-left transition-colors relative ${
        isDetailView 
          ? 'p-4 sm:p-6 bg-[#0A1628]/80 rounded-2xl' 
          : 'p-4 sm:p-5 bg-[#0A1628]/60 hover:bg-[#0A1628]/90 rounded-2xl cursor-pointer shadow-md shadow-black/20'
      }`}
    >
      {/* Reply indicator */}
      {post.replyToAuthorUsername && (
        <div className="flex items-center gap-1.5 pb-2 text-xs text-zinc-400">
          <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            Replying to <span className="font-semibold text-[#00B4D8]">{post.replyToAuthorUsername}</span>
          </span>
        </div>
      )}

      {/* Main post layout */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Author Avatar */}
        <div 
          onClick={handleAuthorClick}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 bg-slate-800 cursor-pointer active:scale-95 transition-transform"
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            }}
          />
        </div>

        {/* Post Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header row: Author Name, Handle, Verified Badge, Time, and More Menu */}
          <div className="flex items-center justify-between gap-2">
            <div 
              onClick={handleAuthorClick}
              className="flex items-center gap-1.5 min-w-0 cursor-pointer group-hover:underline"
            >
              <span className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <VerifiedBadge isVerified={true} role={post.author.role} size={14} className="shrink-0" />
              )}
              <span className="text-xs text-zinc-400 truncate max-w-[100px] sm:max-w-[140px]">
                {post.author.username}
              </span>
              <span className="text-zinc-500 text-xs shrink-0" aria-hidden="true">·</span>
              <span className="text-zinc-500 text-xs shrink-0 whitespace-nowrap">
                {timeString}
              </span>
            </div>

            {/* Contextual More Options Menu */}
            <div className="relative shrink-0 no-card-nav">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div 
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-slate-900/95 shadow-xl backdrop-blur-md p-1.5 z-40 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onShare(post);
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>

                  {isAuthor && onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(post.id, post.authorId);
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  ) : onReport ? (
                    <button
                      type="button"
                      onClick={() => {
                        onReport(post.id, 'inappropriate');
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report Post</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Post Text */}
          {post.text && (
            <p className={`text-zinc-100 leading-relaxed break-words pt-1 ${isDetailView ? 'text-base sm:text-lg' : 'text-sm'}`}>
              {post.text}
            </p>
          )}

          {/* Attached Media */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2.5 pt-2.5">
              {post.attachments.map((att, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl bg-black/40">
                  {att.type === 'image' && (
                    <img
                      src={att.url}
                      alt={att.title || 'Post image'}
                      className="w-full max-h-96 object-cover rounded-xl"
                      loading="lazy"
                    />
                  )}

                  {att.type === 'video' && (
                    <video
                      src={att.url}
                      controls
                      className="w-full max-h-96 object-cover rounded-xl bg-black"
                    />
                  )}

                  {att.type === 'track' && (
                    <div 
                      onClick={handlePlayAttachedTrack}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative">
                          <img
                            src={att.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80'}
                            alt={att.title || 'Track'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            {isThisTrackPlaying ? (
                              <Pause className="w-5 h-5 text-[#00B4D8] fill-current" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{att.title}</p>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{att.artist}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#00B4D8] shrink-0 pl-2">
                        {isThisTrackPlaying ? 'Playing' : 'Listen'}
                      </span>
                    </div>
                  )}

                  {att.type === 'nft' && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (att.id) navigate(`/nft/${att.id}`);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                          <img
                            src={att.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80'}
                            alt={att.title || 'NFT'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{att.title}</p>
                          <p className="text-xs text-purple-300 font-mono mt-0.5">{att.price || 'Music NFT'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-purple-400 shrink-0">
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quoted Post Embed */}
          {post.quotePost && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post.quotePost?.id}`);
              }}
              className="mt-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 shrink-0">
                  <img src={post.quotePost.authorAvatar} alt={post.quotePost.authorName} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-white truncate">{post.quotePost.authorName}</span>
                {post.quotePost.authorVerified && (
                  <VerifiedBadge isVerified={true} size={12} className="shrink-0" />
                )}
                <span className="text-xs text-zinc-400 truncate">{post.quotePost.authorUsername}</span>
              </div>
              <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                {post.quotePost.text}
              </p>
            </div>
          )}

          {/* Engagement Action Bar */}
          <div className="flex items-center justify-between pt-3 text-zinc-400 no-card-nav max-w-md">
            {/* Reply */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onReply) {
                  onReply(post);
                } else {
                  navigate(`/post/${post.id}`);
                }
              }}
              className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#00B4D8] transition-colors cursor-pointer group/btn"
              aria-label={`Reply (${post.replyCount})`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-[#00B4D8]/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs tabular-nums">{post.replyCount > 0 ? post.replyCount : ''}</span>
            </button>

            {/* Repost & Quote Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRepostMenu(!showRepostMenu);
                }}
                className={`min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/btn ${
                  post.isReposted ? 'text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-emerald-400'
                }`}
                aria-label={`Repost (${post.repostCount})`}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-emerald-500/10 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                </div>
                <span className="text-xs tabular-nums">{post.repostCount > 0 ? post.repostCount : ''}</span>
              </button>

              {showRepostMenu && (
                <div 
                  className="absolute left-0 bottom-full mb-1 w-36 rounded-xl bg-slate-900/95 shadow-xl backdrop-blur-md p-1.5 z-40 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onRepost(post);
                      setShowRepostMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-emerald-400 hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Repeat2 className="w-3.5 h-3.5" />
                    <span>{post.isReposted ? 'Undo Repost' : 'Repost'}</span>
                  </button>
                  {onQuote && (
                    <button
                      type="button"
                      onClick={() => {
                        onQuote(post);
                        setShowRepostMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-[#00B4D8] hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>Quote Post</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Like */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLike(post);
              }}
              className={`min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/btn ${
                post.isLiked ? 'text-rose-500 font-semibold' : 'text-zinc-400 hover:text-rose-500'
              }`}
              aria-label={`Like (${post.likeCount})`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-rose-500/10 transition-colors">
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs tabular-nums">{post.likeCount > 0 ? post.likeCount : ''}</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(post);
              }}
              className={`min-h-[44px] min-w-[44px] flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/btn ${
                post.isBookmarked ? 'text-[#00B4D8] font-semibold' : 'text-zinc-400 hover:text-[#00B4D8]'
              }`}
              aria-label="Bookmark"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-[#00B4D8]/10 transition-colors">
                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(post);
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-[#00B4D8] transition-colors cursor-pointer group/btn"
              aria-label="Share post"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-[#00B4D8]/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
