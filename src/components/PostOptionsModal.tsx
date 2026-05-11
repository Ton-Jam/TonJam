import React from 'react';
import { Share, ExternalLink, Trash2, Flag, UserPlus, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage, shareContent, cn } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import { motion } from 'motion/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, onDelete }) => {
  const navigate = useNavigate();
  const { addNotification, userProfile, followedUserIds, toggleFollowUser } = useAudio();

  const isOwnPost = post.userId === userProfile?.uid;
  const isFollowing = followedUserIds.includes(post.userId);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'follow':
        toggleFollowUser(post.userId);
        onClose();
        break;
      case 'view':
        navigate(`/post/${post.id}`);
        onClose();
        break;
      case 'share':
        const result = await shareContent({
          title: `TON JAM Signal by ${post.userName}`,
          text: post.content,
          url: `${window.location.origin}/post/${post.id}`,
        });
        if (result.success && result.method === 'clipboard') {
           addNotification("Signal link copied to local buffer", "success");
        }
        onClose();
        break;
      case 'report':
        addNotification(`Signal reported`, 'success');
        onClose();
        break;
      case 'delete':
        if (onDelete) onDelete(post.id);
        onClose();
        break;
    }
  };

  const options = [];
  
  if (!isOwnPost) {
    options.push({ id: 'follow', icon: UserPlus, label: isFollowing ? 'Disconnect' : 'Sync User', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('follow') });
  }
  
  options.push({ id: 'view', icon: ExternalLink, label: 'View Thread', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('view') });
  options.push({ id: 'share', icon: Share, label: 'Share Signal', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') });
  
  if (!isOwnPost) {
    options.push({ id: 'report', icon: Flag, label: 'Report Signal', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: () => handleAction('report') });
  }

  if (isOwnPost && onDelete) {
    options.push({ id: 'delete', icon: Trash2, label: 'Delete Log', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: () => handleAction('delete') });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-none shadow-[0_-12px_40px_rgba(0,0,0,0.8)]">
        {/* Cyborg Tech Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_100%,100%_2px,3px_100%]" />
        
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-16 h-16 rounded-[4px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0"
            >
              <img 
                src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} 
                className="w-full h-full object-cover" 
                alt={post.userName} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-black text-white truncate leading-tight uppercase tracking-tighter">
                {post.userName}
              </DrawerTitle>
              <DrawerDescription className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-[0.3em] truncate opacity-80">
                // SIGNAL OPTIONS
              </DrawerDescription>
            </div>
          </DrawerHeader>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={option.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
              >
                <div className="w-10 h-10 rounded-[4px] bg-white/5 flex items-center justify-center transition-all group-hover:bg-blue-500/10 border border-white/5 group-hover:border-blue-500/20">
                  <option.icon className={cn("h-4 w-4 transition-all group-hover:scale-110", option.iconColor)} />
                </div>
                <div className="flex-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", option.color)}>
                    {option.label}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-blue-500/40 transition-colors" />
              </motion.button>
            ))}
          </div>

          <div className="mt-4">
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                className="w-full rounded-[4px] h-14 font-black text-[10px] uppercase tracking-[0.5em] text-white/30 hover:text-white hover:bg-white/5 transition-all border border-white/5"
              >
                Terminate_Interface
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostOptionsModal;
