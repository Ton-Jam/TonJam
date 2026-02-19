import React from 'react';
import { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-40 md:w-48 group cursor-pointer space-y-4"
    >
      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-500/20 border border-white/10 rounded-xl -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500"></div>
        
        <div className="aspect-square rounded-xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0a0a0a]">
          <img 
            src={playlist.coverUrl} 
            className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" 
            alt={playlist.title} 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="w-12 h-12 rounded-full electric-blue-bg flex items-center justify-center shadow-2xl border border-white/20">
                <i className="fas fa-play text-white text-sm"></i>
             </div>
          </div>
        </div>
      </div>
      <div className="px-1 pt-1">
        <h3 className="text-[11px] font-black uppercase text-white italic tracking-tighter truncate group-hover:text-blue-400 transition-colors">{playlist.title}</h3>
        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{playlist.trackCount} Syncs</p>
      </div>
    </div>
  );
};

export default PlaylistCard;