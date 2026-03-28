import React, { useState } from 'react';
import { Link2, Share2, Bookmark, Trash2, Flag, Music } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button"
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
import { MOCK_TRACKS } from '@/constants';

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, isOwner = false, onDelete }) => {
  const { addNotification } = useAudio();
  const [showTrackOptions, setShowTrackOptions] = useState(false);

  const track = post.track || (post.trackId ? MOCK_TRACKS.find(t => t.id === post.trackId) : undefined);

  const handleAction = (action: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(`https://tonjam.app/post/${post.id}`);
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
    }
  };

  if (showTrackOptions && track) {
    return <TrackOptionsModal track={track} onClose={() => { setShowTrackOptions(false); onClose(); }} />;
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Signal Options</DrawerTitle>
            <DrawerDescription>Manage this signal on the network.</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-2">
            {track && (
              <button onClick={() => handleAction('track')} className="w-full flex items-center gap-2 p-2 rounded-[10px] hover:bg-muted/50 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:text-blue-400 transition-colors">
                  <Music className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Track Options</span>
              </button>
            )}
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

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostOptionsModal;
