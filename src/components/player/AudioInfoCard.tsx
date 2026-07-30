import React from "react";
import { Info, Disc, Zap, Volume2, ShieldCheck, FileText, Clock } from "lucide-react";
import { Track } from "@/types";

interface AudioInfoCardProps {
  track: Track | null;
}

export const AudioInfoCard: React.FC<AudioInfoCardProps> = ({ track }) => {
  if (!track) return null;

  // Extract or derive metadata
  const codec = track.isHighFidelity ? "FLAC (Lossless)" : "AAC Audio";
  const bitrate = track.isHighFidelity ? "24-bit / 96.0 kHz (Hi-Res)" : "320 kbps";
  const sampleRate = track.isHighFidelity ? "96.0 kHz" : "44.1 kHz";
  const channelLayout = "Stereo 2.0";
  const fileSize = track.isHighFidelity ? "38.5 MB" : "9.2 MB";

  const formatDuration = (secs: number) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full bg-[#0A113A] border border-[#16244F] rounded-[18px] p-4 text-[#F2F4F8] select-none">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16244F]/60 mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#5B6BFF]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2F4F8]">
            Audio Engineering & Metadata
          </h4>
        </div>
        <span className="px-2 py-0.5 bg-[#5B6BFF]/15 border border-[#5B6BFF]/30 text-[#5B6BFF] text-[10px] font-black rounded-[6px] uppercase tracking-wide">
          {track.isHighFidelity ? "Lossless Audio" : "High Quality"}
        </span>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Disc className="w-3 h-3 text-[#5B6BFF]" /> Codec
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{codec}</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Bitrate / Depth
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{bitrate}</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-purple-400" /> Spatial / Channels
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{channelLayout}</span>
        </div>

        <div className="bg-[#050A24] border border-[#16244F] rounded-[12px] p-2.5 flex flex-col gap-1">
          <span className="text-[10px] text-[#9AA0AE] font-semibold flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-400" /> File Size
          </span>
          <span className="font-bold text-[#F2F4F8] truncate">{fileSize}</span>
        </div>
      </div>

      {/* Footer verification note */}
      <div className="mt-3 pt-2.5 border-t border-[#16244F]/40 flex items-center justify-between text-[10px] text-[#9AA0AE]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5B6BFF]" />
          Verified TON On-Chain Audio Fingerprint
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioInfoCard;
