import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Sparkles, Plus, Check, Music, Headphones } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Track } from "@/types";
import { MOCK_TRACKS } from "@/constants";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import { getPlaceholderImage } from "@/lib/utils";
import { toast } from "sonner";

const formatTrackDuration = (seconds?: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const FeaturedMusicHero: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks, currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = useAudio();
  const [queued, setQueued] = useState(false);

  // Pick top featured track from real catalog, or fallback to constants
  const featuredTrack: Track | null = useMemo(() => {
    const list = allTracks && allTracks.length > 0 ? allTracks : MOCK_TRACKS;
    if (!list || list.length === 0) return null;
    // Prefer track marked as NFT or with highest plays
    const sorted = [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    return sorted[0] || null;
  }, [allTracks]);

  if (!featuredTrack) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-[#0c1b30]/80 via-[#0a1526]/70 to-[#070e1a]/90 backdrop-blur-xl text-center shadow-xl shadow-black/30">
          <Music className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm text-zinc-400 font-medium">No featured tracks available right now</p>
        </div>
      </div>
    );
  }

  const isCurrentActive = currentTrack?.id === featuredTrack.id;
  const isThisPlaying = isCurrentActive && isPlaying;

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentActive) {
      await togglePlay();
    } else {
      await playTrack(featuredTrack);
    }
  };

  const handleQueueTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(featuredTrack);
    setQueued(true);
    toast.success(`Added "${featuredTrack.title}" to queue`);
    setTimeout(() => setQueued(false), 2000);
  };

  const handleOpenTrack = () => {
    navigate(`/track/${featuredTrack.id}`);
  };

  const handleOpenArtist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (featuredTrack.artistId) {
      navigate(`/artist/${featuredTrack.artistId}`);
    } else {
      navigate(`/explore/tracks?filter=${encodeURIComponent(featuredTrack.artist)}`);
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 w-full text-left">
      <div 
        onClick={handleOpenTrack}
        className="group relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e223d]/90 via-[#0a172a]/85 to-[#060e1c]/95 backdrop-blur-xl p-5 sm:p-7 lg:p-8 cursor-pointer transition-all duration-300 shadow-2xl shadow-black/40 hover:shadow-[#0088CC]/10"
        role="region"
        aria-label="Featured music release"
      >
        {/* Ambient TonJam Blue Glow in the background (no border lines) */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0088CC]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Cover Artwork */}
          <div className="relative w-full md:w-56 lg:w-64 aspect-square rounded-2xl overflow-hidden shrink-0 bg-neutral-900 shadow-xl shadow-black/60 group-hover:scale-[1.02] transition-transform duration-300">
            <LazyArtworkImage
              src={featuredTrack.coverUrl || getPlaceholderImage(`track-${featuredTrack.id}`)}
              fallbackSrc={getPlaceholderImage(`track-${featuredTrack.id}`)}
              alt={featuredTrack.title}
              className="w-full h-full object-cover"
            />
            {/* Quick Play overlay for desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-end p-3 md:hidden">
              <button
                type="button"
                onClick={handlePlayToggle}
                className="w-12 h-12 rounded-full bg-[#0088CC] hover:bg-[#0077b3] text-white flex items-center justify-center shadow-lg shadow-[#0088CC]/40 active:scale-95 transition-transform"
                aria-label={isThisPlaying ? "Pause featured track" : "Play featured track"}
              >
                {isThisPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="flex-1 min-w-0 w-full flex flex-col justify-between py-1 space-y-4">
            <div className="space-y-2">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0088CC]/20 text-[#0088CC] text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#0088CC]" />
                  Featured Release
                </span>
                {featuredTrack.genre && (
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-zinc-300 text-[11px] font-medium">
                    {featuredTrack.genre}
                  </span>
                )}
                {featuredTrack.isNFT && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-400/15 text-cyan-300 text-[11px] font-semibold">
                    Music NFT
                  </span>
                )}
              </div>

              {/* Title & Artist */}
              <div className="pt-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight group-hover:text-cyan-200 transition-colors line-clamp-2">
                  {featuredTrack.title}
                </h2>
                <button
                  type="button"
                  onClick={handleOpenArtist}
                  className="mt-1 text-base sm:text-lg text-zinc-300 hover:text-[#0088CC] font-semibold transition-colors flex items-center gap-1.5"
                >
                  {featuredTrack.artist}
                </button>
              </div>

              {/* Metadata strip */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                {featuredTrack.duration ? (
                  <span>{formatTrackDuration(featuredTrack.duration)}</span>
                ) : null}
                {featuredTrack.playCount ? (
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                    {featuredTrack.playCount.toLocaleString()} plays
                  </span>
                ) : null}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePlayToggle}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0088CC] hover:bg-[#0077b3] active:scale-95 text-white font-bold text-sm shadow-lg shadow-[#0088CC]/30 transition-all cursor-pointer"
                aria-label={isThisPlaying ? "Pause" : "Play Now"}
              >
                {isThisPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQueueTrack}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-zinc-200 hover:text-white font-semibold text-sm transition-all cursor-pointer"
                aria-label="Add to Queue"
                title="Add to queue"
              >
                {queued ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">In Queue</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Queue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTrack();
                }}
                className="px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors ml-auto sm:ml-0"
              >
                View Track Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMusicHero;
