import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Video, BarChart2, Smile, Send, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface JamSpaceQuickComposeProps {
  onSubmit: (content: string) => void;
}

export const JamSpaceQuickCompose: React.FC<JamSpaceQuickComposeProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
      setIsFocused(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-white/[0.03] rounded-[12px] p-4 mb-8"
    >
      <div className="flex gap-4">
        <img 
          src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
          alt="User avatar" 
          className="w-10 h-10 rounded-full shrink-0 object-cover border border-white/10"
        />
        
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="What's vibing in your space?"
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-500 resize-none min-h-[40px] pt-2"
            rows={isFocused ? 3 : 1}
          />
          
          <div className={`flex items-center justify-between pt-3 border-t border-white/[0.03] transition-all duration-300 ${isFocused ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors">
                <Image className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors">
                <Music className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-lg transition-colors">
                <BarChart2 className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-pink-400 hover:bg-white/5 rounded-lg transition-colors">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-1.5 bg-[#0052FF] disabled:bg-slate-700 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 hover:bg-blue-600 active:scale-95"
            >
              <span>Broadcast</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
