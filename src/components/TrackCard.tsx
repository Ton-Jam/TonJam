import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, Share2, Globe, Zap, Coins, ListMusic, Plus, Lock, ChevronDown, ChevronUp, Activity, Key, User, Info, Gem, Trash2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Download, CheckCircle2 } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_ARTISTS, TJ_COIN_ICON, MOCK_NFTS } from '@/constants';
import { cn, getPlaceholderImage, shareContent, formatNumber } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import confetti from 'canvas-confetti';
import { useTonConnectUI } from '@tonconnect/ui-react';
import SkeletonCard from './SkeletonCard';
import { useTokenGating } from '@/hooks/useTokenGating';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from 'motion/react';
import { cardTokens } from '@/design';


const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const calculateTimeLeft = React.useCallback(() => {
    const total = Date.parse(targetDate) - Date.now();
    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-reward bg-reward/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[4px] select-none">
      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-reward animate-[pulse_1.5s_infinite]" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}h{' '}
        {String(timeLeft.minutes).padStart(2, '0')}m{' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};

interface TrackCardProps {
  track: Track;
  variant?: 'default' | 'row' | 'compact';
  index?: number;
  onMint?: (track: Track) => void;
  onRemove?: () => void;
  className?: string;
  isLoading?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  variant = 'default', 
  index,
  onMint, 
  onRemove,
  className = '', 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const { 
    playTrack, currentTrack, isPlaying, setOptionsTrack, addNotification, 
    jamTrack, artists, addToQueue, setTrackToAddToPlaylist, likedTrackIds, 
    toggleLikeTrack, isLoading: isAudioLoading, userProfile, 
    downloadTrackForOffline, isTrackCached, deleteCachedTrack 
  } = useAudio();
  const [isCached, setIsCached] = React.useState(false);
  const [isHyped, setIsHyped] = React.useState(false);

  React.useEffect(() => {
    const checkCache = async () => {
      const cached = await isTrackCached(track.id);
      setIsCached(cached);
    };
    checkCache();
  }, [track.id, isTrackCached]);

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await downloadTrackForOffline(track);
    setIsCached(true);
  };
    
  const handleDeleteCached = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteCachedTrack(track.id);
    setIsCached(false);
  };
  const [tonConnectUI] = useTonConnectUI();
  const { hasAccess } = useTokenGating(track.tokenGating);

  const isComingSoon = React.useMemo(() => {
    if (!track.releaseDate) return false;
    return new Date(track.releaseDate).getTime() > Date.now();
  }, [track.releaseDate]);

  const handleHypeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHyped(prev => !prev);
    if (!isHyped) {
      addNotification(`Frequency aligned! Pre-saved '${track.title}'. Launch alert synchronized.`, 'success');
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#FFB703', '#F1C40F', '#E67E22']
      });
    } else {
      addNotification(`Pre-save telemetry reset for '${track.title}'.`, 'info');
    }
  };
  
  if (isLoading) {
    return <SkeletonCard variant={variant} className={className} />;
  }
  const isActive = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.includes(track.id);
  const artist = artists.find(a => a.uid === track.artistId);

  const associatedNft = React.useMemo(() => {
    return MOCK_NFTS.find(n => n.trackId === track.id);
  }, [track.id]);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.artistId) {
      navigate(`/artist/${track.artistId}`);
    }
  };

  const handleMint = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onMint) {
      onMint(track);
    } else {
      navigate('/mint', { state: { track } });
    }
  };

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isComingSoon) {
      addNotification(`'${track.title}' is unreleased! Pre-save and align frequency telemetry to build hype.`, 'info');
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.8 }
      });
      return;
    }
    if (track.tokenGating?.enabled && !hasAccess) {
      addNotification(`This track is exclusive to ${track.tokenGating.tokenSymbol} holders.`, 'warning');
      return;
    }
    playTrack(track);
  };

  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsTrack(track, { onRemove });
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#/track/${track.id}`;
    const result = await shareContent({
      title: `${track.title} by ${track.artist}`,
      text: `Check out this track on TonJam: ${track.title}`,
      url: shareUrl,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification('Link copied to clipboard!', 'success');
      } else {
        addNotification('Shared successfully!', 'success');
      }
    }
  };

  const handleToggleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleLikeTrack(track.id);
  };

  const handleAddToQueue = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToQueue(track);
  };

  const handleAddToPlaylist = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTrackToAddToPlaylist(track);
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/track/${track.id}`);
  };

  const handleViewArtist = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (track.artistId) navigate(`/artist/${track.artistId}`);
  };

  const TrackMenuContent = () => (
    <>
      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Track Options</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handlePlay} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">Play Track</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleAddToQueue} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <ListMusic className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add to Queue</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleAddToPlaylist} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Plus className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add to Playlist</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handleViewArtist} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <User className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">View Artist</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleViewDetails} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Info className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Track Details</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleMint} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Gem className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Mint as NFT</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Share Track</span>
      </DropdownMenuItem>
      
      {userProfile.ownedTrackIds?.includes(track.id) && (
        <DropdownMenuItem onClick={isCached ? handleDeleteCached : handleDownload} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
          <Download className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isCached ? 'Remove Offline' : 'Download for Offline'}</span>
        </DropdownMenuItem>
      )}
      
      {onRemove && (
        <>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem onClick={onRemove} className="flex items-center gap-3 py-3 px-4 cursor-pointer text-red-500 focus:bg-red-600 focus:text-white transition-colors">
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Remove Track</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  const ContextMenuContentRefined = () => (
    <ContextMenuContent className="bg-[#0A0A0B] border-white/5 text-white shadow-2xl min-w-[200px] p-1 rounded-xl backdrop-blur-3xl">
      <ContextMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Actions</ContextMenuLabel>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handlePlay} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">Play Track</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handleAddToQueue} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <ListMusic className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add to Queue</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleAddToPlaylist} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Plus className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add to Playlist</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handleViewArtist} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <User className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">View Artist</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Share Track</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const MoreOptionsButton = () => (
    <button 
      onClick={handleOptions}
      style={{ width: cardTokens.track.actionIconSize, height: cardTokens.track.actionIconSize }}
      className="p-1 rounded-xl transition-all hover:bg-white/10 text-foreground hover:text-blue-400 flex-shrink-0 active:scale-90 flex items-center justify-center"
      aria-label="Track options"
    >
      <MoreVertical style={{ width: cardTokens.track.actionIconSize, height: cardTokens.track.actionIconSize }} strokeWidth={3} />
    </button>
  );

  const handleCardClickInner = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/track/${track.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (variant === 'compact') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_e, info) => {
              if (Math.abs(info.offset.x) > 60) {
                addToQueue(track);
                triggerHaptic('success');
                addNotification(`Added "${track.title}" to queue`, 'success');
              }
            }}
            className={`group flex items-center gap-3 p-1.5 rounded-lg bg-transparent transition-all cursor-pointer w-full outline-none select-none ${className}`}
            onClick={handleCardClickInner}
            onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
            role="button"
            tabIndex={0}
          >
            <div className="relative w-11 h-11 rounded-md overflow-hidden flex-shrink-0 bg-neutral-900 shadow-sm">
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                alt={track.title} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }} 
              />
              <button 
                onClick={handlePlay} 
                className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                aria-label={isActive && isPlaying ? "Pause" : "Play"}
              >
                {isActive && isAudioLoading ? (
                  <img src={TJ_COIN_ICON} className="h-4 w-4 animate-spin" alt="Loading" />
                ) : isActive && isPlaying ? (
                  <Pause className="h-4 w-4 fill-current text-blue-400" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-medium leading-tight truncate ${isActive ? 'text-blue-400 font-semibold' : 'text-white/90'}`}>
                {track.title}
              </h4>
              <p 
                className="text-[11px] text-zinc-400 truncate mt-0.5 hover:text-white transition-colors cursor-pointer"
                onClick={handleArtistClick}
              >
                {track.artist}
              </p>
            </div>
            <MoreOptionsButton />
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>
    );
  }

  if (variant === 'row') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_e, info) => {
              if (Math.abs(info.offset.x) > 60) {
                addToQueue(track);
                triggerHaptic('success');
                addNotification(`Added "${track.title}" to queue`, 'success');
              }
            }}
            className={`flex items-center gap-3.5 p-1.5 rounded-lg group/row bg-transparent transition-colors cursor-pointer w-full select-none ${className}`}
            onClick={handleCardClickInner}
            onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
            role="button"
            tabIndex={0}
            aria-label={`View track: ${track.title} by ${track.artist}`}
          >
            {index !== undefined && (
              <div className="hidden sm:flex items-center justify-center w-6 text-[12px] font-medium text-white/30 group-hover/row:text-white/80 transition-colors">
                {index + 1}
              </div>
            )}

            <div 
              className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-neutral-900 shadow-sm"
              onClick={(e) => { e.stopPropagation(); handlePlay(e); }}
            >
              <img 
                src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                alt={track.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover/row:scale-105" 
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }} 
              />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'}`}>
                {isActive && isAudioLoading ? (
                  <img src={TJ_COIN_ICON} className="h-5 w-5 animate-spin" alt="Loading" />
                ) : isActive && isPlaying ? (
                  <Pause className="h-4 w-4 fill-current text-blue-400" />
                ) : (
                  <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-medium leading-tight truncate ${isActive ? 'text-blue-400 font-semibold' : 'text-white/95'}`}>
                {track.title}
              </h4>
              <p 
                className="text-[11px] text-zinc-400 truncate mt-0.5 hover:text-white transition-colors cursor-pointer"
                onClick={handleArtistClick}
              >
                {track.artist}
              </p>
            </div>

            <div className="flex items-center gap-4 text-[12px] text-zinc-400">
              <span className="hidden sm:inline font-mono text-[11px]">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </span>
              <MoreOptionsButton />
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div 
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_e, info) => {
            if (Math.abs(info.offset.x) > 60) {
              addToQueue(track);
              triggerHaptic('success');
              addNotification(`Added "${track.title}" to queue`, 'success');
            }
          }}
          className={cn(
            "group relative cursor-pointer p-0 bg-transparent transition-all duration-200 flex flex-col w-[155px] shrink-0 select-none",
            className
          )}
          onClick={handleCardClickInner}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View track: ${track.title} by ${track.artist}`}
        >
          {/* Artwork - 1:1 Square with Floating Play Button */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900/60 shadow-md">
            <img 
              src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
              alt={track.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }}
            />
            
            {/* Spotify-style Floating Action Button */}
            <div className={cn(
              "absolute bottom-2 right-2 transition-all duration-200",
              isActive 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
            )}>
              <button 
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
                onClick={handlePlay}
                aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
              >
                {isActive && isAudioLoading ? (
                  <img src={TJ_COIN_ICON} className="h-4 w-4 animate-spin" alt="Loading" />
                ) : isActive && isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Clean Track Meta */}
          <div className="flex flex-col w-full min-w-0 mt-2.5">
            <h3 className={cn(
              "text-[13px] font-semibold tracking-tight truncate w-full transition-colors",
              isActive ? 'text-blue-400' : 'text-white/95 group-hover:text-white'
            )}>
              {track.title}
            </h3>
            
            <p 
              className="text-[11px] font-normal text-zinc-400 truncate w-full mt-0.5 hover:text-white transition-colors cursor-pointer"
              onClick={handleArtistClick}
            >
              {track.artist}
            </p>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContentRefined />
    </ContextMenu>
  );
};

export default TrackCard;
