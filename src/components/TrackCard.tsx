import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, CheckCircle2, Share2, Globe, Zap, Coins, ListMusic, Plus, Lock, ChevronDown, ChevronUp, Activity, Key } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS, TJ_COIN_ICON } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useTonConnectUI } from '@tonconnect/ui-react';
import SkeletonCard from './SkeletonCard';
import { useTokenGating } from '@/hooks/useTokenGating';

interface TrackCardProps {
  track: Track;
  variant?: 'default' | 'row' | 'compact';
  index?: number;
  onMint?: (track: Track) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
  isLoading?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  variant = 'default', 
  onMint, 
  onRemove,
  onMoveUp,
  onMoveDown,
  className = '', 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, addNotification, jamTrack, artists, addToQueue, setTrackToAddToPlaylist } = useAudio();
  const [isTipping, setIsTipping] = React.useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { hasAccess } = useTokenGating(track.tokenGating);
  
  if (isLoading) {
    return <SkeletonCard variant={variant} className={className} />;
  }
  const isActive = currentTrack?.id === track.id;
  const artist = artists.find(a => a.uid === track.artistId);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.artistId) {
      navigate(`/artist/${track.artistId}`);
    }
  };

  const handleMint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMint) {
      onMint(track);
    }
  };

  const handleTip = async (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    setIsTipping(false);
    
    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: artist?.walletAddress || "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
            amount: (amount * 1000000000).toString(), // Convert TON to nanoton
          }
        ]
      };
      
      await tonConnectUI.sendTransaction(transaction);
      
      addNotification(`Successfully tipped ${amount} TON to ${track.artist}!`, 'success');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.8 },
        colors: ['#0088cc', '#ffffff', '#3b82f6'],
        ticks: 200,
        gravity: 1.5,
        scalar: 0.8,
        shapes: ['circle']
      });
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("User rejected")) {
        addNotification("Transaction rejected by user.", "warning");
      } else {
        addNotification("Tipping transaction failed. Ensure you have sufficient TON balance.", "error");
      }
    }
  };

  const toggleTipMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTipping(!isTipping);
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
    if (track.tokenGating?.enabled && !hasAccess) {
      addNotification(`This track is exclusive to ${track.tokenGating.tokenSymbol} holders.`, 'warning');
      return;
    }
    playTrack(track);
  };

  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track, { onRemove, onMoveUp, onMoveDown });
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
    } catch (err: any) {
      // Don't log or show an error if the user just cancelled the share dialog
      const isCancel = err.name === 'AbortError' || 
                      err.message?.toLowerCase().includes('canceled') ||
                      err.message?.toLowerCase().includes('aborted');
      
      if (!isCancel) {
        console.error('Error sharing:', err);
        addNotification('Failed to share track.', 'error');
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (track.tokenGating?.enabled && !hasAccess) {
      addNotification(`This track is exclusive to ${track.tokenGating.tokenSymbol} holders.`, 'warning');
      return;
    }
    playTrack(track);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        className={`group flex items-center gap-5 p-4 rounded-[2px] hover:bg-muted/50 transition-all cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        onClick={handleCardClick}
        onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
        role="button"
        tabIndex={0}
      >
        <div className="relative w-14 h-14 rounded-[2px] overflow-hidden flex-shrink-0 shadow-lg">
          <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
            <button onClick={handlePlay} className="text-white">
              {track.tokenGating?.enabled && !hasAccess ? (
                <Lock className="h-5 w-5" />
              ) : (
                isActive && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />
              )}
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-black truncate text-neutral-800 uppercase italic tracking-tight`}>{track.title}</h4>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{track.artist}</p>
        </div>
        <button onClick={handleOptions} className="p-2.5 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    );
  }

  const [isExpanded, setIsExpanded] = React.useState(false);

  if (variant === 'row') {
    return (
      <div className={`flex flex-col w-full bg-card/30 rounded-[2px] hover:bg-muted/50 transition-all ${className}`}>
        <div 
          className="group flex items-center gap-4 p-3 cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={handleCardClick}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View track: ${track.title} by ${track.artist}`}
        >
          <div 
            className="relative w-14 h-14 rounded-[2px] overflow-hidden flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
            onClick={(e) => { e.stopPropagation(); handlePlay(e); }}
            onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e, () => handlePlay(e as any)); }}
            role="button"
            tabIndex={0}
            aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
              {track.tokenGating?.enabled && !hasAccess ? (
                  <Lock className="h-4 w-4 text-foreground" />
              ) : isActive && isPlaying ? (
                  <div className="flex items-end justify-center gap-3 h-4" aria-hidden="true">
                    <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_400ms]"></div>
                  </div>
              ) : (
                  <Play className="h-4 w-4 text-foreground fill-white" aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-[13px] font-bold uppercase tracking-tight truncate text-white`}>{track.title}</h4>
            <div className="flex items-center gap-3 mt-1">
              <p 
                className="text-[8px] font-bold text-blue-500/70 dark:text-muted-foreground uppercase tracking-widest truncate hover:text-blue-600 dark:hover:text-foreground hover:underline cursor-pointer inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                onClick={handleArtistClick}
                onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e, () => handleArtistClick(e as any)); }}
                role="button"
                tabIndex={0}
                aria-label={`View artist: ${track.artist}`}
              >
                {track.artist}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest hidden sm:block" aria-label="Duration">
                {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
             </span>
             <button
               onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
               className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
               aria-label="Toggle details"
             >
               {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
             </button>
             <button 
               onClick={handleOptions} 
               className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
               aria-label="Track options"
               aria-haspopup="true"
             >
               <MoreVertical className="h-5 w-5" />
             </button>
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 flex flex-wrap gap-6 text-xs text-muted-foreground border-t border-white/5 mx-2 mt-1">
             <div className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-blue-400" /> BPM: <span className="font-bold text-white/80">{track.bpm || '120'}</span></div>
             <div className="flex items-center gap-1.5"><Key className="h-3.5 w-3.5 text-purple-400" /> Key: <span className="font-bold text-white/80">{track.key || 'C Min'}</span></div>
             <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-yellow-400" /> Bitrate: <span className="font-bold text-white/80">{track.bitrate || '320kbps'}</span></div>
             {track.genre && <div className="flex items-center gap-1.5"><ListMusic className="h-3.5 w-3.5 text-green-400" /> Genre: <span className="font-bold text-white/80">{track.genre}</span></div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer transition-all duration-300 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[2px] p-3 bg-muted/20 border border-border/50 w-full ${className}`}
      onClick={handleCardClick}
      onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
      role="button"
      tabIndex={0}
      aria-label={`View track: ${track.title} by ${track.artist}`}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[2px] overflow-hidden bg-neutral-900 mb-4 shadow-xl">
        <img 
          src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay for Play Button */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 backdrop-blur-[1px] ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <button 
             className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
             onClick={handlePlay}
             aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
           >
             {track.tokenGating?.enabled && !hasAccess ? (
               <Lock className="h-6 w-6" />
             ) : isActive && isPlaying ? (
               <Pause className="h-6 w-6 fill-current" />
             ) : (
               <Play className="h-6 w-6 fill-current ml-1" />
             )}
           </button>
        </div>
      </div>

      {/* Content Below Card */}
      <div className="px-1 flex items-start justify-between pb-1">
        <div className="flex-1 min-w-0">
          <h3 className={`text-[13px] font-black truncate text-neutral-800 uppercase italic tracking-tight`}>
            {track.title}
          </h3>
          <p 
            className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1.5 hover:text-blue-500 transition-colors"
            onClick={handleArtistClick}
          >
            {track.artist}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{(track.playCount || 0).toLocaleString()} Plays</span>
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest font-mono">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {onMint && !track.isNFT && (
            <button
              onClick={handleMint}
              className="text-[9px] font-black text-blue-500 hover:text-blue-400 transition-colors px-2.5 py-1 bg-blue-500/10 rounded-full uppercase tracking-widest mr-1"
            >
              Mint
            </button>
          )}
          <button 
            onClick={handleOptions}
            className="p-2 rounded-full transition-all hover:bg-muted text-muted-foreground/40 hover:text-foreground"
            aria-label="Track options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;