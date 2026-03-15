import React from 'react';
import { Play, Music } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';

interface PlaylistCardProps {
  playlist: Playlist;
  variant?: 'default' | 'row';
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, variant = 'default', onClick }) => {
  const { allTracks } = useAudio();
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  // Get cover images from the first 4 tracks
  const playlistTracks = (playlist.trackIds || [])
    .map(id => allTracks.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const renderCover = (sizeClass: string = "w-full h-full") => {
    if (playlist.coverUrl) {
      return (
        <img 
          src={playlist.coverUrl} 
          className={`${sizeClass} object-cover group-hover:scale-110 transition-transform duration-500`} 
          alt={playlist.title} 
        />
      );
    }

    if (playlistTracks.length === 0) {
      return (
        <div className={`${sizeClass} flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 group-hover:scale-110 transition-transform duration-500`}>
          <Music className="text-muted-foreground/50 h-8 w-8" />
        </div>
      );
    }

    if (playlistTracks.length < 4) {
      // If less than 4 tracks, show the first one's cover full size
      const track = playlistTracks[0];
      return (
        <img 
          src={track?.coverUrl} 
          className={`${sizeClass} object-cover group-hover:scale-110 transition-transform duration-500`} 
          alt={playlist.title} 
        />
      );
    }

    // 2x2 Grid for 4 or more tracks
    return (
      <div className={`${sizeClass} grid grid-cols-2 gap-0.5 group-hover:scale-105 transition-transform duration-700 bg-neutral-800`}>
        {playlistTracks.map((track, i) => (
          <img 
            key={i}
            src={track?.coverUrl} 
            className="w-full h-full object-cover" 
            alt="" 
          />
        ))}
      </div>
    );
  };

  if (variant === 'row') {
    return (
      <div 
        onClick={onClick} 
        className="group flex items-center gap-4 p-2 rounded-[10px] hover:bg-muted/50 transition-all cursor-pointer w-full glass bg-foreground/[0.02]"
      >
        <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0">
          {renderCover()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">
            {playlist.title}
          </h4>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
            {playlist.creator}
          </p>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hidden sm:block">
          {playlist.trackCount} Tracks
        </span>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick} 
      className="group relative cursor-pointer glass p-3 rounded-[10px] bg-foreground/[0.02]"
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[10px] overflow-hidden bg-neutral-900 shadow-lg mb-2">
        {renderCover()}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-300 flex items-center justify-center">
          <button 
            onClick={handlePlay}
            className="w-7 h-7 rounded-full bg-muted backdrop-blur-md border border-blue-500/30 flex items-center justify-center shadow-xl group-hover:bg-blue-600 group-hover:border-blue-500/40 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
          >
            <Play className="h-3 w-3 text-foreground fill-white ml-0.5" />
          </button>
        </div>
      </div>
      
      {/* Content Below Card */}
      <div className="px-0.5">
        <h3 className="text-[11px] font-bold uppercase tracking-tight truncate text-foreground group-hover:text-blue-400 transition-colors">
          {playlist.title}
        </h3>
        <p 
          className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            const artist = MOCK_ARTISTS.find(a => a.name === playlist.creator);
            if (artist) {
              navigate(`/artist/${artist.id}`);
            } else if (playlist.creator === MOCK_USER.name) {
              navigate('/profile');
            }
          }}
        >
          {playlist.creator}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-2 mt-2">
          <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
            {playlist.trackCount} Tracks
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
