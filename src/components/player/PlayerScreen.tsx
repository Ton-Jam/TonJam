import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Share2,
  Download,
  ListMusic,
  Mic2,
  Check,
  Gem,
  Award,
  User,
  Repeat2,
  MessageSquare,
  Plus,
  Flame,
  Coins,
  Sliders,
  Radio,
  Activity,
  Gauge,
} from "lucide-react";
import { AnimatedHeart } from "@/components/common/AnimatedHeart";
import { useAudio } from "@/contexts/AudioContext";
import { usePlaybackSpeed } from "@/hooks/usePlaybackSpeed";
import { MarqueeTitle } from "@/components/MarqueeTitle";
import TipArtistModal from "@/components/TipArtistModal";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerArtwork } from "./PlayerArtwork";
import { PlayerProgress } from "./PlayerProgress";
import { PlayerControls } from "./PlayerControls";
import { AudioOutputCard } from "./AudioOutputCard";
import { CanvasAudioAnalyzer } from "./CanvasAudioAnalyzer";
import { LyricsSheet } from "./LyricsSheet";
import { QueueSheet } from "./QueueSheet";
import { AudioInfoCard } from "./AudioInfoCard";
import { NFTCard } from "./NFTCard";
import { ArtistPreviewCard } from "./ArtistPreviewCard";
import { AlbumCard } from "./AlbumCard";
import { CommentsSheet } from "./CommentsSheet";
import { EqualizerSettings } from "./EqualizerSettings";
import { SmartRadioPanel } from "./SmartRadioPanel";
import { shareContent, getPlaceholderImage } from "@/lib/utils";
import { useCoverColor } from "@/lib/color-utils";
import { toast } from "sonner";

type PlayerTab =
  | "none"
  | "visualizer"
  | "lyrics"
  | "queue"
  | "comments"
  | "audio_info"
  | "nft"
  | "artist"
  | "album"
  | "equalizer"
  | "radio";

const REPOSTED_TRACKS_STORAGE_KEY = "tonjam_reposted_tracks";
const COMMENTS_STORAGE_PREFIX = "tonjam_track_comments_v2_";

function formatCompactCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "0";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(Math.round(count));
}

