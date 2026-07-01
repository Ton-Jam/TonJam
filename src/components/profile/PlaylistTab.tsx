import React from 'react';
import { Play, Disc, Music, SlidersHorizontal, Search, FolderHeart } from 'lucide-react';

interface Playlist {
  id: string;
  title: string;
  creator: string;
  trackCount: number;
  coverUrl: string;
  duration: string;
}

interface PlaylistTabProps {
  onSelectPlaylist: (playlistId: string) => void;
}

const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'pl_1', title: 'Late Night Drive Frequencies', creator: 'DJ Krupy', trackCount: 18, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80', duration: '1h 24m' },
  { id: 'pl_2', title: 'Supersonic Workouts', creator: 'DJ Krupy', trackCount: 25, coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&h=300&q=80', duration: '1h 48m' },
  { id: 'pl_3', title: 'Chill & Construct Ambient', creator: 'DJ Krupy', trackCount: 12, coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80', duration: '54m' }
];

export const PlaylistTab: React.FC<PlaylistTabProps> = ({ onSelectPlaylist }) => {
  return (
    <div className="space-y-4 text-white font-sans pb-8">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full bg-[#101A3B] border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0052FF] transition-all placeholder:text-slate-500"
          />
        </div>
        <button className="p-2.5 bg-[#101A3B] border border-white/5 rounded-full hover:bg-[#15234f] transition-all cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {MOCK_PLAYLISTS.map((pl) => (
          <div
            key={pl.id}
            onClick={() => onSelectPlaylist(pl.id)}
            className="bg-[#101A3B] border border-white/5 rounded-[12px] overflow-hidden group hover:bg-[#15234f] transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="aspect-square w-full bg-slate-900 overflow-hidden relative">
              <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute bottom-3 right-3 p-2 bg-[#0052FF] text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-[#0052FF]/20">
                <Play className="w-4 h-4 fill-current text-white" />
              </button>
            </div>
            
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white">
                  {pl.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">by {pl.creator}</p>
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>{pl.trackCount} tracks</span>
                <span>{pl.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
