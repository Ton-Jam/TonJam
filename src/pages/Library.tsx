import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search,
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
  Folder
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_USERS, MOCK_NFTS, MOCK_PLAYLISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import ArtistCard from '@/components/ArtistCard';
import UserCard from '@/components/UserCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import PlaylistFolderCard from '@/components/PlaylistFolderCard';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getPlaceholderImage } from '@/lib/utils';
import SkeletonCard from '@/components/SkeletonCard';
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

type LibraryFilter = 'all' | 'playlists' | 'artists' | 'nfts';
type SortOption = 'recents' | 'recently-added' | 'alphabetical';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playlists, 
    playlistFolders,
    createFolder,
    likedTrackIds, 
    followedUserIds, 
    userNFTs, 
    allNFTs, 
    userTracks, 
    userProfile, 
    artists,
    setIsCreatePlaylistModalOpen,
    recentlyPlayed
  } = useAudio();

  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('recents');
  const [isLoading, setIsLoading] = useState(true);

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
        (nft.owner === userProfile.walletAddress) || 
        (nft.owner === userProfile.name) ||
        userNFTs.some(un => un.id === nft.id)
      );
      items = [...items, ...myNFTs.map(n => ({ ...n, type: 'nft' }))];
    }

    if (sortBy === 'alphabetical') {
      items.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    } else if (sortBy === 'recently-added') {
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return items;
  }, [filter, playlists, artists, followedUserIds, allNFTs, userProfile, userNFTs, sortBy]);

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
          className="flex items-center gap-4 p-3 rounded-[2px] hover:bg-white/[0.03] transition-all cursor-pointer group border border-transparent hover:border-white/[0.05]"
        >
          <div className={cn(
            "relative w-14 h-14 flex-shrink-0 overflow-hidden shadow-lg shadow-black/50 rounded-[2px]"
          )}>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black uppercase italic tracking-tighter text-foreground truncate">{title}</h4>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60 truncate">{subtitle}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </motion.div>
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
            <h4 className="text-sm font-black uppercase italic tracking-tighter text-foreground truncate">{title}</h4>
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
    { type: 'track', data: MOCK_TRACKS[1] },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-6 py-4 sm:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Neural Vault</h1>
              <p className="text-sm text-muted-foreground mt-1">Your curated collection of digital assets and frequencies.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => {
                const title = prompt("Enter Node Sector Label (Folder Name)");
                if (title) createFolder(title);
             }} className="h-10 rounded-xl gap-2 border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all">
                <FolderPlus className="h-4 w-4" />
                New Node Sector
             </Button>
             <Button variant="outline" size="sm" onClick={() => setIsCreatePlaylistModalOpen(true)} className="h-10 rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                New Node
             </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <Tabs 
                value={filter} 
                onValueChange={(v) => setFilter(v as LibraryFilter)}
            >
                <TabsList className="bg-muted p-1 h-12 rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
                  <TabsTrigger value="playlists" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Nodes</TabsTrigger>
                  <TabsTrigger value="artists" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Entities</TabsTrigger>
                  <TabsTrigger value="nfts" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Artifacts</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')} className="bg-secondary/50 p-1 rounded-2xl h-10">
                    <ToggleGroupItem value="list" className="rounded-xl w-10 h-8 data-[state=on]:bg-background data-[state=on]:text-primary">
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="grid" className="rounded-xl w-10 h-8 data-[state=on]:bg-background data-[state=on]:text-primary">
                        <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>


        {/* Horizontal Recents */}
        {filter === 'all' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/50 flex items-center gap-2">
                <History className="h-3 w-3" />
                Recent Interlinks
              </h3>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`recent-loading-${i}`} className="w-[180px] shrink-0">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  recentItems.map((item, i) => (
                    <div key={i} className="w-[180px] shrink-0 hover:scale-[1.02] transition-transform duration-500">
                      {item.type === 'artist' && <ArtistCard artist={item.data as any} />}
                      {item.type === 'track' && <TrackCard track={item.data as any} />}
                      {item.type === 'playlist' && <PlaylistCard playlist={item.data as any} />}
                      {item.type === 'user' && <UserCard user={item.data as any} />}
                      {item.type === 'nft' && <NFTCard nft={item.data as any} />}
                    </div>
                  ))
                )}
              </div>
              <ScrollBar orientation="horizontal" className="bg-white/[0.02]" />
            </ScrollArea>
          </div>
        )}

        {/* Main Content */}
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "space-y-2"}>
          {/* Playlist Folders */}
          {(filter === 'all' || filter === 'playlists') && (
            <div className={cn(
              "col-span-full mb-2",
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-2"
            )}>
              {playlistFolders.map(folder => (
                <PlaylistFolderCard 
                  key={folder.id} 
                  folder={folder} 
                  playlists={playlists} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Liked Songs Card */}
          {(filter === 'all' || filter === 'playlists') && (
            viewMode === 'grid' ? (
              <motion.div
                layout
                onClick={() => navigate('/playlist/liked-songs')}
                className="col-span-2 sm:col-span-2 p-8 rounded-[2px] bg-gradient-to-br from-blue-900/40 via-blue-800/10 to-black/40 flex flex-col justify-end gap-6 cursor-pointer group relative overflow-hidden h-[260px] border border-blue-500/10 hover:border-blue-500/30 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 rotate-12">
                  <Heart className="w-64 h-64 fill-blue-500 text-transparent" />
                </div>
                {/* GFX Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
                
                <div className="relative z-10 space-y-2">
                  <div className="w-14 h-14 rounded-[2px] bg-white flex items-center justify-center mb-2 shadow-2xl group-hover:rotate-6 transition-transform">
                    <Heart className="w-7 h-7 fill-red-500 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Liked Tracks</h2>
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-blue-500/20 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-[2px]">
                    {likedTracksCount} Recorded Signals
                  </Badge>
                </div>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-[2px] flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_15px_40px_rgba(37,99,235,0.6)]">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </motion.div>
            ) : (
                <motion.div
                  layout
                  onClick={() => navigate('/playlist/liked-songs')}
                  className="flex items-center gap-4 p-3 rounded-[2px] bg-gradient-to-r from-blue-900/10 to-transparent hover:bg-white/[0.05] border border-blue-500/10 transition-all cursor-pointer group w-full"
                >
                  <div className="w-14 h-14 rounded-[2px] bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shadow-lg relative overflow-hidden">
                    <Heart className="w-6 h-6 fill-blue-500 text-blue-500 relative z-10 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                       <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase italic tracking-tighter text-white truncate">Liked Tracks</h4>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5 opacity-60 truncate">{likedTracksCount} Recorded Signals</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </motion.div>
            )
          )}

          {/* Library Items List/Grid */}
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={`loading-${i}`} className={viewMode === 'grid' ? "aspect-square" : "w-full"}>
                  <SkeletonCard variant={viewMode === 'grid' ? 'default' : 'row'} />
                </div>
              ))
            ) : (
              libraryItems.map(item => renderLibraryItem(item))
            )}
          </AnimatePresence>

          {!isLoading && libraryItems.length === 0 && (
            <div className="col-span-full py-40 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-dashed border-white/[0.1] flex items-center justify-center mb-8 rotate-12">
                <History className="w-10 h-10 text-zinc-800" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3">Neural Vault Empty</h3>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] max-w-sm leading-relaxed">
                Connect your frequencies and capture sonic artifacts to populate this sector.
              </p>
              <Button 
                variant="outline" 
                className="mt-10 rounded-2xl border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all h-12 px-8"
                onClick={() => navigate('/discover')}
              >
                Scan Networks
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
