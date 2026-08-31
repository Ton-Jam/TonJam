import React, { useState } from 'react';
import { Play, Pause, Heart, BarChart2, Plus, Share2, Search, SlidersHorizontal, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '@/types';
import { useToast } from '@/components/layout/ToastProvider';
import { useAudio } from '@/contexts/AudioContext';

interface TracksSectionProps {
  tracks: Track[];
  onPlayTrack?: (trackId: string) => void;
  onSaveTrack?: (trackId: string) => void;
}

export const TracksSection: React.FC<TracksSectionProps> = ({
  tracks,
  onPlayTrack,
  onSaveTrack
}) => {
  const toast = useToast();
  const { currentTrack, isPlaying: audioIsPlaying, playTrack, togglePlay: audioTogglePlay } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      audioTogglePlay();
    } else {
      playTrack(track);
      onPlayTrack?.(track.id);
      toast.success('Now Playing', track.title);
    }
  };

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-white font-sans">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101A3B] rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder:text-slate-500"
          />
        </div>
        <button 
          onClick={() => toast.info('Filters', 'Advanced track filters opened.')}
          className="p-2.5 bg-[#101A3B] rounded-full hover:bg-[#15234f] transition-all cursor-pointer text-slate-400"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Tracks List */}
      <div className="space-y-2">
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track, idx) => {
            const isCurrentPlaying = currentTrack?.id === track.id && audioIsPlaying;
            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={`rounded-2xl p-3 flex items-center justify-between group transition-all cursor-pointer ${
                  currentTrack?.id === track.id 
                    ? 'bg-[#15234f] shadow-lg shadow-blue-500/10' 
                    : 'bg-[#101A3B] hover:bg-[#15234f]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Track Number / Play Button */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img 
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=200&h=200&q=80'} 
                      alt={track.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(track);
                      }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate transition-colors ${
                      currentTrack?.id === track.id ? 'text-[#0088CC]' : 'text-slate-200 group-hover:text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {track.genre && (
                        <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {track.genre}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <BarChart2 className="w-3 h-3 text-[#0052FF]" />
                        {(((track as any).plays || track.playCount || track.streams || 0) + (isCurrentPlaying ? 1 : 0)).toLocaleString()} plays
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-400">{track.duration}</span>
                  
                  <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('Link Copied', 'Track sharing url copied to clipboard.');
                      }}
                      className="p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#101A3B]/40 rounded-2xl p-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
            No audio tracks match criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default TracksSection;
