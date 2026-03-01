import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Music2, Play, Shuffle, Trash2, MinusCircle, Camera, Pencil, Check, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import TrackCard from '@/components/TrackCard';
import { MOCK_TRACKS } from '@/constants';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, playTrack, allTracks, removeTrackFromPlaylist, deletePlaylist, updatePlaylist } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const playlist = useMemo(() => {
    return playlists.find(p => p.id === id);
  }, [playlists, id]);

  const playlistTracks = useMemo(() => {
    if (!playlist || !playlist.trackIds) return [];
    /* Combine user tracks and mock tracks to find the playlist tracks */
    const tracks = [...allTracks, ...MOCK_TRACKS];
    /* Filter duplicates if any */
    const uniqueTracks = Array.from(new Map(tracks.map(item => [item.id, item])).values());
    return uniqueTracks.filter(track => playlist.trackIds?.includes(track.id));
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

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
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
    <div className="min-h-screen bg-black pb-32 pt-20 px-4 md:px-8">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Cover Image / Collage */}
        <div className="relative group w-64 h-64 flex-shrink-0 rounded-[10px] overflow-hidden shadow-2xl bg-white/5">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid grid-cols-2 gap-1">
              {coverImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className="w-full h-full relative bg-white/5 flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="h-8 w-8 text-white/20" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-white mb-2" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Change Cover</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCoverUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex flex-col justify-end flex-1">
          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-3xl md:text-5xl font-bold text-white focus:outline-none focus:border-blue-500"
                placeholder="Playlist Title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white/80 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Add a description..."
                rows={3}
              />
              <div className="flex gap-2">
                <button onClick={saveEditing} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all">
                  <Check className="h-4 w-4" /> Save
                </button>
                <button onClick={cancelEditing} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="group flex items-start gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{playlist.title}</h1>
                <button onClick={startEditing} className="mt-2 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all">
                  <Pencil className="h-5 w-5" />
                </button>
              </div>
              {playlist.description && (
                <p className="text-white/60 text-sm mb-4 max-w-2xl">{playlist.description}</p>
              )}
              <div className="flex items-center gap-4 text-white/60 text-sm font-medium mb-6">
                <span>{playlist.creator}</span>
                <span>•</span>
                <span>{playlistTracks.length} tracks</span>
              </div>
            </>
          )}
          
          <div className="flex gap-4">
            <button onClick={handlePlayAll} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              <Play className="h-4 w-4 fill-current" /> Play All
            </button>
            <button onClick={handleShuffle} className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button onClick={handleDeletePlaylist} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95" title="Delete Playlist">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-8 no-scrollbar">
        {playlistTracks.map((track, index) => (
          <div key={track.id} className="min-w-[280px] sm:min-w-[320px] p-3 hover:bg-white/5 rounded-[10px] group transition-colors flex items-center gap-4">
            <span className="text-white/40 w-8 text-center font-mono text-sm">{index + 1}</span>
            <div className="flex-1">
              <TrackCard track={track} variant="row" />
            </div>
            <button onClick={(e) => handleRemoveTrack(e, track.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Remove from playlist">
              <MinusCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
        {playlistTracks.length === 0 && (
          <div className="text-white/40 italic">No tracks in this playlist yet.</div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;

