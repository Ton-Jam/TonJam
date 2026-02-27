import React from 'react';
import { Play, Pause, MoreVertical, Headphones, Clock, CheckCircle2 } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS } from '@/constants';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { playTrack, currentTrack, isPlaying, setOptionsTrack } = useAudio();
  const isActive = currentTrack?.id === track.id;
  const artist = MOCK_ARTISTS.find(a => a.id === track.artistId);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(track);
  };

  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track);
  };

  return (
    <div 
      className="group relative bg-white/5 border border-white/10 rounded-2xl p-3 transition-all hover:bg-white/10 hover:-translate-y-1 overflow-hidden"
      onClick={handlePlay}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-900">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'opacity-100' : ''}`}>
          <button 
            onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-blue-600/40"
          >
            {isActive && isPlaying ? (
              <Pause className="h-6 w-6 text-white fill-white" />
            ) : (
              <Play className="h-6 w-6 text-white fill-white ml-1" />
            )}
          </button>
        </div>

        <button 
          onClick={handleOptions}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80"
        >
          <MoreVertical className="h-4 w-4 text-white/70" />
        </button>

        {track.isNFT && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-[8px] font-bold uppercase tracking-widest text-white shadow-lg">
              NFT
            </span>
          </div>
        )}
      </div>

      <div className="px-1 space-y-1">
        <h3 className={`text-sm font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-white'}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">
            {track.artist}
          </p>
          {track.artistVerified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Headphones className="h-3 w-3 text-white/20" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {(track.playCount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-white/20" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;