function getStoredCommentCount(trackId: string | undefined): number {
  if (!trackId || typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_PREFIX}${trackId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function getStoredRepostedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPOSTED_TRACKS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const PlayerScreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    analyser,
    audioElement,
    progress,
    seek,
    setFullPlayerOpen,
    isFullPlayerOpen,
    queue = [],
    setQueue,
    playTrack,
    likedTrackIds = [],
    toggleLikeTrack,
    setOptionsTrack,
    recentlyPlayed = [],
    downloadTrackForOffline,
    isTrackCached,
    deleteCachedTrack,
    isSeeking,
    setIsSeeking,
    setTrackToAddToPlaylist,
    isSmartRadio,
    isHighFidelity,
    createPost,
  } = useAudio();

  const { speed, changeSpeed, availableSpeeds } = usePlaybackSpeed();
  const [activeTab, setActiveTab] = useState<PlayerTab>("none");
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [repostedTrackIds, setRepostedTrackIds] = useState<string[]>(getStoredRepostedIds);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showTipModal, setShowTipModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setIsCached(false);
    const checkCache = async () => {
      if (currentTrack?.id && isTrackCached) {
        try {
          const cached = await isTrackCached(currentTrack.id);
          if (active) setIsCached(cached);
        } catch {
          if (active) setIsCached(false);
        }
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [currentTrack?.id, isTrackCached]);

  useEffect(() => {
    if (!currentTrack?.id) {
      setCommentCount(0);
      return;
    }
    setCommentCount(getStoredCommentCount(currentTrack.id));

    const handleCommentsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ trackId: string; count: number }>).detail;
      if (detail?.trackId === currentTrack.id) {
        setCommentCount(detail.count);
      }
    };
    window.addEventListener("tonjam:track-comments-updated", handleCommentsUpdated);
    return () => {
      window.removeEventListener("tonjam:track-comments-updated", handleCommentsUpdated);
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!isFullPlayerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showTipModal) {
        setFullPlayerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullPlayerOpen, showTipModal, setFullPlayerOpen]);

  const coverUrl = currentTrack?.coverUrl || getPlaceholderImage("cover");
  const coverColor = useCoverColor(coverUrl);

  const trackDuration = useMemo(() => {
    if (audioElement && Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
      return audioElement.duration;
    }
    return currentTrack?.duration || 0;
  }, [audioElement, currentTrack?.duration, progress]);

  const currentTime = (progress / 100) * trackDuration;
  const isLiked = Boolean(currentTrack && likedTrackIds.includes(currentTrack.id));
  const isReposted = Boolean(currentTrack && repostedTrackIds.includes(currentTrack.id));
  const streamsCount = currentTrack?.playCount ?? currentTrack?.streams ?? 0;
  const likesCount = currentTrack?.likes ?? 0;
  const isHiFiActive = Boolean(currentTrack?.isHighFidelity || isHighFidelity);

  const bufferedPercentage = useMemo(() => {
    if (!audioElement || !audioElement.buffered || audioElement.buffered.length === 0) {
      return 0;
    }
    if (!trackDuration || trackDuration <= 0) return 0;
    try {
      const end = audioElement.buffered.end(audioElement.buffered.length - 1);
      return Math.max(0, Math.min(100, (end / trackDuration) * 100));
    } catch {
      return 0;
    }
  }, [audioElement, progress, trackDuration]);

  const handleClose = useCallback(() => {
    setFullPlayerOpen(false);
  }, [setFullPlayerOpen]);

  const handleTabToggle = useCallback((tab: PlayerTab) => {
    setActiveTab((prev) => (prev === tab ? "none" : tab));
  }, []);

  useEffect(() => {
    if (activeTab === "none") return;
    const rafId = requestAnimationFrame(() => {
      activePanelRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeTab]);

  const handleLikeToggle = useCallback(() => {
    if (currentTrack?.id) {
      toggleLikeTrack(currentTrack.id);
    }
  }, [currentTrack?.id, toggleLikeTrack]);

  const handleOpenOptions = useCallback(() => {
    if (currentTrack) {
      setOptionsTrack(currentTrack);
    }
  }, [currentTrack, setOptionsTrack]);

  const handleSeekPct = useCallback((pct: number) => {
    seek(pct);
  }, [seek]);

  const handleSeekSeconds = useCallback((seconds: number) => {
    if (trackDuration > 0) {
      seek((seconds / trackDuration) * 100);
    }
  }, [seek, trackDuration]);

  const handleDownloadToggle = useCallback(async () => {
    if (!currentTrack || isDownloading) return;
    if (isCached) {
      if (deleteCachedTrack) await deleteCachedTrack(currentTrack.id);
      setIsCached(false);
    } else {
      setIsDownloading(true);
      try {
        if (downloadTrackForOffline) {
          await downloadTrackForOffline(currentTrack);
          setIsCached(true);
        }
      } finally {
        setIsDownloading(false);
      }
    }
  }, [currentTrack, isCached, isDownloading, deleteCachedTrack, downloadTrackForOffline]);

  const handleShare = useCallback(() => {
    if (!currentTrack) return;
    const shareUrl = `${window.location.origin}/#/track/${currentTrack.id}`;
    shareContent({
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Listen to "${currentTrack.title}" on TonJam!`,
      url: shareUrl,
    });
  }, [currentTrack]);

  const handleRepostToggle = useCallback(async () => {
    if (!currentTrack) return;
    const alreadyReposted = repostedTrackIds.includes(currentTrack.id);
    const nextIds = alreadyReposted
      ? repostedTrackIds.filter((id) => id !== currentTrack.id)
      : [...repostedTrackIds, currentTrack.id];

    setRepostedTrackIds(nextIds);
    try {
      localStorage.setItem(REPOSTED_TRACKS_STORAGE_KEY, JSON.stringify(nextIds));
    } catch {}

    if (!alreadyReposted) {
      if (createPost) {
        try {
          await createPost({
            content: `JamUp! Listening to "${currentTrack.title}" by ${currentTrack.artist}`,
            trackId: currentTrack.id,
            track: currentTrack,
            type: "track_repost",
          });
        } catch {}
      }
      toast.success("Shared to JamSpace feed");
    } else {
      toast.info("Removed repost");
    }
  }, [currentTrack, repostedTrackIds, createPost]);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    toast.info("Track removed from queue");
  }, [setQueue]);

  const handleMoveInQueue = useCallback((index: number, direction: "up" | "down") => {
    setQueue((prev) => {
      const copy = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  }, [setQueue]);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, [setQueue]);

  const handleAddToPlaylist = useCallback(() => {
    if (!currentTrack) return;
    if (setTrackToAddToPlaylist) {
      setTrackToAddToPlaylist(currentTrack);
    }
  }, [currentTrack, setTrackToAddToPlaylist]);

  const handleCycleSpeed = useCallback(() => {
    const idx = availableSpeeds.findIndex((s) => s === speed);
    const next = availableSpeeds[(idx + 1) % availableSpeeds.length] ?? 1.0;
    changeSpeed(next);
  }, [availableSpeeds, changeSpeed, speed]);

  return (
    <AnimatePresence>
      {isFullPlayerOpen && currentTrack && (
        <motion.div
          id="tonjam-full-player-screen"
          key="tonjam-full-player"
          role="dialog"
          aria-modal="true"
          aria-label={`Full player: ${currentTrack.title}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="fixed inset-0 z-50 h-dvh w-full bg-[#061426] text-[#FFFFFF] font-sans flex flex-col overflow-hidden"
          style={{ height: "100dvh" }}
        >
          {/* Dark TON-Blue Ambient Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
            <div
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                background: `radial-gradient(circle at 50% 22%, ${coverColor}28 0%, rgba(14, 40, 90, 0.55) 45%, #061426 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#091C38]/65 via-[#061426]/90 to-[#040D1B]" />
          </div>

          {/* Fixed Top Stage: Compact Header & Stationary Square Artwork */}
          <div
            data-testid="full-player-fixed-stage"
            className="shrink-0 relative z-10 w-full max-w-md mx-auto px-4 pt-[max(env(safe-area-inset-top,8px),8px)] pb-1 flex flex-col items-center gap-1"
          >
            <PlayerHeader
              onClose={handleClose}
              onMoreClick={handleOpenOptions}
              onQueueClick={() => handleTabToggle("queue")}
              queueCount={queue.length}
              track={currentTrack}
            />

            <PlayerArtwork
              track={currentTrack}
              isPlaying={isPlaying}
              isLiked={isLiked}
              onDoubleTapLike={handleLikeToggle}
              onLongPress={handleOpenOptions}
            />
          </div>

          {/* Smooth Scrollable Lower Region */}
          <div
            ref={scrollContainerRef}
            data-testid="full-player-scroll-region"
            className="flex-1 min-h-0 relative z-10 w-full overflow-y-auto overflow-x-hidden scroll-smooth overscroll-y-contain touch-pan-y no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
          >
            <div className="max-w-md mx-auto w-full px-4 pt-1.5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] flex flex-col gap-2.5">
              {/* Track Title, Artist Name & Like Control Row */}
              <div className="w-full flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 text-left">
                  <MarqueeTitle
                    text={currentTrack.title}
                    className="text-[18px] sm:text-[20px] font-semibold text-[#FFFFFF] tracking-tight"
                    containerClassName="w-full"
                  />
                  <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                    <MarqueeTitle
                      text={currentTrack.artist}
                      className="text-[13px] sm:text-[14px] font-medium text-[#9BB0CB]"
                      containerClassName="min-w-0 max-w-full"
                    />
                    {currentTrack.artistVerified && (
                      <span
                        title="Verified Artist"
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#229ED9]/20 border border-[#229ED9]/40 shrink-0"
                      >
                        <Check className="w-2.5 h-2.5 text-[#229ED9]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Prominent Like / Favourite Control */}
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  aria-label={isLiked ? "Remove from favourites" : "Add to favourites"}
                  aria-pressed={isLiked}
                  className={`shrink-0 min-h-[44px] min-w-[44px] px-3 rounded-full flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    isLiked
                      ? "bg-[#229ED9]/20 border-[#229ED9]/60 text-[#229ED9]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-[#FFFFFF]"
                  }`}
                >
                  <AnimatedHeart
                    liked={isLiked}
                    className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {likesCount > 0 && (
                    <span className="text-[11px] font-semibold tabular-nums whitespace-nowrap">
                      Like {formatCompactCount(likesCount)}
                    </span>
                  )}
                </button>
              </div>

              {/* Compact Real Track Metadata Badges */}
              {(streamsCount > 0 || currentTrack.isNFT || isHiFiActive) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {streamsCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-full text-[10px] font-semibold text-[#F4BD50] tabular-nums">
                      <Flame className="w-3 h-3 fill-current" />
                      {formatCompactCount(streamsCount)} {streamsCount === 1 ? "Stream" : "Streams"}
                    </span>
                  )}
                  {currentTrack.isNFT && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-full text-[10px] font-semibold text-[#35C98A]">
                      <Gem className="w-3 h-3" /> Music NFT
                    </span>
                  )}
                  {isHiFiActive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0B1C34] border border-[rgba(192,192,192,0.22)] rounded-full text-[10px] font-semibold text-[#FFFFFF]">
                      <Award className="w-3 h-3 text-[#229ED9]" /> Lossless Hi-Fi
                    </span>
                  )}
                </div>
              )}

              {/* Seekable Playback Progress Bar */}
              <PlayerProgress
                progress={progress}
                duration={trackDuration}
                bufferedPercentage={bufferedPercentage}
                onSeek={handleSeekPct}
                isSeeking={isSeeking}
                setIsSeeking={setIsSeeking}
              />

              {/* Primary Playback Controls Row */}
              <PlayerControls showAuxiliaryBar={false} />

              {/* Figma Primary Pill Actions: High Quality, Queue, Lyrics */}
              <div className="w-full grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleTabToggle("audio_info")}
                  aria-pressed={activeTab === "audio_info"}
                  className={`min-h-[40px] px-2.5 py-2 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "audio_info"
                      ? "bg-[#229ED9] border-[#229ED9] text-[#FFFFFF]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-[#FFFFFF]"
                  }`}
                >
                  <Award className={`w-3.5 h-3.5 shrink-0 ${activeTab === "audio_info" ? "text-white" : "text-[#229ED9]"}`} />
                  <span>High Quality</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("queue")}
                  aria-pressed={activeTab === "queue"}
                  className={`min-h-[40px] px-2.5 py-2 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "queue"
                      ? "bg-[#229ED9] border-[#229ED9] text-[#FFFFFF]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-[#FFFFFF]"
                  }`}
                >
                  <ListMusic className={`w-3.5 h-3.5 shrink-0 ${activeTab === "queue" ? "text-white" : "text-[#229ED9]"}`} />
                  <span>Queue</span>
                  {queue.length > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none tabular-nums ${
                        activeTab === "queue" ? "bg-white/20 text-white" : "bg-[#152E4D] text-[#FFFFFF]"
                      }`}
                    >
                      {queue.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("lyrics")}
                  aria-pressed={activeTab === "lyrics"}
                  className={`min-h-[40px] px-2.5 py-2 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "lyrics"
                      ? "bg-[#229ED9] border-[#229ED9] text-[#FFFFFF]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-[#FFFFFF]"
                  }`}
                >
                  <Mic2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === "lyrics" ? "text-white" : "text-[#229ED9]"}`} />
                  <span>Lyrics</span>
                </button>
              </div>

              {/* Audio Output / Device Selection Card */}
              <AudioOutputCard />

              {/* Compact Edge-to-Edge Secondary Social & Audio Utilities Strip */}
              <div className="self-stretch -mx-4 px-4 flex items-center gap-2 overflow-x-auto py-0.5 text-[#C2C7CD] no-scrollbar snap-x touch-pan-x after:content-[''] after:shrink-0 after:w-1">
                <button
                  type="button"
                  onClick={() => setShowTipModal(true)}
                  className="shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1C34]/90 border border-[rgba(192,192,192,0.22)] text-[#F4BD50] hover:text-white text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Tip Artist</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("equalizer")}
                  aria-pressed={activeTab === "equalizer"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "equalizer"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Equalizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("visualizer")}
                  aria-pressed={activeTab === "visualizer"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "visualizer"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Visualizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("radio")}
                  aria-pressed={activeTab === "radio"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "radio"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${isSmartRadio ? "text-[#35C98A]" : ""}`} />
                  <span>Smart Radio</span>
                </button>

                <button
                  type="button"
                  onClick={handleCycleSpeed}
                  aria-label={`Playback speed ${speed}x`}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    speed !== 1.0
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{speed}x</span>
                </button>

                <button
                  type="button"
                  onClick={handleRepostToggle}
                  aria-pressed={isReposted}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    isReposted
                      ? "bg-[#35C98A]/20 border-[#35C98A]/50 text-[#35C98A]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>{isReposted ? "Reposted" : "Repost"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("comments")}
                  aria-pressed={activeTab === "comments"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "comments"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{commentCount > 0 ? `Comments (${commentCount})` : "Comments"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToPlaylist}
                  className="shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1C34]/90 border border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>Playlist</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadToggle}
                  disabled={isDownloading}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                    isCached
                      ? "bg-[#35C98A]/20 border-[#35C98A]/50 text-[#35C98A]"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? "Saving..." : isCached ? "Saved" : "Download"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1C34]/90 border border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("nft")}
                  aria-pressed={activeTab === "nft"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "nft"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <Gem className="w-3.5 h-3.5 text-[#F4BD50]" />
                  <span>NFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabToggle("artist")}
                  aria-pressed={activeTab === "artist"}
                  className={`shrink-0 snap-start min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                    activeTab === "artist"
                      ? "bg-[#229ED9] border-[#229ED9] text-white"
                      : "bg-[#0B1C34]/90 border-[rgba(192,192,192,0.22)] text-[#C2C7CD] hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#35C98A]" />
                  <span>Artist</span>
                </button>
              </div>

              {/* Expanded Auxiliary Panel */}
              <AnimatePresence>
                {activeTab !== "none" && (
                  <motion.div
                    ref={activePanelRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="w-full my-1 rounded-[12px] overflow-hidden"
                  >
                    {activeTab === "visualizer" && (
                      <div className="w-full">
                        <CanvasAudioAnalyzer
                          analyser={analyser}
                          isPlaying={isPlaying}
                          track={currentTrack}
                          height={200}
                          showControls={true}
                          showMetrics={true}
                        />
                      </div>
                    )}

                    {activeTab === "equalizer" && (
                      <EqualizerSettings onClose={() => setActiveTab("none")} />
                    )}

                    {activeTab === "radio" && (
                      <SmartRadioPanel onClose={() => setActiveTab("none")} />
                    )}

                    {activeTab === "lyrics" && (
                      <LyricsSheet
                        track={currentTrack}
                        currentTime={currentTime}
                        duration={trackDuration}
                        onSeek={handleSeekSeconds}
                        onClose={() => setActiveTab("none")}
                      />
                    )}

                    {activeTab === "queue" && (
                      <QueueSheet
                        queue={queue}
                        currentTrack={currentTrack}
                        recentlyPlayed={recentlyPlayed}
                        onPlayTrack={playTrack}
                        onRemoveTrack={handleRemoveFromQueue}
                        onMoveTrack={handleMoveInQueue}
                        onReorderQueue={setQueue}
                        onClearQueue={handleClearQueue}
                        onClose={() => setActiveTab("none")}
                      />
                    )}

                    {activeTab === "comments" && (
                      <CommentsSheet
                        track={currentTrack}
                        onClose={() => setActiveTab("none")}
                      />
                    )}

                    {activeTab === "audio_info" && (
                      <AudioInfoCard track={currentTrack} />
                    )}

                    {activeTab === "nft" && (
                      <NFTCard
                        track={currentTrack}
                        onClosePlayer={handleClose}
                      />
                    )}

                    {activeTab === "artist" && (
                      <ArtistPreviewCard
                        track={currentTrack}
                        onClosePlayer={handleClose}
                      />
                    )}

                    {activeTab === "album" && (
                      <AlbumCard
                        track={currentTrack}
                        onClosePlayer={handleClose}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {showTipModal && (
            <TipArtistModal track={currentTrack} onClose={() => setShowTipModal(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerScreen;
