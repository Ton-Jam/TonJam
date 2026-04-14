import React, { useState, useMemo, useEffect } from 'react';
import { Check, MoreHorizontal, Play, Pause, Plus, Heart, MessageCircle, Repeat2, Share, Smile, Send, MessageSquareOff, X, VerifiedIcon } from 'lucide-react';
import { Post, PostComment } from '@/types';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import PostOptionsModal from '@/components/PostOptionsModal';
import { MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';

const PostCard: React.FC<{ post: Post; onDelete?: (id: string) => void }> = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { togglePlay, currentTrack, isPlaying, toggleFollowUser, followedUserIds, userProfile, addNotification, allNFTs, updatePost, setOptionsTrack, addCommentToPost, toggleLikePost } = useAudio();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const likesCount = post.likes || 0;
  const repostsCount = post.reposts || 0;

  // Real-time comments listener
  useEffect(() => {
    if (!showComments) return;

    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment));
      setComments(fetchedComments);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `posts/${post.id}/comments`));

    return () => unsubscribe();
  }, [post.id, showComments]);

  // Real-time likes listener for the current user
  useEffect(() => {
    if (!userProfile.uid || !auth.currentUser) return;

    const likeRef = doc(db, 'posts', post.id, 'likes', userProfile.uid);
    const unsubscribe = onSnapshot(likeRef, (snapshot) => {
      setIsLiked(snapshot.exists());
    }, (error) => handleFirestoreError(error, OperationType.GET, `posts/${post.id}/likes/${userProfile.uid}`));

    return () => unsubscribe();
  }, [post.id, userProfile.uid]);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const commentData: Partial<PostComment> = {
      content: commentText,
      replyToId: replyingToId || undefined,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    await addCommentToPost(post.id, commentData);
    setCommentText('');
    setReplyingToId(null);
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    const updateReactions = (commentList: PostComment[]): PostComment[] => {
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
  const isOwnPost = post.userId === userProfile.uid;

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

  const handleLike = async () => {
    await toggleLikePost(post.id);
  };

  const handleRepost = () => {
    const newIsReposted = !post.isReposted;
    const newRepostsCount = newIsReposted ? repostsCount + 1 : repostsCount - 1;
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
    if (post.userId === userProfile.uid) {
      navigate('/profile');
    } else if (MOCK_ARTISTS.some(a => a.uid === post.userId)) {
      navigate(`/artist/${post.userId}`);
    } else {
      navigate(`/user/${post.userId}`);
    }
  };

  const handleCommentProfileClick = (e: React.MouseEvent, commentUserId: string) => {
    e.stopPropagation();
    if (commentUserId === userProfile.uid) {
      navigate('/profile');
    } else if (MOCK_ARTISTS.some(a => a.uid === commentUserId)) {
      navigate(`/artist/${commentUserId}`);
    } else {
      navigate(`/user/${commentUserId}`);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.userName}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      addNotification("Share link copied to clipboard", "success");
    }
  };

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track) {
      togglePlay();
    }
  };

  const userHandle = post.username || `@${(post.userName || 'user').toLowerCase().replace(/\s+/g, '')}`;

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
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
      className={cn(
        "w-full p-3 border-none transition-colors cursor-pointer",
        "bg-background"
      )}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div 
          className="flex-shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full h-fit" 
          onClick={handleProfileClick}
          onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View ${post.userName}'s profile`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} className="object-cover" alt={post.userName} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div 
              className="cursor-pointer outline-none flex flex-col focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm truncate" 
              onClick={handleProfileClick}
              onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
              role="button"
              tabIndex={0}
              aria-label={`View ${post.userName}'s profile`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold hover:underline truncate">{post.userName}</span>
                {post.isVerified && (
                  <VerifiedIcon className="h-[14px] w-[14px] text-blue-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-sm truncate">{userHandle}</span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowOptions(true); }} 
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-all"
              aria-label="Post options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Post Text */}
          <p className="text-[15px] leading-normal mb-3 whitespace-pre-wrap">
            {renderContentWithHashtags(post.content)}
          </p>

          {/* Media Content */}
          {post.imageUrl && (
            <div 
              className="rounded-2xl overflow-hidden mb-3 cursor-zoom-in" 
              onClick={(e) => { e.stopPropagation(); setExpandedImage(post.imageUrl); }}
            >
              <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[512px] object-cover" />
            </div>
          )}

          {track && (
            <div 
              className="bg-muted/30 rounded-2xl p-3 mb-3 flex items-center gap-3 hover:bg-muted/50 transition-all" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/track/${track.id}`);
              }}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-6 w-6 text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold truncate text-white">{track.title}</h5>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold text-blue-500 hover:bg-blue-500/10">
                Play
              </Button>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between max-w-md">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} 
              className="flex items-center gap-2 text-white hover:text-blue-500 transition-all group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <MessageCircle className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-xs text-white">{comments.length}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRepost(); }} 
              className={cn(
                "flex items-center gap-2 transition-all group",
                post.isReposted ? "text-green-500" : "text-white hover:text-green-500"
              )}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat2 className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-xs text-white">{repostsCount}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleLike(); }} 
              className={cn(
                "flex items-center gap-2 transition-all group",
                isLiked ? "text-pink-500" : "text-white hover:text-pink-500"
              )}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                <Heart className={cn("h-[18px] w-[18px] text-white", isLiked && "fill-current")} />
              </div>
              <span className="text-xs text-white">{likesCount}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center text-white hover:text-blue-500 transition-all group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <Share className="h-[18px] w-[18px] text-white" />
              </div>
            </button>
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
                <div className="flex items-center justify-between px-2 py-1 bg-blue-500/10 rounded-t-[10px]">
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
                <Avatar className="w-[30px] h-[30px] shadow-lg">
                  <AvatarImage src={MOCK_USER.avatar || getPlaceholderImage(`user-${MOCK_USER.uid}`)} className="object-cover" alt="Your avatar" />
                  <AvatarFallback>{MOCK_USER.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingToId ? "Write a reply..." : "Add a comment..."}
                    className={cn(
                      "w-full bg-muted/50 rounded-[12px] py-3 px-4 text-[10px] outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-blue-600 dark:text-silver-100 placeholder:text-blue-500/50 dark:placeholder:text-silver-500",
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
                    <Send className="h-[10px] w-[10px]" />
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
                <div className="text-center py-2 rounded-[10px]">
                  <MessageSquareOff className="h-6 w-6 text-foreground/5 mx-auto mb-2" />
                  <p className="text-[6px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">No comments yet</p>
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
    </motion.div>
  );
};

export default PostCard;

interface CommentItemProps {
  comment: PostComment;
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
    <div className={cn("flex flex-col gap-3", depth > 0 && "ml-6 pl-4")}>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex gap-3 group/comment"
      >
        <img 
          src={comment.userAvatar || getPlaceholderImage(`user-${comment.userId}`)} 
          className="w-[38px] h-[38px] rounded-full flex-shrink-0 object-cover shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
          alt={`${comment.userName}'s avatar`} 
          onClick={(e) => onProfileClick(e, comment.userId)}
          role="button"
          tabIndex={0}
        />
        <div className="flex-1">
          <div className="bg-muted/50 rounded-[12px] p-3 relative group-hover/comment:bg-foreground/[0.07] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <h5 
                  className="text-[8px] font-bold text-blue-600 dark:text-silver-100 uppercase tracking-tight cursor-pointer hover:text-blue-400 hover:underline inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                  onClick={(e) => onProfileClick(e, comment.userId)}
                  role="button"
                  tabIndex={0}
                >
                  {comment.userName}
                </h5>
                {comment.username && (
                  <span className="text-[6px] text-blue-500/70 dark:text-silver-400 font-bold uppercase tracking-widest">
                    {comment.username.startsWith('@') ? comment.username : `@${comment.username}`}
                  </span>
                )}
              </div>
              <span className="text-[6px] text-blue-500/50 dark:text-silver-500 font-bold uppercase tracking-widest">
                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[9px] text-blue-600/70 dark:text-silver-300 leading-relaxed">{renderContent(comment.content)}</p>
            
            {/* Actions Bar */}
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => onReply(comment.id)}
                className="text-[6px] font-bold text-blue-500/50 hover:text-blue-500 uppercase tracking-widest transition-colors"
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
                        className={`flex items-center gap-2 rounded-full px-2 py-1 text-[7px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-muted/50 text-muted-foreground/80 hover:text-foreground hover:bg-muted'}`}
                        aria-label={`${isActive ? 'Remove' : 'Add'} ${emoji} reaction`}
                      >
                        <span className="text-[8px]">{emoji}</span>
                        <span className="font-bold">{count}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setActiveReactionId(activeReactionId === comment.id ? null : comment.id)}
                    className={`w-[22px] h-[22px] flex items-center justify-center rounded-full transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeReactionId === comment.id ? 'text-blue-500 bg-muted' : 'text-muted-foreground/50 hover:text-blue-500'}`}
                    aria-label="Add reaction to comment"
                    aria-haspopup="true"
                  >
                    <Smile className="h-[14px] w-[14px]" />
                  </button>
                  <AnimatePresence>
                    {activeReactionId === comment.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-background p-2 rounded-full shadow-2xl z-20 backdrop-blur-xl"
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
