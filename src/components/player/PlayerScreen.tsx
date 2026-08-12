import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import {
  Heart,
  Share2,
  Download,
  ListMusic,
  Mic2,
  Check,
  Gem,
  Award,
  Sparkles,
  Info,
  User,
  Disc,
  Volume2,
  Repeat2,
  MessageSquare,
  Plus,
  Play,
  TrendingUp,
  Flame,
  Coins,
  Sliders,
  Radio,
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { MarqueeTitle } from "@/components/MarqueeTitle";
import TipArtistModal from "@/components/TipArtistModal";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerArtwork } from "./PlayerArtwork";
import { PlayerProgress } from "./PlayerProgress";
import { PlayerControls } from "./PlayerControls";
import { LyricsSheet } from "./LyricsSheet";
import { QueueSheet } from "./QueueSheet";
import { AudioInfoCard } from "./AudioInfoCard";
import { NFTCard } from "./NFTCard";
import { ArtistPreviewCard } from "./ArtistPreviewCard";
import { AlbumCard } from "./AlbumCard";
import { CommentsSheet } from "./CommentsSheet";
import { EqualizerSettings } from "./EqualizerSettings";
import { SmartRadioPanel } from "./SmartRadioPanel";
import { shareContent } from "@/lib/utils";
import { toast } from "sonner";

