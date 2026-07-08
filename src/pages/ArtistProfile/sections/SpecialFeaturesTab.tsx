import * as React from "react";
import { Artist } from "@/types";
import { TopSupporter, ArtistMission } from "../types";
import { 
  Zap, Award, TrendingUp, Users, Target, ShieldCheck, 
  Crown, Play, ChevronRight, MessageSquare, Gem, Percent 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SpecialFeaturesTabProps {
  artist: Artist;
  topSupporters: TopSupporter[];
  missions: ArtistMission[];
  supportAmount: string;
  onSupportAmountChange: (amount: string) => void;
  onSupportSubmit: (amount: string) => void;
  isSupporting: boolean;
}

export const SpecialFeaturesTab: React.FC<SpecialFeaturesTabProps> = ({
  artist,
  topSupporters,
  missions,
  supportAmount,
  onSupportAmountChange,
  onSupportSubmit,
  isSupporting
}) => {
  const [missionsState, setMissionsState] = React.useState<ArtistMission[]>(missions);

  const handleSupportPreset = (val: string) => {
    onSupportAmountChange(val);
  };

  const handleTriggerMission = (id: string, completed: boolean) => {
    if (completed) {
      toast("Mission already completed & rewards claimed!");
      return;
    }
    
    setMissionsState(prev => prev.map(m => {
      if (m.id === id) {
        toast.success(`Claimed +${m.rewardTJ} TJ Coins!`);
        return { ...m, completed: true, progress: 100 };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-12 animate-in fade-in" id="special-features-tab-root">
      
      {/* Support & Tip Preset Box */}
      <section className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-[10px] border border-neutral-800 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-4 h-4 fill-current text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[11px]">Direct Support Engine</h3>
          </div>
          <p className="text-xs text-muted-foreground">Send direct micro-donations of TJ Coins to sponsor this creator's hosting nodes and next studio singles.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            {["5", "10", "25", "100"].map((val) => (
              <button 
                key={val}
                onClick={() => handleSupportPreset(val)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-[10px] transition-colors border",
                  supportAmount === val 
                    ? "bg-cyan-500 text-black border-cyan-500" 
                    : "bg-neutral-950 text-white border-neutral-800 hover:border-neutral-700"
                )}
              >
                {val} TJ
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex-1 flex gap-2">
            <input 
              type="number" 
              placeholder="Custom"
              value={supportAmount}
              onChange={(e) => onSupportAmountChange(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-[10px] px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            
            <button 
              onClick={() => onSupportSubmit(supportAmount)}
              disabled={isSupporting || !supportAmount}
              className="px-6 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 text-xs font-bold rounded-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer border-none"
            >
              {isSupporting ? "Broadcasting..." : "Support"}
            </button>
          </div>
        </div>
      </section>

      {/* Royalty split summary */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] text-muted-foreground">NFT Royalty Splits Dashboard</h3>
        </div>

        <div className="bg-neutral-900/20 p-5 rounded-[10px] border border-neutral-900 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white font-bold">Smart Contract Address:</span>
            <span className="font-mono text-muted-foreground text-[10px] select-all truncate max-w-[200px]">
              {artist.walletAddress || "EQC..._8888"}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-300">Streaming Playback Split</span>
                <span className="text-purple-400 font-bold font-mono">8% Royalty</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: "8%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-300">NFT Secondary Market Split</span>
                <span className="text-cyan-400 font-bold font-mono">15% Royalty</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: "15%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fan Leaderboard & Streaks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] text-muted-foreground">Community Fan Leaderboard</h3>
        </div>

        <div className="bg-neutral-900/10 border border-neutral-900 rounded-[10px] divide-y divide-neutral-900">
          {topSupporters.map((sup, index) => (
            <div key={sup.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </span>
                
                <img src={sup.avatarUrl} className="w-8 h-8 rounded-full object-cover bg-neutral-800" alt="" />
                
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {sup.name}
                    <span className={cn(
                      "text-[7px] font-black uppercase px-1.5 py-0.5 rounded-[4px]",
                      sup.badgeType === "Gold" 
                        ? "bg-amber-500/10 text-amber-400" 
                        : sup.badgeType === "Silver" 
                          ? "bg-slate-300/10 text-neutral-300" 
                          : "bg-orange-500/10 text-orange-400"
                    )}>
                      {sup.badgeType}
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{sup.streakDays} Day Stream Streak 🔥</span>
                </div>
              </div>

              <div className="text-xs font-black font-mono text-cyan-400">
                {sup.supportAmount} Sponsored
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Artist Missions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[11px] text-muted-foreground">Artist Missions & Quests</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missionsState.map((mis) => (
            <div 
              key={mis.id}
              className="bg-neutral-900/20 border border-neutral-900 rounded-[10px] p-4 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">{mis.title}</span>
                  <span className="text-emerald-400 font-bold font-mono">+{mis.rewardTJ} TJ</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mis.description}</p>
                
                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${mis.progress}%` }} />
                  </div>
                  <div className="text-right text-[8px] text-muted-foreground font-mono">{mis.progress}% Complete</div>
                </div>
              </div>

              <button 
                onClick={() => handleTriggerMission(mis.id, mis.completed)}
                className={cn(
                  "w-full py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border-none cursor-pointer",
                  mis.completed 
                    ? "bg-neutral-900 text-muted-foreground cursor-default" 
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                )}
              >
                {mis.completed ? "Reward Claimed" : "Claim Reward"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
