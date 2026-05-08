import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, Shield, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NetworkStatus: React.FC<{ className?: string }> = ({ className }) => {
  const bars = useMemo(() => Array.from({ length: 40 }).map(() => Math.random() * 100), []);

  return (
    <div className={cn("bg-zinc-950 rounded-2xl p-6 font-mono", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Network.Protocol_Status</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-bold">v3.4.12_STABLE</span>
      </div>

      <div className="space-y-4">
        {/* Real-time frequency visualization */}
        <div className="h-16 flex items-end gap-[2px] px-2 mb-6">
          {bars.map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: '10%' }}
              animate={{ height: [`${height}%`, `${Math.max(10, height - 20)}%`, `${Math.min(100, height + 15)}%`] }}
              transition={{
                duration: 0.5 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex-1 bg-blue-500/40 rounded-t-sm"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Activity className="h-3 w-3" />
              <span className="text-[9px] uppercase tracking-tighter">BPM_Density</span>
            </div>
            <div className="text-sm font-bold text-zinc-200">128.4 <span className="text-[10px] text-zinc-600 font-medium">BPS</span></div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '74%' }}
                className="h-full bg-blue-500/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Shield className="h-3 w-3" />
              <span className="text-[9px] uppercase tracking-tighter">Sync_Integrity</span>
            </div>
            <div className="text-sm font-bold text-zinc-200">99.98 <span className="text-[10px] text-zinc-600 font-medium">%</span></div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99%' }}
                className="h-full bg-emerald-500/60"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="w-5 h-5 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
               </div>
             ))}
             <span className="pl-4 text-[9px] text-zinc-500 font-bold uppercase self-center tracking-widest">4.2k active nodes</span>
          </div>
          <Zap className="h-3 w-3 text-yellow-500 opacity-50" />
        </div>
      </div>
    </div>
  );
};
