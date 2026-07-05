import React, { useState } from "react";
import { motion } from "motion/react";
import { Award, Users, Plus, Check } from "lucide-react";
import { LeaderboardUser } from "../types";

interface TopArtistsProps {
  artists: LeaderboardUser[];
  onSelectArtist: (artist: LeaderboardUser) => void;
}

export const TopArtists: React.FC<TopArtistsProps> = ({
  artists,
  onSelectArtist
}) => {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowing(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full text-left" id="marketplace-top-artists">
      <div className="space-y-0.5 mb-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-400" />
          Top Verified Artists
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          The heavyweights of the TonJam creative roster
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {artists.map((art) => {
          const isFollowing = !!following[art.id];
          return (
            <motion.div
              key={art.id}
              whileHover={{ y: -4 }}
              onClick={() => onSelectArtist(art)}
              className="bg-zinc-950 border border-zinc-900 rounded-[10px] p-4 flex flex-col items-center text-center cursor-pointer justify-between"
            >
              {/* Avatar + Verified Ring */}
              <div className="relative mb-3">
                <img
                  src={art.avatar}
                  alt={art.name}
                  className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800"
                  loading="lazy"
                />
                {art.isVerified && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-zinc-950">
                    ✓
                  </span>
                )}
              </div>

              {/* Names */}
              <div className="space-y-0.5 mb-3 w-full">
                <span className="text-xs font-black text-white uppercase block truncate">{art.name}</span>
                <span className="text-[9px] font-bold text-zinc-500 block truncate">@{art.username}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-1.5 text-zinc-400 text-[9px] font-black uppercase tracking-wider mb-4">
                <Users className="w-3 h-3" />
                <span>{art.followersCount.toLocaleString()} Fans</span>
              </div>

              {/* Actions */}
              <div className="w-full flex gap-1.5 pt-1">
                <button
                  onClick={(e) => toggleFollow(art.id, e)}
                  className={`flex-1 py-1.5 rounded-[6px] text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
                    isFollowing
                      ? "bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/20"
                      : "bg-white text-zinc-950 hover:bg-zinc-200"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-2.5 h-2.5" /> Following
                    </>
                  ) : (
                    <>
                      <Plus className="w-2.5 h-2.5" /> Follow
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
