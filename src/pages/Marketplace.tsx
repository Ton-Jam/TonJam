import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Satellite, TrendingUp, ChevronRight, Zap, Filter, Bell, Rocket, Box } from 'lucide-react';
import { MOCK_NFTS, TON_LOGO, MOCK_USER, MOCK_ARTISTS, MOCK_TRACKS } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import TopChartNFTs from '@/components/TopChartNFTs';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  const [displayCount, setDisplayCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement>(null);

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
  }, [activeTab, searchQuery, sortBy, allNFTs, userProfile.walletAddress, genreFilter, artistFilter, rarityFilter, priceRange]);

  const displayedNfts = useMemo(() => {
    return filteredNfts.slice(0, displayCount);
  }, [filteredNfts, displayCount]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredNfts.length) {
          setDisplayCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [filteredNfts.length, displayCount]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(10);
  }, [activeTab, searchQuery, sortBy, genreFilter, artistFilter, rarityFilter, priceRange]);

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

  const featuredArtists = useMemo(() => {
    // Artists who have at least one NFT listed
    const artistNamesWithNFTs = new Set(allNFTs.map(nft => nft.creator));
    return MOCK_ARTISTS.filter(artist => artistNamesWithNFTs.has(artist.name)).slice(0, 6);
  }, [allNFTs]);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      </div>

      <div className="relative z-10 animate-in fade-in duration-700 pb-4">
        {/* 1. COMPACT MARKET TICKER */}
        <div className="z-[38] bg-background/40 backdrop-blur-xl py-2 px-4 flex items-center justify-center overflow-hidden whitespace-nowrap border-b border-border/50 dark:border-transparent">
          <div className="flex gap-4 animate-[marquee_40s_linear_infinite]">
            {[
              { label: 'TON/USD', val: '$5.42', up: true },
              { label: 'MARKET CAP', val: '24.2M TON', up: true },
              { label: 'AVG FLOOR', val: '4.8 TON', up: false },
              { label: 'NET VOLUME', val: '1.2M TON', up: true },
              { label: 'ACTIVE BIDS', val: '1,242', up: true },
              { label: 'NODES', val: '8,421', up: true },
            ].map((stat, i) => (
              <div key={`stat-${i}`} className="flex items-center gap-2">
                <span className="text-[7px] font-bold uppercase text-blue-400/50 tracking-[0.2em]">{stat.label}</span>
                <span className="text-[9px] font-bold text-foreground tracking-tighter font-mono bg-muted/50 px-2 py-1 rounded-[4px] border border-border/50 dark:border-transparent">{stat.val}</span>
                <TrendingUp className={`h-3 w-3 ${stat.up ? 'text-emerald-400' : 'text-rose-400 rotate-180'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Floor Price Analytics Cards */}
        <section className="mb-2 mt-2 max-w-[1600px] mx-auto px-4 md:px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">

            {/* Floor Price */}
            <div className="flex-shrink-0 w-[110px] sm:w-auto sm:flex-1 bg-muted/30 backdrop-blur-md rounded-xl p-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative z-10 flex flex-col">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                  Floor Price
                </p>
                <div className="flex items-end gap-1 mb-0.5">
                  <h3 className="text-sm font-black tracking-tighter text-foreground leading-none">
                    {Math.min(...allNFTs.map(nft => parseFloat(nft.price))).toFixed(2)} TON
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="h-2 w-2" />
                  <span className="text-[7px] font-bold uppercase tracking-wider">
                    Lowest Entry
                  </span>
                </div>
              </div>
            </div>

            {/* Highest Sale */}
            <div className="flex-shrink-0 w-[110px] sm:w-auto sm:flex-1 bg-muted/30 backdrop-blur-md rounded-xl p-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-600/5 opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative z-10 flex flex-col">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                  Highest Sale
                </p>
                <div className="flex items-end gap-1 mb-0.5">
                  <h3 className="text-sm font-black tracking-tighter text-foreground leading-none">
                    {Math.max(...allNFTs.map(nft => parseFloat(nft.price))).toFixed(2)} TON
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Rocket className="h-2 w-2" />
                  <span className="text-[7px] font-bold uppercase tracking-wider">
                    Premium Value
                  </span>
                </div>
              </div>
            </div>

            {/* Total Market Volume */}
            <div className="flex-shrink-0 w-[110px] sm:w-auto sm:flex-1 bg-muted/30 backdrop-blur-md rounded-xl p-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative z-10 flex flex-col">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                  Market Volume
                </p>
                <div className="flex items-end gap-1 mb-0.5">
                  <h3 className="text-sm font-black tracking-tighter text-foreground leading-none">
                    {allNFTs
                      .reduce((sum, nft) => sum + parseFloat(nft.price), 0)
                      .toFixed(2)} TON
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <Zap className="h-2 w-2" />
                  <span className="text-[7px] font-bold uppercase tracking-wider">
                    Total Liquidity
                  </span>
                </div>
              </div>
            </div>

            {/* Active Auctions */}
            <div className="flex-shrink-0 w-[110px] sm:w-auto sm:flex-1 bg-muted/30 backdrop-blur-md rounded-xl p-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative z-10 flex flex-col">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                  Active Auctions
                </p>
                <div className="flex items-end gap-1 mb-0.5">
                  <h3 className="text-sm font-black tracking-tighter text-foreground leading-none">
                    {allNFTs.filter(nft => nft.listingType === 'auction').length}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Bell className="h-2 w-2" />
                  <span className="text-[7px] font-bold uppercase tracking-wider">
                    Live Bidding
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. LIVE BIDDING RELAY - ENHANCED GLASS */}
        <section className="mb-2 mt-2">
          <div className="max-w-[1600px] mx-auto px-4 md:px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                <h3 className="text-[11px] font-bold text-foreground/80 uppercase tracking-[0.5em]">Live_Auction_Relay</h3>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/auctions')}
                  className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 p-0 h-auto"
                >
                  View Full Screen <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                {topBiddedNfts.map((_, i) => (
                  <div key={`indicator-${i}`} className="w-1 h-1 rounded-full bg-foreground/20"></div>
                ))}
              </div>
            </div>
            
            <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2 -mx-4 px-4" >
              {topBiddedNfts.map((nft) => (
                <div key={nft.id} onClick={() => navigate(`/nft/${nft.id}`)} className="flex-shrink-0 w-full lg:w-[calc(50%-16px)] snap-center cursor-pointer group" >
                  <div className="relative aspect-[21/9] bg-muted/50 backdrop-blur-md border border-border dark:border-transparent rounded-[16px] overflow-hidden transition-all group-hover:border-primary/40 shadow-2xl">
                    <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`, 800, 400)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-[10s] group-hover:scale-105" alt={nft.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h4 className="text-lg font-bold uppercase tracking-tighter text-white mb-1">{nft.title}</h4>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Current Bid: {nft.price} TON</p>
                      </div>
                      <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-[8px] text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-blue-600/20"> 
                        PLACE BID 
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. REFINED CONTROLS - Clean Tab Filters */}
        <div className="sticky top-0 lg:top-[var(--header-height,64px)] z-[37] bg-background/20 backdrop-blur-2xl py-2 w-full px-4 md:px-4 mb-2 border-b border-border/50 dark:border-transparent">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            {/* Tab Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${ activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-muted/50 backdrop-blur-md text-muted-foreground border-border dark:border-transparent hover:text-foreground hover:bg-muted' }`} 
                >
                  {tab}
                  {tab === 'My Bids' && userBids.length > 0 && (
                    <span className="ml-2 text-blue-400 font-mono">[{userBids.length}]</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-4">
          {activeTab === 'Genesis' && (
            <div className="mb-4 p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white border-none font-black italic">ULTRA RARE</Badge>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Protocol Level: 01</span>
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">The Genesis Forge is Active</h3>
                <p className="text-muted-foreground text-sm max-w-lg">Enter the dedicated Genesis portal for a hardware-grade experience, deep lore, and high-fidelity artifact showcase.</p>
              </div>
              <Button 
                onClick={() => navigate('/genesis-forge')}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black italic px-8 h-14 group shadow-xl shadow-blue-500/20"
              >
                Go to Forge Fullscreen <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
          {/* 5. MARKET SECTIONS - BENTO STYLE */}
          <div className="space-y-2">
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h2 className="text-[12px] font-bold tracking-tighter uppercase text-foreground/90">Trending Track NFTs</h2>
                </div>
                <button onClick={() => navigate('/trending-nfts')} className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest hover:text-primary transition-all flex items-center group">
                  VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-2 pb-2 -mx-4 px-4">
                {allNFTs.slice(0, 8).map((nft) => (
                  <div key={nft.id} className="flex-shrink-0 w-[160px] snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-600 rounded-full" />
                  <h2 className="text-[12px] font-bold tracking-tighter uppercase text-foreground/90">Limited Audio Artifacts</h2>
                </div>
                <button onClick={() => navigate('/limited-editions')} className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest hover:text-primary transition-all flex items-center group">
                  EXPLORE SCARCITY <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-2 pb-2 -mx-4 px-4">
                {allNFTs.filter(n => n.edition !== 'Open' && n.edition !== 'Unlimited').slice(0, 8).map((nft) => (
                  <div key={nft.id} className="flex-shrink-0 w-[160px] snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-600 rounded-full" />
                  <h2 className="text-[12px] font-bold tracking-tighter uppercase text-foreground/90">Most Bidded NFTs</h2>
                </div>
                <button onClick={() => navigate('/explore/nfts?filter=most_bidded')} className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest hover:text-primary transition-all flex items-center group">
                  VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-2 pb-2 -mx-4 px-4">
                {allNFTs.sort((a,b) => (b.offers?.length || 0) - (a.offers?.length || 0)).slice(0, 8).map((nft) => (
                  <div key={nft.id} className="flex-shrink-0 w-[160px] snap-start">
                    <NFTCard nft={nft} />
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Artists Section */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-600 rounded-full" />
                  <h2 className="text-[12px] font-bold tracking-tighter uppercase text-foreground/90">Featured Protocol Architects</h2>
                </div>
                <button onClick={() => navigate('/discover?tab=Artists')} className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest hover:text-primary transition-all flex items-center group">
                  VIEW ALL <ChevronRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2 -mx-4 px-4">
                {featuredArtists.map((artist) => (
                  <div key={artist.uid} className="flex-shrink-0 w-[140px] snap-start">
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            </section>

            {/* 6. MAIN MARKET GRID */}
            <section className="mb-4">
              {activeTab === 'My NFTs' && (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-[24px] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Box className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white leading-tight">Your Digital Inventory</h3>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Manage and list your sonic artifacts on the marketplace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Assets</p>
                      <p className="text-xl font-black text-white">{myNfts.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Listed</p>
                      <p className="text-xl font-black text-emerald-400">{myNfts.filter(n => n.listingType).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Unlisted</p>
                      <p className="text-xl font-black text-amber-400">{myNfts.filter(n => !n.listingType).length}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-foreground/10 rounded-full"></div>
                  <h2 className="text-[20px] font-bold tracking-tighter uppercase text-foreground leading-none">Market Explorer</h2>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.4em]">
                  {filteredNfts.length} Protocols Found
                </div>
              </div>
              
              {filteredNfts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredNfts.map((nft, idx) => (
                      <motion.div 
                        key={nft.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx % 10) * 0.05 }}
                      >
                        <NFTCard nft={nft} />
                      </motion.div>
                    ))}
                  </div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center rounded-[24px] text-center bg-muted/50 backdrop-blur-xl border border-border dark:border-transparent">
                  <div className="w-24 h-24 rounded-full bg-primary/5 border border-border/50 dark:border-transparent flex items-center justify-center mb-4">
                    <Satellite className="h-10 w-10 text-primary/40 animate-pulse" />
                  </div>
                  <h3 className="text-[20px] font-bold uppercase tracking-tighter text-foreground">Signal Mismatch</h3>
                  <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em] mt-4 px-4 max-w-md mx-auto leading-loose">No matching signals detected in the market relay. Adjust your scanner parameters.</p>
                  <button onClick={() => { setActiveTab('Trending'); setSearchQuery(''); }} className="px-4 py-4 mt-4 bg-muted border border-border dark:border-transparent rounded-[12px] text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:bg-muted/80 transition-all active:scale-95" > Reset Scanner </button>
                </div>
              )}
            </section>

            {/* 7. ALPHA DROP / SUBSCRIPTION */}
            <section className="pb-4">
              <div className="bg-muted/30 backdrop-blur-md p-4 md:p-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] -rotate-12 group-hover:opacity-[0.06] transition-opacity"><Zap className="h-32 w-32 text-primary" /></div>
                <div className="text-center lg:text-left relative z-10">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.4em]">Genesis Whitelist</span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-foreground leading-none mb-2">THE NEURAL DROP</h4>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] max-w-md leading-relaxed">Subscribe to the relay for exclusive mint protocols and early access.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto relative z-10">
                  <input type="email" placeholder="NEURAL_ID@NETWORK.COM" className="flex-1 lg:w-64 bg-muted/50 rounded-xl px-3 py-2 text-[10px] font-bold outline-none text-foreground focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30" />
                  <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95 transition-all">SYNC_NOW</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
