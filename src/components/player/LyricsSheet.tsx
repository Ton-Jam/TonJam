import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { Mic2, Type, Languages, X, Play } from "lucide-react";
import { Track } from "@/types";

interface LyricsSheetProps {
  track: Track | null;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onClose?: () => void;
}

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export const LyricsSheet: React.FC<LyricsSheetProps> = ({
  track,
  currentTime,
  duration,
  onSeek,
  onClose
}) => {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  // Generate or parse synced lyrics
  const lyrics: LyricLine[] = useMemo(() => {
    if (!track) return [];
    
    // Default dynamic demo synced lyrics
    const baseLyrics = [
      { time: 0, text: "🎵 [Instrumental Intro] 🎵", translation: "🎵 [Intro Instrumental] 🎵" },
      { time: 6, text: "Step into the digital soundscape", translation: "Entra en el paisaje sonoro digital" },
      { time: 12, text: "Feel the frequency vibrating in TON", translation: "Siente la frecuencia vibrando en TON" },
      { time: 18, text: "Streaming decentralized, crystal lossless clear", translation: "Transmisión descentralizada, alta fidelidad" },
      { time: 24, text: "Every note is minted on the blockchain", translation: "Cada nota está acuñada en la cadena" },
      { time: 30, text: "🎵 [Drop & Bass Break] 🎵", translation: "🎵 [Caída y Ritmo] 🎵" },
      { time: 42, text: "We break the boundaries of streaming web", translation: "Rompemos las fronteras del streaming" },
      { time: 48, text: "Direct support from fan to creator", translation: "Apoyo directo de fan a creador" },
      { time: 54, text: "Ownership is freedom, sound is art", translation: "La propiedad es libertad, el sonido es arte" },
      { time: 62, text: "Together in the TonJam arena", translation: "Juntos en la arena TonJam" },
      { time: 70, text: "🎵 [Instrumental Outro] 🎵", translation: "🎵 [Outro Instrumental] 🎵" }
    ];

    if (duration > 0) {
      const scale = duration / 80;
      return baseLyrics.map((line) => ({
        ...line,
        time: Math.round(line.time * scale * 10) / 10
      }));
    }
    return baseLyrics;
  }, [track?.id, duration]);

  // Determine active lyric line index
  const activeIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentTime, lyrics]);

  // Auto-scroll active line into center of view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeIndex]);

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg font-bold",
    xl: "text-2xl font-black"
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050A24] text-[#F2F4F8] select-none rounded-[18px] p-4 border border-[#16244F]">
      {/* Lyrics Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16244F]/60 mb-2">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-[#0098EA]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Synced Lyrics
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-[#0A113A] border border-[#16244F] rounded-[10px] p-0.5">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 text-[10px] rounded-[6px] font-bold ${
                fontSize === "sm" ? "bg-[#0098EA] text-white" : "text-[#9AA0AE]"
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 text-[10px] rounded-[6px] font-bold ${
                fontSize === "lg" ? "bg-[#0098EA] text-white" : "text-[#9AA0AE]"
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("xl")}
              className={`px-2 py-0.5 text-[10px] rounded-[6px] font-bold ${
                fontSize === "xl" ? "bg-[#0098EA] text-white" : "text-[#9AA0AE]"
              }`}
            >
              A+
            </button>
          </div>

          {/* Translation Toggle */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-1.5 rounded-[10px] border transition-all text-xs flex items-center gap-1 font-semibold ${
              showTranslation
                ? "bg-[#0098EA] text-white border-[#0098EA]"
                : "bg-[#0A113A] border-[#16244F] text-[#9AA0AE]"
            }`}
            title="Toggle Translation"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="text-[10px]">Trans</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[10px]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lyrics Scrollable Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6 py-6 pr-2 scrollbar-thin scrollbar-thumb-[#16244F]"
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <motion.div
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeek(line.time)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer transition-all duration-300 p-2.5 rounded-[12px] group ${
                isActive
                  ? "bg-[#0A113A] border border-[#0098EA]/40 shadow-lg shadow-[#0098EA]/10 opacity-100"
                  : "hover:bg-[#0A113A]/50 opacity-40 hover:opacity-80"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`${fontSizeClasses[fontSize]} transition-colors ${
                    isActive ? "text-[#F2F4F8]" : "text-[#9AA0AE]"
                  }`}
                >
                  {line.text}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(line.time);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 bg-[#0098EA] text-white rounded-full text-xs transition-opacity"
                  title="Seek to line"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>

              {showTranslation && line.translation && (
                <p className="text-xs text-[#0098EA] mt-1 font-medium italic">
                  {line.translation}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LyricsSheet;
