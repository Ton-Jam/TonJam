import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '../types';
import { useAudio } from '../context/AudioContext';
import { MOCK_USER } from '../constants';

interface TrackCardProps {
  track: Track;
  variant?: 'large' | 'small' | 'row';
  showReorder?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, variant = 'large', showReorder = false }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, setOptionsTrack, likedTrackIds, toggleLikeTrack, activePlaylistId, reorderTrackInPlaylist, addNotification } = useAudio();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{
    id: string, 
    user: string, 
    avatar: string, 
    text: string, 
    time: string,
    reactions: Record<string, number>
  }[]>([
    { id: '1', user: 'CryptoPioneer', avatar: 'https://picsum.photos/40/40?random=1', text: 'This drop is insane! 🔥', time: '2h ago', reactions: { '🔥': 12, '🚀': 5 } },
    { id: '2', user: 'SynthFan99', avatar: 'https://picsum.photos/40/40?random=2', text: 'Need this on repeat 24/7.', time: '1h ago', reactions: { '🎧': 8 } }
  ]);

  const REACTION_EMOJIS = ['🔥', '💎', '🚀', '🎧', '⚡'];
  const isActive = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.includes(track.id);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${track.artistId}`);
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  const handleReorder = (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (activePlaylistId) {
      reorderTrackInPlaylist(activePlaylistId, track.id, direction);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (variant === 'row') {
    return (
      <div 
        onClick={() => playTrack(track)}
        className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] group transition-all cursor-pointer border border-transparent hover:border-white/5 ${isActive ? 'bg-blue-600/5 border-blue-500/20' : ''}`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <img src={track.coverUrl} className="w-full h-full object-cover rounded-xl border border-white/5" alt={track.title} />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl ${isActive ? 'opacity-100' : ''}`}>
            {isActive && isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite]"></div>
                <div className="w-0.5 bg-blue-500 animate-[bounce_0.8s_infinite]"></div>
                <div className="w-0.5 bg-blue-500 animate-[bounce_0.5s_infinite]"></div>
              </div>
            ) : (
              <i className="fas fa-play text-white text-[10px]"></i>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-[10px] font-black uppercase truncate leading-none tracking-tight mb-1.5 ${isActive ? 'text-blue-400' : 'text-white/80 group-hover:text-white'}`}>{track.title}</h4>
          <div className="flex items-center gap-2">
            <p 
              onClick={handleArtistClick} 
              className={`text-[8px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors inline-block ${isActive ? 'text-blue-400/60' : 'text-white/20'}`}
            >
              {track.artist}
            </p>
            {track.artistVerified && <i className="fas fa-check-circle text-blue-500 text-[6px]"></i>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLikeClick}
            className={`w-8 h-8 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 rounded-full hover:bg-white/5 ${isLiked ? 'text-red-500' : 'text-white/10 hover:text-white'}`}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-[10px]`}></i>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div 
        onClick={() => playTrack(track)}
        className="group relative bg-transparent rounded-2xl p-2 transition-all border border-transparent hover:bg-white/[0.02] hover:border-white/5 cursor-pointer w-full flex flex-col"
      >
        <div className="relative aspect-square mb-3 overflow-hidden rounded-xl border border-white/5">
          <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out" alt={track.title} />
          <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isActive ? 'opacity-100' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-[8px]`}></i>
            </div>
          </div>
        </div>
        <div className="px-1 flex flex-col gap-0.5">
          <h3 className={`font-black truncate text-[9px] uppercase tracking-tight leading-tight ${isActive ? 'text-blue-400' : 'text-white/80'}`}>
            {track.title}
          </h3>
          <p className="text-[7px] font-black truncate uppercase tracking-widest text-white/20">
            {track.artist}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => playTrack(track)}
      className="group relative bg-[#080808] rounded-[2rem] p-4 transition-all border border-white/5 hover:border-blue-500/20 cursor-pointer w-full flex flex-col shadow-2xl overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-all"></div>
      
      <div className="relative aspect-square mb-5 overflow-hidden rounded-2xl border border-white/10 shadow-xl">
        <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] ease-out" alt={track.title} />
        <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isActive ? 'opacity-100' : ''}`}>
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-white/20 transform group-hover:scale-110 transition-transform duration-500">
            <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-base`}></i>
          </div>
          
          {/* Hover Reveal Info */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-center gap-2">
              <i className="fas fa-headphones text-[10px] text-blue-400"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{track.playCount?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-[10px] text-white/40"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatDuration(track.duration)}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-500 z-20">
          <button 
            onClick={handleLikeClick}
            className={`w-9 h-9 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center transform hover:scale-110 active:scale-95 border border-white/10 ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-[11px]`}></i>
          </button>
          <button 
            onClick={handleCommentClick}
            className="w-9 h-9 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center transform hover:scale-110 active:scale-95 border border-white/10 text-white/60 hover:text-white"
          >
            <i className="far fa-comment text-[11px]"></i>
          </button>
        </div>
        
        <button 
          onClick={handleOptionsClick}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 border border-white/10 z-20 translate-x-[10px] group-hover:translate-x-0 duration-500"
        >
          <i className="fas fa-ellipsis-v text-[11px] text-white/60 hover:text-white"></i>
        </button>
      </div>
      
      <div className="px-1 flex flex-col gap-1 pb-2">
        <h3 className={`font-black truncate text-xs uppercase tracking-tight leading-tight ${isActive ? 'text-blue-400' : 'text-white'}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-2">
          <p 
            onClick={handleArtistClick} 
            className={`text-[9px] font-black truncate uppercase tracking-[0.2em] hover:text-blue-400 transition-colors w-fit ${isActive ? 'text-blue-400/60' : 'text-white/20'}`}
          >
            {track.artist}
          </p>
          {track.artistVerified && <i className="fas fa-check-circle text-blue-500 text-[8px]"></i>}
        </div>
      </div>

      {showComments && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComments(false)}></div>
          <div className="relative glass w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <img src={track.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter text-white leading-none mb-1">{track.title}</h3>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{track.artist}</p>
                </div>
              </div>
              <button onClick={() => setShowComments(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

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

            <div className="space-y-6 mb-2 max-h-80 overflow-y-auto no-scrollbar">
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
              {comments.length === 0 && (
                <p className="text-center py-8 text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
                  No signals detected in this sector.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackCard;