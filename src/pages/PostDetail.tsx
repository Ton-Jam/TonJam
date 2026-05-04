import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  Clock,
  ExternalLink,
  Trash2,
  Flag,
  UserPlus,
  Eye,
  Bookmark
} from 'lucide-react';
import { Post, PostComment } from '@/types';
import { MOCK_USER, MOCK_ARTISTS, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import { motion, AnimatePresence } from 'motion/react'; 
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { cn, getPlaceholderImage, shareContent } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    addNotification, 
    followedUserIds, 
    toggleFollowUser, 
    posts, 
    allTracks, 
    allNFTs, 
    addCommentToPost,
    toggleLikePost,
    updatePost,
    userProfile
  } = useAudio();
  
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);

  // Real-time comments listener
  useEffect(() => {
    if (!id) return;

    const commentsRef = collection(db, 'posts', id, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment));
      setComments(fetchedComments);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `posts/${id}/comments`));

    return () => unsubscribe();
  }, [id]);

  // Real-time liked listener
  useEffect(() => {
    if (!id || !userProfile.uid || !auth.currentUser) return;

    const likeRef = doc(db, 'posts', id, 'likes', userProfile.uid);
    const unsubscribe = onSnapshot(likeRef, (snapshot) => {
      setLiked(snapshot.exists());
    }, (error) => handleFirestoreError(error, OperationType.GET, `posts/${id}/likes/${userProfile.uid}`));

    return () => unsubscribe();
  }, [id, userProfile.uid]);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  useEffect(() => {
    const foundPost = posts.find(p => p.id === id);
    if (foundPost) {
      setPost(foundPost);
      setLikesCount(foundPost.likes || 0);
      setLiked(foundPost.isLiked || false);
      setReposted(foundPost.isReposted || false);
      setRepostsCount(foundPost.reposts || 0);
    }
  }, [id, posts]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <img src={APP_LOGO} className="w-16 h-16 object-contain animate-[spin_5s_linear_infinite] opacity-50" alt="Loading..." />
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
        </div>
        <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] mt-8 animate-pulse">Syncing Signal Architecture...</p>
      </div>
    );
  }

  const isFollowing = followedUserIds.includes(post.userId);
  const isMe = post.userId === userProfile.uid;
  const track = post.trackId ? allTracks.find(t => t.id === post.trackId) : post.track;
  const nft = post.nftId ? allNFTs.find(n => n.id === post.nftId) : post.nft;
  const artist = MOCK_ARTISTS.find(a => a.name === post.userName || a.uid === post.userId);

  const handleLike = async () => {
    if (id) {
      await toggleLikePost(id);
    }
  };

  const handleRepost = async () => {
    if (!id) return;
    setIsReposting(true);
    const newIsReposted = !reposted;
    const newRepostsCount = newIsReposted ? repostsCount + 1 : repostsCount - 1;
    
    try {
      await updatePost(id, {
        isReposted: newIsReposted,
        reposts: newRepostsCount
      });
      setReposted(newIsReposted);
      setRepostsCount(newRepostsCount);
      addNotification(newIsReposted ? "Signal amplified" : "Repost echo removed", "success");
    } finally {
      setIsReposting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    
    const commentData: Partial<PostComment> = {
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    try {
      await addCommentToPost(id, commentData);
      setCommentText('');
      addNotification("Comment signal transmitted", "success");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    // This logic relies on Context + Firestore updates
    // For now we'll just handle local state if needed but better to sync with DB
    // Since we're using onSnapshot, DB update will trigger re-render
  };

  const handleShare = async () => {
    const result = await shareContent({
      title: `TON JAM Signal by ${post.userName}`,
      text: post.content,
      url: window.location.href,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification('Signal link copied to local buffer', 'success');
      }
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
            className="text-blue-500 hover:text-blue-400 font-bold italic transition-colors cursor-pointer"
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
      <div className="min-h-screen bg-background pb-24">
        {/* Header Navigation */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/[0.05] h-14 flex items-center px-4 gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-zinc-500 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] italic">Signal Thread</h1>
            <span className="text-[10px] text-blue-500/50 font-black uppercase tracking-widest leading-none">Sector-Log View</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto py-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Author Section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar 
                  className="h-12 w-12 border border-white/5 cursor-pointer ring-offset-background hover:ring-2 ring-blue-500/20 transition-all"
                  onClick={() => navigate(isMe ? '/profile' : `/user/${post.userId}`)}
                >
                  <AvatarImage src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} className="object-cover" />
                  <AvatarFallback className="bg-zinc-800 font-bold text-lg">{post.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 
                      className="text-sm font-black uppercase italic tracking-tighter text-foreground hover:text-blue-500 transition-colors cursor-pointer"
                      onClick={() => navigate(isMe ? '/profile' : `/user/${post.userId}`)}
                    >
                      {post.userName}
                    </h3>
                    {post.isVerified && (
                      <Badge variant="secondary" className="h-4 px-1 bg-blue-500/10 text-blue-400 border-none">
                        <Zap className="h-2.5 w-2.5 fill-current" />
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest opacity-40">
                    @{post.username || post.userName.toLowerCase().replace(/\s+/g, '')}
                  </span>
                </div>
              </div>

              {!isMe && (
                <Button 
                  onClick={() => toggleFollowUser(post.userId)} 
                  variant={isFollowing ? "outline" : "default"}
                  className={cn(
                    "rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-[0.15em]",
                    isFollowing ? "border-white/10 text-zinc-400 hover:bg-white/5" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                  )}
                >
                  {isFollowing ? 'Synchronized' : 'Sync User'}
                </Button>
              )}
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <p className="text-xl font-bold leading-relaxed tracking-tight text-foreground/90 whitespace-pre-wrap">
                {renderContentWithHashtags(post.content)}
              </p>

              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
                  <img src={post.imageUrl} alt="" className="w-full h-auto object-cover max-h-[600px] group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {track && (
                <div className="py-2">
                  <TrackCard track={track} />
                </div>
              )}

              {nft && (
                <div 
                  className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden group hover:bg-white/[0.06] transition-all cursor-pointer"
                  onClick={() => navigate(`/nft/${nft.id}`)}
                >
                  <img src={nft.imageUrl} alt={nft.title} className="w-full aspect-square object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase italic tracking-tighter text-blue-400">{nft.title}</h4>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">{nft.edition}</p>
                    </div>
                    <Badge variant="outline" className="border-blue-500/20 text-blue-500 h-6 px-3 rounded-full uppercase text-[9px] font-black">Collectible</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest opacity-60">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                <span className="mx-1">·</span>
                {new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Eye className="h-3 w-3" />
                <span className="text-foreground">{(Math.random() * 10000).toFixed(0)}</span>
                <span className="opacity-60">Scans</span>
              </div>
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Stats Summary */}
            <div className="flex items-center gap-6 py-2">
              <div className="flex items-center gap-1.5 group cursor-pointer">
                <span className="text-sm font-black italic text-foreground group-hover:text-emerald-500 transition-colors">{repostsCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-emerald-500/50 transition-colors">Echos</span>
              </div>
              <div className="flex items-center gap-1.5 group cursor-pointer">
                <span className="text-sm font-black italic text-foreground group-hover:text-blue-500 transition-colors">{comments.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-blue-500/50 transition-colors">Responses</span>
              </div>
              <div className="flex items-center gap-1.5 group cursor-pointer">
                <span className="text-sm font-black italic text-foreground group-hover:text-rose-500 transition-colors">{likesCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-rose-500/50 transition-colors">Resonances</span>
              </div>
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Interactive Actions Bar */}
            <div className="flex items-center justify-around py-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-blue-600/10 hover:text-blue-500 text-zinc-500"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Connect Response</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-10 w-10 rounded-full transition-all text-zinc-500",
                      reposted ? "text-emerald-500 bg-emerald-500/10" : "hover:bg-emerald-600/10 hover:text-emerald-500"
                    )}
                    onClick={handleRepost}
                    disabled={isReposting}
                  >
                    <Repeat2 className={cn("h-5 w-5", isReposting && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Amplify Signal</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-10 w-10 rounded-full transition-all text-zinc-500",
                      liked ? "text-rose-500 bg-rose-500/10" : "hover:bg-rose-600/10 hover:text-rose-500"
                    )}
                    onClick={handleLike}
                  >
                    <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Trigger Resonance</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-amber-600/10 hover:text-amber-500 text-zinc-500"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Vault Signal</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:bg-blue-600/10 hover:text-blue-500 text-zinc-500"
                    onClick={handleShare}
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-[10px] font-black uppercase tracking-widest border-white/5">Distribute Relay</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-500 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/5 rounded-2xl w-48">
                  <DropdownMenuItem className="gap-3 rounded-xl focus:bg-blue-600 focus:text-white" onClick={handleShare}>
                    <Share className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Relay Link</span>
                  </DropdownMenuItem>
                  {!isMe && (
                    <DropdownMenuItem className="gap-3 rounded-xl focus:bg-red-600 focus:text-white text-red-500">
                      <Flag className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Report Signal</span>
                    </DropdownMenuItem>
                  )}
                  {isMe && (
                    <>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem className="gap-3 rounded-xl focus:bg-red-600 focus:text-white text-red-500" onClick={() => navigate(-1)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Delete Log</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Separator className="bg-white/[0.05]" />

            {/* Responses Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Neural Log: {comments.length} Signals</h3>
              
              <form onSubmit={handleAddComment} className="flex gap-4">
                <Avatar className="h-10 w-10 border border-white/5">
                  <AvatarImage src={userProfile.avatar || getPlaceholderImage(`user-${userProfile.uid}`)} className="object-cover" />
                  <AvatarFallback className="bg-zinc-800 font-bold">{userProfile.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder="Broadcast your response..." 
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl h-12 px-5 text-sm font-bold italic focus:ring-1 focus:ring-blue-500/30 transition-all outline-none placeholder:text-zinc-600" 
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <div className="space-y-0">
                {comments.map(comment => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      onReply={(id) => {}} // Could implement nested replies here too
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
                  <div className="py-20 flex flex-col items-center gap-4 text-center bg-white/[0.01] rounded-[32px] border border-dashed border-white/5">
                    <MessageSquareOff className="h-12 w-12 text-zinc-800" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Zero response signals detected</p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">Be the first to echo this sector</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PostDetail;

// Internal Comment Item for consistent design
interface CommentItemProps {
  comment: PostComment;
  onReply: (id: string) => void;
  onReaction: (id: string, emoji: string) => void;
  onProfileClick: (e: React.MouseEvent, userId: string) => void;
  activeReactionId: string | null;
  setActiveReactionId: (id: string | null) => void;
  renderContent: (text: string) => React.ReactNode;
  REACTION_EMOJIS: string[];
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onProfileClick, 
  activeReactionId, 
  setActiveReactionId,
  renderContent,
  REACTION_EMOJIS,
  onReaction
}) => {
  return (
    <div className="py-6 border-b border-white/[0.05] group/comment last:border-none">
      <div className="flex gap-4">
        <Avatar 
          className="h-10 w-10 shrink-0 border border-white/5 cursor-pointer ring-offset-background hover:ring-2 ring-blue-500/20 transition-all"
          onClick={(e) => onProfileClick(e, comment.userId)}
        >
          <AvatarImage src={comment.userAvatar || getPlaceholderImage(`user-${comment.userId}`)} className="object-cover" />
          <AvatarFallback className="bg-zinc-800 font-bold">{comment.userName[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span 
                className="text-xs font-black uppercase italic tracking-tighter text-blue-500 hover:text-blue-400 cursor-pointer"
                onClick={(e) => onProfileClick(e, comment.userId)}
              >
                {comment.userName}
              </span>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-60">
                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover/comment:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/5 rounded-xl">
                <DropdownMenuItem className="gap-2 rounded-lg text-xs font-bold uppercase tracking-widest">
                  <Flag className="h-3 w-3" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-sm font-bold leading-relaxed tracking-tight text-foreground/80">{renderContent(comment.content)}</p>
          
          <div className="flex items-center gap-4 mt-2">
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
                      "h-6 px-2 rounded-full gap-1.5 transition-all text-[9px] font-black",
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
                    className="absolute bottom-full left-0 mb-3 flex items-center gap-2 bg-zinc-900 border border-white/10 p-2 rounded-full shadow-2xl z-20 backdrop-blur-xl"
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
                            "h-8 w-8 rounded-full hover:scale-125 transition-all text-sm",
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
  );
};
