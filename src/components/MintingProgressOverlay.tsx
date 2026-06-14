import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Music, 
  Zap, 
  Sparkles, 
  Database,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MintingStepStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface MintingStep {
  id: string;
  label: string;
  status: MintingStepStatus;
  description?: string;
  icon: React.ComponentType<any>;
}

interface MintingProgressOverlayProps {
  isVisible: boolean;
  steps: MintingStep[];
  overallProgress: number;
  currentMessage: string;
}

const MintingProgressOverlay: React.FC<MintingProgressOverlayProps> = ({ 
  isVisible, 
  steps, 
  overallProgress,
  currentMessage
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B0F14]/90 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-8 p-10 rounded-[4px] bg-white/[0.03] border border-white/10 shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Neural Forge Active</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                Generating Artifact
              </h3>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                {currentMessage}
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Progress Vector</span>
                <span className="text-xs font-black font-mono text-cyan-500">{overallProgress}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4 relative z-10 pt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 group">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-[4px] flex items-center justify-center border transition-all duration-300",
                    step.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    step.status === 'processing' ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]" :
                    step.status === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                    "bg-white/5 border-white/5 text-white/20"
                  )}>
                    {step.status === 'processing' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        step.status === 'completed' ? "text-emerald-500" :
                        step.status === 'processing' ? "text-white" :
                        step.status === 'error' ? "text-rose-500" :
                        "text-white/30"
                      )}>
                        {step.label}
                      </span>
                      {step.status === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    {step.description && (
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        step.status === 'processing' ? "text-cyan-500/60" : "text-white/20"
                      )}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 relative z-10">
              <p className="text-[9px] text-white/30 font-bold leading-relaxed uppercase tracking-widest text-center">
                Artifact is being registered via the TON decentralization protocols. Do not terminate host connection.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MintingProgressOverlay;
