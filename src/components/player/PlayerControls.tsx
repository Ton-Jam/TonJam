import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  Tv,
  Clock,
  Gauge,
  Laptop,
  Check
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
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
    currentTrack
  } = useAudio();

  const [speed, setSpeed] = useState<number>(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState<boolean>(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [activeDevice, setActiveDevice] = useState<string>("Local Speaker");

  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync playback rate with HTML5 Audio
  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = speed;
    }
  }, [speed, audioElement, currentTrack]);

  // Sleep timer interval
  useEffect(() => {
    if (sleepMinutes === null) {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      return;
    }

    if (sleepMinutes <= 0) {
      if (isPlaying) {
        togglePlay();
        toast.info("Sleep timer completed. Playback stopped.");
      }
      setSleepMinutes(null);
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      setSleepMinutes((prev) => (prev !== null ? prev - 1 : null));
    }, 60000);

    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepMinutes, isPlaying, togglePlay]);

  const handleSpeedSelect = (s: number) => {
    setSpeed(s);
    setShowSpeedMenu(false);
    toast.success(`Playback speed: ${s}x`);
  };

  const handleSleepSelect = (mins: number | null) => {
    setSleepMinutes(mins);
    setShowSleepMenu(false);
    if (mins) {
      toast.success(`Sleep timer set for ${mins} minutes`);
    } else {
      toast.info("Sleep timer cancelled");
    }
  };

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 my-2 select-none">
      {/* Primary Playback Controls Row */}
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        {/* Shuffle Button */}
        <button
          onClick={() => {
            triggerHaptic();
            toggleShuffle();
          }}
          aria-label="Toggle Shuffle"
          className={`p-2.5 rounded-[12px] transition-all duration-200 ${
            isShuffle
              ? "text-[#5B6BFF] bg-[#5B6BFF]/15"
              : "text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#0A113A]"
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous Track */}
        <button
          onClick={() => {
            triggerHaptic();
            prevTrack();
          }}
          aria-label="Previous Track"
          className="p-3 text-[#F2F4F8] hover:text-[#5B6BFF] transition-all active:scale-90"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Large Play/Pause 64px Circle */}
        <motion.button
          onClick={() => {
            triggerHaptic();
            togglePlay();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="relative w-[64px] h-[64px] rounded-full bg-[#5B6BFF] text-[#F2F4F8] flex items-center justify-center shadow-lg shadow-[#5B6BFF]/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </motion.button>

        {/* Next Track */}
        <button
          onClick={() => {
            triggerHaptic();
            nextTrack();
          }}
          aria-label="Next Track"
          className="p-3 text-[#F2F4F8] hover:text-[#5B6BFF] transition-all active:scale-90"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Repeat Button */}
        <button
          onClick={() => {
            triggerHaptic();
            toggleRepeat();
          }}
          aria-label="Toggle Repeat Mode"
          className={`p-2.5 rounded-[12px] transition-all duration-200 ${
            repeatMode !== "off"
              ? "text-[#5B6BFF] bg-[#5B6BFF]/15"
              : "text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#0A113A]"
          }`}
        >
          {repeatMode === "one" ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Auxiliary Controls Bar (Speed, Sleep Timer, EQ, Volume) */}
      <div className="w-full flex items-center justify-between px-2 pt-2 text-xs text-[#9AA0AE]">
        {/* Left: Speed & Sleep Timer Buttons */}
        <div className="flex items-center gap-2 relative">
          {/* Playback Speed Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowSleepMenu(false);
                setShowDeviceMenu(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[12px] text-[11px] font-bold transition-all ${
                speed !== 1.0
                  ? "text-[#5B6BFF] bg-[#5B6BFF]/10"
                  : "text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A]"
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{speed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute left-0 bottom-10 w-32 bg-[#0A113A] rounded-[12px] p-1.5 shadow-xl z-50 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#9AA0AE] px-2 py-1 uppercase">Speed</span>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedSelect(s)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-[8px] text-xs font-medium text-left ${
                      speed === s ? "bg-[#5B6BFF] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
                    }`}
                  >
                    <span>{s}x</span>
                    {speed === s && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSleepMenu(!showSleepMenu);
                setShowSpeedMenu(false);
                setShowDeviceMenu(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[12px] border text-[11px] font-bold transition-all ${
                sleepMinutes !== null
                  ? "border-[#5B6BFF] text-[#5B6BFF] bg-[#5B6BFF]/10"
                  : "border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{sleepMinutes !== null ? `${sleepMinutes}m` : "Timer"}</span>
            </button>

            {showSleepMenu && (
              <div className="absolute left-0 bottom-10 w-36 bg-[#0A113A] border border-[#16244F] rounded-[12px] p-1.5 shadow-xl z-50 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#9AA0AE] px-2 py-1 uppercase">Sleep Timer</span>
                {[
                  { label: "Off", value: null },
                  { label: "5 minutes", value: 5 },
                  { label: "15 minutes", value: 15 },
                  { label: "30 minutes", value: 30 },
                  { label: "45 minutes", value: 45 },
                  { label: "1 hour", value: 60 }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSleepSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-[8px] text-xs font-medium text-left ${
                      sleepMinutes === opt.value ? "bg-[#5B6BFF] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sleepMinutes === opt.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equalizer */}
          {onEqualizerClick && (
            <button
              onClick={onEqualizerClick}
              className="p-2 rounded-[12px] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A] transition-all"
              title="Equalizer & FX"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Output Devices & Volume slider */}
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDeviceMenu(!showDeviceMenu);
                setShowSpeedMenu(false);
                setShowSleepMenu(false);
              }}
              className="p-2 rounded-[12px] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A] transition-all flex items-center gap-1"
              title="Audio Output Device"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>

            {showDeviceMenu && (
              <div className="absolute right-0 bottom-10 w-40 bg-[#0A113A] border border-[#16244F] rounded-[12px] p-1.5 shadow-xl z-50 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#9AA0AE] px-2 py-1 uppercase">Audio Device</span>
                {["Local Speaker", "AirPlay / WebCast", "Bluetooth Headphones", "TonJam Hi-Fi DAC"].map((dev) => (
                  <button
                    key={dev}
                    onClick={() => {
                      setActiveDevice(dev);
                      setShowDeviceMenu(false);
                      toast.success(`Connected to ${dev}`);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-[8px] text-[11px] font-medium text-left ${
                      activeDevice === dev ? "bg-[#5B6BFF] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
                    }`}
                  >
                    <span className="truncate">{dev}</span>
                    {activeDevice === dev && <Check className="w-3 h-3 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#16244F] accent-[#5B6BFF] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
