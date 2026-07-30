import React from "react";
import { CheckCircle2, Users, Radio, UserPlus, UserCheck, ArrowRight } from "lucide-react";
import { Track } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";

interface ArtistPreviewCardProps {
  track: Track | null;
  onClosePlayer?: () => void;
}

export const ArtistPreviewCard: React.FC<ArtistPreviewCardProps> = ({
  track,
  onClosePlayer
}) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();

  if (!track) return null;

  const artistName = track.artist || "Featured Artist";
  const artistId = track.artistId || "artist-1";
  const isFollowed = followedUserIds.includes(artistId);
  const isVerified = track.artistVerified ?? true;
  const avatarUrl = track.artistAvatar || getPlaceholderImage("avatar");

  const handleViewProfile = () => {
    if (onClosePlayer) onClosePlayer();
    navigate(`/artist/${artistId}`);
  };

  return (
    <div className="w-full bg-[#0A113A] border border-[#16244F] rounded-[18px] p-4 text-[#F2F4F8] select-none flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <img
          src={avatarUrl}
          alt={artistName}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#16244F] shadow-md flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage("avatar");
          }}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#F2F4F8] truncate">{artistName}</h4>
            {isVerified && (
              <CheckCircle2 className="w-4 h-4 text-[#5B6BFF] fill-[#5B6BFF]/20 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#9AA0AE] mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#5B6BFF]" />
              128.4K Followers
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              94.2K Monthly
            </span>
          </div>
        </div>
      </div>

      {/* Right: Follow & View Profile Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => toggleFollowUser(artistId)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all active:scale-95 ${
            isFollowed
              ? "bg-[#16244F] text-[#F2F4F8] border border-[#16244F]"
              : "bg-[#5B6BFF] text-white hover:bg-[#5B6BFF]/90"
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

        <button
          onClick={handleViewProfile}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#050A24] border border-[#16244F] hover:border-[#5B6BFF] text-[#F2F4F8] rounded-[10px] text-xs font-semibold transition-all active:scale-95"
        >
          <span>Profile</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#9AA0AE]" />
        </button>
      </div>
    </div>
  );
};

export default ArtistPreviewCard;
