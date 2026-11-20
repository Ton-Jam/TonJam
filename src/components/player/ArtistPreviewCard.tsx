import React, { useState, useMemo } from "react";
import { CheckCircle2, Users, Music, UserPlus, UserCheck, ArrowRight, Coins } from "lucide-react";
import { Track } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import TipArtistModal from "@/components/TipArtistModal";

interface ArtistPreviewCardProps {
  track: Track | null;
  onClosePlayer?: () => void;
}

export const ArtistPreviewCard: React.FC<ArtistPreviewCardProps> = React.memo(({
  track,
  onClosePlayer,
}) => {
  const navigate = useNavigate();
  const { followedUserIds = [], toggleFollowUser, artists = [], allTracks = [] } = useAudio();
  const [showTipModal, setShowTipModal] = useState(false);

  const matchedArtist = useMemo(() => {
    if (!track) return null;
    return (
      artists.find(
        (a) =>
          (track.artistId && a.uid === track.artistId) ||
          a.name.toLowerCase() === track.artist.toLowerCase()
      ) || null
    );
  }, [artists, track]);

  const artistTracksCount = useMemo(() => {
    if (!track) return 0;
    return allTracks.filter(
      (t) =>
        (track.artistId && t.artistId === track.artistId) ||
        t.artist.toLowerCase() === track.artist.toLowerCase()
    ).length;
  }, [allTracks, track]);

  if (!track) return null;

  const artistName = matchedArtist?.name || track.artist || "Artist";
  const artistId = matchedArtist?.uid || track.artistId || "";
  const isFollowed = Boolean(artistId && followedUserIds.includes(artistId));
  const isVerified = Boolean(track.artistVerified || matchedArtist?.verified);
  const avatarUrl = matchedArtist?.avatarUrl || track.artistAvatar || getPlaceholderImage("avatar");
  const followerCount = matchedArtist?.followers;

  const handleViewProfile = () => {
    if (!artistId) return;
    if (onClosePlayer) onClosePlayer();
    navigate(`/artist/${artistId}`);
  };

  return (
    <div className="w-full bg-[#0A113A] rounded-[var(--tj-radius-md,10px)] p-4 text-[#F2F4F8] select-none flex flex-col sm:flex-row items-center justify-between gap-4 border-none">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
        <img
          src={avatarUrl}
          alt={artistName}
          referrerPolicy="no-referrer"
          className="w-14 h-14 rounded-full object-cover shadow-md flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage("avatar");
          }}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#F2F4F8] truncate">{artistName}</h4>
            {isVerified && (
              <CheckCircle2 className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-[#00B4D8]/20 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#9AA0AE] mt-0.5 flex-wrap">
            {typeof followerCount === "number" && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                {followerCount.toLocaleString()} Followers
              </span>
            )}
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-emerald-400" />
              {artistTracksCount} {artistTracksCount === 1 ? "Track" : "Tracks"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Follow, Tip & View Profile Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
        <button
          type="button"
          onClick={() => setShowTipModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] bg-gradient-to-r from-amber-500/20 to-blue-600/30 hover:from-amber-500/30 hover:to-blue-600/40 text-amber-300 hover:text-white text-xs font-bold transition-all active:scale-95 border-none cursor-pointer"
          title="Tip Artist in TON"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>Tip TON</span>
        </button>

        {artistId && (
          <button
            type="button"
            onClick={() => toggleFollowUser(artistId)}
            aria-pressed={isFollowed}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all active:scale-95 border-none cursor-pointer ${
              isFollowed
                ? "bg-[#16244F] text-[#F2F4F8]"
                : "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white hover:bg-[var(--tj-color-brand-hover,#21C2E8)]"
            }`}
          >
            {isFollowed ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}

        {artistId && (
          <button
            type="button"
            onClick={handleViewProfile}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#050A24] hover:bg-[#16244F] text-[#F2F4F8] rounded-[var(--tj-radius-sm,8px)] text-xs font-semibold transition-all active:scale-95 border-none cursor-pointer"
          >
            <span>Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9AA0AE]" />
          </button>
        )}
      </div>

      {showTipModal && (
        <TipArtistModal track={track} onClose={() => setShowTipModal(false)} />
      )}
    </div>
  );
});

ArtistPreviewCard.displayName = "ArtistPreviewCard";

export default ArtistPreviewCard;
