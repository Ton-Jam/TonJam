import React from "react";
import { APP_LOGO } from "@/constants";
import { motion } from "motion/react";

const LoadingScreen: React.FC = () => {
  return (
    <motion.div 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <img
            src={APP_LOGO}
            alt="TonJam Icon"
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-[20px] md:text-[32px] font-black text-foreground tracking-[0.4em] uppercase italic">
            TonJam
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
