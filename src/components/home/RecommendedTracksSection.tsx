import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RefreshCw, X, Play, Pause, Radio } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import VerifiedArtistBadge from '@/components/common/VerifiedArtistBadge';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { getPlaceholderImage } from '@/lib/utils';
import { Track } from '@/types';
import { recordListeningActivity } from '@/services/recommendationService';

export const RecommendedTracksSection: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, userProfile } = useAudio();
  const { recommendedTracks, refreshRecommendations, hideTrack, isLoading } = useSmartRecommendations();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();

  const handleTrackPlay = (track: Track) => {
    playTrack(track);
    if (userProfile?.uid) {
      recordListeningActivity(userProfile.uid, track);
    }
  };

  if (!isLoading && (!recommendedTracks || recommendedTracks.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00B4D8] animate-pulse" />
            <h2 className="text-section-title font-bold text-white tracking-tight">
              Recommended Tracks
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Tuned to your listening history and preferred frequencies</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
            title="Refresh recommendations"
            aria-label="Refresh track recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={() => navigate('/explore/tracks?title=Recommended+Tracks&filter=recommended')}
            className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
            aria-label="See all recommended tracks"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        {...handlers}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:shrink-0 after:w-4 sm:after:w-6 lg:after:w-8 w-full snap-x snap-mandatory overscroll-x-contain select-none"
        style={{ scrollBehavior: 'smooth', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {recommendedTracks.map((track) => {
          const isCurrentActive = currentTrack?.id === track.id;
          const coverArt = track.coverUrl || getPlaceholderImage(`track-${track.id}`);

          return (
            <div
              key={`rec-track-${track.id}`}
              style={{ width: '148px', scrollSnapAlign: 'start' }}
              className="w-[148px] shrink-0 snap-start"
            >
              <div
                onClick={() => handleTrackPlay(track)}
                className="group relative flex flex-col justify-between p-2 rounded-[2px] border-2 border-[rgba(192,202,214,0.22)] hover:border-[rgba(105,175,255,0.65)] bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer w-full select-none"
              >
                {/* Artwork */}
                <div className="relative w-full aspect-square rounded-[2px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={coverArt}
                    fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Play Overlay */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="w-9 h-9 rounded-full bg-[#00B4D8] text-black flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                      {isCurrentActive && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Dismiss / Hide Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideTrack(track.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 text-zinc-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                    title="Hide this recommendation"
                    aria-label="Hide recommendation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-col min-w-0">
                  <h4 className={`text-[13px] font-medium leading-tight truncate transition-colors ${isCurrentActive ? 'text-[#00B4D8] font-semibold' : 'text-white/95 group-hover:text-blue-400'}`}>
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-zinc-400 truncate">{track.artist}</span>
                    <VerifiedArtistBadge isVerified={track.artistVerified ?? true} size="xs" />
                  </div>

                  {/* Recommendation signal reason */}
                  <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[9.5px] text-zinc-400 truncate max-w-[95px]" title={track.recommendationReason}>
                      {track.recommendationReason || track.genre}
                    </span>
                    {track.recommendationScore && (
                      <span className="text-[9px] font-mono text-[#00B4D8]/80 font-semibold">
                        {track.recommendationScore}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendedTracksSection;
