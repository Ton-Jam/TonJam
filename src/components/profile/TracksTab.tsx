import React, { useState } from 'react';
import { Play, Pause, Heart, BarChart2, Share2, Search, SlidersHorizontal } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';

interface TracksTabProps {
  onPlayTrack: (trackId: string) => void;
  tracks?: Track[];
}

const formatDuration = (dur?: number | string) => {
  if (typeof dur === 'string') return dur;
  const total = Number(dur || 0);
  if (!total) return '0:00';
  return `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`;
};

export const TracksTab: React.FC<TracksTabProps> = ({ onPlayTrack, tracks }) => {
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { allTracks, userProfile } = useAudio();

  const sourceTracks = tracks !== undefined
    ? tracks
    : allTracks.filter((t) => !userProfile?.uid || t.artistId === userProfile.uid);

  const togglePlay = (trackId: string) => {
    if (activePlayingId === trackId) {
      setActivePlayingId(null);
    } else {
      setActivePlayingId(trackId);
      onPlayTrack(trackId);
    }
  };

  const filteredTracks = (sourceTracks || []).filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.genre || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            className="w-full bg-[#101A3B] rounded-full pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition-all placeholder:text-slate-500"
          />
        </div>
        <button className="p-2.5 bg-[#101A3B] rounded-full hover:bg-[#15234f] transition-all cursor-pointer">
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
                className="bg-[#101A3B] rounded-[12px] p-3 flex items-center justify-between group hover:bg-[#15234f] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-[8px] overflow-hidden bg-slate-900 shrink-0">
                    {track.coverUrl && (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    )}
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
                        {track.genre || 'Music'}
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold">•</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <BarChart2 className="w-3 h-3" />
                        {Number(track.playCount || track.streams || 0).toLocaleString()} plays
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="text-xs font-mono text-slate-400">{formatDuration(track.duration)}</span>
                  
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
          <div className="text-center py-16 bg-[#101A3B] rounded-[12px] p-6 text-slate-400 text-sm font-semibold uppercase tracking-wider">
            No tracks found matching your query.
          </div>
        )}
      </div>
    </div>
  );
};
