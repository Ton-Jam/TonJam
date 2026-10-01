import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { MOCK_TRACKS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

export const TrendingMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const trendingTracks = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    // Sort by play count or slice top trending
    return [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  }, [allTracks]);

  if (!trendingTracks || trendingTracks.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-section-title font-bold text-white">
            Trending on TonJam
          </h2>
        </div>
        <button
          onClick={() => navigate('/explore/tracks?title=Trending+on+TonJam&filter=trending')}
          className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {trendingTracks.map((track) => (
          <div
            key={track.id}
            style={{ width: 'var(--card-width, 168px)', scrollSnapAlign: 'start' }}
            className="w-[168px] shrink-0 snap-start"
          >
            <TrackCard
              track={track}
              variant="default"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingMusicSection;
