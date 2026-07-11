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
              className="w-[280px] shrink-0 snap-start bg-[#0c133a] border border-white/5 rounded-[12px] p-5 flex flex-col justify-between group transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {sp.isLive ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Live Now</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Upcoming</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{sp.isLive ? sp.listenerCount.toLocaleString() : '0'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black text-white tracking-tight line-clamp-2 leading-relaxed min-h-[40px]">
                    {sp.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <img 
                      src={sp.host.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host'} 
                      className="w-5 h-5 rounded-full border border-white/10" 
                      alt={sp.host.name} 
                    />
                    <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">
                      {sp.host.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {sp.speakerAvatars.slice(0, 3).map((av, index) => (
                    <img
                      key={index}
                      src={av}
                      alt="Speaker"
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#0c133a]"
                    />
                  ))}
                  {sp.speakerAvatars.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-white font-black border-2 border-[#0c133a]">
                      +{sp.speakerAvatars.length - 3}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onJoinSpace(sp.id)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-full cursor-pointer transition-all flex items-center gap-2 ${
                    isCurrentActive
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/10'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <span>Join</span>
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
