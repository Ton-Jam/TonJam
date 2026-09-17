import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { TonPriceChart } from "@/components/TonPriceChart";
import { useAudio } from "@/contexts/AudioContext";
import { TJ_COIN_ICON } from "@/constants";

export const HomeHero: React.FC = () => {
  const { userProfile } = useAudio();
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full text-left"
    >
      <div 
        id="tonjam-home-header-container"
        className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 w-full"
      >
        {/* Left: Greeting & Welcome Copy in flexbox wrapper with items-center and justify-start */}
        <div className="flex items-center justify-start min-w-0 flex-1">
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white truncate">
              {greeting}, {userProfile?.username || "Listener"}
            </h1>
          </div>
        </div>

        {/* Right: TonJam Coin Tasks Button & Ton Price Chart */}
        <div className="shrink-0 flex items-center justify-start gap-2 sm:gap-2.5">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center justify-start gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition-all text-white cursor-pointer select-none"
            aria-label="Tasks & Rewards"
            title="Earn TonJam Coins"
          >
            <img src={TJ_COIN_ICON} alt="TonJam Coin" className="w-4 h-4 object-contain shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 hidden min-[390px]:inline">Tasks</span>
          </button>
          <TonPriceChart />
        </div>
      </div>
    </motion.section>
  );
};

export default HomeHero;
