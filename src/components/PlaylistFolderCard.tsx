import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, 
  MoreHorizontal, 
  Play, 
  Pencil, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getPlaceholderImage } from '@/lib/utils';
import { PlaylistFolder, Playlist } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAudio } from '@/context/AudioContext';
import PlaylistCard from './PlaylistCard';

interface PlaylistFolderCardProps {
  folder: PlaylistFolder;
  playlists: Playlist[];
  viewMode?: 'grid' | 'list';
}

const PlaylistFolderCard: React.FC<PlaylistFolderCardProps> = ({ folder, playlists, viewMode = 'list' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { renameFolder, deleteFolder, movePlaylistToFolder } = useAudio();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(folder.title);

  const folderPlaylists = playlists.filter(p => folder.playlistIds.includes(p.id) || p.folderId === folder.id);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newTitle !== folder.title) {
      await renameFolder(folder.id, newTitle);
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the folder "${folder.title}"? Playlists inside will not be deleted.`)) {
      await deleteFolder(folder.id);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="group space-y-4">
        <motion.div
          layout
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative p-6 rounded-[4px] cursor-pointer transition-all duration-500 overflow-hidden border",
            isOpen 
              ? "bg-blue-900/20 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)]" 
              : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]"
          )}
        >
          {/* Noise background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-14 h-14 rounded-[4px] flex items-center justify-center transition-all duration-500",
                isOpen ? "bg-blue-600 shadow-lg scale-110" : "bg-white/[0.05]"
              )}>
                <Folder className={cn(
                  "w-7 h-7 transition-all",
                  isOpen ? "text-white fill-white" : "text-blue-500"
                )} />
              </div>
              
              <div className="flex items-center gap-1">
                {isOpen ? <ChevronDown className="w-5 h-5 text-blue-400" /> : <ChevronRight className="w-5 h-5 text-muted-foreground opacity-40" />}
              </div>
            </div>

            <div className="space-y-1">
              {isRenaming ? (
                <form onSubmit={handleRename} onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => setIsRenaming(false)}
                    className="w-full bg-white/10 border-b border-blue-500 outline-none p-1 text-sm font-black uppercase tracking-tighter"
                  />
                </form>
              ) : (
                <h3 className="text-lg font-black uppercase tracking-tighter text-white truncate">
                  {folder.title}
                </h3>
              )}
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                {folderPlaylists.length} Recorded Signal Nodes
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-4" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/[0.1] rounded-[4px]">
                <DropdownMenuItem onClick={() => setIsRenaming(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                  <Pencil className="h-3 w-3" /> Rename Protocol
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 cursor-pointer">
                  <Trash2 className="h-3 w-3" /> Deconstruct
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-l border-blue-500/20 ml-6 pl-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 pb-6">
                {folderPlaylists.length > 0 ? (
                  folderPlaylists.map(playlist => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border border-dashed border-white/[0.05] rounded-[4px]">
                    <Music2 className="w-8 h-8 text-white/5 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No nodes linked</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="group border-b border-white/[0.05] last:border-0">
      <motion.div
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all cursor-pointer rounded-[4px]",
          isOpen && "bg-white/[0.02]"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-[4px] flex items-center justify-center transition-all shadow-lg overflow-hidden relative",
          isOpen ? "bg-blue-600 scale-105" : "bg-white/[0.05]"
        )}>
           {/* Noise background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
          <Folder className={cn(
            "w-6 h-6 z-10",
            isOpen ? "text-white fill-white" : "text-blue-500"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <form onSubmit={handleRename} onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => setIsRenaming(false)}
                className="w-full bg-white/10 border-b border-blue-500 outline-none p-1 text-sm font-black uppercase tracking-tighter"
              />
            </form>
          ) : (
            <h4 className="text-sm font-black uppercase tracking-tighter text-white truncate">
              {folder.title}
            </h4>
          )}
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 truncate">
            {folderPlaylists.length} Recorded Signal Nodes
          </p>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/[0.1] rounded-[4px]">
              <DropdownMenuItem onClick={() => setIsRenaming(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                <Pencil className="h-3 w-3" /> Rename Protocol
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={handleDelete} className="gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 cursor-pointer">
                <Trash2 className="h-3 w-3" /> Deconstruct
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-8 h-8 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/[0.01] border-l-2 border-blue-600/30 ml-10 pl-2 pr-4 py-2 space-y-1"
          >
            {folderPlaylists.length > 0 ? (
              folderPlaylists.map(playlist => (
                <div key={playlist.id} className="scale-95 origin-left">
                  <div className="flex items-center gap-3 p-2 hover:bg-white/[0.03] rounded-[4px] cursor-pointer group/item" 
                       onClick={() => navigate(`/playlist/${playlist.id}`)}>
                    <img src={playlist.coverUrl || getPlaceholderImage(playlist.title)} alt={playlist.title} 
                         className="w-10 h-10 rounded-[4px] object-cover border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tighter text-white/80 truncate">{playlist.title}</p>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{playlist.trackCount || 0} Signals</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/item:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              movePlaylistToFolder(playlist.id, null);
                            }}>
                      <Trash2 className="h-3.5 w-3.5 text-zinc-600" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">No linked nodes in this sector</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistFolderCard;
