import React, { useState } from 'react';
import { Link2, Share2, Bookmark, Trash2, Flag, Music, Coins, User, Gem } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { motion } from 'motion/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import TrackOptionsModal from './TrackOptionsModal';
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
  const { addNotification, allNFTs } = useAudio();
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [showNFTOptions, setShowNFTOptions] = useState(false);

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
        if (onDelete) {
          onDelete();
        } else {
          addNotification("Signal purged from the TON network", "error");
        }
        onClose();
        break;
      case 'track':
        setShowTrackOptions(true);
        break;
      case 'nft':
        setShowNFTOptions(true);
        break;
    }
  };

  if (showTrackOptions && track) {
    return <TrackOptionsModal track={track} onClose={() => { setShowTrackOptions(false); onClose(); }} />;
  }

  if (showNFTOptions && nft) {
    return <NFTOptionsModal nft={nft} onClose={() => { setShowNFTOptions(false); onClose(); }} />;
  }

  const options = [
    { id: 'profile', icon: User, label: 'View Profile', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('profile') },
    { id: 'tip', icon: Coins, label: 'Tip Creator (TON)', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-amber-400', action: () => handleAction('tip') },
  ];

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
    destructiveOptions.push({ id: 'report', icon: Flag, label: 'Report Signal', color: 'text-amber-500', iconColor: 'text-amber-500/40 group-hover:text-amber-500', action: () => handleAction('report') });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-t border-border">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-lg">Signal Options</DrawerTitle>
            <DrawerDescription className="text-sm">Manage this signal on the network.</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pt-0 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={option.action} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <option.icon className={`h-4 w-4 ${option.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
              </motion.button>
            ))}
            
            <div className="h-px bg-white/10 my-2"></div>
            
            {destructiveOptions.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (options.length + index) * 0.05 }}
                onClick={option.action} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <option.icon className={`h-4 w-4 ${option.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
              </motion.button>
            ))}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl h-12">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostOptionsModal;
