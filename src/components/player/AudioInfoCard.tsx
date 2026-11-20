import React from "react";
import { Info, Disc, Zap, Music, ShieldCheck, Hash, Clock } from "lucide-react";
import { Track } from "@/types";

interface AudioInfoCardProps {
  track: Track | null;
}

function formatDuration(secs: number): string {
  if (!Number.isFinite(secs) || secs <= 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const AudioInfoCard: React.FC<AudioInfoCardProps> = React.memo(({ track }) => {
  if (!track) return null;

  const formatLabel = track.isHighFidelity ? "Lossless Audio" : track.bitrate ? `${track.bitrate}` : "Standard Audio";
  const codec = track.isHighFidelity ? "FLAC / PCM" : "MP3 / AAC";
  const genre = track.genre || "Music";
  const tempoOrKey = [
    track.bpm ? `${track.bpm} BPM` : null,
    track.key ? track.key : null,
  ]
    .filter(Boolean)
    .join(" • ") || "Not specified";
  const sizeOrStorage = track.fileSize
    ? track.fileSize
    : track.ipfsUrl || track.cid
    ? "IPFS Pinned"
    : "Cloud Stream";

  return (
    <div className="w-full bg-[#0A113A] rounded-[var(--tj-radius-md,10px)] p-4 text-[#F2F4F8] select-none border-none">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Audio Specs & Metadata
          </h4>
        </div>
        <span className="px-2 py-0.5 bg-[#0098EA]/15 text-[var(--tj-color-brand-primary,#00B4D8)] text-[10px] font-black rounded-[var(--tj-radius-compact,5px)] uppercase tracking-wide">
          {formatLabel}
        </span>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Disc className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)]" /> Format
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{codec}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Genre
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{genre}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Music className="w-3 h-3 text-white" /> Tempo / Key
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{tempoOrKey}</span>
        </div>

        <div className="bg-[#050A24] rounded-[var(--tj-radius-sm,8px)] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Hash className="w-3 h-3 text-amber-400" /> Delivery
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{sizeOrStorage}</span>
        </div>
      </div>

      {/* Footer verification note */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-[10px] text-[#9AA0AE]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
          {track.isNFT ? "On-Chain Music NFT Metadata" : "Verified Track Metadata"}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
});

AudioInfoCard.displayName = "AudioInfoCard";

export default AudioInfoCard;
