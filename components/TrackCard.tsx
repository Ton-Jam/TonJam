import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '../types';
import { useAudio } from '../context/AudioContext';

interface TrackCardProps {
  track: Track;
  variant?: 'large' | 'small' | 'row';
  showReorder?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, variant = 'large', showReorder = false }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, setOptionsTrack, likedTrackIds, toggleLikeTrack, activePlaylistId, reorderTrackInPlaylist } = useAudio();
  const [showComments, setShowComments] = useState(false);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (variant === 'row') {
    return (
      <div 
        onClick={() => playTrack(track)}
        className={`flex items-center gap-4 p-3 rounded-md hover:bg-white/5 group transition-all cursor-pointer border-b border-white/5 ${isActive ? 'bg-blue-600/10 border-blue-500/20' : ''}`}
      >
        <div className="relative w-14 h-14 flex-shrink-0">
          <img src={track.coverUrl} className="w-full h-full object-cover rounded-md border border-white/5" alt={track.title} />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md ${isActive ? 'opacity-100' : ''}`}>
            <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-[10px]`}></i>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-[10px] font-black uppercase truncate leading-none tracking-tight mb-1 italic ${isActive ? 'text-blue-400' : 'text-white'}`}>{track.title}</h4>
          <div className="flex items-center gap-1">
            <p 
              onClick={handleArtistClick} 
              className={`text-[8px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors italic inline-block ${isActive ? 'text-blue-400/60' : 'text-white/30'}`}
            >
              {track.artist}
            </p>
            {track.artistVerified && <i className="fas fa-check-circle text-blue-500 text-[6px]"></i>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showReorder && activePlaylistId && (
            <div className="flex flex-col gap-1">
              <button 
                onClick={(e) => handleReorder(e, 'up')}
                className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-blue-400 transition-all"
              >
                <i className="fas fa-chevron-up text-[8px]"></i>
              </button>
              <button 
                onClick={(e) => handleReorder(e, 'down')}
                className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-blue-400 transition-all"
              >
                <i className="fas fa-chevron-down text-[8px]"></i>
              </button>
            </div>
          )}
          <button 
            onClick={handleLikeClick}
            className={`w-8 h-8 flex items-center justify-center transition-all rounded-full hover:bg-white/5 ${isLiked ? 'text-red-500' : 'text-white/20 hover:text-white'}`}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-[10px]`}></i>
          </button>
          <button 
            onClick={handleCommentClick}
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white transition-all rounded-full hover:bg-white/5"
          >
            <i className="far fa-comment text-[10px]"></i>
          </button>
          <span className="text-[9px] font-mono font-black text-white/20 italic">{formatDuration(track.duration)}</span>
          <button 
            onClick={handleOptionsClick}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-full hover:bg-white/5"
          >
            <i className="fas fa-ellipsis-v text-[10px]"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => playTrack(track)}
      className="group relative bg-transparent rounded-lg p-2 transition-all border border-transparent hover:border-blue-500/30 cursor-pointer w-full flex flex-col"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg border border-white/10">
        <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] ease-out" alt={track.title} />
        <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isActive ? 'opacity-100' : ''}`}>
          <div className="w-12 h-12 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl border border-white/10">
            <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-white text-xs`}></i>
          </div>
        </div>
        <button 
          onClick={handleLikeClick}
          className={`absolute top-2 left-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10 ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-white'}`}
        >
          <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-[9px]`}></i>
        </button>
        <button 
          onClick={handleCommentClick}
          className="absolute top-10 left-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10 text-white/60 hover:text-white"
        >
          <i className="far fa-comment text-[9px]"></i>
        </button>
        <button 
          onClick={handleOptionsClick}
          className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10"
        >
          <i className="fas fa-ellipsis-v text-[9px] text-white/60 hover:text-white"></i>
        </button>
      </div>
      <div className="px-1 flex flex-col gap-0.5 pb-1">
        <h3 className={`font-black truncate text-[10px] uppercase tracking-tighter italic leading-tight ${isActive ? 'text-blue-400' : 'text-white'}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-1">
          <p 
            onClick={handleArtistClick} 
            className={`text-[8px] font-black truncate uppercase tracking-widest italic hover:text-blue-400 transition-colors w-fit ${isActive ? 'text-blue-400/60' : 'text-white/20'}`}
          >
            {track.artist}
          </p>
          {track.artistVerified && <i className="fas fa-check-circle text-blue-500 text-[7px]"></i>}
        </div>
      </div>

      {showComments && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComments(false)}></div>
          <div className="relative glass w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Track Comments</h3>
              <button onClick={() => setShowComments(false)} className="text-white/40 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto no-scrollbar">
              <div className="flex gap-3">
                <img src="https://picsum.photos/40/40?random=1" className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-[10px] font-black text-white uppercase italic">CryptoPioneer</p>
                  <p className="text-xs text-white/60 italic">This drop is insane! 🔥</p>
                </div>
              </div>
              <div className="flex gap-3">
                <img src="https://picsum.photos/40/40?random=2" className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-[10px] font-black text-white uppercase italic">SynthFan99</p>
                  <p className="text-xs text-white/60 italic">Need this on repeat 24/7.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a comment..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors italic" />
              <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackCard;