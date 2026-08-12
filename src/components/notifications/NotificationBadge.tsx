import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 25
        }}
        className={`
          absolute -top-0.5 -right-0.5 
          w-2.5 h-2.5 rounded-full 
          bg-red-500 ring-2 ring-[#080D2D]
          shadow-[0_0_8px_rgba(239,68,68,0.8)]
          select-none pointer-events-none
          ${className}
        `}
      />
    </AnimatePresence>
  );
};
export default NotificationBadge;

