import React, { useState, useMemo, useRef, useEffect } from "react";
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

const SwipeableQueueItem: React.FC<SwipeableQueueItemProps> = React.memo(({
  track,
  index,
  totalTracks,
  onPlayTrack,
  onRemoveTrack,
  onMoveTrack,
}) => {
  const [dragX, setDragX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 90) {
      setIsRemoving(true);
      removeTimerRef.current = setTimeout(() => {
        onRemoveTrack(index);
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
      <div className="absolute inset-0 bg-red-500/20 rounded-[var(--tj-radius-md,10px)] flex items-center justify-between px-4 text-red-400 text-xs font-bold pointer-events-none">
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
        className="relative z-10 flex items-center gap-3 p-2.5 rounded-[var(--tj-radius-md,10px)] bg-[#0A113A] transition-all group shadow-sm active:cursor-grabbing"
      >
        <div className="text-[#9AA0AE] group-hover:text-[#5B6BFF] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#16244F]">
          <GripVertical className="w-4 h-4" />
        </div>

        <img
          src={track.coverUrl || getPlaceholderImage("cover")}
          alt={track.title}
          referrerPolicy="no-referrer"
          className="w-10 h-10 object-cover rounded-[var(--tj-radius-sm,8px)] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
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

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveTrack(index, "up");
            }}
            disabled={index === 0}
            className="p-1 text-[#9AA0AE] hover:text-[#F2F4F8] disabled:opacity-20 rounded hover:bg-[#16244F] border-none bg-transparent cursor-pointer"
            title="Move Up"
            aria-label={`Move ${track.title} up`}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveTrack(index, "down");
            }}
            disabled={index === totalTracks - 1}
            className="p-1 text-[#9AA0AE] hover:text-[#F2F4F8] disabled:opacity-20 rounded hover:bg-[#16244F] border-none bg-transparent cursor-pointer"
            title="Move Down"
            aria-label={`Move ${track.title} down`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTrack(index);
            }}
            className="p-1 text-[#9AA0AE] hover:text-red-400 rounded hover:bg-red-950/30 transition-colors border-none bg-transparent cursor-pointer"
            title="Remove from queue"
            aria-label={`Remove ${track.title} from queue`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
});

SwipeableQueueItem.displayName = "SwipeableQueueItem";

