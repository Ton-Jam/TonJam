import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, ChevronRight } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import ArtistCard from "@/components/ArtistCard";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

export const FavoriteArtistUpdatesSection: React.FC = () => {
  const navigate = useNavigate();
  const { followedUserIds = [], artists = [] } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const followedArtists = useMemo(() => {
    if (!artists || artists.length === 0) return [];
    const filtered = artists.filter((art) => followedUserIds.includes(art.uid));
    return filtered.length > 0 ? filtered : artists.slice(0, 6);
  }, [artists, followedUserIds]);

  if (followedArtists.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
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

      <div 
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        {followedArtists.map((art) => (
          <ArtistCard 
            key={art.uid} 
            artist={art}
            variant="default"
            className="w-[120px] sm:w-[130px] shrink-0 snap-start bg-zinc-950 px-3 py-4 rounded-2xl border-none hover:bg-zinc-900 transition-colors"
          />
        ))}
      </div>
    </section>
  );
};

export default FavoriteArtistUpdatesSection;
