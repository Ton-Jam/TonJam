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
  Tv,
  Clock,
  Gauge,
  Laptop,
  Check,
  Radio,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

export const PlayerControls: React.FC = () => {
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
    isSmartRadio,
    toggleSmartRadio,
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
              ? "text-[#0098EA] bg-[#0098EA]/15"
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
          className="p-3 text-[#F2F4F8] hover:text-[#0098EA] transition-all active:scale-90"
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
          className="relative w-[64px] h-[64px] rounded-full bg-[#0179f4] hover:bg-[#0179f4]/90 text-[#F2F4F8] flex items-center justify-center shadow-lg shadow-[#0179f4]/35 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
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
          className="p-3 text-[#F2F4F8] hover:text-[#0098EA] transition-all active:scale-90"
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
              ? "text-[#0098EA] bg-[#0098EA]/15"
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

      {/* Auxiliary Controls Bar (Radio, Speed, Sleep Timer, Output Device, Volume) - Horizontal Scroll */}
      <div className="w-full flex items-center gap-2 overflow-x-auto scrollbar-none snap-x touch-pan-x px-2 py-2 text-xs text-[#9AA0AE]">
        {/* Smart Radio Quick Toggle */}
        <button
          onClick={() => {
            triggerHaptic();
            toggleSmartRadio();
          }}
          className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-[11px] font-bold transition-all ${
            isSmartRadio
              ? "border-[#5B6BFF] text-[#5B6BFF] bg-[#5B6BFF]/15 shadow-[0_0_10px_rgba(91,107,255,0.3)]"
              : "border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A]"
          }`}
          title="Toggle Smart Radio Autoplay"
        >
          <Radio className={`w-3.5 h-3.5 ${isSmartRadio ? "animate-pulse text-emerald-400" : ""}`} />
          <span>Radio</span>
        </button>

        {/* Playback Speed Menu */}
        <div className="relative shrink-0 snap-start">
          <button
            onClick={() => {
              setShowSpeedMenu(!showSpeedMenu);
              setShowSleepMenu(false);
              setShowDeviceMenu(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border border-[#16244F] text-[11px] font-bold transition-all ${
              speed !== 1.0
                ? "border-[#0098EA] text-[#0098EA] bg-[#0098EA]/10"
                : "text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A]"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{speed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute left-0 bottom-10 w-32 bg-[#0A113A] border border-[#16244F] rounded-[12px] p-1.5 shadow-2xl z-50 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#9AA0AE] px-2 py-1 uppercase">Speed</span>
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedSelect(s)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-[8px] text-xs font-medium text-left ${
                    speed === s ? "bg-[#0098EA] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
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
        <div className="relative shrink-0 snap-start">
          <button
            onClick={() => {
              setShowSleepMenu(!showSleepMenu);
              setShowSpeedMenu(false);
              setShowDeviceMenu(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-[11px] font-bold transition-all ${
              sleepMinutes !== null
                ? "border-[#0098EA] text-[#0098EA] bg-[#0098EA]/10"
                : "border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{sleepMinutes !== null ? `${sleepMinutes}m` : "Timer"}</span>
          </button>

          {showSleepMenu && (
            <div className="absolute left-0 bottom-10 w-36 bg-[#0A113A] border border-[#16244F] rounded-[12px] p-1.5 shadow-2xl z-50 flex flex-col gap-1">
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
                    sleepMinutes === opt.value ? "bg-[#0098EA] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sleepMinutes === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Device Selector */}
        <div className="relative shrink-0 snap-start">
          <button
            onClick={() => {
              setShowDeviceMenu(!showDeviceMenu);
              setShowSpeedMenu(false);
              setShowSleepMenu(false);
            }}
            className="px-3 py-1.5 rounded-[12px] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8] bg-[#0A113A] transition-all flex items-center gap-1.5 text-[11px] font-bold"
            title="Audio Output Device"
          >
            <Laptop className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[90px]">{activeDevice}</span>
          </button>

          {showDeviceMenu && (
            <div className="absolute right-0 bottom-10 w-44 bg-[#0A113A] border border-[#16244F] rounded-[12px] p-1.5 shadow-2xl z-50 flex flex-col gap-1">
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
                    activeDevice === dev ? "bg-[#0098EA] text-[#F2F4F8]" : "hover:bg-[#16244F] text-[#F2F4F8]"
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
        <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-[12px] border border-[#16244F] bg-[#0A113A]">
          <button
            onClick={toggleMute}
            className="text-[#9AA0AE] hover:text-[#F2F4F8] transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#16244F] accent-[#0098EA] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
