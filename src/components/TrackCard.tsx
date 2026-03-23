import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, CheckCircle2, Share2, Globe, Zap, Coins, Heart } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS, TJ_COIN_ICON } from '@/constants';
import confetti from 'canvas-confetti';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface TrackCardProps {
  track: Track;
  variant?: 'default' | 'row'; // Added variant prop to support list views if needed, though default is now 1:1
  index?: number;
  onMint?: (track: Track) => void;
  className?: string;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, variant = 'default', onMint, className = '' }) => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, setOptionsTrack, addNotification, jamTrack } = useAudio();
  const [isTipping, setIsTipping] = React.useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const isActive = currentTrack?.id === track.id;
  const artist = MOCK_ARTISTS.find(a => a.id === track.artistId);

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
    if (track.isNFT) {
      navigate(`/nft/${track.id}`);
    } else {
      navigate(`/track/${track.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (variant === 'row') {
    return (
      <div 
        className={`group flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 glass bg-card/50 ${className}`}
        onClick={handleCardClick}
        onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
        role="button"
        tabIndex={0}
        aria-label={`View track: ${track.title} by ${track.artist}`}
      >
        <div 
          className="relative w-12 h-12 rounded-[5px] overflow-hidden flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
          onClick={(e) => { e.stopPropagation(); handlePlay(e); }}
          onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e, () => handlePlay(e as any)); }}
          role="button"
          tabIndex={0}
          aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
             {isActive && isPlaying ? (
                <div className="flex items-end justify-center gap-3 h-3" aria-hidden="true">
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_0ms]"></div>
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_200ms]"></div>
                  <div className="w-0.5 bg-blue-500 h-full animate-[bounce_1s_infinite_400ms]"></div>
                </div>
             ) : (
                <Play className="h-3 w-3 text-foreground fill-white" aria-hidden="true" />
             )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-blue-600 dark:text-foreground'}`}>{track.title}</h4>
          <div className="flex items-center gap-3 mt-3">
            {artist && (
              <img 
                src={artist.avatarUrl} 
                alt={artist.name} 
                className="w-3.5 h-3.5 rounded-full object-cover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={handleArtistClick}
                onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e, () => handleArtistClick(e as any)); }}
                role="button"
                tabIndex={0}
              />
            )}
            <p 
              className="text-[9px] font-bold text-blue-500/70 dark:text-muted-foreground uppercase tracking-widest truncate hover:text-blue-600 dark:hover:text-foreground hover:underline cursor-pointer inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
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
        <div className="flex items-center gap-2">
           {onMint && !track.isNFT && (
             <button 
               onClick={handleMint}
               className="px-2 py-3 bg-blue-600 hover:bg-blue-500 text-foreground text-[8px] font-bold uppercase tracking-widest rounded-[4px] transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
               aria-label={`Mint NFT for ${track.title}`}
             >
               Mint NFT
             </button>
           )}
           <span className="text-[10px] font-bold text-blue-500/50 dark:text-muted-foreground/50 uppercase tracking-widest hidden sm:block" aria-label="Duration">
              {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
           </span>
           <div className="relative">
             <button 
               onClick={toggleTipMenu} 
               className={`p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isTipping ? 'bg-blue-600 text-foreground' : 'hover:bg-muted text-blue-500/70 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-foreground'}`}
               aria-label="Tip artist"
               aria-haspopup="true"
               aria-expanded={isTipping}
             >
               <Coins className="h-4 w-4" />
             </button>
             {isTipping && (
               <div className="absolute bottom-full right-0 mb-2 p-2 bg-background/90 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl z-50 flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                 {[0.1, 0.5, 1].map((amount) => (
                   <button
                     key={amount}
                     onClick={(e) => handleTip(e, amount)}
                     className="px-2 py-2 hover:bg-muted rounded text-[9px] font-bold text-blue-600 dark:text-foreground whitespace-nowrap transition-colors flex items-center gap-2"
                   >
                     <img src={TJ_COIN_ICON} className="w-3 h-3" alt="" />
                     {amount}
                   </button>
                 ))}
               </div>
             )}
           </div>
           <button 
             onClick={handleOptions} 
             className="p-2 rounded-full hover:bg-muted text-blue-500/70 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
             aria-label="Track options"
             aria-haspopup="true"
           >
             <MoreVertical className="h-4 w-4" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer transition-all duration-300 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[12px] p-3 bg-card/50 border border-border ${className}`}
      onClick={handleCardClick}
      onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
      role="button"
      tabIndex={0}
      aria-label={`View track: ${track.title} by ${track.artist}`}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[8px] overflow-hidden bg-neutral-900 shadow-lg mb-3">
        <img 
          src={track.coverUrl} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {/* Overlay for Play Button */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <button 
             className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
             onClick={handlePlay}
             aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
           >
             {isActive && isPlaying ? (
               <Pause className="h-5 w-5 fill-current" />
             ) : (
               <Play className="h-5 w-5 fill-current ml-1" />
             )}
           </button>
        </div>
      </div>

      {/* Content Below Card */}
      <div className="px-1">
        <h3 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {track.title}
        </h3>
        <p 
          className="text-xs font-medium text-muted-foreground truncate mt-1 hover:underline cursor-pointer"
          onClick={handleArtistClick}
        >
          {track.artist}
        </p>
      </div>
    </div>
  );
};

export default TrackCard;