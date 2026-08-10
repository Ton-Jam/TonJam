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
  Cloud,
  FileAudio,
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  Cpu
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
  title?: string;
  subtitle?: string;
}

const MintingProgressOverlay: React.FC<MintingProgressOverlayProps> = ({ 
  isVisible, 
  steps, 
  overallProgress,
  currentMessage,
  title = "Minting Music NFT",
  subtitle = "Uploading files & encoding TEP-64 metadata"
}) => {
  // Calculate remaining stages
  const totalStages = steps.length;
  const completedStages = steps.filter(s => s.status === 'completed').length;
  const currentStageIndex = steps.findIndex(s => s.status === 'processing');
  const activeStageNum = currentStageIndex !== -1 ? currentStageIndex + 1 : (completedStages === totalStages ? totalStages : completedStages + 1);
  const remainingStages = Math.max(0, totalStages - completedStages);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050914]/92 backdrop-blur-2xl p-4 overflow-y-auto select-none"
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-3xl bg-[#0B1222] border border-white/10 shadow-[0_0_80px_rgba(0,180,216,0.15)] max-w-lg w-full relative overflow-hidden my-auto">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#00B4D8]/10 rounded-full blur-[110px] pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[110px] pointer-events-none -ml-32 -mb-32" />

            {/* Header Title Section */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00B4D8] animate-pulse shadow-[0_0_10px_#00B4D8]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00B4D8]">
                    TON Smart Contract Engine
                  </span>
                </div>
                
                {/* Remaining Stage Counter Badge */}
                <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-[#00B4D8]" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {remainingStages > 0 ? `${remainingStages} Stage${remainingStages > 1 ? 's' : ''} Remaining` : 'Finalizing'}
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {subtitle}
              </p>
            </div>

            {/* Visual Multi-Step Pipeline Stepper (Horizontal Pipeline) */}
            <div className="relative z-10 py-2">
              <div className="flex items-center justify-between relative">
                {/* Connected Progress Line */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${totalStages > 1 ? (completedStages / (totalStages - 1)) * 100 : 0}%` 
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-[#00B4D8] via-purple-500 to-emerald-400 rounded-full shadow-[0_0_12px_#00B4D8]"
                  />
                </div>

                {/* Pipeline Nodes */}
                {steps.map((s, idx) => {
                  const isCompleted = s.status === 'completed';
                  const isProcessing = s.status === 'processing';
                  const isError = s.status === 'error';
                  const IconComponent = s.icon || Sparkles;

                  return (
                    <div key={s.id} className="relative z-10 flex flex-col items-center group">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center border text-xs font-bold transition-all duration-300 shadow-md",
                        isCompleted ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]" :
                        isProcessing ? "bg-[#00B4D8]/20 border-[#00B4D8] text-[#00B4D8] scale-110 shadow-[0_0_15px_rgba(0,180,216,0.4)] animate-pulse" :
                        isError ? "bg-rose-500/20 border-rose-500 text-rose-400" :
                        "bg-[#0D1527] border-white/10 text-slate-500"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors max-w-[60px] text-center truncate",
                        isCompleted ? "text-emerald-400" :
                        isProcessing ? "text-white font-extrabold" :
                        "text-slate-500"
                      )}>
                        Step {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Percentage Progress Bar */}
            <div className="space-y-2 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    Stage {activeStageNum} of {totalStages}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    • {currentMessage}
                  </span>
                </div>
                <span className="text-xs font-black font-mono text-[#00B4D8]">
                  {Math.min(100, Math.max(0, overallProgress))}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-gradient-to-r from-[#00B4D8] via-purple-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(0,180,216,0.6)]"
                />
              </div>
            </div>

            {/* Detailed Stage List */}
            <div className="space-y-2.5 relative z-10 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
              {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isProcessing = step.status === 'processing';
                const isError = step.status === 'error';
                const IconComp = step.icon || Sparkles;

                return (
                  <div 
                    key={step.id} 
                    className={cn(
                      "flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-300",
                      isCompleted ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" :
                      isProcessing ? "bg-[#00B4D8]/10 border-[#00B4D8]/40 text-white shadow-md" :
                      isError ? "bg-rose-950/20 border-rose-500/30 text-rose-400" :
                      "bg-white/[0.02] border-white/5 text-slate-500 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                      isCompleted ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                      isProcessing ? "bg-[#00B4D8]/20 border-[#00B4D8] text-[#00B4D8] animate-pulse" :
                      isError ? "bg-rose-500/20 border-rose-500/40 text-rose-400" :
                      "bg-white/5 border-white/10 text-slate-500"
                    )}>
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isError ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <IconComp className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-xs font-bold tracking-tight truncate",
                          isCompleted ? "text-emerald-300" :
                          isProcessing ? "text-white font-extrabold" :
                          isError ? "text-rose-400" :
                          "text-slate-400"
                        )}>
                          {index + 1}. {step.label}
                        </span>

                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                          isCompleted ? "bg-emerald-500/10 text-emerald-400" :
                          isProcessing ? "bg-[#00B4D8]/20 text-[#00B4D8]" :
                          isError ? "bg-rose-500/10 text-rose-400" :
                          "bg-white/5 text-slate-500"
                        )}>
                          {isCompleted ? 'Done' : isProcessing ? 'Uploading' : isError ? 'Error' : 'Pending'}
                        </span>
                      </div>

                      {step.description && (
                        <p className={cn(
                          "text-[10px] font-medium truncate mt-0.5",
                          isProcessing ? "text-[#00B4D8]/80 font-bold" : "text-slate-400"
                        )}>
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Trust Warning */}
            <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Decentralized Pinata IPFS & TON Mainnet</span>
              </span>
              <span className="font-mono text-slate-500">Do not close window</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MintingProgressOverlay;
