import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MTButton } from "@material-tailwind/react";
import { 
  Plus, 
  List,
  LayoutGrid,
  Heart,
  Music2,
  Users,
  Disc,
  History,
  Zap,
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Filter,
  Grid2X2,
  FolderPlus,
  Folder,
  UserPlus,
  ChevronRight,
  Layers,
  ListMusic,
  ShoppingBag
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_USERS, MOCK_NFTS, MOCK_PLAYLISTS, MOCK_ALBUMS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import ArtistCard from '@/components/ArtistCard';
import UserCard from '@/components/UserCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import AlbumCard from '@/components/AlbumCard';
import PlaylistFolderCard from '@/components/PlaylistFolderCard';
import FolderModal from '@/components/FolderModal';
import PlaylistOptionsModal from '@/components/PlaylistOptionsModal';
import FilterPills from '@/components/FilterPills';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getPlaceholderImage } from '@/lib/utils';
import SkeletonCard from '@/components/SkeletonCard';
import NoResultsState from '@/components/NoResultsState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { Playlist, PlaylistFolder } from '@/types';

type LibraryFilter = 'all' | 'playlists' | 'artists' | 'nfts';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playlists, 
    playlistFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    likedTrackIds, 
    followedUserIds, 
    userNFTs, 
    allNFTs, 
    userTracks, 
    userProfile, 
    artists,
    setIsHeaderSearchOpen,
    searchQuery,
    setSearchQuery,
    playAll
  } = useAudio();

  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolderForEdit, setSelectedFolderForEdit] = useState<any>(null);
  const [selectedPlaylistForOptions, setSelectedPlaylistForOptions] = useState<Playlist | null>(null);

  const { movePlaylistToFolder, deletePlaylist } = useAudio();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const likedTracksCount = likedTrackIds.length;

  const libraryItems = useMemo(() => {
    let items: any[] = [];

    if (filter === 'all' || filter === 'playlists') {
      // Only show playlists that are NOT in any folder in the main list
      items = [...items, ...playlists.filter(p => !p.folderId).map(p => ({ ...p, type: 'playlist' }))];
    }

    if (filter === 'all' || filter === 'artists') {
      const followedArtists = artists.filter(a => followedUserIds.includes(a.uid));
      items = [...items, ...followedArtists.map(a => ({ ...a, type: 'artist' }))];
    }

    if (filter === 'all' || filter === 'nfts') {
      const myNFTs = allNFTs.filter(nft => 
        (nft.owner === userProfile?.walletAddress) || 
        (nft.owner === userProfile?.name) ||
        userNFTs?.some(un => un.id === nft.id)
      );
      items = [...items, ...myNFTs.map(n => ({ ...n, type: 'nft' }))];
    }

    // Apply Search Filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        const artist = (item.artist || '').toLowerCase();
        return title.includes(query) || artist.includes(query);
      });

      // Sort by Suggestion (Starts with query first)
      items.sort((a, b) => {
        const aTitle = (a.title || a.name || '').toLowerCase();
        const bTitle = (b.title || b.name || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
        return aTitle.localeCompare(bTitle);
      });
    }
    return items;
  }, [filter, playlists, artists, followedUserIds, allNFTs, userProfile, userNFTs, searchQuery]);

  const renderLibraryItem = (item: any) => {
    const isArtist = item.type === 'artist';
    const title = item.title || item.name;
    const subtitle = item.type === 'artist' ? 'Artist' : 
                    item.type === 'playlist' ? `Playlist • ${item.creator || 'You'}` :
                    item.type === 'nft' ? `NFT • ${item.artist}` : 'Track';
    
    const imageUrl = item.coverUrl || item.avatarUrl || item.imageUrl || getPlaceholderImage(title);

    if (viewMode === 'list') {
      return (
        <motion.div
          layout
          key={`${item.type}-${item.id || item.uid}`}
          onClick={() => navigate(item.type === 'artist' ? `/artist/${item.uid}` : item.type === 'playlist' ? `/playlist/${item.id}` : `/nft/${item.id}`)}
          className="flex items-center gap-4 p-3 rounded-[4px] hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-white/[0.05]"
        >
          <div className={cn(
            "relative w-14 h-14 flex-shrink-0 overflow-hidden shadow-lg shadow-black/50 rounded-[4px]"
          )}>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black uppercase tracking-tighter text-foreground truncate">{title}</h4>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 truncate">{subtitle}</p>
          </div>
          {item.type === 'playlist' ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlaylistForOptions(item);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      );
    }

    if (item.type === 'playlist') {
      return (
        <PlaylistCard key={item.id} playlist={item} />
      );
    }

    return (
      <motion.div
        layout
        key={`${item.type}-${item.id || item.uid}`}
        onClick={() => navigate(item.type === 'artist' ? `/artist/${item.uid}` : item.type === 'playlist' ? `/playlist/${item.id}` : `/nft/${item.id}`)}
        className="group cursor-pointer"
      >
        <Card className="p-3 rounded-2xl bg-transparent hover:bg-secondary/30 border border-transparent hover:border-border transition-all h-full shadow-none">
          <div className={cn(
            "relative aspect-square w-full overflow-hidden shadow-md rounded-xl mb-3"
          )}>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-0.5 px-1">
            <h4 className="text-sm font-black uppercase tracking-tighter text-foreground truncate">{title}</h4>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest truncate">{subtitle}</p>
          </div>
        </Card>
      </motion.div>
    );
  };

  const recentItems = useMemo(() => [
    { type: 'artist', data: MOCK_ARTISTS[0] },
    { type: 'track', data: MOCK_TRACKS[0] },
    { type: 'playlist', data: MOCK_PLAYLISTS[0] },
    { type: 'nft', data: MOCK_NFTS[0] },
    { type: 'user', data: MOCK_USERS[0] },
    { type: 'album', data: MOCK_ALBUMS[0] },
    { type: 'track', data: MOCK_TRACKS[1] },
  ], []);

  const suggestedItems = useMemo(() => [
    { type: 'track', data: MOCK_TRACKS[2] },
    { type: 'nft', data: MOCK_NFTS[2] },
    { type: 'artist', data: MOCK_ARTISTS[1] },
  ], []);

  return (
    <div className="page-container w-full min-h-screen bg-background text-foreground pb-4">
      <div className="px-4 py-3 sm:px-6 w-full max-w-full space-y-6">
        
        {/* Global Filter Pills & Grid Toggle controls block */}
        <div className="sticky top-0 lg:top-[var(--header-height,64px)] z-[37] bg-transparent py-4 w-full mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <FilterPills
            selectedGenre={filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            onSelect={(v) => setFilter(v ? (v === 'All Symbols' ? 'all' : v.toLowerCase()) as any : 'all')}
            categories={['All Symbols', 'Playlists', 'Artists', 'NFTs']}
          />
        </div>

        {/* Folders Section - List Layout */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500/50 flex items-center gap-2">
              <Folder className="h-3 w-3" />
              Neural Vault
            </h3>
            <Button variant="ghost" size="sm" onClick={() => {
              setSelectedFolderForEdit(null);
              setIsFolderModalOpen(true);
            }}>
              <FolderPlus className="h-3 w-3 mr-2" />
              Add Folder
            </Button>
          </div>
          
          <div className="flex flex-col gap-1">
            {playlistFolders.map(folder => (
               <PlaylistFolderCard 
                 key={folder.id} 
                 folder={folder} 
                 playlists={playlists} 
                 viewMode="list" 
               />
            ))}
            
            {/* My Playlists Folder (System Default) */}
            <motion.div
              whileHover={{ x: 4 }}
              onClick={() => setFilter('playlists')}
              className={cn(
                "flex items-center gap-4 p-4 rounded-[4px] transition-all cursor-pointer group border border-white/5",
                filter === 'playlists' ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              <div className="w-12 h-12 rounded-[4px] bg-blue-600/20 flex items-center justify-center shadow-lg">
                <Music2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-tighter">My Playlists</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  {playlists.length} Compiled Nodes
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* My NFTs Folder */}
            <motion.div
              whileHover={{ x: 4 }}
              onClick={() => navigate('/my-nfts')}
              className={cn(
                "flex items-center gap-4 p-4 rounded-[4px] transition-all cursor-pointer group border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              <div className="w-12 h-12 rounded-[4px] bg-purple-600/20 flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-tighter">My NFTs</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                   Artifact Collection
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Favorite Tracks Folder */}
            <motion.div
              whileHover={{ x: 4 }}
              onClick={() => navigate('/favorite-tracks')}
              className="flex items-center gap-4 p-4 rounded-[4px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-[4px] bg-pink-600/20 flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-tighter">Favorite Tracks</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  {likedTrackIds.length} Signals Locked
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Favorite Artists Folder */}
            <motion.div
              whileHover={{ x: 4 }}
              onClick={() => navigate('/favorite-artists')}
              className="flex items-center gap-4 p-4 rounded-[4px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-[4px] bg-emerald-600/20 flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-tighter">Favorite Artists</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  {followedUserIds.length} Entities Tracked
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
        </section>

        {/* Global Recommendations or Sector Results */}
        <div className="space-y-6">
          {(filter !== 'all' || searchQuery.trim()) ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                  <Grid2X2 className="h-3.5 w-3.5" />
                  {searchQuery.trim() ? 'Search Results' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Results`}
                </h3>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => {
                     setFilter('all');
                     if (setIsHeaderSearchOpen) setIsHeaderSearchOpen(false);
                   }}
                   className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  Clear search/filter
                </Button>
              </div>
              
              <div className={cn(
                viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" : "space-y-2"
              )}>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={`loading-${i}`} className={viewMode === 'grid' ? "aspect-square" : "w-full"}>
                        <SkeletonCard variant={viewMode === 'grid' ? 'default' : 'row'} />
                      </div>
                    ))
                  ) : (
                    libraryItems.map(item => renderLibraryItem(item))
                  )}
                </AnimatePresence>
                
                {!isLoading && libraryItems.length === 0 && (
                  <div className="col-span-full pt-4 pb-12">
                    <NoResultsState
                      query={searchQuery.trim() ? searchQuery : undefined}
                      onReset={() => {
                        setSearchQuery('');
                        setFilter('all');
                      }}
                    />
                  </div>
                )}
              </div>
            </section>
          ) : null}

        {/* Recent Activities */}
        <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                Recent Activities
              </h3>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-6 pb-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`recent-loading-${i}`} className="w-[190px] shrink-0">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  recentItems.map((item, i) => (
                    <div key={i} className="w-[200px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                      {item.type === 'artist' && <ArtistCard artist={item.data as any} />}
                      {item.type === 'track' && <TrackCard track={item.data as any} />}
                      {item.type === 'playlist' && <PlaylistCard playlist={item.data as any} />}
                      {item.type === 'user' && <UserCard user={item.data as any} />}
                      {item.type === 'nft' && <NFTCard nft={item.data as any} />}
                      {item.type === 'album' && <AlbumCard album={item.data as any} index={i} />}
                    </div>
                  ))
                )}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/[0.02]" />
            </ScrollArea>
          </section>

          {/* Suggested Tracks & NFTs */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Featured Picks
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => playAll(MOCK_TRACKS.slice(0, 6))}
                className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white"
              >
                Play All Featured
              </Button>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-6 pb-6">
                {MOCK_TRACKS.slice(0, 6).map((track, i) => (
                  <div key={`s-track-${i}`} className="w-[220px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                    <TrackCard track={track as any} />
                  </div>
                ))}
                {MOCK_NFTS.slice(0, 6).map((nft, i) => (
                  <div key={`s-nft-${i}`} className="w-[220px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                    <NFTCard nft={nft as any} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/[0.02]" />
            </ScrollArea>
          </section>

          {/* Recommended Playlists */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                <Disc className="h-3.5 w-3.5" />
                Curated Nodes
              </h3>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-6 pb-6">
                {MOCK_PLAYLISTS.slice(0, 8).map((playlist, i) => (
                  <div key={`r-playlist-${i}`} className="w-[200px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                    <PlaylistCard playlist={playlist as any} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/[0.02]" />
            </ScrollArea>
          </section>

          {/* Recommended Artists */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Sonic Entities
              </h3>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-6 pb-6">
                {MOCK_ARTISTS.slice(0, 10).map((artist, i) => (
                  <div key={`r-artist-${i}`} className="w-[180px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                    <ArtistCard artist={artist as any} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/[0.02]" />
            </ScrollArea>
          </section>
        </div>
      </div>

      <FolderModal 
        isOpen={isFolderModalOpen} 
        onClose={() => {
          setIsFolderModalOpen(false);
          setSelectedFolderForEdit(null);
        }}
        folder={selectedFolderForEdit}
      />

      {selectedPlaylistForOptions && (
        <PlaylistOptionsModal
          playlist={selectedPlaylistForOptions}
          folders={playlistFolders}
          onClose={() => setSelectedPlaylistForOptions(null)}
          onEdit={() => {}}
          onDelete={() => deletePlaylist(selectedPlaylistForOptions.id)}
          onMoveToFolder={(folderId) => movePlaylistToFolder(selectedPlaylistForOptions.id, folderId)}
        />
      )}
    </div>
  );
};

export default Library;
