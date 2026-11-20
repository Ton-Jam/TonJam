import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
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
  Clock,
  Gauge,
  Laptop,
  Check,
  Radio,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { usePlaybackSpeed } from "@/hooks/usePlaybackSpeed";
import { toast } from "sonner";

interface OutputDeviceOption {
  id: string;
  label: string;
}

const DEFAULT_OUTPUT_DEVICES: OutputDeviceOption[] = [
  { id: "default", label: "Default Audio Output" },
];

export const PlayerControls: React.FC = React.memo(() => {
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
    isSmartRadio,
    toggleSmartRadio,
    audioElement,
  } = useAudio();

  const { speed, changeSpeed, availableSpeeds } = usePlaybackSpeed();
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState<boolean>(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [outputDevices, setOutputDevices] = useState<OutputDeviceOption[]>(DEFAULT_OUTPUT_DEVICES);
  const [activeDeviceId, setActiveDeviceId] = useState<string>("default");

  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const togglePlayRef = useRef(togglePlay);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    togglePlayRef.current = togglePlay;
  }, [isPlaying, togglePlay]);

  // Close open popover menus on outside click or Escape key
  useEffect(() => {
    if (!showSpeedMenu && !showSleepMenu && !showDeviceMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        controlsContainerRef.current &&
        !controlsContainerRef.current.contains(e.target as Node)
      ) {
        setShowSpeedMenu(false);
        setShowSleepMenu(false);
        setShowDeviceMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSpeedMenu(false);
        setShowSleepMenu(false);
        setShowDeviceMenu(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSpeedMenu, showSleepMenu, showDeviceMenu]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepMinutes === null) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      return;
    }

    if (sleepMinutes <= 0) {
      if (isPlayingRef.current) {
        togglePlayRef.current();
      }
      toast.info("Sleep timer completed. Playback stopped.");
      setSleepMinutes(null);
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      setSleepMinutes((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }, 60000);

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepMinutes]);

  // Populate real browser audio output devices when device menu is opened
  useEffect(() => {
    if (!showDeviceMenu) return;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.enumerateDevices !== "function"
    ) {
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (cancelled) return;
        const audioOutputs = devices
          .filter((d) => d.kind === "audiooutput")
          .map((d, index) => ({
            id: d.deviceId || `output-${index}`,
            label: d.label || (index === 0 ? "Default Audio Output" : `Audio Output ${index + 1}`),
          }));

        if (audioOutputs.length > 0) {
          setOutputDevices(audioOutputs);
        }
      })
      .catch(() => {
        // Retain default output option gracefully if permission is restricted
      });

    return () => {
      cancelled = true;
    };
  }, [showDeviceMenu]);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  }, []);

  const handleSpeedSelect = useCallback((s: number) => {
    changeSpeed(s);
    setShowSpeedMenu(false);
  }, [changeSpeed]);

  const handleSleepSelect = useCallback((mins: number | null) => {
    setSleepMinutes(mins);
    setShowSleepMenu(false);
    if (mins) {
      toast.success(`Sleep timer set for ${mins} minutes`);
    } else {
      toast.info("Sleep timer cancelled");
    }
  }, []);

  const handleDeviceSelect = useCallback(async (dev: OutputDeviceOption) => {
    setActiveDeviceId(dev.id);
    setShowDeviceMenu(false);

    const mediaEl = audioElement as (HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }) | null;
    if (mediaEl && typeof mediaEl.setSinkId === "function") {
      try {
        await mediaEl.setSinkId(dev.id);
        toast.success(`Audio routed to ${dev.label}`);
      } catch {
        toast.info(`Selected ${dev.label} (browser managed output)`);
      }
    } else {
      toast.info(`Audio output: ${dev.label}`);
    }
  }, [audioElement]);

  const activeDeviceLabel =
    outputDevices.find((d) => d.id === activeDeviceId)?.label || "Default Output";

  return (
    <div ref={controlsContainerRef} className="w-full flex flex-col items-center gap-4 my-2 select-none font-sans">
      {/* Primary Playback Controls Row */}
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        {/* Shuffle Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            toggleShuffle();
          }}
          aria-label="Toggle Shuffle"
          aria-pressed={isShuffle}
          className={`p-2.5 rounded-[var(--tj-radius-md,10px)] transition-all duration-200 border-none cursor-pointer ${
            isShuffle
              ? "text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#00B4D8]/15"
              : "text-[#8C8C8C] hover:text-[#FFFFFF] bg-transparent hover:bg-[#0A1628]"
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous Track */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            prevTrack();
          }}
          aria-label="Previous Track"
          className="p-3 text-[#FFFFFF] hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-all active:scale-90 border-none bg-transparent cursor-pointer"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Prominent Circular 64px TonJam Cyan Play/Pause Button */}
        <motion.button
          type="button"
          onClick={() => {
            triggerHaptic();
            togglePlay();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="relative w-[64px] h-[64px] rounded-full bg-[var(--tj-color-brand-primary,#00B4D8)] hover:bg-[var(--tj-color-brand-pressed,#009CC0)] text-[#FFFFFF] flex items-center justify-center shadow-lg shadow-[#00B4D8]/35 cursor-pointer focus:outline-none border-none"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </motion.button>

        {/* Next Track */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            nextTrack();
          }}
          aria-label="Next Track"
          className="p-3 text-[#FFFFFF] hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-all active:scale-90 border-none bg-transparent cursor-pointer"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Repeat Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            toggleRepeat();
          }}
          aria-label="Toggle Repeat Mode"
          aria-pressed={repeatMode !== "off"}
          className={`p-2.5 rounded-[var(--tj-radius-md,10px)] transition-all duration-200 border-none cursor-pointer ${
            repeatMode !== "off"
              ? "text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#00B4D8]/15"
              : "text-[#8C8C8C] hover:text-[#FFFFFF] bg-transparent hover:bg-[#0A1628]"
          }`}
        >
          {repeatMode === "one" ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Auxiliary Controls Bar */}
      <div className="w-full flex items-center gap-2 overflow-x-auto scrollbar-none snap-x touch-pan-x px-2 py-2 text-xs text-[#8C8C8C]">
        {/* Smart Radio Quick Toggle */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            toggleSmartRadio();
          }}
          aria-pressed={isSmartRadio}
          className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-md,10px)] text-[11px] font-bold transition-all cursor-pointer border-none ${
            isSmartRadio
              ? "text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#00B4D8]/15 shadow-[0_0_10px_rgba(0,180,216,0.3)]"
              : "text-[#8C8C8C] hover:text-[#FFFFFF] bg-[#0A1628]"
          }`}
          title="Toggle Smart Radio Autoplay"
        >
          <Radio className={`w-3.5 h-3.5 ${isSmartRadio ? "animate-pulse text-[#35C98A]" : ""}`} />
          <span>Radio</span>
        </button>

        {/* Playback Speed Menu */}
        <div className="relative shrink-0 snap-start">
          <button
            type="button"
            onClick={() => {
              setShowSpeedMenu((prev) => !prev);
              setShowSleepMenu(false);
              setShowDeviceMenu(false);
            }}
            aria-expanded={showSpeedMenu}
            aria-label="Playback speed"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-md,10px)] text-[11px] font-bold transition-all cursor-pointer border-none ${
              speed !== 1.0
                ? "text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#00B4D8]/15"
                : "text-[#8C8C8C] hover:text-[#FFFFFF] bg-[#0A1628]"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{speed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute left-0 bottom-10 w-36 bg-[#0F1C32] rounded-[var(--tj-radius-md,10px)] p-1.5 shadow-2xl z-50 flex flex-col gap-1 border-none">
              <span className="text-[10px] font-bold text-[#8C8C8C] px-2 py-1 uppercase">Speed</span>
              {availableSpeeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedSelect(s)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-medium text-left cursor-pointer border-none ${
                    speed === s ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white" : "bg-transparent hover:bg-[#22374D] text-[#FFFFFF]"
                  }`}
                >
                  <span>{s}x {s === 1.0 ? "(Normal)" : ""}</span>
                  {speed === s && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep Timer Menu */}
        <div className="relative shrink-0 snap-start">
          <button
            type="button"
            onClick={() => {
              setShowSleepMenu((prev) => !prev);
              setShowSpeedMenu(false);
              setShowDeviceMenu(false);
            }}
            aria-expanded={showSleepMenu}
            aria-label="Sleep timer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-md,10px)] text-[11px] font-bold transition-all cursor-pointer border-none ${
              sleepMinutes !== null
                ? "text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#00B4D8]/15"
                : "text-[#8C8C8C] hover:text-[#FFFFFF] bg-[#0A1628]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#F4BD50]" />
            <span>{sleepMinutes !== null ? `${sleepMinutes}m` : "Timer"}</span>
          </button>

          {showSleepMenu && (
            <div className="absolute left-0 bottom-10 w-36 bg-[#0F1C32] rounded-[var(--tj-radius-md,10px)] p-1.5 shadow-2xl z-50 flex flex-col gap-1 border-none">
              <span className="text-[10px] font-bold text-[#8C8C8C] px-2 py-1 uppercase">Sleep Timer</span>
              {[
                { label: "Off", value: null },
                { label: "5 minutes", value: 5 },
                { label: "15 minutes", value: 15 },
                { label: "30 minutes", value: 30 },
                { label: "45 minutes", value: 45 },
                { label: "1 hour", value: 60 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSleepSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-[var(--tj-radius-sm,8px)] text-xs font-medium text-left cursor-pointer border-none ${
                    sleepMinutes === opt.value ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white" : "bg-transparent hover:bg-[#22374D] text-[#FFFFFF]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sleepMinutes === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Output Device Selector */}
        <div className="relative shrink-0 snap-start">
          <button
            type="button"
            onClick={() => {
              setShowDeviceMenu((prev) => !prev);
              setShowSpeedMenu(false);
              setShowSleepMenu(false);
            }}
            aria-expanded={showDeviceMenu}
            aria-label="Audio output device"
            className="px-3 py-1.5 rounded-[var(--tj-radius-md,10px)] text-[#8C8C8C] hover:text-[#FFFFFF] bg-[#0A1628] transition-all flex items-center gap-1.5 text-[11px] font-bold cursor-pointer border-none"
            title="Audio Output Device"
          >
            <Laptop className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            <span className="truncate max-w-[90px]">{activeDeviceLabel}</span>
          </button>

          {showDeviceMenu && (
            <div className="absolute right-0 bottom-10 w-52 bg-[#0F1C32] rounded-[var(--tj-radius-md,10px)] p-1.5 shadow-2xl z-50 flex flex-col gap-1 border-none">
              <span className="text-[10px] font-bold text-[#8C8C8C] px-2 py-1 uppercase">Audio Device</span>
              {outputDevices.map((dev) => (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => handleDeviceSelect(dev)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-[11px] font-medium text-left cursor-pointer border-none ${
                    activeDeviceId === dev.id ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white" : "bg-transparent hover:bg-[#22374D] text-[#FFFFFF]"
                  }`}
                >
                  <span className="truncate">{dev.label}</span>
                  {activeDeviceId === dev.id && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume Control */}
        <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-[var(--tj-radius-md,10px)] bg-[#0A1628] border-none">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
            className="text-[#8C8C8C] hover:text-[#FFFFFF] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#F16D78]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
            )}
          </button>
          <input
            type="range"
            aria-label="Volume"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#22374D] accent-[#00B4D8] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
});

PlayerControls.displayName = "PlayerControls";

export default PlayerControls;
