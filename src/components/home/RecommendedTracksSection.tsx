import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, RefreshCw, X, Play, Pause } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useSmartRecommendations } from "@/hooks/useSmartRecommendations";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import { getPlaceholderImage } from "@/lib/utils";
import { Track } from "@/types";
import { recordListeningActivity } from "@/services/recommendationService";

export const RecommendedTracksSection: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, userProfile } = useAudio();
  const { recommendedTracks, refreshRecommendations, hideTrack, isLoading } =
    useSmartRecommendations();
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
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-section-title font-bold text-white tracking-tight">
              Recommended Tracks
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Selected from your listening activity and preferred genres
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshRecommendations}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer border-0 bg-transparent"
            title="Refresh recommendations"
            aria-label="Refresh track recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={() =>
              navigate("/explore/tracks?title=Recommended+Tracks&filter=recommended")
            }
            className="text-xs font-semibold text-[#38BDF8] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
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
        style={{
          scrollBehavior: "smooth",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {recommendedTracks.map((track) => {
          const isCurrentActive = currentTrack?.id === track.id;
          const coverArt =
            track.coverUrl || getPlaceholderImage(`track-${track.id}`);

          return (
            <div
              key={`rec-track-${track.id}`}
              style={{ width: "152px", scrollSnapAlign: "start" }}
              className="w-[152px] shrink-0 snap-start"
            >
              <div
                onClick={() => handleTrackPlay(track)}
                className="group relative flex flex-col justify-between p-2.5 rounded-2xl bg-[#121824] hover:bg-[#182032] transition-all cursor-pointer w-full select-none"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#0B0F17] mb-2.5">
                  <LazyArtworkImage
                    src={coverArt}
                    fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrentActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#0088CC] text-white flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                      {isCurrentActive && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      hideTrack(track.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-0 cursor-pointer"
                    title="Hide this recommendation"
                    aria-label="Hide recommendation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <h4
                    className={`text-[13px] font-semibold leading-tight truncate transition-colors ${
                      isCurrentActive
                        ? "text-[#38BDF8]"
                        : "text-white group-hover:text-[#38BDF8]"
                    }`}
                  >
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-slate-400 truncate">
                      {track.artist}
                    </span>
                    <VerifiedArtistBadge
                      isVerified={Boolean(track.artistVerified)}
                      size="xs"
                    />
                  </div>

                  <div className="mt-2.5 px-2 py-1 rounded-lg bg-[#182032]/70 flex items-center justify-between">
                    <span
                      className="text-[10px] text-slate-400 truncate max-w-[88px]"
                      title={track.recommendationReason}
                    >
                      {track.recommendationReason || track.genre}
                    </span>
                    {track.recommendationScore && (
                      <span className="text-[10px] font-mono text-[#38BDF8] font-bold">
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
