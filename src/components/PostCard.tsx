import React, { useState, useMemo } from 'react';
import { Check, MoreHorizontal, Play, Pause, Plus, Heart, MessageCircle, Repeat2, Share, Smile, Send, MessageSquareOff, X, VerifiedIcon } from 'lucide-react';
import { Post, Comment } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import PostOptionsModal from '@/components/PostOptionsModal';
import { MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';
import { cn, getPlaceholderImage } from '@/lib/utils';

const PostCard: React.FC<{ post: Post; onDelete?: (id: string) => void }> = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { togglePlay, currentTrack, isPlaying, toggleFollowUser, followedUserIds, userProfile, addNotification, allNFTs, updatePost, setOptionsTrack } = useAudio();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [repostsCount, setRepostsCount] = useState(post.reposts || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentList || []);
  const [commentText, setCommentText] = useState('');
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0,
      reactions: {},
      userReactions: [],
      replies: []
    };

    let newCommentsList: Comment[];

    if (replyingToId) {
      // Find the comment to reply to and add the new comment to its replies
      const addReplyToComment = (commentList: Comment[]): Comment[] => {
        return commentList.map(c => {
          if (c.id === replyingToId) {
            return {
              ...c,
              replies: [newComment, ...(c.replies || [])]
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: addReplyToComment(c.replies)
            };
          }
          return c;
        });
      };
      newCommentsList = addReplyToComment(comments);
      setReplyingToId(null);
      addNotification('Reply posted', 'success');
    } else {
      newCommentsList = [newComment, ...comments];
      addNotification('Comment posted', 'success');
    }

    setComments(newCommentsList);
    setCommentText('');
    
    updatePost(post.id, {
      commentList: newCommentsList,
      comments: post.comments + 1
    });
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    const updateReactions = (commentList: Comment[]): Comment[] => {
      return commentList.map(c => {
        if (c.id === commentId) {
          const newReactions = { ...(c.reactions || {}) };
          const userReactions = c.userReactions || [];
          const hasReacted = userReactions.includes(emoji);

          if (hasReacted) {
            newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1);
            if (newReactions[emoji] === 0) delete newReactions[emoji];
            return { ...c, reactions: newReactions, userReactions: userReactions.filter(r => r !== emoji) };
          } else {
            newReactions[emoji] = (newReactions[emoji] || 0) + 1;
            return { ...c, reactions: newReactions, userReactions: [...userReactions, emoji] };
          }
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateReactions(c.replies) };
        }
        return c;
      });
    };

    const newCommentsList = updateReactions(comments);
    setComments(newCommentsList);
    updatePost(post.id, { commentList: newCommentsList });
  };
  const [showReactions, setShowReactions] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const isFollowing = followedUserIds.includes(post.userId);
  const isOwnPost = post.userId === userProfile.id;

  const track = useMemo(() => {
    if (post.track) return post.track;
    if (post.trackId) return MOCK_TRACKS.find(t => t.id === post.trackId);
    return undefined;
  }, [post.track, post.trackId]);

  const nft = useMemo(() => {
    if (post.nft) return post.nft;
    if (post.nftId) return allNFTs.find(n => n.id === post.nftId);
    return undefined;
  }, [post.nft, post.nftId, allNFTs]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleLike = () => {
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    updatePost(post.id, {
      isLiked: newIsLiked,
      likes: newLikesCount
    });
  };

  const handleRepost = () => {
    const newIsReposted = !isReposted;
    const newRepostsCount = newIsReposted ? repostsCount + 1 : repostsCount - 1;
    setIsReposted(newIsReposted);
    setRepostsCount(newRepostsCount);
    updatePost(post.id, {
      isReposted: newIsReposted,
      reposts: newRepostsCount
    });
    addNotification(newIsReposted ? "Signal reposted to your feed" : "Repost removed", "success");
  };

  const handleReaction = (emoji: string) => {
    addNotification(`Reacted with ${emoji}`, 'success');
    setShowReactions(false);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(post.userId);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.userId === userProfile.id) {
      navigate('/profile');
    } else if (MOCK_ARTISTS.some(a => a.id === post.userId)) {
      navigate(`/artist/${post.userId}`);
    } else {
      navigate(`/user/${post.userId}`);
    }
  };

  const handleCommentProfileClick = (e: React.MouseEvent, commentUserId: string) => {
    e.stopPropagation();
    if (commentUserId === userProfile.id) {
      navigate('/profile');
    } else if (MOCK_ARTISTS.some(a => a.id === commentUserId)) {
      navigate(`/artist/${commentUserId}`);
    } else {
      navigate(`/user/${commentUserId}`);
    }
  };

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track) {
      togglePlay();
    }
  };

  const userHandle = post.userHandle || `@${(post.userName || 'user').toLowerCase().replace(/\s+/g, '')}`;

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const renderContentWithHashtags = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/discover?search=${encodeURIComponent(part)}`);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/discover?search=${encodeURIComponent(part)}`);
              }
            }}
            className="text-blue-500 hover:text-blue-400 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={`Search for hashtag ${part}`}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-none sm:rounded-2xl p-0 sm:p-4 mb-0 sm:mb-4 group",
        "bg-muted/50 dark:bg-background/90",
        "bg-linear-to-br from-black/5 to-black/[0.02] dark:from-white/5 dark:to-white/[0.02]",
        "backdrop-blur-xl backdrop-saturate-[180%]",
        "border border-black/10 dark:border-border",
        "shadow-[0_8px_16px_rgb(0_0_0_/_0.15)] dark:shadow-[0_8px_16px_rgb(0_0_0_/_0.25)]",
        "translate-z-0 will-change-transform"
      )}
    >
      <div
        className={cn(
          "relative w-full rounded-none sm:rounded-xl p-4",
          "bg-linear-to-br from-black/[0.05] to-transparent dark:from-white/[0.08] dark:to-transparent",
          "backdrop-blur-md backdrop-saturate-150",
          "border border-black/[0.05] dark:border-white/[0.08]",
          "text-blue-600/90 dark:text-foreground",
          "shadow-xs",
          "translate-z-0 will-change-transform",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-black/[0.02] before:to-black/[0.01] before:opacity-0 before:transition-opacity dark:before:from-white/[0.03] dark:before:to-white/[0.01]",
          "hover:before:opacity-100"
        )}
      >
        <div className="flex gap-4">
          {/* Author Avatar */}
          <div 
            className="flex-shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full" 
            onClick={handleProfileClick}
            onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
            role="button"
            tabIndex={0}
            aria-label={`View ${post.userName}'s profile`}
          >
            <div className="h-12 w-12 overflow-hidden rounded-full shadow-md">
              <img src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div 
                className="cursor-pointer outline-none flex flex-col focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" 
                onClick={handleProfileClick}
                onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
                role="button"
                tabIndex={0}
                aria-label={`View ${post.userName}'s profile`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 hover:underline dark:text-silver-100">{post.userName}</span>
                  {post.isVerified && (
                    <VerifiedIcon className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 text-xs dark:text-silver-400">{userHandle}</span>
                  <span className="text-blue-500 text-xs dark:text-silver-400">·</span>
                  <span className="text-blue-500 text-xs dark:text-silver-400">
                    {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isOwnPost && (
                  <button 
                    onClick={handleFollow} 
                    className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-muted text-foreground' : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                    aria-label={isFollowing ? `Unfollow ${post.userName}` : `Follow ${post.userName}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                <button 
                  onClick={() => setShowOptions(true)} 
                  className="flex h-9 w-9 items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-500/5 hover:text-blue-600 dark:text-muted-foreground/90 dark:hover:bg-muted/50 dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Post options"
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Post Text */}
            <p className="text-base text-blue-700 dark:text-silver-200 mb-4 whitespace-pre-wrap leading-relaxed">
              {renderContentWithHashtags(post.content)}
            </p>

          {/* Media Content */}
          {post.imageUrl && (
            <div 
              className="rounded-[12px] overflow-hidden mb-4 bg-muted/50 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm" 
              onClick={() => setExpandedImage(post.imageUrl)}
              onKeyDown={(e) => handleKeyDown(e, () => setExpandedImage(post.imageUrl))}
              role="button"
              tabIndex={0}
              aria-label="Expand image"
            >
              <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          {post.video && (
            <div className="rounded-[12px] overflow-hidden mb-4 bg-muted/50 relative aspect-video shadow-sm">
              <video src={post.video} className="w-full h-full object-cover" aria-label="Post video" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <button 
                  className="w-16 h-16 rounded-full bg-blue-600/80 flex items-center justify-center text-foreground text-xl hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Play video"
                >
                  <Play className="h-8 w-8 ml-2 fill-current" />
                </button>
              </div>
            </div>
          )}

          {track && (
            <div 
              className="bg-muted/50 rounded-[12px] p-3 mb-4 flex items-center gap-4 group/track cursor-pointer hover:bg-muted transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-border/50" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/track/${track.id}`);
              }}
              onKeyDown={(e) => handleKeyDown(e, () => navigate(`/track/${track.id}`))}
              role="button"
              tabIndex={0}
              aria-label={`View track details: ${track.title} by ${track.artist}`}
            >
              <div className="relative w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 shadow-md">
                <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-background/40 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(e);
                    }}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-foreground shadow-lg"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-1" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-foreground dark:text-silver-100 uppercase truncate">{track.title}</h5>
                <p className="text-[9px] font-bold text-blue-500/70 dark:text-silver-400 uppercase tracking-widest truncate mt-1">{track.artist}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Streaming Now</p>
                  <p className="text-xs font-bold text-foreground dark:text-silver-100 uppercase">{(track.streams || track.playCount || 0).toLocaleString()}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setOptionsTrack(track); }}
                  className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-blue-500/70 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Track options"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {nft && (
            <div 
              className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-neutral-500/20 rounded-[12px] p-3 mb-4 flex items-center gap-4 group/nft cursor-pointer hover:from-blue-600/20 hover:to-purple-600/20 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm" 
              onClick={() => navigate(`/nft/${nft.id}`)}
              onKeyDown={(e) => handleKeyDown(e, () => navigate(`/nft/${nft.id}`))}
              role="button"
              tabIndex={0}
              aria-label={`View NFT: ${nft.title}`}
            >
              <div className="relative w-20 h-20 rounded-[10px] overflow-hidden flex-shrink-0 shadow-lg">
                <img src={nft.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg" aria-label="Verified NFT">
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.3em]">Sonic Artifact Acquired</span>
                </div>
                <h5 className="text-sm font-bold text-foreground dark:text-silver-100 uppercase truncate tracking-tight">{nft.title}</h5>
                <p className="text-[10px] font-bold text-blue-500/70 dark:text-silver-400 uppercase tracking-widest truncate mt-1">Creator: {nft.creator}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-blue-500/50 dark:text-silver-500 uppercase tracking-widest mb-2">Valuation</p>
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-base font-bold text-foreground dark:text-silver-100 tracking-tighter">{nft.price}</span>
                  <span className="text-[9px] font-bold text-blue-500">TON</span>
                </div>
              </div>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between pt-3 relative flex-wrap gap-4 border-t border-border/30">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike} 
                className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${isLiked ? 'text-red-500' : 'text-blue-500/70 dark:text-silver-400 hover:text-blue-600 dark:hover:text-silver-200'}`}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <motion.div whileTap={{ scale: 1.5 }}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
                <span>{likesCount}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm hover:scale-105 ${showComments ? 'text-blue-500' : 'text-blue-500/70 dark:text-silver-400 hover:text-blue-600 dark:hover:text-silver-200'}`}
                aria-label={showComments ? "Hide comments" : "Show comments"}
                aria-expanded={showComments}
              >
                <MessageCircle className={`h-5 w-5 ${showComments ? 'fill-current' : ''}`} /> <span>{comments.length}</span>
              </button>
              <button 
                onClick={handleRepost} 
                className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm hover:scale-105 ${isReposted ? 'text-green-500' : 'text-blue-500/70 dark:text-silver-400 hover:text-blue-600 dark:hover:text-silver-200'}`}
                aria-label={isReposted ? "Remove repost" : "Repost post"}
              >
                <Repeat2 className="h-5 w-5" /> <span>{repostsCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pt-2 overflow-hidden"
            id={`comments-${post.id}`}
          >
            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex flex-col gap-2 mb-2">
              {replyingToId && (
                <div className="flex items-center justify-between px-2 py-1 bg-blue-500/10 rounded-t-[10px] border-x border-t border-blue-500/20">
                  <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Replying to comment</span>
                  <button 
                    type="button" 
                    onClick={() => setReplyingToId(null)}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <img src={MOCK_USER.avatar || getPlaceholderImage(`user-${MOCK_USER.id}`)} className="w-8 h-8 rounded-full shadow-lg object-cover" alt="Your avatar" />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingToId ? "Write a reply..." : "Add a comment..."}
                    className={cn(
                      "w-full bg-muted/50 rounded-[12px] py-3 px-4 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-blue-600 dark:text-silver-100 placeholder:text-blue-500/50 dark:placeholder:text-silver-500",
                      replyingToId && "rounded-t-none border-t-0"
                    )}
                    aria-label={replyingToId ? "Write a reply" : "Write a comment"}
                    autoFocus={!!replyingToId}
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-600 rounded-[8px] text-foreground hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Send comment"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-2" role="log" aria-label="Comments">
              <AnimatePresence mode="popLayout">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onReply={(id) => setReplyingToId(id)}
                    onReaction={handleCommentReaction}
                    onProfileClick={handleCommentProfileClick}
                    activeReactionId={activeReactionCommentId}
                    setActiveReactionId={setActiveReactionCommentId}
                    renderContent={renderContentWithHashtags}
                    REACTION_EMOJIS={REACTION_EMOJIS}
                  />
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <div className="text-center py-2 border border-dashed border-border/50 rounded-[10px]">
                  <MessageSquareOff className="h-6 w-6 text-foreground/5 mx-auto mb-2" />
                  <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">No comments yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOptions && (
        <PostOptionsModal post={post} onClose={() => setShowOptions(false)} isOwner={isOwnPost} onDelete={handleDelete} />
      )}

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-2"
            onClick={() => setExpandedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-zoom-out"
              onClick={(e) => e.stopPropagation()} 
            />
            <button
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              onClick={() => setExpandedImage(null)}
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PostCard;

interface CommentItemProps {
  comment: Comment;
  onReply: (id: string) => void;
  onReaction: (id: string, emoji: string) => void;
  onProfileClick: (e: React.MouseEvent, userId: string) => void;
  activeReactionId: string | null;
  setActiveReactionId: (id: string | null) => void;
  renderContent: (text: string) => React.ReactNode;
  REACTION_EMOJIS: string[];
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onReaction, 
  onProfileClick, 
  activeReactionId, 
  setActiveReactionId,
  renderContent,
  REACTION_EMOJIS,
  depth = 0
}) => {
  return (
    <div className={cn("flex flex-col gap-3", depth > 0 && "ml-6 pl-4 border-l border-border/50")}>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex gap-3 group/comment"
      >
        <img 
          src={comment.userAvatar || getPlaceholderImage(`user-${comment.userId}`)} 
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
          alt={`${comment.userName}'s avatar`} 
          onClick={(e) => onProfileClick(e, comment.userId)}
          role="button"
          tabIndex={0}
        />
        <div className="flex-1">
          <div className="bg-muted/50 rounded-[12px] p-3 relative group-hover/comment:bg-foreground/[0.07] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h5 
                className="text-[10px] font-bold text-blue-600 dark:text-silver-100 uppercase tracking-tight cursor-pointer hover:text-blue-400 hover:underline inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                onClick={(e) => onProfileClick(e, comment.userId)}
                role="button"
                tabIndex={0}
              >
                {comment.userName}
              </h5>
              <span className="text-[8px] text-blue-500/50 dark:text-silver-500 font-bold uppercase tracking-widest">
                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[11px] text-blue-600/70 dark:text-silver-300 leading-relaxed">{renderContent(comment.content)}</p>
            
            {/* Actions Bar */}
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => onReply(comment.id)}
                className="text-[8px] font-bold text-blue-500/50 hover:text-blue-500 uppercase tracking-widest transition-colors"
              >
                Reply
              </button>

              {/* Reactions */}
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                    const isActive = comment.userReactions?.includes(emoji);
                    return (
                      <button 
                        key={emoji} 
                        onClick={() => onReaction(comment.id, emoji)} 
                        className={`flex items-center gap-2 rounded-full px-2 py-1 text-[9px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'bg-blue-500/20 text-blue-400 border border-neutral-500/30' : 'bg-muted/50 text-muted-foreground/80 hover:text-foreground border border-border/50 hover:bg-muted'}`}
                        aria-label={`${isActive ? 'Remove' : 'Add'} ${emoji} reaction`}
                      >
                        <span className="text-[10px]">{emoji}</span>
                        <span className="font-bold">{count}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveReactionId(activeReactionId === comment.id ? null : comment.id)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeReactionId === comment.id ? 'text-blue-500 bg-muted opacity-100' : 'text-muted-foreground/50 hover:text-blue-500 opacity-0 group-hover/comment:opacity-100'}`}
                    aria-label="Add reaction to comment"
                    aria-haspopup="true"
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </button>
                  <AnimatePresence>
                    {activeReactionId === comment.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-background border border-border p-2 rounded-full shadow-2xl z-20 backdrop-blur-xl"
                        role="menu"
                      >
                        {REACTION_EMOJIS.map(emoji => {
                          const isActive = comment.userReactions?.includes(emoji);
                          return (
                            <button 
                              key={emoji} 
                              onClick={() => {
                                onReaction(comment.id, emoji);
                                setActiveReactionId(null);
                              }} 
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all text-xs hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-muted text-muted-foreground/90'}`}
                              aria-label={`React with ${emoji}`}
                              role="menuitem"
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
              onReaction={onReaction}
              onProfileClick={onProfileClick}
              activeReactionId={activeReactionId}
              setActiveReactionId={setActiveReactionId}
              renderContent={renderContent}
              REACTION_EMOJIS={REACTION_EMOJIS}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
