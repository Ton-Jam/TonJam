import React, { useState, useMemo, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Play, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  Smile, 
  Send, 
  MessageSquareOff, 
  X, 
  Zap, 
  ShoppingBag, 
  Award, 
  Radio, 
  ChevronRight,
  Clock,
  ExternalLink,
  Trash2,
  Flag,
  UserPlus,
  Search
} from 'lucide-react';
import { Post, PostComment } from '@/types';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_USER } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PostOptionsModal from './PostOptionsModal';

const ActivityIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case 'tip': return <Zap className="w-3.5 h-3.5 text-blue-500 fill-current" />;
    case 'nft_purchase': return <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />;
    case 'fan_club_join': return <Award className="w-3.5 h-3.5 text-amber-500" />;
    case 'track_release': return <Radio className="w-3.5 h-3.5 text-emerald-500" />;
    default: return <Zap className="w-3.5 h-3.5 text-blue-500" />;
  }
};

const PostCard: React.FC<{ post: Post; onDelete?: (id: string) => void }> = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { 
    togglePlay, 
    toggleFollowUser, 
    followedUserIds, 
    userProfile, 
    addNotification, 
    allNFTs, 
    updatePost, 
    addCommentToPost, 
    toggleLikePost 
  } = useAudio();
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [isReposting, setIsReposting] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const likesCount = post.likes || 0;
  const repostsCount = post.reposts || 0;
  const isActivity = post.type === 'activity';

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

    try {
      await addCommentToPost(post.id, commentData);
      setCommentText('');
      setReplyingToId(null);
      addNotification("Signal transmitted: Comment successfully bridged", "success");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikePost(post.id);
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReposting(true);
    const newIsReposted = !post.isReposted;
    const newRepostsCount = newIsReposted ? repostsCount + 1 : repostsCount - 1;
    
    try {
      await updatePost(post.id, {
        isReposted: newIsReposted,
        reposts: newRepostsCount
      });
      addNotification(newIsReposted ? "Signal amplified: Reposted to your feed" : "Repost echo removed", "success");
    } finally {
      setIsReposting(false);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.targetId) {
      if (post.type === 'nft_purchase') navigate(`/nft/${post.targetId}`);
      else if (post.type === 'track_release') navigate(`/track/${post.targetId}`);
      else navigate(`/artist/${post.targetId}`);
    }
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareContent({
      title: `TON JAM Signal by ${post.userName}`,
      text: post.content,
      url: `${window.location.origin}/post/${post.id}`,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification("Signal link copied to local buffer", "success");
      }
    }
  };

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track) {
      togglePlay();
    }
  };

  const userHandle = post.username || `@${(post.userName || 'user').toLowerCase().replace(/\s+/g, '')}`;

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
            className="text-blue-500 hover:text-blue-400 font-bold transition-colors cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ x: 4 }}
        className="w-full"
      >
        <Card 
          className={cn(
            "w-full border-none bg-background hover:bg-white/[0.01] transition-all cursor-pointer group/post relative rounded-none border-b border-white/[0.05]",
            isActivity && "bg-blue-500/[0.02]"
          )}
          onClick={() => navigate(`/post/${post.id}`)}
        >
        <CardHeader className="flex flex-row gap-4 p-4 pb-2">
          <Avatar 
            className="h-10 w-10 shrink-0 cursor-pointer ring-offset-background group-hover:ring-2 ring-blue-500/20 transition-all"
            onClick={handleProfileClick}
          >
            <AvatarImage src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} className="object-cover" />
            <AvatarFallback className="bg-zinc-800 font-bold">{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span 
                  className="text-sm font-black uppercase tracking-tighter text-foreground hover:text-blue-500 transition-colors"
                  onClick={handleProfileClick}
                >
                  {isActivity ? 'Automated Log' : post.userName}
                </span>
                {!isActivity && post.isVerified && (
                  <Badge variant="secondary" className="h-4 px-1 bg-blue-500/10 text-blue-400 border-none">
                    <Zap className="h-2.5 w-2.5 fill-current" />
                  </Badge>
                )}
                <span className="text-[10px] text-zinc-500 font-bold ml-1 opacity-60">·</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tight flex items-center gap-1 opacity-60">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isActivity && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); setShowOptionsModal(true); }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {showOptionsModal && (
                    <PostOptionsModal 
                      post={post} 
                      onClose={() => setShowOptionsModal(false)}
                      onDelete={onDelete}
                    />
                  )}
                </>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-40">
              {isActivity ? 'Sector A-12' : userHandle}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 pb-2">
          {isActivity ? (
            <div 
              className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between group/activity-box hover:bg-blue-600/10 transition-colors"
              onClick={handleActionClick}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rotate-45 flex items-center justify-center bg-blue-600/20 rounded-xl border border-blue-500/20 group-hover/activity-box:rotate-90 transition-transform duration-500">
                  <div className="-rotate-45 group-hover/activity-box:-rotate-90 transition-transform duration-500">
                    <ActivityIcon type={post.status} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold leading-relaxed text-foreground opacity-90 truncate max-w-[200px] sm:max-w-md uppercase tracking-tight">
                    <span className="text-blue-400 font-black">{post.userName}</span>
                    <span className="mx-1 opacity-60">·</span>
                    {post.content}
                    {post.artistName && (
                      <span className="text-blue-500 font-black ml-1 uppercase text-[9px] tracking-tight">{post.artistName}</span>
                    )}
                  </p>
                  {post.paymentAmount && (
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[7px] h-4 font-black uppercase px-2 rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5">
                        {post.paymentAmount} {post.paymentCurrency}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover/activity-box:text-blue-500 transition-colors" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] font-bold leading-relaxed tracking-tight text-foreground/90 whitespace-pre-wrap">
                {renderContentWithHashtags(post.content)}
              </p>

              {post.imageUrl && (
                <div 
                  className="rounded-2xl overflow-hidden border border-white/5 relative group/img cursor-zoom-in"
                  onClick={(e) => { e.stopPropagation(); setExpandedImage(post.imageUrl); }}
                >
                  <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-full gap-2">
                      <Search className="h-3 w-3" />
                      Expand
                    </Button>
                  </div>
                </div>
              )}

              {track && (
                <div 
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex items-center gap-4 hover:bg-white/[0.06] transition-all group/track"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/track/${track.id}`);
                  }}
                >
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-2xl shrink-0">
                    <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="h-full w-full object-cover group-hover/track:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-white fill-current animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[10px] font-black uppercase tracking-tighter text-blue-400 truncate">{track.title}</h5>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 truncate">{track.artist}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/10 group-hover/track:bg-blue-600 group-hover/track:text-white transition-all shadow-lg shadow-blue-600/20"
                    onClick={handlePlayTrack}
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-3 gap-2 rounded-xl hover:bg-transparent hover:text-blue-500 text-zinc-500 transition-all font-medium uppercase"
                  onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-[11px] font-medium text-zinc-400">{comments.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Connect Feedback</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-9 px-3 gap-2 rounded-xl transition-all font-medium uppercase text-zinc-500 bg-transparent hover:bg-transparent",
                    post.isReposted ? "text-emerald-500" : "hover:text-emerald-500"
                  )}
                  onClick={handleRepost}
                  disabled={isReposting}
                >
                  <Repeat2 className={cn("h-4 w-4", isReposting && "animate-spin")} />
                  <span className="text-[11px] font-medium text-zinc-400">{repostsCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Amplify Signal</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-9 px-3 gap-2 rounded-xl transition-all font-medium uppercase text-zinc-500 bg-transparent hover:bg-transparent",
                    isLiked ? "text-rose-500" : "hover:text-rose-500"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  <span className="text-[11px] font-medium text-zinc-400">{likesCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Neural Resonance</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-zinc-500 hover:bg-blue-600/10 hover:text-blue-500 transition-all"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Distribute Relay</TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 overflow-hidden bg-white/[0.01]"
              onClick={(e) => e.stopPropagation()}
            >
              <Separator className="mb-4 bg-white/[0.05]" />
              
              <form onSubmit={handleAddComment} className="flex gap-4 mb-6">
                <Avatar className="h-9 w-9 border border-white/5 ring-2 ring-blue-500/10 shrink-0">
                  <AvatarImage src={MOCK_USER.avatar} />
                  <AvatarFallback className="bg-zinc-800 font-bold">{MOCK_USER.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingToId ? "Synthesizing reply..." : "Broadcast feedback..."}
                    className="w-full bg-white border border-blue-500/40 rounded-2xl h-11 pl-4 pr-12 text-sm font-bold text-blue-600 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none placeholder:text-blue-500/50"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onReply={(id) => setReplyingToId(id)}
                    onReaction={handleCommentReaction}
                    onProfileClick={(e, uid) => {
                      e.stopPropagation();
                      if (uid === userProfile.uid) navigate('/profile');
                      else navigate(`/user/${uid}`);
                    }}
                    activeReactionId={activeReactionCommentId}
                    setActiveReactionId={setActiveReactionCommentId}
                    renderContent={renderContentWithHashtags}
                    REACTION_EMOJIS={REACTION_EMOJIS}
                  />
                ))}
                
                {comments.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-3 bg-white/[0.02] rounded-3xl border border-dashed border-white/5 text-center">
                    <MessageSquareOff className="h-8 w-8 text-zinc-700" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">No feedback identified in sector</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {expandedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 lg:p-10"
              onClick={() => setExpandedImage(null)}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-6 h-12 w-12 rounded-full hover:bg-white/10 text-white"
                onClick={() => setExpandedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={expandedImage}
                alt=""
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  </TooltipProvider>
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
    <div className={cn("flex flex-col gap-4", depth > 0 && "ml-10 border-l border-white/5 pl-4")}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 group/comment"
      >
        <Avatar 
          className="h-9 w-9 shrink-0 border border-white/5 cursor-pointer ring-offset-background hover:ring-2 ring-blue-500/20 transition-all"
          onClick={(e) => onProfileClick(e, comment.userId)}
        >
          <AvatarImage src={comment.userAvatar || getPlaceholderImage(`user-${comment.userId}`)} className="object-cover" />
          <AvatarFallback className="bg-zinc-800 font-bold">{comment.userName[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 shadow-sm group-hover/comment:bg-white/[0.05] transition-colors relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span 
                  className="text-xs font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 cursor-pointer"
                  onClick={(e) => onProfileClick(e, comment.userId)}
                >
                  {comment.userName}
                </span>
                {comment.username && (
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest opacity-40">
                    @{comment.username.replace('@', '')}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase opacity-40">
                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[13px] font-bold leading-relaxed tracking-tight text-foreground/80">{renderContent(comment.content)}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500"
                onClick={() => onReply(comment.id)}
              >
                Sync Reply
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                    const isActive = comment.userReactions?.includes(emoji);
                    return (
                      <Button 
                        key={emoji} 
                        variant="ghost"
                        size="sm"
                        onClick={() => onReaction(comment.id, emoji)} 
                        className={cn(
                          "h-6 px-2 rounded-full gap-1.5 transition-all text-[9px] font-medium",
                          isActive ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" : "bg-white/5 text-zinc-500"
                        )}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setActiveReactionId(activeReactionId === comment.id ? null : comment.id)}
                    className={cn(
                      "h-6 w-6 rounded-full transition-all shrink-0",
                      activeReactionId === comment.id ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" : "text-zinc-600 hover:text-blue-500"
                    )}
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </Button>
                  
                  <AnimatePresence>
                    {activeReactionId === comment.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-3 flex items-center gap-2 bg-zinc-900 border border-white/10 p-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 backdrop-blur-xl"
                      >
                        {REACTION_EMOJIS.map(emoji => {
                          const isActive = comment.userReactions?.includes(emoji);
                          return (
                            <Button 
                              key={emoji} 
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                onReaction(comment.id, emoji);
                                setActiveReactionId(null);
                              }} 
                              className={cn(
                                "h-8 w-8 rounded-full hover:scale-125 hover:bg-white/10 transition-all text-sm",
                                isActive && "bg-blue-600/20 text-blue-400"
                              )}
                            >
                              {emoji}
                            </Button>
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

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
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
