import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import ArtistCard from '@/components/ArtistCard';
import { cardTokens } from '@/design';

const FeaturedArtists: React.FC = () => {
  const { artists } = useAudio();
  const navigate = useNavigate();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  // Get top 8 artists by followers (mock or real)
  const featuredArtists = useMemo(() => {
    return [...(artists || [])]
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, 8);
  }, [artists]);

  if (!featuredArtists || featuredArtists.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 w-full text-left">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-section-title font-bold text-white">
          Popular Artists
        </h2>
        <button
          onClick={() => navigate('/artists')}
          className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
      >
        {featuredArtists.map((artist) => (
          <div
            key={artist.uid}
            style={{ width: cardTokens.artist.width }}
            className="w-[130px] shrink-0 snap-start"
          >
            <ArtistCard
              artist={artist}
              variant="default"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArtists;
