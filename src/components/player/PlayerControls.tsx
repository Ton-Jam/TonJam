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

interface PlayerControlsProps {
  showAuxiliaryBar?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = React.memo(({
  showAuxiliaryBar = true,
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
      .catch(() => {});

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

  const repeatLabel =
    repeatMode === "one"
      ? "Repeat mode: one track"
      : repeatMode === "all"
      ? "Repeat mode: all tracks"
      : "Repeat mode: off";

  return (
    <div ref={controlsContainerRef} className="w-full flex flex-col items-center gap-2 my-0.5 select-none font-sans">
      {/* Primary 5-Button Playback Row */}
      <div className="w-full flex items-center justify-between px-1 sm:px-3">
        {/* Shuffle */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            toggleShuffle();
          }}
          aria-label="Toggle shuffle"
          aria-pressed={isShuffle}
          className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors cursor-pointer border-none ${
            isShuffle
              ? "text-[#229ED9] bg-[#229ED9]/15"
              : "text-[#8FA3BF] hover:text-[#FFFFFF] bg-transparent hover:bg-white/[0.06]"
          }`}
        >
          <Shuffle className="w-5 h-5" />
          {isShuffle && (
            <span aria-hidden="true" className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#229ED9]" />
          )}
        </button>

        {/* Previous Track */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            prevTrack();
          }}
          aria-label="Previous track"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#FFFFFF] hover:text-[#229ED9] hover:bg-white/[0.06] transition-all active:scale-90 border-none bg-transparent cursor-pointer"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Large Central Telegram/TonJam Blue Play/Pause */}
        <motion.button
          type="button"
          onClick={() => {
            triggerHaptic();
            togglePlay();
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isPlaying ? "Pause playback" : "Start playback"}
          aria-pressed={isPlaying}
          className="relative w-[62px] h-[62px] sm:w-[66px] sm:h-[66px] rounded-full bg-[#229ED9] hover:bg-[#1A8EC6] text-[#FFFFFF] flex items-center justify-center border border-white/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-0.5" />
          )}
        </motion.button>

        {/* Next Track */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            nextTrack();
          }}
          aria-label="Next track"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#FFFFFF] hover:text-[#229ED9] hover:bg-white/[0.06] transition-all active:scale-90 border-none bg-transparent cursor-pointer"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Repeat */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            toggleRepeat();
          }}
          aria-label={repeatLabel}
          aria-pressed={repeatMode !== "off"}
          className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors cursor-pointer border-none ${
            repeatMode !== "off"
              ? "text-[#229ED9] bg-[#229ED9]/15"
              : "text-[#8FA3BF] hover:text-[#FFFFFF] bg-transparent hover:bg-white/[0.06]"
          }`}
        >
          {repeatMode === "one" ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
          {repeatMode !== "off" && (
            <span aria-hidden="true" className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#229ED9]" />
          )}
        </button>
      </div>

      {/* Optional Auxiliary Bar when rendered standalone */}
      {showAuxiliaryBar && (
        <div className="relative w-full">
          <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar snap-x touch-pan-x px-1 py-1 text-xs text-[#8FA3BF]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                toggleSmartRadio();
              }}
              aria-pressed={isSmartRadio}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border border-[rgba(192,192,192,0.22)] ${
                isSmartRadio
                  ? "text-[#FFFFFF] bg-[#229ED9]"
                  : "text-[#C2C7CD] hover:text-[#FFFFFF] bg-[#0B1C34]"
              }`}
              title="Toggle Smart Radio Autoplay"
            >
              <Radio className={`w-3.5 h-3.5 ${isSmartRadio ? "animate-pulse text-white" : "text-[#229ED9]"}`} />
              <span>Radio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSpeedMenu((prev) => !prev);
                setShowSleepMenu(false);
                setShowDeviceMenu(false);
              }}
              aria-expanded={showSpeedMenu}
              aria-label="Playback speed"
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border border-[rgba(192,192,192,0.22)] ${
                speed !== 1.0
                  ? "text-[#FFFFFF] bg-[#229ED9]"
                  : "text-[#C2C7CD] hover:text-[#FFFFFF] bg-[#0B1C34]"
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{speed}x</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSleepMenu((prev) => !prev);
                setShowSpeedMenu(false);
                setShowDeviceMenu(false);
              }}
              aria-expanded={showSleepMenu}
              aria-label="Sleep timer"
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border border-[rgba(192,192,192,0.22)] ${
                sleepMinutes !== null
                  ? "text-[#FFFFFF] bg-[#229ED9]"
                  : "text-[#C2C7CD] hover:text-[#FFFFFF] bg-[#0B1C34]"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#F4BD50]" />
              <span>{sleepMinutes !== null ? `${sleepMinutes}m` : "Timer"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeviceMenu((prev) => !prev);
                setShowSpeedMenu(false);
                setShowSleepMenu(false);
              }}
              aria-expanded={showDeviceMenu}
              aria-label="Audio output device"
              className="shrink-0 snap-start px-3 py-1.5 rounded-full text-[#C2C7CD] hover:text-[#FFFFFF] bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer"
              title="Audio Output Device"
            >
              <Laptop className="w-3.5 h-3.5 text-[#229ED9]" />
              <span className="truncate max-w-[90px]">{activeDeviceLabel}</span>
            </button>

            <div className="shrink-0 snap-start flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1C34] border border-[rgba(192,192,192,0.22)]">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                className="text-[#8C8C8C] hover:text-[#FFFFFF] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#F16D78]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#229ED9]" />
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
                className="w-16 h-1 bg-[#22374D] accent-[#229ED9] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {showSpeedMenu && (
            <div className="absolute left-2 bottom-11 w-36 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-[12px] p-1.5 z-50 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[#8FA3BF] px-2 py-1 uppercase">Speed</span>
              {availableSpeeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedSelect(s)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs font-medium text-left cursor-pointer border-none ${
                    speed === s ? "bg-[#229ED9] text-white" : "bg-transparent hover:bg-white/[0.08] text-[#FFFFFF]"
                  }`}
                >
                  <span>{s}x {s === 1.0 ? "(Normal)" : ""}</span>
                  {speed === s && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {showSleepMenu && (
            <div className="absolute left-16 bottom-11 w-36 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-[12px] p-1.5 z-50 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[#8FA3BF] px-2 py-1 uppercase">Sleep Timer</span>
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
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-[8px] text-xs font-medium text-left cursor-pointer border-none ${
                    sleepMinutes === opt.value ? "bg-[#229ED9] text-white" : "bg-transparent hover:bg-white/[0.08] text-[#FFFFFF]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sleepMinutes === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {showDeviceMenu && (
            <div className="absolute right-2 bottom-11 w-52 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-[12px] p-1.5 z-50 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[#8FA3BF] px-2 py-1 uppercase">Audio Device</span>
              {outputDevices.map((dev) => (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => handleDeviceSelect(dev)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[8px] text-[11px] font-medium text-left cursor-pointer border-none ${
                    activeDeviceId === dev.id ? "bg-[#229ED9] text-white" : "bg-transparent hover:bg-white/[0.08] text-[#FFFFFF]"
                  }`}
                >
                  <span className="truncate">{dev.label}</span>
                  {activeDeviceId === dev.id && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PlayerControls.displayName = "PlayerControls";

export default PlayerControls;
