import React from 'react';
import { X, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface NotifyItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon?: string;
  img?: string;
}

interface NotificationDetailModalProps {
  notification: NotifyItem | null;
  onClose: () => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ notification, onClose }) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const handleAction = () => {
    onClose();
    if (notification.type === 'Syncs') navigate('/marketplace');
    else if (notification.type === 'Rewards') navigate('/profile');
    else if (notification.type === 'Social') navigate('/jamspace');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/90 backdrop-blur-xl" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass border border-border bg-background rounded-[4px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Signal Detail
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                {notification.img ? (
                  <img src={notification.img} alt="" className="w-8 h-8 object-contain drop-shadow-md" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="pt-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  {notification.title}
                </h3>
                <p className="text-base font-bold text-white leading-relaxed">
                  {notification.message}
                </p>
                <span className="inline-block mt-3 text-[9px] font-black uppercase tracking-wider text-white/30">
                  {notification.time}
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={handleAction}
                className="w-full flex items-center justify-center gap-2 py-4 glass-button bg-cyan-500 text-black hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <span>View Signal Origin</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationDetailModal;
