import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { TonPriceChart } from "@/components/TonPriceChart";
import { useAudio } from "@/contexts/AudioContext";

export const HomeHero: React.FC = () => {
  const { userProfile } = useAudio();
  const navigate = useNavigate();

  const userName = userProfile?.name || userProfile?.username;

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full text-left"
    >
      <div 
        id="tonjam-home-header-container"
        className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 w-full"
      >
        {/* Left: Greeting & Welcome Copy */}
        <div className="flex items-center justify-start min-w-0 flex-1">
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white truncate">
              What&apos;s up, Jammies?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium truncate">
              {userName ? `Welcome back, ${userName} • Ready to jam?` : "Discover the newest sound waves on TON"}
            </p>
          </div>
        </div>

        {/* Right: Tasks Button & Ton Price Chart */}
        <div className="shrink-0 flex items-center justify-start gap-2 sm:gap-2.5">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center justify-start px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 transition-all text-white cursor-pointer select-none border-0"
            aria-label="Tasks & Rewards"
            title="Earn TonJam Coins"
          >
            <span className="text-xs font-semibold text-zinc-200">Tasks</span>
          </button>
          <TonPriceChart />
        </div>
      </div>
    </motion.section>
  );
};

export default HomeHero;
