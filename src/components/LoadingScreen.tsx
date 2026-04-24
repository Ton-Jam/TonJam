import React from "react";
import { APP_LOGO } from "@/constants";
import { motion } from "motion/react";

const LoadingScreen: React.FC = () => {
  return (
    <motion.div 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <img
            src={APP_LOGO}
            alt="TonJam Icon"
            className="w-[106px] h-[106px] md:w-[146px] md:h-[146px] object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0, 1, 0.4, 1], scale: [0.95, 1, 0.98, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <h1 className="text-[24px] md:text-[42px] font-black text-white tracking-[0.3em] uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            TonJam
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
