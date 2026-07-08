import React from 'react';
import { motion } from 'motion/react';
import { Radio, Users, Calendar, ArrowUpRight, Check } from 'lucide-react';
import { Space } from '../types';

interface LiveSpacesProps {
  spaces: Space[];
  activeSpace: Space | null;
  onJoinSpace: (spaceId: string) => void;
}

export const LiveSpaces: React.FC<LiveSpacesProps> = ({
  spaces,
  activeSpace,
  onJoinSpace
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Live Audio Nodes</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Direct P2P Stream</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {spaces.map((sp) => {
          const isCurrentActive = activeSpace?.id === sp.id;
          return (
            <motion.div
              key={sp.id}
              className="w-[290px] shrink-0 snap-start bg-slate-900 border border-white/[0.03] rounded-[10px] p-4 flex flex-col justify-between"
              whileHover={{ y: -2 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {sp.isLive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold uppercase bg-red-500/15 text-red-400 rounded-full border border-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold uppercase bg-slate-800 text-slate-400 rounded-full">
                      <Calendar className="w-3 h-3" />
                      UPCOMING
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{sp.isLive ? sp.listenerCount.toLocaleString() : '0'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-2 leading-snug">
                    {sp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Hosted by <span className="text-slate-300 font-semibold">{sp.host.name}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {sp.speakerAvatars.slice(0, 3).map((av, index) => (
                    <img
                      key={index}
                      src={av}
                      alt="Speaker"
                      className="w-7 h-7 rounded-full object-cover border-2 border-slate-900"
                    />
                  ))}
                  {sp.speakerAvatars.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border-2 border-slate-900">
                      +{sp.speakerAvatars.length - 3}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onJoinSpace(sp.id)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[10px] cursor-pointer transition-all flex items-center gap-1 ${
                    isCurrentActive
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'bg-[#0052FF] text-white hover:bg-[#0052FF]/90'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>TUNED IN</span>
                    </>
                  ) : (
                    <>
                      <span>JOIN SPACE</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
