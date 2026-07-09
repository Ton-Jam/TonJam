import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { useTonJamNotifications } from './NotificationContext';
import NotificationBadge from './NotificationBadge';

interface NotificationBellProps {
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useTonJamNotifications();
  const navigate = useNavigate();
  const controls = useAnimation();

  // Trigger playful bell ring animation when unread count increases
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
        relative w-10 h-10 rounded-full 
        flex items-center justify-center 
        bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12]
        transition-colors cursor-pointer 
        outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        border-none select-none text-slate-300 hover:text-white
      "
      aria-label={`Notifications, ${unreadCount} unread`}
    >
      {/* Bell Icon with ring animation */}
      <motion.div animate={controls}>
        <Bell className="w-5 h-5 shrink-0" />
      </motion.div>

      {/* Ripple visual overlay */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10 pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2.2, opacity: 1, transition: { duration: 0.4 } }}
      />

      {/* Notification badge overlay */}
      <NotificationBadge count={unreadCount} />
    </motion.button>
  );
};

export default NotificationBell;
