import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Music2, Play, Shuffle, Trash2, Camera, Pencil, Check, X, Sparkles, MoreHorizontal, Send, Heart, Plus, Search } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import TrackCard from '@/components/TrackCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import PlaylistCoverGenerator from '@/components/PlaylistCoverGenerator';
import PlaylistOptionsModal from '@/components/PlaylistOptionsModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { MOCK_TRACKS } from '@/constants';
import { AnimatePresence } from 'motion/react';

import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    playlists, 
    playTrack, 
    allTracks, 
    addTrackToPlaylist,
    removeTrackFromPlaylist, 
    deletePlaylist, 
    updatePlaylist, 
    reorderTrackInPlaylist, 
    addNotification, 
    likedTrackIds, 
    userProfile, 
    toggleLikeTrack, 
    setHeaderTitle, 
    playlistFolders, 
    movePlaylistToFolder 
  } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [trackToRemove, setTrackToRemove] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddTracksOpen, setIsAddTracksOpen] = useState(false);
  const [addTrackSearchQuery, setAddTrackSearchQuery] = useState('');

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
    let currentTitle = '';
    const handleScroll = () => {
      const scrollThreshold = 300;
      const nextTitle = window.scrollY > scrollThreshold ? (playlist?.title || '') : '';
      if (nextTitle !== currentTitle) {
        currentTitle = nextTitle;
        setHeaderTitle(nextTitle);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      setHeaderTitle('');
    };
  }, [playlist?.title, setHeaderTitle]);

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

  const availableTracksToAdd = useMemo(() => {
    const combined = [...allTracks, ...MOCK_TRACKS];
    const unique = Array.from(new Map(combined.map(t => [t.id, t])).values());
    if (!addTrackSearchQuery.trim()) return unique;
    const q = addTrackSearchQuery.toLowerCase().trim();
    return unique.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q))
    );
  }, [allTracks, addTrackSearchQuery]);

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
      <PageHeader
        title="Playlist"
        showBack={true}
        rightContent={
          id !== 'liked-songs' ? (
            <button 
              onClick={() => setIsOptionsModalOpen(true)}
              className="p-2 -mr-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none"
              aria-label="Playlist options"
              title="Playlist options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          ) : null
        }
      />
      {/* Dynamic Background with Blur */}
      {playlist.coverUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-[80px]"
          style={{ backgroundImage: `url(${playlist.coverUrl})` }}
        />
      )}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-transparent to-background/90 pointer-events-none" />
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8 pt-2">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-end relative">
          
          {/* Cover Image / Collage */}
          <div className={`relative group w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-900 mx-auto md:mx-0 ${playlist.title === 'Discover Weekly' ? '' : 'shadow-[0_20px_40px_rgba(0,0,0,0.6)]'}`}>
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
                  className="w-full bg-[#111C30] rounded-xl px-4 py-3.5 text-[24px] md:text-[36px] font-bold text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-center md:text-left border-none shadow-lg"
                  placeholder="Playlist Title"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#111C30] rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none text-center md:text-left border-none shadow-lg"
                  placeholder="Add a description..."
                  rows={2}
                />
                <div className="flex gap-3 justify-center md:justify-start">
                  <button onClick={saveEditing} className="flex items-center gap-2 px-6 py-3 bg-[#00B4D8] hover:bg-[#0098EA] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[#00B4D8]/25 cursor-pointer border-none">
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button onClick={cancelEditing} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className={`text-[32px] md:text-[56px] font-black text-white tracking-tighter leading-tight mb-2 ${playlist.title === 'Discover Weekly' ? '' : 'drop-shadow-lg'}`}>{playlist.title}</h1>
                {playlist.description && (
                  <p className={`text-sm md:text-base mb-4 max-w-2xl mx-auto md:mx-0 ${playlist.title === 'Discover Weekly' ? 'text-blue-400 font-extrabold tracking-wide' : 'text-zinc-300 drop-shadow'}`}>{playlist.description}</p>
                )}
                <div className={`flex items-center justify-center md:justify-start gap-3 text-sm font-medium mb-6 ${playlist.title === 'Discover Weekly' ? 'text-blue-400/80' : 'text-zinc-400 drop-shadow'}`}>
                  <span className="font-bold text-[#00B4D8]">{playlist.creator}</span>
                  <span className="opacity-50">•</span>
                  <span>{playlistTracks.length} track{playlistTracks.length === 1 ? '' : 's'}</span>
                  {playlist.isCollaborative && (
                    <>
                      <span className="opacity-50">•</span>
                      <span className="px-3 py-1 bg-[#00B4D8]/15 text-[#00B4D8] rounded-full text-[10px] uppercase tracking-widest font-bold">Collaborative</span>
                    </>
                  )}
                </div>
              </>
            )}
            
            {!isEditing && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center mt-2 pb-2">
                <button 
                  onClick={handlePlayAll} 
                  className="w-13 h-13 flex items-center justify-center bg-[#00B4D8] hover:bg-[#0098EA] text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(0,180,216,0.4)] cursor-pointer border-none"
                  title="Play All"
                >
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </button>
                <button 
                  onClick={handleShuffle} 
                  className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white rounded-full transition-all hover:scale-105 active:scale-95 group cursor-pointer border-none"
                  title="Shuffle"
                >
                  <Shuffle className="h-4 w-4 group-active:rotate-180 transition-transform duration-500" />
                </button>

                {id !== 'liked-songs' && (
                  <button 
                    onClick={() => setIsAddTracksOpen(true)} 
                    className="px-4 py-2.5 flex items-center gap-2 bg-[#111C30] hover:bg-[#16233C] text-white rounded-full transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-wider cursor-pointer border-none shadow-md"
                    title="Add Songs"
                  >
                    <Plus className="h-4 w-4 text-[#00B4D8]" />
                    <span>Add Songs</span>
                  </button>
                )}

                <button 
                  onClick={handleShare} 
                  className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer border-none"
                  title="Share"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsLiked(!isLiked)} 
                  className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer border-none"
                  title="Like"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracks List (Edge-to-Edge) */}
        <div className="w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] -mx-4 md:-mx-8">
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
                    className="bg-transparent border-none shadow-none hover:bg-white/5 !p-4 !rounded-none"
                  />
                </div>
              </div>
            ))}
            {playlistTracks.length === 0 && (
              <div className="text-white/60 p-8 text-center bg-[#111C30] mt-4 mx-4 rounded-2xl space-y-3 shadow-md">
                <Music2 className="w-8 h-8 text-[#00B4D8] mx-auto opacity-80" />
                <p className="text-sm font-bold text-white">No tracks in this playlist yet</p>
                <p className="text-xs text-zinc-400">Search and add tracks to personalize your playlist.</p>
                {id !== 'liked-songs' && (
                  <button
                    onClick={() => setIsAddTracksOpen(true)}
                    className="px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0098EA] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
                  >
                    Find Songs to Add
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Songs to Playlist Modal */}
      {isAddTracksOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#07111F]/90 backdrop-blur-xl" onClick={() => setIsAddTracksOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0A1628] text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Songs to "{playlist.title}"</h3>
                <p className="text-[10px] text-zinc-400">Browse and add tracks directly into this playlist.</p>
              </div>
              <button
                onClick={() => setIsAddTracksOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search tracks by title, artist, or genre..."
                  value={addTrackSearchQuery}
                  onChange={(e) => setAddTrackSearchQuery(e.target.value)}
                  className="w-full bg-[#111C30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#00B4D8] border-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 custom-scrollbar min-h-[250px]">
              {availableTracksToAdd.map(t => {
                const isAlreadyAdded = playlist.trackIds?.includes(t.id);
                return (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{t.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isAlreadyAdded) {
                          removeTrackFromPlaylist(playlist.id, t.id);
                        } else {
                          addTrackToPlaylist(playlist.id, t);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1 ${
                        isAlreadyAdded
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-[#00B4D8] text-white hover:bg-[#0098EA]'
                      }`}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

