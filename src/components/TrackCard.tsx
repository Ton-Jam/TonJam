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
}

const TrackCard: React.FC<TrackCardProps> = ({ track, variant = 'default', onMint }) => {
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
        className="group flex items-center gap-4 p-2 rounded-[10px] hover:bg-muted/50 transition-all cursor-pointer w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                <div className="flex items-end justify-center gap-0.5 h-3" aria-hidden="true">
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
          <h4 className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-500' : 'text-foreground'}`}>{track.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
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
              className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate hover:text-foreground hover:underline cursor-pointer inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
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
        <div className="flex items-center gap-4">
           {onMint && !track.isNFT && (
             <button 
               onClick={handleMint}
               className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-foreground text-[8px] font-bold uppercase tracking-widest rounded-[4px] transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
               aria-label={`Mint NFT for ${track.title}`}
             >
               Mint NFT
             </button>
           )}
           <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hidden sm:block" aria-label="Duration">
              {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
           </span>
           <div className="relative">
             <button 
               onClick={toggleTipMenu} 
               className={`p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isTipping ? 'bg-blue-600 text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
               aria-label="Tip artist"
               aria-haspopup="true"
               aria-expanded={isTipping}
             >
               <Coins className="h-4 w-4" />
             </button>
             {isTipping && (
               <div className="absolute bottom-full right-0 mb-2 p-1 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                 {[0.1, 0.5, 1].map((amount) => (
                   <button
                     key={amount}
                     onClick={(e) => handleTip(e, amount)}
                     className="px-2 py-1 hover:bg-muted rounded text-[9px] font-bold text-foreground whitespace-nowrap transition-colors flex items-center gap-1"
                   >
                     <img src={TJ_COIN_ICON} className="w-2.5 h-2.5" alt="" />
                     {amount}
                   </button>
                 ))}
               </div>
             )}
           </div>
           <button 
             onClick={handleOptions} 
             className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
      className="group relative cursor-pointer outline-none transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[10px]"
      onClick={handleCardClick}
      onKeyDown={(e) => handleKeyDown(e, () => handleCardClick(e as any))}
      role="button"
      tabIndex={0}
      aria-label={`View track: ${track.title} by ${track.artist}`}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[10px] overflow-hidden bg-neutral-900 shadow-lg mb-2">
        <img 
          src={track.coverUrl} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Overlay for Play Button & Badges */}
        <div className={`absolute inset-0 transition-all duration-300 ${isActive ? 'bg-background/40' : 'bg-background/0 group-hover:bg-background/40'}`}>
           {/* Top Row */}
           <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
             <div className="flex flex-col gap-1 items-start">
               {track.isNFT && (
                 <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-md rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-foreground shadow-lg">
                   NFT
                 </span>
               )}
               {track.cid && (
                 <span className="px-2 py-1 bg-emerald-600/90 backdrop-blur-md rounded-[4px] text-[8px] font-bold uppercase tracking-widest text-foreground shadow-lg flex items-center gap-1">
                   <Globe className="h-2 w-2" aria-hidden="true" />
                   CID
                 </span>
               )}
             </div>
             <button 
               onClick={handleOptions} 
               className={`p-1.5 rounded-full bg-background/40 backdrop-blur-md text-muted-foreground/90 hover:text-foreground hover:bg-background/60 transition-all pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
               aria-label="Track options"
               aria-haspopup="true"
             >
               <MoreVertical className="h-4 w-4" />
             </button>
           </div>

           {/* Center Play Button */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`transition-all duration-300 transform ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                 {isActive && isPlaying ? (
                    <button 
                      className="flex items-end justify-center gap-0.5 w-7 h-7 rounded-full bg-blue-600/90 backdrop-blur-md shadow-xl p-1.5 pointer-events-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={handlePlay}
                      aria-label={`Pause ${track.title}`}
                    >
                      <div className="w-0.5 bg-foreground rounded-t-sm animate-[bounce_1s_infinite_0ms] h-full" aria-hidden="true"></div>
                      <div className="w-0.5 bg-foreground rounded-t-sm animate-[bounce_1s_infinite_200ms] h-full" aria-hidden="true"></div>
                      <div className="w-0.5 bg-foreground rounded-t-sm animate-[bounce_1s_infinite_400ms] h-full" aria-hidden="true"></div>
                    </button>
                 ) : (
                  <button 
                    className="w-7 h-7 rounded-full bg-muted backdrop-blur-md border border-neutral-500/20 flex items-center justify-center shadow-xl group-hover:bg-blue-600 group-hover:border-neutral-500/40 transition-colors pointer-events-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                    onClick={handlePlay}
                    aria-label={`Play ${track.title}`}
                  >
                       <Play className="h-3 w-3 text-foreground fill-white ml-0.5" aria-hidden="true" />
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Content Below Card */}
      <div className="px-0.5">
        <h3 className={`text-[11px] font-bold uppercase tracking-tight truncate ${isActive ? 'text-blue-400' : 'text-foreground'}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
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
            className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            onClick={handleArtistClick}
            onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e, () => handleArtistClick(e as any)); }}
            role="button"
            tabIndex={0}
            aria-label={`View artist: ${track.artist}`}
          >
            {track.artist}
          </p>
          {track.artistVerified && <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" aria-label="Verified artist" />}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between border-t border-border/50 pt-1.5">
          {track.isNFT ? (
            <div className="flex items-center justify-between w-full gap-2">
               <div className="flex items-center gap-1">
                 <img src={TJ_COIN_ICON} className="w-3 h-3" alt="TON" />
                 <span className="text-[10px] font-bold text-foreground tracking-tighter">{track.price || '0'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <button 
                     onClick={toggleTipMenu}
                     className={`p-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isTipping ? 'bg-blue-600 text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                     aria-label="Tip artist"
                   >
                     <Coins className="h-3 w-3" />
                   </button>
                   {isTipping && (
                     <div className="absolute bottom-full right-0 mb-2 p-1 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                       {[0.1, 0.5, 1].map((amount) => (
                         <button
                           key={amount}
                           onClick={(e) => handleTip(e, amount)}
                           className="px-3 py-1.5 hover:bg-muted rounded text-[9px] font-bold text-foreground whitespace-nowrap transition-colors flex items-center justify-between gap-3"
                         >
                           <div className="flex items-center gap-1">
                             <img src={TJ_COIN_ICON} className="w-2.5 h-2.5" alt="" />
                             {amount}
                           </div>
                           <span className="text-[7px] opacity-40">TON</span>
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
                 <button 
                  onClick={handleCardClick}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-foreground text-[8px] font-bold uppercase tracking-widest rounded-[4px] transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`Buy NFT ${track.title}`}
                >
                  Buy
                </button>
               </div>
            </div>
          ) : onMint ? (
            <div className="flex items-center gap-2 w-full">
              <div className="relative">
                <button 
                  onClick={toggleTipMenu}
                  className={`p-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isTipping ? 'bg-blue-600 text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                  aria-label="Tip artist"
                >
                  <Coins className="h-3 w-3" />
                </button>
                {isTipping && (
                  <div className="absolute bottom-full left-0 mb-2 p-1 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {[0.1, 0.5, 1].map((amount) => (
                      <button
                        key={amount}
                        onClick={(e) => handleTip(e, amount)}
                        className="px-3 py-1.5 hover:bg-muted rounded text-[9px] font-bold text-foreground whitespace-nowrap transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-1">
                          <img src={TJ_COIN_ICON} className="w-2.5 h-2.5" alt="" />
                          {amount}
                        </div>
                        <span className="text-[7px] opacity-40">TON</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={handleMint}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-foreground text-[8px] font-bold uppercase tracking-widest rounded-[4px] transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                aria-label={`Mint NFT for ${track.title}`}
              >
                Mint NFT
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1" aria-label={`${track.playCount || 0} streams`}>
                <Headphones className="h-2.5 w-2.5 text-muted-foreground/50" aria-hidden="true" />
                <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                  {(track.playCount || 0).toLocaleString()}
                </span>
                {(track.playCount || 0) > 1000 && (
                  <Zap className="h-2.5 w-2.5 text-amber-400 ml-1" aria-label="Trending" />
                )}
              </div>
              <div className="flex items-center gap-1" aria-label="Duration">
                <Clock className="h-2.5 w-2.5 text-muted-foreground/50" aria-hidden="true" />
                <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                  {`${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
                </span>
              </div>
              <div className="relative">
                <button 
                  onClick={toggleTipMenu}
                  className={`p-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isTipping ? 'bg-blue-600 text-foreground scale-110' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                  aria-label="Tip artist"
                >
                  <Coins className="h-3 w-3" />
                </button>
                {isTipping && (
                  <div className="absolute bottom-full right-0 mb-2 p-1 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {[0.1, 0.5, 1].map((amount) => (
                      <button
                        key={amount}
                        onClick={(e) => handleTip(e, amount)}
                        className="px-3 py-1.5 hover:bg-muted rounded text-[9px] font-bold text-foreground whitespace-nowrap transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-1">
                          <img src={TJ_COIN_ICON} className="w-2.5 h-2.5" alt="" />
                          {amount}
                        </div>
                        <span className="text-[7px] opacity-40">TON</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;