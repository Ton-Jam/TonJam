import React, { useMemo } from "react";
import { motion } from "motion/react";
import { TonPriceChart } from "@/components/TonPriceChart";
import { useAudio } from "@/contexts/AudioContext";

export const HomeHero: React.FC = () => {
  const { userProfile } = useAudio();

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
      <div className="flex items-center justify-between gap-3">
        {/* Left: Greeting & Welcome Copy */}
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            {greeting}, {userProfile?.username || "Listener"}
          </h1>
          <p className="text-xs text-zinc-400 font-medium truncate">
            Stream curated tracks & discover new Web3 releases
          </p>
        </div>

        {/* Right: Ton Price Chart Widget */}
        <div className="shrink-0 flex items-center">
          <TonPriceChart />
        </div>
      </div>
    </motion.section>
  );
};

export default HomeHero;
