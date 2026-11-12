import React, { useState } from 'react';
import { Play, Pause, MoreVertical, Sparkles } from 'lucide-react';
import { Playlist } from '@/types';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';
import { getPlaceholderImage, cn } from '@/lib/utils';
import PlaylistCoverGenerator from './PlaylistCoverGenerator';
import PlaylistOptionsModal from './PlaylistOptionsModal';
import { motion } from 'motion/react';
import MediaCard from '@/components/common/MediaCard';

export interface PlaylistCardProps {
  playlist: Playlist;
  variant?: 'default' | 'row' | 'compact';
  onClick?: () => void;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  variant = 'default', 
  onClick, 
  className = '' 
}) => {
  const { allTracks, playlistFolders, movePlaylistToFolder, deletePlaylist, currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const navigate = useNavigate();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const isOwner = playlist.creator === MOCK_USER.name;

  // Check if any track from this playlist is currently active in audio player
  const isPlaylistActive = Boolean(
    currentTrack && playlist.trackIds && Array.isArray(playlist.trackIds) && playlist.trackIds.includes(currentTrack.id)
  );
  const isPlaylistPlaying = isPlaylistActive && isPlaying;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    if (isPlaylistActive) {
      togglePlay();
      return;
    }
    if (playlist.trackIds && playlist.trackIds.length > 0) {
      const firstTrack = allTracks.find(t => playlist.trackIds?.includes(t.id));
      if (firstTrack) {
        playTrack(firstTrack);
        return;
      }
    }
    navigate(`/playlist/${playlist.id}`);
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
  };

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
          className={`${sizeClass} object-cover transition-transform duration-500 group-hover:scale-105`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`playlist-${playlist.id}`); }}
        />
      );
    }

    if (playlistTracks.length === 0) {
      return (
        <img 
          src={getPlaceholderImage(`playlist-${playlist.id}`)} 
          className={`${sizeClass} object-cover transition-transform duration-500 group-hover:scale-105`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`playlist-${playlist.id}`); }}
        />
      );
    }

    if (playlistTracks.length < 4) {
      const track = playlistTracks[0];
      return (
        <img 
          src={track?.coverUrl || getPlaceholderImage(`track-${track?.id}`)} 
          className={`${sizeClass} object-cover transition-transform duration-500 group-hover:scale-105`} 
          alt={playlist.title}
          onError={(e) => { e.currentTarget.src = getPlaceholderImage(`track-${track?.id || 'placeholder'}`); }}
        />
      );
    }

    // 2x2 Grid for 4 or more tracks
    return (
      <div className={`${sizeClass} grid grid-cols-2 gap-0 transition-transform duration-500 group-hover:scale-105 bg-neutral-800`}>
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

  // Horizontal list row variant matching TrackCard 'row' / 'compact'
  if (variant === 'row' || variant === 'compact') {
    return (
      <>
        <motion.div 
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCardClick} 
          className={`group flex items-center gap-3 p-1.5 rounded-lg bg-transparent hover:bg-white/[0.04] transition-all cursor-pointer w-full select-none ${className}`}
          role="button"
          tabIndex={0}
        >
          <div className="relative w-11 h-11 rounded-[3px] overflow-hidden flex-shrink-0 bg-neutral-900 border-none">
            {renderCover()}
            <button 
              type="button"
              onClick={handlePlay} 
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity border-none cursor-pointer",
                isPlaylistPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              aria-label={isPlaylistPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`}
            >
              {isPlaylistPlaying ? (
                <Pause className="h-4 w-4 fill-current text-blue-400" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-[11px] font-medium leading-tight truncate transition-colors",
              isPlaylistPlaying ? "text-blue-400 font-semibold" : "text-white/90 group-hover:text-white"
            )}>
              {playlist.title}
            </h4>
            <p className="text-[9px] text-zinc-400 truncate mt-0.5 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              <span>{playlist.creator || 'TonJam Playlist'}</span>
              <span className="text-zinc-600">·</span>
              <span>{playlist.trackCount || playlist.trackIds?.length || 0} tracks</span>
            </p>
          </div>
          <button 
            type="button"
            className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 shrink-0 flex items-center justify-center transition-colors border-none cursor-pointer outline-none"
            onClick={(e) => { e.stopPropagation(); setIsOptionsModalOpen(true); }}
            aria-label="More options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
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
  }

  // Default Grid / Shelf Card Variant strictly matching TrackCard
  return (
    <>
      <MediaCard
        type="playlist"
        isActive={isPlaylistActive}
        onClick={handleCardClick}
        className={cn("snap-start", className)}
        role="button"
        tabIndex={0}
        aria-label={`View playlist: ${playlist.title}`}
        artwork={
          <>
            {renderCover()}
            
            {/* Spotify-style Floating Action Button strictly matching TrackCard */}
            <div className={cn(
              "absolute bottom-2 right-2 transition-all duration-200 z-10",
              isPlaylistPlaying 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0"
            )}>
              <button 
                type="button"
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
                onClick={handlePlay}
                aria-label={isPlaylistPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`}
              >
                {isPlaylistPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Quick Options Button on Hover */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOptionsModalOpen(true); }}
                aria-label="Playlist options"
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        }
        title={playlist.title}
        subtitle={
          <span
            className="hover:text-white cursor-pointer inline-flex items-center gap-1 truncate w-full"
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
            <span className="truncate">{playlist.creator || 'TonJam Playlist'}</span>
            <span className="text-zinc-600 shrink-0">·</span>
            <span className="shrink-0">{playlist.trackCount || playlist.trackIds?.length || 0} tracks</span>
          </span>
        }
      />

      <PlaylistCoverGenerator 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        playlist={playlist}
        tracks={playlistTracks.filter((t): t is NonNullable<typeof t> => !!t)}
      />

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

