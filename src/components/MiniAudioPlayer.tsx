import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { Play, Pause, MoreVertical, X, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from "lucide-react";
import { MOCK_ARTISTS } from "@/constants";
import { getPlaceholderImage } from "@/lib/utils";

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
    toggleMute
  } = useAudio();

  if (!currentTrack) return null;

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${currentTrack.artistId}`);
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptionsClick) {
      onOptionsClick();
    } else {
      setOptionsTrack(currentTrack);
    }
  };

  return (
    <>
      <div
        className={`fixed ${isMobileNavHidden ? 'bottom-0' : 'bottom-[61px]'} lg:bottom-0 left-0 right-0 z-[45] bg-background/95 backdrop-blur-xl px-3 py-2 flex items-center justify-between shadow-2xl h-16 cursor-pointer hover:bg-muted/50 transition-all lg:left-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
        onClick={() => setFullPlayerOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFullPlayerOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open full player for ${currentTrack.title}`}
      >
        <div className="flex items-center gap-2 w-[50%] sm:w-[60%] cursor-pointer relative z-10">
          <div className="relative w-11 h-11 rounded-2 overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={currentTrack.coverUrl || getPlaceholderImage(`track-${currentTrack.id}`)}
              className="w-full h-full object-cover"
              alt=""
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex gap-3 items-end h-3">
                  <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite_0.1s]"></div>
                  <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite_0.2s]"></div>
                  <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite_0.3s]"></div>
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-bold truncate text-foreground uppercase tracking-tight leading-tight flex items-center gap-2">
              {currentTrack.title}
              {isHighFidelity && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded-full tracking-widest uppercase flex-shrink-0">
                  Hi-Fi
                </span>
              )}
            </h4>
            <div className="flex items-center gap-3 mt-3">
              <p
                onClick={handleArtistClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleArtistClick(e as any);
                  }
                }}
                role="button"
                tabIndex={0}
                className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-widest hover:text-blue-500 transition-colors inline-block leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                aria-label={`View ${currentTrack.artist}'s profile`}
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleShuffle} className={`p-1.5 rounded-full ${isShuffle ? 'text-blue-500' : 'text-muted-foreground'}`}>
              <Shuffle className="h-4 w-4" />
            </button>
            <button onClick={prevTrack} className="p-1.5 text-foreground">
              <SkipBack className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 mr-1">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground ml-1" />
              )}
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={nextTrack} className="p-1.5 text-foreground">
              <SkipForward className="h-4 w-4" />
            </button>
            <button onClick={toggleRepeat} className={`p-1.5 rounded-full relative ${repeatMode !== 'off' ? 'text-blue-500' : 'text-muted-foreground'}`}>
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center">1</span>}
            </button>
            <div className="flex items-center gap-1 w-20">
              <button onClick={toggleMute} className="text-muted-foreground">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          
          <button
            onClick={handleOptionsClick}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-muted rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Track options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="hidden sm:flex w-9 h-9 rounded-full bg-muted items-center justify-center hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/30 overflow-hidden pointer-events-none z-10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MiniAudioPlayer;
