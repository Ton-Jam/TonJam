import React, { useState } from "react";
import { Sliders, Volume2, Sparkles, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

interface Band {
  label: string;
  freq: string;
  val: number; // -12 to +12 dB
}

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

export const EqualizerSettings: React.FC<EqualizerSettingsProps> = () => {
  const [bands, setBands] = useState<Band[]>(DEFAULT_BANDS);
  const [activePreset, setActivePreset] = useState<string>("Flat");
  const [bassPunch, setBassPunch] = useState(true);
  const [surround3D, setSurround3D] = useState(true);
  const [vocalClarity, setVocalClarity] = useState(false);

  const handleBandChange = (index: number, newVal: number) => {
    const updated = [...bands];
    updated[index].val = newVal;
    setBands(updated);
    setActivePreset("Custom");
  };

  const applyPreset = (presetName: string) => {
    const vals = PRESETS[presetName];
    if (!vals) return;
    const updated = bands.map((b, i) => ({ ...b, val: vals[i] }));
    setBands(updated);
    setActivePreset(presetName);
    toast.success(`EQ Preset set to ${presetName}`);
  };

  const handleReset = () => {
    applyPreset("Flat");
  };

  return (
    <div className="w-full bg-[#080D2D]/95 backdrop-blur-xl border border-[#0098EA]/30 rounded-2xl p-4 space-y-4 shadow-2xl text-[#F2F4F8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#16244F]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0098EA]/20 text-[#0098EA]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Sound Equalizer & Audio FX</h3>
            <p className="text-[10px] text-[#9AA0AE]">5-Band frequency control & DSP sound enhancement</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#0098EA] bg-[#0A113A] px-2 py-1 rounded-md border border-[#0098EA]/30">
            {activePreset}
          </span>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#0A113A] hover:bg-[#16244F] text-[#9AA0AE] hover:text-white transition-colors"
            title="Reset Equalizer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Presets Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider">Presets</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Object.keys(PRESETS).map((p) => {
            const isActive = activePreset === p;
            return (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#0098EA] text-white shadow-[0_0_10px_rgba(0,152,234,0.5)] scale-105"
                    : "bg-[#0A113A] hover:bg-[#16244F] text-[#9AA0AE] hover:text-white"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Interactive Equalizer Sliders */}
      <div className="grid grid-cols-5 gap-2 pt-1 pb-2">
        {bands.map((b, idx) => (
          <div key={b.label} className="flex flex-col items-center gap-2 bg-[#050A24]/60 p-2 rounded-xl border border-[#16244F]/50">
            {/* dB Value Indicator */}
            <span className={`text-[10px] font-mono font-bold ${b.val > 0 ? "text-[#0098EA]" : b.val < 0 ? "text-amber-400" : "text-slate-400"}`}>
              {b.val > 0 ? `+${b.val}` : b.val}dB
            </span>

            {/* Vertical Slider */}
            <div className="relative h-28 flex items-center justify-center">
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={b.val}
                onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                className="w-28 h-1.5 accent-[#0098EA] cursor-pointer appearance-none bg-[#16244F] rounded-lg -rotate-90 origin-center"
              />
            </div>

            {/* Band Freq Label */}
            <div className="text-center leading-tight">
              <span className="text-[9px] font-bold text-white block">{b.label}</span>
              <span className="text-[8px] text-[#9AA0AE] font-mono block">{b.freq}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Audio FX Enhancements Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#16244F]">
        <button
          onClick={() => {
            setBassPunch(!bassPunch);
            toast.info(`Bass Punch ${!bassPunch ? "Enabled" : "Disabled"}`);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
            bassPunch
              ? "bg-[#0098EA]/20 border-[#0098EA] text-[#0098EA]"
              : "bg-[#0A113A] border-[#16244F] text-[#9AA0AE]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">Bass Punch</span>
        </button>

        <button
          onClick={() => {
            setSurround3D(!surround3D);
            toast.info(`3D Surround ${!surround3D ? "Enabled" : "Disabled"}`);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
            surround3D
              ? "bg-purple-500/20 border-purple-500 text-purple-400"
              : "bg-[#0A113A] border-[#16244F] text-[#9AA0AE]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">3D Surround</span>
        </button>

        <button
          onClick={() => {
            setVocalClarity(!vocalClarity);
            toast.info(`Vocal Boost ${!vocalClarity ? "Enabled" : "Disabled"}`);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
            vocalClarity
              ? "bg-amber-500/20 border-amber-500 text-amber-400"
              : "bg-[#0A113A] border-[#16244F] text-[#9AA0AE]"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[10px] font-bold">Vocal Boost</span>
        </button>
      </div>
    </div>
  );
};

export default EqualizerSettings;
