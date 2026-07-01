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
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, APP_LOGO, CURATED_PLAYLISTS, MOCK_USERS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
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
  const [page, setPage] = useState(1);

  /* Initial load */
  useEffect(() => {
    setLoading(true);
    let initialData: any[] = [];

    if (type === 'tracks') {
      if (filter === 'recent') {
        initialData = recentlyPlayed;
      } else if (filter === 'favorites') {
        initialData = allTracks.filter(t => likedTrackIds.includes(t.id));
      } else if (filter === 'trending') {
        initialData = getTrendingTracks();
      } else if (filter === 'new') {
        // Mock logic for new releases
        initialData = MOCK_TRACKS.slice(0, 20);
      } else if (filter === 'my_tracks') {
        initialData = userTracks;
      } else if (filter === 'recommended') {
        initialData = getRecommendations().recommendedTracks;
      } else {
        initialData = [...userTracks, ...MOCK_TRACKS];
      }
    } else if (type === 'artists') {
      if (filter === 'followed') {
        initialData = artists.filter(a => followedUserIds.includes(a.uid));
      } else if (filter === 'friends') {
        // Mock friends logic
        initialData = artists.filter(a => userProfile.friends?.includes(a.uid));
      } else if (filter === 'recommended') {
        initialData = artists.filter(a => !followedUserIds.includes(a.uid)).slice(0, 10);
      } else if (filter === 'rising') {
        initialData = artists.slice(0, 5);
      } else {
        initialData = artists;
      }
    } else if (type === 'nfts') {
      if (filter === 'owned' || filter === 'my_nfts') {
        initialData = allNFTs.filter(n => n.owner === userProfile.walletAddress || n.owner === userProfile.name);
      } else if (filter === 'top_nfts') {
        initialData = getTopNFTTracks(); // This returns tracks, but we need NFTs. 
        // Fallback to mock top NFTs
        initialData = MOCK_NFTS.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      } else if (filter === 'new_nfts') {
        initialData = MOCK_NFTS.slice(0, 10);
      } else if (filter === 'trending_nfts') {
         initialData = MOCK_NFTS.slice(0, 10);
      } else if (filter === 'recommended') {
         initialData = getRecommendations().recommendedNFTs;
      } else {
        initialData = [...userNFTs, ...MOCK_NFTS];
      }
    } else if (type === 'playlists') {
      if (filter === 'curated') {
        initialData = CURATED_PLAYLISTS;
      } else if (filter === 'my_playlists') {
        initialData = allPlaylists.filter(p => p.creator === userProfile.name || p.creator === 'You');
      } else {
        initialData = [...allPlaylists, ...CURATED_PLAYLISTS];
      }
    } else if (type === 'users') {
      initialData = MOCK_USERS;
    }

    /* Simulate API delay */
    setTimeout(() => {
      setItems(initialData);
      setLoading(false);
    }, 800);
  }, [type, filter, userTracks, userNFTs, artists, recentlyPlayed, likedTrackIds, followedUserIds, userProfile, allPlaylists, allTracks, allNFTs, getRecommendations]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = item.title || item.name || '';
      const creator = item.artist || item.creator || '';
      return name.toLowerCase().includes(search.toLowerCase()) || creator.toLowerCase().includes(search.toLowerCase());
    });
  }, [items, search]);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    /* Simulate infinite scroll by appending more mock data */
    setTimeout(() => {
      setItems(prev => [...prev, ...prev.slice(0, 6)]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 1000);
  };

  const sentinelRef = useInfiniteScroll(loadMore);

  return (
    <div className="animate-in fade-in duration-700 px-4 md:px-4 pb-4">
      {/* Sticky Header with Explicit Back Navigation */}
      <div className="sticky top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-3xl -mx-4 px-4 md:-mx-4 md:px-4 pt-4 pb-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <BackButton 
              className="p-4 rounded-full bg-muted/50 hover:bg-muted transition-all"
              iconClassName="h-4 w-4 text-zinc-700"
            />
            
            {isSearchActive ? (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${type}...`}
                className="w-full bg-muted/50 py-3 pl-4 pr-4 text-xs outline-none border-2 border-blue-500 focus:border-blue-500 transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 rounded-full text-foreground"
                autoFocus
              />
            ) : (
              <h1 className="text-base md:text-[21px] font-bold tracking-tighter uppercase text-zinc-800 dark:text-foreground leading-none">
                {title}
              </h1>
            )}
          </div>
          
          <button onClick={() => setIsSearchActive(!isSearchActive)} className="p-4 rounded-full bg-muted/50 hover:bg-muted transition-all">
            {isSearchActive ? <X className="h-4 w-4 text-foreground" /> : <Search className="h-4 w-4 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Vertical Grid Content */}
      <div className={`grid gap-4 pb-4 ${
        type === 'nfts' || type === 'users' 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
          : type === 'artists' || type === 'playlists'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
      }`}>
        {filteredItems.map((item, idx) => (
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