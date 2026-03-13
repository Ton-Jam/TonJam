import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { Play, Pause, MoreVertical, X, Music2, SkipBack, SkipForward } from "lucide-react";
import TrackOptionsModal from "./TrackOptionsModal";
import { MOCK_ARTISTS } from "@/constants";

interface MiniAudioPlayerProps {
  onOptionsClick?: () => void;
}

const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  onOptionsClick,
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
  } = useAudio();
  const [showOptions, setShowOptions] = useState(false);

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
      setShowOptions(true);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-20 lg:bottom-0 left-0 right-0 z-[45] bg-[#0a192f] border-t border-border/50 px-4 py-2 flex items-center justify-between shadow-2xl h-16 cursor-pointer hover:bg-[#112240] transition-all lg:left-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div className="flex items-center gap-3 w-[65%] cursor-pointer">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900">
            <img
              src={currentTrack.coverUrl}
              className="w-full h-full object-cover"
              alt=""
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.1s]"></div>
                  <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.2s]"></div>
                  <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.3s]"></div>
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-bold truncate text-foreground uppercase tracking-tight leading-tight">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {MOCK_ARTISTS.find(a => a.id === currentTrack.artistId) && (
                <img 
                  src={MOCK_ARTISTS.find(a => a.id === currentTrack.artistId)?.avatarUrl} 
                  alt={currentTrack.artist} 
                  className="w-3.5 h-3.5 rounded-full object-cover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={handleArtistClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleArtistClick(e as any);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${currentTrack.artist}'s profile`}
                />
              )}
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
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-foreground fill-white" />
            ) : (
              <Play className="h-5 w-5 text-foreground fill-white ml-0.5" />
            )}
          </button>
          <button
            onClick={handleOptionsClick}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-muted/50 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Track options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <button
            onClick={closePlayer}
            className="hidden sm:flex w-10 h-10 rounded-full bg-muted/50 items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/50 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      {showOptions && (
        <TrackOptionsModal
          track={currentTrack}
          onClose={() => setShowOptions(false)}
        />
      )}
    </>
  );
};

export default MiniAudioPlayer;
