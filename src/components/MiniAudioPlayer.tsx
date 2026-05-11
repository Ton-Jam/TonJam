import React from "react";
import { motion } from "motion/react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Pause, 
  MoreVertical, 
  X, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Maximize2,
  Share2,
  Heart,
  ListMusic,
  Plus,
  User,
  Info,
  Gem
} from "lucide-react";
import { getPlaceholderImage, cn, shareContent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MiniAudioPlayerProps {
  onOptionsClick?: () => void;
  isMobileNavHidden?: boolean;
}

const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  onOptionsClick,
  isMobileNavHidden,
}) => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    closePlayer,
    setFullPlayerOpen,
    isHighFidelity,
    setOptionsTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    addToQueue,
    setTrackToAddToPlaylist,
    likedTrackIds,
    toggleLikeTrack,
    addNotification
  } = useAudio();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.innerWidth < 1024) {
      if (onOptionsClick) {
        onOptionsClick();
      } else {
        setOptionsTrack(currentTrack);
      }
    }
  };

  const handleToggleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleLikeTrack(currentTrack.id);
  };

  const handleAddToQueue = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToQueue(currentTrack);
  };

  const handleAddToPlaylist = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTrackToAddToPlaylist(currentTrack);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    const result = await shareContent({
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Listening to ${currentTrack.title} on TonJam!`,
      url: shareUrl,
    });
    if (result.success) {
      addNotification(result.method === 'clipboard' ? 'Link copied!' : 'Shared!', 'success');
    }
  };

  const PlayerMenuContent = () => (
    <>
      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-4">Neural Output</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handleToggleLike} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
        <span className="text-[10px] font-black uppercase tracking-widest">{isLiked ? "Unlike Track" : "Like Track"}</span>
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
      <DropdownMenuItem onClick={() => navigate(`/artist/${currentTrack.artistId}`)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <User className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">View Artist</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(`/track/${currentTrack.id}`)} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Info className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Track Intelligence</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate('/mint', { state: { track: currentTrack } })} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Gem className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Mint as NFT</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-white/5" />
      <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-3 px-4 cursor-pointer focus:bg-blue-600 focus:text-white transition-colors">
        <Share2 className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Share Signal</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed left-0 right-0 z-[48] bg-background/90 backdrop-blur-3xl border-t border-white/10 px-4 py-2 flex flex-col items-stretch shadow-[0_-20px_50px_rgba(0,0,0,0.5)] h-18 lg:left-64 transition-all duration-300",
        isMobileNavHidden ? "bottom-0" : "bottom-[72px] lg:bottom-0"
      )}
    >
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 px-0">
        <Progress 
          value={progress} 
          className="h-[2px] w-full rounded-none bg-muted/20" 
        />
      </div>

      <div className="flex items-center justify-between h-full pt-1">
        {/* Track Info */}
        <div 
          className="flex items-center gap-3 w-[45%] sm:w-[50%] cursor-pointer group"
          onClick={() => setFullPlayerOpen(true)}
        >
          <div className="relative w-11 h-11 rounded-[2px] overflow-hidden flex-shrink-0 bg-muted shadow-lg ring-1 ring-white/5">
            <img
              src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt=""
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-[1px]">
                <div className="flex gap-1 items-end h-3">
                  <div className="w-0.75 bg-white animate-[bounce_0.6s_infinite_0.1s] rounded-full"></div>
                  <div className="w-0.75 bg-white animate-[bounce_0.6s_infinite_0.3s] rounded-full"></div>
                  <div className="w-0.75 bg-white animate-[bounce_0.6s_infinite_0.2s] rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <h4 className="text-[9.5px] font-black truncate text-foreground uppercase tracking-tighter leading-none">
                {currentTrack.title}
              </h4>
              {isHighFidelity && (
                <span className="bg-blue-600 text-white text-[5.5px] font-black px-1 py-0.5 rounded-[1px] tracking-[0.2em] uppercase flex-shrink-0">
                  Hi-Fi
                </span>
              )}
            </div>
            <button
              onClick={handleArtistClick}
              className="text-[7.5px] text-muted-foreground/60 truncate uppercase font-black tracking-widest hover:text-blue-500 transition-colors text-left leading-none w-fit"
            >
              {currentTrack.artist}
            </button>
          </div>
        </div>

        {/* Controls Block (Grouped on the right) */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-10">
          <div className="hidden sm:flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-[2px]", isShuffle ? "text-blue-500 bg-blue-500/5" : "text-muted-foreground/40")}
                  onClick={toggleShuffle}
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shuffle</TooltipContent>
            </Tooltip>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[2px] text-foreground/80"
              onClick={prevTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="icon"
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 mx-1"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[2px] text-foreground/80"
              onClick={nextTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-[2px] relative", repeatMode !== 'off' ? "text-blue-500 bg-blue-500/5" : "text-muted-foreground/40")}
                  onClick={toggleRepeat}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  {repeatMode === 'one' && (
                    <span className="absolute top-1 right-1 text-[6px] font-black bg-blue-500 text-white rounded-full w-2.5 h-2.5 flex items-center justify-center">1</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Repeat</TooltipContent>
            </Tooltip>
          </div>

          <div className="hidden md:flex items-center gap-3 ml-2 mr-2">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              className="w-20"
              onValueChange={(vals) => setVolume(vals[0] / 100)}
            />
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-[2px] text-muted-foreground/40 hover:text-foreground hidden sm:flex"
                  onClick={() => setFullPlayerOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Full Player</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-[2px] text-muted-foreground/40 hover:text-foreground outline-none"
                  onClick={handleOptionsClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top"
                className="hidden lg:block bg-[#0A0A0B]/95 border-white/5 text-white shadow-[0_-16px_60px_rgba(0,0,0,0.8)] min-w-[220px] p-1 rounded-xl backdrop-blur-3xl"
              >
                <PlayerMenuContent />
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-[2px] text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
              onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniAudioPlayer;
