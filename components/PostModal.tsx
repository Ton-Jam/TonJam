import React, { useState } from 'react';
import { MOCK_USER, APP_LOGO } from '../constants';

interface PostModalProps {
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const maxLength = 280;

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    onClose();
  };

  const progress = (content.length / maxLength) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.15)] animate-in zoom-in-95 duration-200 overflow-hidden group focus-within:border-blue-500/30 transition-all">
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <header className="flex justify-between items-center p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
             <img src={APP_LOGO} className="w-5 h-5 object-contain" alt="" />
             <h2 className="text-xs font-black italic uppercase tracking-[0.2em] text-white">Broadcast Signal</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </header>

        <div className="p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img 
                src={MOCK_USER.avatar} 
                className="w-10 h-10 rounded-full border border-white/10 object-cover grayscale-[0.2] group-focus-within:grayscale-0 transition-all" 
                alt="" 
              />
            </div>
            <div className="flex-1">
              <textarea 
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's the frequency? Describe the vibe..."
                className="w-full bg-transparent border-none outline-none resize-none text-white text-base placeholder:text-white/10 h-28 italic font-medium tracking-tight leading-snug no-scrollbar"
              ></textarea>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between p-4 bg-white/[0.02] border-t border-white/5">
          <div className="flex gap-1">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn">
              <i className="far fa-image text-[13px] group-hover/btn:scale-110 transition-transform"></i>
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn">
              <i className="fas fa-link text-[12px] group-hover/btn:scale-110 transition-transform"></i>
            </button>
            <button className="px-3 h-9 rounded-lg flex items-center gap-2 text-blue-500/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn">
              <i className="fas fa-sparkles text-[11px]"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Forge AI</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${progress > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest tabular-nums ${content.length > maxLength ? 'text-red-500' : 'text-white/20'}`}>
                {content.length}
              </span>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/10 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 border border-white/10"
            >
              Broadcast
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PostModal;