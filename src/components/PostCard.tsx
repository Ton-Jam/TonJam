import React, { useState, useMemo } from 'react';
import { Check, MoreHorizontal, Play, Pause, Plus, Heart, MessageCircle, Repeat2, Share, Smile, Send, MessageSquareOff, X, VerifiedIcon } from 'lucide-react';
import { Post, Comment } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import PostOptionsModal from '@/components/PostOptionsModal';
import { MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const navigate = useNavigate();
  const { togglePlay, currentTrack, isPlaying, toggleFollowUser, followedUserIds, userProfile, addNotification, allNFTs } = useAudio();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [repostsCount, setRepostsCount] = useState(post.reposts || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentList || []);
  const [commentText, setCommentText] = useState('');
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      content: commentText,
      timestamp: 'Just now',
      likes: 0,
      reactions: {},
      userReactions: []
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    addNotification('Comment synchronized', 'success');
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    setComments(prev =>
      prev.map(c => {
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
        return c;
      })
    );
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setRepostsCount(prev => isReposted ? prev - 1 : prev + 1);
    addNotification(isReposted ? "Repost removed" : "Signal reposted to your feed", "success");
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

  const userHandle = post.userHandle || `@${post.userName.toLowerCase().replace(/\s+/g, '')}`;

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
        "relative isolate w-full overflow-hidden rounded-2xl p-1.5 mb-4 group",
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
          "relative w-full rounded-xl p-5",
          "bg-linear-to-br from-black/[0.05] to-transparent dark:from-white/[0.08] dark:to-transparent",
          "backdrop-blur-md backdrop-saturate-150",
          "border border-black/[0.05] dark:border-white/[0.08]",
          "text-background/90 dark:text-foreground",
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
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <img src={post.userAvatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div 
                className="cursor-pointer outline-none flex flex-col focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm" 
                onClick={handleProfileClick}
                onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
                role="button"
                tabIndex={0}
                aria-label={`View ${post.userName}'s profile`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-background hover:underline dark:text-foreground/90">{post.userName}</span>
                  {post.isVerified && (
                    <VerifiedIcon className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-background text-sm dark:text-muted-foreground/80">{userHandle}</span>
                  <span className="text-background text-sm dark:text-muted-foreground/80">·</span>
                  <span className="text-background text-sm dark:text-muted-foreground/80">{post.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isOwnPost && (
                  <button 
                    onClick={handleFollow} 
                    className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isFollowing ? 'bg-muted text-foreground' : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                    aria-label={isFollowing ? `Unfollow ${post.userName}` : `Follow ${post.userName}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                <button 
                  onClick={() => setShowOptions(true)} 
                  className="flex h-8 w-8 items-center justify-center rounded-lg p-1 text-background hover:bg-background/5 hover:text-background dark:text-muted-foreground/90 dark:hover:bg-muted/50 dark:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Post options"
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Post Text */}
            <p className="text-base text-background dark:text-foreground/90 mb-4 whitespace-pre-wrap">
              {renderContentWithHashtags(post.content)}
            </p>

          {/* Media Content */}
          {post.imageUrl && (
            <div 
              className="rounded-[10px] overflow-hidden mb-4 bg-muted/50 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
              onClick={() => setExpandedImage(post.imageUrl)}
              onKeyDown={(e) => handleKeyDown(e, () => setExpandedImage(post.imageUrl))}
              role="button"
              tabIndex={0}
              aria-label="Expand image"
            >
              <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
            </div>
          )}

          {post.video && (
            <div className="rounded-[10px] overflow-hidden mb-4 bg-muted/50 relative aspect-video">
              <video src={post.video} className="w-full h-full object-cover" aria-label="Post video" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <button 
                  className="w-16 h-16 rounded-full bg-blue-600/80 flex items-center justify-center text-foreground text-xl hover:bg-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Play video"
                >
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </button>
              </div>
            </div>
          )}

          {track && (
            <div 
              className="bg-muted/50 rounded-[10px] p-4 mb-4 flex items-center gap-4 group/track cursor-pointer hover:bg-muted transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
              onClick={handlePlayTrack}
              onKeyDown={(e) => handleKeyDown(e, () => handlePlayTrack(e as any))}
              role="button"
              tabIndex={0}
              aria-label={`Play track: ${track.title} by ${track.artist}`}
            >
              <div className="relative w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0">
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-background/40 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="h-4 w-4 text-foreground fill-current" />
                  ) : (
                    <Play className="h-4 w-4 text-foreground fill-current" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[10px] font-bold text-foreground uppercase truncate">{track.title}</h5>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Streaming Now</p>
                  <p className="text-[10px] font-bold text-foreground uppercase">{(track.streams || track.playCount || 0).toLocaleString()}</p>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Add track to library"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {nft && (
            <div 
              className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-neutral-500/20 rounded-[10px] p-4 mb-4 flex items-center gap-4 group/nft cursor-pointer hover:from-blue-600/20 hover:to-purple-600/20 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
              onClick={() => navigate(`/nft/${nft.id}`)}
              onKeyDown={(e) => handleKeyDown(e, () => navigate(`/nft/${nft.id}`))}
              role="button"
              tabIndex={0}
              aria-label={`View NFT: ${nft.title}`}
            >
              <div className="relative w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0 shadow-lg">
                <img src={nft.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg" aria-label="Verified NFT">
                    <Check className="h-2 w-2 text-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[7px] font-bold text-blue-400 uppercase tracking-[0.3em]">Sonic Artifact Acquired</span>
                </div>
                <h5 className="text-xs font-bold text-foreground uppercase truncate tracking-tight">{nft.title}</h5>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">Creator: {nft.creator}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Valuation</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-sm font-bold text-foreground tracking-tighter">{nft.price}</span>
                  <span className="text-[8px] font-bold text-blue-500">TON</span>
                </div>
              </div>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between pt-4 relative flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <motion.div whileTap={{ scale: 1.5 }}>
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
                <span>{likesCount}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm hover:scale-105 ${showComments ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={showComments ? "Hide comments" : "Show comments"}
                aria-expanded={showComments}
              >
                <MessageCircle className={`h-4 w-4 ${showComments ? 'fill-current' : ''}`} /> <span>{comments.length}</span>
              </button>
              <button 
                onClick={handleRepost} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm hover:scale-105 ${isReposted ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={isReposted ? "Remove repost" : "Repost post"}
              >
                <Repeat2 className="h-4 w-4" /> <span>{repostsCount}</span>
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
            className="mt-6 pt-6 border-t border-border/50 overflow-hidden"
            id={`comments-${post.id}`}
          >
            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-4 mb-6">
              <img src={MOCK_USER.avatar} className="w-8 h-8 rounded-full shadow-lg object-cover" alt="Your avatar" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-muted/50 rounded-[10px] py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                  aria-label="Write a comment"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-600 rounded-[8px] text-foreground hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Send comment"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4" role="log" aria-label="Comments">
              <AnimatePresence mode="popLayout">
                {comments.map(comment => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={comment.id}
                    className="flex gap-3 group/comment"
                  >
                    <img 
                      src={comment.userAvatar} 
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                      alt={`${comment.userName}'s avatar`} 
                      onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleCommentProfileClick(e as any, comment.userId))}
                      role="button"
                      tabIndex={0}
                    />
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-[10px] p-3 relative group-hover/comment:bg-foreground/[0.07] transition-colors border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <h5 
                            className="text-[10px] font-bold text-foreground uppercase tracking-tight cursor-pointer hover:text-blue-400 hover:underline inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                            onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleCommentProfileClick(e as any, comment.userId))}
                            role="button"
                            tabIndex={0}
                          >
                            {comment.userName}
                          </h5>
                          <span className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-widest">{comment.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-foreground/70 leading-relaxed">{renderContentWithHashtags(comment.content)}</p>
                        
                        {/* Reactions */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                              const isActive = comment.userReactions?.includes(emoji);
                              return (
                                <button 
                                  key={emoji} 
                                  onClick={() => handleCommentReaction(comment.id, emoji)} 
                                  className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'bg-blue-500/20 text-blue-400 border border-neutral-500/30' : 'bg-muted/50 text-muted-foreground/80 hover:text-foreground border border-border/50 hover:bg-muted'}`}
                                  aria-label={`${isActive ? 'Remove' : 'Add'} ${emoji} reaction`}
                                >
                                  <span className="text-xs">{emoji}</span>
                                  <span className="font-bold">{count}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setActiveReactionCommentId(activeReactionCommentId === comment.id ? null : comment.id)}
                              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeReactionCommentId === comment.id ? 'text-blue-500 bg-muted opacity-100' : 'text-muted-foreground/50 hover:text-blue-500 opacity-0 group-hover/comment:opacity-100'}`}
                              aria-label="Add reaction to comment"
                              aria-haspopup="true"
                            >
                              <Smile className="h-3.5 w-3.5" />
                            </button>
                            <AnimatePresence>
                              {activeReactionCommentId === comment.id && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-[#1a1a1a] border border-border p-1.5 rounded-full shadow-2xl z-20 backdrop-blur-xl"
                                  role="menu"
                                >
                                  {REACTION_EMOJIS.map(emoji => {
                                    const isActive = comment.userReactions?.includes(emoji);
                                    return (
                                      <button 
                                        key={emoji} 
                                        onClick={() => {
                                          handleCommentReaction(comment.id, emoji);
                                          setActiveReactionCommentId(null);
                                        }} 
                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all text-sm hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-muted text-muted-foreground/90'}`}
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
                  </motion.div>
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border/50 rounded-[10px]">
                  <MessageSquareOff className="h-6 w-6 text-foreground/5 mx-auto mb-2" />
                  <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">No comments yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOptions && (
        <PostOptionsModal post={post} onClose={() => setShowOptions(false)} isOwner={isOwnPost} />
      )}

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
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
