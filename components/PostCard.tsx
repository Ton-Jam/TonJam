import React, { useState } from 'react';
import { Post } from '../types';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_USER } from '../constants';
import TrackCard from './TrackCard';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import PostOptionsModal from './PostOptionsModal';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { addNotification, followedUserIds, toggleFollowUser } = useAudio();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [repostsCount, setRepostsCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{
    id: string, 
    user: string, 
    avatar: string, 
    text: string, 
    time: string,
    reactions: Record<string, number>
  }[]>([]);
  
  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];
  const isFollowing = followedUserIds.includes(post.userId);
  const isMe = post.userId === MOCK_USER.id;

  const track = post.trackId ? MOCK_TRACKS.find(t => t.id === post.trackId) : null;
  const artist = MOCK_ARTISTS.find(a => a.name === post.userName);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reposted) {
      setRepostsCount(prev => prev - 1);
    } else {
      setRepostsCount(prev => prev + 1);
    }
    setReposted(!reposted);
  };

  const handleProfileClick = () => {
    if (artist) {
      navigate(`/artist/${artist.id}`);
    } else if (post.userId === MOCK_USER.id) {
      navigate('/profile');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://tonjam.app/post/${post.id}`);
    addNotification('Signal link copied to buffer', 'success');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      user: MOCK_USER.name,
      avatar: MOCK_USER.avatar,
      text: commentText,
      time: 'Just now',
      reactions: {}
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    addNotification('Comment synchronized', 'success');
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const newReactions = { ...c.reactions };
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return { ...c, reactions: newReactions };
      }
      return c;
    }));
  };

  return (
    <div className="bg-[#050505] rounded-[2rem] p-8 border border-white/5 hover:border-white/10 transition-all group relative animate-in fade-in duration-500 shadow-2xl overflow-hidden">
      
      {/* Top Right Options - Naked icon (no backdrop) */}
      <div className="absolute top-8 right-8 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowOptions(true); }}
          className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-blue-400 transition-all bg-transparent"
        >
          <i className="fas fa-ellipsis-v text-xs"></i>
        </button>
      </div>

      <div className="flex flex-col">
        {/* User Identity Section */}
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="relative flex-shrink-0 cursor-pointer group/avatar"
            onClick={handleProfileClick}
          >
            <img 
              src={post.userAvatar} 
              className="w-12 h-12 rounded-full border-2 border-white/5 group-hover/avatar:border-blue-500 transition-all object-cover shadow-xl" 
              alt={post.userName} 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
               <i className="fas fa-bolt text-[6px] text-white"></i>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 
                onClick={handleProfileClick}
                className="font-black text-sm text-white uppercase tracking-tight truncate hover:text-blue-400 transition-colors cursor-pointer"
              >
                {post.userName}
              </h4>
              {artist?.verified && <i className="fas fa-check-circle text-blue-500 text-[10px]"></i>}
              {!isMe && (
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFollowUser(post.userId); }}
                  className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isFollowing ? 'text-blue-500' : 'text-white/20 hover:text-blue-400'}`}
                >
                  {isFollowing ? '• Following' : '• Follow'}
                </button>
              )}
            </div>
            <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">
              {post.timestamp}
            </span>
          </div>
        </div>
        
        <p className="text-white/80 leading-relaxed mb-6 text-[13px] font-medium border-l-2 border-white/5 pl-5">
          {post.content}
        </p>

        {track && (
          <div className="mb-6 scale-[0.98] hover:scale-100 transition-transform origin-left">
            <TrackCard track={track} variant="row" />
          </div>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center gap-10 pt-5 border-t border-white/5">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-3 transition-all transform active:scale-90 ${liked ? 'text-red-500' : 'text-white/20 hover:text-red-400'}`}
          >
            <i className={`${liked ? 'fas' : 'far'} fa-heart text-sm`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{likesCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-3 transition-all active:scale-90 ${showComments ? 'text-blue-400' : 'text-white/20 hover:text-blue-400'}`}
          >
            <i className={`${showComments ? 'fas' : 'far'} fa-comment text-sm`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{post.comments + comments.length}</span>
          </button>
          
          <button 
            onClick={handleRepost}
            className={`flex items-center gap-3 transition-all transform active:scale-90 ${reposted ? 'text-green-500' : 'text-white/20 hover:text-green-400'}`}
          >
            <i className="fas fa-retweet text-sm"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{repostsCount}</span>
          </button>

          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-blue-500 transition-all active:scale-90"
            >
              <i className="fas fa-share-nodes text-sm"></i>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
              <img src={MOCK_USER.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs outline-none focus:border-blue-500/50 transition-all text-white"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-white transition-colors"
                >
                  <i className="fas fa-paper-plane text-[10px]"></i>
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4 animate-in fade-in duration-300 group/comment">
                  <img src={comment.avatar} className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-[10px] font-black text-white uppercase">{comment.user}</h5>
                      <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">{comment.time}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed mb-2">{comment.text}</p>
                    
                    <div className="flex items-center gap-2">
                      {/* Existing Reactions */}
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(comment.reactions).map(([emoji, count]) => (
                          <div 
                            key={emoji}
                            className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[8px] text-white/40"
                          >
                            <span>{emoji}</span>
                            <span className="font-black">{count}</span>
                          </div>
                        ))}
                      </div>

                      {/* Reaction Picker Trigger */}
                      <div className="relative group/picker">
                        <button className="text-[8px] font-black text-white/10 hover:text-blue-500 uppercase tracking-widest transition-colors">
                          + React
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/picker:flex items-center gap-1 bg-[#0a0a0a] border border-white/10 p-1 rounded-lg shadow-2xl z-20">
                          {REACTION_EMOJIS.map(emoji => (
                            <button 
                              key={emoji}
                              onClick={() => handleCommentReaction(comment.id, emoji)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-xs"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {post.comments > 0 && comments.length === 0 && (
                <p className="text-center py-4 text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
                  Load {post.comments} previous comments...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Options Modal */}
      {showOptions && (
        <PostOptionsModal 
          post={post} 
          isOwner={post.userId === MOCK_USER.id}
          onClose={() => setShowOptions(false)} 
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default PostCard;