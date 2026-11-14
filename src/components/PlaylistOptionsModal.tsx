import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pencil, 
  Trash2, 
  Share2, 
  ChevronRight, 
  FolderPlus, 
  Play, 
  ListPlus, 
  Users, 
  ArrowLeft,
  Check,
  Folder,
  Music2,
  FolderMinus
} from 'lucide-react';
import { Playlist, PlaylistFolder } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PlaylistOptionsModalProps {
  playlist: Playlist;
  folders: PlaylistFolder[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}

const PlaylistOptionsModal: React.FC<PlaylistOptionsModalProps> = ({ 
  playlist, 
  folders = [], 
  onClose, 
  onEdit, 
  onDelete, 
  onMoveToFolder 
}) => {
  const { playTrack, addToQueue, allTracks, updatePlaylist } = useAudio();
  const [showFolders, setShowFolders] = useState(false);

  const playlistTracks = React.useMemo(() => {
    if (!playlist.trackIds || playlist.trackIds.length === 0) return [];
    return playlist.trackIds
      .map(id => allTracks.find(t => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t);
  }, [playlist.trackIds, allTracks]);

  const handlePlayNext = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0]);
      toast.success(`Playing ${playlist.title}`);
    } else {
      toast.info('No tracks in this playlist');
    }
    onClose();
  };

  const handleAddToQueue = () => {
    if (playlistTracks.length > 0) {
      playlistTracks.forEach(t => addToQueue(t));
      toast.success(`Added ${playlistTracks.length} tracks to queue`);
    } else {
      toast.info('No tracks to add to queue');
    }
    onClose();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/playlist/${playlist.id}`;
    const shareData = {
      title: playlist.title,
      text: `Listen to "${playlist.title}" by ${playlist.creator} on TonJam!`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Playlist link copied to clipboard');
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Playlist link copied to clipboard');
    }
    onClose();
  };

  const handleToggleCollaborative = () => {
    const nextState = !playlist.isCollaborative;
    updatePlaylist(playlist.id, { isCollaborative: nextState });
    toast.success(nextState ? 'Playlist is now collaborative' : 'Collaborative mode turned off');
    onClose();
  };

  const currentFolder = folders.find(f => f.playlistIds?.includes(playlist.id) || f.id === playlist.folderId);

  const options = [
    { 
      id: 'play-next', 
      icon: Play, 
      label: 'Play Playlist', 
      description: 'Start playback from the first track',
      color: 'text-white', 
      iconBg: 'bg-[#00B4D8]/15 text-[#00B4D8]', 
      action: handlePlayNext 
    },
    { 
      id: 'queue', 
      icon: ListPlus, 
      label: 'Add to Queue', 
      description: `Queue all ${playlistTracks.length || playlist.trackCount || 0} tracks`,
      color: 'text-white', 
      iconBg: 'bg-blue-500/15 text-blue-400', 
      action: handleAddToQueue 
    },
    { 
      id: 'edit', 
      icon: Pencil, 
      label: 'Edit Details', 
      description: 'Rename, change description, or update artwork',
      color: 'text-white', 
      iconBg: 'bg-white/[0.08] text-white', 
      action: () => { onEdit(); onClose(); } 
    },
    {
      id: 'move',
      icon: FolderPlus,
      label: currentFolder ? `Folder: ${currentFolder.title}` : 'Move to Folder',
      description: currentFolder ? 'Change folder assignment' : 'Organize into your custom folders',
      color: 'text-white',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      action: () => setShowFolders(true)
    },
    { 
      id: 'collab', 
      icon: Users, 
      label: playlist.isCollaborative ? 'Collaborative Playlist (Active)' : 'Make Collaborative', 
      description: playlist.isCollaborative ? 'Collaborators can add tracks' : 'Allow friends to add tracks',
      color: 'text-white', 
      iconBg: playlist.isCollaborative ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.08] text-white', 
      action: handleToggleCollaborative 
    },
    { 
      id: 'share', 
      icon: Share2, 
      label: 'Share Playlist', 
      description: 'Copy link or share to other apps',
      color: 'text-white', 
      iconBg: 'bg-white/[0.08] text-white', 
      action: handleShare 
    },
    { 
      id: 'delete', 
      icon: Trash2, 
      label: 'Delete Playlist', 
      description: 'Permanently remove this playlist',
      color: 'text-rose-400', 
      iconBg: 'bg-rose-500/15 text-rose-400', 
      action: () => { onDelete(); onClose(); } 
    }
  ];

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#0B1528] text-white border-none before:border-none shadow-[0_-16px_50px_rgba(0,0,0,0.85)] rounded-t-3xl max-h-[85vh] p-0 overflow-hidden">
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pt-3 pb-8">
          
          {/* Subtle drag handle */}
          <div className="flex justify-center pb-3">
            <div className="w-12 h-1 rounded-full bg-white/20" />
          </div>

          <DrawerHeader className="p-0 pb-4 flex flex-row items-center gap-3.5 text-left">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg shrink-0 bg-white/[0.04]">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#00B4D8]/20 flex items-center justify-center text-[#00B4D8] font-bold text-xl uppercase">
                  {playlist.title?.charAt(0) || <Music2 className="w-6 h-6" />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-base font-bold text-white truncate leading-tight">
                {playlist.title}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                {playlist.creator} · {playlist.trackCount || playlistTracks.length || 0} tracks
              </DrawerDescription>
            </div>
          </DrawerHeader>
          
          <div className="space-y-1.5 max-h-[55vh] overflow-y-auto no-scrollbar py-1">
            <AnimatePresence mode="wait">
              {showFolders ? (
                <motion.div 
                  key="folders-view"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-1"
                >
                  <button 
                    onClick={() => setShowFolders(false)} 
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer border-none bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#00B4D8]" />
                    <span>Back to Options</span>
                  </button>

                  <div className="pt-1 pb-2 px-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Choose Folder
                    </span>
                  </div>

                  {folders.map(folder => {
                    const isSelected = currentFolder?.id === folder.id;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => { 
                          onMoveToFolder(folder.id); 
                          toast.success(`Moved to "${folder.title}"`);
                          onClose(); 
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.06] active:scale-[0.99] transition-all text-left cursor-pointer border-none",
                          isSelected ? "bg-white/[0.08]" : "bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                            <Folder className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{folder.title}</p>
                            <p className="text-[10px] text-slate-400">
                              {folder.playlistIds?.length || 0} playlists
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#00B4D8] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {currentFolder && (
                    <button
                      onClick={() => { 
                        onMoveToFolder(null); 
                        toast.success('Removed from folder');
                        onClose(); 
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-white/[0.06] active:scale-[0.99] transition-all text-left cursor-pointer border-none bg-transparent text-rose-400"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                        <FolderMinus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">Remove from Folder</span>
                    </button>
                  )}

                  {folders.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No custom folders created yet.
                    </div>
                  )}
                </motion.div>
              ) : (
                options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={option.action}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/[0.06] active:bg-white/[0.1] active:scale-[0.99] transition-all text-left group cursor-pointer border-none bg-transparent"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", option.iconBg)}>
                      <option.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold leading-tight truncate", option.color)}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-1">
            <DrawerClose asChild>
              <button 
                type="button"
                className="w-full rounded-2xl py-3.5 font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.99] transition-all cursor-pointer border-none"
              >
                Close
              </button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PlaylistOptionsModal;
