import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EllipsisVerticalIcon, BoltIcon, CheckCircleIcon, HeartIcon, ChatBubbleOvalLeftIcon, ArrowPathRoundedSquareIcon, ShareIcon, PaperAirplaneIcon, FaceSmileIcon, ChatBubbleLeftRightIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Post, PostComment } from '@/types';
import { MOCK_POSTS, MOCK_USER, MOCK_TRACKS, MOCK_ARTISTS, TON_LOGO, APP_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import PostOptionsModal from '@/components/PostOptionsModal';
import { motion, AnimatePresence } from 'motion/react'; 
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification, followedUserIds, toggleFollowUser, posts, allTracks, allNFTs, addCommentToPost } = useAudio();
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);

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

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  useEffect(() => {
    const foundPost = posts.find(p => p.id === id);
    if (foundPost) {
      setPost(foundPost);
      setLikesCount(foundPost.likes);
      // setComments(foundPost.commentList || []); // Now handled by onSnapshot
      setLiked(foundPost.isLiked || false);
      setReposted(foundPost.isReposted || false);
      setRepostsCount(foundPost.reposts || 0);
    }
  }, [id, posts]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] pt-4 px-4 flex flex-col items-center justify-center">
        <img src={APP_LOGO} className="w-12 h-12 object-contain animate-[spin_3s_linear_infinite] opacity-50 mb-4" alt="Loading..." />
        <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px]">Synchronizing Signal...</p>
      </div>
    );
  }

  const isFollowing = followedUserIds.includes(post.userId);
  const isMe = post.userId === MOCK_USER.uid;
  const track = post.trackId ? allTracks.find(t => t.id === post.trackId) : post.track;
  const nft = post.nftId ? allNFTs.find(n => n.id === post.nftId) : post.nft;
  const artist = MOCK_ARTISTS.find(a => a.name === post.userName || a.uid === post.userId);

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    
    const commentData: Partial<PostComment> = {
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    await addCommentToPost(id, commentData);
    setCommentText('');
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

  const handleCommentProfileClick = (e: React.MouseEvent, commentUserId: string) => {
    e.stopPropagation();
    if (commentUserId === MOCK_USER.uid) {
      navigate('/profile');
    } else if (MOCK_ARTISTS.some(a => a.uid === commentUserId)) {
      navigate(`/artist/${commentUserId}`);
    } else {
      navigate(`/user/${commentUserId}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addNotification('Signal link copied to buffer', 'success');
  };

  return (
    <div className="min-h-screen bg-background pb-4 px-4 md:px-4 relative overflow-x-hidden">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back Button */}
        {/* Removed back button as it is in the global header */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-border bg-card rounded-[10px] p-4 md:p-4 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow Removed */}

          {/* User Identity Section */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-shrink-0 cursor-pointer group/avatar" onClick={() => artist ? navigate(`/artist/${artist.uid}`) : post.userId === MOCK_USER.uid ? navigate('/profile') : navigate(`/user/${post.userId}`)}>
              <img src={post.userAvatar} className="w-10 h-10 rounded-full group-hover/avatar:opacity-90 transition-all object-cover" alt={post.userName} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-1">
                <h4 
                  className="font-bold text-sm text-white truncate cursor-pointer hover:underline inline-block"
                  onClick={() => artist ? navigate(`/artist/${artist.uid}`) : post.userId === MOCK_USER.uid ? navigate('/profile') : navigate(`/user/${post.userId}`)}
                > 
                  {post.userName} 
                </h4>
                {artist?.verified && <CheckCircleIcon className="h-3 w-3 text-blue-400" />}
              </div>
              <span className="text-[12px] text-white/50 truncate">@{post.username || post.userName.toLowerCase().replace(/\s+/g, '')}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isMe && (
                <button 
                  onClick={() => toggleFollowUser(post.userId)} 
                  className={`text-[10px] font-bold transition-all px-3 py-1 rounded-full ${isFollowing ? 'border border-white/20 text-white hover:bg-white/10' : 'bg-white text-black hover:bg-white/90'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button onClick={() => setShowOptions(true)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-all rounded-full hover:bg-white/10">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <p className="text-white/90 leading-snug mb-3 text-[15px] whitespace-pre-wrap">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
              {post.imageUrl.startsWith('data:video') ? (
                <video src={post.imageUrl} controls className="w-full max-h-[300px] object-cover" />
              ) : (
                <img src={post.imageUrl} className="w-full max-h-[300px] object-cover" alt="Post media" />
              )}
            </div>
          )}

          {track && (
            <div className="mb-3">
              <TrackCard track={track} variant="compact" />
            </div>
          )}

          {nft && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
              <img src={nft.imageUrl} alt={nft.title} className="w-full aspect-square object-cover" />
              <div className="p-3 bg-white/5">
                <h4 className="font-bold text-sm text-white">{nft.title}</h4>
                <p className="text-[10px] text-white/50">{nft.edition}</p>
              </div>
            </div>
          )}

          {/* Timestamp and Views */}
          <div className="flex items-center gap-2 text-[11px] text-white/50 mb-3">
            <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>·</span>
            <span>{new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span className="font-bold text-white">{(Math.random() * 10000).toFixed(0)}</span> Views
          </div>

          <div className="h-px bg-white/10 w-full mb-1"></div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 py-2 text-[12px] text-white/50">
            <div className="flex gap-3">
              <span className="font-bold text-white">{repostsCount}</span> <ArrowPathRoundedSquareIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-white">{Math.floor(repostsCount * 0.3)}</span> <ChatBubbleOvalLeftIcon className="h-4 w-4 text-white" />
            </div>
            <button onClick={handleLike} className={`flex gap-1 items-center transition-all ${liked ? 'text-pink-500' : 'text-white/50 hover:text-pink-500'}`}>
              <span className="font-bold text-white">{likesCount}</span> <HeartIcon className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            <div className="flex gap-1">
              <span className="font-bold text-white">{Math.floor(likesCount * 0.1)}</span> <BookmarkIcon className="h-4 w-4 text-white" />
            </div>
            <button onClick={handleShare} className="flex gap-1 items-center text-white/50 hover:text-white transition-all">
              <ShareIcon className="h-4 w-4 text-white" />
            </button>
          </div>

          <div className="h-px bg-white/10 w-full mb-3"></div>

          {/* Comments Section */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Neural Responses</h3>
            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <img 
                src={MOCK_USER.avatar} 
                className="w-8 h-8 rounded-full shadow-lg cursor-pointer hover:opacity-80 transition-opacity" 
                alt="" 
                onClick={() => navigate('/profile')}
              />
              <div className="flex-1 relative">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Transmit response..." className="w-full bg-white/5 border border-white/10 rounded-[8px] py-2 px-3 text-xs outline-none focus:border-white/30 transition-all text-white shadow-inner" />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-white rounded-[6px] text-black hover:bg-white/90 transition-colors">
                  <PaperAirplaneIcon className="h-3 w-3" />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {comments.slice(0, visibleCommentsCount).map(comment => (
                  <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={comment.id} className="flex gap-3 group/comment">
                    <img 
                      src={comment.userAvatar} 
                      className="w-8 h-8 rounded-full flex-shrink-0 shadow-lg object-cover cursor-pointer" 
                      alt="" 
                      onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 
                          className="text-[10px] font-bold text-white uppercase tracking-tight cursor-pointer hover:text-blue-400 hover:underline inline-block"
                          onClick={(e) => handleCommentProfileClick(e, comment.userId)}
                        >
                          {comment.userName}
                        </h5>
                        <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{comment.timestamp}</span>
                      </div>
                      <p className="text-[12px] text-white/70 leading-snug mb-2">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        {/* Existing Reactions */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(comment.reactions || {}).map(([emoji, count]) => {
                            const isActive = comment.userReactions?.includes(emoji);
                            return (
                              <button 
                                key={emoji} 
                                onClick={() => handleCommentReaction(comment.id, emoji)} 
                                className={`flex items-center gap-2 rounded-full px-2 py-1 text-[9px] transition-all ${isActive ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Reaction Picker Trigger */}
                        <div className="relative group/picker">
                          <button className="w-6 h-6 flex items-center justify-center rounded-full text-white/30 hover:text-white transition-all hover:bg-white/10">
                            <FaceSmileIcon className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/picker:flex items-center gap-2 bg-[#1a1a1a] border border-white/10 p-2 rounded-full shadow-xl z-20 backdrop-blur-xl">
                            {REACTION_EMOJIS.map(emoji => {
                              const isActive = comment.userReactions?.includes(emoji);
                              return (
                                <button 
                                  key={emoji} 
                                  onClick={() => handleCommentReaction(comment.id, emoji)} 
                                  className={`w-6 h-6 flex items-center justify-center rounded-full transition-all text-[10px] hover:scale-110 ${isActive ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70'}`}
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
              {comments.length > visibleCommentsCount && (
                <button 
                  onClick={() => setVisibleCommentsCount(prev => prev + 5)}
                  className="w-full py-2 text-[10px] font-bold text-white/50 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  Show More
                </button>
              )}
              {comments.length === 0 && (
                <div className="text-center py-3 rounded-[8px]">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white/5 mx-auto mb-2" />
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">No neural signals</p>
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
 