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
  Play
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_USERS, MOCK_NFTS, MOCK_PLAYLISTS } from '@/constants';
import TrackCard from '@/components/TrackCard';
import ArtistCard from '@/components/ArtistCard';
import UserCard from '@/components/UserCard';
import NFTCard from '@/components/NFTCard';
import PlaylistCard from '@/components/PlaylistCard';
import { motion, AnimatePresence } from 'motion/react';
import { getPlaceholderImage } from '@/lib/utils';
import SkeletonCard from '@/components/SkeletonCard';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('recents');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const recentItems = useMemo(() => [
    { type: 'artist', data: MOCK_ARTISTS[0] },
    { type: 'track', data: MOCK_TRACKS[0] },
    { type: 'playlist', data: MOCK_PLAYLISTS[0] },
    { type: 'nft', data: MOCK_NFTS[0] },
    { type: 'user', data: MOCK_USERS[0] },
    { type: 'track', data: MOCK_TRACKS[1] },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Filter Pills / Navigation */}
      <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur-md px-4 sm:px-8 py-0 border-b border-white/5 flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tight">My Library</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {(['all', 'playlists', 'artists', 'nfts'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {f === 'all' ? 'All Frequencies' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

        <div className="px-4 sm:px-8 pt-4 pb-8">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-black uppercase tracking-tight italic">
              {filter === 'all' ? 'Your Collection' : filter === 'playlists' ? 'Curated Mixes' : filter === 'artists' ? 'Followed Entities' : 'Digital Artifacts'}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSortBy(sortBy === 'recents' ? 'alphabetical' : sortBy === 'alphabetical' ? 'recently-added' : 'recents')}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <span>{sortBy === 'recents' ? 'Recents' : sortBy === 'alphabetical' ? 'A-Z' : 'Newest'}</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Content Grid/List */}
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
            {/* Special Liked Songs Card */}
            {viewMode === 'grid' && (filter === 'all' || filter === 'playlists') && (
              <motion.div
                layout
                onClick={() => navigate('/playlist/liked-songs')}
                className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2 p-6 rounded-[2px] bg-gradient-to-br from-indigo-900 via-blue-900 to-black flex flex-col justify-end gap-4 cursor-pointer group relative overflow-hidden h-full min-h-[220px] border border-white/10"
              >
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
                  <Heart className="w-48 h-48 fill-blue-500 text-transparent" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Liked Tracks</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-400">{likedTracksCount} Signals</p>
                </div>
                <div className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  <Play className="w-6 h-6 text-black fill-black ml-1" />
                </div>
              </motion.div>
            )}

            {/* Liked Songs List Item */}
            {viewMode === 'list' && (filter === 'all' || filter === 'playlists') && (
              <motion.div
                layout
                onClick={() => navigate('/playlist/liked-songs')}
                className="flex items-center gap-4 p-3 rounded-[2px] bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all cursor-pointer group w-full"
              >
                <div className="w-14 h-14 rounded-[2px] bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center shadow-lg relative overflow-hidden">
                  <Heart className="w-6 h-6 fill-white text-white relative z-10" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                     <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white truncate">Liked Tracks</h4>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate">{likedTracksCount} Signals</p>
                </div>
              </motion.div>
            )}

            {/* Recent Activity Section */}
            {filter === 'all' && (
              <div className="col-span-full py-4 border-y border-white/5 my-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recently Interacted</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                  {recentItems.map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-36 sm:w-48 snap-start">
                      {item.type === 'artist' && <ArtistCard artist={item.data as any} />}
                      {item.type === 'track' && <TrackCard track={item.data as any} />}
                      {item.type === 'playlist' && <PlaylistCard playlist={item.data as any} />}
                      {item.type === 'user' && <UserCard user={item.data as any} />}
                      {item.type === 'nft' && <NFTCard nft={item.data as any} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Library Items */}
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} variant={viewMode === 'grid' ? 'default' : 'row'} className={viewMode === 'grid' ? "aspect-square" : "w-full"}/>
                ))
              ) : (
                libraryItems.map(item => renderLibraryItem(item))
              )}
            </AnimatePresence>

            {!isLoading && libraryItems.length === 0 && (
              <div className="col-span-full py-32 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <History className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">The Vault is Empty</h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest max-w-xs leading-relaxed">
                  Start collecting tracks, following artists, and discovering new sonic artifacts to populate your library.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Library;
