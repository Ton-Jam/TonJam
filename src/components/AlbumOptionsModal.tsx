import React from 'react';
import { motion } from 'motion/react';
import { X, Pencil, Trash2, Share2, ChevronRight, Music } from 'lucide-react';
import { Album } from '@/types';
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

interface AlbumOptionsModalProps {
  album: Album;
  onClose: () => void;
  onDelete?: () => void;
}

const AlbumOptionsModal: React.FC<AlbumOptionsModalProps> = ({ album, onClose, onDelete }) => {
  const options = [
    { 
      id: 'share', 
      icon: Share2, 
      label: 'Share Album', 
      color: 'text-foreground', 
      iconColor: 'text-muted-foreground group-hover:text-blue-400', 
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: album.title,
            text: `Check out this album: ${album.title} by ${album.artist} on TonJam!`,
            url: window.location.href,
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
        onClose();
      } 
    },
    ...(onDelete ? [{ 
      id: 'delete', 
      icon: Trash2, 
      label: 'Delete Album', 
      color: 'text-red-500', 
      iconColor: 'text-red-500/40 group-hover:text-red-500', 
      action: () => { onDelete(); onClose(); } 
    }] : [])
  ];

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-none shadow-[0_-12px_40px_rgba(0,0,0,0.8)]">
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
            <div className="relative w-16 h-16 rounded-[4px] overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
                <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-black text-white truncate leading-tight uppercase tracking-tighter">
                {album.title}
              </DrawerTitle>
              <DrawerDescription className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-[0.3em] truncate opacity-80">
                // ARTIST: {album.artist}
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

export default AlbumOptionsModal;
