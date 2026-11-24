import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Speaker,
  Headphones,
  Bluetooth,
  Smartphone,
  ChevronDown,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { toast } from "sonner";

export interface OutputDeviceOption {
  id: string;
  label: string;
}

const DEFAULT_OUTPUT_DEVICE: OutputDeviceOption = {
  id: "default",
  label: "This Device (Default)",
};

function getDeviceIcon(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("bluetooth") || normalized.includes("airpods") || normalized.includes("buds")) {
    return Bluetooth;
  }
  if (normalized.includes("headphone") || normalized.includes("earphone") || normalized.includes("headset")) {
    return Headphones;
  }
  if (normalized.includes("phone") || normalized.includes("mobile")) {
    return Smartphone;
  }
  return Speaker;
}

export const AudioOutputCard: React.FC = React.memo(() => {
  const { audioElement, volume, setVolume, isMuted, toggleMute } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [devices, setDevices] = useState<OutputDeviceOption[]>([DEFAULT_OUTPUT_DEVICE]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>("default");

  const supportsSinkId = useMemo(() => {
    const mediaEl = audioElement as (HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }) | null;
    return Boolean(mediaEl && typeof mediaEl.setSinkId === "function");
  }, [audioElement]);

  const refreshDevices = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.enumerateDevices !== "function"
    ) {
      return;
    }

    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = list
        .filter((d) => d.kind === "audiooutput")
        .map((d, idx) => ({
          id: d.deviceId || `output-${idx}`,
          label: d.label || (idx === 0 ? "This Device (Default)" : `Audio Output ${idx + 1}`),
        }));

      if (audioOutputs.length > 0) {
        setDevices(audioOutputs);
      }
    } catch {
      // Gracefully keep default option if permissions restrict enumeration
    }
  }, []);

  useEffect(() => {
    refreshDevices();
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.addEventListener !== "function"
    ) {
      return;
    }

    const handleDeviceChange = () => {
      refreshDevices();
    };
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [refreshDevices]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        refreshDevices();
      }
      return next;
    });
  }, [refreshDevices]);

  const handleSelectDevice = useCallback(
    async (dev: OutputDeviceOption) => {
      setActiveDeviceId(dev.id);
      const mediaEl = audioElement as (HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }) | null;
      if (mediaEl && typeof mediaEl.setSinkId === "function") {
        try {
          await mediaEl.setSinkId(dev.id);
          toast.success(`Audio routed to ${dev.label}`);
        } catch {
          toast.info(`Selected ${dev.label} (system managed output)`);
        }
      } else {
        toast.info(`Audio output: ${dev.label}`);
      }
      setIsExpanded(false);
    },
    [audioElement]
  );

  const activeDevice =
    devices.find((d) => d.id === activeDeviceId) || devices[0] || DEFAULT_OUTPUT_DEVICE;
  const DeviceIcon = getDeviceIcon(activeDevice.label);
  const volumePct = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div
      data-testid="audio-output-card"
      className="w-full rounded-[14px] bg-[#0B1C34]/90 border border-[rgba(192,192,192,0.22)] overflow-hidden select-none"
    >
      <button
        type="button"
        onClick={handleToggleExpand}
        aria-expanded={isExpanded}
        aria-label={`Audio output device: ${activeDevice.label}`}
        className="w-full min-h-[52px] px-3.5 py-2.5 flex items-center justify-between gap-3 bg-transparent hover:bg-white/[0.04] transition-colors cursor-pointer text-left border-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#229ED9]/15 border border-[rgba(192,192,192,0.22)] flex items-center justify-center shrink-0">
            <DeviceIcon className="w-4 h-4 text-[#229ED9]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-medium text-[#8FA3BF]">
              Audio Output
            </div>
            <div className="text-xs font-semibold text-[#FFFFFF] truncate">
              {activeDevice.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-[#102943] border border-[rgba(192,192,192,0.22)] text-[10px] font-medium text-[#C2C7CD] tabular-nums">
            {volumePct}%
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#8FA3BF] transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-[#FFFFFF]" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-[rgba(192,192,192,0.16)] flex flex-col gap-2">
          {/* Device List */}
          <div className="flex flex-col gap-1" role="listbox" aria-label="Available audio output devices">
            {devices.map((dev) => {
              const isSelected = dev.id === activeDevice.id;
              const ItemIcon = getDeviceIcon(dev.label);
              return (
                <button
                  key={dev.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectDevice(dev)}
                  className={`w-full min-h-[40px] px-2.5 py-2 rounded-[10px] flex items-center justify-between gap-2 text-xs font-medium cursor-pointer border transition-colors ${
                    isSelected
                      ? "bg-[#229ED9]/20 border-[#229ED9]/50 text-[#FFFFFF]"
                      : "bg-[#071528]/70 border-transparent hover:bg-white/[0.06] text-[#C2C7CD]"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#229ED9]" : "text-[#8FA3BF]"}`} />
                    <span className="truncate">{dev.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />}
                </button>
              );
            })}
          </div>

          {!supportsSinkId && (
            <p className="text-[11px] text-[#8FA3BF] leading-snug px-0.5">
              Output routing follows your device audio settings in this browser.
            </p>
          )}

          {/* Integrated Volume Control */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? "Unmute audio" : "Mute audio"}
              className="min-w-[36px] min-h-[36px] rounded-full bg-[#102943] border border-[rgba(192,192,192,0.22)] flex items-center justify-center text-[#C2C7CD] hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#F16D78]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#229ED9]" />
              )}
            </button>
            <input
              type="range"
              aria-label="Output volume"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-[#1B3352] accent-[#229ED9] rounded-full cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
});

AudioOutputCard.displayName = "AudioOutputCard";

export default AudioOutputCard;
