import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ListMusic,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Sparkles,
  X,
  History,
  GripVertical,
  ArrowRightLeft,
  Heart,
  Plus,
  Flame,
  ArrowRight
} from "lucide-react";
import { Track } from "@/types";
import { getPlaceholderImage } from "@/lib/utils";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import { MOCK_TRACKS } from "@/constants";

interface QueueSheetProps {
  queue: Track[];
  currentTrack: Track | null;
  recentlyPlayed: Track[];
  onPlayTrack: (track: Track) => void;
  onRemoveTrack: (index: number) => void;
  onMoveTrack: (index: number, direction: "up" | "down") => void;
  onReorderQueue?: (newQueue: Track[]) => void;
  onClearQueue: () => void;
  onClose?: () => void;
}

interface SwipeableQueueItemProps {
  track: Track;
  index: number;
  totalTracks: number;
  onPlayTrack: (track: Track) => void;
  onRemoveTrack: (index: number) => void;
  onMoveTrack: (index: number, direction: "up" | "down") => void;
}

const SwipeableQueueItem: React.FC<SwipeableQueueItemProps> = ({
  track,
  index,
  totalTracks,
  onPlayTrack,
  onRemoveTrack,
  onMoveTrack
}) => {
  const [dragX, setDragX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 90) {
      setIsRemoving(true);
      setTimeout(() => {
        onRemoveTrack(index);
        toast.info(`Removed "${track.title}" from queue`);
      }, 180);
    } else {
      setDragX(0);
    }
  };

  if (isRemoving) {
    return null;
  }

  return (
    <Reorder.Item
      value={track}
      id={`${track.id}-${index}`}
      className="relative select-none touch-none mb-2"
      whileDrag={{ scale: 1.02, zIndex: 30 }}
    >
      {/* Background Trash Indicator for Swipe-to-Remove */}
      <div className="absolute inset-0 bg-red-500/20 border border-red-500/40 rounded-[12px] flex items-center justify-between px-4 text-red-400 text-xs font-bold pointer-events-none">
        <div className="flex items-center gap-1.5">
          <Trash2 className="w-4 h-4 animate-bounce" />
          <span>Swipe to remove</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Swipe to remove</span>
          <Trash2 className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* Foreground Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: 0 }}
        style={{ x: dragX }}
        className="relative z-10 flex items-center gap-3 p-2.5 rounded-[12px] bg-[#0A113A] border border-[#16244F] hover:border-[#5B6BFF]/40 transition-all group shadow-sm active:cursor-grabbing"
      >
        {/* Drag Handle Icon for Drag-and-Drop Reordering */}
        <div className="text-[#9AA0AE] group-hover:text-[#5B6BFF] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#16244F]">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Track Artwork */}
        <img
          src={track.coverUrl || getPlaceholderImage("cover")}
          alt={track.title}
          className="w-10 h-10 object-cover rounded-[8px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onPlayTrack(track)}
        />

        {/* Track Details */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onPlayTrack(track)}
        >
          <h5 className="text-xs font-bold text-[#F2F4F8] truncate group-hover:text-[#5B6BFF] transition-colors">
            {track.title}
          </h5>
          <p className="text-[11px] text-[#9AA0AE] truncate">
            {track.artist}
          </p>
        </div>

        {/* Manual Reorder & Remove Fallback Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveTrack(index, "up");
            }}
            disabled={index === 0}
            className="p-1 text-[#9AA0AE] hover:text-[#F2F4F8] disabled:opacity-20 rounded hover:bg-[#16244F]"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveTrack(index, "down");
            }}
            disabled={index === totalTracks - 1}
            className="p-1 text-[#9AA0AE] hover:text-[#F2F4F8] disabled:opacity-20 rounded hover:bg-[#16244F]"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTrack(index);
              toast.info("Removed track from queue");
            }}
            className="p-1 text-[#9AA0AE] hover:text-red-400 rounded hover:bg-red-950/30 transition-colors"
            title="Remove from queue"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export const QueueSheet: React.FC<QueueSheetProps> = ({
  queue,
  currentTrack,
  recentlyPlayed,
  onPlayTrack,
  onRemoveTrack,
  onMoveTrack,
  onReorderQueue,
  onClearQueue,
  onClose
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"queue" | "favorites" | "history">("queue");
  const [autoplay, setAutoplay] = useState<boolean>(true);

  const { likedTrackIds = [], allTracks = [], addToQueue, toggleLikeTrack, playAll, setFullPlayerOpen } = useAudio();

  const handleReturnToTrending = () => {
    if (setFullPlayerOpen) {
      setFullPlayerOpen(false);
    }
    if (onClose) {
      onClose();
    }
    navigate("/discover");
  };

  const favoriteTracks = useMemo(() => {
    const pool = [...(allTracks || []), ...MOCK_TRACKS];
    const uniqueMap = new Map<string, Track>();
    pool.forEach((t) => {
      if (t && t.id) uniqueMap.set(t.id, t);
    });
    const allAvailable = Array.from(uniqueMap.values());
    return allAvailable.filter((t) => likedTrackIds.includes(t.id));
  }, [allTracks, likedTrackIds]);

  const handleReorder = (newQueue: Track[]) => {
    if (onReorderQueue) {
      onReorderQueue(newQueue);
    }
  };

  const handlePlayAllFavorites = () => {
    if (favoriteTracks.length === 0) return;
    if (playAll) {
      playAll(favoriteTracks);
    } else {
      onPlayTrack(favoriteTracks[0]);
      favoriteTracks.slice(1).forEach((track) => addToQueue(track));
    }
    toast.success(`Playing ${favoriteTracks.length} favorite tracks`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050A24] text-[#F2F4F8] select-none rounded-[18px] p-4 border border-[#16244F]">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-[#16244F]/60 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all shrink-0 ${
              activeTab === "queue"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Queue ({queue.length})
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all shrink-0 ${
              activeTab === "favorites"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
            Favorites ({favoriteTracks.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all shrink-0 ${
              activeTab === "history"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] border border-[#16244F] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({recentlyPlayed.length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Autoplay Toggle */}
          {activeTab === "queue" && (
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[10px] font-bold border transition-all ${
                autoplay
                  ? "border-[#5B6BFF] text-[#5B6BFF] bg-[#5B6BFF]/10"
                  : "border-[#16244F] text-[#9AA0AE] bg-[#0A113A]"
              }`}
              title="Autoplay recommended tracks when queue ends"
            >
              <Sparkles className="w-3 h-3" />
              Autoplay: {autoplay ? "ON" : "OFF"}
            </button>
          )}

          {activeTab === "queue" && queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-[10px] transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {activeTab === "favorites" && favoriteTracks.length > 0 && (
            <button
              onClick={handlePlayAllFavorites}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-[#5B6BFF] text-white hover:bg-[#4C5CEE] transition-all"
              title="Play all favorite tracks"
            >
              <Play className="w-3 h-3 fill-current" />
              Play All
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[10px]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 scrollbar-thin scrollbar-thumb-[#16244F]">
        {activeTab === "queue" ? (
          <>
            {/* Current Playing Section */}
            {currentTrack && (
              <div className="mb-3">
                <span className="text-[10px] font-bold text-[#5B6BFF] uppercase tracking-wider block mb-1.5">
                  Now Playing
                </span>
                <div className="flex items-center gap-3 p-2.5 rounded-[12px] bg-[#0A113A] border border-[#5B6BFF]/50 shadow-md">
                  <img
                    src={currentTrack.coverUrl || getPlaceholderImage("cover")}
                    alt={currentTrack.title}
                    className="w-11 h-11 object-cover rounded-[10px] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#F2F4F8] truncate">
                      {currentTrack.title}
                    </h4>
                    <p className="text-[11px] text-[#9AA0AE] truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#5B6BFF] px-2 py-0.5 bg-[#5B6BFF]/15 rounded-[6px] border border-[#5B6BFF]/30">
                    Playing
                  </span>
                </div>
              </div>
            )}

            {/* Upcoming Queue Section Header with Gesture Hint */}
            <div className="flex items-center justify-between mt-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider">
                Next In Queue ({queue.length})
              </span>
              {queue.length > 0 && (
                <span className="text-[10px] text-[#9AA0AE]/70 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-[#5B6BFF]" /> Swipe track to remove • Drag handle to reorder
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-8 text-[#9AA0AE] text-xs bg-[#0A113A]/30 rounded-[12px] border border-[#16244F] border-dashed">
                Queue is empty. Add songs from search, albums, or playlists!
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={queue}
                onReorder={handleReorder}
                className="space-y-1"
              >
                <AnimatePresence initial={false}>
                  {queue.map((track, idx) => (
                    <SwipeableQueueItem
                      key={`${track.id}-${idx}`}
                      track={track}
                      index={idx}
                      totalTracks={queue.length}
                      onPlayTrack={onPlayTrack}
                      onRemoveTrack={onRemoveTrack}
                      onMoveTrack={onMoveTrack}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </>
        ) : activeTab === "favorites" ? (
          /* Favorites Tab */
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider block">
                Your Favorite Tracks ({favoriteTracks.length})
              </span>
            </div>

            {favoriteTracks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 px-5 bg-[#0A113A]/50 rounded-2xl border border-[#16244F] flex flex-col items-center justify-center space-y-3.5 my-2 shadow-inner"
              >
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-rose-400 fill-rose-500/20" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                  </span>
                </div>

                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-black text-[#F2F4F8] uppercase tracking-wider">
                    No Favorite Tracks Saved
                  </h4>
                  <p className="text-[11px] text-[#9AA0AE] leading-relaxed font-medium">
                    Tap the heart icon on any track or audio release across TonJam to save your favorite music here for quick access.
                  </p>
                </div>

                <button
                  onClick={handleReturnToTrending}
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B6BFF] to-[#3B4BEA] hover:from-[#4C5CEE] hover:to-[#2B3BCA] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#5B6BFF]/25 transition-all cursor-pointer active:scale-95"
                >
                  <Flame className="w-4 h-4 text-cyan-300 fill-cyan-300 animate-pulse" />
                  <span>Return to Trending Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {favoriteTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2.5 rounded-[12px] bg-[#0A113A] border border-[#16244F] hover:border-[#5B6BFF]/50 transition-all group"
                  >
                    <img
                      src={track.coverUrl || getPlaceholderImage("cover")}
                      alt={track.title}
                      className="w-10 h-10 object-cover rounded-[8px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onPlayTrack(track)}
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onPlayTrack(track)}
                    >
                      <h5 className="text-xs font-bold text-[#F2F4F8] truncate group-hover:text-[#5B6BFF] transition-colors">
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-[#9AA0AE] truncate">
                        {track.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Play Button */}
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="p-1.5 text-[#5B6BFF] hover:text-[#5B6BFF]/80 rounded-[8px] bg-[#5B6BFF]/10 hover:bg-[#5B6BFF]/20 transition-all"
                        title="Play track"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Add to Queue Button */}
                      <button
                        onClick={() => {
                          addToQueue(track);
                          toast.success(`Added "${track.title}" to queue`);
                        }}
                        className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[8px] hover:bg-[#16244F] transition-all flex items-center gap-1 text-[11px] font-medium"
                        title="Add to Queue"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Unlike Button */}
                      <button
                        onClick={() => {
                          toggleLikeTrack(track.id);
                          toast.info(`Removed "${track.title}" from favorites`);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-[8px] hover:bg-rose-950/20 transition-all"
                        title="Remove from favorites"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* History / Recently Played Tab */
          <div>
            <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider block mb-2">
              Recently Played Tracks
            </span>
            {recentlyPlayed.length === 0 ? (
              <div className="text-center py-8 text-[#9AA0AE] text-xs bg-[#0A113A]/30 rounded-[12px] border border-[#16244F] border-dashed">
                No listening history recorded yet.
              </div>
            ) : (
              recentlyPlayed.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3 p-2.5 rounded-[12px] bg-[#0A113A] border border-[#16244F] hover:border-[#5B6BFF] transition-all cursor-pointer mb-2 group"
                >
                  <img
                    src={track.coverUrl || getPlaceholderImage("cover")}
                    alt={track.title}
                    className="w-10 h-10 object-cover rounded-[8px]"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#F2F4F8] truncate group-hover:text-[#5B6BFF] transition-colors">
                      {track.title}
                    </h5>
                    <p className="text-[11px] text-[#9AA0AE] truncate">
                      {track.artist}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-[#5B6BFF] fill-current" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueSheet;

