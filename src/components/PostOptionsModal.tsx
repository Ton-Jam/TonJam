import React, { useState } from 'react';
import { Link2, Share2, Bookmark, Trash2, Flag, Music, Coins, User, Gem, UserMinus, VolumeX, Ban } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from './ConfirmationModal';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import NFTOptionsModal from './NFTOptionsModal';
import { MOCK_TRACKS } from '@/constants';

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, isOwner = false, onDelete }) => {
  const navigate = useNavigate();
  const { addNotification, allNFTs, setOptionsTrack } = useAudio();
  const [showNFTOptions, setShowNFTOptions] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const track = post.track || (post.trackId ? MOCK_TRACKS.find(t => t.id === post.trackId) : undefined);
  const nft = post.nft || (post.nftId ? allNFTs.find(n => n.id === post.nftId) : undefined);

  const handleAction = (action: string) => {
    switch (action) {
      case 'profile':
        navigate(`/artist/${post.userId}`);
        onClose();
        break;
      case 'tip':
        addNotification(`Tip protocol initiated for ${post.userName}`, 'success');
        onClose();
        break;
      case 'copy':
        navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`);
        addNotification("Signal link copied to neural buffer", "success");
        onClose();
        break;
      case 'share':
        addNotification("External relay protocol initiated", "info");
        onClose();
        break;
      case 'save':
        addNotification("Signal archived in your private vault", "success");
        onClose();
        break;
      case 'report':
        addNotification("Signal flagged for moderation review", "warning");
        onClose();
        break;
      case 'delete':
        setIsDeleteConfirmOpen(true);
        break;
      case 'track':
        onClose();
        setOptionsTrack(track || null);
        break;
      case 'nft':
        setShowNFTOptions(true);
        break;
      case 'unfollow':
        addNotification(`Unfollowed @${post.username || post.userName}`, "success");
        onClose();
        break;
      case 'mute':
        addNotification(`Muted @${post.username || post.userName}`, "success");
        onClose();
        break;
      case 'block':
        addNotification(`Blocked @${post.username || post.userName}`, "success");
        onClose();
        break;
      case 'not_interested':
        addNotification("We'll show you less of this", "success");
        onClose();
        break;
    }
  };

  if (showNFTOptions && nft) {
    return <NFTOptionsModal nft={nft} onClose={() => { setShowNFTOptions(false); onClose(); }} />;
  }

  const options = [];

  if (!isOwner) {
    options.push({ id: 'not_interested', icon: Ban, label: 'Not interested in this post', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('not_interested') });
    options.push({ id: 'unfollow', icon: UserMinus, label: `Unfollow @${post.username || post.userName}`, color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('unfollow') });
  }

  options.push(
    { id: 'profile', icon: User, label: 'View Profile', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('profile') },
    { id: 'tip', icon: Coins, label: 'Tip Creator (TON)', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('tip') }
  );

  if (track) {
    options.push({ id: 'track', icon: Music, label: 'Track Options', color: 'text-foreground', iconColor: 'text-blue-500 group-hover:text-blue-400', action: () => handleAction('track') });
  }

  if (nft) {
    options.push({ id: 'nft', icon: Gem, label: 'NFT Options', color: 'text-foreground', iconColor: 'text-purple-500 group-hover:text-purple-400', action: () => handleAction('nft') });
  }

  options.push(
    { id: 'copy', icon: Link2, label: 'Copy Link', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('copy') },
    { id: 'share', icon: Share2, label: 'Share Signal', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') },
    { id: 'save', icon: Bookmark, label: 'Save to Vault', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('save') }
  );

  const destructiveOptions = [];
  if (isOwner) {
    destructiveOptions.push({ id: 'delete', icon: Trash2, label: 'Delete Signal', color: 'text-red-500', iconColor: 'text-red-500/40 group-hover:text-red-500', action: () => handleAction('delete') });
  } else {
    destructiveOptions.push(
      { id: 'mute', icon: VolumeX, label: `Mute @${post.username || post.userName}`, color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('mute') },
      { id: 'block', icon: Ban, label: `Block @${post.username || post.userName}`, color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('block') },
      { id: 'report', icon: Flag, label: 'Report Signal', color: 'text-amber-500', iconColor: 'text-amber-500/40 group-hover:text-amber-500', action: () => handleAction('report') }
    );
  }

  return (
    <>
      <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0A0A0A] border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Hardware style scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="mx-auto w-full max-md relative z-10">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="border-b border-white/5 pb-6 pt-4">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                <img 
                  src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} 
                  className="w-full h-full object-cover" 
                  alt={post.userName} 
                />
              </div>
              <div className="text-left flex-1 min-w-0">
                <DrawerTitle className="text-2xl font-bold tracking-tighter text-white truncate leading-none uppercase">
                  Signal_Options
                </DrawerTitle>
                <DrawerDescription className="text-[10px] text-blue-500 font-bold mt-2 uppercase tracking-[0.2em]">
                  Origin: {post.userName}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pt-4 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
            <div className="grid grid-cols-1 gap-1">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, ease: "easeOut" }}
                  onClick={option.action} 
                  className="w-full flex items-center gap-4 p-3 rounded-[12px] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-active:scale-90 transition-all border border-white/5 group-hover:border-blue-500/20">
                    <option.icon className={`h-4 w-4 ${option.iconColor} transition-transform group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                  </div>
                </motion.button>
              ))}
              
              <div className="h-px bg-white/5 my-3 mx-4"></div>
              
              {destructiveOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (options.length + index) * 0.03, ease: "easeOut" }}
                  onClick={option.action} 
                  className="w-full flex items-center gap-4 p-3 rounded-[12px] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 group-active:scale-90 transition-all border border-white/5 group-hover:border-red-500/20">
                    <option.icon className={`h-4 w-4 ${option.iconColor} transition-transform group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-4 pt-0 pb-8">
            <DrawerClose asChild>
              <Button 
                variant="secondary" 
                className="w-full rounded-[12px] h-12 font-bold text-[10px] uppercase tracking-[0.4em] bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-[0.98]"
              >
                Close_Interface
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (onDelete) {
            onDelete();
          } else {
            addNotification("Signal purged from the TON network", "error");
          }
          setIsDeleteConfirmOpen(false);
          onClose();
        }}
        title="Delete Signal?"
        description="Are you sure you want to delete this signal? This action cannot be undone."
        confirmText="Delete Signal"
        variant="destructive"
      />
    </>
  );
};

export default PostOptionsModal;
