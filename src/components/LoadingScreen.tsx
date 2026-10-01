import React from "react";
import { motion } from "motion/react";
import { APP_LOGO } from "@/constants";

const LoadingScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden font-sans bg-[#07111F]"
      style={{
        background: "radial-gradient(circle at 50% 0%, #0A1647 0%, #050A24 100%)",
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-6 -translate-y-6">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <img
            src={APP_LOGO || "https://i.postimg.cc/63GsZHzq/Ton-Jam-icon.png"}
            alt="TonJam"
            className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] object-contain"
            onError={(e) => {
              e.currentTarget.src = APP_LOGO;
            }}
          />
        </motion.div>
        
        <div className="flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[26px] md:text-[32px] font-bold text-white tracking-[0.1em]"
          >
            TonJam
          </motion.h1>
          <p className="text-xs text-[#00B4D8] font-medium tracking-wider uppercase mt-1 animate-pulse">
            Loading TonJam...
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
