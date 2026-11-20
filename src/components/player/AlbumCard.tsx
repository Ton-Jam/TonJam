import React, { useMemo } from "react";
import { Calendar, Music, ArrowRight } from "lucide-react";
import { Track } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";

interface AlbumCardProps {
  track: Track | null;
  onClosePlayer?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = React.memo(({ track, onClosePlayer }) => {
  const navigate = useNavigate();
  const { allTracks = [] } = useAudio();

  const albumTracksCount = useMemo(() => {
    if (!track) return 0;
    if (track.albumId) {
      const byId = allTracks.filter((t) => t.albumId === track.albumId).length;
      if (byId > 0) return byId;
    }
    if (track.album) {
      const byTitle = allTracks.filter((t) => t.album === track.album).length;
      if (byTitle > 0) return byTitle;
    }
    return 1;
  }, [allTracks, track]);

  if (!track) return null;

  const albumTitle = track.album || `${track.title} - Single`;
  const albumId = track.albumId || track.id;
  const releaseDate = track.releaseDate ? track.releaseDate.slice(0, 4) : null;
  const coverUrl = track.coverUrl || getPlaceholderImage("cover");

  const handleGoToAlbum = () => {
    if (onClosePlayer) onClosePlayer();
    navigate(`/album/${albumId}`);
  };

  return (
    <div className="w-full bg-[#0A113A] rounded-[var(--tj-radius-md,10px)] p-4 text-[#F2F4F8] select-none flex items-center justify-between gap-4 border-none">
      <div className="flex items-center gap-3.5 min-w-0">
        <img
          src={coverUrl}
          alt={albumTitle}
          referrerPolicy="no-referrer"
          className="w-14 h-14 rounded-[var(--tj-radius-sm,8px)] object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
          }}
        />

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--tj-color-brand-primary,#00B4D8)]">
            {track.album ? "Album" : "Single Release"}
          </span>
          <h4 className="text-sm font-bold text-[#F2F4F8] truncate">{albumTitle}</h4>
          <div className="flex items-center gap-3 text-[11px] text-[#9AA0AE] mt-0.5">
            {releaseDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#9AA0AE]" />
                {releaseDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-[#9AA0AE]" />
              {albumTracksCount} {albumTracksCount === 1 ? "Track" : "Tracks"}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoToAlbum}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#050A24] hover:bg-[#111E4D] text-[#F2F4F8] rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all active:scale-95 flex-shrink-0 border-none cursor-pointer"
      >
        <span>Go To Album</span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--tj-color-brand-primary,#00B4D8)]" />
      </button>
    </div>
  );
});

AlbumCard.displayName = "AlbumCard";

export default AlbumCard;
