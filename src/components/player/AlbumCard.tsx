import React from "react";
import { Disc, Calendar, Music, ArrowRight } from "lucide-react";
import { Track } from "@/types";
import { useNavigate } from "react-router-dom";
import { getPlaceholderImage } from "@/lib/utils";

interface AlbumCardProps {
  track: Track | null;
  onClosePlayer?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ track, onClosePlayer }) => {
  const navigate = useNavigate();

  if (!track) return null;

  const albumTitle = track.album || `${track.title} - Single Edition`;
  const albumId = track.albumId || "album-1";
  const releaseDate = "2026";
  const trackCount = 12;
  const coverUrl = track.coverUrl || getPlaceholderImage("cover");

  const handleGoToAlbum = () => {
    if (onClosePlayer) onClosePlayer();
    navigate(`/album/${albumId}`);
  };

  return (
    <div className="w-full bg-[#0A113A] border border-[#16244F] rounded-[18px] p-4 text-[#F2F4F8] select-none flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <img
          src={coverUrl}
          alt={albumTitle}
          className="w-14 h-14 rounded-[12px] object-cover border border-[#16244F] flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
          }}
        />

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#0098EA]">
            Album / Single
          </span>
          <h4 className="text-sm font-bold text-[#F2F4F8] truncate">{albumTitle}</h4>
          <div className="flex items-center gap-3 text-[11px] text-[#9AA0AE] mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#9AA0AE]" />
              {releaseDate}
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-[#9AA0AE]" />
              {trackCount} Tracks
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleGoToAlbum}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#050A24] border border-[#16244F] hover:border-[#0098EA] text-[#F2F4F8] rounded-[10px] text-xs font-bold transition-all active:scale-95 flex-shrink-0"
      >
        <span>Go To Album</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#0098EA]" />
      </button>
    </div>
  );
};

export default AlbumCard;
