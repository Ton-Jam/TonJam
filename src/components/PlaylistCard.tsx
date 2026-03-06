import React from 'react';
import { Play, Music } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
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

  const renderCover = () => {
    if (playlist.coverUrl) {
      return (
        <img 
          src={playlist.coverUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          alt={playlist.title} 
        />
      );
    }

    if (playlistTracks.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 group-hover:scale-110 transition-transform duration-500">
          <Music className="text-white/20 h-8 w-8" />
        </div>
      );
    }

    if (playlistTracks.length < 4) {
      // If less than 4 tracks, show the first one's cover full size
      const track = playlistTracks[0];
      return (
        <img 
          src={track?.coverUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          alt={playlist.title} 
        />
      );
    }

    // 2x2 Grid for 4 or more tracks
    return (
      <div className="w-full h-full grid grid-cols-2 group-hover:scale-110 transition-transform duration-500">
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

  return (
    <div 
      onClick={onClick} 
      className="group relative border border-white/5 rounded-[5px] p-3 transition-all cursor-pointer w-full flex flex-col hover:bg-white/5 hover:-translate-y-1"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-[5px] bg-neutral-900">
        {renderCover()}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-all">
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        <h3 className="font-bold truncate text-sm text-white uppercase tracking-tight leading-tight group-hover:text-blue-500 transition-colors">
          {playlist.title}
        </h3>
        <p className="text-[10px] font-bold truncate uppercase tracking-widest text-white/40">
          {playlist.trackCount} Tracks • <span 
            className="hover:text-white hover:underline cursor-pointer inline-block"
            onClick={(e) => {
              e.stopPropagation();
              const artist = MOCK_ARTISTS.find(a => a.name === playlist.creator);
              if (artist) {
                navigate(`/artist/${artist.id}`);
              } else if (playlist.creator === MOCK_USER.name) {
                navigate('/profile');
              }
            }}
          >{playlist.creator}</span>
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
