import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pencil, Trash2, Share2, ChevronRight, FolderPlus } from 'lucide-react';
import { Playlist, PlaylistFolder } from '@/types';
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface PlaylistOptionsModalProps {
  playlist: Playlist;
  folders: PlaylistFolder[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}

const PlaylistOptionsModal: React.FC<PlaylistOptionsModalProps> = ({ playlist, folders, onClose, onEdit, onDelete, onMoveToFolder }) => {
  const [showFolders, setShowFolders] = useState(false);

  const options = [
    { 
      id: 'edit', 
      icon: Pencil, 
      label: 'Edit Playlist', 
      color: 'text-foreground', 
      iconColor: 'text-muted-foreground group-hover:text-blue-400', 
      action: () => { onEdit(); onClose(); } 
    },
    {
      id: 'move',
      icon: FolderPlus,
      label: 'Move to Folder',
      color: 'text-foreground',
      iconColor: 'text-muted-foreground group-hover:text-blue-400',
      action: () => setShowFolders(true)
    },
    { 
      id: 'share', 
      icon: Share2, 
      label: 'Share Playlist', 
      color: 'text-foreground', 
      iconColor: 'text-muted-foreground group-hover:text-blue-400', 
      action: () => {
        const shareData = {
          title: playlist.title,
          text: `Check out this playlist: ${playlist.title} on TonJam!`,
          url: window.location.href
        };
        if (navigator.share) {
          navigator.share(shareData).catch(console.error);
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
        onClose();
      } 
    },
    { 
      id: 'delete', 
      icon: Trash2, 
      label: 'Delete Playlist', 
      color: 'text-red-500', 
      iconColor: 'text-red-500/40 group-hover:text-red-500', 
      action: () => { onDelete(); onClose(); } 
    }
  ];

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
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-2xl uppercase">
                  {playlist.title.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-black text-white truncate leading-tight uppercase tracking-tighter">
                {playlist.title}
              </DrawerTitle>
              <DrawerDescription className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-[0.3em] truncate opacity-80">
                // CREATOR: {playlist.creator}
              </DrawerDescription>
            </div>
          </DrawerHeader>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
            <AnimatePresence mode="wait">
              {showFolders ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Button variant="ghost" onClick={() => setShowFolders(false)} className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    Back
                  </Button>
                  {folders.map(folder => (
                    <motion.button
                      key={folder.id}
                      onClick={() => { onMoveToFolder(folder.id); onClose(); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left"
                    >
                      <FolderPlus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{folder.title}</span>
                    </motion.button>
                  ))}
                  <motion.button
                      onClick={() => { onMoveToFolder(null); onClose(); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left"
                    >
                      <FolderPlus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Remove from Folder</span>
                    </motion.button>
                </motion.div>
              ) : (
                options.map((option, index) => (
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
                ))
              )}
            </AnimatePresence>
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

export default PlaylistOptionsModal;
