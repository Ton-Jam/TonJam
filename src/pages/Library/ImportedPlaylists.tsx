import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useLibraryData } from './hooks/useLibraryData';
import { BackButton } from '@/components/BackButton';
import { PageLayout } from '@/components/layout/PageLayout';
import { ImportSpotifyPlaylistModal } from './components/ImportSpotifyPlaylistModal';
import PlaylistOptionsModal from '@/components/PlaylistOptionsModal';
import { ArrowDownToLine, MoreVertical, Music2 } from 'lucide-react';
import { Playlist } from '@/types';
import LazyArtworkImage from '@/components/common/LazyArtworkImage';
import { getPlaceholderImage } from '@/lib/utils';

export const ImportedPlaylists: React.FC = () => {
  const navigate = useNavigate();
  const { 
    setHeaderTitle, playlists: contextPlaylists, playlistFolders, 
    movePlaylistToFolder, deletePlaylist 
  } = useAudio();
  const libraryData = useLibraryData();
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [selectedPlaylistForOptions, setSelectedPlaylistForOptions] = useState<Playlist | null>(null);

  useEffect(() => {
    setHeaderTitle('Imported Playlists');
    return () => setHeaderTitle('');
  }, [setHeaderTitle]);

  // Combine and filter playlists that are imported from Spotify or custom imported
  const importedPlaylists: Playlist[] = useMemo(() => {
    const list: Playlist[] = [];

    // From AudioContext
    (contextPlaylists || []).forEach((p) => {
      const isSpotify = 
        (p as any).isSpotify || 
        (p as any).isImported || 
        p.creator?.toLowerCase().includes('imported') || 
        p.creator?.toLowerCase().includes('spotify') || 
        p.title?.toLowerCase().includes('spotify');
      if (isSpotify && !list.some((existing) => existing.id === p.id)) {
        list.push(p);
      }
    });

    // From LibraryData
    (libraryData.playlists || []).forEach((p) => {
      const isImported = 
        p.id.includes('imported') || 
        p.creator?.toLowerCase().includes('imported') || 
        p.title?.toLowerCase().includes('spotify') || 
        p.isCustom;
      if (isImported && !list.some((existing) => existing.id === p.id)) {
        list.push({
          id: p.id,
          title: p.title,
          creator: p.creator,
          coverUrl: p.coverUrl,
          trackIds: [],
          trackCount: p.tracksCount || 0,
          updatedAt: new Date().toISOString()
        });
      }
    });

    return list;
  }, [contextPlaylists, libraryData.playlists]);

  const handlePlaylistClick = (playlist: Playlist) => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleOptionsClick = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation();
    setSelectedPlaylistForOptions(playlist);
  };

  return (
    <PageLayout containerClassName="max-w-4xl mx-auto px-4 space-y-4" topSpacing="default">
      {/* 1. MINIMAL HEADER */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors" ariaLabel="Back to Library" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
            Imported Playlists
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsSpotifyModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#1DB954] hover:bg-[#1aa34a] text-black rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform shrink-0"
          aria-label="Import Spotify playlist"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Import</span>
        </button>
      </div>

      {/* 2. COMPACT PLAYLIST LIST OR EMPTY STATE */}
      {importedPlaylists.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-zinc-400">No imported playlists yet</p>
        </div>
      ) : (
        <div className="divide-y-0 space-y-1">
          {importedPlaylists.map((playlist) => {
            const count = playlist.trackCount || playlist.trackIds?.length || 0;
            return (
              <div
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist)}
                className="group flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlaylistClick(playlist);
                  }
                }}
                aria-label={`Open playlist: ${playlist.title}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[4px] overflow-hidden shrink-0 bg-neutral-900 flex items-center justify-center">
                    {playlist.coverUrl ? (
                      <LazyArtworkImage
                        src={playlist.coverUrl}
                        fallbackSrc={getPlaceholderImage(`playlist-${playlist.id}`)}
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music2 className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug truncate text-white group-hover:text-[#00B4D8] transition-colors">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {playlist.creator || 'Imported from Spotify'} • {count} {count === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleOptionsClick(e, playlist)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Playlist options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spotify Import Modal */}
      <ImportSpotifyPlaylistModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        onImportPlaylist={libraryData.importPlaylistWithTracks}
        onViewPlaylists={() => {
          setIsSpotifyModalOpen(false);
        }}
      />

      {/* Playlist Options Modal */}
      {selectedPlaylistForOptions && (
        <PlaylistOptionsModal
          playlist={selectedPlaylistForOptions}
          folders={playlistFolders || []}
          onClose={() => setSelectedPlaylistForOptions(null)}
          onEdit={() => {
            navigate(`/playlist/${selectedPlaylistForOptions.id}`);
          }}
          onDelete={() => {
            deletePlaylist(selectedPlaylistForOptions.id);
            setSelectedPlaylistForOptions(null);
          }}
          onMoveToFolder={(folderId) => {
            movePlaylistToFolder(selectedPlaylistForOptions.id, folderId);
            setSelectedPlaylistForOptions(null);
          }}
        />
      )}
    </PageLayout>
  );
};

export default ImportedPlaylists;
