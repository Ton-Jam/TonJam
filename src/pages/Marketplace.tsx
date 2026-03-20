import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Satellite, TrendingUp, ChevronRight, Zap, Filter, Bell } from 'lucide-react';
import { MOCK_NFTS, TON_LOGO, MOCK_USER, MOCK_ARTISTS, MOCK_TRACKS } from '@/constants';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import TopChartNFTs from '@/components/TopChartNFTs';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

const TABS = ['Trending', 'Auctions', 'Genesis', 'Limited', 'My Bids', 'My NFTs'];
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Rarity'];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trending');
  const { addNotification, allNFTs, userProfile, searchQuery, setSearchQuery, marketplaceFilters, setMarketplaceFilters } = useAudio();
  const { genre: genreFilter, artist: artistFilter, rarity: rarityFilter, priceRange, sortBy } = marketplaceFilters;

  const setGenreFilter = (genre: string) => setMarketplaceFilters(prev => ({ ...prev, genre }));
  const setArtistFilter = (artist: string) => setMarketplaceFilters(prev => ({ ...prev, artist }));
  const setRarityFilter = (rarity: string) => setMarketplaceFilters(prev => ({ ...prev, rarity }));
  const setPriceRange = (range: [number, number]) => setMarketplaceFilters(prev => ({ ...prev, priceRange: range }));
  const setSortBy = (sort: string) => setMarketplaceFilters(prev => ({ ...prev, sortBy: sort }));

  const scrollRef = useRef<HTMLDivElement>(null);

  // Premium TonJam Experience: World-Class Marketplace
  // --------------------------------------------------
  // This update focuses on layout density, technical typography, 
  // and hardware-inspired interactive elements.

  const trendingNfts = useMemo(() => {
    return [...allNFTs]
      .sort((a, b) => {
        const offersA = a.offers?.length || 0;
        const offersB = b.offers?.length || 0;
        if (offersB !== offersA) return offersB - offersA;
        return parseFloat(b.price) - parseFloat(a.price);
      })
      .slice(0, 4);
  }, [allNFTs]);

  /* Sorting for Top 4 Most Bidded (based on number of offers) */
  const topBiddedNfts = useMemo(() => {
    return [...allNFTs]
      .filter(nft => nft.listingType === 'auction')
      .sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
      .slice(0, 4);
  }, [allNFTs]);

  const userBids = useMemo(() => {
    return allNFTs.filter(nft => nft.offers?.some(offer => offer.offerer === userProfile.walletAddress));
  }, [allNFTs, userProfile.walletAddress]);

  const myNfts = useMemo(() => {
    return allNFTs.filter(nft => nft.owner === userProfile.walletAddress);
  }, [allNFTs, userProfile.walletAddress]);

  const filteredNfts = useMemo(() => {
    let list = [...allNFTs].filter(nft => {
      const isMyNft = nft.owner === userProfile.walletAddress;
      if (activeTab === 'My NFTs') {
        if (!isMyNft) return false;
      } else {
        if (!nft.listingType) return false;
      }
      const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
      const track = MOCK_TRACKS.find(t => t.id === nft.trackId);
      const genre = track?.genre || 'Unknown';
      const matchesGenre = genreFilter === 'All' || genre === genreFilter;
      const matchesArtist = artistFilter === 'All' || nft.creator === artistFilter;
      const matchesRarity = rarityFilter === 'All' || nft.edition === rarityFilter;
      const price = parseFloat(nft.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      if (activeTab === 'Trending') return matchesSearch && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Genesis') return matchesSearch && nft.edition === 'Unique' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Limited') return matchesSearch && nft.edition === 'Limited' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Auctions') return matchesSearch && nft.listingType === 'auction' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'My Bids') return matchesSearch && nft.offers?.some(o => o.offerer === userProfile.walletAddress) && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'My NFTs') return matchesSearch && isMyNft && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      return matchesSearch && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
    });

    if (sortBy === 'Price: Low') list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'Price: High') list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'Rarity') {
      const rarityMap: any = { 'Unique': 3, 'Rare': 2, 'Limited': 1 };
      list.sort((a, b) => (rarityMap[b.edition] || 0) - (rarityMap[a.edition] || 0));
    }
    return list;
  }, [activeTab, searchQuery, sortBy, allNFTs]);

  /* Auto-scroll logic for Bidding Relay */
  useEffect(() => {
    if (topBiddedNfts.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [topBiddedNfts]);

  const calculateMarketCap = (nft: NFTItem) => {
    const price = parseFloat(nft.price);
    const supply = nft.edition === 'Unique' ? 1 : nft.edition === 'Limited' ? 100 : 500;
    return ((price || 0) * supply).toLocaleString();
  };

  return (
    <div className="animate-in fade-in duration-700 pb-40 w-full min-h-screen bg-background">
      {/* 1. COMPACT MARKET TICKER - Adjusted for Global Header */}
      <div className="z-[38] bg-background/90 backdrop-blur-xl py-2 px-6 flex items-center justify-center overflow-hidden whitespace-nowrap transition-all duration-300">
        <div className="flex gap-20 animate-[marquee_40s_linear_infinite]">
          {[
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
            { label: 'AVG FLOOR', val: '4.8 TON', up: false },
            { label: 'NET VOLUME', val: '1.2M TON', up: true },
            { label: 'ACTIVE BIDS', val: '1,242', up: true },
            { label: 'NODES', val: '8,421', up: true },
            { label: 'TON/USD', val: '$5.42', up: true },
            { label: 'MARKET CAP', val: '24.2M TON', up: true },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[7px] font-bold uppercase text-blue-500/50 tracking-[0.2em]">{stat.label}</span>
              <span className="text-[9px] font-bold text-foreground tracking-tighter font-mono bg-muted/50 px-1.5 py-0.5 rounded-[4px]">{stat.val}</span>
              <TrendingUp className={`h-2.5 w-2.5 ${stat.up ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 2. LIVE BIDDING RELAY - ENHANCED */}
        <section className="mb-8 mt-6">
          <div className="max-w-[1600px] mx-auto px-0 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.5em]">Live_Auction_Relay</h3>
              </div>
              <div className="flex gap-2">
                {topBiddedNfts.map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-muted"></div>
                ))}
              </div>
            </div>
            
            <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar snap-x gap-8 pb-4" >
              {topBiddedNfts.map((nft) => (
                <div key={nft.id} onClick={() => navigate(`/nft/${nft.id}`)} className="flex-shrink-0 w-full lg:w-[calc(50%-16px)] snap-center cursor-pointer group" >
                  <div className="relative aspect-[16/7] bg-white border border-blue-500/50 rounded-[12px] overflow-hidden transition-all group-hover:border-blue-500/80 shadow-2xl">
                    <img src={nft.imageUrl} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-[10s] group-hover:scale-105" alt={nft.title} />
                    <div className="absolute inset-0 flex items-center justify-center p-5">
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 backdrop-blur-md rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95"> BID </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* 3. REFINED CONTROLS - Clean Tab Filters */}
      <div className="z-[37] bg-background/95 backdrop-blur-2xl py-6 w-full px-0 md:px-6 mb-8 transition-all duration-300 filter-section">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6 px-4 md:px-0">
          {/* Tab Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 flex-1">
              {TABS.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${ activeTab === tab ? 'bg-blue-500 text-white border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-muted/50 text-blue-500 dark:text-neutral-500 border-silver-300 dark:border-border hover:text-blue-600 dark:hover:text-neutral-400 inactive-pill' }`} 
                >
                  {tab}
                  {tab === 'My Bids' && userBids.length > 0 && (
                    <span className="ml-2 text-blue-300 font-mono">[{userBids.length}]</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-0 md:px-6">
        {/* 5. MARKET SECTIONS - BENTO STYLE */}
        <div className="space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-bold tracking-tighter uppercase text-foreground">Trending Track NFTs</h2>
              <button onClick={() => navigate('/explore/nfts?filter=trending_tracks')} className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-blue-500 transition-all flex items-center group">
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar snap-x gap-6 pb-4">
              {allNFTs.slice(0, 8).map((nft) => (
                <div key={nft.id} className="flex-shrink-0 w-[240px] snap-start">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-bold tracking-tighter uppercase text-foreground">Most Bidded NFTs</h2>
              <button onClick={() => navigate('/explore/nfts?filter=most_bidded')} className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-blue-500 transition-all flex items-center group">
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar snap-x gap-6 pb-4">
              {allNFTs.sort((a,b) => (b.offers?.length || 0) - (a.offers?.length || 0)).slice(0, 8).map((nft) => (
                <div key={nft.id} className="flex-shrink-0 w-[200px] snap-start">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-bold tracking-tighter uppercase text-foreground">Recommended Tracks</h2>
              <button onClick={() => navigate('/explore/tracks')} className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-blue-500 transition-all flex items-center group">
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar snap-x gap-6 pb-4">
              {allNFTs.slice(0, 8).map((nft) => (
                <div key={nft.id} className="flex-shrink-0 w-[240px] snap-start">
                  <NFTCard nft={nft} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-bold tracking-tighter uppercase text-foreground">Trending Creators</h2>
              <button onClick={() => navigate('/explore/artists')} className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest hover:text-blue-500 transition-all flex items-center group">
                VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar snap-x gap-6 pb-4">
              {MOCK_ARTISTS.map((artist) => (
                <div key={artist.id} className="flex-shrink-0 snap-start">
                  <ArtistCard artist={artist} variant="compact" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 6. MAIN MARKET GRID */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-1.5 h-10 bg-muted rounded-full"></div>
              <h2 className="text-[14px] font-bold tracking-tighter uppercase text-foreground leading-none">Market Explorer</h2>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">
              {filteredNfts.length} Protocols Found
            </div>
          </div>
          
          {filteredNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {filteredNfts.map((nft, idx) => (
                <motion.div 
                  key={nft.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <NFTCard nft={nft} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center rounded-[16px] text-center bg-white border border-border/50">
              <div className="w-24 h-24 rounded-full bg-foreground/[0.02] border border-border/50 flex items-center justify-center mb-8">
                <Satellite className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter text-muted-foreground">Signal Mismatch</h3>
              <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em] mt-3 px-12 max-w-md mx-auto leading-loose">No matching signals detected in the market relay. Adjust your scanner parameters.</p>
              <button onClick={() => { setActiveTab('Trending'); setSearchQuery(''); }} className="px-12 py-5 mt-12 bg-muted/50 border border-border rounded-[10px] text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95" > Reset Scanner </button>
            </div>
          )}
        </section>

        {/* 7. ALPHA DROP / SUBSCRIPTION */}
        <section className="pb-32">
          <div className="bg-white border border-neutral-500/20 p-12 md:p-16 rounded-[20px] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] -rotate-12 group-hover:opacity-[0.06] transition-opacity"><Zap className="h-64 w-64 text-blue-500" /></div>
            <div className="text-center lg:text-left relative z-10">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.6em]">Genesis Whitelist</span>
              </div>
              <h4 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-black leading-none mb-6">THE NEURAL <br /> DROP</h4>
              <p className="text-xs text-neutral-500 uppercase tracking-[0.4em] max-w-md leading-relaxed">Subscribe to the relay for exclusive mint protocols and early access to genesis artifacts.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
              <input type="email" placeholder="NEURAL_ID@NETWORK.COM" className="flex-1 lg:w-80 bg-muted/50 border border-border rounded-[10px] px-6 py-5 text-xs font-bold outline-none text-foreground focus:border-neutral-500/50 transition-all placeholder:text-muted-foreground/50 dark:placeholder:text-neutral-500" />
              <button className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[10px] font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">SYNC_NOW</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Marketplace;
