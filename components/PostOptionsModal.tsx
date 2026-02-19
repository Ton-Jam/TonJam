import React from 'react';
import { Post } from '../types';
import { useAudio } from '../context/AudioContext';

interface PostOptionsModalProps {
  post: Post;
  isOwner: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, isOwner, onClose, onDelete }) => {
  const { addNotification } = useAudio();

  const handleAction = (label: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      // In a real app, this would trigger an API call
      console.log(`${label} protocol initiated for post ${post.id}`);
    }
    onClose();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://tonjam.app/post/${post.id}`);
    // addNotification is globally disabled as per current project settings but kept in logic
    // We'll use a local alert or similar if needed, but per context it's suppressed
    onClose();
  };

  const shareToPlatform = (platform: string) => {
    // Simulate sharing
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative glass w-full max-w-[280px] rounded-[2rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-1">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Signal Controls</span>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <i className="fas fa-times text-[10px]"></i>
            </button>
          </div>

          {/* Share Section */}
          <div className="p-3">
            <p className="text-[7px] font-black text-white/10 uppercase tracking-widest mb-3 ml-2 italic">Relay to Network</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <ShareIcon icon="fa-link" onClick={copyLink} color="bg-white/5" />
              <ShareIcon icon="fa-telegram" onClick={() => shareToPlatform('Telegram')} color="bg-blue-500/10 text-blue-400" />
              <ShareIcon icon="fa-x-twitter" onClick={() => shareToPlatform('X')} color="bg-white/10 text-white" />
              <ShareIcon icon="fa-whatsapp" onClick={() => shareToPlatform('WhatsApp')} color="bg-green-500/10 text-green-400" />
            </div>

            {/* Main Options */}
            <div className="space-y-1">
              <OptionButton 
                icon="fa-bookmark" 
                label="Save to Vault" 
                onClick={() => handleAction('Vault')} 
              />
              
              {isOwner ? (
                <OptionButton 
                  icon="fa-trash-can" 
                  label="Purge Signal" 
                  variant="danger" 
                  onClick={() => handleAction('Purge', onDelete)} 
                />
              ) : (
                <OptionButton 
                  icon="fa-triangle-exclamation" 
                  label="Report Glitch" 
                  variant="danger" 
                  onClick={() => handleAction('Report')} 
                />
              )}
            </div>
          </div>

          {/* Abort */}
          <button 
            onClick={onClose}
            className="w-full py-4 text-[9px] font-black uppercase text-white/20 tracking-[0.5em] hover:text-white hover:bg-white/5 transition-all italic border-t border-white/5"
          >
            Abort Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

const ShareIcon = ({ icon, onClick, color }: { icon: string; onClick: () => void; color: string }) => (
  <button 
    onClick={onClick}
    className={`w-full aspect-square rounded-xl ${color} flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-white/5`}
  >
    <i className={`fab ${icon.startsWith('fa-link') ? 'fas' : 'fab'} ${icon} text-xs`}></i>
  </button>
);

const OptionButton = ({ icon, label, onClick, variant = 'default' }: { icon: string, label: string, onClick: () => void, variant?: 'default' | 'danger' }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 group active:scale-[0.98] border border-transparent ${variant === 'danger' ? 'hover:border-red-500/20' : 'hover:border-blue-500/20'}`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 transition-all flex-shrink-0 ${variant === 'danger' ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-white/5 text-white/40 group-hover:text-blue-400 group-hover:bg-blue-500/10'}`}>
      <i className={`fas ${icon} text-[10px]`}></i>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-tight italic ${variant === 'danger' ? 'text-red-500/50 group-hover:text-red-500' : 'text-white/40 group-hover:text-white'}`}>
      {label}
    </span>
  </button>
);

export default PostOptionsModal;