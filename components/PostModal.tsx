import React, { useState, useRef } from 'react';
import { MOCK_USER, APP_LOGO } from '../constants';
import { useAudio } from '../context/AudioContext';

interface PostModalProps {
  onClose: () => void;
  onSubmit: (content: string, mediaUrl?: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useAudio();
  const maxLength = 280;

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl) return;
    onSubmit(content, mediaUrl || undefined);
    onClose();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addNotification("File too large. Max 10MB allowed.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TonJam Broadcast',
        text: content || 'Check out this signal on TonJam!',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      addNotification("Web Share API not supported on this browser.", "info");
    }
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
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Broadcast Signal</h2>
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
            <div className="flex-1 flex flex-col gap-3">
              <textarea 
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's the frequency? Describe the vibe..."
                className="w-full bg-transparent border-none outline-none resize-none text-white text-base placeholder:text-white/10 h-24 font-medium tracking-tight leading-snug no-scrollbar"
              ></textarea>
              
              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 group/media">
                  {mediaUrl.startsWith('data:video') ? (
                    <video src={mediaUrl} controls className="w-full max-h-48 object-cover" />
                  ) : (
                    <img src={mediaUrl} className="w-full max-h-48 object-cover" alt="Upload preview" />
                  )}
                  <button 
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/media:opacity-100"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between p-4 bg-white/[0.02] border-t border-white/5">
          <div className="flex gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleMediaUpload} 
              accept="image/*,video/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn"
              title="Upload Media"
            >
              <i className="far fa-image text-[13px] group-hover/btn:scale-110 transition-transform"></i>
            </button>
            <button 
              onClick={handleSocialShare}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-all group/btn"
              title="Share"
            >
              <i className="fas fa-share-nodes text-[12px] group-hover/btn:scale-110 transition-transform"></i>
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
              disabled={(!content.trim() && !mediaUrl) || content.length > maxLength}
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