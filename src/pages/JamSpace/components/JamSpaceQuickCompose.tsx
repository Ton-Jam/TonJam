import React from 'react';
import { motion } from 'motion/react';
import { Image, Video, BarChart2, Smile, Send, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface JamSpaceQuickComposeProps {
  onSubmit: (content: string) => void;
  onClick?: () => void;
}

export const JamSpaceQuickCompose: React.FC<JamSpaceQuickComposeProps> = ({ onSubmit, onClick }) => {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-[#0A113A]/50 hover:bg-[#0A113A]/70 rounded-[12px] p-4 cursor-pointer transition-all"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex gap-4 items-center">
        <img 
          src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
          alt="User avatar" 
          className="w-10 h-10 rounded-full shrink-0 object-cover"
        />
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm text-slate-400 select-none">What's vibing in your space?</span>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button type="button" className="p-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <Image className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
              <Music className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
              <Video className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer">
              <BarChart2 className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer">
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

