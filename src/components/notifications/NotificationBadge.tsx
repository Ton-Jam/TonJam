import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -3, 0],
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 25,
          y: {
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1.5,
            ease: 'easeInOut'
          }
        }}
        className={`
          absolute -top-1 -right-1 
          flex items-center justify-center 
          bg-red-500 text-white font-black 
          text-[9px] px-1.5 h-4.5 min-w-4.5 rounded-full 
          shadow-lg shadow-red-500/20 
          select-none leading-none
          ${className}
        `}
      >
        {displayCount}
      </motion.span>
    </AnimatePresence>
  );
};
export default NotificationBadge;
