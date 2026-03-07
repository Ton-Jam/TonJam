import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, CheckCircle2, Share2, Globe, Zap } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS, TJ_COIN_ICON } from '@/constants';
import confetti from 'canvas-confetti';

interface TrackCardProps {
  track: Track;
  variant?: 'default' | 'row'; // Added variant prop to support list views if needed, though default is now 1:1
  index?: number;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, variant = 'default' }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, addNotification, jamTrack } = useAudio();
  const isActive = currentTrack?.id === track.id;
  const artist = MOCK_ARTISTS.find(a => a.id === track.artistId);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.artistId) {
      navigate(`/artist/${track.artistId}`);
    }
  };

  const handleJam = (e: React.MouseEvent) => {
    e.stopPropagation();
    jamTrack(track.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.7,
      shapes: ['circle']
    });
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(track);
  };

  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/track/${track.id}`; // Assuming a track route exists or will exist
    const shareData = {
      title: `${track.title} by ${track.artist}`,
      text: `Check out this track on TonJam: ${track.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addNotification('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addNotification('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      // Don't log or show an error if the user just cancelled the share dialog
      const isCancel = (err as Error).name === 'AbortError' || 
                      (err as Error).message?.toLowerCase().includes('canceled') ||
                      (err as Error).message?.toLowerCase().includes('aborted');
      
      if (!isCancel) {
        console.error('Error sharing:', err);
        addNotification('Failed to share track.', 'error');
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (track.isNFT) {
      navigate(`/nft/${track.id}`);
    } else {
      navigate(`/track/${track.id}`);
    }
  };

  if (variant === 'row') {
    return (
      <div 
        className="group flex items-center gap-4 p-2 rounded-[10px] hover:bg-white/5 transition-all cursor-pointer w-full"
        onClick={handleCardClick}
      >
        <div className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0" onClick={(e) => { e.stopPropagation(); handlePlay(e); }}>
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
             {isActive && isPlaying ? (
                <div className="flex items-end justify-center gap-0.5 h-3">
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_0ms]"></div>
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_200ms]"></div>
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_400ms]"></div>
                </div>
             ) : (
                <Play className="h-3 w-3 text-white fill-white" />
             )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-white'}`}>{track.title}</h4>
          <p 
            className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate hover:text-white hover:underline cursor-pointer inline-block"
            onClick={handleArtistClick}
          >
            {track.artist}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest hidden sm:block">
              {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
           </span>
           <button onClick={handleOptions} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
             <MoreVertical className="h-4 w-4" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[10px] overflow-hidden bg-neutral-900 shadow-lg mb-2">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Overlay for Play Button & Badges */}
        <div className={`absolute inset-0 transition-all duration-300 ${isActive ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/40'}`}>
           {/* Top Row */}
           <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
             <div className="flex flex-col gap-1 items-start">
               {track.isNFT && (
                 <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-md rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-white shadow-lg">
                   NFT
                 </span>
               )}
               {track.cid && (
                 <span className="px-2 py-1 bg-emerald-600/90 backdrop-blur-md rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-1">
                   <Globe className="h-2 w-2" />
                   CID
                 </span>
               )}
             </div>
           </div>

           {/* Center Play Button */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`transition-all duration-300 transform ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                 {isActive && isPlaying ? (
                    <div 
                      className="flex items-end justify-center gap-0.5 w-7 h-7 rounded-full bg-blue-600/90 backdrop-blur-md shadow-xl p-1.5 pointer-events-auto cursor-pointer"
                      onClick={handlePlay}
                    >
                      <div className="w-0.5 bg-white rounded-t-sm animate-[bounce_1s_infinite_0ms] h-full"></div>
                      <div className="w-0.5 bg-white rounded-t-sm animate-[bounce_1s_infinite_200ms] h-full"></div>
                      <div className="w-0.5 bg-white rounded-t-sm animate-[bounce_1s_infinite_400ms] h-full"></div>
                    </div>
                 ) : (
                    <div 
                      className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors pointer-events-auto cursor-pointer"
                      onClick={handlePlay}
                    >
                       <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Content Below Card */}
      <div className="px-0.5">
        <h3 className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-400' : 'text-white'}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-1 mt-0.5 mb-1.5">
          <p 
            className="text-[9px] font-bold uppercase tracking-widest text-white/40 truncate hover:text-white hover:underline cursor-pointer inline-block"
            onClick={handleArtistClick}
          >
            {track.artist}
          </p>
          {track.artistVerified && <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1">
            <Headphones className="h-2.5 w-2.5 text-white/20" />
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
              {(track.playCount || 0).toLocaleString()}
            </span>
            {(track.playCount || 0) > 1000 && (
              <Zap className="h-2.5 w-2.5 text-amber-400 ml-1" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 text-white/20" />
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
              {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;