import React from 'react';
import { Link2, Share2, Bookmark, Trash2, Flag } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  isOwner?: boolean;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, isOwner = false }) => {
  const { addNotification } = useAudio();

  const handleAction = (action: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(`https://tonjam.app/post/${post.id}`);
        addNotification("Signal link copied to neural buffer", "success");
        break;
      case 'share':
        addNotification("External relay protocol initiated", "info");
        break;
      case 'save':
        addNotification("Signal archived in your private vault", "success");
        break;
      case 'report':
        addNotification("Signal flagged for moderation review", "warning");
        break;
      case 'delete':
        addNotification("Signal purged from the TON network", "error");
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative glass w-full max-w-xs rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-2 space-y-1">
          <button onClick={() => handleAction('copy')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <Link2 className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Copy Link</span>
          </button>
          <button onClick={() => handleAction('share')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <Share2 className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Share Signal</span>
          </button>
          <button onClick={() => handleAction('save')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-white/5 transition-all text-left group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
              <Bookmark className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Save to Vault</span>
          </button>
          <div className="h-px bg-white/5 my-1"></div>
          {isOwner ? (
            <button onClick={() => handleAction('delete')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-red-500/10 transition-all text-left group">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 group-hover:text-red-500 transition-colors">
                <Trash2 className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Delete Signal</span>
            </button>
          ) : (
            <button onClick={() => handleAction('report')} className="w-full flex items-center gap-4 p-4 rounded-[10px] hover:bg-amber-500/10 transition-all text-left group">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500/40 group-hover:text-amber-500 transition-colors">
                <Flag className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Report Signal</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full p-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PostOptionsModal;
