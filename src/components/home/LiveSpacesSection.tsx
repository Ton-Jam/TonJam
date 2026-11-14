import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import confetti from "canvas-confetti";

export interface LiveSpaceItem {
  id: string;
  title: string;
  host: string;
  listeners: string;
  status: "LIVE" | "UPCOMING";
}

export const LiveSpacesSection: React.FC<{ spaces?: LiveSpaceItem[] }> = ({ spaces }) => {
  const navigate = useNavigate();
  const [firestoreSpaces, setFirestoreSpaces] = useState<LiveSpaceItem[]>([]);

  useEffect(() => {
    if (spaces) return;
    const q = query(collection(db, "liveStreams"), limit(5));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LiveSpaceItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const statusRaw = String(data.status || "").toUpperCase();
          if (statusRaw === "LIVE" || statusRaw === "UPCOMING" || data.isLive) {
            items.push({
              id: docSnap.id,
              title: data.title || "Live Audio Room",
              host: data.hostName || data.artistName || data.host || "Artist",
              listeners: String(data.viewersCount ?? data.listeners ?? 0),
              status: statusRaw === "UPCOMING" ? "UPCOMING" : "LIVE",
            });
          }
        });
        setFirestoreSpaces(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "liveStreams");
      }
    );
    return () => unsubscribe();
  }, [spaces]);

  const activeSpaces = spaces ?? firestoreSpaces;
  if (!activeSpaces || activeSpaces.length === 0) return null;

  return (
    <section className="space-y-3 text-left w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#FF3A5C] animate-pulse" />
          <h2 className="text-section-title font-bold text-white">
            JamSpace Community
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#FF3A5C] bg-[#FF3A5C]/10 px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest animate-pulse">
            On Air
          </span>
          <button 
            onClick={() => navigate("/jamspace")} 
            className="text-xs font-semibold text-[#0088CC] flex items-center gap-1 outline-none cursor-pointer border-0 bg-transparent hover:text-white transition-colors"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 px-4 sm:px-6 lg:px-8 w-full">
        {activeSpaces.map((room) => (
          <div
            key={room.id}
            className="p-3 sm:p-3.5 rounded-xl bg-transparent hover:bg-white/[0.03] flex items-center justify-between gap-3 border-none transition-colors"
          >
            <div className="space-y-1 text-left min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3A5C] animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                  {room.host} Space
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white leading-tight tracking-tight truncate w-full">
                {room.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Shared with <strong className="text-white">{room.listeners}</strong> listening</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                confetti({ particleCount: 30, spread: 50 });
                navigate("/jamspace");
              }}
              className="h-8 bg-[#FF3A5C] hover:bg-[#e02d4d] text-white font-bold text-[10px] uppercase tracking-widest px-4 rounded-full cursor-pointer border-none transition-transform hover:scale-105 active:scale-95"
            >
              Join
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveSpacesSection;
