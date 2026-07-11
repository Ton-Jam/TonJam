import React from "react";
import { motion } from "motion/react";
import { Activity, MessageCircle, Heart, Repeat } from "lucide-react";

const ACTIVITIES = [
  { id: '1', user: 'Alex.ton', action: 'minted', target: 'Summer Vibes #04', time: '2m ago', type: 'mint' },
  { id: '2', user: 'SarahMusic', action: 'followed', target: 'DJKrupy', time: '5m ago', type: 'follow' },
  { id: '3', user: 'TonMax', action: 'liked', target: 'Neon Nights EP', time: '8m ago', type: 'like' },
];

export const CommunityActivity: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold text-[#00B4D8] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Real-time
          </span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Community Activity</h3>
        </div>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-[12px] bg-[#0c133a]/50 border border-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-[#132354] flex items-center justify-center shrink-0">
              {activity.type === 'mint' && <Repeat className="w-4 h-4 text-purple-400" />}
              {activity.type === 'follow' && <Activity className="w-4 h-4 text-[#00B4D8]" />}
              {activity.type === 'like' && <Heart className="w-4 h-4 text-red-400 fill-red-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight truncate">
                <span className="text-white">{activity.user}</span> {activity.action}{" "}
                <span className="text-[#00B4D8]">{activity.target}</span>
              </p>
            </div>

            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              {activity.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
