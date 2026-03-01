import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Zap, CheckCircle2, Heart, MessageCircle, Repeat2, Share2, Send, Smile, MessageSquareOff } from 'lucide-react';
import { Post, Comment } from '@/types';
import { MOCK_POSTS, MOCK_USER, MOCK_TRACKS, MOCK_ARTISTS, TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import PostOptionsModal from '@/components/PostOptionsModal';
import { motion, AnimatePresence } from 'motion/react'; 
const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, followedUserIds, toggleFollowUser } = useAudio();
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  useEffect(() => {
    const foundPost = MOCK_POSTS.find(p => p.id === id);
    if (foundPost) {
      setPost(foundPost);
      setLikesCount(foundPost.likes);
      setComments(foundPost.commentList || []);
    }
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-6 flex flex-col items-center justify-center">
        <img src={APP_LOGO} className="w-12 h-12 object-contain animate-[spin_3s_linear_infinite] opacity-50 mb-4" alt="Loading..." />
        <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px]">Synchronizing Signal...</p>
      </div>
    );
  }

  const isFollowing = followedUserIds.includes(post.userId);
  const isMe = post.userId === MOCK_USER.id;
  const track = post.trackId ? MOCK_TRACKS.find(t => t.id === post.trackId) : null;
  const artist = MOCK_ARTISTS.find(a => a.name === post.userName);

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleRepost = () => {
    if (reposted) {
      setRepostsCount(prev => prev - 1);
    } else {
      setRepostsCount(prev => prev + 1);
    }
    setReposted(!reposted);
  };

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addNotification('Signal link copied to buffer', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a2a] to-black pt-24 pb-32 px-4 md:px-12 relative overflow-x-hidden">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Return to Feed</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-blue-500/10 bg-[#080808] rounded-[10px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="absolute top-8 right-8 z-10">
            <button onClick={() => setShowOptions(true)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-blue-400 transition-all rounded-full hover:bg-white/5">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* User Identity Section */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative flex-shrink-0 cursor-pointer group/avatar" onClick={() => artist ? navigate(`/artist/${artist.id}`) : post.userId === MOCK_USER.id ? navigate('/profile') : null}>
              <img src={post.userAvatar} className="w-16 h-16 rounded-full group-hover/avatar:-blue-500 transition-all object-cover shadow-2xl" alt={post.userName} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full -black flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)]">
                <Zap className="h-3 w-3 text-white fill-current" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-lg text-white uppercase tracking-tight truncate"> {post.userName} </h4>
                {artist?.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                {!isMe && (
                  <button onClick={() => toggleFollowUser(post.userId)} className={`text-[9px] font-bold uppercase tracking-widest transition-all px-3 py-1 rounded-full ${isFollowing ? 'text-blue-500 -blue-500/20 bg-blue-500/5' : 'text-white/40 hover:text-blue-400 hover:-blue-400/20 bg-white/5'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold"> {post.timestamp} </span>
                <div className="w-1 h-1 rounded-full bg-blue-500/20"></div>
                <span className="text-[8px] text-blue-500/40 uppercase font-bold tracking-widest">Neural Sync Active</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-white/90 leading-relaxed mb-10 text-lg font-medium -l -blue-500/20 pl-8">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mb-10 rounded-[10px] overflow-hidden shadow-2xl">
              {post.imageUrl.startsWith('data:video') ? (
                <video src={post.imageUrl} controls className="w-full max-h-[600px] object-cover" />
              ) : (
                <img src={post.imageUrl} className="w-full max-h-[600px] object-cover" alt="Post media" />
              )}
            </div>
          )}

          {track && (
            <div className="mb-10 p-6 rounded-[10px] glass border border-blue-500/10 bg-white/[0.02] relative group/track overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/track:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.3em]">Sonic Attachment Detected</span>
                  <div className="px-2 py-0.5 bg-blue-500/10 -blue-500/20 rounded text-[7px] font-bold text-blue-400 uppercase tracking-widest">Alpha Signal</div>
                </div>
                <TrackCard track={track} variant="row" />
                {track.isNFT && (
                  <div className="mt-8 pt-8 -t flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[10px] bg-blue-500/10 flex items-center justify-center -blue-500/20">
                        <img src={TON_LOGO} className="w-6 h-6" alt="TON" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Current Price</p>
                        <p className="text-xl font-bold text-white uppercase tracking-tighter">{track.price || '15.0'} TON</p>
                      </div>
                    </div>
                    <button onClick={() => addNotification('Neural transaction initiated...', 'info')} className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-[10px] shadow-2xl shadow-blue-600/20 transition-all active:scale-95">
                      Buy NFT Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center gap-12 pt-8 -t mb-12">
            <button onClick={handleLike} className={`flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 group/like ${liked ? 'text-red-500' : 'text-white/20 hover:text-red-400'}`}>
              <div className="relative">
                {liked && <div className="absolute inset-0 bg-red-500/40 blur-md rounded-full animate-ping"></div>}
                <Heart className={`h-5 w-5 relative z-10 group-hover/like:scale-110 transition-transform ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{likesCount}</span>
            </button>
            <div className="flex items-center gap-4 text-blue-400">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{comments.length}</span>
            </div>
            <button onClick={handleRepost} className={`flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 ${reposted ? 'text-green-500' : 'text-white/20 hover:text-green-400'}`}>
              <Repeat2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{repostsCount}</span>
            </button>
            <div className="flex-1 flex justify-end">
              <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center text-white/10 hover:text-blue-500 transition-all active:scale-90 rounded-full hover:bg-white/5">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-8">Neural Responses</h3>
            <form onSubmit={handleAddComment} className="flex gap-6 mb-12">
              <img src={MOCK_USER.avatar} className="w-10 h-10 rounded-full shadow-xl" alt="" />
              <div className="flex-1 relative">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Transmit your response..." className="w-full bg-white/5 rounded-[10px] py-3 px-6 text-sm outline-none focus:-blue-500/50 transition-all text-white shadow-inner" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-blue-600 rounded-[10px] text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>

            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {comments.map(comment => (
                  <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={comment.id} className="flex gap-6 group/comment">
                    <img src={comment.userAvatar} className="w-10 h-10 rounded-full flex-shrink-0 shadow-lg object-cover" alt="" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-tight">{comment.userName}</h5>
                        <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{comment.timestamp}</span>
                      </div>
                      <p className="text-[13px] text-white/70 leading-relaxed mb-4">{comment.content}</p>
                      <div className="flex items-center gap-3">
                        {/* Existing Reactions */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                            const isActive = comment.userReactions?.includes(emoji);
                            return (
                              <button 
                                key={emoji} 
                                onClick={() => handleCommentReaction(comment.id, emoji)} 
                                className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40 hover:text-blue-400'}`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Reaction Picker Trigger */}
                        <div className="relative group/picker">
                          <button className="w-8 h-8 flex items-center justify-center rounded-full text-white/10 hover:text-blue-500 transition-all hover:bg-white/5">
                            <Smile className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/picker:flex items-center gap-1 bg-[#1a1a1a] border border-white/10 p-1.5 rounded-full shadow-xl z-20 backdrop-blur-xl">
                            {REACTION_EMOJIS.map(emoji => {
                              const isActive = comment.userReactions?.includes(emoji);
                              return (
                                <button 
                                  key={emoji} 
                                  onClick={() => handleCommentReaction(comment.id, emoji)} 
                                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all text-sm hover:scale-110 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-white/80'}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <div className="text-center py-12 -dashed rounded-[10px]">
                  <MessageSquareOff className="h-8 w-8 text-white/5 mx-auto mb-4" />
                  <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">No neural signals detected</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Post Options Modal */}
      {showOptions && (
        <PostOptionsModal post={post} isOwner={isMe} onClose={() => setShowOptions(false)} onDelete={() => navigate(-1)} />
      )}
    </div>
  );
};

export default PostDetail;
 