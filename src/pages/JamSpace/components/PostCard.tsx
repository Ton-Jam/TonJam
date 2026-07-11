import React, { useState } from 'react';
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
  ArrowUpRight, 
  ExternalLink,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react';
import { Post, Reply } from '../types';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';

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
  const { playTrack, currentTrack, isPlaying, togglePlay, addNotification } = useAudio();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localReplies, setLocalReplies] = useState<Reply[]>(post.replies || []);

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

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newReply: Reply = {
      id: `r-${Date.now()}`,
      postId: post.id,
      user: {
        id: currentUserId,
        name: 'You (Jammer)',
        username: '@you',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
        contributionPoints: 120,
        badges: ['⚡ Active Composer'],
        role: 'fan'
      },
      content: commentText,
      timestamp: 'Just now',
      likes: 0
    };

    setLocalReplies([...localReplies, newReply]);
    setCommentText('');
    addNotification('Comment posted', 'success');
  };

  const renderAttachments = () => {
    if (!post.attachments || post.attachments.length === 0) return null;

    return (
      <div className="space-y-2 mt-3">
        {post.attachments.map((att, idx) => {
          if (att.type === 'track') {
            const isThisTrackPlaying = currentTrack?.id === att.id && isPlaying;
            return (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-950/40 border border-white/[0.02] rounded-[10px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative group shrink-0">
                    <img 
                      src={post.user.avatar} 
                      alt="Cover" 
                      className="w-10 h-10 rounded-[10px] object-cover" 
                    />
                    <button
                      onClick={() => isThisTrackPlaying ? togglePlay() : handlePlayAttachment(att)}
                      className="absolute inset-0 bg-slate-950/60 rounded-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    >
                      {isThisTrackPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{att.title}</h5>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{att.artist || post.user.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => isThisTrackPlaying ? togglePlay() : handlePlayAttachment(att)}
                  className="p-2 bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF] hover:text-white rounded-[10px] transition-colors cursor-pointer"
                >
                  {isThisTrackPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            );
          }

          if (att.type === 'nft') {
            return (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row items-stretch border border-white/[0.03] bg-slate-950/50 rounded-[10px] overflow-hidden"
              >
                <img 
                  src={att.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'} 
                  alt="NFT Graphic"
                  className="w-full sm:w-28 h-28 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase bg-purple-600/15 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-extrabold">
                      TON MUSIC NFT
                    </span>
                    <h5 className="text-sm font-bold text-white tracking-tight leading-snug">{att.title}</h5>
                    <p className="text-xs text-slate-400 font-medium">{att.artist}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.02]">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">PRICE</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">{att.price}</span>
                    </div>

                    <a
                      href={att.url ? '#/marketplace' : '#'}
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#0052FF] text-white hover:bg-[#0052FF]/90 rounded-[10px] flex items-center gap-1"
                    >
                      <span>Vibe Drop</span>
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
                className="w-full max-h-[300px] object-cover rounded-[10px] border border-white/[0.03] mt-2"
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
      <div className="bg-slate-950/40 border border-white/[0.02] rounded-[10px] p-4 mt-3 space-y-2">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{post.poll.question}</h5>
        <div className="space-y-2 pt-1">
          {post.poll.options.map((opt, oIdx) => {
            const pct = post.poll!.totalVotes > 0 ? Math.round((opt.votes / post.poll!.totalVotes) * 100) : 0;
            const isUserChoice = post.poll!.votedIndex === oIdx;

            return (
              <button
                key={oIdx}
                disabled={hasVoted}
                onClick={() => onVote(post.id, oIdx)}
                className="relative w-full overflow-hidden p-3 bg-slate-900 border border-white/[0.02] rounded-[10px] text-left hover:bg-slate-800/50 cursor-pointer disabled:cursor-default disabled:hover:bg-slate-900 flex justify-between items-center group"
              >
                {/* Simulated progress filler */}
                {hasVoted && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-[#0052FF]/10 z-0"
                  />
                )}

                <div className="relative z-10 flex items-center gap-2 font-semibold text-xs text-white">
                  {hasVoted && isUserChoice && <Check className="w-4 h-4 text-[#0052FF] stroke-[3px]" />}
                  <span className={isUserChoice ? 'text-[#0052FF] font-bold' : ''}>{opt.text}</span>
                </div>

                {hasVoted && (
                  <span className="relative z-10 text-xs font-mono font-bold text-slate-400">
                    {pct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] font-mono text-slate-500 flex justify-between">
          <span>{post.poll.totalVotes.toLocaleString()} Votes</span>
          {hasVoted && <span>Poll Locked</span>}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-slate-900 border ${post.isPinned ? 'border-[#0052FF]/30' : 'border-white/[0.03]'} rounded-[10px] p-4 text-white flex flex-col`}
    >
      {/* Header with Pinned info */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-[#0052FF] text-[10px] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-white/[0.02]">
          <Pin className="w-3.5 h-3.5 fill-current" />
          <span>Pinned Announcement</span>
        </div>
      )}

      {/* User Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.user.avatar} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight hover:underline cursor-pointer">
                {post.user.name}
              </span>
              {post.user.isVerified && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[8px] font-bold select-none">
                  ✓
                </span>
              )}
              {post.user.role === 'artist' && (
                <span className="text-[9px] font-mono font-bold bg-slate-950 text-[#0052FF] px-1.5 py-0.5 rounded border border-[#0052FF]/20">
                  ARTIST
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{post.user.username}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>

        <button className="text-slate-500 hover:text-white p-1 rounded-full cursor-pointer transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Text */}
      <p className="text-sm text-slate-200 mt-3 whitespace-pre-wrap leading-relaxed font-sans font-medium">
        {post.content}
      </p>

      {/* Dynamic attachments */}
      {renderAttachments()}

      {/* Poll */}
      {renderPoll()}

      {/* Bottom action toolbar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.03] text-slate-400">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:text-red-500 cursor-pointer ${post.isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs font-bold transition-all hover:text-white cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{localReplies.length}</span>
        </button>

        <button 
          onClick={() => onRepost(post.id)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:text-emerald-500 cursor-pointer ${post.isReposted ? 'text-emerald-500' : ''}`}
        >
          <Repeat2 className="w-4.5 h-4.5" />
          <span>{post.reposts}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold transition-all hover:text-indigo-400 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button 
          onClick={() => onBookmark(post.id)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all hover:text-amber-500 cursor-pointer ${post.isBookmarked ? 'text-amber-500' : ''}`}
        >
          <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Inline replies container */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 pt-3 border-t border-white/[0.02]"
          >
            <div className="space-y-3 pb-3">
              {localReplies.map((reply) => (
                <div key={reply.id} className="flex gap-3 bg-slate-950/20 p-3 rounded-[10px] border border-white/[0.01]">
                  <img 
                    src={reply.user.avatar} 
                    alt={reply.user.name} 
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{reply.user.name}</span>
                      {reply.user.isVerified && <span className="w-3 h-3 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[7px] font-bold select-none">✓</span>}
                      <span className="text-[10px] text-slate-500 font-medium ml-1">{reply.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium font-sans leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Write a comment..." 
                value={commentText}
                onChange={(e) => setCommentCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/5 rounded-[10px] px-3 py-2 text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#0052FF] transition-colors"
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-[#0052FF] text-white text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer"
              >
                Post
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Helper inside form to compile comments properly
  function setCommentCommentText(val: string) {
    setCommentText(val);
  }
};
