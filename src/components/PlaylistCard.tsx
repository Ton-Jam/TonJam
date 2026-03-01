import React from 'react';
import { Play, Music } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { playTrack, allTracks } = useAudio();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={onClick} 
      className="group relative border border-white/5 rounded-[5px] p-3 transition-all cursor-pointer w-full flex flex-col hover:bg-white/5 hover:-translate-y-1"
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-[5px] bg-neutral-900">
        {playlist.coverUrl ? (
          <img 
            src={playlist.coverUrl} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            alt={playlist.title} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 group-hover:scale-110 transition-transform duration-500">
            <Music className="text-white/20 h-8 w-8" />
          </div>
        )}
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
          {playlist.trackCount} Tracks • {playlist.creator}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