export const PlayerScreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    seek,
    setFullPlayerOpen,
    isFullPlayerOpen,
    nextTrack,
    prevTrack,
    queue,
    setQueue,
    playTrack,
    likedTrackIds,
    toggleLikeTrack,
    setOptionsTrack,
    recentlyPlayed,
    downloadTrackForOffline,
    isTrackCached,
    deleteCachedTrack,
    isSeeking,
    setIsSeeking,
    setTrackToAddToPlaylist,
    isSmartRadio,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<
    "none" | "lyrics" | "queue" | "comments" | "audio_info" | "nft" | "artist" | "album" | "equalizer" | "radio"
  >("none");

  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(1420);
  const [likeCount, setLikeCount] = useState(18400);
  const [showTipModal, setShowTipModal] = useState(false);

  // Check if current track is cached for offline playback
  useEffect(() => {
    let active = true;
    const checkCache = async () => {
      if (currentTrack?.id && isTrackCached) {
        const cached = await isTrackCached(currentTrack.id);
        if (active) setIsCached(cached);
      }
    };
    checkCache();
    return () => {
      active = false;
    };
  }, [currentTrack?.id, isTrackCached]);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const trackDuration = currentTrack.duration || 0;
  const currentTime = (progress / 100) * trackDuration;
  const isLiked = likedTrackIds.includes(currentTrack.id);

  // Handle Swipe Gestures across main player
  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    // Drag down to close
    if (offset.y > 100 || velocity.y > 500) {
      setFullPlayerOpen(false);
    } else if (offset.x < -80 || velocity.x < -400) {
      // Swipe left -> Next Track
      nextTrack();
    } else if (offset.x > 80 || velocity.x > 400) {
      // Swipe right -> Previous Track
      prevTrack();
    }
  };

  const handleDownloadToggle = async () => {
    if (!currentTrack) return;
    if (isCached) {
      if (deleteCachedTrack) await deleteCachedTrack(currentTrack.id);
      setIsCached(false);
      toast.info("Removed from offline downloads");
    } else {
      setIsDownloading(true);
      if (downloadTrackForOffline) {
        await downloadTrackForOffline(currentTrack);
      }
      setIsDownloading(false);
      setIsCached(true);
      toast.success("Downloaded for offline listening");
    }
  };

  const handleShare = () => {
    shareContent({
      title: `${currentTrack.title} by ${currentTrack.artist}`,
      text: `Listen to "${currentTrack.title}" on TonJam Web3 Music!`,
      url: window.location.href
    });
  };

  const handleRepostToggle = () => {
    setIsReposted(!isReposted);
    setRepostCount((prev) => (isReposted ? prev - 1 : prev + 1));
    toast.success(
      isReposted
        ? "Track unposted from your feed"
        : "JamUp Repost! Track shared to your followers"
    );
  };

  const handleRemoveFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    toast.info("Track removed from queue");
  };

  const handleMoveInQueue = (index: number, direction: "up" | "down") => {
    setQueue((prev) => {
      const copy = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed inset-0 z-50 bg-[#050A24] text-[#F2F4F8] font-sans overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-[#16244F]"
      >
        {/* Scrollable Core Player Body including Header */}
        <div className="min-h-full max-w-md mx-auto w-full px-4 pt-3 pb-28 flex flex-col items-center justify-start gap-4 sm:gap-5">
          <PlayerHeader
            onClose={() => setFullPlayerOpen(false)}
            onMoreClick={() => setOptionsTrack(currentTrack)}
            track={currentTrack}
          />
          {/* Artwork with gestures */}
          <PlayerArtwork
            track={currentTrack}
            isPlaying={isPlaying}
            isLiked={isLiked}
            onDoubleTapLike={() => toggleLikeTrack(currentTrack.id)}
            onLongPress={() => setOptionsTrack(currentTrack)}
            onDragDismiss={() => setFullPlayerOpen(false)}
          />

          {/* Track Metadata Header & Badges */}
          <div className="w-full text-center space-y-1">
            <div className="w-full px-4">
              <MarqueeTitle 
                text={currentTrack.title}
                className="text-[18px] font-bold text-[#F2F4F8] tracking-tight"
                containerClassName="w-full max-w-xs mx-auto"
              />
            </div>

            <div className="w-full px-4">
              <MarqueeTitle 
                text={currentTrack.artist}
                className="text-[14px] font-medium text-[#9AA0AE]"
                containerClassName="w-full max-w-xs mx-auto"
              />
            </div>

            {/* Badges & Streams Counter Row */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0A113A] rounded-[6px] text-[10px] font-bold text-amber-400">
                <Flame className="w-3 h-3 fill-current" /> 1.4M Streams
              </span>

              {currentTrack.artistVerified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0A113A] rounded-[6px] text-[10px] font-bold text-[#0098EA]">
                  <Check className="w-3 h-3 text-[#0098EA]" /> Verified
                </span>
              )}
              {currentTrack.isNFT && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0A113A] rounded-[6px] text-[10px] font-bold text-emerald-400">
                  <Gem className="w-3 h-3" /> Music NFT
                </span>
              )}
              {currentTrack.isHighFidelity && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0A113A] rounded-[6px] text-[10px] font-bold text-white border border-white/10">
                  <Award className="w-3 h-3 text-white" /> Lossless Hi-Fi
                </span>
              )}
            </div>
          </div>

          {/* AUDIOMACK-STYLE SOCIAL ENGAGEMENT ACTION BAR - HORIZONTAL SCROLL */}
          <div className="w-full flex items-center gap-2 overflow-x-auto px-3 py-2 bg-[#0A113A] rounded-[16px] scrollbar-none snap-x touch-pan-x">
            {/* Tip Artist TON Button */}
            <button
              onClick={() => setShowTipModal(true)}
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-blue-600/30 hover:from-amber-500/30 hover:to-cyan-500/40 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-95"
              title="Tip Artist in TON"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span>Tip Artist</span>
            </button>

            {/* Favorite / Like Button */}
            <button
              onClick={() => {
                toggleLikeTrack(currentTrack.id);
                setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
              }}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isLiked
                  ? "bg-[#0098EA]/20 border-[#0098EA]/40 text-[#0098EA]"
                  : "bg-[#16244F]/40 border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-[#0098EA]" : ""}`} />
              <span>Like {(likeCount / 1000).toFixed(1)}k</span>
            </button>

            {/* JamUp / Repost Button */}
            <button
              onClick={handleRepostToggle}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isReposted
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-[#16244F]/40 border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="JamUp Repost"
            >
              <Repeat2 className="w-4 h-4" />
              <span>Repost {(repostCount / 1000).toFixed(1)}k</span>
            </button>

            {/* Comments Button */}
            <button
              onClick={() => setActiveTab(activeTab === "comments" ? "none" : "comments")}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "comments"
                  ? "bg-[#0098EA] border-[#0098EA] text-white"
                  : "bg-[#16244F]/40 border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Track Comments"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Comments (412)</span>
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => {
                if (setTrackToAddToPlaylist) {
                  setTrackToAddToPlaylist(currentTrack);
                } else {
                  toast.success("Added to playlist queue");
                }
              }}
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16244F]/40 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F] text-xs font-bold transition-all"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add to Playlist</span>
            </button>

            {/* Download Offline */}
            <button
              onClick={handleDownloadToggle}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isCached
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-[#16244F]/40 border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Download Offline"
            >
              <Download className={`w-4 h-4 ${isCached ? "text-emerald-400" : "text-green-400"}`} />
              <span>{isCached ? "Downloaded" : "Download"}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16244F]/40 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F] text-xs font-bold transition-all"
              title="Share Track"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share</span>
            </button>
          </div>

          {/* Waveform Progress Bar */}
          <PlayerProgress
            progress={progress}
            duration={trackDuration}
            onSeek={(pct) => seek(pct)}
            isSeeking={isSeeking}
            setIsSeeking={setIsSeeking}
          />

          {/* Primary Controls (Play, Shuffle, Prev, Next, Repeat, Speed, Sleep) */}
          <PlayerControls />

          {/* Secondary Features Tab Row (EQ, Lyrics, Queue, Audio Info, NFT, Artist) - Horizontal Scroll */}
          <div className="w-full flex items-center gap-2 overflow-x-auto py-2.5 px-1 text-[#9AA0AE] scrollbar-none snap-x touch-pan-x">
            {/* Equalizer FX */}
            <button
              onClick={() => setActiveTab(activeTab === "equalizer" ? "none" : "equalizer")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "equalizer"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Equalizer & FX Settings"
            >
              <Sliders className="w-4 h-4 text-[#0098EA]" />
              <span>Equalizer & FX</span>
            </button>

            {/* Smart Radio */}
            <button
              onClick={() => setActiveTab(activeTab === "radio" ? "none" : "radio")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "radio"
                  ? "bg-[#5B6BFF] text-white shadow-[0_0_12px_rgba(91,107,255,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Smart Radio Engine"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Smart Radio</span>
              {isSmartRadio && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              )}
            </button>

            {/* Lyrics Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "lyrics" ? "none" : "lyrics")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "lyrics"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4 text-pink-400" />
              <span>Lyrics</span>
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "queue" ? "none" : "queue")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "queue"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4 text-purple-400" />
              <span>Queue</span>
              {queue.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#0098EA] text-white text-[10px] font-bold rounded-full">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Audio Specs */}
            <button
              onClick={() => setActiveTab(activeTab === "audio_info" ? "none" : "audio_info")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "audio_info"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Audio Specs"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Audio Specs</span>
            </button>

            {/* NFT Collectible */}
            <button
              onClick={() => setActiveTab(activeTab === "nft" ? "none" : "nft")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "nft"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="NFT Collectible"
            >
              <Gem className="w-4 h-4 text-amber-400" />
              <span>NFT Collectible</span>
            </button>

            {/* Artist Card */}
            <button
              onClick={() => setActiveTab(activeTab === "artist" ? "none" : "artist")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start ${
                activeTab === "artist"
                  ? "bg-[#0098EA] text-white shadow-[0_0_12px_rgba(0,152,234,0.4)] scale-105"
                  : "bg-[#0A113A]/80 border border-[#16244F]/60 text-[#9AA0AE] hover:text-[#F2F4F8] hover:bg-[#16244F]"
              }`}
              title="Artist Info"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Artist Info</span>
            </button>
          </div>

          {/* Expanded Bottom Sheet / Auxiliary Panel */}
          <AnimatePresence>
            {activeTab !== "none" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full my-2 max-h-[480px] overflow-y-auto rounded-2xl scrollbar-thin scrollbar-thumb-[#16244F]"
              >
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
                    onSeek={(s) => seek((s / trackDuration) * 100)}
                    onClose={() => setActiveTab("none")}
                  />
                )}

                {activeTab === "queue" && (
                  <QueueSheet
                    queue={queue}
                    currentTrack={currentTrack}
                    recentlyPlayed={recentlyPlayed}
                    onPlayTrack={(t) => playTrack(t)}
                    onRemoveTrack={handleRemoveFromQueue}
                    onMoveTrack={handleMoveInQueue}
                    onReorderQueue={setQueue}
                    onClearQueue={() => setQueue([])}
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
                    onClosePlayer={() => setFullPlayerOpen(false)}
                  />
                )}

                {activeTab === "artist" && (
                  <ArtistPreviewCard
                    track={currentTrack}
                    onClosePlayer={() => setFullPlayerOpen(false)}
                  />
                )}

                {activeTab === "album" && (
                  <AlbumCard
                    track={currentTrack}
                    onClosePlayer={() => setFullPlayerOpen(false)}
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
    </AnimatePresence>
  );
};

export default PlayerScreen;

