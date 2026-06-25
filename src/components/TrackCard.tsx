import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, Headphones, Clock, Share2, Globe, Zap, Coins, ListMusic, Plus, Lock, ChevronDown, ChevronUp, Activity, Key, User, Info, Gem, Trash2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Download, CheckCircle2 } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { MOCK_ARTISTS, TJ_COIN_ICON, MOCK_NFTS } from '@/constants';
import { cn, getPlaceholderImage, shareContent, formatNumber } from '@/lib/utils';
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
    <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[4px] select-none">
      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 animate-[pulse_1.5s_infinite]" />
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
      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Neural Output</DropdownMenuLabel>
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
        <span className="text-[10px] font-bold uppercase tracking-widest">Track Intelligence</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleMint} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Gem className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Mint as NFT</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Share Signal</span>
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
            <span className="text-[10px] font-bold uppercase tracking-widest">Terminate Signal</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  const ContextMenuContentRefined = () => (
    <ContextMenuContent className="bg-[#0A0A0B] border-white/5 text-white shadow-2xl min-w-[200px] p-1 rounded-xl backdrop-blur-3xl">
      <ContextMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Neural Context</ContextMenuLabel>
      <ContextMenuSeparator className="bg-white/5" />
      <ContextMenuItem onClick={handlePlay} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 rounded-lg">
        {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">Execute Playback</span>
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
        <span className="text-[10px] font-bold uppercase tracking-widest">Share Artifact</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const MoreOptionsButton = () => (
    <button 
      onClick={handleOptions}
      className="p-2 rounded-xl transition-all hover:bg-white/10 text-foreground hover:text-blue-400 flex-shrink-0 active:scale-90"
      aria-label="Track options"
    >
      <MoreVertical className="h-6 w-6" strokeWidth={3} />
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
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex items-center gap-5 p-3 rounded-[4px] hover:bg-white/5 transition-all cursor-pointer w-full outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 ${className}`}
          onClick={handleCardClickInner}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
          role="button"
          tabIndex={0}
        >
            <div className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0 shadow-sm border border-white/5 group-hover:border-blue-500/30 transition-colors">
              <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }} />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
                <button onClick={handlePlay} className="text-white">
                  {track.tokenGating?.enabled && !hasAccess ? (
                    <Lock className="h-4 w-4" />
                  ) : (isActive && isAudioLoading) ? (
                    <img src={TJ_COIN_ICON} className="h-5 w-5 animate-spin" alt="Loading" />
                  ) : isActive && isPlaying ? (
                    <Pause className="h-5 w-5 fill-current animate-pulse" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className={`text-[9px] font-bold uppercase tracking-tighter line-clamp-2 whitespace-normal break-words ${isActive ? 'text-primary' : 'text-foreground'}`}>{track.title}</h4>
                {isComingSoon && (
                  <span className="text-[6.5px] font-black tracking-widest text-[#050A24] bg-amber-500 px-1 py-0.2 rounded-[2px] uppercase animate-pulse">
                    SOON
                  </span>
                )}
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p 
                    className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5 group-hover:text-primary transition-colors hover:underline cursor-pointer inline-block"
                    onClick={handleArtistClick}
                  >
                    {track.artist}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 bg-zinc-950/90 backdrop-blur-xl border-white/10 p-4">
                  <div className="flex justify-between space-x-4">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                      <AvatarImage src={artist?.avatarUrl} />
                      <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-400">{track.artist?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-[11px] font-black uppercase tracking-tighter text-white">{track.artist}</h4>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                        {artist?.followers?.toLocaleString() || '0'} Followers
                      </p>
                      <div className="flex items-center pt-2 gap-2">
                        <Activity className="h-3 w-3 text-emerald-500" />
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Neural_Sync Active</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <MoreOptionsButton />
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContentRefined />
      </ContextMenu>
    );
  }

  // Removed handleToggleExpand

  if (variant === 'row') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div 
          whileHover={{ opacity: 1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          className={`flex flex-col w-full group/row border-b border-zinc-700 last:border-0 transition-colors rounded-[4px] ${className}`}
        >
            <div 
              className="flex items-center gap-4 px-4 sm:px-8 py-2 sm:py-3 cursor-pointer w-full outline-none focus-visible:bg-white/5"
              onClick={handleCardClickInner}
              onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
              role="button"
              tabIndex={0}
              aria-label={`View track: ${track.title} by ${track.artist}`}
            >
              {index !== undefined && (
                <div className="hidden sm:flex items-center justify-center w-8 text-[11px] font-bold text-muted-foreground/20 group-hover/row:text-blue-500 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
              )}

              <div 
                className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0 cursor-pointer shadow-sm group/thumb border border-white/5 group-hover/row:border-blue-500/20 transition-colors" 
                onClick={(e) => { e.stopPropagation(); handlePlay(e); }}
              >
                <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} alt="" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }} />
                
                {isCached && (
                    <div className="absolute top-1 left-1 bg-emerald-600/90 p-0.5 rounded-full">
                        <CheckCircle2 className="w-2 h-2 text-white" />
                    </div>
                )}
                
                <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'}`}>
                  {track.tokenGating?.enabled && !hasAccess ? (
                      <Lock className="h-4 w-4 text-white" />
                  ) : (isActive && isAudioLoading) ? (
                      <img src={TJ_COIN_ICON} className="h-6 w-6 animate-spin" alt="Loading" />
                  ) : isActive && isPlaying ? (
                      <div className="flex items-end justify-center gap-1 h-4" aria-hidden="true">
                        <div className="w-0.5 bg-blue-400 h-2 animate-[bounce_1s_infinite_0ms]"></div>
                        <div className="w-0.5 bg-blue-400 h-4 animate-[bounce_1s_infinite_200ms]"></div>
                        <div className="w-0.5 bg-blue-400 h-3 animate-[bounce_1s_infinite_400ms]"></div>
                      </div>
                  ) : (
                      <Play className="h-6 w-6 text-white fill-current animate-in zoom-in-50 duration-300" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`text-xs font-bold uppercase tracking-tight line-clamp-2 whitespace-normal break-words ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {track.title}
                  </h4>
                  {isComingSoon && (
                    <span className="text-[7px] font-black tracking-widest text-[#050A24] bg-amber-500 px-1.5 py-0.5 rounded-[4px] uppercase animate-pulse">
                      COMING SOON
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <p 
                        className="text-[8.5px] font-black text-foreground/80 uppercase tracking-[0.2em] truncate hover:text-primary transition-colors cursor-pointer hover:underline"
                        onClick={handleArtistClick}
                      >
                        {track.artist}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 bg-zinc-950/90 backdrop-blur-xl border-white/10 p-4">
                      <div className="flex justify-between space-x-4">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                          <AvatarImage src={artist?.avatarUrl} />
                          <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-400">{track.artist?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-[11px] font-black uppercase tracking-tighter text-white">{track.artist}</h4>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                            {artist?.followers?.toLocaleString() || '0'} Listeners Monthly
                          </p>
                          <div className="flex items-center pt-2 gap-2 text-blue-400">
                             <TrendingUp className="h-3 w-3" />
                             <span className="text-[8px] font-black uppercase tracking-[0.2em]">Ascending Orbit</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                {isComingSoon && (
                  <div className="md:hidden mt-2 flex items-center gap-2">
                    <CountdownTimer targetDate={track.releaseDate!} />
                    <button
                      onClick={handleHypeClick}
                      className={`cursor-pointer transition-all rounded-[4px] h-5 px-2.5 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 leading-none ${isHyped ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-[#050A24]'}`}
                    >
                      {isHyped ? 'SYNCED' : 'HYPE'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 sm:gap-6 pr-1">
                <div className="hidden md:flex items-center gap-8">
                  {isComingSoon ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">DRIPPING IN</span>
                      <CountdownTimer targetDate={track.releaseDate!} />
                      <button
                        onClick={handleHypeClick}
                        className={`cursor-pointer transition-all rounded-[4px] h-6 px-3 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 leading-none ${isHyped ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-[#050A24]'}`}
                      >
                        {isHyped ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            HYPED & SYNCED
                          </>
                        ) : (
                          <>
                            <Zap className="w-2.5 h-2.5 text-[#050A24] fill-current" />
                            HYPE TRACK
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-end opacity-40 group-hover/row:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Popularity</span>
                        <span className="text-[9px] font-medium text-foreground uppercase group-hover/row:text-red-500">{(track.likes || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end opacity-40 group-hover/row:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Frequency</span>
                        <span className="text-[9px] font-medium text-foreground uppercase group-hover/row:text-blue-400">{formatNumber(track.playCount || 0)}</span>
                      </div>
                      <div className="flex flex-col items-end min-w-[60px] opacity-40 group-hover/row:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Length</span>
                        <span className="text-[9px] font-medium text-foreground">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                    <MoreOptionsButton />
                </div>
              </div>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "group relative cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-[4px] p-2 bg-transparent border border-transparent w-full",
            className
          )}
          onClick={handleCardClickInner}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View track: ${track.title} by ${track.artist}`}
        >
          {/* Image Container - 1:1 Aspect Ratio */}
          <div className="relative aspect-square rounded-[4px] overflow-hidden bg-neutral-900 mb-2 transition-all border border-white/5">
            <img 
              src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track.id}`); }}
            />
            
            <div className={`absolute inset-0 bg-black/40 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}>
              <button 
                className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-blue-600/30 border border-white/20"
                onClick={handlePlay}
                aria-label={isActive && isPlaying ? "Pause track" : "Play track"}
              >
                {track.tokenGating?.enabled && !hasAccess ? (
                  <Lock className="h-4 w-4" />
                ) : (isActive && isAudioLoading) ? (
                  <img src={TJ_COIN_ICON} className="h-4 w-4 animate-spin" alt="Loading" />
                ) : isActive && isPlaying ? (
                  <Pause className="h-4 w-4 fill-current animate-pulse" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
            
            {/* Status indicators */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isComingSoon && (
                <div className="bg-amber-500 text-[8px] font-black text-[#050A24] px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest animate-pulse shadow-md shadow-amber-500/20">
                  COMING SOON
                </div>
              )}
              {track.isNFT && (
                <div className="bg-purple-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest border border-purple-400/30">
                  NFT_ASSET
                </div>
              )}
              {associatedNft && !track.isNFT && (
                <div className="bg-purple-600/90 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest">
                  NFT AVAILABLE
                </div>
              )}
              {track.tokenGating?.enabled && (
                <div className="bg-amber-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest border border-amber-400/30 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" /> GATED
                </div>
              )}
              {isCached && (
                <div className="bg-emerald-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> CACHED
                </div>
              )}
            </div>
          </div>

          {/* Content Below Card */}
          <div className="px-0.5 flex flex-col items-start w-full gap-1 mt-2">
            <div className="flex justify-between items-start gap-1 w-full">
              <h3 className={`text-[10px] font-black leading-tight line-clamp-2 whitespace-normal break-words uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {track.title}
              </h3>
              <div className="scale-75">
                <MoreOptionsButton />
              </div>
            </div>
            
            <p 
              className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em] truncate hover:text-primary transition-colors cursor-pointer hover:underline"
              onClick={handleArtistClick}
            >
              {track.artist}
            </p>

            {isComingSoon ? (
              <div className="w-full mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-bold text-muted-foreground uppercase tracking-widest leading-none">DROP TIME</span>
                  <CountdownTimer targetDate={track.releaseDate!} />
                </div>
                <button
                  onClick={handleHypeClick}
                  className={cn(
                      "w-full cursor-pointer transition-all rounded-[4px] h-7 text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 text-white shadow-md leading-none",
                      isHyped 
                        ? 'bg-emerald-600 shadow-emerald-500/10' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/10'
                  )}
                >
                  {isHyped ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      SYNCED
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-white fill-current animate-pulse" />
                      PRE-SAVE / HYPE
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mt-2">
                <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    <Headphones className="w-3 h-3" />
                    {formatNumber(track.playCount || 0)}
                </div>

                <button
                  onClick={handlePlay}
                  className={cn(
                      "cursor-pointer transition-all rounded-full hover:scale-105 active:scale-95 h-6 px-3 text-[9px] font-black uppercase tracking-[0.1em] text-white",
                      'bg-gradient-to-r from-blue-600 to-blue-400 shadow-md shadow-blue-500/20'
                  )}
                >
                  Play
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContentRefined />
    </ContextMenu>
  );
};

export default TrackCard;
