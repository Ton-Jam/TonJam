import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, Heart, Zap, Sparkles, Music, Coins, Play, Pause, ChevronRight 
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudio } from "@/contexts/AudioContext";
import { getPlaceholderImage, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityMetadata {
  targetId?: string;
  artistName?: string;
  paymentAmount?: string;
  paymentCurrency?: string;
}

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: string;
  status: "tip" | "nft_purchase" | "fan_club_join" | "track_release" | "nft_mint" | string;
  targetId?: string;
  artistName?: string;
  paymentAmount?: string;
  paymentCurrency?: string;
  timestamp?: string;
  createdAt?: any;
}

export const SocialActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { playTrack, allTracks, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    // Query posts ordered by createdAt descending
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ActivityEvent[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Filter activity posts client-side to prevent compound index requirement
          if (data.type === "activity") {
            list.push({
              id: doc.id,
              userId: data.userId || "",
              userName: data.userName || data.authorName || "User",
              userAvatar: data.userAvatar || data.authorPhoto || "",
              content: data.content || "",
              type: data.type || "activity",
              status: data.status || "track_release",
              targetId: data.targetId,
              artistName: data.artistName,
              paymentAmount: data.paymentAmount,
              paymentCurrency: data.paymentCurrency || "TON",
              timestamp: data.timestamp,
              createdAt: data.createdAt,
            });
          }
        });
        
        setActivities(list.slice(0, 15));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error subscribing to social feed:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getRelativeTime = (createdAt: any, timestampStr?: string) => {
    let date: Date;
    if (createdAt && typeof createdAt.toDate === "function") {
      date = createdAt.toDate();
    } else if (timestampStr) {
      date = new Date(timestampStr);
    } else {
      return "just now";
    }

    const diffMs = Date.now() - date.getTime();
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSecs < 15) return "now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handlePlayActivityTrack = (targetId?: string) => {
    if (!targetId) return;
    
    // Find the track in allTracks
    const track = allTracks?.find(t => t.id === targetId || t.songId === targetId);
    if (track) {
      playTrack(track);
    }
  };

  const getIconAndColor = (status: string) => {
    switch (status) {
      case "nft_mint":
        return {
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
          bgColor: "bg-emerald-500/10",
          accentColor: "text-emerald-400"
        };
      case "nft_purchase":
        return {
          icon: <Coins className="w-4 h-4 text-cyan-400" />,
          bgColor: "bg-cyan-500/10",
          accentColor: "text-cyan-400"
        };
      case "tip":
        return {
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          bgColor: "bg-yellow-500/10",
          accentColor: "text-yellow-400"
        };
      case "fan_club_join":
        return {
          icon: <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />,
          bgColor: "bg-rose-500/10",
          accentColor: "text-rose-400"
        };
      case "track_release":
      default:
        return {
          icon: <Music className="w-4 h-4 text-indigo-400" />,
          bgColor: "bg-indigo-500/10",
          accentColor: "text-indigo-400"
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Streaming Activity
          </span>
          <h3 className="text-base font-black uppercase tracking-[0.15em] text-white">
            Ledger Broadcast
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Activity className="w-8 h-8 text-cyan-500/30 animate-spin" />
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Connecting stream feed...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white/[0.01] p-6">
            <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-40" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Awaiting First Broadcast
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Events will appear as users mint or purchase NFTs
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            <AnimatePresence mode="popLayout">
              {activities.map((act, idx) => {
                const isCurrent = act.targetId && currentTrack?.id === act.targetId;
                const config = getIconAndColor(act.status);
                const hasPlayableTrack = act.targetId && allTracks?.some(t => t.id === act.targetId || t.songId === act.targetId);

                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 35,
                      delay: Math.min(idx * 0.03, 0.3)
                    }}
                    className={cn(
                      "flex items-center gap-3.5 p-3.5 rounded-2xl transition-all relative overflow-hidden group select-none",
                      isCurrent && isPlaying
                        ? "bg-emerald-500/[0.06]" 
                        : "bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Event Icon Indicator */}
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner", config.bgColor)}>
                      {config.icon}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white truncate max-w-[140px] hover:text-cyan-300 transition-colors">
                          {act.userName}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                          {getRelativeTime(act.createdAt, act.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2">
                        {act.content}
                        {act.paymentAmount && (
                          <span className={cn("font-bold ml-1 text-xs", config.accentColor)}>
                            {act.paymentAmount} {act.paymentCurrency || "TON"}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quick Play Action for releases or purchases */}
                    {hasPlayableTrack && (
                      <button
                        onClick={() => handlePlayActivityTrack(act.targetId)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all border-none",
                          isCurrent && isPlaying
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/15"
                        )}
                        title={isCurrent && isPlaying ? "Pause Track" : "Play Track"}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
