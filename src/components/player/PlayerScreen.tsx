import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Share2,
  Download,
  ListMusic,
  Mic2,
  Check,
  Gem,
  Award,
  Info,
  User,
  Repeat2,
  MessageSquare,
  Plus,
  Flame,
  Coins,
  Sliders,
  Radio,
  Activity,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { MarqueeTitle } from "@/components/MarqueeTitle";
import TipArtistModal from "@/components/TipArtistModal";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerArtwork } from "./PlayerArtwork";
import { PlayerProgress } from "./PlayerProgress";
import { PlayerControls } from "./PlayerControls";
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
    createPost,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<PlayerTab>("none");
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [repostedTrackIds, setRepostedTrackIds] = useState<string[]>(getStoredRepostedIds);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showTipModal, setShowTipModal] = useState(false);

  // Sync offline cache status when current track changes
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

  // Sync live comment count for current track
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

  // Escape key closes full player when no modal dialog is open
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

  const trackDuration = currentTrack?.duration || 0;
  const currentTime = (progress / 100) * trackDuration;
  const isLiked = Boolean(currentTrack && likedTrackIds.includes(currentTrack.id));
  const isReposted = Boolean(currentTrack && repostedTrackIds.includes(currentTrack.id));
  const streamsCount = currentTrack?.playCount ?? currentTrack?.streams ?? 0;
  const likesCount = currentTrack?.likes ?? 0;

  const bufferedPercentage = useMemo(() => {
    if (!audioElement || !audioElement.buffered || audioElement.buffered.length === 0) {
      return 0;
    }
    const dur =
      Number.isFinite(audioElement.duration) && audioElement.duration > 0
        ? audioElement.duration
        : trackDuration;
    if (!dur || dur <= 0) return 0;
    try {
      const end = audioElement.buffered.end(audioElement.buffered.length - 1);
      return Math.max(0, Math.min(100, (end / dur) * 100));
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
        } catch {
          // Keep local repost state cleanly if offline
        }
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

  return (
    <AnimatePresence>
      {isFullPlayerOpen && currentTrack && (
        <motion.div
          key="tonjam-full-player"
          role="dialog"
          aria-modal="true"
          aria-label={`Full player: ${currentTrack.title}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-[#07111F] text-[#FFFFFF] font-sans overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-[#22374D]"
        >
          {/* Ambient Background Derived from Cover Photo */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
            {coverUrl && (
              <img
                src={coverUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-25 transition-opacity duration-700"
              />
            )}
            <div
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                background: `radial-gradient(circle at 50% 25%, ${coverColor}44 0%, ${coverColor}11 55%, transparent 100%)`,
                opacity: 0.75,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07111F]/75 to-[#07111F]" />
          </div>

          {/* Scrollable Core Player Body */}
          <div className="relative z-10 min-h-full max-w-md mx-auto w-full px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,20px)+28px)] flex flex-col items-center justify-start gap-3 sm:gap-4">
            <div className="w-full bg-transparent">
              <PlayerHeader
                onClose={handleClose}
                onQueueClick={() => handleTabToggle("queue")}
                queueCount={queue.length}
                track={currentTrack}
              />
            </div>

            <PlayerArtwork
              track={currentTrack}
              isPlaying={isPlaying}
              isLiked={isLiked}
              onDoubleTapLike={handleLikeToggle}
              onLongPress={handleOpenOptions}
              onDragDismiss={handleClose}
            />

            {/* Track Metadata & Badges */}
            <div className="w-full text-center space-y-1">
              <div className="w-full px-4">
                <MarqueeTitle
                  text={currentTrack.title}
                  className="text-[17px] sm:text-[19px] font-bold text-[#FFFFFF] tracking-tight"
                  containerClassName="w-full max-w-xs mx-auto"
                />
              </div>

              <div className="w-full px-4">
                <MarqueeTitle
                  text={currentTrack.artist}
                  className="text-[13px] sm:text-[14px] font-medium text-[#C2C7CD]"
                  containerClassName="w-full max-w-xs mx-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                {streamsCount > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold text-[#F4BD50]">
                    <Flame className="w-3 h-3 fill-current" />
                    {formatCompactCount(streamsCount)} {streamsCount === 1 ? "Stream" : "Streams"}
                  </span>
                )}

                {currentTrack.artistVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold text-[var(--tj-color-brand-primary,#00B4D8)]">
                    <Check className="w-3 h-3 text-[var(--tj-color-brand-primary,#00B4D8)]" /> Verified
                  </span>
                )}
                {currentTrack.isNFT && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold text-[#35C98A]">
                    <Gem className="w-3 h-3" /> Music NFT
                  </span>
                )}
                {currentTrack.isHighFidelity && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold text-white">
                    <Award className="w-3 h-3 text-white" /> Lossless Hi-Fi
                  </span>
                )}
              </div>
            </div>

            {/* Seekable Progress Bar */}
            <div className="w-full mt-1 mb-0.5">
              <PlayerProgress
                progress={progress}
                duration={trackDuration}
                bufferedPercentage={bufferedPercentage}
                onSeek={handleSeekPct}
                isSeeking={isSeeking}
                setIsSeeking={setIsSeeking}
              />
            </div>

            {/* Primary Playback Controls */}
            <PlayerControls />

            {/* Social Engagement Action Bar */}
            <div className="w-full flex items-center gap-2 overflow-x-auto px-3 py-2 bg-[#0A1628] rounded-[var(--tj-radius-lg,12px)] scrollbar-none snap-x touch-pan-x">
              <button
                type="button"
                onClick={() => setShowTipModal(true)}
                className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] bg-gradient-to-r from-amber-500/15 via-[#00B4D8]/15 to-blue-600/25 text-[#F4BD50] hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer border-none"
                title="Tip Artist in TON"
              >
                <Coins className="w-4 h-4 text-[#F4BD50] fill-[#F4BD50]/30" />
                <span>Tip Artist</span>
              </button>

              <button
                type="button"
                onClick={handleLikeToggle}
                aria-pressed={isLiked}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all cursor-pointer border-none ${
                  isLiked
                    ? "bg-[#00B4D8]/20 text-[var(--tj-color-brand-primary,#00B4D8)]"
                    : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount > 0 ? `Like ${formatCompactCount(likesCount)}` : isLiked ? "Liked" : "Like"}</span>
              </button>

              <button
                type="button"
                onClick={handleRepostToggle}
                aria-pressed={isReposted}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all cursor-pointer border-none ${
                  isReposted
                    ? "bg-[#35C98A]/20 text-[#35C98A]"
                    : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
                }`}
                title="JamUp Repost"
              >
                <Repeat2 className="w-4 h-4" />
                <span>{isReposted ? "Reposted" : "Repost"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("comments")}
                aria-pressed={activeTab === "comments"}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all cursor-pointer border-none ${
                  activeTab === "comments"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
                }`}
                title="Track Comments"
              >
                <MessageSquare className={`w-4 h-4 ${activeTab === "comments" ? "text-white" : "text-[var(--tj-color-brand-primary,#00B4D8)]"}`} />
                <span>{commentCount > 0 ? `Comments (${commentCount})` : "Comments"}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToPlaylist}
                className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F] text-xs font-bold transition-all cursor-pointer border-none"
                title="Add to Playlist"
              >
                <Plus className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                <span>Add to Playlist</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadToggle}
                disabled={isDownloading}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all cursor-pointer border-none disabled:opacity-50 ${
                  isCached
                    ? "bg-[#35C98A]/20 text-[#35C98A]"
                    : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
                }`}
                title="Download Offline"
              >
                <Download className={`w-4 h-4 ${isCached ? "text-[#35C98A]" : "text-[#8C8C8C]"}`} />
                <span>{isDownloading ? "Saving..." : isCached ? "Downloaded" : "Download"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F] text-xs font-bold transition-all cursor-pointer border-none"
                title="Share Track"
              >
                <Share2 className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)]" />
                <span>Share</span>
              </button>
            </div>

            {/* Secondary Features Tab Row */}
            <div className="w-full flex items-center gap-2 overflow-x-auto py-2 px-1 text-[#8C8C8C] scrollbar-none snap-x touch-pan-x">
              <button
                type="button"
                onClick={() => handleTabToggle("visualizer")}
                aria-pressed={activeTab === "visualizer"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "visualizer"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Live Frequency Visualizer"
              >
                <Activity className={`w-4 h-4 ${activeTab === "visualizer" ? "text-white" : "text-[var(--tj-color-brand-primary,#00B4D8)]"}`} />
                <span>Live Visualizer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("equalizer")}
                aria-pressed={activeTab === "equalizer"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "equalizer"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Equalizer & FX Settings"
              >
                <Sliders className={`w-4 h-4 ${activeTab === "equalizer" ? "text-white" : "text-[var(--tj-color-brand-primary,#00B4D8)]"}`} />
                <span>Equalizer & FX</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("radio")}
                aria-pressed={activeTab === "radio"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "radio"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Smart Radio Engine"
              >
                <Radio className={`w-4 h-4 ${activeTab === "radio" ? "text-white" : "text-[#35C98A]"}`} />
                <span>Smart Radio</span>
                {isSmartRadio && (
                  <span className="w-2 h-2 rounded-full bg-[#35C98A]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("lyrics")}
                aria-pressed={activeTab === "lyrics"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "lyrics"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Lyrics"
              >
                <Mic2 className={`w-4 h-4 ${activeTab === "lyrics" ? "text-white" : "text-pink-400"}`} />
                <span>Lyrics</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("queue")}
                aria-pressed={activeTab === "queue"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "queue"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Queue"
              >
                <ListMusic className={`w-4 h-4 ${activeTab === "queue" ? "text-white" : "text-[var(--tj-color-brand-primary,#00B4D8)]"}`} />
                <span>Queue</span>
                {queue.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#07111F]/60 text-white text-[10px] font-bold rounded-full">
                    {queue.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("audio_info")}
                aria-pressed={activeTab === "audio_info"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "audio_info"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Audio Specs"
              >
                <Info className={`w-4 h-4 ${activeTab === "audio_info" ? "text-white" : "text-[var(--tj-color-brand-primary,#00B4D8)]"}`} />
                <span>Audio Specs</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("nft")}
                aria-pressed={activeTab === "nft"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "nft"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="NFT Collectible"
              >
                <Gem className={`w-4 h-4 ${activeTab === "nft" ? "text-white" : "text-[#F4BD50]"}`} />
                <span>NFT Collectible</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabToggle("artist")}
                aria-pressed={activeTab === "artist"}
                className={`shrink-0 px-3.5 py-2 rounded-[var(--tj-radius-sm,8px)] transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border-none ${
                  activeTab === "artist"
                    ? "bg-[var(--tj-color-brand-primary,#00B4D8)] text-white"
                    : "bg-[#0A1628] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
                }`}
                title="Artist Info"
              >
                <User className={`w-4 h-4 ${activeTab === "artist" ? "text-white" : "text-[#35C98A]"}`} />
                <span>Artist Info</span>
              </button>
            </div>

            {/* Expanded Auxiliary Panel */}
            <AnimatePresence>
              {activeTab !== "none" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full my-2 max-h-[480px] overflow-y-auto rounded-[var(--tj-radius-md,10px)] scrollbar-thin scrollbar-thumb-[#16244F]"
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

          {showTipModal && (
            <TipArtistModal track={currentTrack} onClose={() => setShowTipModal(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerScreen;
