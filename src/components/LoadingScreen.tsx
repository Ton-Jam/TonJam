import React from "react";
import { motion } from "motion/react";

const LoadingScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] bg-[#000033] flex flex-col items-center justify-center overflow-hidden font-ui"
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <img
            src="https://i.postimg.cc/63GsZHzq/Ton-Jam-icon.png"
            alt="TonJam Icon"
            className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[28px] md:text-[34px] font-medium text-white tracking-[0.1em]"
          >
            TonJam
          </motion.h1>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
