import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { useNotification } from '@/contexts/NotificationContext';
import NotificationBadge from './notifications/NotificationBadge';

export const NotificationBell: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { unreadCount = 0 } = useNotification();
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    if (unreadCount > 0) {
      controls.start({
        rotate: [0, -15, 12, -10, 8, -4, 0],
        transition: { duration: 0.6, ease: 'easeOut' }
      });
    }
  }, [unreadCount, controls]);

  const handleTap = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleTap}
      className="
        relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-full 
        flex items-center justify-center 
        bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12]
        transition-colors cursor-pointer 
        outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        border-none select-none text-slate-300 hover:text-white shrink-0
      "
      aria-label={`Notifications, ${unreadCount} unread`}
    >
      <motion.div animate={controls} className="relative inline-flex">
        <Bell className="w-5 h-5 shrink-0" />
        <NotificationBadge count={unreadCount} />
      </motion.div>
    </motion.button>
  );
};

export default NotificationBell;
