import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Share2, 
  Bookmark, 
  Pin, 
  Check, 
  Play, 
  Pause, 
  ExternalLink,
  MoreHorizontal,
  Send,
  Flag,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Post, Reply } from '../types';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { addComment, reportPost } from '@/services/socialService';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onBookmark: (id: string) => void;
  onVote: (postId: string, optionIndex: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onRepost,
  onBookmark,
  onVote
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay, addNotification, userProfile } = useAudio();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localReplies, setLocalReplies] = useState<Reply[]>(post.replies || []);
  const [firestoreReplies, setFirestoreReplies] = useState<Reply[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Real-time listener querying 'comments' collection in Firestore by post ID
  useEffect(() => {
    if (!showComments || !post.id) return;

    setIsLoadingComments(true);

    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', post.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Reply[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let ts = 'Just now';
          if (data.createdAt?.toDate) {
            ts = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (data.timestamp) {
            ts = typeof data.timestamp === 'string' && data.timestamp.includes('T')
              ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : String(data.timestamp);
          }

          return {
            id: docSnap.id,
            postId: post.id,
            user: {
              id: data.userId || 'anon',
              name: data.userName || data.authorName || 'Jammer',
              username: data.username || (data.userName ? `@${data.userName.toLowerCase().replace(/\s+/g, '')}` : '@jammer'),
              avatar: data.userAvatar || data.authorPhoto || data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              isVerified: !!data.isVerified,
              contributionPoints: data.contributionPoints || 50,
              badges: data.badges || [],
              role: data.role || 'fan'
            },
            content: data.content || data.text || '',
            timestamp: ts,
            likes: data.likes || 0
          };
        });

        setFirestoreReplies(fetched);
        setIsLoadingComments(false);
      },
      (error) => {
        console.error('[PostCard] Error querying comments collection:', error);
        handleFirestoreError(error, OperationType.LIST, 'comments');
        setIsLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, [post.id, showComments]);

  // Unified replies combining seed props, local submissions, and Firestore queries
  const allReplies = useMemo(() => {
    const map = new Map<string, Reply>();
    if (post.replies) {
      post.replies.forEach((r) => map.set(r.id, r));
    }
    localReplies.forEach((r) => map.set(r.id, r));
    firestoreReplies.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [post.replies, localReplies, firestoreReplies]);

  const handleReport = async () => {
    setShowMoreMenu(false);
    setIsReported(true);
    try {
      await reportPost(post.id, currentUserId || 'current-user');
      toast.success('Post Flagged for Review', {
        description: 'This post has been reported and flagged for our moderation team.',
      });
      addNotification('Post flagged for review. Thank you for keeping JamSpace safe.', 'success');
    } catch (err) {
      console.error('[PostCard] Failed to report post:', err);
      setIsReported(false);
      toast.error('Failed to flag post. Please try again.');
      addNotification('Failed to report post', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://tonjam.audio/post/${post.id}`);
      addNotification('Link copied to clipboard!', 'success');
    } else {
      addNotification('Shared signal simulated', 'success');
    }
  };

  const handlePlayAttachment = (att: any) => {
    const playItem = new Track();
    playItem.id = att.id || 'att-song';
    playItem.songId = att.id || 'att-song';
    playItem.title = att.title || 'Attached Track';
    playItem.artist = att.artist || post.user.name;
    playItem.coverUrl = post.user.avatar; // fallback to user avatar
    playItem.audioUrl = att.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    playItem.duration = 180;
    playItem.isNFT = att.type === 'nft';
    playItem.genre = post.category;
    
    playTrack(playItem);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const textToSubmit = commentText.trim();
    const replyId = `r-${Date.now()}`;
    const authorName = userProfile?.name || 'You (Jammer)';
    const authorAvatar = userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const newReply: Reply = {
      id: replyId,
      postId: post.id,
      user: {
        id: currentUserId,
        name: authorName,
        username: '@you',
        avatar: authorAvatar,
        isVerified: true,
        contributionPoints: 120,
        badges: ['⚡ Active Composer'],
        role: 'fan'
      },
      content: textToSubmit,
      timestamp: 'Just now',
      likes: 0
    };

    setLocalReplies((prev) => [...prev, newReply]);
    setCommentText('');
    addNotification('Comment posted', 'success');

    try {
      await addComment(post.id, currentUserId, authorName, textToSubmit, authorAvatar);
    } catch (err) {
      console.error("[PostCard] Failed to persist comment in Firestore:", err);
    }
  };

  const renderAttachments = () => {
    if (!post.attachments || post.attachments.length === 0) return null;

    return (
      <div className="space-y-2.5 mt-3.5">
        {post.attachments.map((att, idx) => {
          if (att.type === 'track') {
            const isThisTrackPlaying = currentTrack?.id === att.id && isPlaying;
            return (
              <div 
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl transition-colors border-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative group shrink-0">
                    <img 
                      src={post.user.avatar} 
                      alt="Cover" 
                      className="w-11 h-11 rounded-lg object-cover" 
                    />
                    <button
                      onClick={() => isThisTrackPlaying ? togglePlay() : handlePlayAttachment(att)}
                      aria-label={isThisTrackPlaying ? 'Pause track' : 'Play track'}
                      className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    >
                      {isThisTrackPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white fill-current" />}
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-semibold text-white truncate">{att.title}</h5>
                    <p className="text-[11px] text-zinc-400 font-medium truncate">{att.artist || post.user.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => isThisTrackPlaying ? togglePlay() : handlePlayAttachment(att)}
                  aria-label={isThisTrackPlaying ? 'Pause track' : 'Play track'}
                  className="p-2.5 bg-[#00B4D8]/15 text-[#00B4D8] hover:bg-[#00B4D8] hover:text-black rounded-lg transition-colors cursor-pointer border-none"
                >
                  {isThisTrackPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
            );
          }

          if (att.type === 'nft') {
            return (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row items-stretch bg-white/[0.03] hover:bg-white/[0.05] rounded-xl overflow-hidden border-none transition-colors"
              >
                <img 
                  src={att.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'} 
                  alt="NFT Graphic"
                  className="w-full sm:w-28 h-28 object-cover shrink-0"
                />
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold inline-block">
                      TON MUSIC NFT
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">{att.title}</h5>
                    <p className="text-xs text-zinc-400 font-medium">{att.artist}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">PRICE</span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">{att.price}</span>
                    </div>

                    <a
                      href={att.url ? '#/marketplace' : '#'}
                      className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#00B4D8] text-black hover:bg-[#00B4D8]/90 rounded-lg flex items-center gap-1.5 border-none transition-colors"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          }

          if (att.type === 'image') {
            return (
              <img 
                key={idx}
                src={att.url} 
                alt="Post Media" 
                className="w-full max-h-[360px] object-cover rounded-xl mt-2 border-none"
              />
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderPoll = () => {
    if (!post.poll) return null;

    const hasVoted = post.poll.votedIndex !== undefined;

    return (
      <div className="bg-white/[0.03] rounded-xl p-4 mt-3.5 space-y-2.5 border-none">
        <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{post.poll.question}</h5>
        <div className="space-y-2 pt-1">
          {post.poll.options.map((opt, oIdx) => {
            const pct = post.poll!.totalVotes > 0 ? Math.round((opt.votes / post.poll!.totalVotes) * 100) : 0;
            const isUserChoice = post.poll!.votedIndex === oIdx;

            return (
              <button
                key={oIdx}
                disabled={hasVoted}
                onClick={() => onVote(post.id, oIdx)}
                className="relative w-full overflow-hidden p-3 bg-white/[0.04] rounded-lg text-left hover:bg-white/[0.07] cursor-pointer disabled:cursor-default disabled:hover:bg-white/[0.04] flex justify-between items-center group border-none transition-colors"
              >
                {/* Simulated progress filler */}
                {hasVoted && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-[#00B4D8]/20 z-0"
                  />
                )}

                <div className="relative z-10 flex items-center gap-2 font-semibold text-xs text-white">
                  {hasVoted && isUserChoice && <Check className="w-4 h-4 text-[#00B4D8] stroke-[3px]" />}
                  <span className={isUserChoice ? 'text-[#00B4D8] font-bold' : ''}>{opt.text}</span>
                </div>

                {hasVoted && (
                  <span className="relative z-10 text-xs font-mono font-bold text-zinc-400">
                    {pct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] font-mono text-zinc-400 flex justify-between pt-1">
          <span>{post.poll.totalVotes.toLocaleString()} Votes</span>
          {hasVoted && <span>Poll Locked</span>}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`jamspace-post-card bg-white/[0.025] hover:bg-white/[0.04] p-4 sm:p-5 rounded-2xl text-white flex flex-col relative transition-colors duration-200 border-none ${isReported ? 'opacity-70' : 'opacity-100'}`}
    >
      {/* Header with Pinned info */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-[#00B4D8] text-[10px] font-extrabold uppercase tracking-widest mb-3 pb-2.5">
          <Pin className="w-3.5 h-3.5 fill-current" />
          <span>Pinned Announcement</span>
        </div>
      )}

      {/* User Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img 
            src={post.user.avatar} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full object-cover shrink-0 select-none"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <span className="text-sm sm:text-[15px] font-semibold text-white tracking-tight hover:underline cursor-pointer truncate max-w-[160px] sm:max-w-none">
                {post.user.name}
              </span>
              {post.user.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#00B4D8] text-black flex items-center justify-center text-[8px] font-extrabold select-none shrink-0" title="Verified Creator">
                  ✓
                </span>
              )}
              {post.user.role === 'artist' && (
                <span className="text-[9px] font-mono font-bold bg-[#00B4D8]/15 text-[#00B4D8] px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                  ARTIST
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium truncate mt-0.5">
              <span className="truncate max-w-[120px] sm:max-w-none">{post.user.username}</span>
              <span className="text-zinc-600 shrink-0">•</span>
              <span className="shrink-0 text-zinc-400">{post.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isReported && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full select-none"
            >
              <Flag className="w-2.5 h-2.5 fill-amber-400/30" />
              <span className="hidden xs:inline">Reported</span>
            </motion.span>
          )}

          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              aria-label="More options"
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-full cursor-pointer transition-colors hover:bg-white/[0.06] border-none"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-9 z-20 w-40 bg-[#151C2A] rounded-xl shadow-2xl py-1.5 overflow-hidden border-none"
                >
                  {isReported ? (
                    <div className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400/80 font-medium select-none">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reported</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleReport}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-medium border-none bg-transparent"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report Post</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Text */}
      <p className="text-sm sm:text-[15px] text-zinc-100 mt-3 whitespace-pre-wrap leading-relaxed font-sans font-normal break-words">
        {post.content}
      </p>

      {/* Dynamic attachments */}
      {renderAttachments()}

      {/* Poll */}
      {renderPoll()}

      {/* Bottom action toolbar */}
      <div className="flex items-center justify-between mt-4 pt-2.5 text-zinc-400 gap-2 select-none">
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => onLike(post.id)}
            aria-label={post.isLiked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold ${
              post.isLiked ? 'text-red-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes}</span>
          </button>

          {/* 'View Replies' button that expands nested comments from Firestore */}
          <button 
            onClick={() => setShowComments(!showComments)}
            aria-label={showComments ? 'Hide replies' : 'View replies'}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white border-none"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span className="hidden xs:inline">{showComments ? 'Hide' : 'Replies'}</span>
            <span className="xs:hidden">💬</span>
            {allReplies.length > 0 && (
              <span className="text-[11px] font-mono font-medium text-zinc-400">
                ({allReplies.length})
              </span>
            )}
            {showComments ? (
              <ChevronUp className="w-3 h-3 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            )}
          </button>

          <button 
            onClick={() => onRepost(post.id)}
            aria-label={post.isReposted ? 'Undo repost' : 'Repost'}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold ${
              post.isReposted ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            <Repeat2 className="w-4 h-4" />
            <span>{post.reposts}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleShare}
            aria-label="Share post"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.04] text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer border-none"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onBookmark(post.id)}
            aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer border-none ${
              post.isBookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Nested comments list directly below the post card */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 pt-2 space-y-3"
          >
            {isLoadingComments && allReplies.length === 0 ? (
              <div className="flex items-center justify-center py-4 text-xs text-zinc-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#00B4D8]" />
                <span>Loading replies...</span>
              </div>
            ) : allReplies.length === 0 ? (
              <div className="text-center py-3 text-xs text-zinc-500 font-medium">
                No replies yet. Be the first to leave a comment!
              </div>
            ) : (
              <div className="space-y-2 pb-1">
                {allReplies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5 sm:gap-3 bg-white/[0.03] p-3 rounded-xl border-none">
                    <img 
                      src={reply.user.avatar} 
                      alt={reply.user.name} 
                      className="w-8 h-8 rounded-full object-cover shrink-0 select-none" 
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        <span className="text-xs font-semibold text-white truncate">{reply.user.name}</span>
                        {reply.user.isVerified && (
                          <span className="w-3 h-3 rounded-full bg-[#00B4D8] text-black flex items-center justify-center text-[7px] font-extrabold select-none shrink-0">
                            ✓
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-medium shrink-0">{reply.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-normal font-sans leading-relaxed break-words">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={submitComment} className="flex gap-2 pt-1">
              <input 
                type="text" 
                placeholder="Write a reply..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white/[0.04] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.07] transition-all border-none"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                title="Post comment"
                aria-label="Post comment"
                className="w-8 h-8 bg-[#00B4D8] hover:bg-[#00B4D8]/90 disabled:opacity-40 text-black rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 border-none shadow-md shadow-[#00B4D8]/20"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
