import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { Mic2, Type, X, Play } from "lucide-react";
import { Track } from "@/types";

interface LyricsSheetProps {
  track: Track | null;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onClose?: () => void;
}

export interface LyricLine {
  time: number | null;
  text: string;
}

function parseTrackLyrics(rawLyrics: string | undefined): LyricLine[] {
  if (!rawLyrics || typeof rawLyrics !== "string") return [];
  const trimmed = rawLyrics.trim();
  if (!trimmed) return [];

  const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/;
  const lines = trimmed.split(/\r?\n/);
  const parsed: LyricLine[] = [];

  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    const match = clean.match(lrcRegex);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
      const text = match[4].trim();
      if (text) {
        parsed.push({
          time: mins * 60 + secs + ms / 1000,
          text,
        });
      }
    } else {
      parsed.push({
        time: null,
        text: clean,
      });
    }
  }

  return parsed;
}

export const LyricsSheet: React.FC<LyricsSheetProps> = React.memo(({
  track,
  currentTime,
  duration: _duration,
  onSeek,
  onClose,
}) => {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const lyrics = useMemo(() => parseTrackLyrics(track?.lyrics), [track?.lyrics]);
  const hasTimestamps = useMemo(() => lyrics.some((l) => l.time !== null), [lyrics]);

  const activeIndex = useMemo(() => {
    if (!hasTimestamps) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      const t = lyrics[i].time;
      if (t !== null && t <= currentTime + 0.3) {
        idx = i;
      }
    }
    return idx;
  }, [lyrics, hasTimestamps, currentTime]);

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050A24]/95 backdrop-blur-md text-[#F2F4F8] select-none rounded-[var(--tj-radius-md,10px)] p-4 border-none">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9AA0AE]">
            {hasTimestamps ? "Synced Lyrics" : "Lyrics"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const sizes: Array<"sm" | "base" | "lg" | "xl"> = ["sm", "base", "lg", "xl"];
              const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
              setFontSize(next);
            }}
            className="p-1.5 rounded-[var(--tj-radius-sm,8px)] text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F] transition-colors cursor-pointer border-none bg-transparent"
            title="Cycle font size"
            aria-label="Cycle lyrics font size"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close lyrics"
              className="p-1.5 rounded-[var(--tj-radius-sm,8px)] text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F] transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Lyrics Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-4 py-4 px-2 scrollbar-thin scrollbar-thumb-[#16244F] max-h-[300px]"
      >
        {lyrics.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Mic2 className="w-7 h-7 text-[#9AA0AE]/50 mx-auto" />
            <p className="text-xs font-semibold text-[#F2F4F8]">No lyrics available for this track.</p>
            <p className="text-[11px] text-[#9AA0AE]">
              Lyrics will appear here when provided by the artist.
            </p>
          </div>
        ) : (
          lyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = hasTimestamps && activeIndex > index;
            const isSeekable = line.time !== null;

            return (
              <motion.p
                key={`${index}-${line.text.slice(0, 12)}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (line.time !== null) {
                    onSeek(line.time);
                  }
                }}
                animate={{
                  scale: isActive ? 1.03 : 1,
                  opacity: isActive ? 1 : isPast ? 0.55 : hasTimestamps ? 0.65 : 0.9,
                }}
                transition={{ duration: 0.2 }}
                className={`group flex items-start gap-2 transition-colors duration-200 ${
                  isSeekable ? "cursor-pointer hover:text-[#F2F4F8]" : ""
                } ${fontSizeClasses[fontSize]} ${
                  isActive
                    ? "text-[#FFFFFF] font-extrabold drop-shadow-[0_0_8px_rgba(0,180,216,0.5)]"
                    : "text-[#9AA0AE] font-semibold"
                }`}
              >
                {isSeekable && (
                  <Play className="w-3 h-3 mt-1.5 text-[var(--tj-color-brand-primary,#00B4D8)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
                <span className="leading-snug">{line.text}</span>
              </motion.p>
            );
          })
        )}
      </div>
    </div>
  );
});

LyricsSheet.displayName = "LyricsSheet";

export default LyricsSheet;
