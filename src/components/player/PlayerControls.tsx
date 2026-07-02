import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Sliders,
  Settings,
  Tv,
  Radio,
  Clock,
  Gauge,
  Music4,
  Volume1,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAudio } from "@/context/AudioContext";
import { toast } from "sonner";

interface PlayerControlsProps {
  onEqualizerClick?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  onEqualizerClick,
}) => {
  const {
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    audioElement,
    currentTrack,
  } = useAudio();

  // Playback speed state
  const [speed, setSpeed] = useState(1.0);
  // Sleep timer state (minutes remaining, null if inactive)
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Quality State
  const [audioQuality, setAudioQuality] = useState<"standard" | "high" | "flac">("high");
  // Active Output Device State
  const [activeDevice, setActiveDevice] = useState<string>("Local Device");

  // Sync speed with HTML5 audio element
  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = speed;
    }
  }, [speed, audioElement, currentTrack]);

  // Sleep timer logic
  useEffect(() => {
    if (sleepTimeLeft === null) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      return;
    }

    if (sleepTimeLeft <= 0) {
      if (isPlaying) {
        togglePlay();
        toast.info("Sleep timer ended. Playback paused.");
      }
      setSleepTimeLeft(null);
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      setSleepTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 60000); // decrement every minute

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimeLeft, isPlaying]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    toast.success(`Speed set to ${newSpeed}x`);
  };

  const startSleepTimer = (minutes: number) => {
    setSleepTimeLeft(minutes);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  };

  const cancelSleepTimer = () => {
    setSleepTimeLeft(null);
    toast.info("Sleep timer cancelled");
  };

  const handleVolumeScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val * 100);
    if (isMuted && val > 0) {
      toggleMute();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans py-4" id="tonjam-controls-container">
      {/* Playback speed, sleep timer, device, and audio quality control bar */}
      <div className="flex items-center justify-between gap-2 px-1 text-zinc-400 text-xs">
        {/* Speed Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 rounded-full flex items-center gap-1.5"
              id="btn-playback-speed"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{speed}x</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-950 text-zinc-200 border-0 rounded-lg p-1 min-w-[120px] shadow-xl">
            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-1.5">
              Playback Speed
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-900" />
            {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`text-xs px-2 py-1.5 rounded cursor-pointer ${
                  speed === s
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white"
                }`}
              >
                {s === 1.0 ? "Normal (1.0x)" : `${s}x`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sleep Timer Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 h-8 rounded-full flex items-center gap-1.5 ${
                sleepTimeLeft !== null ? "text-blue-500" : "text-zinc-400 hover:text-white"
              }`}
              id="btn-sleep-timer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{sleepTimeLeft !== null ? `${sleepTimeLeft}m` : "Sleep"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-950 text-zinc-200 border-0 rounded-lg p-1 min-w-[130px] shadow-xl">
            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-1.5">
              Sleep Timer
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-900" />
            {[5, 15, 30, 45, 60].map((m) => (
              <DropdownMenuItem
                key={m}
                onClick={() => startSleepTimer(m)}
                className="text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white"
              >
                {m} Minutes
              </DropdownMenuItem>
            ))}
            {sleepTimeLeft !== null && (
              <>
                <DropdownMenuSeparator className="bg-zinc-900" />
                <DropdownMenuItem
                  onClick={cancelSleepTimer}
                  className="text-xs px-2 py-1.5 rounded text-red-500 cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 focus:text-red-400"
                >
                  Cancel Timer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Audio Quality Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 rounded-full flex items-center gap-1.5"
              id="btn-audio-quality"
            >
              <Music4 className="w-3.5 h-3.5" />
              <span className="uppercase">{audioQuality}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-950 text-zinc-200 border-0 rounded-lg p-1 min-w-[140px] shadow-xl">
            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-1.5">
              Streaming Quality
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-900" />
            <DropdownMenuItem
              onClick={() => {
                setAudioQuality("standard");
                toast.success("Quality adjusted to Standard (128kbps AAC)");
              }}
              className={`text-xs px-2 py-2 rounded cursor-pointer ${
                audioQuality === "standard" ? "bg-blue-600 text-white" : "hover:bg-zinc-900"
              }`}
            >
              <div className="flex flex-col">
                <span>Standard</span>
                <span className="text-[9px] opacity-60">128kbps AAC • Data Saver</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setAudioQuality("high");
                toast.success("Quality adjusted to High (320kbps MP3)");
              }}
              className={`text-xs px-2 py-2 rounded cursor-pointer ${
                audioQuality === "high" ? "bg-blue-600 text-white" : "hover:bg-zinc-900"
              }`}
            >
              <div className="flex flex-col">
                <span>High Quality</span>
                <span className="text-[9px] opacity-60">320kbps MP3 • Recommended</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setAudioQuality("flac");
                toast.success("Quality adjusted to Lossless FLAC (HIFI)");
              }}
              className={`text-xs px-2 py-2 rounded cursor-pointer ${
                audioQuality === "flac" ? "bg-blue-600 text-white" : "hover:bg-zinc-900"
              }`}
            >
              <div className="flex flex-col">
                <span>Hi-Fi Lossless</span>
                <span className="text-[9px] opacity-60">1411kbps FLAC • Studio sound</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Output Device Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 rounded-full flex items-center gap-1.5"
              id="btn-device-selector"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px]">{activeDevice}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-950 text-zinc-200 border-0 rounded-lg p-1 min-w-[150px] shadow-xl">
            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-1.5">
              Output Destination
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-900" />
            <DropdownMenuItem
              onClick={() => {
                setActiveDevice("Local Device");
                toast.success("Switched audio output to local speaker");
              }}
              className={`text-xs px-2 py-1.5 rounded cursor-pointer ${
                activeDevice === "Local Device" ? "bg-blue-600 text-white" : "hover:bg-zinc-900"
              }`}
            >
              My Android Phone
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActiveDevice("Ton Wallet Connect");
                toast.success("Connected stream to Smart Contract Node");
              }}
              className={`text-xs px-2 py-1.5 rounded cursor-pointer ${
                activeDevice === "Ton Wallet Connect" ? "bg-blue-600 text-white" : "hover:bg-zinc-900"
              }`}
            >
              Ton Audio Node
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActiveDevice("AirPlay Node");
                toast.info("Connecting AirPlay audio stream placeholder...");
              }}
              className="text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-zinc-900"
            >
              AirPlay / Cast Device
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Core Controls Playback Row */}
      <div className="flex items-center justify-between px-2" id="tonjam-core-buttons-row">
        {/* Shuffle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleShuffle}
          className={`p-2 rounded-full transition-colors ${
            isShuffle ? "text-blue-500" : "text-zinc-500 hover:text-white"
          }`}
          id="btn-shuffle"
          aria-label="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </motion.button>

        {/* Previous Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevTrack}
          className="p-2.5 rounded-full text-white hover:bg-zinc-900 transition-colors"
          id="btn-previous-track"
          aria-label="Previous Track"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </motion.button>

        {/* Play/Pause Button with custom ripples */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-600/30"
            id="btn-play-pause-full"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause className="w-7 h-7 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pl-1"
                >
                  <Play className="w-7 h-7 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Subtle slow radiating loop animation when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 bg-blue-500/20 rounded-full -z-10 pointer-events-none"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            />
          )}
        </div>

        {/* Next Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextTrack}
          className="p-2.5 rounded-full text-white hover:bg-zinc-900 transition-colors"
          id="btn-next-track"
          aria-label="Next Track"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </motion.button>

        {/* Repeat Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleRepeat}
          className={`p-2 rounded-full transition-colors relative ${
            repeatMode !== "off" ? "text-blue-500" : "text-zinc-500 hover:text-white"
          }`}
          id="btn-repeat"
          aria-label="Repeat"
        >
          <Repeat className="w-5 h-5" />
          {repeatMode === "one" && (
            <span className="absolute top-1 right-1 bg-blue-600 text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center scale-90">
              1
            </span>
          )}
        </motion.button>
      </div>

      {/* Volume Bar & EQ Shortcut Bar */}
      <div className="flex items-center gap-4 px-2" id="tonjam-volume-eq-bar">
        {/* Mute toggle icon */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="text-zinc-500 hover:text-white transition-colors"
          id="btn-toggle-mute"
          aria-label="Toggle Mute"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : volume < 50 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </motion.button>

        {/* Minimal flat volume bar */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume / 100}
          onChange={handleVolumeScrub}
          className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none transition-all"
          id="volume-slider"
          aria-label="Volume Control"
        />

        {/* EQ shortcut icon trigger */}
        {onEqualizerClick && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onEqualizerClick}
            className="text-zinc-500 hover:text-white transition-colors"
            id="btn-equalizer-shortcut"
            aria-label="Equalizer Settings"
          >
            <Sliders className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;
