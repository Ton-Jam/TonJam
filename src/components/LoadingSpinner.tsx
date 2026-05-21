import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { TJ_COIN_ICON } from '@/constants';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 48 }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
              <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        <img 
          src={TJ_COIN_ICON} 
          alt="TonJam Spinner" 
          width={size}
          height={size}
          className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500"
      >
        Syncing_Network
      </motion.span>
    </div>
  );
};
