import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Music2, Play, Shuffle, Trash2, MinusCircle, Camera, Pencil, Check, X, GripVertical, ChevronUp, ChevronDown, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import { MOCK_TRACKS } from '@/constants';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, playTrack, allTracks, removeTrackFromPlaylist, deletePlaylist, updatePlaylist, reorderTrackInPlaylist } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string>('All');
  const [filterMood, setFilterMood] = useState<string>('All');
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const playlist = useMemo(() => {
    return playlists.find(p => p.id === id);
  }, [playlists, id]);

  const playlistTracks = useMemo(() => {
    if (!playlist || !playlist.trackIds) return [];
    /* Combine user tracks and mock tracks to find the playlist tracks */
    const tracks = [...allTracks, ...MOCK_TRACKS];
    /* Filter duplicates if any */
    const uniqueTracks = Array.from(new Map(tracks.map(item => [item.id, item])).values());
    
    // Map over trackIds to preserve the exact order of the playlist
    const playlistTracks = playlist.trackIds
      .map(id => uniqueTracks.find(track => track.id === id))
      .filter((track): track is NonNullable<typeof track> => track !== undefined);
      
    return playlistTracks.filter(track => {
      const genreMatch = filterGenre === 'All' || track.genre === filterGenre;
      const moodMatch = filterMood === 'All' || track.mood === filterMood;
      return genreMatch && moodMatch;
    });
  }, [playlist, allTracks, filterGenre, filterMood]);

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
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist!.id);
      navigate('/library');
    }
  };

  const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (window.confirm("Remove this track from playlist?")) {
      removeTrackFromPlaylist(playlist!.id, trackId);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && playlist) {
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

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev => {
      const newSelection = prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId];
      
      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      return newSelection;
    });
  };

  const handleTrackClick = (trackId: string) => {
    if (isSelectionMode) {
      toggleTrackSelection(trackId);
    } else {
      // Regular click behavior (e.g., play track)
      const track = playlistTracks.find(t => t.id === trackId);
      if (track) playTrack(track);
    }
  };

  const handleTouchStart = (trackId: string) => {
    if (isSelectionMode) return;
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedTrackIds([trackId]);
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600); // 600ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const toggleSelectAll = () => {
    if (selectedTrackIds.length === playlistTracks.length) {
      setSelectedTrackIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedTrackIds(playlistTracks.map(t => t.id));
      setIsSelectionMode(true);
    }
  };

  const handleBulkRemove = () => {
    if (playlist && selectedTrackIds.length > 0) {
      selectedTrackIds.forEach(trackId => {
        removeTrackFromPlaylist(playlist.id, trackId);
      });
      setSelectedTrackIds([]);
      setIsSelectionMode(false);
      setShowConfirmModal(false);
    }
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground">
        <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
          Go Home
        </button>
      </div>
    );
  }

  /* Get up to 4 cover images for the collage */
  const coverImages = playlistTracks.slice(0, 4).map(t => t.coverUrl).filter(Boolean);
  /* Fill remaining spots with placeholders if less than 4 */
  while (coverImages.length < 4) {
    coverImages.push(''); /* Empty string will trigger fallback */
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-20 px-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-end bg-gradient-to-b from-blue-900/20 to-background p-8 rounded-3xl">
        {/* Cover Image / Collage */}
        <div className="relative group w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-neutral-900 border border-white/10 mx-auto md:mx-0">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-neutral-800">
              {coverImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className="w-full h-full relative bg-neutral-900 flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Overlay */}
          <div 
            className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-foreground mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Change Cover</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCoverUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex flex-col justify-end flex-1 w-full text-center md:text-left">
          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-muted border border-border/80 rounded-lg px-4 py-2 text-2xl md:text-4xl font-bold text-foreground focus:outline-none focus:border-blue-500 text-center md:text-left"
                placeholder="Playlist Title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-muted border border-border/80 rounded-lg px-4 py-2 text-sm text-muted-foreground/90 focus:outline-none focus:border-blue-500 resize-none text-center md:text-left"
                placeholder="Add a description..."
                rows={3}
              />
              <div className="flex gap-2 justify-center md:justify-start">
                <button onClick={saveEditing} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all">
                  <Check className="h-3 w-3" /> Save
                </button>
                <button onClick={cancelEditing} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all">
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="group flex items-start justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{playlist.title}</h1>
                <button onClick={startEditing} className="mt-2 text-neutral-400 hover:text-white transition-all" title="Edit Playlist">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              {playlist.description && (
                <p className="text-neutral-300 text-sm mb-4 max-w-2xl mx-auto md:mx-0">{playlist.description}</p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-300 text-xs font-medium mb-6">
                <span className="font-bold text-white">{playlist.creator}</span>
                <span>•</span>
                <span>{playlistTracks.length} tracks</span>
              </div>
            </>
          )}
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button onClick={handlePlayAll} className="flex items-center gap-1.5 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Play className="h-4 w-4 fill-current" /> Play
            </button>
            <button onClick={handleShuffle} className="flex items-center gap-1.5 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button onClick={handleDeletePlaylist} className="flex items-center gap-1.5 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95" title="Delete Playlist">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar */}
      {isSelectionMode && playlistTracks.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-2 py-2 bg-blue-500/10 rounded-xl border border-neutral-500/20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/90 hover:text-foreground transition-colors"
            >
              {selectedTrackIds.length === playlistTracks.length ? (
                <CheckSquare className="h-3 w-3 text-blue-500" />
              ) : (
                <Square className="h-3 w-3" />
              )}
              {selectedTrackIds.length === playlistTracks.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">
              {selectedTrackIds.length} Selected
            </span>
            <button 
              onClick={() => { setIsSelectionMode(false); setSelectedTrackIds([]); }}
              className="ml-1 text-[8px] text-muted-foreground hover:text-foreground uppercase font-bold tracking-widest"
            >
              Cancel
            </button>
          </div>
          
          <button 
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-full font-bold text-[8px] uppercase tracking-widest transition-all"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      )}

      {/* Filter Bar */}
      {!isSelectionMode && (
        <div className="flex items-center gap-4 mb-6">
          <select 
            value={filterGenre} 
            onChange={(e) => setFilterGenre(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Genres</option>
            {Array.from(new Set(playlistTracks.map(t => t.genre))).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select 
            value={filterMood} 
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Moods</option>
            {Array.from(new Set(playlistTracks.map(t => t.mood || 'Unknown'))).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}

      {/* Track List Header */}
      <div className="flex items-center gap-4 px-4 py-2 text-neutral-400 text-xs uppercase tracking-wider border-b border-white/10 mb-2">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-24 text-right hidden sm:block">Duration</div>
        <div className="w-16"></div>
      </div>

      <div className="flex flex-col gap-2 pb-8">
        {playlistTracks.map((track, index) => (
          <div 
            key={track.id} 
            className={`w-full flex items-center gap-2 group rounded-[10px] pr-2 transition-all border ${selectedTrackIds.includes(track.id) ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-muted/50 border-blue-500/30'}`}
            onClick={() => handleTrackClick(track.id)}
            onMouseDown={() => handleTouchStart(track.id)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={() => handleTouchStart(track.id)}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-center w-10 h-10 flex-shrink-0 cursor-pointer">
              {isSelectionMode ? (
                selectedTrackIds.includes(track.id) ? (
                  <CheckSquare className="h-3 w-3 text-blue-500" />
                ) : (
                  <Square className="h-3 w-3 text-muted-foreground/50" />
                )
              ) : (
                <span className="text-muted-foreground font-mono text-xs">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pointer-events-none">
              <TrackCard track={track} variant="row" />
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMoveTrack(e, track.id, 'up'); }} 
                  disabled={index === 0}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all"
                  title="Move Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleMoveTrack(e, track.id, 'down'); }} 
                  disabled={index === playlistTracks.length - 1}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all"
                  title="Move Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              <button onClick={(e) => { e.stopPropagation(); handleRemoveTrack(e, track.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all" title="Remove from playlist">
                <MinusCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {playlistTracks.length === 0 && (
          <div className="text-muted-foreground italic p-4">No tracks in this playlist yet.</div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative bg-[#0a0a0a] border border-border w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tighter">Remove Tracks?</h3>
              <p className="text-muted-foreground/80 text-sm mb-8">
                Are you sure you want to remove <span className="text-foreground font-bold">{selectedTrackIds.length}</span> selected tracks from this playlist? This action cannot be undone.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleBulkRemove}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-foreground rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Yes, Remove Tracks
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-3 bg-muted/50 hover:bg-muted text-foreground rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;

