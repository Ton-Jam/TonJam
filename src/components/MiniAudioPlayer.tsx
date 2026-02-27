import React from "react";
import { useAudio } from "@/context/AudioContext";
import { useNavigate } from "react-router-dom";
import { Play, Pause, MoreVertical, X, Music2 } from "lucide-react";

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
    progress,
    closePlayer,
    setFullPlayerOpen,
  } = useAudio();

  if (!currentTrack) return null;

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artist/${currentTrack.artistId}`);
  };

  return (
    <div
      className="fixed bottom-20 lg:bottom-0 left-0 right-0 z-[45] bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 py-2 flex items-center justify-between shadow-2xl h-16 cursor-pointer hover:bg-white/[0.03] transition-all lg:left-64"
      onClick={() => setFullPlayerOpen(true)}
    >
      <div className="flex items-center gap-3 w-[65%] cursor-pointer">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900">
          <img
            src={currentTrack.coverUrl}
            className="w-full h-full object-cover"
            alt=""
          />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.1s]"></div>
                <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.2s]"></div>
                <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite_0.3s]"></div>
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-[12px] font-bold truncate text-white uppercase tracking-tight leading-tight">
            {currentTrack.title}
          </h4>
          <p
            onClick={handleArtistClick}
            className="text-[10px] text-white/40 truncate uppercase font-bold tracking-widest hover:text-blue-500 transition-colors inline-block leading-tight"
          >
            {currentTrack.artist}
          </p>
        </div>
      </div>
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white fill-white" />
          ) : (
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          )}
        </button>
        <button
          onClick={onOptionsClick}
          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/5 rounded-full"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        <button
          onClick={closePlayer}
          className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MiniAudioPlayer;
