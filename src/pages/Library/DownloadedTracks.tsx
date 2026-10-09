import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useLibraryData } from './hooks/useLibraryData';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Play, 
  Shuffle, 
  FolderOpen, 
  HardDrive, 
  Upload, 
  Trash2, 
  Download, 
  WifiOff, 
  Music2,
  CheckCircle2
} from 'lucide-react';
import { Track } from '@/types';
import { SpotifyTrackRow } from './components/SpotifyTrackRow';

export const DownloadedTracks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'local' ? 'local' : 'downloaded';
  const [activeTab, setActiveTab] = useState<'downloaded' | 'local'>(initialTab);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    setHeaderTitle, 
    playAll, 
    isShuffle, 
    toggleShuffle, 
    isOffline,
    localTracks,
    scanLocalDirectory,
    importLocalFiles,
    removeLocalTrack,
    clearLocalTracks
  } = useAudio();

  const data = useLibraryData();

  useEffect(() => {
    setHeaderTitle(activeTab === 'local' ? 'Device Music' : 'Downloaded Tracks');
    return () => setHeaderTitle('');
  }, [setHeaderTitle, activeTab]);

  // Sync tab change with search params
  const handleTabChange = (tab: 'downloaded' | 'local') => {
    setActiveTab(tab);
    setSearchParams(tab === 'local' ? { tab: 'local' } : {});
  };

  // Filter downloaded tracks from library data
  const downloadedTracks = useMemo(() => {
    return data.rawTracks.filter((t) => t.isDownloaded);
  }, [data.rawTracks]);

  // Map downloaded tracks to core Track type with reliable fallback audio
  const mappedDownloadedTracks: Track[] = useMemo(() => {
    return downloadedTracks.map((t) => ({
      id: t.id,
      songId: t.id,
      title: t.title,
      artist: t.artist,
      artistId: t.artistId || 'artist-1',
      coverUrl: t.coverUrl,
      audioUrl: '/tonjam-offline-audio.mp3',
      duration: t.duration || 210,
      streams: t.plays || 0,
      playCount: t.plays || 0,
      album: t.album || 'Downloaded Compilation',
      genre: 'Music',
      isNFT: false,
      isDownloaded: true,
      fileSize: t.downloadSize || '5.4 MB',
      createdAt: new Date().toISOString()
    } as Track));
  }, [downloadedTracks]);

  const activeTracksList = activeTab === 'local' ? localTracks : mappedDownloadedTracks;

  const handlePlayAll = () => {
    if (activeTracksList.length > 0) {
      playAll(activeTracksList);
    }
  };

  const handleShufflePlay = () => {
    if (activeTracksList.length > 0) {
      if (!isShuffle) toggleShuffle();
      const shuffled = [...activeTracksList].sort(() => Math.random() - 0.5);
      playAll(shuffled);
    }
  };

  const handleRemoveDownload = (trackId: string) => {
    data.toggleDownloadTrack(trackId);
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importLocalFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await importLocalFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleOpenDirectory = async () => {
    try {
      if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
        await scanLocalDirectory();
      } else if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    } catch (e) {
      if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    }
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* Hidden file inputs for local device directory and audio files */}
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

      {/* 1. OFFLINE STATUS NOTIFICATION */}
      {isOffline && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline Mode Active • Playing downloaded & device songs directly without network.</span>
        </div>
      )}

      {/* 2. MINIMAL HEADER WITH TABS & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton 
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
            ariaLabel="Back to Library" 
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              {activeTab === 'local' ? 'Device Local Music' : 'Downloaded Tracks'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeTab === 'local' 
                ? `${localTracks.length} tracks stored from device storage`
                : `${mappedDownloadedTracks.length} tracks available offline`
              }
            </p>
          </div>
        </div>

        {/* Play Controls */}
        {activeTracksList.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShufflePlay}
              className={`p-2.5 rounded-full transition-colors cursor-pointer active:scale-95 bg-white/[0.04] hover:bg-white/[0.08] ${
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
              aria-label="Play all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. TABS SELECTOR */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('downloaded')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeTab === 'downloaded'
              ? 'bg-[#0088CC] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Downloaded ({mappedDownloadedTracks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('local')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeTab === 'local'
              ? 'bg-[#0088CC] text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Device / Local ({localTracks.length})</span>
        </button>
      </div>

      {/* 4. LOCAL DEVICE TOOLBAR (When on Local Tab) */}
      {activeTab === 'local' && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03]">
          <button
            type="button"
            onClick={handleOpenDirectory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Music Directory</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-300" />
            <span>Import Audio Files</span>
          </button>

          {localTracks.length > 0 && (
            <button
              type="button"
              onClick={clearLocalTracks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer ml-auto transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Device Songs</span>
            </button>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT */}
      {activeTab === 'downloaded' ? (
        // DOWNLOADED TRACKS CONTENT
        mappedDownloadedTracks.length === 0 ? (
          <div className="py-20 text-center space-y-3 p-6 rounded-2xl bg-white/[0.02]">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto text-zinc-400">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Downloaded Tracks Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Save any track from the library or artist drops for offline playback. Downloaded songs are cached locally on your device.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {mappedDownloadedTracks.map((track, idx) => (
              <SpotifyTrackRow
                key={track.id}
                track={track}
                index={idx}
                subtitleExtra={track.fileSize || '5.4 MB'}
                onRemove={() => handleRemoveDownload(track.id)}
              />
            ))}
          </div>
        )
      ) : (
        // LOCAL DEVICE TRACKS CONTENT
        localTracks.length === 0 ? (
          <div className="py-16 text-center space-y-4 p-6 sm:p-8 rounded-2xl bg-white/[0.02]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <HardDrive className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">Access Your Device Music Library</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan an entire music folder or pick audio tracks directly from your device storage. Files are stored securely in your browser's offline storage for instant offline listening.
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Offline Playback
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {localTracks.map((track, idx) => (
              <SpotifyTrackRow
                key={track.id}
                track={track}
                index={idx}
                subtitleExtra={track.fileSize ? `${track.fileSize} • Local Audio` : 'Local Audio'}
                onRemove={() => removeLocalTrack(track.id)}
              />
            ))}
          </div>
        )
      )}
    </PageLayout>
  );
};

export default DownloadedTracks;
