import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, History, Play, Pause } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAudio } from "@/contexts/AudioContext";
import { Track } from "@/types";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";
import LazyArtworkImage from "@/components/common/LazyArtworkImage";
import VerifiedArtistBadge from "@/components/common/VerifiedArtistBadge";
import { getPlaceholderImage } from "@/lib/utils";

interface FirestoreHistoryDoc {
  trackId: string;
  title?: string;
  artist?: string;
  artistId?: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;
  duration?: number;
  bpm?: number;
  mood?: string;
  isNFT?: boolean;
  artistVerified?: boolean;
  playCount?: number;
  lastPlayed?: string | number;
}

export const RecentlyPlayedSection: React.FC = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, allTracks, recentlyPlayed: sessionRecentlyPlayed } = useAudio();
  const { scrollRef, handlers } = useHorizontalDragScroll<HTMLDivElement>();
  const [firestoreHistory, setFirestoreHistory] = useState<FirestoreHistoryDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentUserId = auth.currentUser?.uid;

  // Realtime subscription to the user's listeningHistory collection in Firestore (last 10 tracks)
  useEffect(() => {
    if (!currentUserId) {
      setFirestoreHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const historyCol = collection(db, "users", currentUserId, "listeningHistory");
    const q = query(historyCol, orderBy("lastPlayed", "desc"), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FirestoreHistoryDoc[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreHistoryDoc;
          items.push({
            trackId: data.trackId || docSnap.id,
            title: data.title || "Untitled Track",
            artist: data.artist || "Unknown Artist",
            artistId: data.artistId || "",
            genre: data.genre || "Electronic",
            coverUrl: data.coverUrl,
            audioUrl: data.audioUrl,
            duration: data.duration,
            bpm: data.bpm,
            mood: data.mood,
            isNFT: data.isNFT,
            artistVerified: data.artistVerified,
            playCount: data.playCount,
            lastPlayed: data.lastPlayed,
          });
        });
        setFirestoreHistory(items);
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUserId}/listeningHistory`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  // Map history records to full Track objects, prioritizing matching allTracks
  const displayTracks: Track[] = useMemo(() => {
    if (firestoreHistory.length > 0) {
      return firestoreHistory.map((item) => {
        const matched = allTracks.find((t) => t.id === item.trackId);
        if (matched) {
          return matched;
        }

        // Reconstruct Track object from Firestore history document
        return {
          id: item.trackId,
          songId: item.trackId,
          title: item.title || "Untitled Track",
          artist: item.artist || "Unknown Artist",
          artistId: item.artistId || "",
          audioUrl: (item.audioUrl && !item.audioUrl.includes("codeskulptor") && !item.audioUrl.includes("tonjam.io"))
            ? item.audioUrl
            : "/tonjam-offline-audio.mp3",
          genre: item.genre || "Electronic",
          bpm: item.bpm || 120,
          mood: item.mood || "Chill",
          isNFT: Boolean(item.isNFT),
          artistVerified: item.artistVerified ?? true,
          playCount: item.playCount || 1,
          createdAt: typeof item.lastPlayed === "string" ? item.lastPlayed : new Date().toISOString(),
        } as Track;
      });
    }

    // Fallback to active session recently played tracks if user has no Firestore history yet
    if (sessionRecentlyPlayed && sessionRecentlyPlayed.length > 0) {
      return sessionRecentlyPlayed.slice(0, 10);
    }

    return [];
  }, [firestoreHistory, allTracks, sessionRecentlyPlayed]);

  if (!isLoading && displayTracks.length === 0) {
    return null;
  }

  const formatRelativeTime = (lastPlayed?: string | number): string => {
    if (!lastPlayed) return "Recently";
    try {
      const timeMs = typeof lastPlayed === "number" ? lastPlayed : new Date(lastPlayed).getTime();
      const diffSec = Math.floor((Date.now() - timeMs) / 1000);
      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#0088CC]" />
          <h2 className="text-section-title font-bold text-white tracking-tight">
            Recently Played
          </h2>
        </div>
        <button
          onClick={() => navigate("/explore/tracks?title=Recently+Played&filter=history")}
          className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer bg-transparent hover:text-white transition-colors"
          aria-label="See all recently played tracks"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
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
        {displayTracks.map((track) => {
          const isCurrentActive = currentTrack?.id === track.id;
          const coverArt = track.coverUrl || getPlaceholderImage(`track-${track.id}`);
          const historyEntry = firestoreHistory.find((h) => h.trackId === track.id);
          const relativeTime = formatRelativeTime(historyEntry?.lastPlayed || track.createdAt);

          return (
            <div
              key={`recently-played-${track.id}`}
              style={{ width: "148px", scrollSnapAlign: "start" }}
              className="w-[148px] shrink-0 snap-start"
            >
              <div
                onClick={() => playTrack(track)}
                className="group relative flex flex-col justify-between p-2 rounded-[2px] bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer w-full select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playTrack(track);
                  }
                }}
              >
                {/* Artwork without border lines */}
                <div className="relative w-full aspect-square rounded-[2px] overflow-hidden bg-neutral-900 mb-2">
                  <LazyArtworkImage
                    src={coverArt}
                    fallbackSrc={getPlaceholderImage(`track-${track.id}`)}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Play Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrentActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
                </div>

                {/* Metadata */}
                <div className="flex flex-col min-w-0">
                  <h4
                    className={`text-[13px] font-medium leading-tight truncate transition-colors ${
                      isCurrentActive ? "text-[#0088CC] font-semibold" : "text-white/95 group-hover:text-blue-400"
                    }`}
                  >
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] text-zinc-400 truncate">{track.artist}</span>
                    <VerifiedArtistBadge isVerified={track.artistVerified ?? true} size="xs" />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-medium truncate">
                      {relativeTime}
                    </span>
                    {track.genre && (
                      <span className="text-[9.5px] text-zinc-400 truncate max-w-[65px]">
                        {track.genre}
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

export default RecentlyPlayedSection;