export const QueueSheet: React.FC<QueueSheetProps> = React.memo(({
  queue,
  currentTrack,
  recentlyPlayed,
  onPlayTrack,
  onRemoveTrack,
  onMoveTrack,
  onReorderQueue,
  onClearQueue,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"queue" | "favorites" | "history">("queue");

  const {
    likedTrackIds = [],
    allTracks = [],
    addToQueue,
    toggleLikeTrack,
    playAll,
    setFullPlayerOpen,
    isSmartRadio,
    toggleSmartRadio,
  } = useAudio();

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
    const uniqueMap = new Map<string, Track>();
    (allTracks || []).forEach((t) => {
      if (t && t.id) uniqueMap.set(t.id, t);
    });
    return Array.from(uniqueMap.values()).filter((t) => likedTrackIds.includes(t.id));
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
    <div className="w-full h-full flex flex-col bg-[#050A24] text-[#F2F4F8] select-none rounded-[var(--tj-radius-md,10px)] p-4 border-none">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all shrink-0 border-none cursor-pointer ${
              activeTab === "queue"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Queue ({queue.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all shrink-0 border-none cursor-pointer ${
              activeTab === "favorites"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
            Favorites ({favoriteTracks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tj-radius-sm,8px)] text-xs font-bold transition-all shrink-0 border-none cursor-pointer ${
              activeTab === "history"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-[#0A113A] text-[#9AA0AE] hover:text-[#F2F4F8]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({recentlyPlayed.length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === "queue" && (
            <button
              type="button"
              onClick={toggleSmartRadio}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold transition-all border-none cursor-pointer ${
                isSmartRadio
                  ? "text-[#5B6BFF] bg-[#5B6BFF]/10"
                  : "text-[#9AA0AE] bg-[#0A113A]"
              }`}
              title="Smart Radio: Auto-queues similar tracks when selection finishes"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Smart Radio: {isSmartRadio ? "ON" : "OFF"}
            </button>
          )}

          {activeTab === "queue" && queue.length > 0 && (
            <button
              type="button"
              onClick={onClearQueue}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-[var(--tj-radius-sm,8px)] transition-colors border-none bg-transparent cursor-pointer"
              title="Clear Queue"
              aria-label="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {activeTab === "favorites" && favoriteTracks.length > 0 && (
            <button
              type="button"
              onClick={handlePlayAllFavorites}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--tj-radius-sm,8px)] text-[10px] font-bold bg-[#5B6BFF] text-white hover:bg-[#4C5CEE] transition-all border-none cursor-pointer"
              title="Play all favorite tracks"
            >
              <Play className="w-3 h-3 fill-current" />
              Play All
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Queue"
              className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[var(--tj-radius-sm,8px)] border-none bg-transparent cursor-pointer"
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
            {currentTrack && (
              <div className="mb-3">
                <span className="text-[10px] font-bold text-[#5B6BFF] uppercase tracking-wider block mb-1.5">
                  Now Playing
                </span>
                <div className="flex items-center gap-3 p-2.5 rounded-[var(--tj-radius-md,10px)] bg-[#0A113A] shadow-md">
                  <img
                    src={currentTrack.coverUrl || getPlaceholderImage("cover")}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 object-cover rounded-[var(--tj-radius-sm,8px)] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#F2F4F8] truncate">
                      {currentTrack.title}
                    </h4>
                    <p className="text-[11px] text-[#9AA0AE] truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#5B6BFF] px-2 py-0.5 bg-[#5B6BFF]/15 rounded-[var(--tj-radius-compact,5px)]">
                    Playing
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider">
                Next In Queue ({queue.length})
              </span>
              {queue.length > 0 && (
                <span className="text-[10px] text-[#9AA0AE]/70 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-[#5B6BFF]" /> Swipe to remove • Drag to reorder
                </span>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-8 text-[#9AA0AE] text-xs bg-[#0A113A]/30 rounded-[var(--tj-radius-md,10px)]">
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
                className="text-center py-10 px-5 bg-[#0A113A]/50 rounded-[var(--tj-radius-md,10px)] flex flex-col items-center justify-center space-y-3.5 my-2 shadow-inner"
              >
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-[#0098EA]/20 flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-rose-400 fill-rose-500/20" />
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
                  type="button"
                  onClick={handleReturnToTrending}
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--tj-radius-sm,8px)] bg-gradient-to-r from-[#0098EA] to-[#0077C2] hover:from-[#00A3FF] hover:to-[#0088CC] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0098EA]/25 transition-all cursor-pointer active:scale-95 border-none"
                >
                  <Flame className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                  <span>Return to Trending Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {favoriteTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2.5 rounded-[var(--tj-radius-md,10px)] bg-[#0A113A] transition-all group"
                  >
                    <img
                      src={track.coverUrl || getPlaceholderImage("cover")}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-[var(--tj-radius-sm,8px)] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onPlayTrack(track)}
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onPlayTrack(track)}
                    >
                      <h5 className="text-xs font-bold text-[#F2F4F8] truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-[#9AA0AE] truncate">
                        {track.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPlayTrack(track)}
                        className="p-1.5 text-[var(--tj-color-brand-primary,#00B4D8)] rounded-[var(--tj-radius-sm,8px)] bg-[#0098EA]/10 hover:bg-[#0098EA]/20 transition-all border-none cursor-pointer"
                        title="Play track"
                        aria-label={`Play ${track.title}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToQueue(track);
                          toast.success(`Added "${track.title}" to queue`);
                        }}
                        className="p-1.5 text-[#9AA0AE] hover:text-[#F2F4F8] rounded-[var(--tj-radius-sm,8px)] hover:bg-[#16244F] transition-all flex items-center gap-1 text-[11px] font-medium border-none bg-transparent cursor-pointer"
                        title="Add to Queue"
                        aria-label={`Add ${track.title} to queue`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleLikeTrack(track.id);
                          toast.info(`Removed "${track.title}" from favorites`);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-[var(--tj-radius-sm,8px)] hover:bg-rose-950/20 transition-all border-none bg-transparent cursor-pointer"
                        title="Remove from favorites"
                        aria-label={`Remove ${track.title} from favorites`}
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
          <div>
            <span className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-wider block mb-2">
              Recently Played Tracks
            </span>
            {recentlyPlayed.length === 0 ? (
              <div className="text-center py-8 text-[#9AA0AE] text-xs bg-[#0A113A]/30 rounded-[var(--tj-radius-md,10px)]">
                No listening history recorded yet.
              </div>
            ) : (
              recentlyPlayed.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3 p-2.5 rounded-[var(--tj-radius-md,10px)] bg-[#0A113A] transition-all cursor-pointer mb-2 group"
                >
                  <img
                    src={track.coverUrl || getPlaceholderImage("cover")}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover rounded-[var(--tj-radius-sm,8px)]"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#F2F4F8] truncate group-hover:text-[var(--tj-color-brand-primary,#00B4D8)] transition-colors">
                      {track.title}
                    </h5>
                    <p className="text-[11px] text-[#9AA0AE] truncate">
                      {track.artist}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-[var(--tj-color-brand-primary,#00B4D8)] fill-current" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
});

QueueSheet.displayName = "QueueSheet";

export default QueueSheet;
