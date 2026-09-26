import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, History, Play, Pause, MoreVertical } from "lucide-react";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAudio } from "@/contexts/AudioContext";
import { MOCK_TRACKS } from "@/constants";
import { Track } from "@/types";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { getPlaceholderImage } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

export const RecentlyPlayedSection: React.FC = () => {
  const navigate = useNavigate();
  const { recentlyPlayed } = useLibrary();
  const { allTracks, currentTrack, isPlaying, playTrack, togglePlay, setOptionsTrack } = useAudio();

  const displayTracks: Track[] = (recentlyPlayed && recentlyPlayed.length > 0)
    ? recentlyPlayed.slice(0, 6)
    : (allTracks && allTracks.length > 0 ? allTracks.slice(0, 6) : MOCK_TRACKS.slice(0, 6));

  if (!displayTracks || displayTracks.length === 0) return null;

  const handlePlayToggle = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    triggerHaptic("light");
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleMoreClick = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    triggerHaptic("light");
    setOptionsTrack(track);
  };

  return (
    <section className="space-y-2.5 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0088CC]" />
          <h2 className="text-section-title font-bold text-white">
            Recently Played
          </h2>
        </div>
        <button 
          onClick={() => navigate("/explore/tracks?title=Recently+Played&filter=history")} 
          className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spotify-inspired compact music-row layout */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-1">
        {displayTracks.map((track) => {
          const isCurrentActive = currentTrack?.id === track.id;
          const isThisPlaying = isCurrentActive && isPlaying;

          return (
            <div
              key={track.id || track.songId}
              onClick={() => playTrack(track)}
              className="flex items-center gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors cursor-pointer group select-none border-0"
            >
              {/* [Artwork] */}
              <div 
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0"
                onClick={(e) => handlePlayToggle(e, track)}
              >
                <LazyArtworkImage
                  src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)}
                  fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    isCurrentActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isThisPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-[#0088CC]" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                  )}
                </div>
              </div>

              {/* [Track title + Artist] */}
              <div className="flex-1 min-w-0 text-left">
                <h4 
                  className={`text-sm font-semibold truncate leading-snug ${
                    isCurrentActive ? "text-[#0088CC]" : "text-white group-hover:text-zinc-100"
                  }`}
                >
                  {track.title}
                </h4>
                <p 
                  className="text-xs text-zinc-400 truncate mt-0.5 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.artistId) {
                      navigate(`/artist/${track.artistId}`);
                    }
                  }}
                >
                  {track.artist}
                </p>
              </div>

              {/* [Play] */}
              <button
                onClick={(e) => handlePlayToggle(e, track)}
                className="p-2 rounded-full hover:bg-white/10 active:scale-90 text-zinc-300 hover:text-white transition-all cursor-pointer border-0 shrink-0"
                aria-label={isThisPlaying ? "Pause" : "Play"}
              >
                {isThisPlaying ? (
                  <Pause className="w-4 h-4 fill-current text-[#0088CC]" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* [More] */}
              <button
                onClick={(e) => handleMoreClick(e, track)}
                className="p-2 rounded-full hover:bg-white/10 active:scale-90 text-zinc-400 hover:text-white transition-all cursor-pointer border-0 shrink-0"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
