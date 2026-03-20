import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Satellite } from 'lucide-react';
import TrackCard from '@/components/TrackCard';
import UserCard from '@/components/UserCard';
import ArtistCard from '@/components/ArtistCard';
import NFTCard from '@/components/NFTCard';
import PlaylistListItem from '@/components/PlaylistListItem';
import ArtistListItem from '@/components/ArtistListItem';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, APP_LOGO, CURATED_PLAYLISTS, MOCK_USERS } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import PlaylistCard from '@/components/PlaylistCard';
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
        initialData = artists.filter(a => followedUserIds.includes(a.id));
      } else if (filter === 'friends') {
        // Mock friends logic
        initialData = artists.filter(a => userProfile.friends?.includes(a.id));
      } else if (filter === 'recommended') {
        initialData = artists.filter(a => !followedUserIds.includes(a.id)).slice(0, 10);
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
    <div className="animate-in fade-in duration-700 px-4 md:px-12 pb-32">
      {/* Sticky Header with Explicit Back Navigation */}
      <div className="sticky top-[var(--header-height,64px)] left-0 right-0 z-[60] bg-background/95 backdrop-blur-3xl -mx-4 px-4 md:-mx-12 md:px-12 pt-3 pb-3 -b mb-4">
        <div className="flex flex-col gap-2">
          {/* Top Row: Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${type}...`}
                className="w-full bg-muted/50 py-2 pl-10 pr-6 text-xs outline-none focus:border-blue-500/30 transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500 rounded-full text-foreground"
              />
            </div>
          </div>
          {/* Bottom Row: Section Title */}
          <div className="px-1">
            <h1 className="text-xl md:text-3xl font-bold tracking-tighter uppercase text-foreground leading-none">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Vertical Grid Content */}
      <div className={`grid gap-4 pb-8 ${type === 'nfts' || type === 'users' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
        {filteredItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="animate-in fade-in duration-500 slide-in-from-bottom-2">
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
        <div className="py-20 flex items-center justify-center">
          <img src={APP_LOGO} className="w-8 h-8 object-contain animate-[spin_3s_linear_infinite] opacity-50" alt="Loading..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="py-48 text-center flex flex-col items-center">
          <Satellite className="h-16 w-16 text-foreground/5 mb-8" />
          <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.4em]">Zero signals detected</p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="mt-8 text-[10px] font-bold uppercase text-blue-500 -b -blue-500/30 pb-1"
          >
            Reset Scanner
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreList;