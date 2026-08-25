import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import ArtistCard from "@/components/ArtistCard";
import { Artist } from "@/types";

const STATIC_TRENDING_ARTISTS = [
  { id: "art-1", name: "DJ Krupy", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=krupy", followers: "142.5k", verified: true },
  { id: "art-2", name: "Byte Beat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=byte", followers: "84.2k", verified: true },
  { id: "art-3", name: "Echo Phase", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=echo", followers: "13.9k", verified: false },
  { id: "art-4", name: "Luna Ray", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=luna", followers: "92.0k", verified: true },
  { id: "art-5", name: "City Ghost", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ghost", followers: "128.1k", verified: true },
  { id: "art-6", name: "Major Sound", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=major", followers: "44.9k", verified: false },
  { id: "art-7", name: "Retro Vibes", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=vibes", followers: "52.3k", verified: true },
  { id: "art-8", name: "Dr. Osc", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=osc", followers: "8.4k", verified: false },
  { id: "art-9", name: "Lil Crypto", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=crypto", followers: "205.0k", verified: true },
  { id: "art-10", name: "Cosmic Key", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=key", followers: "1.9k", verified: false }
];

export const FavoriteArtistUpdatesSection: React.FC = () => {
  const navigate = useNavigate();
  const { followedUserIds = [], artists = [] } = useAudio();

  const getIsFollowing = (artId: string) => {
    if (!followedUserIds || followedUserIds.length === 0) {
      return ["art-1", "art-4", "art-9"].includes(artId);
    }
    return followedUserIds.includes(artId);
  };

  const followedArtists = useMemo(() => {
    // Check if real artists exist or fallback
    const base = (artists && artists.length > 0)
      ? artists
      : STATIC_TRENDING_ARTISTS.map((art) => ({
          uid: art.id,
          name: art.name,
          avatarUrl: art.avatar,
          followers: parseFloat(art.followers.replace('k', '')) * 1000 || 0,
          verified: art.verified,
          isVerifiedArtist: art.verified,
          username: art.name.toLowerCase().replace(/\s+/g, ''),
        } as Artist));

    const filtered = base.filter(art => getIsFollowing(art.uid));
    return filtered.length > 0 ? filtered : base.slice(0, 4);
  }, [artists, followedUserIds]);

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Favorite Artists Updates
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/artists?title=Favorite+Artists&filter=followed")} 
          className="text-xs font-bold text-primary flex items-center gap-1 outline-none cursor-pointer border-none bg-transparent hover:text-primary/80 transition-colors"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-0.5 w-full">
        {followedArtists.map((art) => (
          <ArtistCard 
            key={art.uid} 
            artist={art}
            variant="default"
            className="w-[120px] sm:w-[130px] shrink-0 bg-zinc-950 px-3 py-4 rounded-2xl border-none hover:bg-zinc-900 transition-colors"
          />
        ))}
      </div>
    </section>
  );
};

export default FavoriteArtistUpdatesSection;
