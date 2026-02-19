import React from 'react';
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
    </div>
  );
};

export default TrackCard;