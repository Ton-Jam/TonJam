import React from 'react';
import { Play, Music, ChevronRight } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface PlaylistListItemProps {
  playlist: Playlist;
  onClick?: () => void;
}

const PlaylistListItem: React.FC<PlaylistListItemProps> = ({ playlist, onClick }) => {
  const { allTracks } = useAudio();

  // Get cover images from the first 4 tracks if no playlist cover
  const playlistTracks = (playlist.trackIds || [])
    .map(id => allTracks.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const renderCover = () => {
    if (playlist.coverUrl) {
      return (
        <img 
          src={playlist.coverUrl} 
          className="w-full h-full object-cover" 
          alt={playlist.title} 
        />
      );
    }

    if (playlistTracks.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white/5">
          <Music className="text-white/10 h-5 w-5" />
        </div>
      );
    }

    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-neutral-800">
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
      className="group flex items-center gap-4 p-3 rounded-[10px] bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full"
    >
      <div className="relative w-14 h-14 rounded-[6px] overflow-hidden flex-shrink-0 shadow-lg">
        {renderCover()}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="h-4 w-4 text-white fill-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-xs font-bold uppercase tracking-tight truncate text-white group-hover:text-blue-400 transition-colors">
            {playlist.title}
          </h4>
          {playlist.creator === 'TonJam AI' && (
            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[7px] font-bold uppercase tracking-widest rounded-[2px]">AI</span>
          )}
        </div>
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
          By {playlist.creator}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-white tracking-tighter">{playlist.trackCount}</span>
          <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Tracks</span>
        </div>
        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default PlaylistListItem;
