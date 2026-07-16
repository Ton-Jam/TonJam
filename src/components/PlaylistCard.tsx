import React, { useState } from 'react';
import { Play, Music, Sparkles, FolderPlus, MoreVertical, Trash2, Pencil, Folder } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';
import { getPlaceholderImage, cn } from '@/lib/utils';
import PlaylistCoverGenerator from './PlaylistCoverGenerator';
import PlaylistOptionsModal from './PlaylistOptionsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { motion } from 'motion/react';
import { cardTokens } from '@/design';


interface PlaylistCardProps {
  playlist: Playlist;
  variant?: 'default' | 'row';
  onClick?: () => void;
  className?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, variant = 'default', onClick, className = '' }) => {
  const { allTracks, playlistFolders, movePlaylistToFolder, deletePlaylist } = useAudio();
  const navigate = useNavigate();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const isOwner = playlist.creator === MOCK_USER.name;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleDelete = () => {
      deletePlaylist(playlist.id);
  }

  // Get cover images from the first 4 tracks
  const playlistTracks = (playlist.trackIds || [])
    .map(id => allTracks.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const renderCover = (sizeClass: string = "w-full h-full") => {
    if (playlist.coverUrl) {
      return (
        <img 
          src={playlist.coverUrl} 
          className={`${sizeClass} object-cover group-hover:scale-110 transition-transform duration-500`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`playlist-${playlist.id}`); }}
        />
      );
    }

    if (playlistTracks.length === 0) {
      return (
        <img 
          src={getPlaceholderImage(`playlist-${playlist.id}`)} 
          className={`${sizeClass} object-cover group-hover:scale-110 transition-transform duration-500`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`playlist-${playlist.id}`); }}
        />
      );
    }

    if (playlistTracks.length < 4) {
      // If less than 4 tracks, show the first one's cover full size
      const track = playlistTracks[0];
      return (
        <img 
          src={track?.coverUrl || getPlaceholderImage(`track-${track?.id}`)} 
          className={`${sizeClass} object-cover group-hover:scale-110 transition-transform duration-500`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track?.id || 'placeholder'}`); }}
        />
      );
    }

    // 2x2 Grid for 4 or more tracks
    return (
      <div className={`${sizeClass} grid grid-cols-2 gap-0 group-hover:scale-105 transition-transform duration-700 bg-neutral-800`}>
        {playlistTracks.map((track, i) => (
          <img 
            key={`${track?.id || 'empty'}-${i}`}
            src={track?.coverUrl || getPlaceholderImage(`track-${track?.id}`)} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track?.id || 'placeholder'}`); }}
          />
        ))}
      </div>
    );
  };

  if (variant === 'row') {
    return (
      <motion.div 
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick} 
        className={`group flex items-center gap-2 p-2 rounded-[4px] hover:bg-muted/50 transition-all cursor-pointer w-full ${className}`}
      >
        <div className="relative w-12 h-12 rounded-[4px] overflow-hidden flex-shrink-0">
          {renderCover()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-bold tracking-tight truncate text-foreground group-hover:text-primary transition-colors uppercase">
            {playlist.title}
          </h4>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest truncate">
            {playlist.creator}
          </p>
        </div>
        <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest hidden sm:block">
          {playlist.trackCount} Tracks
        </span>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div 
      whileHover={{ y: -4, scale: cardTokens.animation.hoverScale }}
      whileTap={{ scale: cardTokens.animation.tapScale }}
      onClick={onClick} 
      style={{ width: cardTokens.playlist.width, padding: cardTokens.global.padding, borderRadius: cardTokens.global.borderRadius }}
      className={cn("group relative cursor-pointer bg-[#0A113A]/50 hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between overflow-hidden", className)}
    >
      {/* Image Container - 1:1 Aspect Ratio */}
      <div className="relative aspect-square rounded-[6px] overflow-hidden bg-neutral-900 shadow-md mb-2 flex-shrink-0">
        {renderCover()}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button 
            onClick={handlePlay}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300"
          >
            <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
          </button>
          
          {isOwner && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsGeneratorOpen(true); }}
              className="w-8 h-8 rounded-full bg-neutral-800/80 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 delay-75 hover:bg-neutral-700"
              title="Generate Cover"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Generator Modal */}
      <PlaylistCoverGenerator 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        playlist={playlist}
        tracks={playlistTracks.filter((t): t is NonNullable<typeof t> => !!t)}
      />
      
      {/* Content Below Card */}
      <div className="px-0.5 flex flex-col justify-between flex-grow">
        <div>
          <h3 style={{ fontSize: cardTokens.playlist.titleSize }} className="font-bold uppercase tracking-tight truncate text-foreground group-hover:text-primary transition-colors leading-tight">
            {playlist.title}
          </h3>
          <p 
            style={{ fontSize: cardTokens.playlist.descriptionSize }}
            className="font-semibold uppercase tracking-widest text-muted-foreground truncate hover:text-foreground hover:underline cursor-pointer inline-block mt-1"
            onClick={(e) => {
              e.stopPropagation();
              const artist = MOCK_ARTISTS.find(a => a.name === playlist.creator);
              if (artist) {
                navigate(`/artist/${artist.uid}`);
              } else if (playlist.creator === MOCK_USER.name) {
                navigate('/profile');
              }
            }}
          >
            {playlist.creator}
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-1.5 mt-auto">
          <span className="text-[8px] font-semibold text-foreground/30 uppercase tracking-widest">
            {playlist.trackCount} Tracks
          </span>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 rounded-[4px] hover:bg-black/5"
            onClick={(e) => { e.stopPropagation(); setIsOptionsModalOpen(true); }}
          >
            <MoreVertical className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </motion.div>
    {isOptionsModalOpen && (
      <PlaylistOptionsModal
        playlist={playlist}
        folders={playlistFolders}
        onClose={() => setIsOptionsModalOpen(false)}
        onEdit={() => {}}
        onDelete={handleDelete}
        onMoveToFolder={(folderId) => movePlaylistToFolder(playlist.id, folderId)}
      />
    )}
    </>
  );
};

export default PlaylistCard;
