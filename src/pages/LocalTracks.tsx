import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { SpotifyTrackRow } from './Library/components/SpotifyTrackRow';
import { 
  FolderOpen, 
  Upload, 
  Trash2, 
  HardDrive, 
  Search, 
  Play, 
  Shuffle, 
  CheckCircle2,
  Music2
} from 'lucide-react';
import { Track } from '@/types';

export const LocalTracks: React.FC = () => {
  const navigate = useNavigate();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setHeaderTitle,
    playAll,
    isShuffle,
    toggleShuffle,
    localTracks,
    scanLocalDirectory,
    importLocalFiles,
    removeLocalTrack,
    clearLocalTracks
  } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Set header title on mount
  React.useEffect(() => {
    setHeaderTitle('Local Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return localTracks;
    const q = searchQuery.toLowerCase();
    return localTracks.filter(
      t => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q))
    );
  }, [localTracks, searchQuery]);

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playAll(filteredTracks);
    }
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length > 0) {
      if (!isShuffle) toggleShuffle();
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      playAll(shuffled);
    }
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      try {
        await importLocalFiles(e.target.files);
      } finally {
        setIsScanning(false);
        e.target.value = '';
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      try {
        await importLocalFiles(e.target.files);
      } finally {
        setIsScanning(false);
        e.target.value = '';
      }
    }
  };

  const handleOpenDirectory = async () => {
    setIsScanning(true);
    try {
      if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
        await scanLocalDirectory();
      } else if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError' && folderInputRef.current) {
        folderInputRef.current.click();
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-6 pb-24" topSpacing="default">
      {/* Hidden file inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        // @ts-ignore
        directory=""
        multiple
        accept="audio/*"
        onChange={handleFolderInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3.5 min-w-0">
          <BackButton 
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0" 
            ariaLabel="Back" 
          />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
              <span>Local Tracks</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {localTracks.length === 0
                ? 'No music files stored on device yet'
                : `${localTracks.length} audio ${localTracks.length === 1 ? 'track' : 'tracks'} indexed from device storage`}
            </p>
          </div>
        </div>

        {/* Playback action buttons */}
        {localTracks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShufflePlay}
              className={`p-2.5 rounded-full transition-all cursor-pointer active:scale-95 bg-white/[0.04] hover:bg-white/[0.08] ${
                isShuffle ? 'text-[#00B4D8]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Shuffle play"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-transform shadow-md"
              title="Play All"
              aria-label="Play all local tracks"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        )}
      </div>

      {/* TOOLBAR: FOLDER PICKER, FILE UPLOAD & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDirectory}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scanning...' : 'Select Music Folder'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-300" />
            <span>Pick Audio Files</span>
          </button>

          {localTracks.length > 0 && (
            <button
              type="button"
              onClick={clearLocalTracks}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold cursor-pointer ml-auto transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {localTracks.length > 2 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search local tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-[#0052FF]"
            />
          </div>
        )}
      </div>

      {/* TRACK LIST OR EMPTY STATE */}
      {localTracks.length === 0 ? (
        <div className="py-20 text-center space-y-4 p-8 rounded-2xl bg-white/[0.01]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white tracking-tight">No Local Tracks Found</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Browse music files stored on your device. Selected tracks are cached securely in your browser's offline storage for instant playback without uploading to any remote server.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenDirectory}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Select Music Folder</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Pick Audio Files</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> MP3, FLAC, WAV, M4A, AAC
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Local & Offline
            </span>
          </div>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="py-16 text-center space-y-2 text-zinc-400 text-xs">
          <p>No local tracks match "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[#00B4D8] underline font-semibold cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredTracks.map((track, idx) => {
            // Ensure fallback cover artwork if coverUrl is missing or invalid
            const trackWithFallback = {
              ...track,
              coverUrl: track.coverUrl || '/default_tonjam_banner.jpg'
            };
            return (
              <SpotifyTrackRow
                key={track.id}
                track={trackWithFallback}
                index={idx}
                subtitleExtra={track.fileSize ? `${track.fileSize} • Local Audio` : 'Local Audio'}
                onRemove={() => removeLocalTrack(track.id)}
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default LocalTracks;
