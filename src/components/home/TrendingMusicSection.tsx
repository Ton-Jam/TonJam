import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import TrackCard from '@/components/TrackCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import VerticalSectionListModal from '@/components/common/VerticalSectionListModal';

export const TrendingMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allTrendingTracks = useMemo(() => {
    if (!allTracks || allTracks.length === 0) return [];
    return [...allTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [allTracks]);

  const trendingTracks = useMemo(() => {
    return allTrendingTracks.slice(0, 10);
  }, [allTrendingTracks]);

  if (!trendingTracks || trendingTracks.length === 0) return null;

  return (
    <>
      <section className="space-y-3 text-left w-full">
        <div className="flex items-center justify-between px-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-section-title font-bold text-white">
                Trending
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">Top-streamed music by the community this week</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          {...handlers}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2 after:content-[''] after:shrink-0 after:w-2 w-full snap-x snap-mandatory overscroll-x-contain select-none"
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

      <VerticalSectionListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Trending Music"
        subtitle="Top-streamed tracks across TonJam this week"
        items={allTrendingTracks}
        renderItem={(track) => (
          <div className="w-[168px]">
            <TrackCard track={track} variant="default" className="w-full" />
          </div>
        )}
      />
    </>
  );
};

export default TrendingMusicSection;
