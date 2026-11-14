import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Trash2, 
  Camera, 
  Pencil, 
  Check, 
  X, 
  Sparkles, 
  MoreHorizontal, 
  Send, 
  Heart, 
  Plus, 
  Search,
  Music2,
  Clock,
  Share2,
  Volume2
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import PlaylistCoverGenerator from '@/components/PlaylistCoverGenerator';
import PlaylistOptionsModal from '@/components/PlaylistOptionsModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES, cn } from '@/lib/utils';
import { Track } from '@/types';

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    playlists, 
    playTrack, 
    currentTrack,
    isPlaying,
    allTracks, 
    addTrackToPlaylist,
    removeTrackFromPlaylist, 
    deletePlaylist, 
    updatePlaylist, 
    addNotification, 
    likedTrackIds, 
    userProfile, 
    toggleLikeTrack, 
    setHeaderTitle, 
    playlistFolders, 
    movePlaylistToFolder,
    setOptionsTrack
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
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [isSearchingInPlaylist, setIsSearchingInPlaylist] = useState(false);

  const playlist = useMemo(() => {
    if (id === 'liked-songs') {
      return {
        id: 'liked-songs',
        title: 'Liked Tracks',
        coverUrl: getPlaceholderImage('playlist-liked'),
        trackCount: likedTrackIds.length,
        creator: userProfile?.name || 'You',
        description: 'Your favorite tracks, updated automatically as you like songs.',
        trackIds: likedTrackIds,
        isPrivate: true,
      };
    }
    return playlists.find(p => p.id === id);
  }, [playlists, id, likedTrackIds, userProfile]);

  React.useEffect(() => {
    let currentTitle = '';
    const handleScroll = () => {
      const scrollThreshold = 260;
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
    const tracks = [...allTracks];
    const uniqueTracks = Array.from(new Map(tracks.map(item => [item.id, item])).values());
    
    return playlist.trackIds
      .map(trackId => uniqueTracks.find(track => track.id === trackId))
      .filter((track): track is NonNullable<typeof track> => track !== undefined);
  }, [playlist, allTracks]);

  const filteredPlaylistTracks = useMemo(() => {
    if (!playlistSearchQuery.trim()) return playlistTracks;
    const q = playlistSearchQuery.toLowerCase().trim();
    return playlistTracks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q))
    );
  }, [playlistTracks, playlistSearchQuery]);

  const totalDurationFormatted = useMemo(() => {
    const totalSeconds = playlistTracks.reduce((acc, t) => {
      const dur = typeof t.duration === 'number' ? t.duration : parseInt(t.duration || '0', 10);
      return acc + (isNaN(dur) ? 0 : dur);
    }, 0);
    if (totalSeconds <= 0) return '';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min ${seconds} sec`;
  }, [playlistTracks]);

  const isPlaylistPlaying = useMemo(() => {
    return isPlaying && currentTrack && playlistTracks.some(t => t.id === currentTrack.id);
  }, [isPlaying, currentTrack, playlistTracks]);

  const availableTracksToAdd = useMemo(() => {
    const combined = [...allTracks];
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
    if (filteredPlaylistTracks.length > 0) {
      if (isPlaylistPlaying) {
        // Toggle play state via playTrack on current or next
        playTrack(filteredPlaylistTracks[0]);
      } else {
        playTrack(filteredPlaylistTracks[0]);
        toast.success(`Playing ${playlist?.title}`);
      }
    }
  };

  const handleShuffle = () => {
    if (filteredPlaylistTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredPlaylistTracks.length);
      playTrack(filteredPlaylistTracks[randomIndex]);
      toast.success('Shuffling playlist');
    }
  };

  const handleDeletePlaylist = () => {
    setIsDeletePlaylistModalOpen(true);
  };

  const confirmDeletePlaylist = () => {
    if (playlist) {
      deletePlaylist(playlist.id);
      toast.success('Playlist deleted');
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
      toast.success('Track removed from playlist');
      setTrackToRemove(null);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && playlist) {
      const validation = validateFile(file, 'image', 10);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      updatePlaylist(playlist.id, { coverUrl: imageUrl });
      toast.success('Cover artwork updated');
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
      toast.success('Playlist details saved');
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleTrackClick = (track: Track) => {
    playTrack(track);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/playlist/${playlist?.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: playlist?.title,
          text: `Check out "${playlist?.title}" on TonJam!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Playlist link copied to clipboard');
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Playlist link copied to clipboard');
    }
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <h2 className="text-xl font-bold mb-3">Playlist not found</h2>
        <p className="text-sm text-slate-400 mb-6">This playlist might have been deleted or moved.</p>
        <button 
          onClick={() => navigate('/library')} 
          className="px-6 py-3 bg-[#00B4D8] hover:bg-[#0098EA] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none"
        >
          Back to Library
        </button>
      </div>
    );
  }

  // Cover image / collage calculation
  const coverImages = playlistTracks.slice(0, 4).map(t => t.coverUrl || getPlaceholderImage(`track-${t.id}`)).filter(Boolean);
  while (coverImages.length < 4) {
    coverImages.push(getPlaceholderImage(`playlist-slot-${playlist.id}-${coverImages.length}`));
  }

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden bg-transparent select-none">
      
      {/* Ambient Blurred Artwork Backdrop with Smooth Gradient Transition */}
      <div className="absolute top-0 left-0 w-full h-[650px] z-0 overflow-hidden pointer-events-none">
        {playlist.coverUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-30 transition-all duration-1000 ease-out"
            style={{ backgroundImage: `url(${playlist.coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e285a]/40 via-[#0e285a]/80 to-[#0e285a]" />
      </div>

      <PageHeader
        title="Playlist"
        showBack={true}
        transparent={true}
        rightContent={
          <div className="flex items-center gap-1.5">
            {playlistTracks.length > 3 && (
              <button
                onClick={() => setIsSearchingInPlaylist(!isSearchingInPlaylist)}
                className="w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none bg-transparent"
                title="Search in playlist"
                aria-label="Search in playlist"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none bg-transparent"
              title="Share Playlist"
              aria-label="Share Playlist"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {id !== 'liked-songs' && (
              <button 
                onClick={() => setIsOptionsModalOpen(true)}
                className="w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none bg-transparent"
                aria-label="Playlist options"
                title="Playlist options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>
        }
      />

      <div className="relative z-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto pt-2">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end mb-8 pt-2">
          
          {/* Cover Artwork Container */}
          <div className="relative group w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 shrink-0 rounded-3xl overflow-hidden bg-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {playlist.coverUrl ? (
              <img 
                src={playlist.coverUrl} 
                alt={playlist.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-black/30">
                {coverImages.slice(0, 4).map((img, idx) => (
                  <div key={`cover-${idx}`} className="w-full h-full relative bg-black/40 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="h-7 w-7 text-[#00B4D8]/30" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload & AI Generation Overlay */}
            {id !== 'liked-songs' && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-xs p-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="w-full max-w-[160px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                >
                  <Camera className="w-4 h-4 text-[#00B4D8]" />
                  <span>Upload Image</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsGeneratorOpen(true); }}
                  className="w-full max-w-[160px] py-2 px-3 rounded-xl bg-[#00B4D8] hover:bg-[#0098EA] active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-lg shadow-[#00B4D8]/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generate</span>
                </button>
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

          {/* Playlist Info & Editing */}
          <div className="flex-1 w-full text-center md:text-left min-w-0">
            {isEditing ? (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-2xl md:text-3xl font-bold text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] text-center md:text-left border-none"
                  placeholder="Playlist Title"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] resize-none text-center md:text-left border-none"
                  placeholder="Add an optional description..."
                  rows={2}
                />
                <div className="flex gap-2.5 justify-center md:justify-start pt-1">
                  <button 
                    onClick={saveEditing} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00B4D8] hover:bg-[#0098EA] active:scale-95 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md shadow-[#00B4D8]/30"
                  >
                    <Check className="h-4 w-4" /> 
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={cancelEditing} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none"
                  >
                    <X className="h-4 w-4" /> 
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-[#00B4D8] mb-1.5">
                  <span>{playlist.isPrivate ? 'Private Playlist' : 'Public Playlist'}</span>
                  {playlist.isCollaborative && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-400">Collaborative</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-sm truncate">
                  {playlist.title}
                </h1>

                {playlist.description && (
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-3 max-w-2xl mx-auto md:mx-0">
                    {playlist.description}
                  </p>
                )}

                {/* Unboxed Metadata with Typographic Separators */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-slate-300 mb-6">
                  <span 
                    onClick={() => {
                      if (playlist.creator === userProfile?.name) {
                        navigate('/profile');
                      }
                    }}
                    className="font-bold text-white hover:text-[#00B4D8] transition-colors cursor-pointer"
                  >
                    {playlist.creator}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span>{playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}</span>
                  {totalDurationFormatted && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{totalDurationFormatted}</span>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Action Bar */}
            {!isEditing && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                
                {/* Large Vibrant Play Button */}
                <button 
                  onClick={handlePlayAll} 
                  className="w-14 h-14 flex items-center justify-center bg-[#00B4D8] hover:bg-[#0098EA] active:scale-95 text-white rounded-full transition-all shadow-[0_8px_28px_rgba(0,180,216,0.4)] cursor-pointer border-none"
                  title={isPlaylistPlaying ? "Pause" : "Play Playlist"}
                  aria-label={isPlaylistPlaying ? "Pause Playlist" : "Play Playlist"}
                >
                  {isPlaylistPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* Shuffle Button */}
                <button 
                  onClick={handleShuffle} 
                  className="w-11 h-11 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-slate-200 hover:text-white rounded-full transition-all cursor-pointer border-none"
                  title="Shuffle Playlist"
                  aria-label="Shuffle Playlist"
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                {/* Add Songs Button */}
                {id !== 'liked-songs' && (
                  <button 
                    onClick={() => setIsAddTracksOpen(true)} 
                    className="px-4 py-2.5 flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-white rounded-full transition-all text-xs font-bold uppercase tracking-wider cursor-pointer border-none"
                    title="Add Songs"
                  >
                    <Plus className="h-4 w-4 text-[#00B4D8]" />
                    <span>Add Songs</span>
                  </button>
                )}

                {/* Edit Button */}
                {id !== 'liked-songs' && (
                  <button 
                    onClick={startEditing} 
                    className="w-11 h-11 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-slate-200 hover:text-white rounded-full transition-all cursor-pointer border-none"
                    title="Edit Playlist"
                    aria-label="Edit Playlist"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}

                {/* Favorite / Like Button */}
                <button 
                  onClick={() => {
                    setIsLiked(!isLiked);
                    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
                  }} 
                  className="w-11 h-11 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 rounded-full transition-all cursor-pointer border-none text-slate-200 hover:text-white"
                  title="Like Playlist"
                  aria-label="Like Playlist"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* More Options Button */}
                {id !== 'liked-songs' && (
                  <button 
                    onClick={() => setIsOptionsModalOpen(true)} 
                    className="w-11 h-11 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-slate-200 hover:text-white rounded-full transition-all cursor-pointer border-none"
                    title="More Options"
                    aria-label="More Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar within Playlist (when active) */}
        {isSearchingInPlaylist && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={playlistSearchQuery}
                onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                placeholder="Find in playlist..."
                className="w-full bg-white/[0.06] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] border-none"
                autoFocus
              />
              {playlistSearchQuery && (
                <button
                  onClick={() => setPlaylistSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tracks List Header (Desktop Column Indicators) */}
        {filteredPlaylistTracks.length > 0 && (
          <div className="hidden sm:grid grid-cols-[36px_1fr_180px_70px_44px] gap-4 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none mb-1">
            <span className="text-center">#</span>
            <span>Title</span>
            <span>Album / Genre</span>
            <span className="text-right flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-right"></span>
          </div>
        )}

        {/* Tracks Rows */}
        <div className="space-y-1">
          {filteredPlaylistTracks.map((track, index) => {
            const isTrackActive = currentTrack?.id === track.id;
            const isTrackLiked = likedTrackIds.includes(track.id);

            // Format track duration
            const trackDurSec = typeof track.duration === 'number' ? track.duration : parseInt(track.duration || '0', 10);
            const durMin = Math.floor(trackDurSec / 60);
            const durSec = trackDurSec % 60;
            const formattedDur = !isNaN(durMin) ? `${durMin}:${durSec.toString().padStart(2, '0')}` : '--:--';

            return (
              <div 
                key={`${track.id}-${index}`}
                onClick={() => handleTrackClick(track)}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 p-2.5 sm:px-4 sm:py-3 rounded-2xl transition-all group cursor-pointer border-none",
                  isTrackActive ? "bg-white/[0.1]" : "hover:bg-white/[0.05] bg-transparent"
                )}
              >
                {/* Index / Play indicator */}
                <div className="w-7 sm:w-8 shrink-0 flex items-center justify-center text-center">
                  {isTrackActive && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4 text-[#00B4D8]">
                      <span className="w-0.5 h-full bg-[#00B4D8] animate-pulse" />
                      <span className="w-0.5 h-2/3 bg-[#00B4D8] animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-5/6 bg-[#00B4D8] animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-slate-400 group-hover:hidden">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTrackClick(track); }}
                        className="hidden group-hover:flex items-center justify-center text-white cursor-pointer border-none bg-transparent"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-[#00B4D8]" />
                      </button>
                    </>
                  )}
                </div>

                {/* Track Cover Artwork */}
                <img 
                  src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} 
                  alt={track.title} 
                  className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm"
                />

                {/* Title & Artist */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className={cn(
                    "text-xs sm:text-sm font-semibold truncate leading-tight",
                    isTrackActive ? "text-[#00B4D8]" : "text-white"
                  )}>
                    {track.title}
                  </p>
                  <p 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (track.artistId) navigate(`/artist/${track.artistId}`);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors truncate mt-0.5 cursor-pointer"
                  >
                    {track.artist}
                  </p>
                </div>

                {/* Album / Genre (hidden on small screens) */}
                <div className="hidden sm:block w-[180px] shrink-0 text-xs text-slate-400 truncate">
                  {track.genre || (track as any).album || 'Single'}
                </div>

                {/* Duration */}
                <div className="w-[60px] sm:w-[70px] shrink-0 text-right font-mono text-xs text-slate-400">
                  {formattedDur}
                </div>

                {/* Actions: Like & Options */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                    title={isTrackLiked ? "Unlike" : "Like"}
                  >
                    <Heart className={cn("w-4 h-4", isTrackLiked ? "fill-rose-500 text-rose-500" : "")} />
                  </button>

                  {id !== 'liked-songs' && (
                    <button
                      onClick={(e) => handleRemoveTrack(e, track.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsTrack(track, { 
                        onRemove: id !== 'liked-songs' ? () => confirmRemoveTrack() : undefined 
                      });
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                    title="Track Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredPlaylistTracks.length === 0 && (
            <div className="py-14 px-6 text-center bg-white/[0.03] rounded-3xl mt-4 space-y-3">
              <Music2 className="w-10 h-10 text-[#00B4D8] mx-auto opacity-70" />
              <p className="text-sm font-bold text-white">
                {playlistSearchQuery ? `No tracks matching "${playlistSearchQuery}"` : 'No tracks in this playlist yet'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {playlistSearchQuery ? 'Try searching with a different term' : 'Search and add songs to build your personalized TonJam collection.'}
              </p>
              {id !== 'liked-songs' && !playlistSearchQuery && (
                <button
                  onClick={() => setIsAddTracksOpen(true)}
                  className="px-6 py-2.5 bg-[#00B4D8] hover:bg-[#0098EA] active:scale-95 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none shadow-md shadow-[#00B4D8]/30"
                >
                  Add Songs to Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Songs to Playlist Modal */}
      {isAddTracksOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsAddTracksOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0B1528] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border-none">
            
            {/* Modal Header */}
            <div className="p-5 flex items-center justify-between pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add Songs to "{playlist.title}"</h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore your library and catalog tracks</p>
              </div>
              <button
                onClick={() => setIsAddTracksOpen(false)}
                className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tracks by title, artist, or genre..."
                  value={addTrackSearchQuery}
                  onChange={(e) => setAddTrackSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.06] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] border-none"
                  autoFocus
                />
                {addTrackSearchQuery && (
                  <button
                    onClick={() => setAddTrackSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Track Results List */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1.5 custom-scrollbar min-h-[260px]">
              {availableTracksToAdd.map(t => {
                const isAlreadyAdded = playlist.trackIds?.includes(t.id);
                return (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate leading-tight">{t.title}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isAlreadyAdded) {
                          removeTrackFromPlaylist(playlist.id, t.id);
                          toast.info(`Removed "${t.title}"`);
                        } else {
                          addTrackToPlaylist(playlist.id, t);
                          toast.success(`Added "${t.title}"`);
                        }
                      }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1.5 shrink-0",
                        isAlreadyAdded
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-[#00B4D8] text-white hover:bg-[#0098EA] active:scale-95 shadow-md shadow-[#00B4D8]/20'
                      )}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
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
        description="Are you sure you want to delete this playlist? This action cannot be undone."
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
