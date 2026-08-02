import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Send,
  Heart,
  Clock,
  Play,
  X,
  Sparkles,
  Flame,
  Filter,
  User,
  Zap,
  MapPin,
  Smile,
  ChevronDown,
  Volume2
} from "lucide-react";
import { Track } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage } from "@/lib/utils";
import { toast } from "sonner";

export interface TimestampComment {
  id: string;
  trackId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timeInSeconds: number; // Position in track
  formattedTime: string; // e.g. "0:42"
  createdAt: string; // e.g. "2 mins ago"
  likes: number;
  isLiked?: boolean;
  badge?: string; // e.g. "NFT Holder", "Pro Producer"
}

interface TrackCommentsProps {
  track: Track | null;
  onClose?: () => void;
  className?: string;
  isSidebar?: boolean;
}

const STORAGE_KEY_PREFIX = "tonjam_track_comments_v2_";

// Format seconds into MM:SS
export function formatSecondsToTimestamp(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Default initial timestamped mock comments per track
function getInitialMockComments(track: Track | null): TimestampComment[] {
  if (!track) return [];
  const duration = track.duration || 180;

  return [
    {
      id: "tc-1",
      trackId: track.id,
      userId: "u1",
      userName: "AlexVibes",
      userAvatar: getPlaceholderImage("avatar"),
      content: "This drop right here hits so heavy! Pure energy ⚡🔥",
      timeInSeconds: Math.floor(duration * 0.15),
      formattedTime: formatSecondsToTimestamp(Math.floor(duration * 0.15)),
      createdAt: "5 mins ago",
      likes: 38,
      isLiked: true,
      badge: "VIP Collector"
    },
    {
      id: "tc-2",
      trackId: track.id,
      userId: "u2",
      userName: "CryptoBeats",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      content: "Sub-bass mix on this vocal breakdown is top notch. On-chain royalty deserved! 💎",
      timeInSeconds: Math.floor(duration * 0.38),
      formattedTime: formatSecondsToTimestamp(Math.floor(duration * 0.38)),
      createdAt: "18 mins ago",
      likes: 24,
      badge: "Hi-Fi Listener"
    },
    {
      id: "tc-3",
      trackId: track.id,
      userId: "u3",
      userName: "Sarah_TON",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      content: "Chills at this bridge section. Smooth transitions throughout. 🎧✨",
      timeInSeconds: Math.floor(duration * 0.65),
      formattedTime: formatSecondsToTimestamp(Math.floor(duration * 0.65)),
      createdAt: "1 hour ago",
      likes: 19
    },
    {
      id: "tc-4",
      trackId: track.id,
      userId: "u4",
      userName: "BeatMaster99",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      content: "Outro fade-out is clean! Added this to my daily listening loop. 🔥",
      timeInSeconds: Math.floor(duration * 0.88),
      formattedTime: formatSecondsToTimestamp(Math.floor(duration * 0.88)),
      createdAt: "3 hours ago",
      likes: 12
    }
  ];
}

export const TrackComments: React.FC<TrackCommentsProps> = ({
  track,
  onClose,
  className = "",
  isSidebar = true
}) => {
  const { progress, seek, userProfile, isPlaying, togglePlay } = useAudio();

  const trackDuration = track?.duration || 180;
  const currentPlaybackSeconds = Math.floor((progress / 100) * trackDuration);
  const formattedCurrentTime = formatSecondsToTimestamp(currentPlaybackSeconds);

  const [comments, setComments] = useState<TimestampComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [attachTimestamp, setAttachTimestamp] = useState<boolean>(true);
  const [customTimeSeconds, setCustomTimeSeconds] = useState<number>(currentPlaybackSeconds);
  const [sortMode, setSortMode] = useState<"chronological" | "newest" | "top">("chronological");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const listRef = useRef<HTMLDivElement>(null);

  // Load comments from LocalStorage or fall back to mock
  useEffect(() => {
    if (!track) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${track.id}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setComments(JSON.parse(raw));
      } else {
        const initial = getInitialMockComments(track);
        setComments(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch (e) {
      setComments(getInitialMockComments(track));
    }
  }, [track?.id]);

  // Keep custom time in sync when attachTimestamp is active and user hasn't modified it manually
  useEffect(() => {
    if (attachTimestamp) {
      setCustomTimeSeconds(currentPlaybackSeconds);
    }
  }, [currentPlaybackSeconds, attachTimestamp]);

  const saveComments = (newComments: TimestampComment[]) => {
    setComments(newComments);
    if (track) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${track.id}`, JSON.stringify(newComments));
      } catch (e) {
        console.error("Failed to save comments:", e);
      }
    }
  };

  // Jump audio directly to comment timestamp
  const handleJumpToTime = (timeInSecs: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!trackDuration || trackDuration <= 0) return;
    const pct = Math.min(100, Math.max(0, (timeInSecs / trackDuration) * 100));
    seek(pct);
    if (!isPlaying) {
      togglePlay();
    }
    toast.success(`Jumped to ${formatSecondsToTimestamp(timeInSecs)}`, {
      icon: "⏱️",
      duration: 1800
    });
  };

  // Submit comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !track) return;

    const timeSecs = attachTimestamp ? currentPlaybackSeconds : customTimeSeconds;

    const newComment: TimestampComment = {
      id: `tc-${Date.now()}`,
      trackId: track.id,
      userId: userProfile?.uid || "current-user",
      userName: userProfile?.name || "You (Listener)",
      userAvatar: userProfile?.avatar || getPlaceholderImage("avatar"),
      content: commentText.trim(),
      timeInSeconds: timeSecs,
      formattedTime: formatSecondsToTimestamp(timeSecs),
      createdAt: "Just now",
      likes: 0,
      badge: "Passionate Listener"
    };

    const updated = [newComment, ...comments];
    saveComments(updated);
    setCommentText("");
    toast.success(`Comment pinned at ${newComment.formattedTime}!`);
  };

  // Toggle Like
  const toggleLike = (commentId: string) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? c.likes + 1 : c.likes - 1
        };
      }
      return c;
    });
    saveComments(updated);
  };

  // Sort and Filter Comments
  const sortedComments = useMemo(() => {
    let result = [...comments];

    if (sortMode === "chronological") {
      // Timeline order: 0:00 -> Track End
      result.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    } else if (sortMode === "newest") {
      result.reverse();
    } else if (sortMode === "top") {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [comments, sortMode]);

  // Quick Emoji Insertion
  const handleAddEmoji = (emoji: string) => {
    setCommentText((prev) => `${prev} ${emoji}`.trim());
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-[#060B28] text-[#F2F4F8] select-none rounded-[20px] border border-[#18285C] shadow-2xl overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-r from-[#0a123d] via-[#0d174d] to-[#080d2d] border-b border-[#18285C] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5B6BFF]/20 border border-[#5B6BFF]/40 flex items-center justify-center text-[#5B6BFF]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Live Track Comments
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#5B6BFF]/20 text-[#5B6BFF] border border-[#5B6BFF]/30">
                {comments.length}
              </span>
            </h3>
            <p className="text-[10px] text-[#9AA0AE]">
              Time-stamped commentary for <span className="text-slate-200 font-semibold">{track?.title || "Track"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#9AA0AE] hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              title="Close Comments"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Timeline Waveform Scrubber Pins */}
      <div className="px-4 py-2.5 bg-[#091136] border-b border-[#18285C]/60 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#9AA0AE]">
          <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            Now playing: {formattedCurrentTime}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400">
            Click pin to jump audio
          </span>
        </div>

        {/* Timeline bar with marker pins */}
        <div className="relative w-full h-3 bg-[#04081E] rounded-full overflow-hidden border border-[#18285C] flex items-center px-1">
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-[#5B6BFF] opacity-30"
            style={{ width: `${progress}%` }}
          />

          {/* Comment pins */}
          {comments.map((cmt) => {
            const posPct = trackDuration > 0 ? (cmt.timeInSeconds / trackDuration) * 100 : 0;
            const isNearCurrent = Math.abs(currentPlaybackSeconds - cmt.timeInSeconds) <= 3;

            return (
              <button
                key={`pin-${cmt.id}`}
                onClick={(e) => handleJumpToTime(cmt.timeInSeconds, e)}
                title={`Jump to ${cmt.formattedTime}: "${cmt.content.slice(0, 30)}..."`}
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full -ml-1.25 transition-transform hover:scale-150 z-10 ${
                  isNearCurrent
                    ? "bg-amber-400 ring-2 ring-amber-300 ring-offset-1 ring-offset-black scale-125"
                    : "bg-[#5B6BFF] hover:bg-white"
                }`}
                style={{ left: `${Math.min(96, Math.max(2, posPct))}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Sort & Filter Controls */}
      <div className="px-4 py-2 bg-[#080E2E] border-b border-[#18285C]/50 flex items-center justify-between gap-2 text-[10px]">
        <span className="text-[#9AA0AE] uppercase tracking-wider font-bold">Sort Order:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortMode("chronological")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              sortMode === "chronological"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-white/5 text-[#9AA0AE] hover:text-white"
            }`}
          >
            <Clock className="w-3 h-3" />
            Timeline (0:00 → End)
          </button>

          <button
            onClick={() => setSortMode("newest")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              sortMode === "newest"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-white/5 text-[#9AA0AE] hover:text-white"
            }`}
          >
            Newest
          </button>

          <button
            onClick={() => setSortMode("top")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              sortMode === "top"
                ? "bg-[#5B6BFF] text-white shadow-sm"
                : "bg-white/5 text-[#9AA0AE] hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            Top
          </button>
        </div>
      </div>

      {/* Chronological Comment List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-[220px] max-h-[380px] scrollbar-thin scrollbar-thumb-[#18285C] scrollbar-track-transparent"
      >
        {sortedComments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No timestamped comments yet.</p>
            <p className="text-[10px] text-slate-500">Be the first to drop a comment at {formattedCurrentTime}!</p>
          </div>
        ) : (
          sortedComments.map((comment, idx) => {
            const isCurrentActiveTime = Math.abs(currentPlaybackSeconds - comment.timeInSeconds) <= 3;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                className={`p-3 rounded-2xl border transition-all relative group flex flex-col gap-2 ${
                  isCurrentActiveTime
                    ? "bg-gradient-to-r from-[#101c54] to-[#141242] border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                    : "bg-[#091136]/80 hover:bg-[#0c1645] border-[#18285C]"
                }`}
              >
                {/* Active Indicator Beacon */}
                {isCurrentActiveTime && (
                  <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Now Playing Section
                  </div>
                )}

                {/* Comment Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-6 h-6 rounded-full object-cover border border-[#18285C]"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{comment.userName}</span>
                      {comment.badge && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-[#5B6BFF]/20 text-[#5B6BFF] rounded border border-[#5B6BFF]/30">
                          {comment.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp Jump Button */}
                  <button
                    onClick={(e) => handleJumpToTime(comment.timeInSeconds, e)}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 via-[#5B6BFF]/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-[#5B6BFF]/40 text-cyan-300 hover:text-white font-mono font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    title={`Click to jump player audio to ${comment.formattedTime}`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                    <span>{comment.formattedTime}</span>
                  </button>
                </div>

                {/* Comment Text Content */}
                <p className="text-xs text-slate-200 leading-relaxed pl-8 font-normal">
                  {comment.content}
                </p>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between text-[10px] text-[#9AA0AE] pl-8 pt-1">
                  <span className="text-slate-500">{comment.createdAt}</span>

                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors ${
                      comment.isLiked
                        ? "text-[#5B6BFF] bg-[#5B6BFF]/10 font-bold"
                        : "text-[#9AA0AE] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        comment.isLiked ? "fill-[#5B6BFF] text-[#5B6BFF]" : ""
                      }`}
                    />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Comment Input Footer */}
      <div className="p-3 bg-[#080E2E] border-t border-[#18285C] space-y-2">
        {/* Timestamp Attachment Control Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAttachTimestamp(!attachTimestamp)}
              className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                attachTimestamp
                  ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                {attachTimestamp
                  ? `Attach Time: ${formattedCurrentTime}`
                  : "No Timestamp attached"}
              </span>
            </button>
          </div>

          {/* Quick Emoji Bar */}
          <div className="flex items-center gap-1">
            {["🔥", "💎", "🎧", "❤️", "⚡"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Form input */}
        <form onSubmit={handleSendComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Add a timestamped comment at ${attachTimestamp ? formattedCurrentTime : 'this track'}...`}
            className="flex-1 bg-[#04081E] border border-[#18285C] rounded-xl px-3 py-2 text-xs text-white placeholder-[#9AA0AE] focus:outline-none focus:border-[#5B6BFF] transition-colors"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#5B6BFF] to-blue-600 hover:from-[#4b5bff] hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrackComments;
