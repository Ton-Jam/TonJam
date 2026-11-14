import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { ArrowLeft, Search, Satellite, X } from 'lucide-react';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import ArtistCard from '@/components/ArtistCard';
import NFTCard from '@/components/NFTCard';
import PlaylistListItem from '@/components/PlaylistListItem';
import ArtistListItem from '@/components/ArtistListItem';
import { APP_LOGO } from '@/constants';
import { useAudio } from '@/contexts/AudioContext';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import PlaylistCard from '@/components/PlaylistCard';
import NoResultsState from '@/components/NoResultsState';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const ExploreList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    addNotification, 
    userTracks, 
    userNFTs, 
    artists, 
    allPlaylists, 
    recentlyPlayed, 
    likedTrackIds, 
    followedUserIds, 
    userProfile, 
    getTrendingTracks, 
    getTopNFTTracks,
    getRecommendations,
    allTracks,
    allNFTs
  } = useAudio();
  const queryParams = new URLSearchParams(location.search);
  const title = queryParams.get('title') || 'Explore';
  const filter = queryParams.get('filter');
  const initialSearch = queryParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  /* Initial load */
  useEffect(() => {
    let active = true;
    setVisibleCount(24);

    if (type === 'users') {
      setLoading(true);
      getDocs(query(collection(db, 'users'), limit(50)))
        .then((snap) => {
          if (!active) return;
          setItems(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        })
        .catch((err) => handleFirestoreError(err, OperationType.LIST, 'users'))
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => { active = false; };
    }

    let initialData: any[] = [];

    if (type === 'tracks') {
      if (filter === 'recent') {
        initialData = recentlyPlayed;
      } else if (filter === 'favorites') {
        initialData = allTracks.filter(t => likedTrackIds.includes(t.id));
      } else if (filter === 'trending') {
        initialData = getTrendingTracks();
      } else if (filter === 'new') {
        initialData = [...allTracks]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 20);
      } else if (filter === 'my_tracks') {
        initialData = userTracks;
      } else if (filter === 'recommended') {
        initialData = getRecommendations().recommendedTracks;
      } else {
        initialData = Array.from(new Map([...userTracks, ...allTracks].map(t => [t.id, t])).values());
      }
    } else if (type === 'artists') {
      if (filter === 'followed') {
        initialData = artists.filter(a => followedUserIds.includes(a.uid));
      } else if (filter === 'friends') {
        initialData = artists.filter(a => userProfile.friends?.includes(a.uid));
      } else if (filter === 'recommended') {
        initialData = artists.filter(a => !followedUserIds.includes(a.uid)).slice(0, 10);
      } else if (filter === 'rising') {
        initialData = [...artists].slice(0, 5);
      } else {
        initialData = artists;
      }
    } else if (type === 'nfts') {
      if (filter === 'owned' || filter === 'my_nfts') {
        initialData = allNFTs.filter(n => n.owner === userProfile.walletAddress || n.owner === userProfile.name || n.ownerId === userProfile.uid);
      } else if (filter === 'top_nfts') {
        initialData = [...allNFTs].sort((a, b) => parseFloat(String(b.price || 0)) - parseFloat(String(a.price || 0)));
      } else if (filter === 'new_nfts') {
        initialData = [...allNFTs]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 20);
      } else if (filter === 'trending_nfts') {
        initialData = [...allNFTs]
          .sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
          .slice(0, 20);
      } else if (filter === 'recommended') {
        initialData = getRecommendations().recommendedNFTs;
      } else {
        initialData = Array.from(new Map([...userNFTs, ...allNFTs].map(n => [n.id, n])).values());
      }
    } else if (type === 'playlists') {
      if (filter === 'curated') {
        initialData = allPlaylists.filter(p => (p as any).isCurated || !p.isPrivate);
      } else if (filter === 'my_playlists') {
        initialData = allPlaylists.filter(p => p.creator === userProfile.name || (p as any).creatorId === userProfile.uid || p.creator === 'You');
      } else {
        initialData = allPlaylists;
      }
    }

    setItems(initialData);
    setLoading(false);
    return () => { active = false; };
  }, [type, filter, userTracks, userNFTs, artists, recentlyPlayed, likedTrackIds, followedUserIds, userProfile, allPlaylists, allTracks, allNFTs, getRecommendations, getTrendingTracks]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = item.title || item.name || '';
      const creator = item.artist || item.creator || '';
      return name.toLowerCase().includes(search.toLowerCase()) || creator.toLowerCase().includes(search.toLowerCase());
    });
  }, [items, search]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

  const loadMore = () => {
    if (loading || visibleCount >= filteredItems.length) return;
    setVisibleCount(prev => prev + 24);
  };

  const sentinelRef = useInfiniteScroll(loadMore);

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 text-left">
      {/* Sticky Header with Explicit Back Navigation */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md pt-2 pb-4 mb-6">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <BackButton 
              className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all shrink-0"
              iconClassName="h-4 w-4 text-white"
            />
            
            {isSearchActive ? (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${type}...`}
                className="w-full bg-white/[0.06] focus:bg-white/[0.1] py-2.5 px-4 text-sm outline-none transition-all placeholder:text-zinc-500 rounded-full text-white"
                autoFocus
              />
            ) : (
              <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase text-white leading-none">
                {title}
              </h1>
            )}
          </div>
          
          <button 
            onClick={() => setIsSearchActive(!isSearchActive)} 
            className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all shrink-0"
            aria-label={isSearchActive ? "Close search" : "Open search"}
          >
            {isSearchActive ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Vertical Grid Content */}
      <div className={`grid gap-3 sm:gap-4 pb-6 ${
        type === 'nfts' || type === 'users' 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
          : type === 'artists' || type === 'playlists'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
      }`}>
        {visibleItems.map((item, idx) => (
          <div key={`${item.uid || item.id}-${idx}`} className="animate-in fade-in duration-500 slide-in-from-bottom-2">
            {type === 'tracks' && <TrackCard track={item} variant="row" />}
            {type === 'nfts' && <NFTCard nft={item} />}
            {type === 'artists' && <ArtistListItem artist={item} />}
            {type === 'playlists' && <PlaylistListItem playlist={item} onClick={() => navigate(`/playlist/${item.id}`)} />}
            {type === 'users' && <UserCard user={item} />}
          </div>
        ))}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10" />
      </div>

      {/* Subtle Loading State */}
      {loading && (
        <div className="py-4 flex items-center justify-center">
          <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="pt-4 pb-12">
          <NoResultsState query={search ? search : undefined} onReset={() => setSearch('')} />
        </div>
      )}
    </div>
  );
};

export default ExploreList;