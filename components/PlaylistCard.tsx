import React from 'react';
import { Playlist } from '../types';
import { MOCK_TRACKS } from '../constants';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const tracks = (playlist.trackIds || [])
    .map(id => MOCK_TRACKS.find(t => t.id === id))
    .filter(Boolean);

  const renderCover = () => {
    if (!playlist.coverUrl) {
      if (tracks.length >= 4) {
        return (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            {tracks.slice(0, 4).map((t, i) => (
              <img 
                key={i} 
                src={t?.coverUrl} 
                className="w-full h-full object-cover border-[0.5px] border-black/20" 
                alt="" 
              />
            ))}
          </div>
        );
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20"></div>
            <i className="fas fa-compact-disc text-white/10 text-4xl animate-spin-slow relative z-10"></i>
            <div className="absolute bottom-2 right-2 text-[6px] font-black text-white/10 uppercase tracking-widest">No Signal</div>
          </div>
        );
      }
    }

    return (
      <img 
        src={playlist.coverUrl} 
        className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" 
        alt={playlist.title} 
      />
    );
  };

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-40 md:w-48 group cursor-pointer space-y-4"
    >
      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-500/20 border border-white/10 rounded-xl -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500"></div>
        
        <div className="aspect-square rounded-xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0a0a0a]">
          {renderCover()}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
             <div className="w-12 h-12 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl border border-white/20">
                <i className="fas fa-play text-white text-sm"></i>
             </div>
          </div>
        </div>
      </div>
      <div className="px-1 pt-1">
        <h3 className="text-[11px] font-black uppercase text-white tracking-tighter truncate group-hover:text-blue-400 transition-colors">{playlist.title}</h3>
        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{playlist.trackCount} Syncs</p>
      </div>
    </div>
  );
};

export default PlaylistCard;