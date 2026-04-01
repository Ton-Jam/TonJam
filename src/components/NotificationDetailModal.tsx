import React from 'react';
import { X, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
          className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Signal Detail
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {notification.img ? (
                  <img src={notification.img} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {notification.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {notification.time}
                </span>
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-border/50">
              <button 
                onClick={handleAction}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>View Details</span>
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
