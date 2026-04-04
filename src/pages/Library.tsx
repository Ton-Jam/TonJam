import React, { useState, useMemo } from 'react';
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
  Play
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';
import { getPlaceholderImage } from '@/lib/utils';

type LibraryFilter = 'all' | 'playlists' | 'artists' | 'albums' | 'nfts';
type SortOption = 'recents' | 'recently-added' | 'alphabetical';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playlists, 
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recents');

  // Data processing
  const likedTracksCount = likedTrackIds.length;

  const libraryItems = useMemo(() => {
    let items: any[] = [];

    if (filter === 'all' || filter === 'playlists') {
      items = [...items, ...playlists.map(p => ({ ...p, type: 'playlist' }))];
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

    // Filter by search query (using global searchQuery if needed, but here we'll just show all items)
    // The user specifically asked to remove the search bar from the library screen

    // Sort items
    if (sortBy === 'alphabetical') {
      items.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    } else if (sortBy === 'recently-added') {
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    // 'recents' would ideally use a separate history, but we'll use createdAt for now

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
          className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className={`relative w-12 h-12 flex-shrink-0 overflow-hidden ${isArtist ? 'rounded-full' : 'rounded-md'}`}>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        layout
        key={`${item.type}-${item.id || item.uid}`}
        onClick={() => navigate(item.type === 'artist' ? `/artist/${item.uid}` : item.type === 'playlist' ? `/playlist/${item.id}` : `/nft/${item.id}`)}
        className="p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group flex flex-col gap-3"
      >
        <div className={`relative aspect-square w-full overflow-hidden shadow-lg ${isArtist ? 'rounded-full' : 'rounded-xl'}`}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
          <div className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-1" />
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground truncate">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Spotify-style Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold">{userProfile.name?.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'playlists', 'artists', 'nfts'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Sort Bar */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSortBy(sortBy === 'recents' ? 'alphabetical' : sortBy === 'alphabetical' ? 'recently-added' : 'recents')}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-white transition-colors"
            >
              <span>{sortBy === 'recents' ? 'Recents' : sortBy === 'alphabetical' ? 'Alphabetical' : 'Recently Added'}</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content Grid/List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2" : "flex flex-col gap-1"}>
          {/* Special Liked Songs Card (only in grid view and when filter is 'all' or 'playlists') */}
          {viewMode === 'grid' && (filter === 'all' || filter === 'playlists') && (
            <motion.div
              layout
              onClick={() => navigate('/explore/tracks?title=Liked Songs&filter=favorites')}
              className="col-span-2 p-5 rounded-xl bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 flex flex-col justify-end gap-4 cursor-pointer group relative overflow-hidden h-full min-h-[160px]"
            >
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Heart className="w-24 h-24 fill-white text-white" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white tracking-tight">Liked Songs</h2>
                <p className="text-sm font-medium text-white/80">{likedTracksCount} songs</p>
              </div>
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-2xl">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </motion.div>
          )}

          {/* Liked Songs List Item */}
          {viewMode === 'list' && (filter === 'all' || filter === 'playlists') && (
            <motion.div
              layout
              onClick={() => navigate('/explore/tracks?title=Liked Songs&filter=favorites')}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">Liked Songs</h4>
                <p className="text-xs text-muted-foreground truncate">Playlist • {likedTracksCount} songs</p>
              </div>
            </motion.div>
          )}

          {/* Library Items */}
          <AnimatePresence>
            {libraryItems.map(item => renderLibraryItem(item))}
          </AnimatePresence>

          {libraryItems.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
