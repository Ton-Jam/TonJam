import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import UserCard from '../components/UserCard';
import NFTCard from '../components/NFTCard';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS } from '../constants';
import { useAudio } from '../context/AudioContext';

const ExploreList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useAudio();
  
  const queryParams = new URLSearchParams(location.search);
  const title = queryParams.get('title') || 'Explore';
  
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Initial load
  useEffect(() => {
    setLoading(true);
    let initialData: any[] = [];
    if (type === 'tracks') initialData = MOCK_TRACKS;
    if (type === 'artists') initialData = MOCK_ARTISTS;
    if (type === 'nfts') initialData = MOCK_NFTS;
    
    // Simulate API delay
    setTimeout(() => {
      setItems(initialData);
      setLoading(false);
    }, 800);
  }, [type]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = item.title || item.name || '';
      const creator = item.artist || item.creator || '';
      return name.toLowerCase().includes(search.toLowerCase()) || 
             creator.toLowerCase().includes(search.toLowerCase());
    });
  }, [items, search]);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    
    // Simulate infinite scroll by appending more mock data
    setTimeout(() => {
      setItems(prev => [...prev, ...prev.slice(0, 6)]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 1000);
  };

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  return (
    <div className="animate-in fade-in duration-700 px-4 md:px-12 pb-32">
      {/* Sticky Header with Explicit Back Navigation */}
      <div className="sticky top-0 left-0 right-0 z-[60] bg-black/95 backdrop-blur-3xl -mx-4 px-4 md:-mx-12 md:px-12 pt-4 pb-4 border-b border-white/5 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row: Back Button & Search Bar */}
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              aria-label="Go back"
            >
              <i className="fas fa-arrow-left text-sm"></i>
            </button>
            
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]"></i>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${type}...`} 
                className="w-full bg-white/5 border border-white/5 py-2.5 pl-12 pr-6 text-xs outline-none focus:border-blue-500/30 transition-all placeholder:text-white/10 rounded-xl italic text-white"
              />
            </div>
          </div>

          {/* Bottom Row: Section Title */}
          <div className="px-1">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Grid Content - Gap-4 for Card Sizing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
        {filteredItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="animate-in fade-in duration-500 slide-in-from-bottom-2">
            {type === 'tracks' && <TrackCard track={item} />}
            {type === 'nfts' && <NFTCard nft={item} />}
            {type === 'artists' && <UserCard user={item} variant="portrait" />}
          </div>
        ))}
      </div>

      {/* Subtle Loading State */}
      {loading && (
        <div className="py-20 flex items-center justify-center">
          <div className="flex gap-2 items-end h-4">
            <div className="w-1.5 bg-blue-500/30 animate-[bounce_0.6s_infinite_0.1s] rounded-full"></div>
            <div className="w-1.5 bg-blue-500/30 animate-[bounce_0.6s_infinite_0.2s] rounded-full"></div>
            <div className="w-1.5 bg-blue-500/30 animate-[bounce_0.6s_infinite_0.3s] rounded-full"></div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="py-48 text-center flex flex-col items-center">
          <i className="fas fa-satellite-dish text-white/5 text-6xl mb-8"></i>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] italic">Zero signals detected</p>
          <button 
            type="button"
            onClick={() => setSearch('')}
            className="mt-8 text-[10px] font-black uppercase text-blue-500 border-b border-blue-500/30 pb-1"
          >
            Reset Scanner
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreList;