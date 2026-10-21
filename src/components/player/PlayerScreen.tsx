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

export const PlayerScreen: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    analyser,
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
    "none" | "visualizer" | "lyrics" | "queue" | "comments" | "audio_info" | "nft" | "artist" | "album" | "equalizer" | "radio"
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

  const coverUrl = currentTrack?.coverUrl || getPlaceholderImage("cover");
  const coverColor = useCoverColor(coverUrl);

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
        className="fixed inset-0 z-50 bg-[#07111F] text-[#FFFFFF] font-sans overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-[#22374D]"
      >
        {/* Cover Photo Dominant Color Gradient Ambient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
          {coverUrl && (
            <img
              src={coverUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-25 transition-opacity duration-700"
            />
          )}
          {/* Subtle extracted dominant color radial and soft gradients */}
          <div
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{
              background: `radial-gradient(circle at 50% 25%, ${coverColor}44 0%, ${coverColor}11 55%, transparent 100%)`,
              opacity: 0.75,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07111F]/75 to-[#07111F]" />
        </div>

        {/* Scrollable Core Player Body including Header with Safe-Area respect */}
        <div className="relative z-10 min-h-full max-w-md mx-auto w-full px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,20px)+28px)] flex flex-col items-center justify-start gap-3 sm:gap-4">
          <div className="w-full bg-transparent">
            <PlayerHeader
              onClose={() => setFullPlayerOpen(false)}
              onQueueClick={() => setActiveTab(activeTab === "queue" ? "none" : "queue")}
              track={currentTrack}
            />
          </div>
          {/* Artwork with gestures - prominent and bolder */}
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

            {/* Badges & Streams Counter Row */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[8px] text-[10px] font-bold text-[#F4BD50]">
                <Flame className="w-3 h-3 fill-current" /> 1.4M Streams
              </span>

              {currentTrack.artistVerified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[8px] text-[10px] font-bold text-[#00B4D8]">
                  <Check className="w-3 h-3 text-[#00B4D8]" /> Verified
                </span>
              )}
              {currentTrack.isNFT && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[8px] text-[10px] font-bold text-[#35C98A]">
                  <Gem className="w-3 h-3" /> Music NFT
                </span>
              )}
              {currentTrack.isHighFidelity && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0A1628] rounded-[8px] text-[10px] font-bold text-white">
                  <Award className="w-3 h-3 text-white" /> Lossless Hi-Fi
                </span>
              )}
            </div>
          </div>

          {/* Waveform Progress Bar - Positioned below album art & metadata, above primary playback controls */}
          <div className="w-full mt-1 mb-0.5">
            <PlayerProgress
              progress={progress}
              duration={trackDuration}
              onSeek={(pct) => seek(pct)}
              isSeeking={isSeeking}
              setIsSeeking={setIsSeeking}
            />
          </div>

          {/* Primary Controls (Play, Shuffle, Prev, Next, Repeat, Speed, Sleep) */}
          <PlayerControls />

          {/* Social Engagement Action Bar */}
          <div className="w-full flex items-center gap-2 overflow-x-auto px-3 py-2 bg-[#0A1628] rounded-[16px] scrollbar-none snap-x touch-pan-x">
            {/* Tip Artist TON Button */}
            <button
              onClick={() => setShowTipModal(true)}
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#00B4D8]/15 to-blue-600/25 text-[#F4BD50] hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Tip Artist in TON"
            >
              <Coins className="w-4 h-4 text-[#F4BD50] fill-[#F4BD50]/30" />
              <span>Tip Artist</span>
            </button>

            {/* Favorite / Like Button */}
            <button
              onClick={() => {
                toggleLikeTrack(currentTrack.id);
                setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
              }}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLiked
                  ? "bg-[#00B4D8]/20 text-[#00B4D8]"
                  : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-[#00B4D8]" : ""}`} />
              <span>Like {(likeCount / 1000).toFixed(1)}k</span>
            </button>

            {/* JamUp / Repost Button */}
            <button
              onClick={handleRepostToggle}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isReposted
                  ? "bg-[#35C98A]/20 text-[#35C98A]"
                  : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
              }`}
              title="JamUp Repost"
            >
              <Repeat2 className="w-4 h-4" />
              <span>Repost {(repostCount / 1000).toFixed(1)}k</span>
            </button>

            {/* Comments Button */}
            <button
              onClick={() => setActiveTab(activeTab === "comments" ? "none" : "comments")}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "comments"
                  ? "bg-[#00B4D8] text-white"
                  : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
              }`}
              title="Track Comments"
            >
              <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
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
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F] text-xs font-bold transition-all cursor-pointer"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4 text-[#00B4D8]" />
              <span>Add to Playlist</span>
            </button>

            {/* Download Offline */}
            <button
              onClick={handleDownloadToggle}
              className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCached
                  ? "bg-[#35C98A]/20 text-[#35C98A]"
                  : "bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F]"
              }`}
              title="Download Offline"
            >
              <Download className={`w-4 h-4 ${isCached ? "text-[#35C98A]" : "text-[#8C8C8C]"}`} />
              <span>{isCached ? "Downloaded" : "Download"}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1C32] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#16244F] text-xs font-bold transition-all cursor-pointer"
              title="Share Track"
            >
              <Share2 className="w-4 h-4 text-[#00B4D8]" />
              <span>Share</span>
            </button>
          </div>

          {/* Secondary Features Tab Row (Live Visualizer, EQ, Lyrics, Queue, Audio Info, NFT, Artist) - Horizontal Scroll */}
          {/* Secondary Features Tab Row (Live Visualizer, EQ, Radio, Lyrics, Queue, Audio Info, NFT, Artist) */}
          <div className="w-full flex items-center gap-2 overflow-x-auto py-2.5 px-1 text-[#8C8C8C] scrollbar-none snap-x touch-pan-x">
            {/* Live Visualizer Canvas */}
            <button
              onClick={() => setActiveTab(activeTab === "visualizer" ? "none" : "visualizer")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "visualizer"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.5)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Live Frequency Visualizer"
            >
              <Activity className="w-4 h-4 text-[#00B4D8] animate-pulse" />
              <span>Live Visualizer</span>
            </button>

            {/* Equalizer FX */}
            <button
              onClick={() => setActiveTab(activeTab === "equalizer" ? "none" : "equalizer")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "equalizer"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Equalizer & FX Settings"
            >
              <Sliders className="w-4 h-4 text-[#00B4D8]" />
              <span>Equalizer & FX</span>
            </button>

            {/* Smart Radio */}
            <button
              onClick={() => setActiveTab(activeTab === "radio" ? "none" : "radio")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "radio"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Smart Radio Engine"
            >
              <Radio className="w-4 h-4 text-[#35C98A]" />
              <span>Smart Radio</span>
              {isSmartRadio && (
                <span className="w-2 h-2 rounded-full bg-[#35C98A] shadow-[0_0_8px_rgba(53,201,138,0.8)] animate-pulse" />
              )}
            </button>

            {/* Lyrics Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "lyrics" ? "none" : "lyrics")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "lyrics"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4 text-pink-400" />
              <span>Lyrics</span>
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "queue" ? "none" : "queue")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "queue"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4 text-[#00B4D8]" />
              <span>Queue</span>
              {queue.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#00B4D8] text-white text-[10px] font-bold rounded-full">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Audio Specs */}
            <button
              onClick={() => setActiveTab(activeTab === "audio_info" ? "none" : "audio_info")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "audio_info"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Audio Specs"
            >
              <Info className="w-4 h-4 text-[#00B4D8]" />
              <span>Audio Specs</span>
            </button>

            {/* NFT Collectible */}
            <button
              onClick={() => setActiveTab(activeTab === "nft" ? "none" : "nft")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "nft"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="NFT Collectible"
            >
              <Gem className="w-4 h-4 text-[#F4BD50]" />
              <span>NFT Collectible</span>
            </button>

            {/* Artist Card */}
            <button
              onClick={() => setActiveTab(activeTab === "artist" ? "none" : "artist")}
              className={`shrink-0 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold snap-start cursor-pointer border ${
                activeTab === "artist"
                  ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,0.4)] scale-105"
                  : "bg-[#0A1628] border-[#22374D] text-[#8C8C8C] hover:text-[#FFFFFF] hover:bg-[#0F1C32]"
              }`}
              title="Artist Info"
            >
              <User className="w-4 h-4 text-[#35C98A]" />
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

