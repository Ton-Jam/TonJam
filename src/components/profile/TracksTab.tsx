import React, { useState } from 'react';
import { Play, Pause, Heart, BarChart2, Plus, Share2, Search, SlidersHorizontal } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  plays: number;
  likes: number;
  duration: string;
  coverUrl: string;
  genre: string;
}

interface TracksTabProps {
  onPlayTrack: (trackId: string) => void;
}

const MOCK_TRACKS_LIST: Track[] = [
  { id: 'tr_1', title: 'Supersonic Frequencies', plays: 124500, likes: 8900, duration: '3:42', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=200&h=200&q=80', genre: 'Electronic' },
  { id: 'tr_2', title: 'Midnight Grid Runner', plays: 84300, likes: 6200, duration: '4:15', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&h=200&q=80', genre: 'Synthwave' },
  { id: 'tr_3', title: 'Deep Cyber Bass', plays: 98100, likes: 7100, duration: '3:10', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80', genre: 'Bass' },
  { id: 'tr_4', title: 'Ambient Waves of TON', plays: 154000, likes: 11200, duration: '5:02', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&h=200&q=80', genre: 'Ambient' },
  { id: 'tr_5', title: 'Digital Relic', plays: 43200, likes: 2500, duration: '3:55', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=200&h=200&q=80', genre: 'Chiptune' }
];

export const TracksTab: React.FC<TracksTabProps> = ({ onPlayTrack }) => {
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const togglePlay = (trackId: string) => {
    if (activePlayingId === trackId) {
      setActivePlayingId(null);
    } else {
      setActivePlayingId(trackId);
      onPlayTrack(trackId);
    }
  };

  const filteredTracks = MOCK_TRACKS_LIST.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-white font-sans pb-8">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search uploaded tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101A3B] border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#0052FF] transition-all placeholder:text-slate-500"
          />
        </div>
        <button className="p-2.5 bg-[#101A3B] border border-white/5 rounded-full hover:bg-[#15234f] transition-all cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Tracks List */}
      <div className="space-y-2.5">
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track) => {
            const isPlaying = activePlayingId === track.id;
            return (
              <div
                key={track.id}
                className="bg-[#101A3B] border border-white/5 rounded-[12px] p-3 flex items-center justify-between group hover:bg-[#15234f] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Play Button Overlap */}
                  <div className="relative w-12 h-12 rounded-[8px] overflow-hidden bg-slate-900 shrink-0">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => togglePlay(track.id)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white">
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {track.genre}
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold">•</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <BarChart2 className="w-3 h-3" />
                        {(track.plays).toLocaleString()} plays
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="text-xs font-mono text-slate-400">{track.duration}</span>
                  
                  <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-red-400">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#101A3B] border border-white/5 rounded-[12px] p-6 text-slate-400 text-sm font-semibold uppercase tracking-wider">
            No tracks found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};
