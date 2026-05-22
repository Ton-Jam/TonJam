import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Satellite, TrendingUp, ChevronRight, Zap, Filter, Bell, Rocket, Box } from 'lucide-react';
import { MOCK_NFTS, TON_LOGO, MOCK_USER, MOCK_ARTISTS, MOCK_TRACKS } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';
import NFTCard from '@/components/NFTCard';
import ArtistCard from '@/components/ArtistCard';
import TopChartNFTs from '@/components/TopChartNFTs';
import SkeletonCard from '@/components/SkeletonCard';
import Leaderboard from '@/components/Leaderboard';
import { useAudio } from '@/context/AudioContext';
import { NFTItem } from '@/types';
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const TABS = ['Trending', 'New Signal', 'Auctions', 'Genesis', 'Limited', 'My Bids', 'My NFTs'];
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Rarity'];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trending');
  const { addNotification, allNFTs, userProfile, searchQuery, setSearchQuery, marketplaceFilters, setMarketplaceFilters, isLoading } = useAudio();
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
      if (activeTab === 'New Signal') return matchesSearch && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Genesis') return matchesSearch && nft.edition === 'Unique' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Limited') return matchesSearch && nft.edition === 'Limited' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'Auctions') return matchesSearch && nft.listingType === 'auction' && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'My Bids') return matchesSearch && nft.offers?.some(o => o.offerer === userProfile.walletAddress) && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      if (activeTab === 'My NFTs') return matchesSearch && isMyNft && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
      return matchesSearch && matchesGenre && matchesArtist && matchesPrice && matchesRarity;
    });

    if (activeTab === 'New Signal') {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'Price: Low') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'Price: High') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
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
        <div className="px-4 pt-4 pb-2 max-w-[1600px] mx-auto flex flex-col gap-4">
          <div className="bg-muted/30 backdrop-blur-xl py-2 px-3 rounded-xl flex items-center justify-center overflow-hidden whitespace-nowrap border border-border/50">
            <div className="flex gap-6 animate-[marquee_50s_linear_infinite]">
              {[
                { label: 'TON/USD', val: '$5.42', up: true },
                { label: 'MARKET CAP', val: '24.2M TON', up: true },
                { label: 'AVG FLOOR', val: '4.8 TON', up: false },
                { label: 'NET VOLUME', val: '1.2M TON', up: true },
                { label: 'ACTIVE BIDS', val: '1,242', up: true },
                { label: 'NODES', val: '8,421', up: true },
              ].concat([
                { label: 'TON/USD', val: '$5.42', up: true },
                { label: 'MARKET CAP', val: '24.2M TON', up: true },
                { label: 'AVG FLOOR', val: '4.8 TON', up: false },
              ]).map((stat, i) => (
                <div key={`stat-${i}`} className="flex items-center gap-2">
                  <span className="market-label !text-[7px]">{stat.label}</span>
                  <span className="font-mono text-[10px] font-bold">{stat.val}</span>
                  <TrendingUp className={`h-3 w-3 ${stat.up ? 'text-emerald-400' : 'text-rose-400 rotate-180'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Price Analytics Cards */}
        <section className="mb-6 mt-2 max-w-[1600px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Floor Price', val: Math.min(...allNFTs.map(nft => parseFloat(nft.price))).toFixed(2), unit: 'TON', color: 'text-emerald-500', icon: TrendingUp, desc: 'Lowest Entry' },
              { label: 'Highest Sale', val: Math.max(...allNFTs.map(nft => parseFloat(nft.price))).toFixed(2), unit: 'TON', color: 'text-amber-500', icon: Rocket, desc: 'Premium Value' },
              { label: 'Market Volume', val: allNFTs.reduce((sum, nft) => sum + parseFloat(nft.price), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: 'TON', color: 'text-purple-500', icon: Zap, desc: 'Total Liquidity' },
              { label: 'Active Auctions', val: allNFTs.filter(nft => nft.listingType === 'auction').length, unit: 'Assets', color: 'text-blue-500', icon: Bell, desc: 'Live Bidding' },
            ].map((card, i) => (
              <Card key={i} className="bg-card border border-border/60 shadow-none overflow-hidden transition-all hover:border-primary/40">
                <CardContent className="p-4">
                  <p className="market-label mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="market-big-value">{card.val}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{card.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${card.color} mt-2`}>
                    <card.icon className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{card.desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. LIVE BIDDING RELAY - ENHANCED GLASS */}
        <section className="mb-4">
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                <h3 className="section-title !text-xs !tracking-widest capitalize">Live Auction Relay</h3>
              </div>
              <Button 
                variant="link" 
                onClick={() => navigate('/auctions')}
                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:no-underline p-0 h-auto"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            
            <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2" >
              {topBiddedNfts.map((nft) => (
                <div key={nft.id} onClick={() => navigate(`/nft/${nft.id}`)} className="flex-shrink-0 w-full lg:w-[calc(50%-8px)] snap-center cursor-pointer group" >
                  <div className="relative aspect-[21/9] bg-muted/30 border border-border/10 rounded-2xl overflow-hidden shadow-2xl">
                    <img src={nft.imageUrl || getPlaceholderImage(`nft-${nft.id}`, 800, 400)} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" alt={nft.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h4 className="nft-title !text-lg text-white mb-0.5">{nft.title}</h4>
                        <p className="micro-label !opacity-100 text-white/50">Current Bid: <span className="text-white font-bold">{nft.price} TON</span></p>
                      </div>
                      <Button size="sm" className="btn-primary bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"> 
                        BID NOW 
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. REFINED CONTROLS - Clean Tab Filters */}
        <div className="sticky top-0 lg:top-[var(--header-height,64px)] z-[37] bg-background/80 backdrop-blur-md py-4 w-full px-4 mb-6 border-b border-border/10">
          <div className="max-w-[1600px] mx-auto overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap overflow-x-auto no-scrollbar gap-2 justify-start scroll-smooth -mx-4 px-4">
                {TABS.map(tab => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab} 
                    className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap bg-white/5 hover:bg-white/10 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(37,99,235,0.2)] hover:text-foreground border-none shrink-0 cursor-pointer h-auto"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-4">
          {activeTab === 'Genesis' && (
            <div className="mb-4 p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white border-none font-black">ULTRA RARE</Badge>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Protocol Level: 01</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">The Genesis Forge is Active</h3>
                <p className="text-muted-foreground text-sm max-w-lg">Enter the dedicated Genesis portal for a hardware-grade experience, deep lore, and high-fidelity artifact showcase.</p>
              </div>
              <Button 
                onClick={() => navigate('/genesis-forge')}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-14 group shadow-xl shadow-blue-500/20"
              >
                Go to Forge Fullscreen <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
          {/* 5. MARKET SECTIONS - BENTO STYLE */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  <h2 className="section-title capitalize">Trending Track NFTs</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/trending-nfts')} className="micro-label !opacity-100 hover:text-primary transition-colors flex items-center gap-1">
                  VIEW MORE <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={`trending-loading-${i}`} className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  allNFTs.slice(0, 8).map((nft) => (
                    <div key={nft.id} className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start">
                      <NFTCard nft={nft} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <h2 className="section-title capitalize">Fresh Protocol Drops</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/trending-nfts')} className="micro-label !opacity-100 hover:text-emerald-500 transition-colors flex items-center gap-1">
                  VIEW MORE <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={`new-loading-${i}`} className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  [...allNFTs].sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 8).map((nft) => (
                    <div key={nft.id} className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start">
                      <NFTCard nft={nft} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                  <h2 className="section-title capitalize">Featured Artists</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/discover?tab=Artists')} className="micro-label !opacity-100 hover:text-indigo-500 transition-colors flex items-center gap-1">
                  VIEW MORE <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex overflow-x-auto no-scrollbar snap-x gap-4 pb-2">
                {featuredArtists.map((artist) => (
                  <div key={artist.uid} className="flex-shrink-0 w-[140px] sm:w-[170px] snap-start">
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            </section>

            {/* Network Top Earners Leaderboard */}
            <section className="w-full my-8">
              <Leaderboard artists={MOCK_ARTISTS} limit={5} title="Market Top Earners" />
            </section>

            {/* 6. MAIN MARKET GRID */}
            <section className="mb-4">
              {activeTab === 'My NFTs' && (
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                      <Box className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="page-title !text-xl text-white">Your Inventory</h3>
                      <p className="micro-label !opacity-100 text-primary mt-1">Manage and list your artifacts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="market-label mb-1">Total</p>
                      <p className="market-big-value !text-white">{myNfts.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="market-label mb-1">Listed</p>
                      <p className="market-big-value !text-emerald-400">{myNfts.filter(n => n.listingType).length}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full group-hover:h-8 transition-all"></div>
                  <h2 className="page-title !text-xl">Market Explorer</h2>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full">
                  {filteredNfts.length} Items
                </div>
              </div>
              
              {filteredNfts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredNfts.map((nft, idx) => (
                      <motion.div 
                        key={nft.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx % 10) * 0.05 }}
                      >
                        <NFTCard nft={nft} />
                      </motion.div>
                    ))}
                  </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center rounded-3xl text-center bg-muted/20 border border-border/10">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <Satellite className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="page-title !text-xl">No Results Detected</h3>
                  <p className="micro-label mt-4 max-w-xs mx-auto">Try adjusting your scanner or search criteria.</p>
                  <Button variant="outline" onClick={() => { setActiveTab('Trending'); setSearchQuery(''); }} className="mt-8 rounded-xl btn-primary" > Reset Market Scanner </Button>
                </div>
              )}
            </section>

            {/* 7. ALPHA DROP / SUBSCRIPTION */}
            <section className="pb-12">
              <div className="bg-primary/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group border border-primary/10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 group-hover:opacity-[0.1] transition-opacity">
                  <Zap className="h-48 w-48 text-primary" />
                </div>
                <div className="max-w-2xl relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="micro-label !opacity-100 !text-primary">Ecosystem Alpha</span>
                  </div>
                  <h4 className="page-title !text-3xl md:text-4xl mb-4">Join the Neural Relay</h4>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium opacity-80 leading-relaxed mb-8">
                    Stay ahead of the curve. Get notified about exclusive protocol drops, whitelist opportunities, and ecosystem milestones.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="Enter your neural ID" 
                      className="flex-1 bg-background/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                    />
                    <Button className="btn-primary h-auto py-4 px-8 rounded-2xl shadow-xl shadow-primary/20">
                      SYNC NOW
                    </Button>
                  </div>
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
