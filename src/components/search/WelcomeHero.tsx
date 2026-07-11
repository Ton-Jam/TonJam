import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const WelcomeHero: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "Voyager";

  return (
    <div className="relative px-4 py-8 mb-4 overflow-hidden rounded-[12px] bg-[#0c133a] border border-white/5">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#00B4D8]/10 px-2 py-1 rounded-[6px] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#00B4D8] fill-[#00B4D8]" />
            <span className="text-[9px] font-black text-[#00B4D8] uppercase tracking-[0.15em]">System Live</span>
          </div>
          <div className="bg-white/5 px-2 py-1 rounded-[6px] flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Verified Node</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Welcome, <br />
            <span className="text-[#00B4D8]">{firstName}</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] max-w-[240px] leading-relaxed">
            Your audio frequency is synced with the TON blockchain. Explore the new wave.
          </p>
        </div>

        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-[#00B4D8] text-[#050A24] px-6 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00B4D8]/20"
          >
            Go Premium
          </motion.button>
        </div>
      </div>

      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-48 h-full bg-[#00B4D8]/5 blur-3xl rounded-full -mr-24 -mt-12" />
      <div className="absolute bottom-0 right-0 p-8 opacity-20">
        <Sparkles className="w-32 h-32 text-[#00B4D8]" />
      </div>
    </div>
  );
};
