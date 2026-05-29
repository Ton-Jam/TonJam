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
      <ContextMenu>
        <ContextMenuTrigger>
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex items-center gap-5 p-3 rounded-[2px] hover:bg-white/5 transition-all cursor-pointer w-full outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 ${className}`}
          onClick={handleCardClickInner}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
          role="button"
          tabIndex={0}
        >
            <div className="relative w-12 h-12 rounded-[2px] overflow-hidden flex-shrink-0 shadow-sm border border-white/5 group-hover:border-blue-500/30 transition-colors">
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
              <h4 className={`text-[9px] font-bold uppercase tracking-tighter line-clamp-2 whitespace-normal break-words ${isActive ? 'text-primary' : 'text-foreground'}`}>{track.title}</h4>
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

  const [isExpanded, setIsExpanded] = React.useState(false);

  if (variant === 'row') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
        <motion.div 
          whileHover={{ opacity: 1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          className={`flex flex-col w-full group/row last:border-0 transition-colors rounded-[2px] mx-2 ${className}`}
        >
            <div 
              className="flex items-center gap-4 p-2 sm:p-3 cursor-pointer w-full outline-none focus-visible:bg-white/5"
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
                className="relative w-12 h-12 rounded-[2px] overflow-hidden flex-shrink-0 cursor-pointer shadow-sm group/thumb border border-white/5 group-hover/row:border-blue-500/20 transition-colors" 
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
                <h4 className={`text-[9px] font-bold uppercase tracking-tight line-clamp-2 whitespace-normal break-words ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {track.title}
                </h4>
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
              </div>

              <div className="flex items-center gap-4 sm:gap-6 pr-1">
                <div className="hidden md:flex items-center gap-8">
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
                </div>

                <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                      className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-500/10 text-blue-500' : 'text-muted-foreground/20 hover:text-blue-400 hover:bg-white/5'}`}
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <MoreOptionsButton />
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-5 pb-5 pt-2 overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[2px] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Pulse_BPM</p>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{track.bpm || '128'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Harmonic_Key</p>
                      <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest">{track.key || 'C# Maj'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Encoded_Format</p>
                      <p className="text-xs font-bold text-purple-500 uppercase tracking-widest">{track.bitrate || '320k'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Core_Genre</p>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{track.genre || 'Sonic'}</p>
                    </div>
                </div>
              </motion.div>
            )}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative cursor-pointer transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-[3px] p-2 bg-transparent hover:border-blue-500/20 hover:bg-white/[0.03] border border-transparent w-full ${className}`}
          onClick={handleCardClickInner}
          onKeyDown={(e) => handleKeyDown(e, () => handleCardClickInner(e as any))}
          role="button"
          tabIndex={0}
          aria-label={`View track: ${track.title} by ${track.artist}`}
        >
          {/* Image Container - 1:1 Aspect Ratio */}
          <div className="relative aspect-square rounded-[3px] overflow-hidden bg-neutral-900 mb-2 transition-all border border-white/5">
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
              {track.isNFT && (
                <div className="bg-purple-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest border border-purple-400/30">
                  NFT_ASSET
                </div>
              )}
              {associatedNft && !track.isNFT && (
                <div className="bg-purple-600/90 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest">
                  NFT AVAILABLE
                </div>
              )}
              {track.tokenGating?.enabled && (
                <div className="bg-amber-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest border border-amber-400/30 flex items-center gap-1">
                  <Key className="w-2.5 h-2.5" /> GATED
                </div>
              )}
              {isCached && (
                <div className="bg-emerald-600/80 backdrop-blur-md text-[8px] font-bold text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> CACHED
                </div>
              )}
            </div>
          </div>

          {/* Content Below Card */}
          <div className="px-0.5 flex flex-col">
            <div className="flex justify-between items-start gap-1">
              <h3 className={`text-xs font-black leading-tight line-clamp-2 whitespace-normal break-words uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {track.title}
              </h3>
              <MoreOptionsButton />
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p 
                    className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] truncate hover:text-primary transition-colors cursor-pointer hover:underline"
                    onClick={handleArtistClick}
                  >
                    {track.artist}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 bg-zinc-950/90 backdrop-blur-xl border-white/10 p-4 z-[100]">
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
                      <button className="w-full mt-2 py-1.5 bg-blue-600 rounded-[3px] text-[8px] font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-colors">
                        View Dossier
                      </button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    <Headphones className="w-3 h-3" />
                    {formatNumber(track.playCount || 0)}
                </div>
                {!track.isNFT && track.price && (
                    <div className="flex items-center gap-1 text-[9px] font-medium text-amber-500 uppercase tracking-[0.2em]">
                        <Coins className="w-3 h-3" />
                        {track.price} TON
                    </div>
                )}
              </div>

              {associatedNft ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/nft/${associatedNft.id}`);
                  }}
                  className="text-[8px] font-black text-white hover:text-white transition-all px-2 py-1 bg-purple-600 hover:bg-purple-550 rounded-[3px] uppercase tracking-[0.2em] shadow-md shadow-purple-600/10 border-none flex items-center gap-1 cursor-pointer"
                >
                  <Gem className="w-2.5 h-2.5 text-white" /> NFT
                </button>
              ) : onMint && !track.isNFT ? (
                <button
                  onClick={handleMint}
                  className="text-[8px] font-black text-white hover:text-white transition-all px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 rounded-[3px] uppercase tracking-[0.2em] shadow-md shadow-blue-600/10 border-none cursor-pointer"
                >
                  MINT
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContentRefined />
    </ContextMenu>
  );
};

export default TrackCard;
