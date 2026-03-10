import React, { useState, useMemo } from 'react';
import { Check, MoreHorizontal, Play, Pause, Plus, Heart, MessageCircle, Repeat2, Share, Smile, Send, MessageSquareOff, X } from 'lucide-react';
import { Post, Comment } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import PostOptionsModal from '@/components/PostOptionsModal';
import { MOCK_TRACKS, MOCK_USER, MOCK_ARTISTS } from '@/constants';
import { AnimatePresence, motion } from 'motion/react';

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

  return (
    <div className="bg-transparent border-b border-white/5 hover:bg-white/[0.02] py-6 px-4 transition-all group relative">
      <div className="flex gap-4">
        {/* Author Avatar */}
        <div 
          className="flex-shrink-0 cursor-pointer outline-none" 
          onClick={handleProfileClick}
          onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View ${post.userName}'s profile`}
        >
          <div className="relative">
            <img src={post.userAvatar} alt="" className="w-12 h-12 rounded-full object-cover border border-[#050505]" />
            {post.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-[#050505]" aria-label="Verified user">
                <Check className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div 
              className="cursor-pointer outline-none" 
              onClick={handleProfileClick}
              onKeyDown={(e) => handleKeyDown(e, () => handleProfileClick(e as any))}
              role="button"
              tabIndex={0}
              aria-label={`View ${post.userName}'s profile`}
            >
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-tight hover:text-blue-400 hover:underline transition-colors inline-block">{post.userName}</h4>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{post.timestamp}</span>
              </div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{userHandle}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isOwnPost && (
                <button 
                  onClick={handleFollow} 
                  className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                  aria-label={isFollowing ? `Unfollow ${post.userName}` : `Follow ${post.userName}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button 
                onClick={() => setShowOptions(true)} 
                className="text-white/20 hover:text-white transition-colors p-1"
                aria-label="Post options"
                aria-haspopup="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Post Text */}
          <p className="text-white/80 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Media Content */}
          {post.imageUrl && (
            <div 
              className="rounded-[10px] overflow-hidden mb-4 bg-white/5 cursor-zoom-in outline-none" 
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
            <div className="rounded-[10px] overflow-hidden mb-4 bg-white/5 relative aspect-video">
              <video src={post.video} className="w-full h-full object-cover" aria-label="Post video" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button 
                  className="w-16 h-16 rounded-full bg-blue-600/80 flex items-center justify-center text-white text-xl hover:bg-blue-500 transition-all"
                  aria-label="Play video"
                >
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </button>
              </div>
            </div>
          )}

          {track && (
            <div 
              className="bg-white/5 rounded-[10px] p-4 mb-4 flex items-center gap-4 group/track cursor-pointer hover:bg-white/10 transition-all outline-none" 
              onClick={handlePlayTrack}
              onKeyDown={(e) => handleKeyDown(e, () => handlePlayTrack(e as any))}
              role="button"
              tabIndex={0}
              aria-label={`Play track: ${track.title} by ${track.artist}`}
            >
              <div className="relative w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0">
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="h-4 w-4 text-white fill-current" />
                  ) : (
                    <Play className="h-4 w-4 text-white fill-current" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[10px] font-bold text-white uppercase truncate">{track.title}</h5>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Streaming Now</p>
                  <p className="text-[10px] font-bold text-white uppercase">{(track.streams || track.playCount || 0).toLocaleString()}</p>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  aria-label="Add track to library"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {nft && (
            <div 
              className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[10px] p-4 mb-4 flex items-center gap-4 group/nft cursor-pointer hover:from-blue-600/20 hover:to-purple-600/20 transition-all outline-none" 
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
                    <Check className="h-2 w-2 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[7px] font-bold text-blue-400 uppercase tracking-[0.3em]">Sonic Artifact Acquired</span>
                </div>
                <h5 className="text-xs font-bold text-white uppercase truncate tracking-tight">{nft.title}</h5>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Creator: {nft.creator}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Valuation</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-sm font-bold text-white tracking-tighter">{nft.price}</span>
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
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} /> <span>{likesCount}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${showComments ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
                aria-label={showComments ? "Hide comments" : "Show comments"}
                aria-expanded={showComments}
              >
                <MessageCircle className={`h-4 w-4 ${showComments ? 'fill-current' : ''}`} /> <span>{comments.length}</span>
              </button>
              <button 
                onClick={handleRepost} 
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isReposted ? 'text-green-500' : 'text-white/40 hover:text-white'}`}
                aria-label={isReposted ? "Remove repost" : "Repost post"}
              >
                <Repeat2 className="h-4 w-4" /> <span>{repostsCount}</span>
              </button>
              
              {/* Reaction Picker */}
              <div className="relative">
                <button 
                  onClick={() => setShowReactions(!showReactions)}
                  className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-blue-400 uppercase tracking-widest transition-all"
                  aria-label="Add reaction"
                  aria-expanded={showReactions}
                  aria-haspopup="true"
                >
                  <Smile className="h-4 w-4" />
                </button>
                {showReactions && (
                  <div 
                    className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-[#1a1a1a] border border-white/10 p-1.5 rounded-full shadow-2xl z-[100] backdrop-blur-xl animate-in fade-in zoom-in duration-200"
                    role="menu"
                    aria-label="Reaction emojis"
                  >
                    {REACTION_EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => handleReaction(emoji)} 
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-sm hover:scale-110 hover:bg-white/10 text-white/80"
                        aria-label={`React with ${emoji}`}
                        role="menuitem"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              className="text-white/40 hover:text-white transition-all"
              aria-label="Share post"
            >
              <Share className="h-4 w-4" />
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
            className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
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
                  className="w-full bg-white/5 rounded-[10px] py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-white/20"
                  aria-label="Write a comment"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-600 rounded-[8px] text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
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
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-md cursor-pointer outline-none" 
                      alt={`${comment.userName}'s avatar`} 
                      onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleCommentProfileClick(e as any, comment.userId))}
                      role="button"
                      tabIndex={0}
                    />
                    <div className="flex-1">
                      <div className="bg-white/5 rounded-[10px] p-3 relative group-hover/comment:bg-white/[0.07] transition-colors border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <h5 
                            className="text-[10px] font-bold text-white uppercase tracking-tight cursor-pointer hover:text-blue-400 hover:underline inline-block outline-none"
                            onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleCommentProfileClick(e as any, comment.userId))}
                            role="button"
                            tabIndex={0}
                          >
                            {comment.userName}
                          </h5>
                          <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{comment.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed">{comment.content}</p>
                        
                        {/* Reactions */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                              const isActive = comment.userReactions?.includes(emoji);
                              return (
                                <button 
                                  key={emoji} 
                                  onClick={() => handleCommentReaction(comment.id, emoji)} 
                                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40 hover:text-blue-400 border border-transparent'}`}
                                  aria-label={`${isActive ? 'Remove' : 'Add'} ${emoji} reaction`}
                                >
                                  <span>{emoji}</span>
                                  <span className="font-bold">{count}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="relative group/picker opacity-0 group-hover/comment:opacity-100 transition-opacity">
                            <button 
                              className="w-6 h-6 flex items-center justify-center rounded-full text-white/10 hover:text-blue-500 transition-all hover:bg-white/5"
                              aria-label="Add reaction to comment"
                              aria-haspopup="true"
                            >
                              <Smile className="h-3 w-3" />
                            </button>
                            <div 
                              className="absolute bottom-full left-0 mb-1 hidden group-hover/picker:flex items-center gap-1 bg-[#1a1a1a] border border-white/10 p-1 rounded-full shadow-xl z-20 backdrop-blur-xl"
                              role="menu"
                            >
                              {REACTION_EMOJIS.map(emoji => {
                                const isActive = comment.userReactions?.includes(emoji);
                                return (
                                  <button 
                                    key={emoji} 
                                    onClick={() => handleCommentReaction(comment.id, emoji)} 
                                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-all text-xs hover:scale-110 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-white/80'}`}
                                    aria-label={`React with ${emoji}`}
                                    role="menuitem"
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/5 rounded-[10px]">
                  <MessageSquareOff className="h-6 w-6 text-white/5 mx-auto mb-2" />
                  <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">No comments yet</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
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
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
              onClick={() => setExpandedImage(null)}
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;
