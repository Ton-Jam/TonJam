import React from 'react';
import { Link2, Share2, Bookmark, Trash2, Flag } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, isOwner = false, onDelete }) => {
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
        if (onDelete) {
          onDelete();
        } else {
          addNotification("Signal purged from the TON network", "error");
        }
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-background border border-border w-full max-w-xs rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-2 space-y-2">
          <button onClick={() => handleAction('copy')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-blue-400 transition-colors">
              <Link2 className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Copy Link</span>
          </button>
          <button onClick={() => handleAction('share')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-blue-400 transition-colors">
              <Share2 className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Share Signal</span>
          </button>
          <button onClick={() => handleAction('save')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-blue-400 transition-colors">
              <Bookmark className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Save to Vault</span>
          </button>
          <div className="h-px bg-muted/50 my-2"></div>
          {isOwner ? (
            <button onClick={() => handleAction('delete')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-red-500/10 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 group-hover:text-red-500 transition-colors">
                <Trash2 className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Delete Signal</span>
            </button>
          ) : (
            <button onClick={() => handleAction('report')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-amber-500/10 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500/40 group-hover:text-amber-500 transition-colors">
                <Flag className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Report Signal</span>
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full p-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] hover:text-foreground transition-colors bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PostOptionsModal;
