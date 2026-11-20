import React, { useState, useEffect } from "react";
import { Sliders, Volume2, Sparkles, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

interface Band {
  label: string;
  freq: string;
  val: number; // -12 to +12 dB
}

const EQ_STORAGE_KEY = "tonjam_eq_settings_v1";

const DEFAULT_BANDS: Band[] = [
  { label: "BASS", freq: "60Hz", val: 0 },
  { label: "LOW-MID", freq: "230Hz", val: 0 },
  { label: "MID", freq: "910Hz", val: 0 },
  { label: "TREBLE", freq: "3.6kHz", val: 0 },
  { label: "AIR", freq: "14kHz", val: 0 },
];

const PRESETS: Record<string, number[]> = {
  "Flat": [0, 0, 0, 0, 0],
  "Bass Boost": [8, 5, 0, -2, 2],
  "Electronic": [6, 3, 0, 4, 6],
  "Vocal Boost": [-2, 2, 7, 4, 1],
  "Rock": [5, 3, -1, 3, 5],
  "Pop": [2, 4, 5, 2, 3],
  "Hip-Hop": [9, 6, 1, 3, 4],
  "TonJam 3D": [4, 2, 5, 6, 8],
};

interface EqualizerSettingsProps {
  onClose?: () => void;
}

export const EqualizerSettings: React.FC<EqualizerSettingsProps> = React.memo(() => {
  const [bands, setBands] = useState<Band[]>(() => {
    try {
      const raw = localStorage.getItem(EQ_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.bands) && parsed.bands.length === DEFAULT_BANDS.length) {
          return parsed.bands;
        }
      }
    } catch {}
    return DEFAULT_BANDS;
  });
  const [activePreset, setActivePreset] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(EQ_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return typeof parsed?.activePreset === "string" ? parsed.activePreset : "Flat";
    } catch {
      return "Flat";
    }
  });
  const [bassPunch, setBassPunch] = useState(true);
  const [surround3D, setSurround3D] = useState(false);
  const [vocalClarity, setVocalClarity] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        EQ_STORAGE_KEY,
        JSON.stringify({ bands, activePreset, bassPunch, surround3D, vocalClarity })
      );
    } catch {}
  }, [bands, activePreset, bassPunch, surround3D, vocalClarity]);

  const handleBandChange = (index: number, newVal: number) => {
    setBands((prev) => prev.map((b, i) => (i === index ? { ...b, val: newVal } : b)));
    setActivePreset("Custom");
  };

  const applyPreset = (presetName: string) => {
    const vals = PRESETS[presetName];
    if (!vals) return;
    setBands((prev) => prev.map((b, i) => ({ ...b, val: vals[i] })));
    setActivePreset(presetName);
    toast.success(`EQ Preset set to ${presetName}`);
  };

  const handleReset = () => {
    applyPreset("Flat");
  };

  return (
    <div className="w-full bg-[#080D2D]/95 backdrop-blur-xl rounded-[var(--tj-radius-md,10px)] p-4 space-y-4 shadow-2xl text-[#F2F4F8] border-none">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[var(--tj-radius-sm,8px)] bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-brand-primary,#00B4D8)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Sound Equalizer & Audio FX</h3>
            <p className="text-[10px] text-[#9AA0AE]">5-Band frequency profile & FX presets</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--tj-color-brand-primary,#00B4D8)] bg-[#0A113A] px-2 py-1 rounded-[var(--tj-radius-compact,5px)]">
            {activePreset}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-[var(--tj-radius-sm,8px)] bg-[#0A113A] hover:bg-[#16244F] text-[#9AA0AE] hover:text-white transition-colors border-none cursor-pointer"
            title="Reset Equalizer"
            aria-label="Reset Equalizer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider">Presets</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Object.keys(PRESETS).map((p) => {
            const isActive = activePreset === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded-[var(--tj-radius-pill,999px)] text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 border-none cursor-pointer ${
                  isActive
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A113A] hover:bg-[#16244F] text-[#9AA0AE] hover:text-white"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 pt-1 pb-2">
        {bands.map((b, idx) => (
          <div key={b.label} className="flex flex-col items-center gap-2 bg-[#050A24]/60 p-2 rounded-[var(--tj-radius-sm,8px)]">
            <span className={`text-[10px] font-mono font-bold ${b.val > 0 ? "text-[var(--tj-color-brand-primary,#00B4D8)]" : b.val < 0 ? "text-amber-400" : "text-slate-400"}`}>
              {b.val > 0 ? `+${b.val}` : b.val}dB
            </span>

            <div className="relative h-28 flex items-center justify-center">
              <input
                type="range"
                aria-label={`${b.label} ${b.freq} equalizer band`}
                min={-12}
                max={12}
                step={1}
                value={b.val}
                onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                className="w-28 h-1.5 accent-[#00B4D8] cursor-pointer appearance-none bg-[#16244F] rounded-lg -rotate-90 origin-center"
              />
            </div>

            <div className="text-center leading-tight">
              <span className="text-[9px] font-bold text-white block">{b.label}</span>
              <span className="text-[8px] text-[#9AA0AE] font-mono block">{b.freq}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            setBassPunch((prev) => {
              toast.info(`Bass Punch ${!prev ? "Enabled" : "Disabled"}`);
              return !prev;
            });
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-[var(--tj-radius-sm,8px)] text-center transition-all border-none cursor-pointer ${
            bassPunch
              ? "bg-[var(--tj-color-brand-primary,#00B4D8)]/20 text-[var(--tj-color-brand-primary,#00B4D8)]"
              : "bg-[#0A113A] text-[#9AA0AE]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">Bass Punch</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSurround3D((prev) => {
              toast.info(`3D Surround ${!prev ? "Enabled" : "Disabled"}`);
              return !prev;
            });
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-[var(--tj-radius-sm,8px)] text-center transition-all border-none cursor-pointer ${
            surround3D
              ? "bg-purple-500/20 text-purple-400"
              : "bg-[#0A113A] text-[#9AA0AE]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">3D Surround</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setVocalClarity((prev) => {
              toast.info(`Vocal Boost ${!prev ? "Enabled" : "Disabled"}`);
              return !prev;
            });
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-[var(--tj-radius-sm,8px)] text-center transition-all border-none cursor-pointer ${
            vocalClarity
              ? "bg-amber-500/20 text-amber-400"
              : "bg-[#0A113A] text-[#9AA0AE]"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">Vocal Boost</span>
        </button>
      </div>
    </div>
  );
});

EqualizerSettings.displayName = "EqualizerSettings";

export default EqualizerSettings;
