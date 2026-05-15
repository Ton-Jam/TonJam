import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Music2, Play, Shuffle, Trash2, Camera, Pencil, Check, X, Sparkles, MoreHorizontal, Send, Heart } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import PlaylistCoverGenerator from '@/components/PlaylistCoverGenerator';
import PlaylistOptionsModal from '@/components/PlaylistOptionsModal';
import { MOCK_TRACKS } from '@/constants';
import { AnimatePresence } from 'motion/react';

import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, playTrack, allTracks, removeTrackFromPlaylist, deletePlaylist, updatePlaylist, reorderTrackInPlaylist, addNotification, likedTrackIds, userProfile, toggleLikeTrack, setHeaderTitle, playlistFolders, movePlaylistToFolder } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playlist = useMemo(() => {
    if (id === 'liked-songs') {
      return {
        id: 'liked-songs',
        title: 'Liked Tracks',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a49b73b2?q=80&w=600&auto=format&fit=crop',
        trackCount: likedTrackIds.length,
        creator: userProfile?.name || 'You',
        description: 'Your favorite tracks, updated automatically.',
        trackIds: likedTrackIds,
        isPrivate: true,
      };
    }
    return playlists.find(p => p.id === id);
  }, [playlists, id, likedTrackIds, userProfile]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300;
      if (window.scrollY > scrollThreshold) {
        setHeaderTitle(playlist?.title || '');
      } else {
        setHeaderTitle('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setHeaderTitle('');
    };
  }, [playlist?.title, setHeaderTitle]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [trackToRemove, setTrackToRemove] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const playlistTracks = useMemo(() => {
    if (!playlist || !playlist.trackIds) return [];
    /* Combine user tracks and mock tracks to find the playlist tracks */
    const tracks = [...allTracks, ...MOCK_TRACKS];
    /* Filter duplicates if any */
    const uniqueTracks = Array.from(new Map(tracks.map(item => [item.id, item])).values());
    
    // Map over trackIds to preserve the exact order of the playlist
    return playlist.trackIds
      .map(id => uniqueTracks.find(track => track.id === id))
      .filter((track): track is NonNullable<typeof track> => track !== undefined);
  }, [playlist, allTracks]);

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0]);
      /* Ideally we would queue the rest of the tracks here */
    }
  };

  const handleShuffle = () => {
    if (playlistTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlistTracks.length);
      playTrack(playlistTracks[randomIndex]);
      /* Ideally enable shuffle mode in context */
    }
  };

  const handleDeletePlaylist = () => {
    setIsDeletePlaylistModalOpen(true);
  };

  const confirmDeletePlaylist = () => {
    if (playlist) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setTrackToRemove(trackId);
  };

  const confirmRemoveTrack = () => {
    if (playlist && trackToRemove) {
      removeTrackFromPlaylist(playlist.id, trackToRemove);
      setTrackToRemove(null);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && playlist) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      updatePlaylist(playlist.id, { coverUrl: imageUrl });
    }
  };

  const startEditing = () => {
    if (playlist) {
      setEditTitle(playlist.title);
      setEditDescription(playlist.description || '');
      setIsEditing(true);
    }
  };

  const saveEditing = () => {
    if (playlist && editTitle.trim()) {
      updatePlaylist(playlist.id, { 
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleMoveTrack = (e: React.MouseEvent, trackId: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (playlist) {
      reorderTrackInPlaylist(playlist.id, trackId, direction);
    }
  };

  const handleTrackClick = (trackId: string) => {
    const track = playlistTracks.find(t => t.id === trackId);
    if (track) playTrack(track);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: playlist?.title,
          text: `Check out this playlist: ${playlist?.title} on TonJam!`,
          url: window.location.href,
        });
      } else {
        addNotification("Share not supported on this browser", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <h2 className="text-[20px] font-bold mb-4">Playlist not found</h2>
        <button onClick={() => navigate('/')} className="px-4 py-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
          Go Home
        </button>
      </div>
    );
  }

  /* Get up to 4 cover images for the collage */
  const coverImages = playlistTracks.slice(0, 4).map(t => t.coverUrl || getPlaceholderImage(`track-${t.id}`)).filter(Boolean);
  /* Fill remaining spots with placeholders if less than 4 */
  while (coverImages.length < 4) {
    coverImages.push(getPlaceholderImage(`playlist-slot-${playlist.id}-${coverImages.length}`));
  }

  return (
    <div className="min-h-screen pb-4 relative overflow-hidden bg-background">
      {/* Dynamic Background with Blur */}
      {playlist.coverUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-[80px]"
          style={{ backgroundImage: `url(${playlist.coverUrl})` }}
        />
      )}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-transparent to-background/90" />
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8 pt-12 md:pt-16">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-end relative">
          {id !== 'liked-songs' && (
            <button 
              onClick={() => setIsOptionsModalOpen(true)}
              className="absolute top-0 right-0 md:top-4 md:right-4 p-2 rounded-full hover:bg-blue-500/10 transition-colors text-blue-500 z-20"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          )}
          
          {/* Cover Image / Collage */}
          <div className="relative group w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] bg-neutral-900 mx-auto md:mx-0">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid grid-cols-2 gap-1 bg-neutral-800">
                {coverImages.slice(0, 4).map((img, idx) => (
                  <div key={`cover-${idx}`} className="w-full h-full relative bg-neutral-900 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Music2 className="h-8 w-8 text-blue-500/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Overlay */}
            {id !== 'liked-songs' && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                <div className="flex flex-col gap-4 items-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                  >
                    <Camera className="h-8 w-8 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Upload</span>
                  </button>
                  <div className="w-12 h-[1px] bg-white/20"></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsGeneratorOpen(true); }}
                    className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
                  >
                    <Sparkles className="h-8 w-8 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Generate</span>
                  </button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCoverUpload} 
              accept={ALLOWED_IMAGE_TYPES.join(',')} 
              className="hidden" 
            />
          </div>

          <div className="flex flex-col justify-end flex-1 w-full text-center md:text-left mt-4 md:mt-0">
            {isEditing ? (
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-lg px-4 py-4 text-[24px] md:text-[36px] font-bold text-white placeholder-white/40 focus:outline-none focus:border-blue-500 text-center md:text-left shadow-inner"
                  placeholder="Playlist Title"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-lg px-4 py-4 text-sm text-neutral-300 focus:outline-none focus:border-blue-500 resize-none text-center md:text-left shadow-inner"
                  placeholder="Add a description..."
                  rows={2}
                />
                <div className="flex gap-4 justify-center md:justify-start">
                  <button onClick={saveEditing} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-blue-500/25">
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button onClick={cancelEditing} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-[32px] md:text-[56px] font-black text-blue-500 tracking-tighter leading-tight drop-shadow-lg mb-2">{playlist.title}</h1>
                {playlist.description && (
                  <p className="text-blue-200/70 text-sm md:text-base mb-4 max-w-2xl mx-auto md:mx-0 drop-shadow">{playlist.description}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-3 text-blue-100/60 text-sm font-medium mb-6 drop-shadow">
                  <span className="font-bold text-blue-400">{playlist.creator}</span>
                  <span className="opacity-50">•</span>
                  <span>{playlistTracks.length} tracks</span>
                  {playlist.isCollaborative && (
                    <>
                      <span className="opacity-50">•</span>
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] uppercase tracking-widest font-bold backdrop-blur-sm">Collaborative</span>
                    </>
                  )}
                </div>
              </>
            )}
            
            {!isEditing && (
              <div className="flex gap-4 justify-center md:justify-start items-center mt-2 pb-2">
                <button 
                  onClick={handlePlayAll} 
                  className="w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
                  title="Play All"
                >
                  <Play className="h-6 w-6 fill-current ml-1" />
                </button>
                <button 
                  onClick={handleShuffle} 
                  className="w-12 h-12 flex items-center justify-center bg-blue-500/10 backdrop-blur-md hover:bg-blue-500/20 text-blue-400 rounded-full transition-all hover:scale-105 active:scale-95 group border border-blue-500/20"
                  title="Shuffle"
                >
                  <Shuffle className="h-5 w-5 group-active:rotate-180 transition-transform duration-500" />
                </button>
                <button 
                  onClick={handleShare} 
                  className="w-12 h-12 flex items-center justify-center bg-blue-500/10 backdrop-blur-md hover:bg-blue-500/20 text-blue-400 rounded-full transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
                  title="Share"
                >
                  <Send className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsLiked(!isLiked)} 
                  className="w-12 h-12 flex items-center justify-center bg-blue-500/10 backdrop-blur-md hover:bg-blue-500/20 text-blue-400 rounded-full transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
                  title="Like"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracks List (Edge-to-Edge) */}
        <div className="px-0 md:px-0">
          <div className="flex flex-col gap-0.5">
            {playlistTracks.map((track, index) => (
              <div 
                key={`${track.id}-${index}`} 
                className="w-full flex items-center transition-all group"
                onClick={() => handleTrackClick(track.id)}
              >
                <div className="flex-1 min-w-0">
                  <TrackCard 
                    track={track} 
                    variant="row" 
                    onRemove={
                      id === 'liked-songs' 
                        ? () => toggleLikeTrack(track.id)
                        : () => handleRemoveTrack(null as any, track.id)
                    }
                    onMoveUp={id !== 'liked-songs' && index > 0 ? () => handleMoveTrack(null as any, track.id, 'up') : undefined}
                    onMoveDown={id !== 'liked-songs' && index < playlistTracks.length - 1 ? () => handleMoveTrack(null as any, track.id, 'down') : undefined}
                    className="bg-transparent border-none shadow-none hover:bg-white/5 !p-2 !rounded-none"
                  />
                </div>
              </div>
            ))}
            {playlistTracks.length === 0 && (
              <div className="text-white/40 p-8 text-center bg-white/5 border border-white/5 mt-4 mx-4 rounded-xl">
                No tracks in this playlist yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeletePlaylistModalOpen}
        onClose={() => setIsDeletePlaylistModalOpen(false)}
        onConfirm={confirmDeletePlaylist}
        title="Delete Playlist?"
        description="Are you sure you want to delete this playlist? This action cannot be undone and all track associations will be lost."
        confirmText="Delete Playlist"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={!!trackToRemove}
        onClose={() => setTrackToRemove(null)}
        onConfirm={confirmRemoveTrack}
        title="Remove Track?"
        description="Are you sure you want to remove this track from the playlist?"
        confirmText="Remove Track"
        variant="destructive"
      />

      <PlaylistCoverGenerator 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        playlist={playlist}
        tracks={playlistTracks}
      />

      <AnimatePresence>
        {isOptionsModalOpen && (
          <PlaylistOptionsModal
            playlist={playlist}
            folders={playlistFolders}
            onClose={() => setIsOptionsModalOpen(false)}
            onEdit={startEditing}
            onDelete={handleDeletePlaylist}
            onMoveToFolder={(folderId) => movePlaylistToFolder(playlist.id, folderId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistDetail;

