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
  const [comments, setComments] = useState<any[]>([]);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];

  const isFollowing = followedUserIds.includes(post.userId);
  const isMe = post.userId === MOCK_USER.id;

  const track = post.trackId
    ? MOCK_TRACKS.find(t => t.id === post.trackId)
    : null;

  const artist = MOCK_ARTISTS.find(a => a.name === post.userName);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => !prev);
    setLikesCount(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReposted(prev => !prev);
    setRepostsCount(prev => (reposted ? prev - 1 : prev + 1));
  };

  const handleProfileClick = () => {
    if (artist) navigate(`/artist/${artist.id}`);
    else if (isMe) navigate('/profile');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `https://tonjam.app/post/${post.id}`
    );
    addNotification('Signal link copied', 'success');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: MOCK_USER.name,
      avatar: MOCK_USER.avatar,
      text: commentText,
      reactions: {}
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleCommentReaction = (commentId: string, emoji: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              reactions: {
                ...c.reactions,
                [emoji]: (c.reactions[emoji] || 0) + 1
              }
            }
          : c
      )
    );
  };

  return (
    <div className="bg-[#050505] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all relative">

      {/* Options Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(true);
          }}
          className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-blue-400 transition"
        >
          <i className="fas fa-ellipsis-v text-xs"></i>
        </button>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="relative cursor-pointer"
          onClick={handleProfileClick}
        >
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-12 h-12 rounded-full border border-white/10 object-cover shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
            <i className="fas fa-bolt text-[6px] text-white"></i>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-white font-semibold">
            {post.userName}
          </h3>
          <p className="text-white/40 text-xs">
            {post.timestamp}
          </p>
        </div>

        {!isMe && (
          <button
            onClick={() => toggleFollowUser(post.userId)}
            className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-white/90 mb-6 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Track */}
      {track && (
        <div className="mb-6">
          <TrackCard track={track} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">

        <div className="flex gap-6">

          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition ${
              liked ? 'text-red-500' : 'text-white/40'
            }`}
          >
            <i className="fas fa-heart"></i>
            {likesCount}
          </button>

          <button
            onClick={handleRepost}
            className={`flex items-center gap-2 text-sm transition ${
              reposted ? 'text-green-400' : 'text-white/40'
            }`}
          >
            <i className="fas fa-retweet"></i>
            {repostsCount}
          </button>

          <button
            onClick={() => setShowComments(prev => !prev)}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-blue-400 transition"
          >
            <i className="fas fa-comment"></i>
            {comments.length}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-blue-400 transition"
          >
            <i className="fas fa-share"></i>
          </button>

        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-6 border-t border-white/5 pt-4 space-y-4">

          <form onSubmit={handleAddComment} className="flex gap-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Transmit reply..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white"
            >
              Send
            </button>
          </form>

          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.avatar}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
              <div className="flex-1">
                <p className="text-xs text-white/80">
                  <span className="font-semibold">
                    {comment.user}
                  </span>{' '}
                  {comment.text}
                </p>

                <div className="flex gap-2 mt-2">
                  {REACTION_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() =>
                        handleCommentReaction(comment.id, emoji)
                      }
                      className="text-xs text-white/40 hover:text-white transition"
                    >
                      {emoji}{' '}
                      {comment.reactions[emoji] || ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showOptions && (
        <PostOptionsModal
          post={post}
          onClose={() => setShowOptions(false)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default PostCard;
